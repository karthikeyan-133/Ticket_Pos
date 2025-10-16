import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import Supabase database connection
import supabase from './config/supabase.js';

import ticketRoutes from './routes/tickets.js';
import executiveRoutes from './routes/executives.js';
import salesRoutes from './routes/sales.js';

// Import WhatsApp utilities with error handling
let whatsappUtils;
try {
  whatsappUtils = await import('./utils/sendMessage.js');
  console.log('WhatsApp utilities loaded successfully');
} catch (error) {
  console.warn('WhatsApp utilities not available:', error.message);
  whatsappUtils = null;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://127.0.0.1:8080', 
    'http://127.0.0.1:8081',
    'https://ticket-pos.vercel.app'
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase payload limit

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Middleware to inject Supabase client into requests
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Test database connection
app.get('/api/health', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ 
      message: 'Server is running but Supabase is not configured',
      error: 'Supabase client not initialized. Please check your configuration.'
    });
  }

  try {
    // Test Supabase connection by querying a simple record
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ 
      message: 'Server is running!',
      database: 'Connected to Supabase',
      testResult: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server is running but database connection failed',
      error: error.message 
    });
  }
});

// WhatsApp notification endpoint
app.post('/api/notify-ticket', async (req, res) => {
  try {
    const { success, data, apiKey } = req.body;
    
    // Validate API key
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    // Validate data
    if (!success || !Array.isArray(data)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data format' 
      });
    }
    
    const results = [];
    
    // Process each ticket
    for (const ticket of data) {
      // Only process closed tickets
      if (ticket.status === 'closed') {
        console.log(`Processing closed ticket: ${ticket.ticketNumber || 'N/A'}`);
        
        // Handle empty ticket numbers
        const displayTicketNumber = ticket.ticketNumber || 'N/A';
        
        // Create thank-you message for client
        const thankYouMessage = `Hello ${ticket.contactPerson}, Your support ticket ${displayTicketNumber} has been resolved. Resolution Details: ${ticket.resolution || 'No resolution details provided.'} Thank you for your patience! Techzon Support Team`;
        
        // Create comprehensive ticket details message for support group with the format you specified
        const ticketDetailsMessage = `
*Ticket Resolved Notification*
============================
Company name  : ${ticket.companyName || 'N/A'}
Serial No: ${ticket.serialNumber || 'N/A'}
Version : ${ticket.version || 'N/A'}
Expiry: ${ticket.expiryDate ? new Date(ticket.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
Contact Person: ${ticket.contactPerson || 'N/A'}
Contact Number: ${ticket.mobileNumber || 'N/A'}
Support: ${ticket.issueRelated || 'N/A'}
Start: ${ticket.startedAt ? new Date(ticket.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Completed: ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Resolution: ${ticket.resolution || 'No resolution details provided.'}
Assigned Executive: ${ticket.assignedExecutive || 'N/A'}
Priority: ${ticket.priority || 'N/A'}
User Type: ${ticket.userType || 'N/A'}
Ticket Number: ${displayTicketNumber}
Email: ${ticket.email || 'N/A'}
Remarks: ${ticket.remarks || 'N/A'}
Completed At: ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleString('en-GB') : 'N/A'}
          `.trim();
        
        // Send thank-you message to client
        let clientResult;
        if (whatsappUtils) {
          try {
            clientResult = await whatsappUtils.sendToNumber(ticket.mobileNumber, thankYouMessage);
          } catch (error) {
            console.error('Error sending client message:', error);
            clientResult = { success: false, error: error.message };
          }
        } else {
          clientResult = { success: false, error: 'WhatsApp utilities not available' };
        }
        
        // Send ticket details to support group if groupName is provided
        let groupResult = { success: true, message: 'No group specified' };
        if (ticket.groupName && whatsappUtils) {
          try {
            // Use the specific group ID if provided, otherwise use the group name
            const groupIdentifier = ticket.groupId || ticket.groupName;
            groupResult = await whatsappUtils.sendToGroup(groupIdentifier, ticketDetailsMessage);
          } catch (error) {
            console.error('Error sending group message:', error);
            groupResult = { success: false, error: error.message };
          }
        } else if (ticket.groupName) {
          groupResult = { success: false, error: 'WhatsApp utilities not available' };
        }
        
        results.push({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          clientMessage: clientResult,
          groupMessage: groupResult
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Notifications processed',
      results 
    });
  } catch (error) {
    console.error('Error in notify-ticket endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/executives', executiveRoutes);
app.use('/api/sales', salesRoutes);

// React SPA fallback (last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (supabase) {
    console.log('Using Supabase database');
  } else {
    console.log('Supabase not configured - using mock data');
  }
  console.log('WhatsApp integration is available at /api/notify-ticket');
  
  // Log WhatsApp status
  if (whatsappUtils) {
    console.log('WhatsApp client status: Loading...');
  } else {
    console.log('WhatsApp client: Not available');
  }
});