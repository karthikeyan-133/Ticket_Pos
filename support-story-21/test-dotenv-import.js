// Test file to verify dotenv import works in Vercel environment
import dotenv from 'dotenv';
console.log('Dotenv imported successfully');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

// Test importing notification service
try {
  const notificationService = await import('./server/services/notificationService.js');
  console.log('Notification service imported successfully');
} catch (error) {
  console.error('Failed to import notification service:', error.message);
}