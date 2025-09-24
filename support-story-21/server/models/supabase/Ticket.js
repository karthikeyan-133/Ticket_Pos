import supabase from '../../config/supabase.js';
import { sendTicketClosedNotifications } from '../../services/notificationService.js';

// Generate a random ticket number
const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `TICKET/${year}/${randomNumber}`;
};

// Validate Tally serial number (must be exactly 9 digits)
const validateSerialNumber = (serialNumber) => {
  if (!serialNumber) {
    throw new Error('Tally serial number is required');
  }
  
  // Remove any spaces or special characters
  const cleanSerialNumber = serialNumber.toString().replace(/\D/g, '');
  
  if (cleanSerialNumber.length !== 9) {
    throw new Error('Tally serial number must be exactly 9 digits');
  }
  
  if (!/^\d{9}$/.test(cleanSerialNumber)) {
    throw new Error('Tally serial number must contain only digits');
  }
  
  return cleanSerialNumber;
};

class Ticket {
  constructor(data) {
    this.id = data.id;
    // Only generate ticket number if not provided
    this.ticketNumber = data.ticket_number || data.ticketNumber || generateTicketNumber();
    this.serialNumber = data.serial_number || data.serialNumber;
    this.companyName = data.company_name || data.companyName;
    this.contactPerson = data.contact_person || data.contactPerson;
    this.mobileNumber = data.mobile_number || data.mobileNumber;
    this.email = data.email;
    this.issueRelated = data.issue_related || data.issueRelated;
    this.priority = data.priority;
    this.assignedExecutive = data.assigned_executive || data.assignedExecutive;
    this.status = data.status;
    this.userType = data.user_type || data.userType;
    this.expiryDate = data.expiry_date || data.expiryDate;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.closedAt = data.closed_at || data.closedAt;
    this.resolution = data.resolution;
    this.remarks = data.remarks;
  }

