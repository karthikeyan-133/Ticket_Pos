import express from 'express';
const router = express.Router();

// Mock data for executives
let executives = [
  { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Support' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Sales' }
];

// Get all executives
router.get('/', async (req, res) => {
  try {
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').select('*');
      if (error) throw error;
      return res.json(data);
    }
    
    // Otherwise, return mock data
    res.json(executives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get executive by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').select('*').eq('id', id).single();
      if (error) throw error;
      return res.json(data);
    }
    
    // Otherwise, return mock data
    const executive = executives.find(e => e.id == id);
    if (!executive) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    res.json(executive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new executive
router.post('/', async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').insert([{ name, email, department }]).select();
      if (error) throw error;
      return res.status(201).json(data[0]);
    }
    
    // Otherwise, use mock data
    const newExecutive = {
      id: executives.length + 1,
      name,
      email,
      department
    };
    executives.push(newExecutive);
    res.status(201).json(newExecutive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update executive
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').update({ name, email, department }).eq('id', id).select();
      if (error) throw error;
      return res.json(data[0]);
    }
    
    // Otherwise, use mock data
    const executiveIndex = executives.findIndex(e => e.id == id);
    if (executiveIndex === -1) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    
    executives[executiveIndex] = { ...executives[executiveIndex], name, email, department };
    res.json(executives[executiveIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete executive
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { error } = await req.supabase.from('executives').delete().eq('id', id);
      if (error) throw error;
      return res.status(204).send();
    }
    
    // Otherwise, use mock data
    const executiveIndex = executives.findIndex(e => e.id == id);
    if (executiveIndex === -1) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    
    executives.splice(executiveIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;