// Script to initialize Supabase tables
import supabase from './config/supabase.js';

async function initSupabase() {
  console.log('Initializing Supabase tables...');

  try {
    // Create tickets table
    const { error: ticketsError } = await supabase.rpc('create_tickets_table');
    
    if (ticketsError) {
      console.log('Tickets table may already exist or RPC not available:', ticketsError.message);
      console.log('Please create the tickets table manually in Supabase with the following structure:');
      console.log(`
        CREATE TABLE tickets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ticket_number VARCHAR(50) NOT NULL UNIQUE,
          serial_number VARCHAR(9) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          issue_related VARCHAR(20) NOT NULL, -- ENUM: 'data', 'network', 'licence', 'entry'
          priority VARCHAR(10) NOT NULL, -- ENUM: 'high', 'medium', 'low'
          assigned_executive VARCHAR(255),
          status VARCHAR(20) NOT NULL DEFAULT 'open', -- ENUM: 'open', 'processing', 'on hold', 'closed'
          user_type VARCHAR(20) NOT NULL, -- ENUM: 'single user', 'multiuser'
          expiry_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          closed_at TIMESTAMP WITH TIME ZONE,
          resolution TEXT,
          remarks TEXT
        );
        
        -- Create indexes
        CREATE INDEX idx_tickets_serial_number ON tickets(serial_number);
        CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
        CREATE INDEX idx_tickets_status ON tickets(status);
        CREATE INDEX idx_tickets_priority ON tickets(priority);
        CREATE INDEX idx_tickets_company_name ON tickets(company_name);
      `);
    } else {
      console.log('Tickets table created successfully');
    }

    // Create executives table
    const { error: executivesError } = await supabase.rpc('create_executives_table');
    
    if (executivesError) {
      console.log('Executives table may already exist or RPC not available:', executivesError.message);
      console.log('Please create the executives table manually in Supabase with the following structure:');
      console.log(`
        CREATE TABLE executives (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          mobile VARCHAR(20),
          department VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    } else {
      console.log('Executives table created successfully');
    }

    // Insert sample data for tickets
    const { error: ticketsInsertError } = await supabase
      .from('tickets')
      .upsert([
        {
          id: '1',
          ticket_number: 'TICKET/2025/1001',
          serial_number: '123456789',
          company_name: 'Tech Solutions Inc.',
          contact_person: 'John Doe',
          mobile_number: '+971501234567',
          email: 'john.doe@example.com',
          issue_related: 'data',
          priority: 'high',
          assigned_executive: 'Sarah Johnson',
          status: 'open',
          user_type: 'multiuser',
          expiry_date: '2025-12-31',
          resolution: null,
          remarks: 'Customer is experiencing issues with data import functionality.'
        },
        {
          id: '2',
          ticket_number: 'TICKET/2025/1002',
          serial_number: '987654321',
          company_name: 'Global Systems Ltd.',
          contact_person: 'Jane Smith',
          mobile_number: '+971509876543',
          email: 'jane.smith@example.com',
          issue_related: 'network',
          priority: 'medium',
          assigned_executive: 'Mike Wilson',
          status: 'processing',
          user_type: 'single user',
          expiry_date: '2025-06-30',
          resolution: null,
          remarks: 'Network connectivity issues in the office.'
        },
        {
          id: '3',
          ticket_number: 'TICKET/2025/1003',
          serial_number: '456789123',
          company_name: 'Innovative Enterprises',
          contact_person: 'Robert Brown',
          mobile_number: '+971504567891',
          email: 'robert.brown@example.com',
          issue_related: 'licence',
          priority: 'low',
          assigned_executive: 'Anna Davis',
          status: 'on hold',
          user_type: 'multiuser',
          expiry_date: '2024-12-31',
          resolution: null,
          remarks: 'Licence renewal inquiry.'
        },
        {
          id: '4',
          ticket_number: 'TICKET/2025/1004',
          serial_number: '321654987',
          company_name: 'Digital Dynamics Corp.',
          contact_person: 'Emily Wilson',
          mobile_number: '+971503216549',
          email: 'emily.wilson@example.com',
          issue_related: 'entry',
          priority: 'medium',
          assigned_executive: 'John Smith',
          status: 'closed',
          user_type: 'single user',
          expiry_date: '2025-03-31',
          resolution: 'Issue resolved by resetting user permissions.',
          remarks: 'User unable to enter data into specific module.'
        }
      ], { onConflict: 'id' });

    if (ticketsInsertError) {
      console.log('Error inserting sample tickets:', ticketsInsertError.message);
    } else {
      console.log('Sample tickets data inserted');
    }

    // Insert sample data for executives
    const { error: executivesInsertError } = await supabase
      .from('executives')
      .upsert([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          mobile: '+971501111111',
          department: 'Technical Support',
          is_active: true
        },
        {
          id: '2',
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          mobile: '+971502222222',
          department: 'Network Support',
          is_active: true
        },
        {
          id: '3',
          name: 'Anna Davis',
          email: 'anna.davis@example.com',
          mobile: '+971503333333',
          department: 'Licensing',
          is_active: true
        },
        {
          id: '4',
          name: 'John Smith',
          email: 'john.smith@example.com',
          mobile: '+971504444444',
          department: 'General Support',
          is_active: true
        }
      ], { onConflict: 'id' });

    if (executivesInsertError) {
      console.log('Error inserting sample executives:', executivesInsertError.message);
    } else {
      console.log('Sample executives data inserted');
    }

    console.log('Supabase initialization completed');
  } catch (error) {
    console.error('Error initializing Supabase:', error.message);
  }
}

initSupabase();