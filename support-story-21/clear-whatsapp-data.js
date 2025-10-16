// Script to clear WhatsApp session data
// Use this when you need to reset the WhatsApp connection

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'server', '.wwebjs_auth');
const cacheDir = path.join(__dirname, 'server', '.wwebjs_cache');

console.log('🗑️  Clearing WhatsApp data...');

// Function to safely remove directory
const removeDir = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed ${dirPath}`);
    } catch (error) {
      console.error(`❌ Error removing ${dirPath}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${dirPath} does not exist`);
  }
};

// Function to safely remove files
const removeFiles = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        fs.unlinkSync(filePath);
        console.log(`✅ Removed ${filePath}`);
      });
    } catch (error) {
      console.error(`❌ Error removing files in ${dirPath}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${dirPath} does not exist`);
  }
};

// Clear session data
console.log('\n📱 Clearing session data...');
removeDir(sessionDir);

// Clear cache data
console.log('\nキャッシング Clearing cache data...');
removeDir(cacheDir);

// Also look for any .data files in the server directory
const serverDir = path.join(__dirname, 'server');
if (fs.existsSync(serverDir)) {
  const files = fs.readdirSync(serverDir);
  files.forEach(file => {
    if (file.endsWith('.data')) {
      const filePath = path.join(serverDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed ${filePath}`);
      } catch (error) {
        console.error(`❌ Error removing ${filePath}:`, error.message);
      }
    }
  });
}

console.log('\n✅ WhatsApp data cleared successfully!');
console.log('🔄 Please restart your server to establish a new WhatsApp connection');