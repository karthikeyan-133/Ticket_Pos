import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes using relative paths
import ticketRoutes from './tickets.js';
import executiveRoutes from './executives.js';

// Create express app
const app = express();

// CORS configuration for Vercel
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:8080', 
    'http://127.0.0.1:8081', 
    'https://ticket-pos.vercel.app',
    'https://ticket-pos-backend.vercel.app',
    process.env.FRONTEND_URL || '',
    /\.vercel\.app$/  // Allow any Vercel deployment
  ].filter(Boolean), // Remove any falsy values
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
}

// Make supabase available to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Root endpoint for health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Ticket System API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/health', async (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  
  if (!supabase) {
    return res.status(500).json({ 
      message: 'Server is running but Supabase is not configured',
      error: 'Supabase client not initialized. Please check your configuration.'
    });
  }

  try {
    // Test Supabase connection by querying a simple record
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ 
      message: 'Server is running!',
      database: 'Connected to Supabase',
      testResult: data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server is running but database connection failed',
      error: error.message 
    });
  }
});

// Simple connectivity test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'API connectivity test successful!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/executives', executiveRoutes);

// Add a specific test endpoint for executives
app.get('/api/executives/test', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      message: 'Executives API endpoint is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error testing executives API',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Set CORS headers for error responses
  res.header('Access-Control-Allow-Origin', '*');
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  // Set CORS headers for 404 responses
  res.header('Access-Control-Allow-Origin', '*');
  res.status(404).json({ error: 'Route not found' });
});

// Export the app as default for Vercel
export default app;