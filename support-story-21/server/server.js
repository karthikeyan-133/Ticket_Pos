import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import Supabase database connection
import supabase from './config/supabase.js';

import ticketRoutes from './routes/tickets.js';
import executiveRoutes from './routes/executives.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://127.0.0.1:8080', 
    'http://127.0.0.1:8081',
    'https://ticket-pos.vercel.app'
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Middleware to inject Supabase client into requests
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Test database connection
app.get('/api/health', async (req, res) => {
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

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/executives', executiveRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (supabase) {
    console.log('Using Supabase database');
  } else {
    console.log('Supabase not configured - using mock data');
  }
});