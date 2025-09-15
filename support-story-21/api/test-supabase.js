import { createClient } from '@supabase/supabase-js';

const testSupabaseHandler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    console.log('SUPABASE_URL:', supabaseUrl);
    console.log('SUPABASE_KEY exists:', !!supabaseKey);
    console.log('SUPABASE_URL type:', typeof supabaseUrl);
    console.log('SUPABASE_KEY type:', typeof supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        message: 'Supabase credentials not configured',
        error: 'SUPABASE_URL and SUPABASE_KEY must be set as environment variables',
        supabaseUrl: supabaseUrl,
        supabaseKeyExists: !!supabaseKey
      });
    }

    // Check if credentials are strings
    if (typeof supabaseUrl !== 'string' || typeof supabaseKey !== 'string') {
      return res.status(500).json({ 
        message: 'Supabase credentials invalid type',
        error: 'SUPABASE_URL and SUPABASE_KEY must be strings',
        supabaseUrlType: typeof supabaseUrl,
        supabaseKeyType: typeof supabaseKey
      });
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Test Supabase connection by querying a simple record
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('executives')
      .select('id, name')
      .limit(1);

    console.log('Supabase query result:', { data, error });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    return res.status(200).json({ 
      message: 'Supabase connection successful!',
      database: 'Connected to Supabase',
      testResult: data
    });
  } catch (error) {
    console.error('Supabase connection error:', error);
    return res.status(500).json({ 
      message: 'Supabase connection failed',
      error: error.message,
      stack: error.stack
    });
  }
};

export default testSupabaseHandler;