// WhatsApp notification endpoint for Vercel deployment
// This endpoint fetches real ticket data from the database and sends notifications

import { createClient } from '@supabase/supabase-js';

// WhatsApp utility functions (simplified for Vercel - no persistent session)
const sendToNumber = async (number, message) => {
  try {
    // Format the number for WhatsApp (remove any non-digit characters and add country code if needed)
    let formattedNumber = number.replace(/\D/g, '');
    
    // Add country code if not present (assuming UAE numbers)
    if (formattedNumber.startsWith('05') && formattedNumber.length === 10) {
      formattedNumber = `971${formattedNumber.substring(1)}`;
    } else if (formattedNumber.length === 9 && formattedNumber.startsWith('5')) {
      formattedNumber = `971${formattedNumber}`;
    } else if (formattedNumber.length === 10) {
      formattedNumber = `971${formattedNumber}`;
    }
    
    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    
    console.log(`Generated WhatsApp URL for ${formattedNumber}: ${url}`);
    
    return { 
      success: true, 
      url: url,
      message: message
    };
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error);
    return { success: false, error: error.message };
  }
};

// Function to send message to a group by ID
const sendToGroup = async (groupIdentifier, message) => {
  try {
    // For Vercel deployment, we can only generate URLs for group messages
    // In a production environment, you would need to use a WhatsApp Business API
    
    // Generate a message that can be manually sent to the group
    const groupMessage = `*Ticket Resolved Notification*\n============================\n${message}`;
    
    // Return success with message content for manual sending
    return { 
      success: true, 
      message: groupMessage,
      note: 'For Vercel deployment, please manually send this message to your WhatsApp group'
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
            
            // Handle empty ticket numbers
            const displayTicketNumber = ticket.ticket_number || ticket.ticketNumber || 'N/A';
            
            // Create thank-you message for client
            const thankYouMessage = `Hello ${ticket.contact_person || ticket.contactPerson}, Your support ticket ${displayTicketNumber} has been resolved. Resolution Details: ${ticket.resolution || 'No resolution details provided.'} Thank you for your patience! Techzon Support Team`;
            
            // Create comprehensive ticket details message for support group
            const ticketDetailsMessage = `
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
Ticket Number: ${displayTicketNumber}
Email: ${ticket.email || 'N/A'}
Remarks: ${ticket.remarks || 'N/A'}
Completed At: ${ticket.closed_at || ticket.closedAt ? new Date(ticket.closed_at || ticket.closedAt).toLocaleString('en-GB') : 'N/A'}
            `.trim();
            
            // Send thank-you message to client
            let clientResult;
            try {
              clientResult = await sendToNumber(ticket.mobile_number || ticket.mobileNumber, thankYouMessage);
            } catch (error) {
              console.error('Error sending client message:', error);
              clientResult = { success: false, error: error.message };
            }
            
            // Send ticket details to support group if groupName is provided
            let groupResult = { success: true, message: 'No group specified' };
            if (ticket.group_name || ticket.groupName || ticket.group_id || ticket.groupId) {
              try {
                // Use the specific group ID if provided, otherwise use the group name
                const groupIdentifier = ticket.group_id || ticket.groupId || ticket.group_name || ticket.groupName;
                groupResult = await sendToGroup(groupIdentifier, ticketDetailsMessage);
              } catch (error) {
                console.error('Error sending group message:', error);
                groupResult = { success: false, error: error.message };
              }
            }
            
            results.push({
              ticketId: ticket.id || ticketItem.id,
              ticketNumber: displayTicketNumber,
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
        message: 'Notifications processed',
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