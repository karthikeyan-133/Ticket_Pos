// Script to list all available WhatsApp groups
// This helps verify that your "tickets" group is visible to the WhatsApp client

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

// Define session directory
const sessionDir = path.join(__dirname, 'server', '.wwebjs_auth');

// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// Create WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'ticket-system',
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

console.log('🚀 Initializing WhatsApp client...');

client.on('qr', qr => {
  console.log('📱 Scan this QR code with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ WhatsApp client is ready!');
  
  try {
    // Get all chats
    const chats = await client.getChats();
    
    // Filter for groups only
    const groups = chats.filter(chat => chat.isGroup);
    
    if (groups.length > 0) {
      console.log('\n🏷️  Available WhatsApp Groups:');
      console.log('==========================');
      
      groups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.name}`);
        console.log(`   ID: ${group.id._serialized}`);
        console.log(`   Created: ${group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log(`   Participants: ${group.participants ? Object.keys(group.participants).length : 'N/A'}`);
        console.log('');
      });
      
      // Look for the "tickets" group specifically
      const ticketsGroup = groups.find(group => 
        group.name.toLowerCase() === 'tickets' || 
        group.name.toLowerCase().includes('tickets')
      );
      
      if (ticketsGroup) {
        console.log('🎯 Found your "tickets" group!');
        console.log(`   Name: ${ticketsGroup.name}`);
        console.log(`   ID: ${ticketsGroup.id._serialized}`);
      } else {
        console.log('⚠️  "tickets" group not found in the list');
        console.log('   Make sure you are a member of the group and it has recent activity');
      }
    } else {
      console.log('❌ No groups found');
      console.log('   Please create a WhatsApp group named "tickets" and add this account to it');
    }
    
    // Disconnect the client
    await client.destroy();
    console.log('\n👋 Disconnected WhatsApp client');
  } catch (error) {
    console.error('Error fetching groups:', error.message);
    
    // Disconnect the client
    await client.destroy();
    console.log('\n👋 Disconnected WhatsApp client');
  }
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp client authenticated!');
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
});