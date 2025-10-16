# Vercel Deployment Guide

This guide explains how to deploy your ticket system to Vercel with real database connectivity and WhatsApp notifications.

## Prerequisites

1. A Vercel account
2. A Supabase account with a configured database
3. Email SMTP credentials
4. WhatsApp Business API access (for production use)

## Environment Variables Setup

Create the following environment variables in your Vercel project settings:

### Database Configuration
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### Email Configuration
```
VERCEL_SMTP_HOST=smtp.rediffmailpro.com
VERCEL_SMTP_PORT=587
VERCEL_SMTP_USER=your_email@techzontech.com
VERCEL_SMTP_PASS=your_email_password
VERCEL_SMTP_SECURE=false
```

### API Security
```
API_KEY=your_secret_api_key
```

### WhatsApp Configuration
```
WHATSAPP_GROUP_NAME=tickets
WHATSAPP_GROUP_ID=120363402679779546@g.us
```

### CORS Configuration
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Database Setup

1. Create a Supabase project
2. Create a `tickets` table with the following schema:

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE,
  serial_number VARCHAR(20),
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  mobile_number VARCHAR(20),
  email VARCHAR(255),
  issue_related VARCHAR(50),
  priority VARCHAR(20),
  assigned_executive VARCHAR(255),
  status VARCHAR(20),
  user_type VARCHAR(20),
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  resolution TEXT,
  remarks TEXT,
  version VARCHAR(20),
  started_at TIMESTAMP
);
```

3. Create indexes for better performance:
```sql
CREATE INDEX idx_tickets_serial_number ON tickets(serial_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
```

## Deployment Steps

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set the environment variables in Vercel project settings
4. Deploy the project

## API Endpoints

After deployment, your API will be available at:
- Tickets: `https://your-project.vercel.app/api/tickets`
- Executives: `https://your-project.vercel.app/api/executives`
- Sales: `https://your-project.vercel.app/api/sales`
- WhatsApp Notifications: `https://your-project.vercel.app/api/notify-ticket`

## WhatsApp Notifications on Vercel

Due to Vercel's serverless nature, persistent WhatsApp sessions are not possible. The WhatsApp notification system on Vercel:

1. Generates WhatsApp URLs for client notifications
2. Prepares group messages for manual sending
3. Does not maintain persistent WhatsApp Web sessions

For production use with automated WhatsApp notifications, consider:
1. Using WhatsApp Business API
2. Deploying the WhatsApp service on a dedicated server with persistent sessions
3. Using a third-party WhatsApp notification service

## Testing WhatsApp Notifications

To test WhatsApp notifications on Vercel:

1. Make a POST request to `/api/notify-ticket` with the following data:

```json
{
  "success": true,
  "data": [
    {
      "id": "ticket-id-from-database",
      "groupName": "tickets",
      "groupId": "120363402679779546@g.us",
      "apiKey": "your_secret_api_key"
    }
  ],
  "apiKey": "your_secret_api_key"
}
```

2. The response will include WhatsApp URLs for manual sending

## Monitoring and Troubleshooting

1. Check Vercel logs for any errors
2. Verify environment variables are correctly set
3. Test database connectivity with the `/api/health` endpoint
4. Test email configuration with the `/api/test-email-config` endpoint

## Security Considerations

1. Always use strong API keys
2. Restrict CORS origins to trusted domains
3. Use HTTPS for all communications
4. Regularly rotate sensitive credentials
5. Monitor API usage for unusual activity

## Scaling Considerations

1. Vercel's serverless functions automatically scale
2. For high-traffic applications, consider:
   - Database connection pooling
   - Caching frequently accessed data
   - Using a CDN for static assets
   - Implementing rate limiting

## Updating Your Application

To update your deployed application:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy the changes
3. For environment variable changes, update them in Vercel project settings