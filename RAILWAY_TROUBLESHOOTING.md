# 🔧 Railway Deployment Troubleshooting Guide

## 🚨 **Issue: "Railpack could not determine how to build the app"**

### **Problem Identified:**
Railway's build system couldn't detect the project structure because:
1. Missing proper build configuration
2. Conflicting package.json scripts
3. Build system detection issues

### **Fixes Applied:**

#### **1. Updated Railway Configuration**
```toml
# backend/railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run railway:build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### **2. Added Build Scripts**
```json
// backend/package.json
{
  "scripts": {
    "railway:build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd ../client && npm ci --legacy-peer-deps && npm run build && cd ../backend && mkdir -p dist && cp -r ../client/dist dist/dist",
    "build:backend": "npx prisma generate && npx prisma migrate deploy && npm run build"
  }
}
```

#### **3. Simplified Client Package.json**
```json
// client/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "tsc"
  }
}
```

#### **4. Added Alternative Configuration Files**
- `backend/railway.json` - JSON format Railway config
- `backend/Procfile` - Heroku-style process file
- `backend/start.sh` - Unix start script

---

## 📋 **Deployment Steps After Fix**

### **1. Verify Railway Settings**
In your Railway project dashboard:
- **Root Directory:** `backend/`
- **Build Command:** `npm run railway:build`
- **Start Command:** `npm start`

### **2. Check Environment Variables**
Ensure these are set in Railway:
```bash
NODE_ENV=production
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### **3. Database Connection**
- PostgreSQL service should be connected
- `DATABASE_URL` should be automatically set

---

## 🔍 **Build Process Explanation**

The fixed build process now works as follows:

### **Phase 1: Frontend Build**
```bash
cd ../client
npm ci --legacy-peer-deps
npm run build
# Outputs to: client/dist/
```

### **Phase 2: Copy Frontend**
```bash
cd ../backend
mkdir -p dist
cp -r ../client/dist dist/dist
# Frontend now at: backend/dist/dist/
```

### **Phase 3: Backend Build**
```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate deploy  # Apply migrations
npm run build          # Compile TypeScript
# Outputs to: backend/dist/
```

### **Phase 4: Start Server**
```bash
npm start
# Runs: node dist/server.js
```

---

## 🚨 **Common Railway Issues & Solutions**

### **Issue 1: Build Fails with "Cannot find module"**
**Solution:**
```bash
# Clear Railway build cache
# In Railway dashboard: Settings → Clear Build Cache
```

### **Issue 2: Database Connection Fails**
**Solution:**
- Verify PostgreSQL service is running (green status)
- Check `DATABASE_URL` is set in environment variables
- Ensure database is linked to backend service

### **Issue 3: Frontend Shows Blank Page**
**Solution:**
- Check if frontend was copied to `backend/dist/dist/`
- Verify build logs show successful frontend build
- Check browser console for errors

### **Issue 4: Socket.io Connection Fails**
**Solution:**
- Verify CORS configuration in `backend/src/sockets/index.ts`
- Check if backend is running on correct port
- Ensure WebSocket transport is enabled

### **Issue 5: JWT Authentication Errors**
**Solution:**
- Verify JWT secrets are set and are 32+ characters
- Check JWT secrets are different from each other
- Ensure `JWT_ACCESS_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN` are set

---

## 📊 **Build Log Monitoring**

### **What to Look For:**

#### **✅ Successful Build Indicators:**
```
✅ Initialization completed
✅ Building Frontend...
✅ Frontend build completed
✅ Copying Frontend to Backend...
✅ Building Backend...
✅ Prisma client generated
✅ Migrations applied
✅ TypeScript compiled
✅ Build Complete
```

#### **❌ Failure Indicators:**
```
❌ Error creating build plan
❌ Cannot find module
❌ Database connection failed
❌ TypeScript compilation errors
❌ Prisma generation failed
```

---

## 🔄 **If Deployment Still Fails**

### **Option 1: Manual Build Test**
Test the build process locally:
```bash
cd backend
npm run railway:build
```

### **Option 2: Alternative Railway Configuration**
If the issue persists, try this configuration:

#### **Update railway.toml:**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/server.js"
```

#### **Update package.json build script:**
```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend"
  }
}
```

### **Option 3: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

---

## 📞 **Getting Help**

### **Railway Support:**
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- GitHub Issues: Check Railway's GitHub repo

### **Debug Information to Provide:**
1. Build logs from Railway dashboard
2. Environment variables (without secrets)
3. Package.json contents
4. Railway configuration files

---

## ✅ **Verification Checklist**

After deployment, verify:

- [ ] Build completes successfully (green checkmark)
- [ ] Health check: `GET /health` returns OK
- [ ] Frontend loads at root URL
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] Socket.io connects
- [ ] Authentication works
- [ ] No errors in Railway logs

---

## 🎯 **Expected Timeline**

- **Build Time:** 3-5 minutes
- **Deploy Time:** 1-2 minutes
- **Total Time:** 5-7 minutes

---

## 📝 **Recent Fixes Applied**

**Commit:** `034c9a0` - "Fix Railway deployment - Update build configuration and scripts"

**Changes:**
1. ✅ Updated `backend/railway.toml` with explicit build command
2. ✅ Added `railway:build` script to `backend/package.json`
3. ✅ Simplified `client/package.json` scripts
4. ✅ Created `backend/railway.json` alternative config
5. ✅ Added `backend/Procfile` for process detection
6. ✅ Created `backend/start.sh` start script

**Status:** 🟢 **Ready for redeployment**

---

*Last Updated: 2025-01-XX*  
*For deployment instructions, see: RAILWAY_DEPLOYMENT.md*
