import express from 'express';
const router = express.Router();

// Mock data for tickets
let tickets = [
  { id: 1, title: 'Sample Ticket 1', description: 'This is a sample ticket', status: 'open' },
  { id: 2, title: 'Sample Ticket 2', description: 'This is another sample ticket', status: 'closed' }
];

// Get all tickets
router.get('/', async (req, res) => {
  try {
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('tickets').select('*');
      if (error) throw error;
      return res.json(data);
    }
    
    // Otherwise, return mock data
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('tickets').select('*').eq('id', id).single();
      if (error) throw error;
      return res.json(data);
    }
    
    // Otherwise, return mock data
    const ticket = tickets.find(t => t.id == id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
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
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('tickets').update({ title, description, status }).eq('id', id).select();
      if (error) throw error;
      return res.json(data[0]);
    }
    
    // Otherwise, use mock data
    const ticketIndex = tickets.findIndex(t => t.id == id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    tickets[ticketIndex] = { ...tickets[ticketIndex], title, description, status };
    res.json(tickets[ticketIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { error } = await req.supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      return res.status(204).send();
    }
    
    // Otherwise, use mock data
    const ticketIndex = tickets.findIndex(t => t.id == id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    tickets.splice(ticketIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;