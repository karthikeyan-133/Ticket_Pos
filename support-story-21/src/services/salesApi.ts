// Sales API service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('Sales API Request:', config.method?.toUpperCase(), config.baseURL, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('Sales API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Sales API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Enhanced error handling function
const handleApiError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timeout - Server is not responding');
  }
  
  if (error.message.includes('ECONNREFUSED')) {
    throw new Error('Connection refused - Backend server is not running');
  }
  
  if (error.message.includes('ETIMEDOUT')) {
    throw new Error('Connection timeout - Database connection failed');
  }
  
  if (error.message.includes('Network Error')) {
    throw new Error('Network error - Please check your connection and ensure the API server is running');
  }
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    if (status === 500) {
      throw new Error('Server error - Please check server logs');
    }
    throw new Error(data.message || `Server error (${status})`);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network error - Please check your connection and ensure the API server is running');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unknown error occurred');
  }
};

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
    try {
      const response = await apiClient.get('/sales', { params });
      console.log('Sales API Response:', response.data);
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleApiError(error, 'fetching sales');
      // Return empty array in case of error
      return [];
    }
  },

  // Get sale by ID
  getById: async (id: string): Promise<Sale> => {
    try {
      const response = await apiClient.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching sale ${id}`);
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Create new sale
  create: async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    try {
      const response = await apiClient.post('/sales', sale);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating sale');
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Update sale
  update: async (id: string, sale: Partial<Sale>): Promise<Sale> => {
    try {
      const response = await apiClient.put(`/sales/${id}`, sale);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating sale ${id}`);
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Delete sale
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sales/${id}`);
    } catch (error) {
      handleApiError(error, `deleting sale ${id}`);
    }
  },
};