import express from 'express';
const router = express.Router();

// Mock data for executives with consistent field names
let executives = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    department: 'Support',
    is_active: true,
    mobile: '+1234567890'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    department: 'Sales',
    is_active: true,
    mobile: '+1234567891'
  }
];

// Helper function to convert camelCase to snake_case for consistency
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        newObj[newKey] = obj[key];
      }
    }
    return newObj;
  }
  
  return obj;
};

// Helper function to convert snake_case to camelCase for consistency
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        newObj[newKey] = obj[key];
      }
    }
    return newObj;
  }
  
  return obj;
};

// Get all executives
router.get('/', async (req, res) => {
  try {
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').select('*');
      if (error) throw error;
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data);
      return res.json(formattedData);
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
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data);
      return res.json(formattedData);
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
    const { name, email, department, is_active, mobile } = req.body;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      // Convert camelCase to snake_case for Supabase
      const supabaseData = {
        name,
        email,
        department,
        is_active: is_active !== undefined ? is_active : true,
        mobile
      };
      
      const { data, error } = await req.supabase.from('executives').insert([supabaseData]).select();
      if (error) throw error;
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data[0]);
      return res.status(201).json(formattedData);
    }
    
    // Otherwise, use mock data
    const newExecutive = {
      id: executives.length + 1,
      name,
      email,
      department,
      is_active: is_active !== undefined ? is_active : true,
      mobile
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
    const { name, email, department, is_active, mobile } = req.body;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      // Convert camelCase to snake_case for Supabase
      const supabaseData = {};
      if (name !== undefined) supabaseData.name = name;
      if (email !== undefined) supabaseData.email = email;
      if (department !== undefined) supabaseData.department = department;
      if (is_active !== undefined) supabaseData.is_active = is_active;
      if (mobile !== undefined) supabaseData.mobile = mobile;
      
      const { data, error } = await req.supabase.from('executives').update(supabaseData).eq('id', id).select();
      if (error) throw error;
      
      if (data.length === 0) {
        return res.status(404).json({ error: 'Executive not found' });
      }
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data[0]);
      return res.json(formattedData);
    }
    
    // Otherwise, use mock data
    const executiveIndex = executives.findIndex(e => e.id == id);
    if (executiveIndex === -1) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    
    executives[executiveIndex] = { 
      ...executives[executiveIndex], 
      name, 
      email, 
      department, 
      is_active: is_active !== undefined ? is_active : executives[executiveIndex].is_active,
      mobile
    };
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