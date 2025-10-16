// Test script for email configuration
// This helps verify that your SMTP settings are working correctly

import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

console.log('📧 Testing email configuration...');

// Log environment variables (without sensitive data)
console.log('Environment check:', {
  VERCEL_ENV: process.env.VERCEL_ENV,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  hasSMTPUser: !!process.env.SMTP_USER,
  hasSMTPPass: !!process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  VERCEL_SMTP_HOST: process.env.VERCEL_SMTP_HOST,
  hasVERCELSMTPUser: !!process.env.VERCEL_SMTP_USER,
  hasVERCELSMTPPass: !!process.env.VERCEL_SMTP_PASS
});

// Create transporter with enhanced SSL/TLS configuration
const createTransporter = () => {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL_ENV === 'production';
  
  if (isVercel && process.env.VERCEL_SMTP_HOST) {
    // Use Vercel SMTP configuration
    return nodemailer.createTransport({
      host: process.env.VERCEL_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.VERCEL_SMTP_USER,
        pass: process.env.VERCEL_SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'DEFAULT@SECLEVEL=1'
      }
    });
  } else if (process.env.SMTP_HOST) {
    // Use standard SMTP configuration with enhanced SSL settings
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.FROM_EMAIL,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'DEFAULT@SECLEVEL=1',
        minVersion: 'TLSv1'
      },
      secureOptions: {
        ciphers: 'DEFAULT@SECLEVEL=1'
      }
    });
  } else {
    // Fallback configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

try {
  const transporter = createTransporter();
  console.log('✅ Transporter created successfully');
  
  // Test verification
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Transporter verification failed:', error.message);
      console.log('This might be due to SSL/TLS configuration issues');
    } else {
      console.log('✅ Transporter verification successful');
    }
  });
} catch (error) {
  console.error('❌ Error creating transporter:', error.message);
}