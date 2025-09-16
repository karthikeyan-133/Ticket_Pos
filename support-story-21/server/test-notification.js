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

try {
  const result = await sendEmailNotification(testTicket);
  console.log('Notification test result:', result);
} catch (error) {
  console.error('Error testing notification service:', error);
}