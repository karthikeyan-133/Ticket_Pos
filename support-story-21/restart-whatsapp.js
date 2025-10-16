// Script to restart WhatsApp service
// This script will clear the WhatsApp session and restart the service
// Handles file locking issues that commonly occur on Windows

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to WhatsApp session directory
const sessionPath = path.join(__dirname, 'server', '.wwebjs_auth');

console.log('Restarting WhatsApp service...');

// Function to remove directory recursively with retry logic for locked files
const removeDir = async (dirPath, maxRetries = 3) => {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}...`);
    
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        // Try to remove the directory
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`Successfully removed ${dirPath}`);
        return true;
      } catch (error) {
        console.warn(`Attempt ${retry + 1} failed to remove ${dirPath}: ${error.message}`);
        
        if (retry < maxRetries - 1) {
          // Wait before retrying
          console.log('Waiting 2 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error(`Failed to remove ${dirPath} after ${maxRetries} attempts`);
          return false;
        }
      }
    }
  } else {
    console.log(`${dirPath} not found.`);
    return true;
  }
};

// Function to force kill any Chrome processes that might be locking files
const killChromeProcesses = () => {
  try {
    console.log('Attempting to kill Chrome processes that might be locking files...');
    // This is a Windows-specific command
    const { execSync } = require('child_process');
    execSync('taskkill /F /IM chrome.exe /T 2>nul', { stdio: 'ignore' });
    console.log('Chrome processes terminated (if any were running)');
  } catch (error) {
    console.log('No Chrome processes found or unable to terminate them');
  }
};

// Main restart function
const main = async () => {
  console.log('Starting WhatsApp service restart...');
  
  // First, try to kill any Chrome processes that might be locking files
  killChromeProcesses();
  
  // Wait a moment for processes to terminate
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Remove the session directory to force re-authentication
  if (fs.existsSync(sessionPath)) {
    console.log('Removing existing WhatsApp session...');
    const success = await removeDir(sessionPath);
    if (success) {
      console.log('WhatsApp session removed successfully.');
    } else {
      console.error('Failed to remove WhatsApp session. You may need to manually delete the directory.');
    }
  } else {
    console.log('No existing WhatsApp session found.');
  }

  console.log('Please restart the server to reinitialize WhatsApp service.');
  console.log('After restarting, scan the QR code with your WhatsApp mobile app.');
};

main().catch(error => {
  console.error('Error during restart:', error);
  process.exit(1);
});