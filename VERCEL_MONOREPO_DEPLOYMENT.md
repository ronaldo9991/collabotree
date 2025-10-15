# Vercel Monorepo Deployment Guide

## Current Setup

Your project is a **monorepo** with:
```
collabotree-main/
├── backend/     (Express API + serves frontend in production)
├── client/      (React frontend)
├── package.json (Root-level build scripts)
└── vercel.json  (Deployment configuration)
```

## How It Works

1. **Build Process** (`npm run vercel-build`):
   - Installs backend dependencies → `cd backend && npm install`
   - Installs frontend dependencies → `cd client && npm install`
   - Builds backend (TypeScript → JavaScript) → `backend/dist/`
   - Builds frontend (React → static files) → `client/dist/`
   - **Copies frontend to backend** → `backend/dist/dist/`

2. **Deployment**:
   - Vercel runs the build from the **monorepo root**
   - Output directory: `backend/dist/dist` (frontend static files)
   - Serverless function: `backend/api/index.js` (API handler)

3. **Production**:
   - Your backend serves the frontend automatically
   - Routes starting with `/api/*` → Backend API
   - All other routes → Frontend React app

## Fixed Issues

✅ **Added `vercel.json` at root level** - Tells Vercel how to build monorepo  
✅ **Added `copy:frontend` script** - Copies built frontend to backend  
✅ **Set correct `outputDirectory`** - Points to `backend/dist/dist`  
✅ **Updated `build:all` script** - Includes frontend copy step  

## Deployment Configuration

### Root `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "backend/dist/dist",
  "builds": [
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/backend/api/index.js"
    }
  ]
}
```

### Build Scripts (package.json)
```json
{
  "scripts": {
    "build:all": "npm run install:all && npm run build:backend && npm run build:frontend && npm run copy:frontend",
    "install:all": "cd backend && npm install && cd ../client && npm install",
    "build:backend": "cd backend && npm run vercel-build",
    "build:frontend": "cd client && npm run build",
    "copy:frontend": "node -e \"...copies client/dist to backend/dist/dist...\""
  }
}
```

## Deploy to Vercel

### Option 1: Vercel Dashboard (GitHub Integration)

1. **Connect Repository:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `collabotree-main` directory as root

2. **Project Settings:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (monorepo root)
   - **Build Command:** `npm run vercel-build` (auto-detected from vercel.json)
   - **Output Directory:** `backend/dist/dist` (auto-detected from vercel.json)
   - **Install Command:** `npm install`

3. **Environment Variables:**
   Add these in the Vercel dashboard:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_ACCESS_SECRET=your-secret-32-chars-minimum
   JWT_REFRESH_SECRET=your-another-secret-32-chars
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   CLIENT_ORIGIN=https://your-app.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will run your build script automatically

### Option 2: Vercel CLI

```bash
cd collabotree-main

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? collabotree
# - In which directory is your code located? ./
# - Want to modify settings? Yes
#   - Build Command: npm run vercel-build
#   - Output Directory: backend/dist/dist
#   - Development Command: npm run dev

# Deploy to production
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment
```bash
# Check health endpoint
curl https://your-app.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"production","version":"1.0.0"}
```

### 2. Test Frontend
Visit `https://your-app.vercel.app` in your browser - you should see your React app

### 3. Test API
```bash
curl https://your-app.vercel.app/api/services
```

### 4. Set Up Database

If using **Vercel Postgres**:
```bash
# In Vercel dashboard, go to Storage → Create Database → Postgres
# DATABASE_URL will be automatically added to environment variables
```

If using **external database** (Neon, Supabase, Railway):
- Create database on your platform
- Add `DATABASE_URL` to Vercel environment variables
- Redeploy

### 5. Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

### 6. Create Admin User
```bash
cd backend
node create-admin.js
```

## Troubleshooting

### "No Output Directory named 'dist' found"
✅ **Fixed!** The `copy:frontend` script now copies `client/dist` to `backend/dist/dist`

### Build Succeeds but Site Shows 404
- Check that `backend/dist/dist/index.html` exists after build
- Verify `vercel.json` routes are correct
- Check Vercel function logs for errors

### API Routes Return 404
- Ensure routes start with `/api/*`
- Check `backend/api/index.js` imports are correct
- Verify `backend/dist/app.js` exists

### Database Connection Errors
- Check `DATABASE_URL` is set in Vercel environment variables
- Ensure database is accessible from Vercel (not localhost!)
- Use connection pooling for PostgreSQL

### Frontend Can't Connect to API
- Check browser console for CORS errors
- Verify `CLIENT_ORIGIN` matches your Vercel URL
- For single deployment, use relative API URLs (`/api` instead of full URL)

## File Structure After Build

```
collabotree-main/
├── backend/
│   ├── dist/
│   │   ├── app.js              (Compiled backend)
│   │   ├── config/
│   │   ├── controllers/
│   │   └── dist/               ← Frontend goes here!
│   │       ├── index.html
│   │       ├── assets/
│   │       └── ...
│   └── api/
│       └── index.js            (Vercel serverless handler)
└── client/
    └── dist/                   (Frontend build output)
        ├── index.html
        └── assets/
```

## Important Notes

1. **The backend serves the frontend** - In production, your Express app serves the static React files
2. **Single URL** - Everything is at `https://your-app.vercel.app`
3. **No CORS needed** - Frontend and backend on same domain
4. **API routes** - All API calls to `/api/*` are handled by Express
5. **SPA routing** - All other routes serve `index.html` for React Router

## Local Testing

To test the production build locally:

```bash
# Build everything
npm run build:all

# Start backend (which serves frontend)
cd backend
npm start

# Visit http://localhost:4000
# Frontend will be served at /
# API will be at /api/*
```

## Updating Environment Variables

After adding/changing environment variables in Vercel:
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add or update variables
3. **Redeploy** - Environment changes require redeployment
4. Or trigger redeploy via: `vercel --prod` or push to GitHub

## Next Steps

1. ✅ Commit and push changes to GitHub
2. ✅ Deploy via Vercel dashboard or CLI
3. ✅ Set up database (Vercel Postgres recommended)
4. ✅ Run migrations
5. ✅ Create admin user
6. ✅ Test your deployment!

Your monorepo is now properly configured for Vercel! 🎉









