# Vercel Environment Variables Setup Guide

## Required Environment Variables for Production

You need to set these environment variables in your Vercel project dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database_name?schema=public
```

### 2. JWT Configuration
```
JWT_ACCESS_SECRET=your-super-secret-access-key-here-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Application Configuration
```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://collabotree-spz8.vercel.app
BCRYPT_ROUNDS=12
```

### 4. Frontend Configuration
```
VITE_API_URL=https://collabotree-spz8.vercel.app/api
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (collabotree-spz8)
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for "Production" environment
6. Redeploy your project

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to DATABASE_URL

### Option 2: External Database
- Use services like:
  - Supabase (free tier available)
  - Railway
  - Neon
  - PlanetScale

## After Setting Environment Variables

1. Commit and push these changes
2. Redeploy on Vercel
3. The backend should now connect to the database
4. The frontend should connect to the backend API

## Testing

Once deployed, test these endpoints:
- `https://collabotree-spz8.vercel.app/api/health` (if available)
- `https://collabotree-spz8.vercel.app/api/public/services`
- Frontend should load without CORS errors
