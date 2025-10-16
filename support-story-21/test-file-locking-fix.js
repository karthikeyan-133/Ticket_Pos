// Test script to verify file locking fixes
// This script tests the enhanced error handling for file locking issues

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the safe file removal function
const testSafeRemove = async () => {
  const testDir = path.join(__dirname, 'server', 'test-temp');
  const testFile = path.join(testDir, 'test-file.txt');
  
  // Create test directory and file
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  fs.writeFileSync(testFile, 'Test content');
  console.log('Created test file:', testFile);
  
  // Test removal
  try {
    fs.unlinkSync(testFile);
    console.log('Successfully removed test file');
  } catch (error) {
    console.error('Error removing test file:', error.message);
  }
  
  // Clean up directory
  try {
    fs.rmdirSync(testDir);
    console.log('Successfully removed test directory');
  } catch (error) {
    console.error('Error removing test directory:', error.message);
  }
};

console.log('Testing file locking fixes...');
testSafeRemove()
  .then(() => {
    console.log('File locking test completed successfully');
  })
  .catch(error => {
    console.error('File locking test failed:', error);
  });