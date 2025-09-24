// Helper function to generate ticket number
const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `TICKET/${year}/${randomNumber}`;
};

// Helper function to validate Tally serial number (must be exactly 9 digits)
const validateSerialNumber = (serialNumber) => {
  if (!serialNumber) {
    throw new Error('Tally serial number is required');
  }
  
  // Remove any spaces or special characters
  const cleanSerialNumber = serialNumber.toString().replace(/\D/g, '');
  
  if (cleanSerialNumber.length !== 9) {
    throw new Error('Tally serial number must be exactly 9 digits');
  }
  
  if (!/^\d{9}$/.test(cleanSerialNumber)) {
    throw new Error('Tally serial number must contain only digits');
  }
  
  return cleanSerialNumber;
};

// Ticket routes handler that matches the actual database schema
const ticketRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  const pathParts = path.split('/').filter(Boolean);
  
  // Extract ticketId from path if present
  // Handle special case for /serial/:serialNumber route
  const isSerialRoute = pathParts[0] === 'serial' && pathParts[1];
  const isResolutionHistoryRoute = pathParts[0] === 'resolution-history' && pathParts[1];
  const ticketId = isSerialRoute || isResolutionHistoryRoute ? null : pathParts[0]; // Don't treat "serial" as an ID
  const serialNumber = isSerialRoute || isResolutionHistoryRoute ? pathParts[1] : null;

  try {
    // Get all tickets with filtering support
    if (method === 'GET' && path === '/') {
      // Extract query parameters
      const { search, status, priority, company, serialNumber: querySerialNumber } = req.query || {};
      
      // If we have a Supabase client, use it with filtering
      if (req.supabase) {
        // Fetch all tickets without the default 1000 record limit
        let query = req.supabase.from('tickets').select('*');
        
        // Apply filters
        if (querySerialNumber) {
          // Validate serial number format
          const validatedSerialNumber = validateSerialNumber(querySerialNumber);
          query = query.eq('serial_number', validatedSerialNumber);
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
      
      if (querySerialNumber) {
        // Validate serial number format
        const validatedSerialNumber = validateSerialNumber(querySerialNumber);
        filteredTickets = filteredTickets.filter(ticket => ticket.serial_number === validatedSerialNumber);
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
    
    // Get resolution history by serial number
    if (method === 'GET' && isResolutionHistoryRoute) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        try {
          // Validate serial number format
          const validatedSerialNumber = validateSerialNumber(serialNumber);
          
          // Get all tickets for this serial number, sorted by creation date
          const { data, error } = await req.supabase
            .from('tickets')
            .select('*')
            .eq('serial_number', validatedSerialNumber)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          return res.json(data);
        } catch (validationError) {
          return res.status(400).json({ error: validationError.message });
        }
      }
      
      // Otherwise, return mock data
      // Check if this is for the specific serial number 755538264
      if (serialNumber === '755538264') {
        const mockTickets = [
          { 
            id: 101, 
            ticket_number: 'TICKET/2023/1001',
            serial_number: '755538264',
            company_name: 'ABC Corporation',
            contact_person: 'Michael Johnson',
            email: 'michael@abccorp.com',
            mobile_number: '9876543210',
            user_type: 'multiuser',
            expiry_date: '2024-12-31',
            assigned_executive: 'Sarah Wilson',
            status: 'closed',
            priority: 'high',
            issue_related: 'data',
            resolution: 'Fixed data corruption issue in Tally software',
            created_at: '2023-05-15T10:30:00Z',
            closed_at: '2023-05-15T14:45:00Z'
          },
          { 
            id: 102, 
            ticket_number: 'TICKET/2023/1002',
            serial_number: '755538264',
            company_name: 'ABC Corporation',
            contact_person: 'Michael Johnson',
            email: 'michael@abccorp.com',
            mobile_number: '9876543210',
            user_type: 'multiuser',
            expiry_date: '2024-12-31',
            assigned_executive: 'David Brown',
            status: 'closed',
            priority: 'medium',
            issue_related: 'network',
            resolution: 'Resolved network connectivity issues with Tally server',
            created_at: '2023-08-22T09:15:00Z',
            closed_at: '2023-08-22T11:30:00Z'
          }
        ];
        return res.json(mockTickets);
      }
      
      const mockTickets = [
        { id: 1, ticket_number: 'TICKET/2023/0001', status: 'closed', resolution: 'Fixed data corruption issue', created_at: '2023-01-15T10:30:00Z', serial_number: serialNumber },
        { id: 2, ticket_number: 'TICKET/2023/0002', status: 'closed', resolution: 'Resolved network connectivity', created_at: '2023-01-16T14:45:00Z', serial_number: serialNumber }
      ];
      
      return res.json(mockTickets);
    }
    
    // Get ticket by serial number (returns the latest ticket for customer details)
    if (method === 'GET' && isSerialRoute) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        try {
          // Validate serial number format
          const validatedSerialNumber = validateSerialNumber(serialNumber);
          
          // Get the latest ticket for this serial number to fetch customer details
          const { data, error } = await req.supabase
            .from('tickets')
            .select('*')
            .eq('serial_number', validatedSerialNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              // No rows returned - return empty object to indicate new customer
              return res.json({});
            }
            throw error;
          }
          return res.json(data);
        } catch (validationError) {
          return res.status(400).json({ error: validationError.message });
        }
      }
      
      // Otherwise, return mock data
      // Check if this is for the specific serial number 755538264
      if (serialNumber === '755538264') {
        const mockTicket = { 
          id: 102, 
          ticket_number: 'TICKET/2023/1002',
          serial_number: '755538264',
          company_name: 'ABC Corporation',
          contact_person: 'Michael Johnson',
          email: 'michael@abccorp.com',
          mobile_number: '9876543210',
          user_type: 'multiuser',
          expiry_date: '2024-12-31',
          assigned_executive: 'David Brown',
          status: 'closed',
          priority: 'medium',
          issue_related: 'network',
          resolution: 'Resolved network connectivity issues with Tally server',
          created_at: '2023-08-22T09:15:00Z',
          closed_at: '2023-08-22T11:30:00Z'
        };
        return res.json(mockTicket);
      }
      
      const mockTicket = { 
        id: 1, 
        ticket_number: 'TICKET/2023/0001',
        serial_number: serialNumber,
        company_name: 'Tech Solutions Inc.',
        contact_person: 'John Doe',
        email: 'john@example.com',
        status: 'open',
        priority: 'high',
        issue_related: 'data',
        created_at: '2023-01-15T10:30:00Z'
      };
      
      return res.json(mockTicket);
    }
    
    // Create a new ticket
    if (method === 'POST' && path === '/') {
      // If we have a Supabase client, use it
      if (req.supabase) {
        try {
          const ticketData = req.body;
          
          // Validate required fields
          if (!ticketData.serial_number && !ticketData.serialNumber) {
            return res.status(400).json({ error: 'Serial number is required' });
          }
          
          // Validate serial number format
          const validatedSerialNumber = validateSerialNumber(ticketData.serial_number || ticketData.serialNumber);
          
          // Use provided ticket number or generate one if not provided
          const ticketNumber = ticketData.ticket_number || ticketData.ticketNumber || generateTicketNumber();
          
          // Insert the new ticket
          const { data, error } = await req.supabase
            .from('tickets')
            .insert([
              {
                ticket_number: ticketNumber,
                serial_number: validatedSerialNumber,
                company_name: ticketData.company_name || ticketData.companyName || '',
                contact_person: ticketData.contact_person || ticketData.contactPerson || '',
                mobile_number: ticketData.mobile_number || ticketData.mobileNumber || '',
                email: ticketData.email || '',
                issue_related: ticketData.issue_related || ticketData.issueRelated || 'data',
                priority: ticketData.priority || 'medium',
                assigned_executive: ticketData.assigned_executive || ticketData.assignedExecutive || '',
                status: ticketData.status || 'open',
                user_type: ticketData.user_type || ticketData.userType || 'single user',
                expiry_date: ticketData.expiry_date || ticketData.expiryDate || null,
                resolution: ticketData.resolution || '',
                remarks: ticketData.remarks || ''
              }
            ])
            .select()
            .single();
            
          if (error) throw error;
          return res.status(201).json(data);
        } catch (validationError) {
          return res.status(400).json({ error: validationError.message });
        }
      }
      
      // Otherwise, return mock data
      const mockTicket = { 
        id: 3, 
        ticket_number: req.body.ticket_number || req.body.ticketNumber || generateTicketNumber(),
        serial_number: req.body.serial_number || req.body.serialNumber,
        company_name: req.body.company_name || req.body.companyName || '',
        contact_person: req.body.contact_person || req.body.contactPerson || '',
        email: req.body.email || '',
        status: req.body.status || 'open',
        priority: req.body.priority || 'medium',
        issue_related: req.body.issue_related || req.body.issueRelated || 'data',
        created_at: new Date().toISOString()
      };
      
      return res.status(201).json(mockTicket);
    }
    
    // Get ticket by ID
    if (method === 'GET' && ticketId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned
            return res.status(404).json({ error: 'Ticket not found' });
          }
          throw error;
        }
        return res.json(data);
      }
      
      // Otherwise, return mock data
      const mockTicket = { 
        id: ticketId, 
        ticket_number: 'TICKET/2023/0001',
        serial_number: '123456789',
        company_name: 'Tech Solutions Inc.',
        contact_person: 'John Doe',
        email: 'john@example.com',
        status: 'open',
        priority: 'high',
        issue_related: 'data',
        created_at: '2023-01-15T10:30:00Z'
      };
      
      return res.json(mockTicket);
    }
    
    // Update ticket by ID
    if (method === 'PUT' && ticketId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        try {
          const ticketData = req.body;
          
          // Validate serial number if provided
          let validatedSerialNumber = null;
          if (ticketData.serial_number || ticketData.serialNumber) {
            validatedSerialNumber = validateSerialNumber(ticketData.serial_number || ticketData.serialNumber);
          }
          
          // Update the ticket
          const updateData = {};
          if (ticketData.ticket_number || ticketData.ticketNumber) {
            updateData.ticket_number = ticketData.ticket_number || ticketData.ticketNumber;
          }
          if (validatedSerialNumber) {
            updateData.serial_number = validatedSerialNumber;
          }
          if (ticketData.company_name !== undefined || ticketData.companyName !== undefined) {
            updateData.company_name = ticketData.company_name || ticketData.companyName || '';
          }
          if (ticketData.contact_person !== undefined || ticketData.contactPerson !== undefined) {
            updateData.contact_person = ticketData.contact_person || ticketData.contactPerson || '';
          }
          if (ticketData.mobile_number !== undefined || ticketData.mobileNumber !== undefined) {
            updateData.mobile_number = ticketData.mobile_number || ticketData.mobileNumber || '';
          }
          if (ticketData.email !== undefined) {
            updateData.email = ticketData.email || '';
          }
          if (ticketData.issue_related !== undefined || ticketData.issueRelated !== undefined) {
            updateData.issue_related = ticketData.issue_related || ticketData.issueRelated || 'data';
          }
          if (ticketData.priority !== undefined) {
            updateData.priority = ticketData.priority || 'medium';
          }
          if (ticketData.assigned_executive !== undefined || ticketData.assignedExecutive !== undefined) {
            updateData.assigned_executive = ticketData.assigned_executive || ticketData.assignedExecutive || '';
          }
          if (ticketData.status !== undefined) {
            updateData.status = ticketData.status || 'open';
            // If status is changing to closed, set closed_at
            if (ticketData.status === 'closed') {
              updateData.closed_at = new Date().toISOString();
            }
          }
          if (ticketData.user_type !== undefined || ticketData.userType !== undefined) {
            updateData.user_type = ticketData.user_type || ticketData.userType || 'single user';
          }
          if (ticketData.expiry_date !== undefined || ticketData.expiryDate !== undefined) {
            updateData.expiry_date = ticketData.expiry_date || ticketData.expiryDate || null;
          }
          if (ticketData.resolution !== undefined) {
            updateData.resolution = ticketData.resolution || '';
          }
          if (ticketData.remarks !== undefined) {
            updateData.remarks = ticketData.remarks || '';
          }
          updateData.updated_at = new Date().toISOString();
          
          const { data, error } = await req.supabase
            .from('tickets')
            .update(updateData)
            .eq('id', ticketId)
            .select()
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              // No rows returned
              return res.status(404).json({ error: 'Ticket not found' });
            }
            throw error;
          }
          
          // If ticket was closed, send notifications
          if (ticketData.status === 'closed') {
            try {
              await sendTicketClosedNotifications(data);
            } catch (notificationError) {
              console.error('Error sending ticket closed notifications:', notificationError);
              // Don't fail the update if notifications fail
            }
          }
          
          return res.json(data);
        } catch (validationError) {
          return res.status(400).json({ error: validationError.message });
        }
      }
      
      // Otherwise, return mock data
      const mockTicket = { 
        id: ticketId, 
        ticket_number: req.body.ticket_number || req.body.ticketNumber || 'TICKET/2023/0001',
        serial_number: req.body.serial_number || req.body.serialNumber || '123456789',
        company_name: req.body.company_name || req.body.companyName || 'Tech Solutions Inc.',
        contact_person: req.body.contact_person || req.body.contactPerson || 'John Doe',
        email: req.body.email || 'john@example.com',
        status: req.body.status || 'open',
        priority: req.body.priority || 'high',
        issue_related: req.body.issue_related || req.body.issueRelated || 'data',
        updated_at: new Date().toISOString()
      };
      
      return res.json(mockTicket);
    }
    
    // Delete ticket by ID
    if (method === 'DELETE' && ticketId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { error } = await req.supabase
          .from('tickets')
          .delete()
          .eq('id', ticketId);
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned
            return res.status(404).json({ error: 'Ticket not found' });
          }
          throw error;
        }
        return res.status(204).send();
      }
      
      // Otherwise, return success
      return res.status(204).send();
    }
    
    // If no route matched, return 404
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Ticket API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export default ticketRoutes;