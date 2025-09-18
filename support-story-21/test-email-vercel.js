// Test script for email functionality on Vercel
import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables check:');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL ? 'SET' : 'NOT SET');

// Check if we're running on Vercel
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

import { sendEmailNotification } from './server/services/notificationService.js';

// Test ticket data
const testTicket = {
  ticketNumber: 'TEST-001',
  contactPerson: 'Ashkan',
  email: 'ashkan@example.com',
  issueRelated: 'network',
  priority: 'high',
  createdAt: new Date().toISOString(),
  closedAt: new Date().toISOString(),
  resolution: 'done network config'
};

// Send test email
const testEmail = async () => {
  console.log('Testing email functionality...');
  console.log('Test ticket data:', testTicket);
  
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