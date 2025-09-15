import axios from 'axios';

// Configure axios base URL
// For development, use localhost:5000
// For production, use the VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://ticket-pos-backend.vercel.app/api' : 'http://localhost:5000/api');

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 30000,
});

// Request interceptor to log requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
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

// Ticket API endpoints
export const ticketAPI = {
  // Get all tickets
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/tickets', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetching tickets');
    }
  },
  
  // Get ticket by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching ticket ${id}`);
    }
  },
  
  // Get tickets by serial number
  getBySerialNumber: async (serialNumber: string) => {
    try {
      const response = await apiClient.get(`/tickets/serial/${serialNumber}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching tickets for serial ${serialNumber}`);
    }
  },
  
  // Create new ticket
  create: async (data: any) => {
    try {
      const response = await apiClient.post('/tickets', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating ticket');
    }
  },
  
  // Update ticket
  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/tickets/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating ticket ${id}`);
    }
  },
  
  // Delete ticket
  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting ticket ${id}`);
    }
  },
};

// Executive API endpoints
export const executiveAPI = {
  // Get all executives
  getAll: async () => {
    try {
      const response = await apiClient.get('/executives');
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetching executives');
    }
  },
  
  // Create new executive
  create: async (data: any) => {
    try {
      const response = await apiClient.post('/executives', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating executive');
    }
  },
  
  // Update executive
  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/executives/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating executive ${id}`);
    }
  },
  
  // Delete executive
  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/executives/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting executive ${id}`);
    }
  },
};

export default { ticketAPI, executiveAPI };