import dotenv from 'dotenv';
dotenv.config();

console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);