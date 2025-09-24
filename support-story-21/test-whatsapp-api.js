// Test script to verify WhatsApp API message encoding
import { generateWhatsAppMessageUrl } from './server/services/notificationService.js';

// Test case with the example from the issue
const ticketExample = {
  ticketNumber: 'TICKET/2025/4516',
  contactPerson: 'Amal',
  mobileNumber: '+9710526075381',
  resolution: 'dgdegdd'
};

console.log('Testing WhatsApp API message encoding...\n');

// Test the example from the issue
console.log('Test: Example from issue');
const result = generateWhatsAppMessageUrl(ticketExample);
console.log('Result:', result);
if (result.success) {
  console.log('URL:', result.url);
  // Show just the text parameter for verification
  const url = new URL(result.url);
  console.log('Phone parameter:', url.searchParams.get('phone'));
  console.log('Text parameter:', url.searchParams.get('text'));
  
  // Decode the text parameter to see the actual message
  const decodedText = decodeURIComponent(url.searchParams.get('text'));
  console.log('Decoded message:', decodedText);
}
console.log();

console.log('Test completed.');