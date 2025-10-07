# 🚀 Render Deployment Guide

## Quick Start

### 1. Create Render Account
Sign up at [render.com](https://render.com)

### 2. Create PostgreSQL Database
1. New + → PostgreSQL
2. Name: `collabotree-db`
3. Plan: Free
4. Click Create Database
5. Copy the **Internal Database URL**

### 3. Create Web Service
1. New + → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Name:** `collabotree`
   - **Runtime:** Node
   - **Build Command:** `npm run build:all`
   - **Start Command:** `npm run start:prod`

### 4. Environment Variables

| Variable | Value |
|----------|-------|
| NODE_ENV | `production` |
| PORT | `4000` |
| DATABASE_URL | *Your database internal URL* |
| CLIENT_ORIGIN | `https://collabotree.onrender.com` (update after first deploy) |
| JWT_ACCESS_SECRET | *Generate random 64 char string* |
| JWT_REFRESH_SECRET | *Generate random 64 char string* |
| JWT_ACCESS_EXPIRES_IN | `15m` |
| JWT_REFRESH_EXPIRES_IN | `7d` |
| BCRYPT_ROUNDS | `12` |

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Deploy
Click "Create Web Service" and wait ~5-10 minutes

### 6. Update CLIENT_ORIGIN
After first deploy, update CLIENT_ORIGIN with your actual URL

## Your app will be live at:
```
https://collabotree.onrender.com
```

## ⚠️ Free Tier Notes
- Services spin down after 15 min inactivity
- First request after spin-down takes ~30 seconds
- Database free for 90 days, then $7/month

## 💰 Pricing
- **Free:** $0 (750 hrs/month, spins down)
- **Starter:** $7/month (always on)
- **Database:** $7/month (after 90 days)









