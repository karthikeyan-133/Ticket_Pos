// Sales routes handler that matches the actual database schema
const salesRoutes = async (req, res) => {
  const { method } = req;
  const path = req.path || '/';
  const pathParts = path.split('/').filter(Boolean);
  
  // Extract saleId from path if present
  const saleId = pathParts[0]; // First part after /api/sales/

  try {
    // Get all sales
    if (method === 'GET' && path === '/') {
      // If we have a Supabase client, use it
      if (req.supabase) {
        console.log('Fetching all sales from Supabase');
        const { data, error } = await req.supabase.from('sales').select('*');
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        console.log('Successfully fetched sales data:', data ? data.length : 0, 'records');
        
        // Convert snake_case to camelCase for the response
        const convertedData = data.map(sale => ({
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
        
        return res.json(convertedData);
      }
      
      // Otherwise, return mock data
      console.log('Returning mock sales data');
      return res.json([
        { 
          id: 1, 
          company_name: 'Sample Company 1', 
          companyName: 'Sample Company 1',
          customer_name: 'John Doe',
          customerName: 'John Doe',
          status_of_enquiry: 'hot',
          statusOfEnquiry: 'hot'
        },
        { 
          id: 2, 
          company_name: 'Sample Company 2', 
          companyName: 'Sample Company 2',
          customer_name: 'Jane Smith',
          customerName: 'Jane Smith',
          status_of_enquiry: 'cold',
          statusOfEnquiry: 'cold'
        }
      ]);
    }
    
    // Get sale by ID
    if (method === 'GET' && saleId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        console.log('Fetching sale by ID from Supabase:', saleId);
        const { data, error } = await req.supabase.from('sales').select('*').eq('id', saleId).single();
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        console.log('Successfully fetched sale data:', data);
        
        // Convert snake_case to camelCase for the response
        const convertedData = {
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
        
        return res.json(convertedData);
      }
      
      // Otherwise, return mock data
      console.log('Returning mock sale data for ID:', saleId);
      const sales = [
        { 
          id: 1, 
          company_name: 'Sample Company 1', 
          companyName: 'Sample Company 1',
          customer_name: 'John Doe',
          customerName: 'John Doe',
          status_of_enquiry: 'hot',
          statusOfEnquiry: 'hot'
        },
        { 
          id: 2, 
          company_name: 'Sample Company 2', 
          companyName: 'Sample Company 2',
          customer_name: 'Jane Smith',
          customerName: 'Jane Smith',
          status_of_enquiry: 'cold',
          statusOfEnquiry: 'cold'
        }
      ];
      const sale = sales.find(s => s.id == saleId);
      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      return res.json(sale);
    }
    
    // Create new sale
    if (method === 'POST' && path === '/') {
      // If we have a Supabase client, use it with the correct schema
      if (req.supabase) {
        console.log('Creating new sale in Supabase');
        // Extract all the fields from the request body (camelCase from frontend)
        const { 
          companyName,
          customerName,
          email,
          mobileNumber,
          productEnquired,
          productPrice,
          assignedExecutive,
          dateOfEnquiry,
          nextFollowUpDate,
          lastCallDetails,
          statusOfEnquiry,
          documents
        } = req.body || {};
        
        // Validate required fields
        if (!companyName || !customerName || !email) {
          return res.status(400).json({ 
            error: 'Missing required fields: companyName, customerName, and email are required' 
          });
        }
        
        const { data, error } = await req.supabase
          .from('sales')
          .insert([{
            company_name: companyName,
            customer_name: customerName,
            email,
            mobile_number: mobileNumber,
            product_enquired: productEnquired,
            product_price: productPrice,
            assigned_executive: assignedExecutive,
            date_of_enquiry: dateOfEnquiry,
            next_follow_up_date: nextFollowUpDate,
            last_call_details: lastCallDetails,
            status_of_enquiry: statusOfEnquiry,
            documents,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
          
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Successfully created sale:', data[0]);
        return res.status(201).json(data[0]);
      }
      
      // Otherwise, use mock data
      console.log('Creating mock sale');
      const newSale = {
        id: Math.floor(Math.random() * 1000),
        company_name: req.body.companyName || '',
        customer_name: req.body.customerName || '',
        email: req.body.email || '',
        mobile_number: req.body.mobileNumber || '',
        product_enquired: req.body.productEnquired || '',
        product_price: req.body.productPrice || 0,
        assigned_executive: req.body.assignedExecutive || '',
        date_of_enquiry: req.body.dateOfEnquiry || new Date().toISOString(),
        next_follow_up_date: req.body.nextFollowUpDate || new Date().toISOString(),
        last_call_details: req.body.lastCallDetails || '',
        status_of_enquiry: req.body.statusOfEnquiry || 'hot',
        documents: req.body.documents || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return res.status(201).json(newSale);
    }
    
    // Update sale
    if (method === 'PUT' && saleId) {
      // If we have a Supabase client, use it with the correct schema
      if (req.supabase) {
        console.log('Updating sale in Supabase:', saleId);
        // Extract all the fields from the request body (camelCase from frontend)
        const { 
          companyName,
          customerName,
          email,
          mobileNumber,
          productEnquired,
          productPrice,
          assignedExecutive,
          dateOfEnquiry,
          nextFollowUpDate,
          lastCallDetails,
          statusOfEnquiry,
          documents
        } = req.body || {};
        
        const updateData = {
          company_name: companyName,
          customer_name: customerName,
          email,
          mobile_number: mobileNumber,
          product_enquired: productEnquired,
          product_price: productPrice,
          assigned_executive: assignedExecutive,
          date_of_enquiry: dateOfEnquiry,
          next_follow_up_date: nextFollowUpDate,
          last_call_details: lastCallDetails,
          status_of_enquiry: statusOfEnquiry,
          documents,
          updated_at: new Date().toISOString()
        };
        
        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        const { data, error } = await req.supabase
          .from('sales')
          .update(updateData)
          .eq('id', saleId)
          .select();
          
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Successfully updated sale:', data[0]);
        return res.json(data[0]);
      }
      
      // Otherwise, use mock data
      console.log('Updating mock sale:', saleId);
      return res.status(200).json({ 
        id: saleId,
        ...req.body,
        updated_at: new Date().toISOString()
      });
    }
    
    // Delete sale
    if (method === 'DELETE' && saleId) {
      // If we have a Supabase client, use it
      if (req.supabase) {
        console.log('Deleting sale from Supabase:', saleId);
        const { error } = await req.supabase.from('sales').delete().eq('id', saleId);
        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }
        console.log('Successfully deleted sale:', saleId);
        return res.status(204).send();
      }
      
      // Otherwise, use mock data
      console.log('Deleting mock sale:', saleId);
      return res.status(204).send();
    }
    
    // 404 for unmatched routes
    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Sales API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process sales request',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export default salesRoutes;