// Initialization script for WhatsApp service
// Run this script to initialize the WhatsApp client and scan the QR code

import { client } from './server/utils/sendMessage.js';

console.log('Initializing WhatsApp client...');
console.log('Please scan the QR code with your WhatsApp mobile app.');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down WhatsApp client...');
  await client.destroy();
  process.exit(0);
});