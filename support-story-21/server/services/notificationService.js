import nodemailer from 'nodemailer';
import { sendToNumber, isClientReady } from '../utils/sendMessage.js';

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
          rejectUnauthorized: false,
          // Allow weaker DH key sizes for compatibility
          minDHSize: 1024
        };
        // Add ciphers that support weaker encryption for older servers
        config.secureOptions = {
          ciphers: 'DEFAULT@SECLEVEL=1'
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
        rejectUnauthorized: false,
        // Allow weaker DH key sizes for compatibility
        minDHSize: 1024
      };
      // Add ciphers that support weaker encryption for older servers
      config.secureOptions = {
        ciphers: 'DEFAULT@SECLEVEL=1'
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

// Send email notification with enhanced error handling
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
    
    // Verify transporter configuration with timeout
    try {
      // Add timeout to verification
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP verification timeout')), 10000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log('SMTP transporter verified successfully');
    } catch (verifyError) {
      console.error('SMTP transporter verification failed:', verifyError);
      // Try to send email anyway if verification fails (sometimes verification fails but sending works)
      console.log('Continuing with email send despite verification failure...');
    }
    
    // Validate required fields
    if (!ticket.email) {
      console.error('No email address provided for ticket:', ticket.ticketNumber);
      return { success: false, error: 'No email address provided for the ticket' };
    }
    
    // Normalize ticket data to handle both snake_case and camelCase field names
    const normalizedTicket = {
      ticketNumber: ticket.ticket_number || ticket.ticketNumber,
      issueRelated: ticket.issue_related || ticket.issueRelated,
      priority: ticket.priority,
      contactPerson: ticket.contact_person || ticket.contactPerson,
      email: ticket.email,
      resolution: ticket.resolution,
      createdAt: ticket.created_at || ticket.createdAt,
      closedAt: ticket.closed_at || ticket.closedAt
    };
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.VERCEL_SMTP_USER || 'support@techzontech.com',
      to: normalizedTicket.email,
      subject: `Your Support Ticket ${normalizedTicket.ticketNumber || 'N/A'} Has Been Resolved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ticket Resolved</h2>
          <p>Dear ${normalizedTicket.contactPerson || 'Customer'},</p>
          
          <p>We're pleased to inform you that your support ticket has been resolved:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details:</h3>
            <p><strong>Ticket Number:</strong> ${normalizedTicket.ticketNumber || 'N/A'}</p>
            <p><strong>Issue Type:</strong> ${normalizedTicket.issueRelated || 'N/A'}</p>
            <p><strong>Priority:</strong> ${normalizedTicket.priority || 'N/A'}</p>
            <p><strong>Created At:</strong> ${normalizedTicket.createdAt ? new Date(normalizedTicket.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</p>
            <p><strong>Closed At:</strong> ${normalizedTicket.closedAt ? new Date(normalizedTicket.closedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Resolution:</h3>
            <p>${normalizedTicket.resolution || 'No resolution details provided.'}</p>
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

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), 15000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
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
    // Normalize ticket data to handle both snake_case and camelCase field names
    const normalizedTicket = {
      ticketNumber: ticket.ticket_number || ticket.ticketNumber,
      contactPerson: ticket.contact_person || ticket.contactPerson,
      mobileNumber: ticket.mobile_number || ticket.mobileNumber,
      resolution: ticket.resolution
    };
    
    // Validate required fields
    if (!normalizedTicket.mobileNumber) {
      console.error('No mobile number provided for ticket:', normalizedTicket.ticketNumber);
      return { success: false, error: 'No mobile number provided for the ticket' };
    }
    
    // Clean and format the mobile number
    let cleanNumber = '';
    try {
      cleanNumber = normalizedTicket.mobileNumber.replace(/\D/g, '');
    } catch (error) {
      console.error('Error cleaning mobile number:', error);
      return { success: false, error: 'Invalid mobile number format' };
    }
    
    if (!cleanNumber || cleanNumber.trim() === '') {
      return { success: false, error: 'Invalid mobile number format' };
    }
    
    // Add country code if not present (assuming UAE/India format)
    // For UAE numbers starting with 05, we need to replace the leading 0 with 971
    let whatsappNumber;
    if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
      // UAE format: 05XXXXXXXX -> 9715XXXXXXXX
      whatsappNumber = `971${cleanNumber.substring(1)}`;
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
      // UAE format: 5XXXXXXXX -> 9715XXXXXXXX
      whatsappNumber = `971${cleanNumber}`;
    } else if (cleanNumber.length === 10) {
      // Other 10-digit formats: add 971 prefix
      whatsappNumber = `971${cleanNumber}`;
    } else {
      // Use as-is for other formats
      whatsappNumber = cleanNumber;
    }
    
    // Create the WhatsApp message
    const resolutionText = normalizedTicket.resolution || 'No resolution details provided.';
    
    // Check if resolution is provided
    if (!normalizedTicket.resolution || normalizedTicket.resolution.trim() === '') {
      console.error('No resolution provided for ticket:', normalizedTicket.ticketNumber);
      return { success: false, error: 'Resolution details are required for WhatsApp message' };
    }
    
    const message = `Hello ${normalizedTicket.contactPerson || 'Customer'}, Your support ticket ${normalizedTicket.ticketNumber || 'N/A'} has been resolved. Resolution Details: ${resolutionText} Thank you for your patience! Techzon Support Team`;
    
    // Generate multiple URLs for better compatibility
    const encodedMessage = encodeURIComponent(message);
    const urls = {
      api: `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`,
      wa: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
      web: `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`
    };
    
    console.log('Generated WhatsApp URLs:', urls);
    return { 
      success: true, 
      urls: urls,
      message: message
    };
  } catch (error) {
    console.error('Error generating WhatsApp message URL:', error);
    return { success: false, error: error.message };
  }
};

// Send WhatsApp notification using whatsapp-web.js with session checking
const sendWhatsAppNotification = async (ticket) => {
  try {
    console.log('Attempting to send WhatsApp notification for ticket:', ticket.ticketNumber);
    
    // Validate required fields
    if (!ticket.mobileNumber) {
      console.error('No mobile number provided for ticket:', ticket.ticketNumber);
      return { success: false, error: 'No mobile number provided for the ticket' };
    }
    
    // Normalize ticket data
    const normalizedTicket = {
      ticketNumber: ticket.ticket_number || ticket.ticketNumber,
      contactPerson: ticket.contact_person || ticket.contactPerson,
      mobileNumber: ticket.mobile_number || ticket.mobileNumber,
      resolution: ticket.resolution
    };
    
    // Create thank-you message
    const message = `Hello ${normalizedTicket.contactPerson || 'Customer'}, Your support ticket ${normalizedTicket.ticketNumber || 'N/A'} has been resolved. Resolution Details: ${normalizedTicket.resolution || 'No resolution details provided.'} Thank you for your patience! Techzon Support Team`;
    
    // Check if WhatsApp client is ready, if not, try to reinitialize
    if (!isClientReady) {
      console.log('WhatsApp client is not ready. Attempting to send via URL instead.');
      // Return success with URL generation as fallback
      return { 
        success: true, 
        message: 'WhatsApp client not ready, using URL generation as fallback',
        fallbackUrls: generateWhatsAppMessageUrl(ticket)
      };
    }
    
    // Send the message
    const result = await sendToNumber(normalizedTicket.mobileNumber, message);
    
    console.log('WhatsApp notification result:', result);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    // Try URL generation as fallback
    try {
      const urlResult = generateWhatsAppMessageUrl(ticket);
      return { 
        success: true, 
        message: 'Direct WhatsApp send failed, using URL generation as fallback',
        fallbackUrls: urlResult
      };
    } catch (urlError) {
      return { success: false, error: error.message };
    }
  }
};

// Send ticket closed notifications (email and WhatsApp)
const sendTicketClosedNotifications = async (ticket) => {
  console.log(`Sending notifications for closed ticket ${ticket.ticket_number || ticket.ticketNumber}`);
  console.log('Full ticket data:', JSON.stringify(ticket, null, 2));
  
  // Validate ticket data
  if (!ticket) {
    console.error('No ticket data provided for notifications');
    return {
      email: { success: false, error: 'No ticket data provided' },
      whatsapp: { success: false, error: 'No ticket data provided' }
    };
  }
  
  // Send email notification
  const emailResult = await sendEmailNotification(ticket);
  console.log('Email result:', emailResult);
  
  // Check if we're running in a Vercel environment
  const isVercel = !!process.env.VERCEL;
  
  let whatsappResult;
  let urlResult;
  
  if (isVercel) {
    // For Vercel deployment, generate WhatsApp URLs instead of sending directly
    console.log('Running in Vercel environment, generating WhatsApp URLs');
    
    // Generate client WhatsApp URL
    try {
      const whatsAppService = await import('../utils/sendMessage.js');
      const formatWhatsAppNumber = (number) => {
        let cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
          cleanNumber = `971${cleanNumber.substring(1)}`;
        } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
          cleanNumber = `971${cleanNumber}`;
        } else if (cleanNumber.length === 10) {
          cleanNumber = `971${cleanNumber}`;
        }
        return cleanNumber;
      };
      
      const phoneNumber = formatWhatsAppNumber(ticket.mobile_number || ticket.mobileNumber);
      const contactPerson = ticket.contact_person || ticket.contactPerson || 'Customer';
      const ticketNumber = ticket.ticket_number || ticket.ticketNumber || 'N/A';
      const resolution = ticket.resolution || 'No resolution details provided.';
      
      const message = `Hello ${contactPerson}, Your support ticket ${ticketNumber} has been resolved. Resolution Details: ${resolution} Thank you for your patience! Techzon Support Team`;
      const encodedMessage = encodeURIComponent(message);
      const clientUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      whatsappResult = { 
        success: true, 
        message: 'WhatsApp URL generated for Vercel deployment',
        url: clientUrl,
        phoneNumber: phoneNumber
      };
      
      // Generate group notification message
      const groupMessage = `
*Ticket Resolved Notification*
============================
Company name  : ${ticket.company_name || ticket.companyName || 'N/A'}
Serial No: ${ticket.serial_number || ticket.serialNumber || 'N/A'}
Version : ${ticket.version || 'N/A'}
Expiry: ${ticket.expiry_date || ticket.expiryDate ? new Date(ticket.expiry_date || ticket.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
Contact Person: ${ticket.contact_person || ticket.contactPerson || 'N/A'}
Contact Number: ${ticket.mobile_number || ticket.mobileNumber || 'N/A'}
Support: ${ticket.issue_related || ticket.issueRelated || 'N/A'}
Start: ${ticket.started_at || ticket.startedAt ? new Date(ticket.started_at || ticket.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Completed: ${ticket.closed_at || ticket.closedAt ? new Date(ticket.closed_at || ticket.closedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
Resolution: ${ticket.resolution || 'No resolution details provided.'}
Assigned Executive: ${ticket.assigned_executive || ticket.assignedExecutive || 'N/A'}
Priority: ${ticket.priority || 'N/A'}
User Type: ${ticket.user_type || ticket.userType || 'N/A'}
Ticket Number: ${ticket.ticket_number || ticket.ticketNumber || 'N/A'}
Email: ${ticket.email || 'N/A'}
Remarks: ${ticket.remarks || 'N/A'}
Completed At: ${ticket.closed_at || ticket.closedAt ? new Date(ticket.closed_at || ticket.closedAt).toLocaleString('en-GB') : 'N/A'}
      `.trim();
      
      urlResult = {
        success: true,
        urls: {
          client: clientUrl,
          group: 'For group messaging, copy the message above and send it manually to your WhatsApp group'
        },
        message: message,
        groupMessage: groupMessage
      };
    } catch (error) {
      console.error('Error generating WhatsApp URLs for Vercel:', error);
      whatsappResult = { success: false, error: error.message };
      urlResult = { success: false, error: error.message };
    }
  } else {
    // For local development, use the existing WhatsApp Web implementation
    console.log('Running in local environment, using WhatsApp Web');
    whatsappResult = await sendWhatsAppNotification(ticket);
    urlResult = generateWhatsAppMessageUrl(ticket);
  }
  
  console.log('WhatsApp result:', whatsappResult);
  console.log('WhatsApp URL result:', urlResult);
  
  return {
    email: emailResult,
    whatsapp: whatsappResult,
    whatsappUrl: urlResult
  };
};

export {
  sendTicketClosedNotifications,
  sendEmailNotification,
  sendWhatsAppNotification,
  generateWhatsAppMessageUrl
};

export default {
  sendTicketClosedNotifications,
  sendEmailNotification,
  sendWhatsAppNotification,
  generateWhatsAppMessageUrl
};