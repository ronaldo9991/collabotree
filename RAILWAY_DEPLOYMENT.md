# 🚂 Railway Deployment Guide - Collabotree

Complete guide for deploying your Collabotree application to Railway with PostgreSQL database.

## 📋 Prerequisites

- GitHub account (connected to Railway)
- Railway account (free): https://railway.app
- Your code pushed to GitHub
- 10-15 minutes of time

---

## 🎯 Deployment Architecture

```
Railway Project: "collabotree"
├── Service 1: Backend (Node.js)
│   ├── Serves: Express API (/api/*)
│   ├── Serves: React Frontend (/)
│   ├── Serves: Socket.io (/socket.io/*)
│   └── Port: Auto-assigned by Railway
│
└── Service 2: PostgreSQL Database
    ├── Automatic connection string
    └── Injected as DATABASE_URL
```

---

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. Ensure all changes are committed:
```bash
git status
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. Verify your repository structure:
```
collabotree-main/
├── backend/           # Backend code
│   ├── src/          # TypeScript source
│   ├── dist/         # Compiled JavaScript
│   ├── prisma/       # Database schema
│   ├── railway.toml  # Railway config ✅
│   ├── nixpacks.toml # Build config ✅
│   └── package.json
└── client/           # Frontend code
    ├── src/
    ├── dist/         # Built frontend
    └── package.json
```

---

### **Step 2: Sign Up for Railway**

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

---

### **Step 3: Create New Project**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `collabotree` repository
4. Railway will detect it as a Node.js project

---

### **Step 4: Configure Service Settings**

1. After project creation, click on your service
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`
   - This tells Railway to deploy from the backend folder
4. **Branch**: `main` (or your default branch)
5. Click "Save"

---

### **Step 5: Add PostgreSQL Database**

1. In your project dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will:
   - Provision a PostgreSQL instance
   - Generate a connection string
   - Automatically inject `DATABASE_URL` into your backend service
3. Wait ~30 seconds for database to be ready (green status)

---

### **Step 6: Link Database to Backend**

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"Connect"** → Select your PostgreSQL database
4. Railway automatically adds `DATABASE_URL` environment variable

---

### **Step 7: Set Environment Variables**

In your backend service, go to **Variables** tab and add:

#### **Required Variables:**

```bash
NODE_ENV=production
```

#### **JWT Secrets (CRITICAL - Generate Strong Secrets!):**

Generate secrets using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to Railway:
```bash
JWT_ACCESS_SECRET=<paste-generated-64-char-string>
JWT_REFRESH_SECRET=<paste-different-generated-64-char-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

#### **Optional Variables:**
```bash
CLIENT_ORIGIN=    # Leave empty for single deployment
```

---

### **Step 8: Deploy!**

Railway automatically deploys when you:
1. Push to GitHub
2. Change environment variables
3. Manually trigger deploy

**First Deployment:**
- Click **"Deploy"** button in your service
- Watch the build logs in real-time
- Build process takes ~3-5 minutes

**Build Process:**
```
1. ✅ Install backend dependencies
2. ✅ Build frontend (React/Vite)
3. ✅ Copy frontend to backend/dist/dist
4. ✅ Generate Prisma client
5. ✅ Run database migrations
6. ✅ Compile TypeScript backend
7. ✅ Start server
```

---

### **Step 9: Verify Deployment**

Once deployment succeeds (green checkmark):

1. **Get Your URL:**
   - Go to **Settings** → **Domains**
   - Railway provides: `your-app-name.up.railway.app`
   - Or add custom domain

2. **Test Endpoints:**

   **Health Check:**
   ```bash
   curl https://your-app-name.up.railway.app/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-XX...",
     "environment": "production",
     "version": "1.0.0"
   }
   ```

   **Frontend:**
   ```
   https://your-app-name.up.railway.app
   ```
   Should load your React homepage

   **API:**
   ```
   https://your-app-name.up.railway.app/api/...
   ```
   All API endpoints work

3. **Check Logs:**
   - Go to **Deployments** tab
   - Click on latest deployment
   - View real-time logs
   - Look for:
     ```
     🚀 CollaboTree Backend Server running on port 3000
     📡 Environment: production
     💾 Database: Connected
     🔌 Socket.IO: Enabled
     ```

---

### **Step 10: Test All Features**

✅ **Frontend Tests:**
- [ ] Homepage loads
- [ ] All pages render correctly
- [ ] Images and styles load
- [ ] Client-side routing works

✅ **Authentication:**
- [ ] User registration
- [ ] Email validation
- [ ] Login works
- [ ] JWT tokens issued
- [ ] Protected routes require auth

✅ **API Features:**
- [ ] Create service/project
- [ ] Browse marketplace
- [ ] Apply to projects
- [ ] View dashboard

✅ **Real-Time Features:**
- [ ] Socket.io connects
- [ ] Chat messages send
- [ ] Chat messages receive
- [ ] Real-time updates work

✅ **Database:**
- [ ] Data persists
- [ ] Queries execute
- [ ] Migrations applied

---

## 🔧 Database Management

### **View Database in Railway:**

1. Click on PostgreSQL service
2. Go to **"Data"** tab
3. View tables and data

### **Run Prisma Studio:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run Prisma Studio
railway run npx prisma studio
```

