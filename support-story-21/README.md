# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3aa8a1a8-00d7-45e5-b495-bd2e4cb882a1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3aa8a1a8-00d7-45e5-b495-bd2e4cb882a1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

- Ticket Management System
- Executive Management
- Sales Enquiry Tracking
- Dashboard Analytics
- API Integration

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3aa8a1a8-00d7-45e5-b495-bd2e4cb882a1) and click on Share -> Publish.

## Vercel Deployment Instructions

### Environment Variables Setup

To properly deploy this application to Vercel, you need to set up the following environment variables in your Vercel project settings:

#### Backend Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
SUPABASE_URL=https://bnrnuddotoemwsgvlgbj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucm51ZGRvdG9lbXdzZ3ZsZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjU0MDYsImV4cCI6MjA3MzEwMTQwNn0.bSqfeOf8LkV-4EfJxHjPiScvHy_pMpqmVAQ8vT4UuIQ
FRONTEND_URL=https://ticket-pos.vercel.app
```

#### Frontend Environment Variables

For the frontend, make sure you have the following in your `.env` file:

```
VITE_API_URL=https://ticket-pos-backend.vercel.app/api
```

### Deployment Steps

1. After setting up the environment variables, redeploy your application
2. Vercel will automatically pick up the environment variables during the build process
3. The application should now be able to connect to the Supabase database

### Troubleshooting

If you still encounter issues:

1. Check that all environment variables are correctly set in Vercel
2. Verify that the Supabase credentials are correct
3. Check the deployment logs for any error messages
4. Make sure there are no typos in the environment variable names

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)