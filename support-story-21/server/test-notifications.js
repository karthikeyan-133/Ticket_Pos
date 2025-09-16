import dotenv from 'dotenv';
dotenv.config();

import { sendEmailNotification } from './services/notificationService.js';

// Test the notification service
const testTicket = {
  ticketNumber: 'TEST-001',
  email: 'test@example.com',
  contactPerson: 'Test User',
  issueRelated: 'Testing',
  priority: 'high',
  createdAt: new Date().toISOString(),
  closedAt: new Date().toISOString(),
  resolution: 'Test resolution message'
};

console.log('Testing notification service...');

// Log environment variables to check if they're loaded correctly
console.log('Environment variables:');
console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('- SMTP_HOST:', process.env.SMTP_HOST);
console.log('- SMTP_PORT:', process.env.SMTP_PORT);
console.log('- SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('- SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set');
console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);

sendEmailNotification(testTicket)
  .then(result => {
    console.log('Notification test result:', result);
  })
  .catch(error => {
    console.error('Error testing notification service:', error);
  });