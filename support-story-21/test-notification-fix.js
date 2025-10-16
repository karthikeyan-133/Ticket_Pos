// Test script for notification fixes
// This script tests the improved notification handling

import axios from 'axios';

// Sample ticket data based on the error logs (with empty ticketNumber)
const sampleData = {
  success: true,
  data: [
    {
      id: "4",
      ticketNumber: "", // This was empty in the logs
      serialNumber: "321654987",
      companyName: "Digital Dynamics Corp.",
      contactPerson: "Emily Wilson",
      mobileNumber: "+971503216549",
      email: "emily.wilson@example.com",
      issueRelated: "entry",
      priority: "medium",
      assignedExecutive: "John Smith",
      status: "closed",
      userType: "single user",
      expiryDate: "2025-03-31T00:00:00.000Z",
      createdAt: "2025-09-04T11:20:00Z",
      updatedAt: "2025-10-08T10:32:20.557Z",
      closedAt: "2025-10-08T10:32:20.557Z",
      resolution: "Issue resolved by resetting user permissions.",
      remarks: "User unable to enter data into specific module.",
      apiKey: "mysecretkey"
    }
  ],
  apiKey: "mysecretkey"
};

console.log('Testing notification with empty ticket number...');

// Send the request
axios.post('http://localhost:5000/api/notify-ticket', sampleData)
  .then(response => {
    console.log('Response:', JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });