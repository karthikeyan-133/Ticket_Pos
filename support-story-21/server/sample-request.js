// Sample POST request to test the /api/notify-ticket endpoint
// Save this as sample-request.js and run with: node sample-request.js

import axios from 'axios';

// Sample ticket data
const sampleData = {
  success: true,
  data: [
    {
      id: "4",
      ticketNumber: "TICKET/2025/1004",
      serialNumber: "766901916",
      companyName: "Digital Dynamics Corp.",
      contactPerson: "Emily Wilson",
      mobileNumber: "+971503216549",
      email: "emily.wilson@example.com",
      issueRelated: "entry",
      priority: "medium",
      assignedExecutive: "John Smith",
      status: "closed",
      userType: "single",
      groupName: "tickets", // Updated to your new group name
      resolution: "Issue resolved by updating the database entries and restarting the service.",
      apiKey: "mysecretkey"
    }
  ],
  apiKey: "mysecretkey"
};

// Send the request
axios.post('http://localhost:5000/api/notify-ticket', sampleData)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });