import nodemailer from 'nodemailer';

// Load environment variables with error handling
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  console.log('Dotenv loaded successfully');
} catch (error) {
  console.warn('Dotenv not available, using process.env directly:', error.message);
}

// Create email transporter
const createEmailTransporter = () => {
  console.log('Creating email transporter. Environment check:', {
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
  
  // Check for Vercel-specific environment variables first (when deployed on Vercel)
  if (process.env.VERCEL_ENV) {
    console.log('Running on Vercel, checking Vercel-specific SMTP configuration');
    
    // Check if we have Vercel SMTP configuration
    if (process.env.VERCEL_SMTP_HOST && process.env.VERCEL_SMTP_USER && process.env.VERCEL_SMTP_PASS) {
      const config = {
        host: process.env.VERCEL_SMTP_HOST,
        port: parseInt(process.env.VERCEL_SMTP_PORT) || parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.VERCEL_SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.VERCEL_SMTP_USER,
          pass: process.env.VERCEL_SMTP_PASS
        },
        // Add name property to fix HeloHost issue
        name: 'localhost'
      };
      
      // Add additional configuration for Rediff Business
      if (process.env.VERCEL_SMTP_HOST.includes('rediff')) {
        config.tls = {
          rejectUnauthorized: false
        };
      }
      
      console.log('Using Vercel SMTP configuration:', config);
      return nodemailer.createTransport(config);
    }
    
    // If no Vercel-specific config, fall back to standard config
    console.log('No Vercel-specific SMTP config found, checking standard config');
  }
  
  // Check if we have standard SMTP configuration (for Rediff Business and others)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add name property to fix HeloHost issue
      name: 'localhost'
    };
    
    // Add additional configuration for Rediff Business
    if (process.env.SMTP_HOST.includes('rediff')) {
      config.tls = {
        rejectUnauthorized: false
      };
    }
    
    console.log('Using standard SMTP configuration:', config);
    return nodemailer.createTransport(config);
  }
  
  // Fallback to Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Using Gmail configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Final fallback - log error and return null
  console.error('No valid email configuration found. Please check your environment variables.');
  console.error('Required variables for SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS');
  console.error('Required variables for Gmail: EMAIL_SERVICE=gmail, EMAIL_USER, EMAIL_PASS');
  console.error('Required variables for Vercel SMTP: VERCEL_SMTP_HOST, VERCEL_SMTP_USER, VERCEL_SMTP_PASS');
  return null;
};

// Send email notification
const sendEmailNotification = async (ticket) => {
  try {
    console.log('Attempting to send email notification for ticket:', ticket.ticketNumber);
    console.log('Ticket data:', ticket);
    
    const transporter = createEmailTransporter();
    
    // Check if transporter was created successfully
    if (!transporter) {
      console.error('Failed to create email transporter');
      return { success: false, error: 'Email configuration is missing or invalid. Please check environment variables.' };
    }
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('SMTP transporter verified successfully');
    } catch (verifyError) {
      console.error('SMTP transporter verification failed:', verifyError);
      return { success: false, error: `SMTP verification failed: ${verifyError.message}` };
    }
    
    // Validate required fields
    if (!ticket.email) {
      console.error('No email address provided for ticket:', ticket.ticketNumber);
      return { success: false, error: 'No email address provided for the ticket' };
    }
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.VERCEL_SMTP_USER || 'support@techzontech.com',
      to: ticket.email,
      subject: `Your Support Ticket ${ticket.ticketNumber} Has Been Resolved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ticket Resolved</h2>
          <p>Dear ${ticket.contactPerson || 'Customer'},</p>
          
          <p>We're pleased to inform you that your support ticket has been resolved:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details:</h3>
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber || 'N/A'}</p>
            <p><strong>Issue Type:</strong> ${ticket.issueRelated || 'N/A'}</p>
            <p><strong>Priority:</strong> ${ticket.priority || 'N/A'}</p>
            <p><strong>Created At:</strong> ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}</p>
            <p><strong>Closed At:</strong> ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : 'N/A'}</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Resolution:</h3>
            <p>${ticket.resolution || 'No resolution details provided.'}</p>
          </div>
          
          <p>Thank you for your patience. If you have any further questions or concerns, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>
          Techzon Support Team</p>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Log additional error details
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('Error command:', error.command);
    if (error.response) console.error('Error response:', error.response);
    return { success: false, error: error.message };
  }
};

// Generate WhatsApp message URL (for client-side redirect)
const generateWhatsAppMessageUrl = (ticket) => {
  try {
    // Validate required fields
    if (!ticket.mobileNumber) {
      console.error('No mobile number provided for ticket:', ticket.ticketNumber);
      return { success: false, error: 'No mobile number provided for the ticket' };
    }
    
    // Clean and format the mobile number
    let cleanNumber = '';
    try {
      cleanNumber = ticket.mobileNumber.replace(/\D/g, '');
    } catch (error) {
      console.error('Error cleaning mobile number:', error);
      return { success: false, error: 'Invalid mobile number format' };
    }
    
    if (!cleanNumber || cleanNumber.trim() === '') {
      return { success: false, error: 'Invalid mobile number format' };
    }
    
    // Add country code if not present (assuming UAE/India format)
    const whatsappNumber = cleanNumber.length === 10 ? `971${cleanNumber}` : cleanNumber;
    
    // Create the WhatsApp message
    const resolutionText = ticket.resolution || 'No resolution details provided.';
    const message = `Hello ${ticket.contactPerson || 'Customer'}, Your support ticket ${ticket.ticketNumber || 'N/A'} has been resolved. Resolution Details: ${resolutionText} Thank you for your patience! Techzon Support Team`;
    
    // Properly encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    console.log('Generated WhatsApp URL:', whatsappUrl);
    return { success: true, url: whatsappUrl };
  } catch (error) {
    console.error('Error generating WhatsApp message URL:', error);
    return { success: false, error: error.message };
  }
};

// Send ticket closed notifications (email and WhatsApp URL generation)
const sendTicketClosedNotifications = async (ticket) => {
  console.log(`Sending notifications for closed ticket ${ticket.ticketNumber}`);
  
  // Send email notification
  const emailResult = await sendEmailNotification(ticket);
  console.log('Email result:', emailResult);
  
  // Generate WhatsApp message URL (for client-side redirect)
  const whatsappResult = generateWhatsAppMessageUrl(ticket);
  console.log('WhatsApp result:', whatsappResult);
  
  return {
    email: emailResult,
    whatsapp: whatsappResult
  };
};

export {
  sendTicketClosedNotifications,
  sendEmailNotification,
  generateWhatsAppMessageUrl
};

export default {
  sendTicketClosedNotifications,
  sendEmailNotification,
  generateWhatsAppMessageUrl
};