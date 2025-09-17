// Sales API service
import axios from 'axios';

// Configure axios base URL to match the pattern used in api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://ticket-pos-backend.vercel.app/api' : 'http://localhost:5000/api');

console.log('Sales API Base URL:', API_BASE_URL);

// Create axios instance with proper configuration
const salesApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to log requests
salesApiClient.interceptors.request.use(
  (config) => {
    console.log('Sales API Request:', config.method?.toUpperCase(), config.baseURL, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses
salesApiClient.interceptors.response.use(
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
const handleSalesApiError = (error: any, operation: string) => {
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
    // Handle HTML responses (like 404 pages)
    if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
      throw new Error(`Server error (${status}) - API endpoint not found`);
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
      const response = await salesApiClient.get('/sales', { params });
      console.log('Sales API Response:', response.data);
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleSalesApiError(error, 'fetching sales');
      // Return empty array in case of error
      return [];
    }
  },

  // Get sale by ID
  getById: async (id: string): Promise<Sale> => {
    try {
      const response = await salesApiClient.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      handleSalesApiError(error, `fetching sale ${id}`);
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Create new sale
  create: async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    try {
      const response = await salesApiClient.post('/sales', sale);
      return response.data;
    } catch (error) {
      handleSalesApiError(error, 'creating sale');
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Update sale
  update: async (id: string, sale: Partial<Sale>): Promise<Sale> => {
    try {
      const response = await salesApiClient.put(`/sales/${id}`, sale);
      return response.data;
    } catch (error) {
      handleSalesApiError(error, `updating sale ${id}`);
      // Return empty object in case of error
      return {} as Sale;
    }
  },

  // Delete sale
  delete: async (id: string): Promise<void> => {
    try {
      await salesApiClient.delete(`/sales/${id}`);
    } catch (error) {
      handleSalesApiError(error, `deleting sale ${id}`);
    }
  },
};

export default salesAPI;