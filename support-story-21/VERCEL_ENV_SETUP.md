# Vercel Environment Variables Setup

For security reasons, sensitive credentials should be set in the Vercel dashboard rather than in code files.

## Environment Variables to Set in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key

### Email Configuration (Rediff Business)
- `SMTP_USER` - Your Rediff email address (e.g., info@techzontech.com)
- `SMTP_PASS` - Your Rediff email password
- `FROM_EMAIL` - The email address to send from (usually same as SMTP_USER)

### Optional Variables
- `VERCEL_SMTP_HOST` - SMTP host (default: smtp.rediffmailpro.com)
- `VERCEL_SMTP_PORT` - SMTP port (default: 587)
- `VERCEL_SMTP_SECURE` - Whether to use secure connection (default: false)

## Security Notes

- Never commit sensitive credentials to your repository
- The vercel.env file in this repository contains placeholder values only
- All sensitive data should be set through the Vercel dashboard