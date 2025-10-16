// Comprehensive test script for WhatsApp notifications
// This script tests both client and group messaging with proper error handling

import axios from 'axios';

// Test data with your specific group ID
const testData = {
  success: true,
  data: [
    {
      id: "test-1",
      ticketNumber: "TEST-001", // This was missing in your logs
      serialNumber: "321654987",
      companyName: "Digital Dynamics Corp.",
      contactPerson: "Emily Wilson",
      mobileNumber: "+971503216549",
      email: "karthikeyankm.karthi@gmail.com",
      issueRelated: "entry",
      priority: "medium",
      assignedExecutive: "John Smith",
      status: "closed",
      userType: "single user",
      version: "1.0", // Added missing version field
      expiryDate: "2025-10-24T00:00:00.000Z",
      startedAt: "2025-09-04T11:20:00.000Z",
      closedAt: "2025-10-16T06:21:42.816Z",
      resolution: "Issue resolved by resetting user permissions.",
      remarks: "User unable to enter data into specific module.",
      groupName: "tickets",
      groupId: "120363402679779546@g.us", // Your specific group ID
      apiKey: process.env.API_KEY || "mysecretkey"
    }
  ],
  apiKey: process.env.API_KEY || "mysecretkey"
};

console.log('🧪 Testing WhatsApp notifications...');
console.log('📱 Phone number:', testData.data[0].mobileNumber);
console.log('🏷️  Group name:', testData.data[0].groupName);
console.log('🆔 Group ID:', testData.data[0].groupId);
console.log('📝 Ticket number:', testData.data[0].ticketNumber || 'N/A');

// Send the request
axios.post('http://localhost:5000/api/notify-ticket', testData)
  .then(response => {
    console.log('\n✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check results
    const result = response.data.results[0];
    
    if (result.clientMessage.success) {
      console.log('\n✅ Client message sent successfully!');
      console.log('📱 Message ID:', result.clientMessage.result.id._serialized);
    } else {
      console.log('\n❌ Client message failed:', result.clientMessage.error);
    }
    
    if (result.groupMessage.success) {
      console.log('\n✅ Group message sent successfully!');
      console.log('🏷️  Message ID:', result.groupMessage.result.id._serialized);
    } else {
      console.log('\n❌ Group message failed:', result.groupMessage.error);
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure your WhatsApp client is connected');
      console.log('2. Verify that your WhatsApp account is a member of the "tickets" group');
      console.log('3. Check that the group ID is correct: 120363402679779546@g.us');
      console.log('4. Check the server logs for more details');
    }
  })
  .catch(error => {
    console.error('\n❌ Request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  });