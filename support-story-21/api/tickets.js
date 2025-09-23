// Helper function to generate ticket number
const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `TICKET/${year}/${randomNumber}`;
};

// Ticket routes handler that matches the actual database schema
const ticketRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  const pathParts = path.split('/').filter(Boolean);
  
  // Extract ticketId from path if present
  // Handle special case for /serial/:serialNumber route
  const isSerialRoute = pathParts[0] === 'serial' && pathParts[1];
  const ticketId = isSerialRoute ? null : pathParts[0]; // Don't treat "serial" as an ID
  const serialNumber = isSerialRoute ? pathParts[1] : null;

  try {
    // Get all tickets with filtering support
    if (method === 'GET' && path === '/') {
      // Extract query parameters
      const { search, status, priority, company, serialNumber } = req.query || {};
      
      // If we have a Supabase client, use it with filtering
      if (req.supabase) {
        // Fetch all tickets without the default 1000 record limit
        let query = req.supabase.from('tickets').select('*');
        
        // Apply filters
        if (serialNumber) {
          query = query.eq('serial_number', serialNumber);
        }
        
        // Handle search parameter
        if (search) {
          const searchTerm = search.toLowerCase();
          // For numeric searches, we need to handle them differently
          if (/^\d+$/.test(search)) {
            // If search term is purely numeric, search by ID or exact ticket number
            query = query.or(
              `id.eq.${search},ticket_number.ilike.%${search}%,serial_number.ilike.%${search}%`
            );
          } else {
            // Standard text search
            query = query.or(
              `ticket_number.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
            );
          }
        }
        
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }
        
        if (priority && priority !== 'all') {
          query = query.eq('priority', priority);
        }
        
        if (company && company !== 'all') {
          query = query.eq('company_name', company);
        }
        
        // Sort by creation date (newest first)
        query = query.order('created_at', { ascending: false });
        
        // Remove the default limit of 1000 records by setting a very large limit
        // This ensures all tickets are displayed
        const { data, error } = await query.limit(100000); // Increased to 100,000 to ensure all tickets are shown
        if (error) throw error;
        return res.json(data);
      }
      
      // Otherwise, return mock data with filtering
      const mockTickets = [
        { 
          id: 1, 
          ticket_number: 'TICKET/2023/0001',
          serial_number: '123456789',
          company_name: 'Tech Solutions Inc.',
          contact_person: 'John Doe',
          email: 'john@example.com',
          status: 'open',
          priority: 'high',
          issue_related: 'data',
          created_at: '2023-01-15T10:30:00Z'
        },
        { 
          id: 2, 
          ticket_number: 'TICKET/2023/0002',
          serial_number: '987654321',
          company_name: 'Global Systems Ltd.',
          contact_person: 'Jane Smith',
          email: 'jane@example.com',
          status: 'closed',
          priority: 'medium',
          issue_related: 'network',
          created_at: '2023-01-16T14:45:00Z'
        }
      ];
      
      // Apply mock filtering
      let filteredTickets = [...mockTickets];
      
      if (serialNumber) {
        filteredTickets = filteredTickets.filter(ticket => ticket.serial_number === serialNumber);
      }
      
      if (search) {
        const searchTerm = search.toLowerCase();
        // Handle numeric search terms for mock data
        if (/^\d+$/.test(search)) {
          // For numeric searches, check ID, ticket number, and serial number
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.id.toString().includes(search) ||
            ticket.ticket_number.includes(search) ||
            ticket.serial_number.includes(search) ||
            ticket.company_name.toLowerCase().includes(searchTerm) ||
            ticket.contact_person.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm)
          );
        } else {
          // Standard text search for mock data
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.ticket_number.toLowerCase().includes(searchTerm) ||
            ticket.serial_number.toLowerCase().includes(searchTerm) ||
            ticket.company_name.toLowerCase().includes(searchTerm) ||
            ticket.contact_person.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm)
          );
        }
      }
      
      if (status && status !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
      }
      
      if (priority && priority !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
      }
      
      // Sort by creation date (newest first) for mock data
      filteredTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return res.json(filteredTickets);
    }
    
    // Get tickets by serial number
    if (method === 'GET' && isSerialRoute) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase
          .from('tickets')
          .select('*')
          .eq('serial_number', serialNumber);
        if (error) throw error;
        return res.json(data);
      }
      
      // Otherwise, return mock data
      const mockTickets = [
        { id: 1, title: 'Sample Ticket 1', status: 'open', serial_number: serialNumber },
        { id: 2, title: 'Sample Ticket 2', status: 'closed', serial_number: serialNumber }
      ];
      return res.json(mockTickets);
    }
    
    // Get ticket by ID
    if (method === 'GET' && ticketId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase.from('tickets').select('*').eq('id', ticketId).single();
        if (error) throw error;
        return res.json(data);
      }
      
      // Otherwise, return mock data
      const tickets = [
        { id: 1, title: 'Sample Ticket 1', status: 'open' },
        { id: 2, title: 'Sample Ticket 2', status: 'closed' }
      ];
      const ticket = tickets.find(t => t.id == ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json(ticket);
    }
    
    // Create new ticket
    if (method === 'POST' && path === '/') {
      // If we have a Supabase client, use it with the correct schema
      if (req.supabase) {
        // Extract all the fields from the request body (camelCase from frontend)
        const { 
          ticketNumber,
          serialNumber,
          companyName,
          contactPerson,
          mobileNumber,
          email,
          issueRelated,
          priority,
          assignedExecutive,
          status,
          userType,
          expiryDate,
          resolution,
          remarks
        } = req.body || {};
        
        // Generate ticket number if not provided
        const ticket_number = ticketNumber || generateTicketNumber();
        
        const { data, error } = await req.supabase
          .from('tickets')
          .insert([{
            ticket_number,
            serial_number: serialNumber,
            company_name: companyName,
            contact_person: contactPerson,
            mobile_number: mobileNumber,
            email,
            issue_related: issueRelated,
            priority,
            assigned_executive: assignedExecutive,
            status: status || 'open',
            user_type: userType,
            expiry_date: expiryDate,
            resolution: resolution || '',
            remarks: remarks || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
          
        if (error) throw error;
        return res.status(201).json(data[0]);
      }
      
      // Otherwise, use mock data
      const newTicket = {
        id: Math.floor(Math.random() * 1000),
        ticket_number: req.body.ticketNumber || generateTicketNumber(),
        serial_number: req.body.serialNumber || '',
        company_name: req.body.companyName || '',
        contact_person: req.body.contactPerson || '',
        mobile_number: req.body.mobileNumber || '',
        email: req.body.email || '',
        issue_related: req.body.issueRelated || 'data',
        priority: req.body.priority || 'medium',
        assigned_executive: req.body.assignedExecutive || '',
        status: req.body.status || 'open',
        user_type: req.body.userType || 'single user',
        expiry_date: req.body.expiryDate || new Date().toISOString(),
        resolution: req.body.resolution || '',
        remarks: req.body.remarks || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return res.status(201).json(newTicket);
    }
    
    // Update ticket
    if (method === 'PUT' && ticketId) {
      // If we have a Supabase client, use it with the correct schema
      if (req.supabase) {
        // Extract all the fields from the request body (camelCase from frontend)
        const { 
          ticketNumber,
          serialNumber,
          companyName,
          contactPerson,
          mobileNumber,
          email,
          issueRelated,
          priority,
          assignedExecutive,
          status,
          userType,
          expiryDate,
          resolution,
          remarks
        } = req.body || {};
        
        // Check if ticket is being closed
        let isClosing = false;
        if (status === 'closed') {
          // Get existing ticket to check if it was previously open
          try {
            const { data: existingData, error: existingError } = await req.supabase
              .from('tickets')
              .select('*')
              .eq('id', ticketId)
              .single();
            
            if (!existingError && existingData && existingData.status !== 'closed') {
              isClosing = true;
            }
          } catch (error) {
            console.log('Error checking existing ticket status:', error);
          }
        }
        
        const updateData = {
          ticket_number: ticketNumber,
          serial_number: serialNumber,
          company_name: companyName,
          contact_person: contactPerson,
          mobile_number: mobileNumber,
          email,
          issue_related: issueRelated,
          priority,
          assigned_executive: assignedExecutive,
          status,
          user_type: userType,
          expiry_date: expiryDate,
          resolution,
          remarks,
          updated_at: new Date().toISOString()
        };
        
        // Add closed_at timestamp if closing ticket
        if (isClosing) {
          updateData.closed_at = new Date().toISOString();
        }
        
        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        const { data, error } = await req.supabase
          .from('tickets')
          .update(updateData)
          .eq('id', ticketId)
          .select();
      
        if (error) throw error;
        
        // If ticket was closed, send notifications
        if (isClosing && data && data[0]) {
          console.log(`Ticket ${data[0].ticket_number} has been closed, sending notification...`);
          console.log('Ticket data for notification:', JSON.stringify(data[0], null, 2));
          
          try {
            // Import notification service with correct relative path for Vercel
            let sendTicketClosedNotifications;
            try {
              // Use the correct relative path for Vercel deployment
              const notificationService = await import('../server/services/notificationService.js');
              sendTicketClosedNotifications = notificationService.sendTicketClosedNotifications;
            } catch (importError) {
              console.error('Error importing notification service:', importError);
              console.error('Import error stack:', importError.stack);
              throw new Error('Failed to import notification service: ' + importError.message);
            }
            
            // Convert snake_case to camelCase for notification service
            const ticketData = {
              ...data[0],
              ticketNumber: data[0].ticket_number,
              serialNumber: data[0].serial_number,
              companyName: data[0].company_name,
              contactPerson: data[0].contact_person,
              mobileNumber: data[0].mobile_number,
              issueRelated: data[0].issue_related,
              assignedExecutive: data[0].assigned_executive,
              userType: data[0].user_type,
              expiryDate: data[0].expiry_date,
              resolution: data[0].resolution,
              createdAt: data[0].created_at,
              updatedAt: data[0].updated_at,
              closedAt: data[0].closed_at
            };
            
            console.log('Converted ticket data for notification service:', JSON.stringify(ticketData, null, 2));
            
            // Send notifications and log the result
            const notificationResult = await sendTicketClosedNotifications(ticketData);
            console.log(`Notification sent for ticket ${data[0].ticket_number}`, notificationResult);
            
            // Check if email was sent successfully
            if (notificationResult.email && !notificationResult.email.success) {
              console.error(`Failed to send email for ticket ${data[0].ticket_number}:`, notificationResult.email.error);
            } else if (notificationResult.email && notificationResult.email.success) {
              console.log(`Email successfully sent for ticket ${data[0].ticket_number}`);
            }
            
            // Log WhatsApp URL generation result
            if (notificationResult.whatsapp && !notificationResult.whatsapp.success) {
              console.error(`Failed to generate WhatsApp URL for ticket ${data[0].ticket_number}:`, notificationResult.whatsapp.error);
            } else if (notificationResult.whatsapp && notificationResult.whatsapp.success) {
              console.log(`WhatsApp URL successfully generated for ticket ${data[0].ticket_number}:`, notificationResult.whatsapp.url);
            }
          } catch (notificationError) {
            console.error(`Error sending notification for ticket ${data[0].ticket_number}:`, notificationError);
            console.error('Notification error stack:', notificationError.stack);
          }
        }
        
        return res.json(data[0]);
      }
      
      // Otherwise, use mock data
      return res.status(200).json({ 
        id: ticketId,
        ...req.body,
        updated_at: new Date().toISOString()
      });
    }
    
    // Delete ticket
    if (method === 'DELETE' && ticketId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { error } = await req.supabase.from('tickets').delete().eq('id', ticketId);
        if (error) throw error;
        return res.status(204).send();
      }
      
      // Otherwise, use mock data
      return res.status(204).send();
    }
    
    // 404 for unmatched routes
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Ticket API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export default ticketRoutes;