Opens: http://localhost:5555

### **Run Migrations Manually:**

```bash
# Connect to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database (optional)
railway run npx prisma db seed
```

### **Database Backup:**

Railway Pro plan includes automatic backups.
Free tier: Export manually via Railway dashboard → Data → Export

---

## 🔄 Update/Redeploy

### **Automatic Deployment:**

Railway auto-deploys when you push to GitHub:
```bash
# Make changes to code
git add .
git commit -m "Update feature X"
git push origin main

# Railway automatically detects push and redeploys
```

### **Manual Deployment:**

1. Go to your service in Railway
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on any previous deployment

---

## 🌐 Custom Domain Setup

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `collabotree.com`
4. Railway provides DNS records:
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   ```
5. Add records to your DNS provider (Namecheap, GoDaddy, Cloudflare)
6. Wait ~5-10 minutes for SSL certificate
7. Your app will be live at your custom domain with HTTPS

---

## 📊 Monitoring & Logs

### **View Logs:**
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on active deployment
4. Real-time logs appear

### **Resource Usage:**
1. Go to **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Network bandwidth
   - Request count

---

## 💰 Pricing & Limits

### **Free Tier:**
- $5 credit per month
- ~500 hours of runtime
- Good for development/testing

### **Resource Limits (Free):**
- RAM: 512MB
- CPU: Shared
- Storage: 1GB database

### **Typical Cost:**
```
Backend Service: $5/month
PostgreSQL: $3/month
Total: ~$8/month

(First month free with $5 credit)
```

### **Upgrade When:**
- Traffic increases
- Need more resources
- Want automatic backups
- Need 24/7 availability

---

## 🐛 Troubleshooting

### **Build Fails:**

**Error: "Cannot find module"**
```bash
# Solution: Clear Railway cache
# In Railway dashboard:
Settings → Clear Build Cache → Redeploy
```

**Error: "Prisma client not generated"**
```bash
# Solution: Verify nixpacks.toml includes:
npx prisma generate
```

### **Database Connection Fails:**

**Error: "Connection refused"**
```bash
# Solution: Verify DATABASE_URL is set
# In Railway: Variables tab → Check DATABASE_URL exists
```

**Error: "SSL required"**
```bash
# Solution: Update Prisma schema
# Add to database URL: ?sslmode=require
```

### **Frontend Not Loading:**

**Error: "404 Not Found"**
```bash
# Solution: Check frontend was copied
# In build logs, verify:
✅ Copying Frontend to Backend
✅ cp -r ../client/dist dist/dist
```

**Error: "Blank page"**
```bash
# Solution: Check browser console for errors
# Verify API_BASE_URL is set correctly (/api)
```

### **Socket.io Not Connecting:**

**Error: "WebSocket connection failed"**
```bash
# Solution 1: Check Socket.io URL in Chat.tsx
# Should use: window.location.origin in production

# Solution 2: Verify Socket.io CORS
# Check backend/src/server.ts has Railway domains
```

### **Environment Variables Not Working:**

```bash
# Solution: After changing variables
1. Go to Deployments
2. Click "Redeploy"
3. Variables only apply on new deployment
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] App accessible at Railway URL
- [ ] Health check returns OK
- [ ] Homepage loads instantly
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads
- [ ] Can create service
- [ ] Marketplace shows data
- [ ] Chat connects (Socket.io)
- [ ] Database persists data
- [ ] No errors in logs
- [ ] Custom domain works (if set up)

---

## 📞 Support

**Railway Support:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app

**Collabotree Issues:**
- Check GitHub Issues
- Review deployment logs
- Test locally first with `NODE_ENV=production npm start`

---

## 🚀 Next Steps

After successful deployment:

1. **Test thoroughly with real users**
2. **Monitor logs for errors**
3. **Set up error tracking** (Sentry)
4. **Configure backups** (Railway Pro)
5. **Add monitoring** (Railway metrics)
6. **Scale as needed** (upgrade plan)
7. **Set up CI/CD** (already automatic via GitHub)

---

## 📝 Quick Commands Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in production
railway run <command>

# Open Prisma Studio
railway run npx prisma studio

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npx prisma db seed

# Open project in browser
railway open
```

---

## ✅ Deployment Complete! 🎉

Your Collabotree app is now live on Railway with:
- ✅ Production-grade hosting
- ✅ PostgreSQL database
- ✅ Automatic deployments
- ✅ HTTPS/SSL certificates
- ✅ Socket.io real-time features
- ✅ Scalable infrastructure

**Your app is ready for the world! 🌍**

---

*Last updated: 2025*
*Questions? Check Railway docs or raise an issue.*

