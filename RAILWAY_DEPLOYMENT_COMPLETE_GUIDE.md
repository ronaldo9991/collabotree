# Railway Deployment Complete Guide

## 🚀 Quick Start

### 1. Prerequisites
- Railway account (free tier available)
- GitHub repository with your code
- Node.js 18+ (Railway handles this automatically)

### 2. Deploy to Railway

1. **Connect Repository**:
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `collabotree` repository

2. **Add PostgreSQL Database**:
   - In your Railway project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

3. **Set Environment Variables**:
   - Go to your service → "Variables" tab
   - Add the following variables (see detailed list below)

4. **Deploy**:
   - Railway will automatically build and deploy your application
   - Check the "Deployments" tab for build progress

## 📋 Required Environment Variables

### Database (Auto-configured by Railway)
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
```

### JWT Secrets (REQUIRED - Generate your own)
```bash
JWT_ACCESS_SECRET=your-32-character-minimum-secret-key-here
JWT_REFRESH_SECRET=your-another-32-character-minimum-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Application Configuration
```bash
NODE_ENV=production
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
```

## 🔧 Generate JWT Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT Access Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🏗️ Build Process

The deployment uses the following build process:

1. **Install Dependencies**: Installs both root and backend dependencies
2. **Build Backend**: Compiles TypeScript, runs Prisma migrations
3. **Build Frontend**: Builds React application
4. **Copy Assets**: Copies frontend build to backend dist folder
5. **Start Server**: Starts the combined application

## 🔍 Verification Steps

After deployment, verify everything is working:

### 1. Health Checks
```bash
# API Health Check
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Database Connection
```bash
# API Database Check
curl https://your-app.railway.app/api/health

# Should return database status
```

### 3. Frontend Access
- Visit `https://your-app.railway.app`
- Should load the React application
- Test user registration/login
- Test marketplace functionality

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Error**: `npm install` fails
**Solution**: 
- Check Node.js version (should be 18+)
- Verify package.json dependencies
- Check Railway logs for specific errors

**Error**: TypeScript compilation fails
**Solution**:
- Check for TypeScript errors in your code
- Verify tsconfig.json configuration
- Ensure all imports are correct

#### 2. Database Issues

**Error**: `Database connection failed`
**Solution**:
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure database migrations completed

**Error**: `Prisma migration failed`
**Solution**:
- Check Prisma schema syntax
- Verify database permissions
- Run migrations manually if needed

#### 3. Runtime Issues

**Error**: `JWT secret too short`
**Solution**:
- Ensure JWT secrets are at least 32 characters
- Generate new secrets using the commands above

**Error**: `CORS errors`
**Solution**:
- Check `CLIENT_ORIGIN` environment variable
- Verify CORS configuration in app.ts

#### 4. Frontend Issues

**Error**: `404 on frontend routes`
**Solution**:
- Check frontend build completed successfully
- Verify static file serving configuration
- Check frontend files are copied to correct location

### Debug Commands

```bash
# Check environment variables
echo $DATABASE_URL
echo $JWT_ACCESS_SECRET

# Test database connection
npx prisma db push

# Check Prisma status
npx prisma migrate status

# View Railway logs
railway logs
```

## 📊 Monitoring

### Railway Dashboard
- **Deployments**: View build status and logs
- **Metrics**: Monitor CPU, memory, and network usage
- **Logs**: Real-time application logs
- **Variables**: Manage environment variables

### Application Logs
The application provides detailed logging:
- Database connection status
- API request/response logs
- Error tracking
- Performance metrics

## 🔄 Updates and Maintenance

### Deploying Updates
1. Push changes to your GitHub repository
2. Railway automatically detects changes
3. Triggers new deployment
4. Updates are zero-downtime

### Database Migrations
- Prisma migrations run automatically during build
- No manual intervention required
- Database schema updates are handled safely

### Environment Variable Updates
1. Go to Railway dashboard
2. Update variables in "Variables" tab
3. Click "Deploy" to apply changes

## 🚨 Emergency Procedures

### Rollback Deployment
1. Go to Railway dashboard
2. Navigate to "Deployments"
3. Click "Rollback" on previous deployment

### Database Recovery
1. Check Railway PostgreSQL service status
2. Verify `DATABASE_URL` is correct
3. Run database health checks
4. Contact Railway support if needed

### Application Recovery
1. Check Railway logs for errors
2. Verify all environment variables
3. Test health endpoints
4. Restart service if necessary

## 📞 Support

### Railway Support
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp)

### Application Support
- Check application logs in Railway dashboard
- Verify environment variables
- Test health endpoints
- Review this troubleshooting guide

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] JWT secrets are generated and secure
- [ ] PostgreSQL database is added
- [ ] Code is pushed to GitHub
- [ ] Build process is configured
- [ ] Health checks are working
- [ ] Frontend and backend are integrated
- [ ] Database migrations are ready

After deployment, verify:

- [ ] Application loads successfully
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] Frontend routes work properly
- [ ] User authentication functions
- [ ] Marketplace features work
- [ ] Real-time features (chat) work
- [ ] File uploads work (if applicable)

## 🎉 Success!

If all checks pass, your CollaboTree application is successfully deployed on Railway! 

Your application will be available at: `https://your-app.railway.app`

Remember to:
- Monitor the application regularly
- Keep dependencies updated
- Backup important data
- Monitor usage and costs
