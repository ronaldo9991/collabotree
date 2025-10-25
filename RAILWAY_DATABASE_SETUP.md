# Railway Database Setup Guide

## 🎯 Objective
Connect your Railway PostgreSQL database to your Collabotree application deployed at `zippy-nurturing-production.up.railway.app`.

## 📋 Prerequisites
- Railway PostgreSQL database: `Postgres-tZ1x`
- Railway app: `zippy-nurturing-production.up.railway.app`
- Database credentials (already provided)

## 🔧 Step-by-Step Setup

### 1. Access Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Navigate to your project
3. Find your main service: `zippy-nurturing-production.up.railway.app`

### 2. Configure Environment Variables
1. Click on your main service
2. Go to the **Variables** tab
3. Add the following environment variables:

```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=

DATABASE_URL=postgresql://postgres:1FUYCEkjTWZoeqofUFKaYnCWKlmIccCz@postgres-tz1x.railway.internal:5432/railway
DATABASE_PUBLIC_URL=postgresql://postgres:1FUYCEkjTWZoeqofUFKaYnCWKlmIccCz@trolley.proxy.rlwy.net:50892/railway

JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### 3. Database Migration
After setting the environment variables, Railway will automatically redeploy your app. The app will:
1. Connect to the PostgreSQL database
2. Run Prisma migrations automatically
3. Set up all required tables

### 4. Verify Connection
1. Check the Railway logs for successful database connection
2. Look for messages like:
   - "✅ PostgreSQL connection successful!"
   - "📊 Found X tables in the database"
   - "✅ MIGRATION COMPLETE!"

## 🔍 Troubleshooting

### If Database Connection Fails:
1. **Check Environment Variables**: Ensure all variables are set correctly in Railway
2. **Verify Database Status**: Make sure your PostgreSQL service is running
3. **Check Logs**: Look at Railway deployment logs for specific error messages
4. **Password Issues**: Double-check the password (should start with "1", not "l")

### If Migration Fails:
1. **Run Manual Migration**: Use the `migrate-to-postgres.js` script locally
2. **Check Prisma Schema**: Ensure schema is compatible with PostgreSQL
3. **Database Permissions**: Verify the postgres user has proper permissions

## 🚀 Expected Result
After successful setup:
- Your app will be connected to the PostgreSQL database
- All data will be stored in PostgreSQL instead of SQLite
- The app will be fully functional at `zippy-nurturing-production.up.railway.app`

## 📞 Support
If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables are set
3. Ensure the PostgreSQL service is running
4. Try redeploying the application

---
**Note**: The migration script has been updated with the correct database credentials and is ready to use if needed.

