// Test script to verify WhatsApp message encoding
import { generateWhatsAppMessageUrl } from './server/services/notificationService.js';

// Test case with special characters
const ticketWithSpecialChars = {
  ticketNumber: 'TICKET-001',
  contactPerson: 'Amal',
  mobileNumber: '+9710526075381',
  resolution: 'Issue resolved with special chars: & % $ # @ !'
};

// Test case with the example from the issue
const ticketExample = {
  ticketNumber: 'TICKET/2025/4516',
  contactPerson: 'Amal',
  mobileNumber: '+9710526075381',
  resolution: 'dgdegdd'
};

console.log('Testing WhatsApp message encoding...\n');

// Test ticket with special characters
console.log('Test 1: Ticket with special characters');
const result1 = generateWhatsAppMessageUrl(ticketWithSpecialChars);
console.log('Result:', result1);
if (result1.success) {
  console.log('URL:', result1.url);
  // Show just the text parameter for verification
  const url = new URL(result1.url);
  console.log('Text parameter:', url.searchParams.get('text'));
}
console.log();

// Test the example from the issue
console.log('Test 2: Example from issue');
const result2 = generateWhatsAppMessageUrl(ticketExample);
console.log('Result:', result2);
if (result2.success) {
  console.log('URL:', result2.url);
  // Show just the text parameter for verification
  const url = new URL(result2.url);
  console.log('Text parameter:', url.searchParams.get('text'));
}
console.log();

console.log('Test completed.');