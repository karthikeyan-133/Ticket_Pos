// Mock data for tickets
let tickets = [
  { id: 1, title: 'Sample Ticket 1', description: 'This is a sample ticket', status: 'open' },
  { id: 2, title: 'Sample Ticket 2', description: 'This is another sample ticket', status: 'closed' }
];

// Ticket routes handler
const ticketRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  const pathParts = path.split('/').filter(Boolean);
  const ticketId = pathParts[0]; // Extract ID from path if present

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
      return res.json(tickets);
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
      const ticket = tickets.find(t => t.id == ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json(ticket);
    }
    
    // Create new ticket
    if (method === 'POST' && path === '/') {
      const { title, description } = req.body || {};
      
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase.from('tickets').insert([{ title, description, status: 'open' }]).select();
        if (error) throw error;
        return res.status(201).json(data[0]);
      }
      
      // Otherwise, use mock data
      const newTicket = {
        id: tickets.length + 1,
        title,
        description,
        status: 'open'
      };
      tickets.push(newTicket);
      return res.status(201).json(newTicket);
    }
    
    // Update ticket
    if (method === 'PUT' && ticketId) {
      const { title, description, status } = req.body || {};
      
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase.from('tickets').update({ title, description, status }).eq('id', ticketId).select();
        if (error) throw error;
        return res.json(data[0]);
      }
      
      // Otherwise, use mock data
      const ticketIndex = tickets.findIndex(t => t.id == ticketId);
      if (ticketIndex === -1) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      tickets[ticketIndex] = { ...tickets[ticketIndex], title, description, status };
      return res.json(tickets[ticketIndex]);
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
      const ticketIndex = tickets.findIndex(t => t.id == ticketId);
      if (ticketIndex === -1) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      tickets.splice(ticketIndex, 1);
      return res.status(204).send();
    }
    
    // 404 for unmatched routes
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default ticketRoutes;