# Railway Deployment Guide - Collabotree

## Overview

This guide covers deploying the Collabotree application (frontend + backend together) to Railway using Nixpacks builder.

## Why Single Deployment on Railway?

- ✅ **Simplified Setup**: One deployment instead of two
- ✅ **No CORS Issues**: Frontend and backend on same domain
- ✅ **Better Performance**: No cross-origin requests
- ✅ **Cost Effective**: Single service pricing
- ✅ **Easier Maintenance**: One deployment to manage

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub/GitLab Repository**: Push your code to a Git repository
3. **PostgreSQL Database**: Railway provides this automatically
4. **Node.js 18+**: For local testing

## Build Configuration

### Understanding Nixpacks

Railway uses **Nixpacks** as its default builder. The `nixpacks.toml` file in the `backend/` directory controls the entire build process:

```toml
[phases.setup]      # Environment setup (Node.js version)
[phases.install]    # Install dependencies
[phases.build]      # Build frontend and backend
[start]             # Start command
```

### Configuration Files Removed

We've removed these files to avoid conflicts:
- ❌ `railway.json` (deprecated)
- ❌ `railway.toml` (conflicts with nixpacks.toml)
- ❌ `Procfile` (unnecessary with nixpacks.toml)

**Only use `nixpacks.toml`** for Railway configuration.

## Local Testing

Before deploying to Railway, test the build process locally:

### Step 1: Run the Test Script

```bash
cd collabotree-main/backend
node test-railway-build.js
```

This script will:
1. ✓ Check all prerequisites
2. ✓ Install backend dependencies
3. ✓ Build frontend
4. ✓ Copy frontend to backend/dist
5. ✓ Generate Prisma client
6. ✓ Build backend TypeScript
7. ✓ Verify all output files

### Step 2: Fix Any Errors

If the test fails:
- Read the error messages carefully
- Most common issues:
  - Missing dependencies: Run `npm install` in both client and backend
  - TypeScript errors: Fix them in the source files
  - Prisma errors: Check your schema.prisma file

### Step 3: Verify Output

After successful test, check that these files exist:
```
backend/dist/
├── server.js          ← Backend entry point
├── app.js             ← Backend app
├── config/            ← Backend compiled files
├── controllers/       ← Backend compiled files
├── index.html         ← Frontend home page
├── assets/            ← Frontend JS/CSS
└── ...
```

## Railway Deployment

### Method 1: Deploy from GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
# From collabotree-main directory
git add .
git commit -m "Configure Railway deployment with Nixpacks"
git push origin main
```

#### Step 2: Create Railway Project

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the branch (e.g., `main`)

#### Step 3: Configure Root Directory

**IMPORTANT**: Railway needs to know where your backend is.

1. In Railway dashboard, go to your service
2. Click **"Settings"**
3. Under **"Build"**, find **"Root Directory"**
4. Set to: `collabotree-main/backend`
5. Click **"Save"**

#### Step 4: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically creates a database
4. **Database URL is auto-linked** to your service

#### Step 5: Configure Environment Variables

In Railway service settings → **"Variables"** tab:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-other-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
PORT=${{PORT}}
```

**Important Notes:**
- `DATABASE_URL`: Use the Railway variable reference `${{Postgres.DATABASE_URL}}`
- `PORT`: Use `${{PORT}}` (Railway sets this automatically)
- `CLIENT_ORIGIN`: Leave empty for single deployment
- Generate strong JWT secrets:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### Step 6: Deploy

1. Railway automatically starts deploying
2. Watch the **"Deployments"** tab for build logs
3. Build should follow these steps:
   - ✓ Setup (Install Node.js 18)
   - ✓ Install (Backend dependencies)
   - ✓ Build (Frontend → Backend → Prisma → TypeScript)
   - ✓ Start (node dist/server.js)

#### Step 7: Access Your Application

Once deployed:
- **Frontend**: `https://your-app.up.railway.app/`
- **API**: `https://your-app.up.railway.app/api/`
- **Health Check**: `https://your-app.up.railway.app/health`

### Method 2: Deploy from Railway CLI

#### Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Login and Deploy

```bash
# Login to Railway
railway login

# Link to existing project or create new one
railway link

# Set root directory
cd collabotree-main/backend

# Deploy
railway up
```

## Troubleshooting

### Build Fails at Frontend Step

**Error**: `npm run build` fails in client directory

**Solution**:
1. Test frontend build locally:
   ```bash
   cd collabotree-main/client
   npm ci --legacy-peer-deps
   npm run build
   ```
2. Fix any TypeScript/ESLint errors
3. Commit and push changes

### Build Fails at Backend Step

**Error**: `npm run build` fails for backend

**Solution**:
1. Test backend build locally:
   ```bash
   cd collabotree-main/backend
   npm run build
   ```
2. Fix TypeScript compilation errors
3. Commit and push changes

### Prisma Migration Fails

**Error**: `npx prisma migrate deploy` fails

**Solution**:
1. Ensure `DATABASE_URL` is set correctly in Railway
2. Check that PostgreSQL database is running
3. Verify `schema.prisma` has no syntax errors
4. Run migrations manually:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Frontend Not Serving

**Error**: API works but frontend shows 404

**Solution**:
1. Check that `backend/dist/index.html` exists
2. Verify the copy step in nixpacks.toml:
   ```bash
   node test-railway-build.js
   ```
3. Check backend app.ts serves static files correctly

