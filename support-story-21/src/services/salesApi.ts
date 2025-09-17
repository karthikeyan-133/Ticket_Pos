// Sales API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Sale {
  id?: string;
  companyName: string;
  customerName: string;
  email: string;
  mobileNumber: string;
  productEnquired: string;
  productPrice: number;
  assignedExecutive: string;
  dateOfEnquiry: string;
  nextFollowUpDate: string;
  lastCallDetails: string;
  statusOfEnquiry: 'hot' | 'cold' | 'won' | 'under processing' | 'dropped';
  documents: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SalesQueryParams {
  search?: string;
  statusOfEnquiry?: string;
  assignedExecutive?: string;
}

export const salesAPI = {
  // Get all sales
  getAll: async (params?: SalesQueryParams): Promise<Sale[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.statusOfEnquiry) queryParams.append('statusOfEnquiry', params.statusOfEnquiry);
    if (params?.assignedExecutive) queryParams.append('assignedExecutive', params.assignedExecutive);
    
    // For Vercel deployment, we use relative paths
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/sales?${queryParams.toString()}`
      : `/api/sales?${queryParams.toString()}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  },

  // Get sale by ID
  getById: async (id: string): Promise<Sale> => {
    // For Vercel deployment, we use relative paths
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/sales/${id}`
      : `/api/sales/${id}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sale: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  },

  // Create new sale
  create: async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    // For Vercel deployment, we use relative paths
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/sales`
      : `/api/sales`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to create sale: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  },

  // Update sale
  update: async (id: string, sale: Partial<Sale>): Promise<Sale> => {
    // For Vercel deployment, we use relative paths
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/sales/${id}`
      : `/api/sales/${id}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to update sale: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  },

  // Delete sale
  delete: async (id: string): Promise<void> => {
    // For Vercel deployment, we use relative paths
    const url = API_BASE_URL 
      ? `${API_BASE_URL}/api/sales/${id}`
      : `/api/sales/${id}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to delete sale: ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  },
};