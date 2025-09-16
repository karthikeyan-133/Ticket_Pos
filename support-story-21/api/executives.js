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

// Executive routes handler
const executiveRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  const pathParts = path.split('/').filter(Boolean);
  const executiveId = pathParts[0]; // Extract ID from path if present

  try {
    // Get all executives
    if (method === 'GET' && path === '/') {
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
      return res.json(consistentData);
    }
    
    // Get executive by ID
    if (method === 'GET' && executiveId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { data, error } = await req.supabase.from('executives').select('*').eq('id', executiveId).single();
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
      const executive = executives.find(e => e.id == executiveId);
      if (!executive) {
        return res.status(404).json({ error: 'Executive not found' });
      }
      const consistentData = formatExecutive(executive);
      return res.json(consistentData);
    }
    
    // Create new executive
    if (method === 'POST' && path === '/') {
      const { name, email, department, is_active, mobile } = req.body || {};
      
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
      return res.status(201).json(consistentData);
    }
    
    // Update executive
    if (method === 'PUT' && executiveId) {
      const { name, email, department, is_active, mobile } = req.body || {};
      
      // If we have a Supabase client, use it
      if (req.supabase) {
        // Convert camelCase to snake_case for Supabase
        const supabaseData = {};
        if (name !== undefined) supabaseData.name = name;
        if (email !== undefined) supabaseData.email = email;
        if (department !== undefined) supabaseData.department = department;
        if (is_active !== undefined) supabaseData.is_active = is_active;
        if (mobile !== undefined) supabaseData.mobile = mobile;
        
        const { data, error } = await req.supabase.from('executives').update(supabaseData).eq('id', executiveId).select();
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
      const executiveIndex = executives.findIndex(e => e.id == executiveId);
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
      return res.json(consistentData);
    }
    
    // Delete executive
    if (method === 'DELETE' && executiveId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        const { error } = await req.supabase.from('executives').delete().eq('id', executiveId);
        if (error) throw error;
        return res.status(204).send();
      }
      
      // Otherwise, use mock data
      const executiveIndex = executives.findIndex(e => e.id == executiveId);
      if (executiveIndex === -1) {
        return res.status(404).json({ error: 'Executive not found' });
      }
      
      executives.splice(executiveIndex, 1);
      return res.status(204).send();
    }
    
    // 404 for unmatched routes
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Error handling executive route:', error);
    return res.status(500).json({ error: error.message });
  }
};

export default executiveRoutes;