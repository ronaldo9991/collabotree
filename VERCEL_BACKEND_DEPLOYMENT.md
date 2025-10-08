# Vercel Backend Deployment Guide

## Current Issues and Solutions

### Issue 1: Rate Limit Exceeded (100 deployments/day)
**Error:** `Resource is limited - try again in 2 hours (more than 100, code: "api-deployments-free-per-day")`

**Solution:** 
- Wait 2 hours before attempting another deployment
- Consider upgrading to Vercel Pro if you need more deployments
- Reduce deployment frequency by testing locally first

### Issue 2: 404 NOT_FOUND
**Error:** `404: NOT_FOUND Code: NOT_FOUND ID: dxb1::x2r9v-1759935442905-52e6d7e27d8a`

**Solution:** The configuration files have been fixed:
- Added `vercel.json` with proper routing
- Updated `api/index.js` to use compiled dist files
- Added `.vercelignore` to exclude source files

## Prerequisites

1. **Build the Backend First:**
   ```bash
   cd backend
   npm run build
   ```

2. **Ensure Environment Variables Are Set in Vercel:**
   Go to your Vercel project → Settings → Environment Variables and add:
   - `NODE_ENV=production`
   - `DATABASE_URL=your-postgresql-url` (use a hosted PostgreSQL like Neon, Supabase, or Vercel Postgres)
   - `JWT_ACCESS_SECRET=your-secure-secret-32-chars-minimum`
   - `JWT_REFRESH_SECRET=your-another-secure-secret-32-chars`
   - `JWT_ACCESS_EXPIRES_IN=15m`
   - `JWT_REFRESH_EXPIRES_IN=7d`
   - `BCRYPT_ROUNDS=12`
   - `CLIENT_ORIGIN=https://your-frontend-url.vercel.app`

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to Backend Directory:**
   ```bash
   cd backend
   ```

4. **Build the Project:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub** (ensure the changes are committed)
   
2. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   
3. **Configure Project:**
   - Root Directory: `backend`
   - Build Command: `npm run vercel-build`
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Add Environment Variables** (see Prerequisites section above)

5. **Deploy** - Vercel will automatically deploy

## Database Setup

### Using Vercel Postgres (Recommended)

1. In your Vercel project dashboard:
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a region close to your users

2. Vercel will automatically add the `DATABASE_URL` environment variable

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Alternative: External PostgreSQL (Neon, Supabase, Railway)

1. Create a PostgreSQL database on your preferred platform
2. Copy the connection string
3. Add it as `DATABASE_URL` in Vercel environment variables
4. Run migrations using Prisma

## Post-Deployment

1. **Run Database Migrations:**
   ```bash
   # From backend directory
   npx prisma migrate deploy
   ```

2. **Test Your API:**
   ```bash
   curl https://your-backend-url.vercel.app/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-08T...",
     "environment": "production",
     "version": "1.0.0"
   }
   ```

3. **Update Frontend Environment Variable:**
   - Update your frontend's `VITE_API_URL` to point to your Vercel backend URL
   - Redeploy the frontend

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` exists in the backend directory
- Check that `dist` folder contains compiled JavaScript
- Verify `api/index.js` is present

### CORS Errors
- Add your frontend URL to `CLIENT_ORIGIN` environment variable
- Check that CORS headers are properly set in `api/index.js`

### Database Connection Errors
- Verify `DATABASE_URL` is correctly set in Vercel
- Ensure PostgreSQL database is accessible from Vercel's servers
- Check that migrations have been run

### Rate Limit Errors
- Wait for the cooldown period (2 hours for free tier)
- Consider upgrading to Vercel Pro for higher limits
- Deploy less frequently by testing locally first

### Environment Variable Issues
- Ensure all required variables are set in Vercel dashboard
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Important Files

- `vercel.json` - Vercel configuration (routes all requests to api/index.js)
- `api/index.js` - Serverless function entry point
- `.vercelignore` - Files to exclude from deployment
- `dist/` - Compiled TypeScript code (must be built before deployment)

## Limits on Vercel Free Tier

- 100 deployments per day
- 100 GB bandwidth per month
- Serverless function timeout: 10 seconds
- 12 serverless functions per deployment

## Recommendations

1. **Use a Production Database:** Don't use SQLite for production; use PostgreSQL
2. **Enable Prisma Connection Pooling:** Add `?connection_limit=10&pool_timeout=20` to your DATABASE_URL
3. **Monitor Usage:** Keep an eye on your deployment count and bandwidth
4. **Test Locally First:** Always test changes locally before deploying to avoid wasting deployments
5. **Consider Alternatives:** For heavy backend workloads, consider Railway, Render, or DigitalOcean

## Next Steps After Deployment

1. Set up monitoring (Sentry, LogRocket, etc.)
2. Configure custom domain (optional)
3. Set up CI/CD pipeline for automated deployments
4. Implement proper logging and error tracking
5. Set up database backups


