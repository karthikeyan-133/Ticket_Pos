# Vercel Deployment Fix for Timeout Issues

## Problem
The application is experiencing timeout errors when fetching sales data:
```
Error fetching sales: Error: Request timeout: The server took too long to respond
```

## Root Causes
1. Missing Supabase environment variables in Vercel deployment
2. Inconsistent API implementation between sales and other services

## Solution Implemented
1. Refactored sales API to use axios (like ticket API) for better timeout handling
2. Removed custom timeout logic from backend routes
3. Improved error handling and logging

## Required Environment Variables

You MUST add these environment variables to your Vercel project:

### Backend Environment Variables
Go to your Vercel project dashboard → Settings → Environment Variables and add:

```
SUPABASE_URL=https://bnrnuddotoemwsgvlgbj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucm51ZGRvdG9lbXdzZ3ZsZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjU0MDYsImV4cCI6MjA3MzEwMTQwNn0.bSqfeOf8LkV-4EfJxHjPiScvHy_pMpqmVAQ8vT4UuIQ
FRONTEND_URL=https://ticket-pos.vercel.app
```

### Frontend Environment Variables
For the frontend, make sure you have the following in your `.env` file:

```
VITE_API_BASE_URL=
```

Note: For Vercel deployments, `VITE_API_BASE_URL` should be empty so that the frontend makes requests to the same domain.

## Deployment Steps

1. Add the environment variables to your Vercel project as described above
2. Redeploy your application from the Vercel dashboard
3. Vercel will automatically pick up the environment variables during the build process
4. The application should now be able to connect to the Supabase database

## Testing

After deployment, you can test the API endpoints directly by visiting:
- `https://ticket-pos.vercel.app/api/health` - General API health check
- `https://ticket-pos.vercel.app/api/sales/health` - Sales API health check
- `https://ticket-pos.vercel.app/api/test` - Basic connectivity test

## Troubleshooting

If you still encounter issues:

1. Check that all environment variables are correctly set in Vercel
2. Verify that the Supabase credentials are correct
3. Check the deployment logs for any error messages
4. Make sure there are no typos in the environment variable names
5. Test the API endpoints directly using the diagnostic URLs above

The timeout error was occurring because:
- The application was trying to connect to a database that wasn't properly configured
- The custom timeout implementation in the sales API was not working correctly
- The inconsistent API implementation between services was causing reliability issues

With these fixes, the timeout issues should be resolved.