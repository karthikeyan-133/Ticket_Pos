# Vercel Email Setup Instructions

This document provides instructions for setting up email notifications in your Vercel deployment.

## Issue
Email notifications are not working in Vercel because the required environment variables are not properly configured.

## Solution
You need to set the Vercel environment variables for email notifications to work properly.

## Required Environment Variables

### For Rediff Business SMTP (as shown in your vercel.env file):

1. `VERCEL_SMTP_HOST` = smtp.rediffmailpro.com
2. `VERCEL_SMTP_PORT` = 587
3. `VERCEL_SMTP_USER` = your-email@techzontech.com
4. `VERCEL_SMTP_PASS` = your-email-password
5. `VERCEL_SMTP_SECURE` = false
6. `FROM_EMAIL` = info@techzontech.com

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each of the required variables listed above

## Alternative: Using Gmail

If you prefer to use Gmail instead of Rediff Business:

1. `EMAIL_SERVICE` = gmail
2. `EMAIL_USER` = your-gmail-address@gmail.com
3. `EMAIL_PASS` = your-gmail-app-password (not your regular password)
4. `FROM_EMAIL` = your-gmail-address@gmail.com

Note: For Gmail, you need to use an App Password, not your regular Gmail password. 
To generate an App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to your Google Account settings
3. Navigate to Security > 2-Step Verification > App passwords
4. Generate a new App password for "Mail"

## Verification

After setting up the environment variables:
1. Deploy your project again
2. Close a ticket to test email notifications
3. Check the Vercel function logs for any error messages

## Troubleshooting

If emails still don't work, check the Vercel function logs for:
1. "No valid email configuration found" - Environment variables are missing
2. "SMTP verification failed" - Incorrect credentials or network issues
3. "Email sending timeout" - Network connectivity issues

## Security Note

Never commit sensitive information like email passwords to your repository. Always use environment variables for sensitive data.