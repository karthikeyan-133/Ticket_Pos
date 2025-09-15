import { createClient } from '@supabase/supabase-js';

const healthHandler = async (req, res) => {
  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  let supabase = null;
  let supabaseStatus = 'Not configured';
  
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      supabaseStatus = 'Initialized';
      
      // Test Supabase connection
      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .limit(1);
      
      if (error) {
        supabaseStatus = `Error: ${error.message}`;
      } else {
        supabaseStatus = 'Connected and working';
      }
    } catch (error) {
      supabaseStatus = `Initialization error: ${error.message}`;
    }
  }
  
  // For all other requests, return health status
  res.status(200).json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    supabase: supabaseStatus,
    environment: {
      SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
  });
};

export default healthHandler;