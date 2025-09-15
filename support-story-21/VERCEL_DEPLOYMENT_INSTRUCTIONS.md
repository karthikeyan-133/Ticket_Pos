# Vercel Deployment Instructions

## Environment Variables Setup

To properly deploy this application to Vercel, you need to set up the following environment variables in your Vercel project settings:

### Backend Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
SUPABASE_URL=https://bnrnuddotoemwsgvlgbj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucm51ZGRvdG9lbXdzZ3ZsZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjU0MDYsImV4cCI6MjA3MzEwMTQwNn0.bSqfeOf8LkV-4EfJxHjPiScvHy_pMpqmVAQ8vT4UuIQ
FRONTEND_URL=https://ticket-pos.vercel.app
```

### Frontend Environment Variables

For the frontend, make sure you have the following in your `.env` file:

```
VITE_API_URL=https://ticket-pos-backend.vercel.app/api
```

## Deployment Steps

1. After setting up the environment variables, redeploy your application
2. Vercel will automatically pick up the environment variables during the build process
3. The application should now be able to connect to the Supabase database

## Troubleshooting

If you still encounter issues:

1. Check that all environment variables are correctly set in Vercel
2. Verify that the Supabase credentials are correct
3. Check the deployment logs for any error messages
4. Make sure there are no typos in the environment variable names

## Security Note

For production deployments, it's recommended to use Vercel's secret management feature:
- Instead of plain text values, you can create secrets in Vercel and reference them
- To create a secret: `vercel secrets add supabase-url "your-supabase-url"`
- Then reference it in your vercel.json: `"SUPABASE_URL": "@supabase-url"`