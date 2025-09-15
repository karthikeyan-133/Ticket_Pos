import supabase from '../../config/supabase.js';

class Ticket {
  constructor(data) {
    this.id = data.id;
    this.ticketNumber = data.ticket_number || data.ticketNumber;
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
    
    const { data, error } = await client
      .from('tickets')
      .insert([
        {
          ticket_number: this.ticketNumber,
          serial_number: this.serialNumber,
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
      query = query.eq('serial_number', filter.serialNumber);
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

  // Remove ticket by ID
  static async removeById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    const { data, error } = await client
      .from('tickets')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Error deleting ticket: ${error.message}`);
    }

    return data.length > 0 ? { message: 'Ticket deleted' } : null;
  }

  // Update ticket by ID
  static async updateById(id, data) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Ticket.supabase || supabase;
    
    // Convert camelCase to snake_case for Supabase
    const updateData = { 
      ...data,
      ticket_number: data.ticketNumber !== undefined ? data.ticketNumber : data.ticket_number,
      serial_number: data.serialNumber !== undefined ? data.serialNumber : data.serial_number,
      company_name: data.companyName !== undefined ? data.companyName : data.company_name,
      contact_person: data.contactPerson !== undefined ? data.contactPerson : data.contact_person,
      mobile_number: data.mobileNumber !== undefined ? data.mobileNumber : data.mobile_number,
      issue_related: data.issueRelated !== undefined ? data.issueRelated : data.issue_related,
      assigned_executive: data.assignedExecutive !== undefined ? data.assignedExecutive : data.assigned_executive,
      user_type: data.userType !== undefined ? data.userType : data.user_type,
      expiry_date: data.expiryDate !== undefined ? data.expiryDate : data.expiry_date,
      updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
      closed_at: data.closedAt !== undefined ? data.closedAt : data.closed_at
    };
    
    // Remove camelCase properties that we've converted
    delete updateData.ticketNumber;
    delete updateData.serialNumber;
    delete updateData.companyName;
    delete updateData.contactPerson;
    delete updateData.mobileNumber;
    delete updateData.issueRelated;
    delete updateData.assignedExecutive;
    delete updateData.userType;
    delete updateData.expiryDate;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.closedAt;

    // Check if status is changing to closed
    if (data.status === 'closed') {
      const existingTicket = await this.findById(id);
      if (existingTicket && existingTicket.status !== 'closed') {
        updateData.closed_at = new Date().toISOString();
      }
    }

    const { data: updatedData, error } = await client
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Error updating ticket: ${error.message}`);
    }

    if (updatedData.length === 0) {
      return null;
    }

    // Convert snake_case to camelCase for the response
    const ticketData = {
      ...updatedData[0],
      ticketNumber: updatedData[0].ticket_number,
      serialNumber: updatedData[0].serial_number,
      companyName: updatedData[0].company_name,
      contactPerson: updatedData[0].contact_person,
      mobileNumber: updatedData[0].mobile_number,
      issueRelated: updatedData[0].issue_related,
      assignedExecutive: updatedData[0].assigned_executive,
      userType: updatedData[0].user_type,
      expiryDate: updatedData[0].expiry_date,
      createdAt: updatedData[0].created_at,
      updatedAt: updatedData[0].updated_at,
      closedAt: updatedData[0].closed_at
    };

    // If closing, send notification (this would be implemented in a service)
    if (updateData.status === 'closed') {
      console.log(`Ticket ${ticketData.ticketNumber} has been closed`);
    }

    return new Ticket(ticketData);
  }
}

export default Ticket;