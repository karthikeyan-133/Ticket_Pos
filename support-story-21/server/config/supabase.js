import { createClient } from '@supabase/supabase-js';
import MockSupabase from '../models/MockSupabase.js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Log for debugging
console.log('Attempting to load .env from:', envPath);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Create Supabase client only if credentials are provided
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
    supabase = new MockSupabase();
    console.log('Using mock Supabase client due to initialization error.');
  }
} else {
  supabase = new MockSupabase();
  console.log('Supabase credentials not provided. Using mock Supabase client.');
  console.log('Please set SUPABASE_URL and SUPABASE_KEY in your .env file for real database connectivity.');
}

export default supabase;