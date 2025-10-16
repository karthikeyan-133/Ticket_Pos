// Test script for WhatsApp group messaging with specific group ID
// This script tests messaging to your specific "tickets" group

import axios from 'axios';

// Test data - using your specific group ID
const testData = {
  success: true,
  data: [
    {
      id: "test-1",
      ticketNumber: "TEST-001",
      serialNumber: "123456789",
      companyName: "Test Company",
      contactPerson: "Test Contact",
      mobileNumber: "+971501234567", // This should be a valid number for testing
      email: "test@example.com",
      issueRelated: "Testing group notifications",
      priority: "medium",
      assignedExecutive: "Test Executive",
      status: "closed",
      userType: "single user",
      version: "1.0",
      expiryDate: "2026-12-31T00:00:00.000Z",
      startedAt: "2025-10-16T10:00:00.000Z",
      closedAt: "2025-10-16T10:30:00.000Z",
      resolution: "Test resolution for group messaging",
      remarks: "Testing group notification functionality",
      groupName: "tickets",
      groupId: "120363402679779546@g.us", // Your specific group ID
      apiKey: "mysecretkey"
    }
  ],
  apiKey: "mysecretkey"
};

console.log('Testing WhatsApp group messaging with specific group ID');
console.log('Group ID: 120363402679779546@g.us');

// Send the request
axios.post('http://localhost:5000/api/notify-ticket', testData)
  .then(response => {
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check if group message was successful
    const result = response.data.results[0];
    if (result.groupMessage.success) {
      console.log('✅ Group message sent successfully!');
    } else {
      console.log('❌ Group message failed:', result.groupMessage.error);
      console.log('💡 Troubleshooting tips:');
      console.log('1. Make sure your WhatsApp client is connected');
      console.log('2. Verify that your WhatsApp account is a member of the "tickets" group');
      console.log('3. Check the server logs for more details');
    }
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });