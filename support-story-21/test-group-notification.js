// Test script for the enhanced group notification format
// This script tests the new detailed group message format

import axios from 'axios';

// Sample ticket data with all the details you want to see in the group message
const sampleData = {
  success: true,
  data: [
    {
      id: "1",
      ticketNumber: "TICKET/2025/1001",
      serialNumber: "719074656",
      companyName: "Mezotic Garments",
      contactPerson: "Accountant",
      mobileNumber: "0565157841",
      email: "accountant@mezotic.com",
      issueRelated: "entry passed wrongly",
      priority: "medium",
      assignedExecutive: "John Smith",
      status: "closed",
      userType: "single user",
      version: "5.1",
      expiryDate: "2026-05-31T00:00:00.000Z",
      startedAt: "2025-10-16T10:08:00.000Z",
      closedAt: "2025-10-16T10:34:00.000Z",
      resolution: "Corrected the entry and verified all related data",
      remarks: "Client confirmed the issue is resolved",
      groupName: "Support Team UAE",
      apiKey: "mysecretkey"
    }
  ],
  apiKey: "mysecretkey"
};

console.log('Testing enhanced group notification format...');

// Send the request
axios.post('http://localhost:5000/api/notify-ticket', sampleData)
  .then(response => {
    console.log('Response:', JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });