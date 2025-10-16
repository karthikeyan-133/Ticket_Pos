// Test script for WhatsApp service functionality
import { generateWhatsAppMessageUrl } from './server/services/notificationService.js';

// Test data
const testTickets = [
  {
    // UAE number with leading zero
    ticketNumber: "TICKET/2025/001",
    contactPerson: "John Doe",
    mobileNumber: "0526075381",
    resolution: "Issue resolved by updating the software to the latest version."
  },
  {
    // UAE number without leading zero
    ticketNumber: "TICKET/2025/002",
    contactPerson: "Jane Smith",
    mobileNumber: "526075381",
    resolution: "Network connectivity issue fixed."
  },
  {
    // 10-digit number
    ticketNumber: "TICKET/2025/003",
    contactPerson: "Bob Johnson",
    mobileNumber: "0526075381",
    resolution: "License activation completed successfully."
  },
  {
    // International format
    ticketNumber: "TICKET/2025/004",
    contactPerson: "Alice Brown",
    mobileNumber: "+971526075381",
    resolution: "Data entry issue resolved."
  },
  {
    // Missing resolution
    ticketNumber: "TICKET/2025/005",
    contactPerson: "Charlie Wilson",
    mobileNumber: "0526075381",
    resolution: ""
  }
];

console.log("Testing WhatsApp URL Generation...\n");

testTickets.forEach((ticket, index) => {
  console.log(`Test Case ${index + 1}:`);
  console.log(`  Ticket Number: ${ticket.ticketNumber}`);
  console.log(`  Contact Person: ${ticket.contactPerson}`);
  console.log(`  Mobile Number: ${ticket.mobileNumber}`);
  console.log(`  Resolution: ${ticket.resolution || "(empty)"}`);
  
  const result = generateWhatsAppMessageUrl(ticket);
  
  if (result.success) {
    console.log(`  ✓ Success: WhatsApp URLs generated`);
    console.log(`    API URL: ${result.urls.api}`);
    console.log(`    WA URL: ${result.urls.wa}`);
    console.log(`    Web URL: ${result.urls.web}`);
  } else {
    console.log(`  ✗ Error: ${result.error}`);
  }
  
  console.log(""); // Empty line for readability
});

// Test script for WhatsApp service
// Run this script to test the WhatsApp functionality

import { sendToNumber, sendToGroupByName } from './server/utils/sendMessage.js';

// Wait for the client to be ready
setTimeout(async () => {
  console.log('Testing WhatsApp service...');
  
  // Test sending a message to a number (replace with a valid number)
  const numberResult = await sendToNumber('+971501234567', 'Hello! This is a test message from the ticket system.');
  console.log('Number message result:', numberResult);
  
  // Test sending a message to a group (replace with a valid group name)
  const groupResult = await sendToGroupByName('Support Team UAE', 'Test notification: A ticket has been closed.');
  console.log('Group message result:', groupResult);
  
  console.log('Test completed. Check your WhatsApp!');
}, 5000); // Wait 5 seconds for client to initialize
