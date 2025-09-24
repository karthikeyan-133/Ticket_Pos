// Test script to verify WhatsApp message generation with resolution validation
import { generateWhatsAppMessageUrl } from './server/services/notificationService.js';

// Test case 1: Ticket with resolution
const ticketWithResolution = {
  ticketNumber: 'TICKET-001',
  contactPerson: 'John Doe',
  mobileNumber: '+971501234567',
  resolution: 'Issue resolved by updating the software to the latest version.'
};

// Test case 2: Ticket without resolution
const ticketWithoutResolution = {
  ticketNumber: 'TICKET-002',
  contactPerson: 'Jane Smith',
  mobileNumber: '+971501234568',
  resolution: ''
};

// Test case 3: Ticket with only whitespace in resolution
const ticketWithWhitespaceResolution = {
  ticketNumber: 'TICKET-003',
  contactPerson: 'Bob Johnson',
  mobileNumber: '+971501234569',
  resolution: '   '
};

console.log('Testing WhatsApp message generation with resolution validation...\n');

// Test ticket with resolution
console.log('Test 1: Ticket with resolution');
const result1 = generateWhatsAppMessageUrl(ticketWithResolution);
console.log('Result:', result1);
console.log();

// Test ticket without resolution
console.log('Test 2: Ticket without resolution');
const result2 = generateWhatsAppMessageUrl(ticketWithoutResolution);
console.log('Result:', result2);
console.log();

// Test ticket with whitespace-only resolution
console.log('Test 3: Ticket with whitespace-only resolution');
const result3 = generateWhatsAppMessageUrl(ticketWithWhitespaceResolution);
console.log('Result:', result3);
console.log();

console.log('Test completed.');