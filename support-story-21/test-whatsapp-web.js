// Test script for WhatsApp Web functionality
// This script tests the WhatsApp Web integration in your local environment

console.log('🔍 Testing WhatsApp Web functionality...');

// Import the WhatsApp utilities
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract Client and LocalAuth from the default export
const { Client, LocalAuth } = pkg;

console.log('📱 Initializing WhatsApp Web client...');

// Define session directory
const sessionDir = path.join(__dirname, 'server', '.wwebjs_auth');

// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
  console.log('📁 Created session directory');
}

// Create WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'ticket-system-test',
    dataPath: sessionDir
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

console.log('🔄 Setting up event listeners...');

client.on('qr', qr => {
  console.log('📱 Scan this QR code with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web client is ready!');
  console.log('🎉 WhatsApp Web integration is working correctly!');
  
  // List available chats
  setTimeout(async () => {
    try {
      const chats = await client.getChats();
      const groups = chats.filter(chat => chat.isGroup);
      
      console.log('\n🏷️  Available WhatsApp Groups:');
      console.log('==========================');
      
      if (groups.length > 0) {
        groups.forEach((group, index) => {
          console.log(`${index + 1}. ${group.name}`);
          console.log(`   ID: ${group.id._serialized}`);
        });
      } else {
        console.log('❌ No groups found');
        console.log('   Please create a WhatsApp group named "tickets" and add this account to it');
      }
      
      // Disconnect the client
      await client.destroy();
      console.log('\n👋 Disconnected WhatsApp client');
    } catch (error) {
      console.error('Error fetching chats:', error.message);
      await client.destroy();
    }
  }, 3000);
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp Web client authenticated!');
});

client.on('auth_failure', msg => {
  console.error('❌ WhatsApp authentication failed:', msg);
});

client.on('disconnected', reason => {
  console.log('🔌 WhatsApp client disconnected:', reason);
});

// Initialize the client
client.initialize().catch(error => {
  console.error('Failed to initialize WhatsApp client:', error);
  
  if (error.message.includes('Failed to launch the browser process')) {
    console.log('\n⚠️  Browser launch failed. This might be due to:');
    console.log('   1. Missing Chromium/Chrome installation');
    console.log('   2. Puppeteer configuration issues');
    console.log('   3. System permissions');
    console.log('\n💡 Solutions:');
    console.log('   - Install Chrome or Chromium browser');
    console.log('   - Check Puppeteer documentation for your system');
    console.log('   - Run with appropriate permissions');
  }
});

console.log('⏳ Waiting for WhatsApp Web client to initialize...');
console.log('💡 If this takes too long, check your internet connection and Chrome installation');