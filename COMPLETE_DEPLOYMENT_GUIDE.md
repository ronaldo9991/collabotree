# Complete Railway Deployment Guide

## 🚀 Quick Fix for Backend Issues

Your backend is not working because of missing environment variables and database setup. Follow these steps to fix it:

### Step 1: Add PostgreSQL Database
1. Go to your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create the database and set `DATABASE_URL`

### Step 2: Set Required Environment Variables
In your Railway service settings, add these environment variables:

```bash
NODE_ENV=production
JWT_ACCESS_SECRET=your-32-character-minimum-secret-key-here
JWT_REFRESH_SECRET=your-another-32-character-minimum-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
```

**Generate JWT Secrets:**
```bash
# Run this in your terminal to generate secure secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Deploy
1. Push your changes to trigger a new deployment
2. Railway will use the updated `nixpacks.toml` configuration
3. The build process will:
   - Build the frontend
   - Build the backend
   - Run database migrations
   - Start the server

### Step 4: Verify Deployment
After deployment, check these URLs:
- `https://your-app.railway.app/health` - Should return API health status
- `https://your-app.railway.app/api/health` - Should return API health status
- `https://your-app.railway.app/marketplace` - Should load projects (may show 0 results initially)

## 🔧 What Was Fixed

### 1. Build Configuration
- Updated `nixpacks.toml` to use `railway:build` script
- This ensures both frontend and backend are built properly

### 2. Environment Variables
- Created comprehensive list of required environment variables
- Added JWT secret generation instructions

### 3. Database Setup
- Ensured PostgreSQL is properly configured
- Database migrations will run automatically on startup

### 4. API Configuration
- Fixed API routing and CORS configuration
- Ensured proper error handling

## 🐛 Troubleshooting

### If you still see "Unable to Load Projects":

1. **Check Railway Logs**:
   - Go to your Railway service
   - Click on "Deployments" tab
   - Check the logs for any errors

2. **Verify Environment Variables**:
   - Make sure all required variables are set
   - Check that JWT secrets are 32+ characters

3. **Database Connection**:
   - Ensure PostgreSQL service is running
   - Check that DATABASE_URL is set correctly

4. **Build Process**:
   - Verify the build completed successfully
   - Check that both frontend and backend were built

### Common Issues:

**"Database connection failed"**:
- Add PostgreSQL service to Railway
- Check DATABASE_URL is set

**"JWT secret too short"**:
- Generate new 32+ character secrets
- Update environment variables

**"Build failed"**:
- Check Railway logs for specific errors
- Ensure all dependencies are installed

## 📊 Testing Your Deployment

1. **Health Check**: Visit `/health` and `/api/health`
2. **Frontend**: Visit your main domain
3. **API**: Test `/api/services` endpoint
4. **Database**: Check if projects load in marketplace

## 🎯 Next Steps

Once the backend is working:
1. Create some test services/projects
2. Test user registration and login
3. Verify all features work correctly
4. Monitor Railway logs for any issues

## 📞 Support

If you're still having issues:
1. Check Railway logs first
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Test the health endpoints

The deployment should work correctly once the environment variables are set and PostgreSQL is added to your Railway project.

