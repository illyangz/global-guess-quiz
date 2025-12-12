# Railway Setup Guide

This guide will help you deploy your Global Guess Quiz app to Railway with a PostgreSQL database.

## Prerequisites

- A GitHub account
- A Railway account (sign up at [railway.app](https://railway.app))

## Step 1: Push Your Code to GitHub

```bash
# Initialize git if you haven't already
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Global Guess Quiz"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/global-guess-quiz.git
git branch -M main
git push -u origin main
```

## Step 2: Create a New Project on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if you haven't already
5. Select your `global-guess-quiz` repository

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database and set the `DATABASE_URL` environment variable

## Step 4: Initialize the Database

Once your app is deployed:

1. Go to your project in Railway
2. Click on your web service
3. Go to the "Settings" tab
4. Scroll down to "Deploy Triggers"
5. Add a "One-time Command" or use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run the database initialization script
railway run psql $DATABASE_URL -f scripts/init-db.sql
```

Alternatively, you can run the SQL script directly in Railway's PostgreSQL console:

1. Click on your PostgreSQL service in Railway
2. Go to the "Data" tab
3. Click "Query"
4. Copy and paste the contents of `scripts/init-db.sql`
5. Click "Execute"

## Step 5: Verify Deployment

1. Your app should now be live at the URL provided by Railway (e.g., `your-app.up.railway.app`)
2. Test the quiz and verify that scores are being saved
3. Check the leaderboard to confirm database connectivity

## Environment Variables

Railway automatically sets these variables:

- `DATABASE_URL` - PostgreSQL connection string (set automatically when you add PostgreSQL)
- `NODE_ENV` - Set to "production" in Railway

## Updating Your App

After pushing changes to GitHub:

```bash
git add .
git commit -m "Your commit message"
git push
```

Railway will automatically detect the changes and redeploy your app.

## Troubleshooting

### Database Connection Issues

If you see errors about database connections:

1. Check that the PostgreSQL service is running in Railway
2. Verify that `DATABASE_URL` is set in your environment variables
3. Check the logs in Railway's "Deployments" tab

### Migration Issues

If you need to reset the database:

```bash
# Connect to your database
railway run psql $DATABASE_URL

# Drop and recreate the table
DROP TABLE IF EXISTS scores;

# Then run the init script again
\i scripts/init-db.sql
```

## Local Development

To test locally with a PostgreSQL database:

1. Install PostgreSQL on your machine
2. Create a database: `createdb global_guess_quiz`
3. Copy `.env.local.example` to `.env.local`
4. Update the `DATABASE_URL` with your local credentials
5. Run the init script: `psql -d global_guess_quiz -f scripts/init-db.sql`
6. Start your dev server: `npm run dev`

## Support

For issues with Railway, check their [documentation](https://docs.railway.app) or join their [Discord community](https://discord.gg/railway).
