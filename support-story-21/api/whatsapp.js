// WhatsApp notification endpoint for Vercel deployment
// This endpoint fetches real ticket data from the database and sends notifications

import { createClient } from '@supabase/supabase-js';

// Function to format phone numbers for WhatsApp
const formatWhatsAppNumber = (number) => {
  // Remove any non-digit characters
  let cleanNumber = number.replace(/\D/g, '');
  
  // Add country code if not present (assuming UAE numbers)
  if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
    // UAE format: 05XXXXXXXX -> 9715XXXXXXXX
    cleanNumber = `971${cleanNumber.substring(1)}`;
  } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
    // UAE format: 5XXXXXXXX -> 9715XXXXXXXX
    cleanNumber = `971${cleanNumber}`;
  } else if (cleanNumber.length === 10) {
    // Other 10-digit formats: add 971 prefix
    cleanNumber = `971${cleanNumber}`;
  }
  
  return cleanNumber;
};

// Function to generate WhatsApp URL for client notifications
const generateClientWhatsAppUrl = (ticket) => {
  try {
    const phoneNumber = formatWhatsAppNumber(ticket.mobile_number || ticket.mobileNumber);
    const contactPerson = ticket.contact_person || ticket.contactPerson || 'Customer';
    const ticketNumber = ticket.ticket_number || ticket.ticketNumber || 'N/A';
    const resolution = ticket.resolution || 'No resolution details provided.';
    
    // Create thank-you message for client
    const message = `Hello ${contactPerson}, Your support ticket ${ticketNumber} has been resolved. Resolution Details: ${resolution} Thank you for your patience! Techzon Support Team`;
    
    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    return {
      success: true,
      url: url,
      message: message,
      phoneNumber: phoneNumber
    };
  } catch (error) {
    console.error('Error generating client WhatsApp URL:', error);
    return { success: false, error: error.message };
  }
};

// Function to generate group notification message
const generateGroupNotificationMessage = (ticket) => {
  try {
    // Create comprehensive ticket details message for support group
    const message = `
*Ticket Resolved Notification*
============================
Company name  : ${ticket.company_name || ticket.companyName || 'N/A'}
Serial No: ${ticket.serial_number || ticket.serialNumber || 'N/A'}
Version : ${ticket.version || 'N/A'}
Expiry: ${ticket.expiry_date || ticket.expiryDate ? new Date(ticket.expiry_date || ticket.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
Contact Person: ${ticket.contact_person || ticket.contactPerson || 'N/A'}
Contact Number: ${ticket.mobile_number || ticket.mobileNumber || 'N/A'}
Support: ${ticket.issue_related || ticket.issueRelated || 'N/A'}
Start: ${ticket.started_at || ticket.startedAt ? new Date(ticket.started_at || ticket.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Completed: ${ticket.closed_at || ticket.closedAt ? new Date(ticket.closed_at || ticket.closedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Resolution: ${ticket.resolution || 'No resolution details provided.'}
Assigned Executive: ${ticket.assigned_executive || ticket.assignedExecutive || 'N/A'}
Priority: ${ticket.priority || 'N/A'}
User Type: ${ticket.user_type || ticket.userType || 'N/A'}
Ticket Number: ${ticket.ticket_number || ticket.ticketNumber || 'N/A'}
Email: ${ticket.email || 'N/A'}
Remarks: ${ticket.remarks || 'N/A'}
Completed At: ${ticket.closed_at || ticket.closedAt ? new Date(ticket.closed_at || ticket.closedAt).toLocaleString('en-GB') : 'N/A'}
    `.trim();
    
    return message;
  } catch (error) {
    console.error('Error generating group notification message:', error);
    return null;
  }
};

// Function to generate group WhatsApp URL
const generateGroupWhatsAppUrl = (groupIdentifier, message) => {
  try {
    // For Vercel deployment, we provide instructions for manual group messaging
    // In a production environment, you would need to use a WhatsApp Business API
    
    return {
      success: true,
      message: message,
      note: 'For Vercel deployment, please manually send this message to your WhatsApp group',
      instructions: 'Copy the message above and send it to your WhatsApp group named "' + groupIdentifier + '"'
    };
  } catch (error) {
    console.error('Error preparing group message:', error);
    return { success: false, error: error.message };
  }
};

// WhatsApp notification endpoint
const whatsappRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  
  try {
    // Notify ticket endpoint
    if (method === 'POST' && path === '/') {
      // Validate API key
      const apiKey = req.headers['x-api-key'] || req.body.apiKey;
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid API key' 
        });
      }
      
      // Validate request body
      const { success, data } = req.body;
      if (!success || !Array.isArray(data)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid data format' 
        });
      }
      
      // Initialize Supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_KEY
      );
      
      const results = [];
      
      // Process each ticket
      for (const ticketItem of data) {
        try {
          let ticket;
          
          // If ticketItem has an ID, fetch the full ticket from database
          if (ticketItem.id) {
            const { data: dbTicket, error } = await supabase
              .from('tickets')
              .select('*')
              .eq('id', ticketItem.id)
              .single();
              
            if (error) {
              console.error('Error fetching ticket from database:', error);
              results.push({
                ticketId: ticketItem.id,
                error: 'Failed to fetch ticket from database'
              });
              continue;
            }
            
            ticket = dbTicket;
          } else {
            // Use the provided ticket data
            ticket = ticketItem;
          }
          
          // Only process closed tickets
          if (ticket.status === 'closed') {
            console.log(`Processing closed ticket: ${ticket.ticket_number || ticket.ticketNumber}`);
            
            // Generate client WhatsApp URL
            let clientResult;
            try {
              clientResult = generateClientWhatsAppUrl(ticket);
            } catch (error) {
              console.error('Error generating client WhatsApp URL:', error);
              clientResult = { success: false, error: error.message };
            }
            
            // Generate group notification message and URL if groupName is provided
            let groupResult = { success: true, message: 'No group specified' };
            if (ticket.group_name || ticket.groupName || ticket.group_id || ticket.groupId) {
              try {
                // Use the specific group ID if provided, otherwise use the group name
                const groupIdentifier = ticket.group_id || ticket.groupId || ticket.group_name || ticket.groupName;
                const groupMessage = generateGroupNotificationMessage(ticket);
                
                if (groupMessage) {
                  groupResult = generateGroupWhatsAppUrl(groupIdentifier, groupMessage);
                } else {
                  groupResult = { success: false, error: 'Failed to generate group message' };
                }
              } catch (error) {
                console.error('Error generating group WhatsApp URL:', error);
                groupResult = { success: false, error: error.message };
              }
            }
            
            results.push({
              ticketId: ticket.id || ticketItem.id,
              ticketNumber: ticket.ticket_number || ticket.ticketNumber || 'N/A',
              clientMessage: clientResult,
              groupMessage: groupResult
            });
          }
        } catch (error) {
          console.error('Error processing ticket:', error);
          results.push({
            ticketId: ticketItem.id,
            error: error.message
          });
        }
      }
      
      return res.json({ 
        success: true, 
        message: 'WhatsApp URLs generated successfully',
        results 
      });
    }
    
    // If no route matched, return 404
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export default whatsappRoutes;