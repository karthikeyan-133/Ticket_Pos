import nodemailer from 'nodemailer';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create email transporter
const createEmailTransporter = () => {
  console.log('Creating email transporter with config:', {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    hasSMTPUser: !!process.env.SMTP_USER,
    hasSMTPPass: !!process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL
  });
  
  // Check if we have SMTP configuration (for Rediff Business and others)
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
    
    console.log('Using SMTP configuration:', config);
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
  
  // Final fallback
  console.log('Using fallback configuration');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@example.com',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-password'
    }
  });
};

// Send email notification
const sendEmailNotification = async (ticket) => {
  try {
    console.log('Attempting to send email notification for ticket:', ticket.ticketNumber);
    console.log('Ticket data:', ticket);
    const transporter = createEmailTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER || 'support@techzontech.com',
      to: ticket.email,
      subject: `Your Support Ticket ${ticket.ticketNumber} Has Been Resolved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ticket Resolved</h2>
          <p>Dear ${ticket.contactPerson},</p>
          
          <p>We're pleased to inform you that your support ticket has been resolved:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details:</h3>
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Issue Type:</strong> ${ticket.issueRelated}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
            <p><strong>Closed At:</strong> ${new Date(ticket.closedAt).toLocaleString()}</p>
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

// Send ticket closed notifications (email only, no Twilio)
const sendTicketClosedNotifications = async (ticket) => {
  console.log(`Sending notifications for closed ticket ${ticket.ticketNumber}`);
  
  // Send email notification
  const emailResult = await sendEmailNotification(ticket);
  console.log('Email result:', emailResult);
  
  return {
    email: emailResult
  };
};

export {
  sendTicketClosedNotifications,
  sendEmailNotification
};

export default {
  sendTicketClosedNotifications,
  sendEmailNotification
};