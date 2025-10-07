# 🚀 Vercel Deployment Guide for Collabotree

## Overview
This guide will help you deploy your Collabotree application to Vercel with a database connection. Since you have a monorepo with both frontend and backend, we'll deploy them as separate Vercel projects.

## Prerequisites
- GitHub repository with your code
- Vercel account (free at [vercel.com](https://vercel.com))
- Database (we'll use Vercel Postgres or external database)

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Click on "Storage" tab
3. Click "Create Database" → "Postgres"
4. Name it `collabotree-db`
5. Copy the connection string

### Option B: External Database (Supabase/PlanetScale)
- Use your existing database connection string

## Step 2: Deploy Backend to Vercel

### 2.1 Create Backend Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2.2 Backend Environment Variables
Add these environment variables in Vercel dashboard:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_connection_string
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
JWT_ACCESS_SECRET=your_64_character_secret
JWT_REFRESH_SECRET=your_64_character_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.3 Backend Configuration Files

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Frontend Project
1. Create another Vercel project
2. Import the same GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.2 Frontend Environment Variables
```
VITE_API_URL=https://your-backend-domain.vercel.app
```

### 3.3 Frontend Configuration Files

Create `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Step 4: Update API Configuration

Update `client/src/lib/api.ts` to use environment variables:

```typescript
const getApiBaseUrl = () => {
  // Use environment variable in production
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback for development
  return 'http://localhost:4000/api';
};
```

## Step 5: Database Migration

### 5.1 Add Migration Script
Add to `backend/package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm run prisma:generate && npm run build",
    "prisma:generate": "prisma generate",
    "prisma:deploy": "prisma migrate deploy"
  }
}
```

### 5.2 Update Vercel Build Command
Change backend build command to: `npm run vercel-build`

## Step 6: Deploy and Test

### 6.1 Deploy Backend
1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Note the backend URL (e.g., `https://collabotree-backend.vercel.app`)

### 6.2 Deploy Frontend
1. Update `VITE_API_URL` with your backend URL
2. Deploy frontend
3. Update backend `CLIENT_ORIGIN` with frontend URL

### 6.3 Run Database Migration
```bash
# In your backend directory
npx prisma migrate deploy
```

## Step 7: Domain Configuration (Optional)

### 7.1 Custom Domains
- Add custom domains in Vercel dashboard
- Update environment variables accordingly

### 7.2 SSL Certificates
- Vercel automatically provides SSL certificates
- No additional configuration needed

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
CLIENT_ORIGIN=https://your-frontend.vercel.app
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app
```

## Troubleshooting

### Common Issues:
1. **Build Failures:** Check build logs in Vercel dashboard
2. **Database Connection:** Verify DATABASE_URL format
3. **CORS Issues:** Update CLIENT_ORIGIN in backend
4. **API Calls:** Check VITE_API_URL in frontend

### Debug Commands:
```bash
# Check build locally
npm run build

# Test database connection
npx prisma db push

# Check environment variables
vercel env ls
```

## Cost Estimation

### Vercel Free Tier:
- **Frontend:** Free (100GB bandwidth)
- **Backend:** Free (100GB bandwidth, 1000 serverless function invocations)
- **Database:** Vercel Postgres free tier (1GB storage)

### Paid Options:
- **Pro Plan:** $20/month (unlimited bandwidth)
- **Database:** $20/month (8GB storage)

## Your Live URLs:
- **Frontend:** `https://your-frontend.vercel.app`
- **Backend:** `https://your-backend.vercel.app`
- **Database:** Managed by Vercel

## Next Steps:
1. Set up monitoring and analytics
2. Configure custom domains
3. Set up CI/CD for automatic deployments
4. Add error tracking (Sentry)
5. Set up backup strategies for database
