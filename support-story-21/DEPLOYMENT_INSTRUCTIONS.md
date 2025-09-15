# Ticket System Deployment Instructions

## Environment Variables Setup

To deploy this application successfully to Vercel, you need to set up the following environment variables in your Vercel project settings:

### Backend Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables:

```
SUPABASE_URL=https://bnrnuddotoemwsgvlgbj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucm51ZGRvdG9lbXdzZ3ZsZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjU0MDYsImV4cCI6MjA3MzEwMTQwNn0.bSqfeOf8LkV-4EfJxHjPiScvHy_pMpqmVAQ8vT4UuIQ
FRONTEND_URL=https://ticket-pos.vercel.app
```

### Frontend Environment Variables

Make sure your `.env` file in the frontend contains:

```
VITE_API_URL=https://ticket-pos-backend.vercel.app/api
```

## Deployment Process

1. After setting up the environment variables in Vercel, trigger a new deployment
2. Push your updated code to GitHub (the vercel.json file has been fixed)
3. Vercel will automatically deploy with the correct configuration

## Common Issues and Solutions

### Issue: "Environment Variable references Secret which does not exist"
**Solution**: This error occurs when vercel.json references secrets that haven't been created. We've fixed this by removing the secret references from vercel.json.

### Issue: Database connection failures
**Solution**: Ensure the SUPABASE_URL and SUPABASE_KEY environment variables are correctly set in Vercel.

### Issue: CORS errors between frontend and backend
**Solution**: Ensure FRONTEND_URL is set correctly in Vercel environment variables.

## URLs

- Frontend: https://ticket-pos.vercel.app
- Backend API: https://ticket-pos-backend.vercel.app/api

## Testing Your Deployment

After deployment, you can test these endpoints:
- https://ticket-pos-backend.vercel.app/api/health
- https://ticket-pos-backend.vercel.app/api/tickets
- https://ticket-pos-backend.vercel.app/api/executives

If you see a "Hello World" message or similar, your backend is working correctly.