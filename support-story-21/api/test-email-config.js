// Test endpoint to check email configuration
const testEmailConfig = async (req, res) => {
  const { method } = req;
  
  if (method === 'GET') {
    // Return the email configuration (without sensitive data)
    res.status(200).json({
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      hasSMTPUser: !!process.env.SMTP_USER,
      hasSMTPPass: !!process.env.SMTP_PASS,
      FROM_EMAIL: process.env.FROM_EMAIL,
      message: 'Email configuration loaded successfully'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default testEmailConfig;