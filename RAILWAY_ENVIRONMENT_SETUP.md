# 🔧 Railway Environment Variables - EXACT SETUP

## 🎯 Your Generated Secrets

Use these exact values in Railway:

```env
JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782
JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e
```

## 📋 Complete Environment Variables for Railway

Go to **Railway Dashboard** → **Your Service** → **Variables** tab and set these EXACTLY:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782
JWT_REFRESH_SECRET=69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
PORT=${{PORT}}
```

## 🔍 Step-by-Step Setup

### Step 1: Check PostgreSQL Database
1. **Railway Dashboard** → **Your Project**
2. **Look for a PostgreSQL service** (should be green/running)
3. **If no database exists:**
   - Click **"+ New"**
   - Select **"Database"** → **"PostgreSQL"**
   - Wait for it to be created (2-3 minutes)

### Step 2: Set Environment Variables
1. **Click on your main service** (not the database)
2. **Go to "Variables" tab**
3. **Add each variable one by one:**

| Variable Name | Variable Value |
|---------------|----------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `JWT_ACCESS_SECRET` | `a8042fea480e90f0c1aa4d3e00aef402b0c5d2e16d02d0123a60b29e38c19782` |
| `JWT_REFRESH_SECRET` | `69334a6a73898bd0be40c67e6d39a46915864a883b318e0b56eac00e96ddfd9e` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `12` |
| `CLIENT_ORIGIN` | *(leave empty)* |
| `PORT` | `${{PORT}}` |

### Step 3: Verify Setup
- **DATABASE_URL**: Must use `${{Postgres.DATABASE_URL}}` (with double curly braces)
- **PORT**: Must use `${{PORT}}` (Railway sets this automatically)
- **JWT secrets**: Use the exact values above

## 🚀 After Setting Variables

1. **Railway will auto-redeploy** (takes 2-3 minutes)
2. **Check the logs** for these messages:
   ```
   💾 Database: Connected ✅
   ```
3. **Visit your app**: `https://collabotree-production.up.railway.app/`

## ❌ Common Mistakes to Avoid

1. **Wrong DATABASE_URL format**: Use `${{Postgres.DATABASE_URL}}` not `${{DATABASE_URL}}`
2. **Missing double braces**: Must be `{{}}` not `{}`
3. **Wrong service**: Set variables on your main service, not the database
4. **Missing database**: Make sure PostgreSQL service exists and is running

## 🔧 Troubleshooting

### If DATABASE_URL error persists:
1. **Check database service is running** (green status)
2. **Verify variable name**: Must be exactly `DATABASE_URL`
3. **Verify variable value**: Must be exactly `${{Postgres.DATABASE_URL}}`
4. **Check service linking**: Database should be in same project

### If you get other errors:
1. **Check all variables are set** (no missing ones)
2. **Verify JWT secrets are correct** (use the exact values above)
3. **Make sure NODE_ENV=production**

## 🎉 Expected Result

After this setup, your Railway logs should show:

```
🌍 Production mode: Serving frontend + backend
📁 Frontend path: /app/backend/dist
📁 Current directory: /app/backend/dist
Socket.IO initialized with CORS origin: http://localhost:3000
🚀 CollaboTree Backend Server running on port 8080
📡 Environment: production
🔗 Client Origin: http://localhost:3000
💾 Database: Connected ✅
🔌 Socket.IO: Enabled
```

**No more Prisma errors!**

---

## 🚀 Your App Will Be Fully Working!

With these environment variables set correctly:
- ✅ Frontend loads (already working)
- ✅ Backend API works
- ✅ Database queries work
- ✅ Authentication works
- ✅ All features work

**Copy the environment variables above and paste them into Railway!** 🎯
