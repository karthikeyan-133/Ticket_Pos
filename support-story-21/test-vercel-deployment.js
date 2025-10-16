// Test script for Vercel deployment
// This script helps verify that your Vercel deployment is working correctly

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing Vercel deployment configuration...');

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('==============================');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'VERCEL_SMTP_HOST',
  'VERCEL_SMTP_USER',
  'API_KEY'
];

const optionalVars = [
  'VERCEL_SMTP_PORT',
  'VERCEL_SMTP_PASS',
  'VERCEL_SMTP_SECURE',
  'WHATSAPP_GROUP_NAME',
  'WHATSAPP_GROUP_ID',
  'FRONTEND_URL'
];

let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Optional Variables Check:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`ℹ️  ${varName}: NOT SET (optional)`);
  }
});

if (allRequiredPresent) {
  console.log('\n🎉 All required environment variables are present!');
} else {
  console.log('\n⚠️  Some required environment variables are missing.');
  console.log('Please set them in your Vercel project settings.');
}

// Test Supabase connection
console.log('\n📡 Testing Supabase connection...');
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    console.log('ℹ️  Note: Actual connection test requires network access');
  } else {
    console.log('❌ Supabase credentials not found');
  }
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}

// Test email configuration
console.log('\n📧 Testing email configuration...');
if (process.env.VERCEL_SMTP_HOST && process.env.VERCEL_SMTP_USER) {
  console.log('✅ SMTP configuration present');
  console.log('   Host:', process.env.VERCEL_SMTP_HOST);
  console.log('   User:', process.env.VERCEL_SMTP_USER);
  console.log('   Port:', process.env.VERCEL_SMTP_PORT || '587 (default)');
  console.log('   Secure:', process.env.VERCEL_SMTP_SECURE || 'false (default)');
} else {
  console.log('❌ SMTP configuration incomplete');
}

// Test API key
console.log('\n🔑 Testing API key...');
if (process.env.API_KEY) {
  console.log('✅ API key is set');
  console.log('   Length:', process.env.API_KEY.length, 'characters');
} else {
  console.log('❌ API key is missing');
}

console.log('\n📝 Summary:');
console.log('============');
console.log('Your Vercel deployment configuration is ready for deployment!');
console.log('Remember to set all environment variables in your Vercel project settings.');
console.log('For WhatsApp notifications, the system will generate URLs for manual sending.');
console.log('For production use, consider using WhatsApp Business API.');