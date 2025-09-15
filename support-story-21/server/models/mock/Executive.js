// Mock Executive model for development without database
let executives = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    mobile: '+971501111111',
    department: 'Technical Support',
    isActive: true,
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z'
  },
  {
    id: '2',
    name: 'Mike Wilson',
    email: 'mike.wilson@example.com',
    mobile: '+971502222222',
    department: 'Network Support',
    isActive: true,
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z'
  },
  {
    id: '3',
    name: 'Anna Davis',
    email: 'anna.davis@example.com',
    mobile: '+971503333333',
    department: 'Licensing',
    isActive: true,
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z'
  },
  {
    id: '4',
    name: 'John Smith',
    email: 'john.smith@example.com',
    mobile: '+971504444444',
    department: 'General Support',
    isActive: true,
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z'
  }
];

class Executive {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.department = data.department;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Save executive (mock implementation)
  async save() {
    executives.push(this);
    return this;
  }

  // Find all executives with optional filters (mock implementation)
  static async find(filter = {}) {
    let result = [...executives];

    // Apply filters
    if (filter.department) {
      result = result.filter(exec => exec.department === filter.department);
    }

    if (filter.isActive !== undefined) {
      result = result.filter(exec => exec.isActive === filter.isActive);
    }

    // Sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }

  // Find executive by ID (mock implementation)
  static async findById(id) {
    return executives.find(exec => exec.id === id) || null;
  }

  // Remove executive by ID (mock implementation)
  static async removeById(id) {
    const initialLength = executives.length;
    executives = executives.filter(exec => exec.id !== id);
    return executives.length < initialLength ? { message: 'Executive deleted' } : null;
  }

  // Update executive by ID (mock implementation)
  static async updateById(id, data) {
    const index = executives.findIndex(exec => exec.id === id);
    if (index === -1) return null;

    // Update the executive
    executives[index] = { ...executives[index], ...data, updatedAt: new Date().toISOString() };

    return executives[index];
  }
}

export default Executive;