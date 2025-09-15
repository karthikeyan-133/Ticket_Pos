// Mock API service for demonstration purposes
let tickets: any[] = [];
let executives: any[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1234567890' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '+1234567892' },
  { id: '4', name: 'Anna Davis', email: 'anna@example.com', phone: '+1234567893' },
];

// Generate a random ticket number
const generateTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `TICKET/${year}/${randomNumber}`;
};

// Validate serial number (sum of digits reduces to 9)
const validateSerialNumber = (serial: string): boolean => {
  if (serial.length !== 9 || !/^\d+$/.test(serial)) return false;
  
  let sum = serial
    .split("")
    .reduce((acc, digit) => acc + parseInt(digit), 0);
    
  while (sum > 9) {
    sum = sum
      .toString()
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum === 9;
};

// Mock API functions
export const mockTicketAPI = {
  // Get all tickets
  getAll: async (params?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    let filteredTickets = [...tickets];
    
    // Apply filters if provided
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.ticketNumber.toLowerCase().includes(search) ||
        ticket.serialNumber.includes(search) ||
        ticket.companyName.toLowerCase().includes(search) ||
        ticket.contactPerson.toLowerCase().includes(search) ||
        ticket.email.toLowerCase().includes(search)
      );
    }
    
    if (params?.status && params.status !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === params.status);
    }
    
    if (params?.priority && params.priority !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === params.priority);
    }
    
    if (params?.company && params.company !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.companyName === params.company);
    }
    
    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { data: filteredTickets };
  },
  
  // Get ticket by ID
  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return { data: ticket };
  },
  
  // Get tickets by serial number
  getBySerialNumber: async (serialNumber: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const serialTickets = tickets.filter(t => t.serialNumber === serialNumber);
    return { data: serialTickets };
  },
  
  // Create new ticket
  create: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Validate serial number
    if (!validateSerialNumber(data.serialNumber)) {
      throw new Error('Invalid serial number. The sum of digits must reduce to 9.');
    }
    
    const newTicket = {
      id: Math.random().toString(36).substr(2, 9),
      ticketNumber: generateTicketNumber(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: data.status === 'closed' ? new Date().toISOString() : null,
    };
    
    tickets.push(newTicket);
    
    // Simulate sending notifications if ticket is closed
    if (data.status === 'closed') {
      console.log(`Sending notification for closed ticket ${newTicket.ticketNumber}`);
      // In a real implementation, this would send email/WhatsApp notifications
    }
    
    return { data: newTicket };
  },
  
  // Update ticket
  update: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }
    
    // Check if status is changing to closed
    const isClosing = data.status === 'closed' && tickets[ticketIndex].status !== 'closed';
    
    const updatedTicket = {
      ...tickets[ticketIndex],
      ...data,
      updatedAt: new Date().toISOString(),
      closedAt: isClosing ? new Date().toISOString() : data.closedAt || tickets[ticketIndex].closedAt,
    };
    
    tickets[ticketIndex] = updatedTicket;
    
    // Simulate sending notifications if ticket is closed
    if (isClosing) {
      console.log(`Sending notification for closed ticket ${updatedTicket.ticketNumber}`);
      // In a real implementation, this would send email/WhatsApp notifications
    }
    
    return { data: updatedTicket };
  },
  
  // Delete ticket
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }
    
    tickets.splice(ticketIndex, 1);
    return { data: { message: 'Ticket deleted' } };
  },
};

// Executive API functions
export const mockExecutiveAPI = {
  // Get all executives
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return { data: executives };
  },
  
  // Create new executive
  create: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const newExecutive = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
    };
    
    executives.push(newExecutive);
    return { data: newExecutive };
  },
  
  // Update executive
  update: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const executiveIndex = executives.findIndex(e => e.id === id);
    if (executiveIndex === -1) {
      throw new Error('Executive not found');
    }
    
    const updatedExecutive = {
      ...executives[executiveIndex],
      ...data,
    };
    
    executives[executiveIndex] = updatedExecutive;
    return { data: updatedExecutive };
  },
  
  // Delete executive
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const executiveIndex = executives.findIndex(e => e.id === id);
    if (executiveIndex === -1) {
      throw new Error('Executive not found');
    }
    
    executives.splice(executiveIndex, 1);
    return { data: { message: 'Executive deleted' } };
  },
};

// Add some sample data for demonstration
const addSampleData = () => {
  if (tickets.length === 0) {
    tickets = [
      {
        id: '1',
        ticketNumber: 'TICKET/2024/1234',
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
        expiryDate: '2025-12-31T00:00:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        closedAt: null,
        resolution: '',
        remarks: 'Customer is experiencing issues with data import functionality.'
      },
      {
        id: '2',
        ticketNumber: 'TICKET/2024/1235',
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
        expiryDate: '2025-06-30T00:00:00.000Z',
        createdAt: '2024-01-15T09:15:00.000Z',
        updatedAt: '2024-01-15T15:45:00.000Z',
        closedAt: null,
        resolution: '',
        remarks: 'Network connectivity issues in the office.'
      },
      {
        id: '3',
        ticketNumber: 'TICKET/2024/1236',
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
        expiryDate: '2024-12-31T00:00:00.000Z',
        createdAt: '2024-01-15T08:00:00.000Z',
        updatedAt: '2024-01-15T12:30:00.000Z',
        closedAt: null,
        resolution: '',
        remarks: 'Licence renewal inquiry.'
      },
      {
        id: '4',
        ticketNumber: 'TICKET/2024/1237',
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
        expiryDate: '2025-03-31T00:00:00.000Z',
        createdAt: '2024-01-14T16:20:00.000Z',
        updatedAt: '2024-01-15T09:10:00.000Z',
        closedAt: '2024-01-15T09:10:00.000Z',
        resolution: 'Issue resolved by resetting user permissions.',
        remarks: 'User unable to enter data into specific module.'
      }
    ];
  }
};

// Initialize with sample data
addSampleData();