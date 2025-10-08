# Single Deployment Guide (Frontend + Backend Together)

## Why Single Deployment?

Your backend is already configured to serve the frontend in production! This means you can:
- Deploy ONLY the backend to Vercel
- The backend will automatically serve your React frontend
- Eliminate CORS issues
- Reduce deployment costs and rate limits

## Steps to Switch to Single Deployment

### 1. Build the Frontend

```bash
cd collabotree-main/client
npm install
npm run build
```

This creates a `dist` folder with your compiled React app.

### 2. Copy Frontend Build to Backend

```bash
# From the collabotree-main directory
cp -r client/dist backend/dist
```

Or on Windows PowerShell:
```powershell
Copy-Item -Recurse -Force client\dist backend\dist
```

The backend expects the frontend at `backend/dist/dist` (because of the path `../../dist` in the code).

### 3. Update Backend Structure

The correct structure should be:
```
backend/
├── api/
│   └── index.js
├── dist/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   └── dist/          ← Frontend build goes here
│       ├── index.html
│       ├── assets/
│       └── ...
├── vercel.json
└── package.json
```

### 4. Update vercel.json (Already Done)

Your `backend/vercel.json` is already set up correctly to route everything through the API.

### 5. Remove Frontend Deployment (Optional)

Once the single deployment is working:
- Delete the separate frontend Vercel project
- You'll only maintain the backend deployment

### 6. Deploy

```bash
cd backend
vercel --prod
```

### 7. Test

Your backend URL will now serve:
- **Frontend**: `https://your-backend.vercel.app/` (home page)
- **API**: `https://your-backend.vercel.app/api/*` (all API routes)
- **Health**: `https://your-backend.vercel.app/health`

## Important Configuration Changes

### Update Frontend Environment Variables

Since the frontend is served from the same domain, you can simplify the API URL:

**Option 1: Use relative URLs (Recommended)**
```env
# In your frontend .env (for Vercel)
VITE_API_URL=/api
```

**Option 2: Keep absolute URL**
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Update WebSocket Connection

In `client/src/pages/Chat.tsx`, line 201, update the hardcoded localhost:

**Before:**
```typescript
const newSocket = io('http://localhost:4000', {
```

**After:**
```typescript
const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  return 'http://localhost:4000';
};

const newSocket = io(getSocketUrl(), {
```

### Vercel Environment Variables

In Vercel dashboard, set:
```
NODE_ENV=production
DATABASE_URL=your-postgresql-url
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
CLIENT_ORIGIN=https://your-backend.vercel.app  ← Same as backend URL
```

## Automated Build Script

Create a build script to automate this process:

**File: `build-for-vercel.sh` (for Mac/Linux)**
```bash
#!/bin/bash

echo "Building frontend..."
cd client
npm install
npm run build

echo "Copying frontend to backend..."
cd ..
rm -rf backend/dist/dist
cp -r client/dist backend/dist/

echo "Building backend..."
cd backend
npm install
npm run build

echo "✅ Ready for Vercel deployment!"
echo "Run: cd backend && vercel --prod"
```

**File: `build-for-vercel.ps1` (for Windows PowerShell)**
```powershell
Write-Host "Building frontend..." -ForegroundColor Green
Set-Location client
npm install
npm run build

Write-Host "Copying frontend to backend..." -ForegroundColor Green
Set-Location ..
if (Test-Path "backend\dist\dist") {
    Remove-Item -Recurse -Force "backend\dist\dist"
}
Copy-Item -Recurse -Force "client\dist" "backend\dist\"

Write-Host "Building backend..." -ForegroundColor Green
Set-Location backend
npm install
npm run build

Write-Host "✅ Ready for Vercel deployment!" -ForegroundColor Cyan
Write-Host "Run: cd backend && vercel --prod" -ForegroundColor Yellow
```

Make it executable:
```bash
chmod +x build-for-vercel.sh
```

Then run:
```bash
./build-for-vercel.sh
```

## Alternative: Keep Separate Deployments

If you prefer to keep them separate (though not recommended):

### Pros:
- Frontend and backend can be updated independently
- Can use different hosting providers

### Cons:
- CORS configuration required
- Two deployments to manage
- Double the rate limit usage
- More complex setup
- Potential latency from cross-domain requests

### If Keeping Separate, Update:

1. **Frontend Environment Variable:**
   ```env
   VITE_API_URL=https://your-backend.vercel.app/api
   ```

2. **Backend CORS (already configured):**
   - Set `CLIENT_ORIGIN` in Vercel to your frontend URL
   - CORS is already permissive in production mode

3. **WebSocket Configuration:**
   - Update hardcoded localhost in Chat.tsx
   - Use environment variable for WebSocket URL

## Recommendation

**Use Single Deployment** because:
1. ✅ Your backend is already set up for it
2. ✅ Simpler to maintain
3. ✅ No CORS headaches
4. ✅ Better performance
5. ✅ Fewer deployments = less rate limiting

The only time you'd want separate deployments is if you need:
- Very different scaling requirements
- Multiple frontends (web + mobile admin panel)
- Different update schedules

For your use case, single deployment is the better choice!


