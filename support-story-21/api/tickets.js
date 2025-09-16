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
    // Get all tickets
    if (method === 'GET' && path === '/') {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase.from('tickets').select('*');
        if (error) throw error;
        return res.json(data);
      }
      
      // Otherwise, return mock data
      return res.json([
        { id: 1, title: 'Sample Ticket 1', status: 'open' },
        { id: 2, title: 'Sample Ticket 2', status: 'closed' }
      ]);
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
        // Extract all the fields that match the database schema
        const { 
          ticket_number,
          serial_number,
          company_name,
          contact_person,
          mobile_number,
          email,
          issue_related,
          priority,
          assigned_executive,
          status,
          user_type,
          expiry_date,
          resolution,
          remarks
        } = req.body || {};
        
        // Generate ticket number if not provided
        const ticketNumber = ticket_number || generateTicketNumber();
        
        const { data, error } = await req.supabase
          .from('tickets')
          .insert([{
            ticket_number: ticketNumber,
            serial_number,
            company_name,
            contact_person,
            mobile_number,
            email,
            issue_related,
            priority,
            assigned_executive,
            status: status || 'open',
            user_type,
            expiry_date,
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
        ticket_number: req.body.ticket_number || generateTicketNumber(),
        serial_number: req.body.serial_number || '',
        company_name: req.body.company_name || '',
        contact_person: req.body.contact_person || '',
        mobile_number: req.body.mobile_number || '',
        email: req.body.email || '',
        issue_related: req.body.issue_related || 'data',
        priority: req.body.priority || 'medium',
        assigned_executive: req.body.assigned_executive || '',
        status: req.body.status || 'open',
        user_type: req.body.user_type || 'single user',
        expiry_date: req.body.expiry_date || new Date().toISOString(),
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
        // Extract all the fields that match the database schema
        const { 
          ticket_number,
          serial_number,
          company_name,
          contact_person,
          mobile_number,
          email,
          issue_related,
          priority,
          assigned_executive,
          status,
          user_type,
          expiry_date,
          resolution,
          remarks
        } = req.body || {};
        
        const updateData = {
          ticket_number,
          serial_number,
          company_name,
          contact_person,
          mobile_number,
          email,
          issue_related,
          priority,
          assigned_executive,
          status,
          user_type,
          expiry_date,
          resolution,
          remarks,
          updated_at: new Date().toISOString()
        };
        
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