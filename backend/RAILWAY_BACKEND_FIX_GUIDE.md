# Railway Backend Fix Guide

## 🚨 CRITICAL: Set These Environment Variables in Railway Dashboard

Go to your Railway project dashboard and set these environment variables in your main service:

### Required Environment Variables:
```bash
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=
DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway
JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

## 🔧 Step-by-Step Fix:

### 1. Go to Railway Dashboard
- Open your Railway project
- Click on your main service (not the PostgreSQL service)

### 2. Set Environment Variables
- Click on "Variables" tab
- Add each environment variable listed above
- Make sure to copy the exact values

### 3. Redeploy
- After setting all variables, Railway will automatically redeploy
- Check the deployment logs for any errors

### 4. Test the Deployment
- Once deployed, test these endpoints:
  - `https://your-app.railway.app/api/health`
  - `https://your-app.railway.app/api/public/services`

## 🎯 Expected Results:

After setting environment variables and redeploying:
- ✅ Build will complete successfully
- ✅ Server will start on Railway port
- ✅ Database tables will be created automatically
- ✅ API endpoints will respond correctly
- ✅ Services will appear in "Explore Talent" and "New Projects"

## 🚨 Common Issues:

### Issue 1: Build Fails
**Solution:** Check that all environment variables are set correctly

### Issue 2: Server Won't Start
**Solution:** Verify JWT secrets are set and are at least 32 characters

### Issue 3: Database Connection Fails
**Solution:** Ensure DATABASE_URL is correct and PostgreSQL service is running

### Issue 4: Services Don't Appear
**Solution:** Check that database tables are created (they should be automatic)

## 📞 Need Help?

If you're still having issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Ensure PostgreSQL service is running
4. Test the API endpoints manually