### Railway Not Using Nixpacks

**Error**: Railway tries to use Dockerfile or different builder

**Solution**:
1. Delete any `Dockerfile` in backend directory
2. Ensure only `nixpacks.toml` exists (no railway.json/railway.toml)
3. In Railway Settings → Build → Builder → Select **"Nixpacks"**
4. Redeploy

### Database Connection Errors

**Error**: `Error: connect ECONNREFUSED` or Prisma connection errors

**Solution**:
1. Verify DATABASE_URL is set: `${{Postgres.DATABASE_URL}}`
2. Ensure PostgreSQL service is running in Railway
3. Check database is in the same Railway project
4. Try regenerating Prisma client:
   ```bash
   railway run npx prisma generate
   ```

### Build Succeeds but App Crashes

**Error**: Build completes but service won't start

**Solution**:
1. Check Railway logs for error messages
2. Verify `dist/server.js` exists in build output
3. Test start command locally:
   ```bash
   npm run build
   node dist/server.js
   ```
4. Check environment variables are set correctly

## Monitoring and Logs

### View Deployment Logs

1. Go to Railway dashboard
2. Click on your service
3. Click **"Deployments"** tab
4. Select the deployment
5. View real-time logs

### View Runtime Logs

1. Go to Railway dashboard
2. Click on your service
3. Click **"View Logs"** button
4. Filter by log level (error, warn, info)

## Updating Your Deployment

### Auto-Deploy (Recommended)

Railway auto-deploys when you push to your connected branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will automatically:
1. Detect the push
2. Run the build process
3. Deploy the new version
4. Keep the old version running until new one is ready

### Manual Deploy

Using Railway CLI:

```bash
cd collabotree-main/backend
railway up
```

### Rollback

If a deployment has issues:

1. Go to Railway dashboard → **"Deployments"**
2. Find a previous successful deployment
3. Click **"..."** menu
4. Select **"Redeploy"**

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Auto | Server port | `${{PORT}}` |
| `DATABASE_URL` | Auto | PostgreSQL connection | `${{Postgres.DATABASE_URL}}` |
| `JWT_ACCESS_SECRET` | Yes | JWT signing secret | `64-char-hex-string` |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh secret | `64-char-hex-string` |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | No | Password hashing rounds | `12` |
| `CLIENT_ORIGIN` | No | CORS origin (leave empty) | `` |

## Project Structure for Railway

```
collabotree-main/
├── backend/                    ← Railway root directory
│   ├── nixpacks.toml          ← Build configuration (IMPORTANT)
│   ├── package.json           ← Backend dependencies & scripts
│   ├── tsconfig.json          ← TypeScript config
│   ├── prisma/
│   │   └── schema.prisma      ← Database schema
│   ├── src/                   ← TypeScript source
│   ├── dist/                  ← Build output (created by Railway)
│   │   ├── server.js          ← Backend entry
│   │   ├── index.html         ← Frontend entry
│   │   └── assets/            ← Frontend assets
│   └── test-railway-build.js  ← Local build tester
└── client/                    ← Frontend source
    ├── package.json
    ├── src/
    └── dist/                  ← Built by Railway, copied to backend/dist
```

## Best Practices

### 1. Test Locally First
Always run `node test-railway-build.js` before deploying.

### 2. Use Environment Variables
Never hardcode secrets in code. Use Railway environment variables.

### 3. Monitor Deployments
Check deployment logs to catch issues early.

### 4. Keep Dependencies Updated
Regularly update packages to fix security vulnerabilities.

### 5. Use PostgreSQL for Production
Railway provides PostgreSQL automatically - don't use SQLite in production.

### 6. Enable Health Checks
Your backend already has a `/health` endpoint. Railway uses this.

### 7. Set Up Custom Domain (Optional)
Railway provides a `*.up.railway.app` domain, but you can add your own:
1. Go to service **"Settings"**
2. Click **"Domains"**
3. Add custom domain
4. Configure DNS as instructed

## Cost Considerations

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month + usage-based compute
- **Pro Plan**: $20/month + usage-based compute

**Compute Pricing**:
- Charged per GB-hour of RAM and vCPU usage
- Sleep mode available to reduce costs
- First $5 of usage included in Hobby plan

**Database Pricing**:
- PostgreSQL included in compute usage
- Charged for storage and compute

**Tips to Reduce Costs**:
1. Enable sleep mode for development projects
2. Use environment variable for resource limits
3. Optimize your code to use less memory
4. Set up auto-scaling appropriately

## Support and Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Nixpacks Documentation**: [nixpacks.com/docs](https://nixpacks.com/docs)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)

## Summary Checklist

Before deploying to Railway:

- [ ] Run `node test-railway-build.js` successfully
- [ ] Push code to GitHub/GitLab
- [ ] Create Railway project from GitHub
- [ ] Set root directory to `collabotree-main/backend`
- [ ] Add PostgreSQL database
- [ ] Configure environment variables (especially JWT secrets)
- [ ] Verify `nixpacks.toml` is in backend directory
- [ ] Remove any conflicting config files
- [ ] Deploy and check logs
- [ ] Test frontend at deployed URL
- [ ] Test API endpoints at deployed URL
- [ ] Verify database connection works

---

**Need Help?** Check the troubleshooting section or Railway's documentation.

**Ready to Deploy?** Follow the steps above and your Collabotree app will be live on Railway! 🚀

