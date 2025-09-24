// Test script to verify mobile number formatting for WhatsApp
import { generateWhatsAppMessageUrl } from './server/services/notificationService.js';

// Test cases for different mobile number formats
const testCases = [
  {
    name: "UAE format with leading zero",
    ticket: {
      ticketNumber: 'TICKET-001',
      contactPerson: 'Amal',
      mobileNumber: '0526075381',
      resolution: 'Issue resolved successfully'
    }
  },
  {
    name: "UAE format without leading zero",
    ticket: {
      ticketNumber: 'TICKET-002',
      contactPerson: 'John',
      mobileNumber: '526075381',
      resolution: 'Issue resolved successfully'
    }
  },
  {
    name: "10-digit format",
    ticket: {
      ticketNumber: 'TICKET-003',
      contactPerson: 'Jane',
      mobileNumber: '0526075381',
      resolution: 'Issue resolved successfully'
    }
  },
  {
    name: "International format",
    ticket: {
      ticketNumber: 'TICKET-004',
      contactPerson: 'Bob',
      mobileNumber: '+971526075381',
      resolution: 'Issue resolved successfully'
    }
  }
];

console.log('Testing mobile number formatting for WhatsApp...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input mobile number: ${testCase.ticket.mobileNumber}`);
  
  const result = generateWhatsAppMessageUrl(testCase.ticket);
  console.log('Result:', result);
  
  if (result.success) {
    console.log('URL:', result.url);
    // Parse the URL to extract the phone parameter
    const url = new URL(result.url);
    console.log('Phone parameter:', url.searchParams.get('phone'));
  }
  console.log();
});

console.log('Test completed.');