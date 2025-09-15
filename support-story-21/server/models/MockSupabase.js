// Mock Supabase client for development
class MockSupabase {
  constructor() {
    this.data = {
      tickets: [
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
          created_at: '2025-09-01T10:00:00Z',
          updated_at: '2025-09-01T10:00:00Z',
          closed_at: null,
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
          created_at: '2025-09-02T14:30:00Z',
          updated_at: '2025-09-02T15:45:00Z',
          closed_at: null,
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
          created_at: '2025-09-03T09:15:00Z',
          updated_at: '2025-09-03T09:15:00Z',
          closed_at: null,
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
          created_at: '2025-09-04T11:20:00Z',
          updated_at: '2025-09-04T16:30:00Z',
          closed_at: '2025-09-04T16:30:00Z',
          resolution: 'Issue resolved by resetting user permissions.',
          remarks: 'User unable to enter data into specific module.'
        }
      ],
      executives: [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          mobile: '+971501111111',
          department: 'Technical Support',
          is_active: true,
          created_at: '2025-09-01T09:00:00Z',
          updated_at: '2025-09-01T09:00:00Z'
        },
        {
          id: '2',
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          mobile: '+971502222222',
          department: 'Network Support',
          is_active: true,
          created_at: '2025-09-01T09:00:00Z',
          updated_at: '2025-09-01T09:00:00Z'
        },
        {
          id: '3',
          name: 'Anna Davis',
          email: 'anna.davis@example.com',
          mobile: '+971503333333',
          department: 'Licensing',
          is_active: true,
          created_at: '2025-09-01T09:00:00Z',
          updated_at: '2025-09-01T09:00:00Z'
        },
        {
          id: '4',
          name: 'John Smith',
          email: 'john.smith@example.com',
          mobile: '+971504444444',
          department: 'General Support',
          is_active: true,
          created_at: '2025-09-01T09:00:00Z',
          updated_at: '2025-09-01T09:00:00Z'
        }
      ]
    };
  }

  from(table) {
    return new MockQuery(this.data[table] || [], table, this.data);
  }
}

class MockQuery {
  constructor(data, table, allData) {
    this.data = [...data];
    this.table = table;
    this.allData = allData;
    this.filteredData = null;
  }

  select() {
    return this;
  }

  eq(field, value) {
    this.filteredData = this.filteredData || this.data;
    this.filteredData = this.filteredData.filter(item => item[field] === value);
    return this;
  }

  or(condition) {
    // Simple implementation for search
    this.filteredData = this.filteredData || this.data;
    // For simplicity, we'll just return all data for or conditions
    return this;
  }

  limit(count) {
    this.filteredData = this.filteredData || this.data;
    this.filteredData = this.filteredData.slice(0, count);
    return this;
  }

  order(field, options) {
    this.filteredData = this.filteredData || this.data;
    this.filteredData.sort((a, b) => {
      if (options.ascending === false) {
        return b[field] > a[field] ? 1 : -1;
      }
      return a[field] > b[field] ? 1 : -1;
    });
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  async then() {
    const data = this.filteredData || this.data;
    return {
      data: this.singleResult ? (data[0] || null) : data,
      error: null
    };
  }

  insert(values) {
    // For mock, we'll just return the values as if they were inserted
    return {
      select: () => ({
        then: () => {
          // Add to mock data
          if (Array.isArray(values)) {
            values.forEach(value => {
              this.allData[this.table].push({ ...value, id: Math.random().toString(36).substr(2, 9) });
            });
          } else {
            this.allData[this.table].push({ ...values, id: Math.random().toString(36).substr(2, 9) });
          }
          
          return Promise.resolve({
            data: Array.isArray(values) ? values : [values],
            error: null
          });
        }
      })
    };
  }

  update(updates) {
    return {
      eq: (field, value) => ({
        select: () => ({
          then: () => {
            // Update mock data
            const item = this.allData[this.table].find(item => item[field] === value);
            if (item) {
              Object.assign(item, updates);
              return Promise.resolve({
                data: [item],
                error: null
              });
            }
            return Promise.resolve({
              data: [],
              error: null
            });
          }
        })
      })
    };
  }

  delete() {
    return {
      eq: (field, value) => ({
        select: () => ({
          then: () => {
            // Remove from mock data
            const initialLength = this.allData[this.table].length;
            this.allData[this.table] = this.allData[this.table].filter(item => item[field] !== value);
            const deleted = initialLength > this.allData[this.table].length;
            
            return Promise.resolve({
              data: deleted ? [{ id: value }] : [],
              error: null
            });
          }
        })
      })
    };
  }
}

export default MockSupabase;