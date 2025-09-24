import supabase from '../../config/supabase.js';

class Executive {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.department = data.department;
    // Convert snake_case to camelCase for consistency with mock model
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Save a new executive
  async save() {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    const { data, error } = await client
      .from('executives')
      .insert([
        {
          name: this.name,
          email: this.email,
          mobile: this.mobile,
          department: this.department,
          // Convert camelCase to snake_case for Supabase
          is_active: this.isActive,
          created_at: this.createdAt,
          updated_at: this.updatedAt
        }
      ])
      .select();

    if (error) {
      throw new Error(`Error saving executive: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const executiveData = {
      ...data[0],
      isActive: data[0].is_active,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    };
    return new Executive(executiveData);
  }

  // Find all executives
  static async findAll() {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    let query = client.from('executives').select('*');
    
    // Sort by name
    query = query.order('name', { ascending: true });
    
    // Remove the default limit of 1000 records
    query = query.limit(10000);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching executives: ${error.message}`);
    }

    // Convert snake_case to camelCase for each executive
    return data.map(executive => new Executive({
      ...executive,
      isActive: executive.is_active,
      createdAt: executive.created_at,
      updatedAt: executive.updated_at
    }));
  }

  // Find executive by ID
  static async findById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    const { data, error } = await client
      .from('executives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching executive: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const executiveData = {
      ...data,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    return new Executive(executiveData);
  }

  // Find executive by email
  static async findByEmail(email) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    const { data, error } = await client
      .from('executives')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching executive: ${error.message}`);
    }

    // Convert snake_case to camelCase for the response
    const executiveData = {
      ...data,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    return new Executive(executiveData);
  }

  // Update executive by ID
  static async updateById(id, data) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    // Convert camelCase to snake_case for Supabase
    const updateData = { 
      ...data, 
      is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      updated_at: data.updatedAt || data.updated_at || new Date().toISOString() 
    };
    
    // Remove camelCase properties that we've converted
    delete updateData.isActive;
    delete updateData.updatedAt;

    const { data: updatedData, error } = await client
      .from('executives')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Error updating executive: ${error.message}`);
    }

    if (updatedData.length === 0) {
      return null;
    }

    // Convert snake_case to camelCase for the response
    const executiveData = {
      ...updatedData[0],
      isActive: updatedData[0].is_active,
      createdAt: updatedData[0].created_at,
      updatedAt: updatedData[0].updated_at
    };
    return new Executive(executiveData);
  }

  // Remove executive by ID
  static async removeById(id) {
    // Use injected supabase client if available, otherwise use the imported one
    const client = Executive.supabase || supabase;
    
    const { data, error } = await client
      .from('executives')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Error deleting executive: ${error.message}`);
    }

    return data.length > 0 ? { message: 'Executive deleted' } : null;
  }
}

export default Executive;