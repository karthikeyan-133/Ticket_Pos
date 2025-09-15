import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

// Create express app
const app = express();

// CORS configuration
app.use(cors());

// Add explicit CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));

// Initialize Supabase client for Vercel environment
let supabase = null;

// Try to initialize Supabase with environment variables
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully in Vercel environment');
  } else {
    console.log('Supabase credentials not found in environment variables');
    // Use mock implementation if credentials are missing
    const MockSupabase = (await import('../server/models/MockSupabase.js')).default;
    supabase = new MockSupabase();
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error.message);
  // Use mock implementation if initialization fails
  const MockSupabase = (await import('../server/models/MockSupabase.js')).default;
  supabase = new MockSupabase();
};

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

// Ensure consistent data format for executives
const formatExecutive = (executive) => {
  // Handle null or undefined executive
  if (!executive) {
    return {
      id: '',
      name: '',
      email: '',
      mobile: '',
      department: '',
      is_active: false
    };
  }
  
  return {
    id: executive.id,
    name: executive.name || '',
    email: executive.email || '',
    mobile: executive.mobile || executive.phone || '',
    department: executive.department || '',
    is_active: executive.is_active !== undefined ? executive.is_active : (executive.isActive !== undefined ? executive.isActive : true)
  };
};

// Get all executives
app.get('/', async (req, res) => {
  try {
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').select('*');
      if (error) throw error;
      
      // Ensure we always return an array
      const executivesData = Array.isArray(data) ? data : [];
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(executivesData);
      // Ensure consistent data format
      const consistentData = formattedData.map(formatExecutive);
      return res.json(consistentData);
    }
    
    // Otherwise, return mock data with consistent formatting
    const consistentData = executives.map(formatExecutive);
    res.json(consistentData);
  } catch (error) {
    console.error('Error fetching executives:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get executive by ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      const { data, error } = await req.supabase.from('executives').select('*').eq('id', id).single();
      if (error) throw error;
      
      // Handle case where no executive is found
      if (!data) {
        return res.status(404).json({ error: 'Executive not found' });
      }
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data);
      // Ensure consistent data format
      const consistentData = formatExecutive(formattedData);
      return res.json(consistentData);
    }
    
    // Otherwise, return mock data with consistent formatting
    const executive = executives.find(e => e.id == id);
    if (!executive) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    const consistentData = formatExecutive(executive);
    res.json(consistentData);
  } catch (error) {
    console.error('Error fetching executive by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new executive
app.post('/', async (req, res) => {
  try {
    const { name, email, department, is_active, mobile } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // If we have a Supabase client, use it
    if (req.supabase) {
      // Convert camelCase to snake_case for Supabase
      const supabaseData = {
        name,
        email,
        department: department || '',
        is_active: is_active !== undefined ? is_active : true,
        mobile: mobile || ''
      };
      
      const { data, error } = await req.supabase.from('executives').insert([supabaseData]).select();
      if (error) throw error;
      
      // Handle case where no data is returned
      if (!data || data.length === 0) {
        return res.status(500).json({ error: 'Failed to create executive' });
      }
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data[0]);
      // Ensure consistent data format
      const consistentData = formatExecutive(formattedData);
      return res.status(201).json(consistentData);
    }
    
    // Otherwise, use mock data with consistent formatting
    const newExecutive = {
      id: executives.length + 1,
      name,
      email,
      department: department || '',
      is_active: is_active !== undefined ? is_active : true,
      mobile: mobile || ''
    };
    executives.push(newExecutive);
    const consistentData = formatExecutive(newExecutive);
    res.status(201).json(consistentData);
  } catch (error) {
    console.error('Error creating executive:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update executive
app.put('/:id', async (req, res) => {
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
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Executive not found' });
      }
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedData = toCamelCase(data[0]);
      // Ensure consistent data format
      const consistentData = formatExecutive(formattedData);
      return res.json(consistentData);
    }
    
    // Otherwise, use mock data with consistent formatting
    const executiveIndex = executives.findIndex(e => e.id == id);
    if (executiveIndex === -1) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    
    executives[executiveIndex] = { 
      ...executives[executiveIndex], 
      name: name !== undefined ? name : executives[executiveIndex].name,
      email: email !== undefined ? email : executives[executiveIndex].email,
      department: department !== undefined ? department : executives[executiveIndex].department,
      is_active: is_active !== undefined ? is_active : executives[executiveIndex].is_active,
      mobile: mobile !== undefined ? mobile : executives[executiveIndex].mobile
    };
    const consistentData = formatExecutive(executives[executiveIndex]);
    res.json(consistentData);
  } catch (error) {
    console.error('Error updating executive:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete executive
app.delete('/:id', async (req, res) => {
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
    console.error('Error deleting executive:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export Vercel serverless handler
export default app;
export const handler = serverless(app);