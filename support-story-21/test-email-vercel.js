// Test script for Vercel email functionality
import { sendEmailNotification } from './server/services/notificationService.js';

// Test ticket data
const testTicket = {
  ticketNumber: 'TEST-001',
  contactPerson: 'Test User',
  email: 'test@example.com',
  issueRelated: 'Test Issue',
  priority: 'high',
  resolution: 'This is a test resolution message to verify email functionality.',
  createdAt: new Date().toISOString(),
  closedAt: new Date().toISOString()
};

// Test the email notification
async function testEmail() {
  console.log('Testing email notification...');
  
  try {
    const result = await sendEmailNotification(testTicket);
    console.log('Email test result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed to send:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during email test:', error);
  }
}

// Run the test
testEmail();