import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const vercelHandler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Add supabase to request object
  req.supabase = supabase;

  // Health check endpoint
  if (req.url === '/api/health') {
    try {
      if (!supabase) {
        return res.status(500).json({ 
          message: 'Server is running but Supabase is not configured',
          error: 'Supabase client not initialized. Please check your configuration.'
        });
      }

      // Test Supabase connection
      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({ 
        message: 'Server is running!',
        database: 'Connected to Supabase',
        testResult: data
      });
    } catch (error) {
      return res.status(500).json({ 
        message: 'Server is running but database connection failed',
        error: error.message 
      });
    }
  }

  // Default response for unrecognized endpoints
  res.status(404).json({ error: 'Endpoint not found' });
};

export default vercelHandler;