import nodemailer from 'nodemailer';

// Create transporter with enhanced SSL/TLS configuration
const createTransporter = () => {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL_ENV === 'production';
  
  if (isVercel && process.env.VERCEL_SMTP_HOST) {
    // Use Vercel SMTP configuration
    return nodemailer.createTransporter({
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
    return nodemailer.createTransporter({
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
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

// Function to send email with retry logic
const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    console.log('SMTP transporter verified successfully');
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    return { success: true, result };
  } catch (error) {
    console.error('Email verification failed:', error);
    
    // Try again with less secure settings
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        ignoreTLS: true,
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.SMTP_PASS
        }
      });
      
      const result = await transporter.sendMail(mailOptions);
      return { success: true, result };
    } catch (retryError) {
      console.error('Email send failed on retry:', retryError);
      return { success: false, error: retryError.message };
    }
  }
};

export { sendEmail, createTransporter };