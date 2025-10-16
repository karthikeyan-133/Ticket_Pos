// Test script to verify repository structure
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying repository structure...\n');

const requiredFiles = [
  'package.json',
  'server/package.json',
  'api/index.js',
  'server/server.js',
  'README.md',
  'WHATSAPP_INTEGRATION.md',
  'VERCEL_DEPLOYMENT.md',
  '.env.example',
  'vercel.json'
];

const requiredDirs = [
  'src',
  'server',
  'api',
  'server/utils',
  'server/models',
  'server/routes',
  'server/services',
  'server/config'
];

let allPresent = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allPresent = false;
  }
});

console.log('\n📁 Checking required directories:');
requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    allPresent = false;
  }
});

console.log('\n📝 Summary:');
if (allPresent) {
  console.log('✅ Repository structure is complete and ready for deployment!');
  console.log('You can now push to GitHub and deploy to Vercel.');
} else {
  console.log('❌ Some required files or directories are missing.');
  console.log('Please ensure all required files are present before deployment.');
}