  // Save a new ticket
  async save() {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    // Validate serial number before saving
    const validatedSerialNumber = validateSerialNumber(this.serialNumber);
    
    const { data, error } = await client
      .from('tickets')
      .insert([
        {
          ticket_number: this.ticketNumber,
          serial_number: validatedSerialNumber,
          company_name: this.companyName,
          contact_person: this.contactPerson,
          mobile_number: this.mobileNumber,
          email: this.email,
          issue_related: this.issueRelated,
          priority: this.priority,
          assigned_executive: this.assignedExecutive,
          status: this.status,
          user_type: this.userType,
          expiry_date: this.expiryDate,
          created_at: this.createdAt,
          updated_at: this.updatedAt,
          closed_at: this.closedAt,
          resolution: this.resolution,
          remarks: this.remarks
        }
      ])
      .select();

    if (error) {
      throw new Error(`Error saving ticket: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const ticketData = {
      ...data[0],
      ticketNumber: data[0].ticket_number,
      serialNumber: data[0].serial_number,
      companyName: data[0].company_name,
      contactPerson: data[0].contact_person,
      mobileNumber: data[0].mobile_number,
      issueRelated: data[0].issue_related,
      assignedExecutive: data[0].assigned_executive,
      userType: data[0].user_type,
      expiryDate: data[0].expiry_date,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      closedAt: data[0].closed_at
    };
    return new Ticket(ticketData);
  }

  // Find all tickets with optional filters
  static async find(filter = {}) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    let query = client.from('tickets').select('*');

    // Apply filters
    if (filter.serialNumber) {
      // Validate serial number format
      const validatedSerialNumber = validateSerialNumber(filter.serialNumber);
      query = query.eq('serial_number', validatedSerialNumber);
    }

    // Handle search parameter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      query = query.or(
        `ticket_number.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    if (filter.priority && filter.priority !== 'all') {
      query = query.eq('priority', filter.priority);
    }

    if (filter.companyName && filter.companyName !== 'all') {
      query = query.eq('company_name', filter.companyName);
    }

    // Sort by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Remove the default limit of 1000 records by setting a very large limit
    // This ensures all tickets are displayed
    query = query.limit(100000);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching tickets: ${error.message}`);
    }

    // Convert snake_case to camelCase for each ticket
    return data.map(ticket => new Ticket({
      ...ticket,
      ticketNumber: ticket.ticket_number,
      serialNumber: ticket.serial_number,
      companyName: ticket.company_name,
      contactPerson: ticket.contact_person,
      mobileNumber: ticket.mobile_number,
      issueRelated: ticket.issue_related,
      assignedExecutive: ticket.assigned_executive,
      userType: ticket.user_type,
      expiryDate: ticket.expiry_date,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      closedAt: ticket.closed_at
    }));
  }

  // Find ticket by ID
  static async findById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching ticket: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const ticketData = {
      ...data,
      ticketNumber: data.ticket_number,
      serialNumber: data.serial_number,
      companyName: data.company_name,
      contactPerson: data.contact_person,
      mobileNumber: data.mobile_number,
      issueRelated: data.issue_related,
      assignedExecutive: data.assigned_executive,
      userType: data.user_type,
      expiryDate: data.expiry_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at
    };
    return new Ticket(ticketData);
  }

  // Update an existing ticket
  async update() {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    // Validate serial number before updating
    const validatedSerialNumber = validateSerialNumber(this.serialNumber);
    
    const { data, error } = await client
      .from('tickets')
      .update({
        ticket_number: this.ticketNumber,
        serial_number: validatedSerialNumber,
        company_name: this.companyName,
        contact_person: this.contactPerson,
        mobile_number: this.mobileNumber,
        email: this.email,
        issue_related: this.issueRelated,
        priority: this.priority,
        assigned_executive: this.assignedExecutive,
        status: this.status,
        user_type: this.userType,
        expiry_date: this.expiryDate,
        updated_at: new Date(),
        closed_at: this.closedAt,
        resolution: this.resolution,
        remarks: this.remarks
      })
      .eq('id', this.id)
      .select();

    if (error) {
      throw new Error(`Error updating ticket: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const ticketData = {
      ...data[0],
      ticketNumber: data[0].ticket_number,
      serialNumber: data[0].serial_number,
      companyName: data[0].company_name,
      contactPerson: data[0].contact_person,
      mobileNumber: data[0].mobile_number,
      issueRelated: data[0].issue_related,
      assignedExecutive: data[0].assigned_executive,
      userType: data[0].user_type,
      expiryDate: data[0].expiry_date,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at,
      closedAt: data[0].closed_at
    };
    return new Ticket(ticketData);
  }

  // Delete a ticket
  static async delete(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    const { error } = await client
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting ticket: ${error.message}`);
    }
    
    return true;
  }

  // Find ticket by ticket number
  static async findByTicketNumber(ticketNumber) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .eq('ticket_number', ticketNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching ticket: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const ticketData = {
      ...data,
      ticketNumber: data.ticket_number,
      serialNumber: data.serial_number,
      companyName: data.company_name,
      contactPerson: data.contact_person,
      mobileNumber: data.mobile_number,
      issueRelated: data.issue_related,
      assignedExecutive: data.assigned_executive,
      userType: data.user_type,
      expiryDate: data.expiry_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at
    };
    return new Ticket(ticketData);
  }

  // Get resolution history by serial number
  static async getResolutionHistory(serialNumber) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    // Validate serial number format
    const validatedSerialNumber = validateSerialNumber(serialNumber);
    
    // Get all tickets for this serial number, sorted by creation date
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .eq('serial_number', validatedSerialNumber)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching resolution history: ${error.message}`);
    }

    // Convert snake_case to camelCase for each ticket
    return data.map(ticket => new Ticket({
      ...ticket,
      ticketNumber: ticket.ticket_number,
      serialNumber: ticket.serial_number,
      companyName: ticket.company_name,
      contactPerson: ticket.contact_person,
      mobileNumber: ticket.mobile_number,
      issueRelated: ticket.issue_related,
      assignedExecutive: ticket.assigned_executive,
      userType: ticket.user_type,
      expiryDate: ticket.expiry_date,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      closedAt: ticket.closed_at
    }));
  }
}

export default Ticket;