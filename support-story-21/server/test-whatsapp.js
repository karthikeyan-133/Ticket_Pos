import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

console.log('Testing WhatsApp Web integration...');

// Create WhatsApp client with persistent session
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false // Set to true for production
  }
});

// Initialize client
client.on('qr', qr => {
  console.log('Scan this QR code with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  console.log('Test completed successfully.');
  process.exit(0);
});

client.on('authenticated', () => {
  console.log('WhatsApp client authenticated!');
});

client.on('auth_failure', msg => {
  console.error('WhatsApp authentication failed:', msg);
  process.exit(1);
});

client.on('disconnected', reason => {
  console.log('WhatsApp client disconnected:', reason);
});

// Start the client
client.initialize();

console.log('WhatsApp client initialization started...');