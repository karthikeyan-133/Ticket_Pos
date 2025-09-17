// Import required modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import route handlers
import ticketRoutes from './tickets.js';
import executiveRoutes from './executives.js';
import salesRoutes from './sales.js';

// Initialize Supabase client for Vercel environment
let supabase = null;

// Try to initialize Supabase with environment variables
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  console.log('Attempting to initialize Supabase with:', {
    url: supabaseUrl ? 'SET' : 'NOT SET',
    key: supabaseKey ? 'SET' : 'NOT SET'
  });
  
  if (supabaseUrl && supabaseKey) {
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

// CORS middleware function
const corsMiddleware = (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigin = corsOptions.origin.some(allowed => 
    typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
  ) ? origin : '*';
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

// Main Vercel serverless function handler
const handler = async (req, res) => {
  console.log('API Request:', {
    method: req.method,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']
    }
  });
  
  // Handle CORS preflight requests
  if (corsMiddleware(req, res)) {
    return;
  }
  
  // Parse JSON body if present
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    try {
      // Check if body is already parsed (Vercel sometimes parses it automatically)
      if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      } else if (!req.body) {
        // If no body, try to parse from rawBody
        if (req.rawBody) {
          req.body = JSON.parse(req.rawBody);
        }
      }
      // If body is already an object, leave it as is
    } catch (error) {
      // Body is not JSON or is already parsed
      console.log('Body parsing error or body already parsed:', error.message);
    }
  }
  
  // Add supabase to request object for routes
  req.supabase = supabase;
  
  // Route handling
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  try {
    // Root endpoint for health check
    if (path === '/' && req.method === 'GET') {
      res.status(200).json({ 
        message: 'Ticket System API is running!',
        timestamp: new Date().toISOString(),
        supabaseInitialized: !!supabase
      });
      return;
    }
    
    // Health check endpoint
    if (path === '/api/health' && req.method === 'GET') {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      res.status(200).json({ 
        message: 'Server is running!',
        supabaseInitialized: !!supabase,
        supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
        supabaseKey: process.env.SUPABASE_KEY ? 'SET' : 'NOT SET'
      });
      return;
    }
    
    // Sales health check endpoint
    if (path === '/api/sales/health' && req.method === 'GET') {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      if (!supabase) {
        return res.status(500).json({ 
          message: 'Server is running but Supabase is not configured',
          error: 'Supabase client not initialized. Please check your configuration.'
        });
      }

      try {
        // Test Supabase connection by querying the sales table
        const { data, error } = await supabase
          .from('sales')
          .select('id')
          .limit(1);

        if (error) {
          throw new Error(error.message);
        }

        res.status(200).json({ 
          message: 'Sales API is working!',
          database: 'Connected to Supabase',
          testResult: data
        });
        return;
      } catch (error) {
        res.status(500).json({ 
          message: 'Sales API is running but database connection failed',
          error: error.message,
          supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
          supabaseKey: process.env.SUPABASE_KEY ? 'SET' : 'NOT SET'
        });
        return;
      }
    }
    
    // Simple connectivity test endpoint
    if (path === '/api/test' && req.method === 'GET') {
      res.status(200).json({ 
        message: 'API connectivity test successful!',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Executives test endpoint
    if (path === '/api/executives/test' && req.method === 'GET') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ 
        message: 'Executives API endpoint is working!',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Ticket routes
    if (path.startsWith('/api/tickets')) {
      const ticketPath = path.substring('/api/tickets'.length) || '/';
      const ticketReq = {
        ...req,
        url: ticketPath,
        path: ticketPath,
        params: {},
        query: Object.fromEntries(url.searchParams)
      };
      
      // Extract ID from path if present
      const pathParts = ticketPath.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0]) {
        ticketReq.params.id = pathParts[0];
      }
      
      const ticketRes = {
        status: (code) => {
          res.statusCode = code;
          return ticketRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        send: (data) => {
          res.end(data);
        }
      };
      
      await ticketRoutes(ticketReq, ticketRes);
      return;
    }
    
    // Executive routes
    if (path.startsWith('/api/executives')) {
      const executivePath = path.substring('/api/executives'.length) || '/';
      const executiveReq = {
        ...req,
        url: executivePath,
        path: executivePath,
        params: {},
        query: Object.fromEntries(url.searchParams)
      };
      
      // Extract ID from path if present
      const pathParts = executivePath.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0]) {
        executiveReq.params.id = pathParts[0];
      }
      
      const executiveRes = {
        status: (code) => {
          res.statusCode = code;
          return executiveRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        send: (data) => {
          res.end(data);
        }
      };
      
      await executiveRoutes(executiveReq, executiveRes);
      return;
    }
    
    // Sales routes
    if (path.startsWith('/api/sales')) {
      const salesPath = path.substring('/api/sales'.length) || '/';
      const salesReq = {
        ...req,
        url: salesPath,
        path: salesPath,
        params: {},
        query: Object.fromEntries(url.searchParams)
      };
      
      // Extract ID from path if present
      const pathParts = salesPath.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0]) {
        salesReq.params.id = pathParts[0];
      }
      
      const salesRes = {
        status: (code) => {
          res.statusCode = code;
          return salesRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        send: (data) => {
          res.end(data);
        }
      };
      
      await salesRoutes(salesReq, salesRes);
      return;
    }
    
    // 404 handler
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Something went wrong!',
        message: error.message 
      });
    }
  }
};

// Export the handler as default for Vercel
export default handler;