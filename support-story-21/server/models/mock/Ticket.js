// Mock Ticket model for development without database
import { sendTicketClosedNotifications } from '../../services/notificationService.js';

let tickets = [
  {
    id: '1',
    ticketNumber: 'TICKET/2025/1001',
    serialNumber: '123456789',
    companyName: 'Tech Solutions Inc.',
    contactPerson: 'John Doe',
    mobileNumber: '+971501234567',
    email: 'john.doe@example.com',
    issueRelated: 'data',
    priority: 'high',
    assignedExecutive: 'Sarah Johnson',
    status: 'open',
    userType: 'multiuser',
    expiryDate: '2025-12-31',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
    closedAt: null,
    resolution: null,
    remarks: 'Customer is experiencing issues with data import functionality.'
  },
  {
    id: '2',
    ticketNumber: 'TICKET/2025/1002',
    serialNumber: '987654321',
    companyName: 'Global Systems Ltd.',
    contactPerson: 'Jane Smith',
    mobileNumber: '+971509876543',
    email: 'jane.smith@example.com',
    issueRelated: 'network',
    priority: 'medium',
    assignedExecutive: 'Mike Wilson',
    status: 'processing',
    userType: 'single user',
    expiryDate: '2025-06-30',
    createdAt: '2025-09-02T14:30:00Z',
    updatedAt: '2025-09-02T15:45:00Z',
    closedAt: null,
    resolution: null,
    remarks: 'Network connectivity issues in the office.'
  },
  {
    id: '3',
    ticketNumber: 'TICKET/2025/1003',
    serialNumber: '456789123',
    companyName: 'Innovative Enterprises',
    contactPerson: 'Robert Brown',
    mobileNumber: '+971504567891',
    email: 'robert.brown@example.com',
    issueRelated: 'licence',
    priority: 'low',
    assignedExecutive: 'Anna Davis',
    status: 'on hold',
    userType: 'multiuser',
    expiryDate: '2024-12-31',
    createdAt: '2025-09-03T09:15:00Z',
    updatedAt: '2025-09-03T09:15:00Z',
    closedAt: null,
    resolution: null,
    remarks: 'Licence renewal inquiry.'
  },
  {
    id: '4',
    ticketNumber: 'TICKET/2025/1004',
    serialNumber: '321654987',
    companyName: 'Digital Dynamics Corp.',
    contactPerson: 'Emily Wilson',
    mobileNumber: '+971503216549',
    email: 'emily.wilson@example.com',
    issueRelated: 'entry',
    priority: 'medium',
    assignedExecutive: 'John Smith',
    status: 'closed',
    userType: 'single user',
    expiryDate: '2025-03-31',
    createdAt: '2025-09-04T11:20:00Z',
    updatedAt: '2025-09-04T16:30:00Z',
    closedAt: '2025-09-04T16:30:00Z',
    resolution: 'Issue resolved by resetting user permissions.',
    remarks: 'User unable to enter data into specific module.'
  }
];

// Generate a random ticket number
const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `TICKET/${year}/${randomNumber}`;
};

class Ticket {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.ticketNumber = data.ticketNumber || generateTicketNumber();
    this.serialNumber = data.serialNumber;
    this.companyName = data.companyName;
    this.contactPerson = data.contactPerson;
    this.mobileNumber = data.mobileNumber;
    this.email = data.email;
    this.issueRelated = data.issueRelated;
    this.priority = data.priority;
    this.assignedExecutive = data.assignedExecutive;
    this.status = data.status || 'open';
    this.userType = data.userType;
    this.expiryDate = data.expiryDate;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.closedAt = data.closedAt || null;
    this.resolution = data.resolution || '';
    this.remarks = data.remarks || '';
  }

  // Save ticket (mock implementation)
  async save() {
    tickets.push(this);
    return this;
  }

  // Find all tickets with optional filters (mock implementation)
  static async find(filter = {}) {
    let result = [...tickets];

    // Apply filters
    if (filter.serialNumber) {
      result = result.filter(ticket => ticket.serialNumber === filter.serialNumber);
    }

    // Handle search parameter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(ticket => 
        ticket.ticketNumber.toLowerCase().includes(searchTerm) ||
        ticket.serialNumber.toLowerCase().includes(searchTerm) ||
        ticket.companyName.toLowerCase().includes(searchTerm) ||
        ticket.contactPerson.toLowerCase().includes(searchTerm) ||
        ticket.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.status && filter.status !== 'all') {
      result = result.filter(ticket => ticket.status === filter.status);
    }

    if (filter.priority && filter.priority !== 'all') {
      result = result.filter(ticket => ticket.priority === filter.priority);
    }

    if (filter.companyName && filter.companyName !== 'all') {
      result = result.filter(ticket => ticket.companyName === filter.companyName);
    }

    // Sort by creation date (newest first)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }

  // Find ticket by ID (mock implementation)
  static async findById(id) {
    return tickets.find(ticket => ticket.id === id) || null;
  }

  // Remove ticket by ID (mock implementation)
  static async removeById(id) {
    const initialLength = tickets.length;
    tickets = tickets.filter(ticket => ticket.id !== id);
    return tickets.length < initialLength ? { message: 'Ticket deleted' } : null;
  }

  // Update ticket by ID (mock implementation)
  static async updateById(id, data) {
    const index = tickets.findIndex(ticket => ticket.id === id);
    if (index === -1) return null;

    // Check if status is changing to closed
    let isClosing = false;
    if (data.status === 'closed' && tickets[index].status !== 'closed') {
      isClosing = true;
      data.closedAt = new Date().toISOString();
    }

    // Update the ticket
    tickets[index] = { ...tickets[index], ...data, updatedAt: new Date().toISOString() };
    
    // If closing, send notification
    if (isClosing) {
      console.log(`Mock notification: Ticket ${tickets[index].ticketNumber} has been closed`);
      // Send actual notification
      try {
        await sendTicketClosedNotifications(tickets[index]);
        console.log(`Notification sent for ticket ${tickets[index].ticketNumber}`);
      } catch (error) {
        console.error(`Error sending notification for ticket ${tickets[index].ticketNumber}:`, error);
      }
    }

    return tickets[index];
  }
}

export default Ticket;