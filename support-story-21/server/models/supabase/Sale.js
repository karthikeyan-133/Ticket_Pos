import supabase from '../../config/supabase.js';

class Sale {
  constructor(data) {
    this.id = data.id;
    this.companyName = data.company_name || data.companyName;
    this.customerName = data.customer_name || data.customerName;
    this.email = data.email;
    this.mobileNumber = data.mobile_number || data.mobileNumber;
    this.productEnquired = data.product_enquired || data.productEnquired;
    this.productPrice = data.product_price || data.productPrice;
    this.assignedExecutive = data.assigned_executive || data.assignedExecutive;
    this.dateOfEnquiry = data.date_of_enquiry || data.dateOfEnquiry;
    this.nextFollowUpDate = data.next_follow_up_date || data.nextFollowUpDate;
    this.lastCallDetails = data.last_call_details || data.lastCallDetails;
    this.statusOfEnquiry = data.status_of_enquiry || data.statusOfEnquiry;
    this.documents = data.documents;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Save a new sale
  async save() {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Sale.supabase || supabase;
    
    const { data, error } = await client
      .from('sales')
      .insert([
        {
          company_name: this.companyName,
          customer_name: this.customerName,
          email: this.email,
          mobile_number: this.mobileNumber,
          product_enquired: this.productEnquired,
          product_price: this.productPrice,
          assigned_executive: this.assignedExecutive,
          date_of_enquiry: this.dateOfEnquiry,
          next_follow_up_date: this.nextFollowUpDate,
          last_call_details: this.lastCallDetails,
          status_of_enquiry: this.statusOfEnquiry,
          documents: this.documents,
          created_at: this.createdAt,
          updated_at: this.updatedAt
        }
      ])
      .select();

    if (error) {
      throw new Error(`Error saving sale: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const saleData = {
      ...data[0],
      companyName: data[0].company_name,
      customerName: data[0].customer_name,
      mobileNumber: data[0].mobile_number,
      productEnquired: data[0].product_enquired,
      productPrice: data[0].product_price,
      assignedExecutive: data[0].assigned_executive,
      dateOfEnquiry: data[0].date_of_enquiry,
      nextFollowUpDate: data[0].next_follow_up_date,
      lastCallDetails: data[0].last_call_details,
      statusOfEnquiry: data[0].status_of_enquiry,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    };

    return saleData;
  }

  // Find sales with optional filters
  static async find(filter = {}) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Sale.supabase || supabase;
    
    let query = client.from('sales').select('*');

    // Apply filters
    if (filter.search) {
      query = query.or(
        `company_name.ilike.%${filter.search}%,customer_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,product_enquired.ilike.%${filter.search}%`
      );
    }

    if (filter.statusOfEnquiry && filter.statusOfEnquiry !== 'all') {
      query = query.eq('status_of_enquiry', filter.statusOfEnquiry);
    }

    if (filter.assignedExecutive && filter.assignedExecutive !== 'all') {
      query = query.eq('assigned_executive', filter.assignedExecutive);
    }

    // Sort by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Remove the default limit of 1000 records
    query = query.limit(10000);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching sales: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    return data.map(sale => ({
      ...sale,
      companyName: sale.company_name,
      customerName: sale.customer_name,
      mobileNumber: sale.mobile_number,
      productEnquired: sale.product_enquired,
      productPrice: sale.product_price,
      assignedExecutive: sale.assigned_executive,
      dateOfEnquiry: sale.date_of_enquiry,
      nextFollowUpDate: sale.next_follow_up_date,
      lastCallDetails: sale.last_call_details,
      statusOfEnquiry: sale.status_of_enquiry,
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    }));
  }

  // Find sale by ID
  static async findById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Sale.supabase || supabase;
    
    const { data, error } = await client
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching sale: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    return {
      ...data,
      companyName: data.company_name,
      customerName: data.customer_name,
      mobileNumber: data.mobile_number,
      productEnquired: data.product_enquired,
      productPrice: data.product_price,
      assignedExecutive: data.assigned_executive,
      dateOfEnquiry: data.date_of_enquiry,
      nextFollowUpDate: data.next_follow_up_date,
      lastCallDetails: data.last_call_details,
      statusOfEnquiry: data.status_of_enquiry,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Update sale by ID
  static async updateById(id, data) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Sale.supabase || supabase;
    
    // Convert camelCase to snake_case for the database
    const updateData = {
      company_name: data.companyName,
      customer_name: data.customerName,
      email: data.email,
      mobile_number: data.mobileNumber,
      product_enquired: data.productEnquired,
      product_price: data.productPrice,
      assigned_executive: data.assignedExecutive,
      date_of_enquiry: data.dateOfEnquiry,
      next_follow_up_date: data.nextFollowUpDate,
      last_call_details: data.lastCallDetails,
      status_of_enquiry: data.statusOfEnquiry,
      documents: data.documents,
      updated_at: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedData, error } = await client
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Error updating sale: ${error.message}`);
    }

    if (updatedData.length === 0) {
      return null;
    }

    // Convert snake_case to camelCase for the response
    const sale = updatedData[0];
    return {
      ...sale,
      companyName: sale.company_name,
      customerName: sale.customer_name,
      mobileNumber: sale.mobile_number,
      productEnquired: sale.product_enquired,
      productPrice: sale.product_price,
      assignedExecutive: sale.assigned_executive,
      dateOfEnquiry: sale.date_of_enquiry,
      nextFollowUpDate: sale.next_follow_up_date,
      lastCallDetails: sale.last_call_details,
      statusOfEnquiry: sale.status_of_enquiry,
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    };
  }

  // Remove sale by ID
  static async removeById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Sale.supabase || supabase;
    
    const { error } = await client
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting sale: ${error.message}`);
    }

    return { message: 'Sale deleted' };
  }
}

export default Sale;