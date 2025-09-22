# Vercel Email Configuration Setup

This guide explains how to configure email sending functionality for the ticket system when deployed on Vercel.

## Issue Summary

Email notifications work locally but not on Vercel deployment because environment variables are not properly configured in the Vercel environment.

## Solution

To fix email notifications on Vercel, you need to set the appropriate environment variables in your Vercel project settings.

## Environment Variables Required

### Option 1: Standard SMTP Configuration (Recommended)
Set these environment variables in your Vercel project:

```
VERCEL_SMTP_HOST=your_smtp_host (e.g., smtp.rediffmailpro.com)
VERCEL_SMTP_PORT=587
VERCEL_SMTP_SECURE=false
VERCEL_SMTP_USER=your_email@example.com
VERCEL_SMTP_PASS=your_email_password
FROM_EMAIL=your_email@example.com
```

### Option 2: Gmail Configuration
Set these environment variables in your Vercel project:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
FROM_EMAIL=your_gmail_address@gmail.com
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add the required environment variables as shown above
6. Redeploy your application

## Testing Email Configuration

After setting the environment variables, you can test the email configuration using the API endpoint:

```
GET https://your-vercel-app.vercel.app/api/test-email-config
```

This will return the current email configuration status.

You can also send a test email using:

```
POST https://your-vercel-app.vercel.app/api/test-email-send
```

With a JSON body like:
```json
{
  "toEmail": "recipient@example.com",
  "subject": "Test Email",
  "message": "This is a test email"
}
```

## Common Issues and Solutions

### 1. Gmail Authentication Issues
If using Gmail, you must use an App Password instead of your regular password:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password in your Google Account settings
3. Use the App Password instead of your regular password

### 2. SMTP Provider Specific Settings
Some SMTP providers require specific settings:

For Rediff Business:
```
VERCEL_SMTP_HOST=smtp.rediffmailpro.com
VERCEL_SMTP_PORT=587
VERCEL_SMTP_SECURE=false
```

For other providers, check their documentation for the correct SMTP settings.

## Verification

After deployment, you can verify the email configuration is working by:
1. Creating a ticket
2. Closing the ticket
3. Checking if an email notification is sent to the customer

If emails are still not working, check the Vercel function logs for error messages.