// Test script for email functionality
import dotenv from 'dotenv';
dotenv.config();

import { sendEmailNotification } from './server/services/notificationService.js';

// Test ticket data
const testTicket = {
  ticketNumber: 'TEST-001',
  contactPerson: 'Test User',
  email: 'test@example.com',
  issueRelated: 'Test Issue',
  priority: 'medium',
  createdAt: new Date().toISOString(),
  closedAt: new Date().toISOString(),
  resolution: 'This is a test email from the ticket system.'
};

// Send test email
const testEmail = async () => {
  console.log('Testing email functionality...');
  
  try {
    const result = await sendEmailNotification(testTicket);
    console.log('Email test result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during email test:', error);
  }
};

testEmail();