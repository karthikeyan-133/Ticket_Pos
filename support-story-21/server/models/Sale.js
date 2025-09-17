// Mock Sales model for development without database
let sales = [
  {
    id: '1',
    companyName: 'Tech Solutions Inc.',
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    mobileNumber: '+971501234567',
    productEnquired: 'Tally ERP 9',
    productPrice: 15000,
    assignedExecutive: 'Sarah Johnson',
    dateOfEnquiry: '2025-09-01T10:00:00Z',
    nextFollowUpDate: '2025-09-08T10:00:00Z',
    lastCallDetails: 'Initial discussion about product features',
    statusOfEnquiry: 'hot',
    documents: 'https://example.com/docs/tally-brochure.pdf',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  },
  {
    id: '2',
    companyName: 'Global Systems Ltd.',
    customerName: 'Jane Smith',
    email: 'jane.smith@example.com',
    mobileNumber: '+971509876543',
    productEnquired: 'Tally Prime',
    productPrice: 25000,
    assignedExecutive: 'Mike Wilson',
    dateOfEnquiry: '2025-09-02T14:30:00Z',
    nextFollowUpDate: '2025-09-09T14:30:00Z',
    lastCallDetails: 'Sent product demo link',
    statusOfEnquiry: 'under processing',
    documents: 'https://example.com/docs/tally-prime-brochure.pdf',
    createdAt: '2025-09-02T14:30:00Z',
    updatedAt: '2025-09-02T15:45:00Z'
  }
];

class Sale {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.companyName = data.companyName;
    this.customerName = data.customerName;
    this.email = data.email;
    this.mobileNumber = data.mobileNumber;
    this.productEnquired = data.productEnquired;
    this.productPrice = data.productPrice;
    this.assignedExecutive = data.assignedExecutive;
    this.dateOfEnquiry = data.dateOfEnquiry;
    this.nextFollowUpDate = data.nextFollowUpDate;
    this.lastCallDetails = data.lastCallDetails;
    this.statusOfEnquiry = data.statusOfEnquiry;
    this.documents = data.documents;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save sale (mock implementation)
  async save() {
    sales.push(this);
    return this;
  }

  // Find all sales with optional filters (mock implementation)
  static async find(filter = {}) {
    let result = [...sales];

    // Apply filters
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(sale => 
        sale.companyName.toLowerCase().includes(searchTerm) ||
        sale.customerName.toLowerCase().includes(searchTerm) ||
        sale.email.toLowerCase().includes(searchTerm) ||
        sale.productEnquired.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.statusOfEnquiry && filter.statusOfEnquiry !== 'all') {
      result = result.filter(sale => sale.statusOfEnquiry === filter.statusOfEnquiry);
    }

    if (filter.assignedExecutive && filter.assignedExecutive !== 'all') {
      result = result.filter(sale => sale.assignedExecutive === filter.assignedExecutive);
    }

    // Sort by creation date (newest first)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }

  // Find sale by ID (mock implementation)
  static async findById(id) {
    return sales.find(sale => sale.id === id) || null;
  }

  // Remove sale by ID (mock implementation)
  static async removeById(id) {
    const initialLength = sales.length;
    sales = sales.filter(sale => sale.id !== id);
    return sales.length < initialLength ? { message: 'Sale deleted' } : null;
  }

  // Update sale by ID (mock implementation)
  static async updateById(id, data) {
    const index = sales.findIndex(sale => sale.id === id);
    if (index === -1) return null;

    // Update the sale
    sales[index] = { ...sales[index], ...data, updatedAt: new Date().toISOString() };

    return sales[index];
  }
}

import supabase from '../config/supabase.js';
import SupabaseSale from './supabase/Sale.js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Check if we should use Supabase
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY && supabase && !supabase.constructor.name.includes('Mock');

// Use appropriate model implementation
// For now, we'll use the mock implementation since the Supabase sales table may not exist yet
const SaleModel = useSupabase ? (await import('./supabase/Sale.js')).default : (await import('./mock/Sale.js')).default;

export default SaleModel;