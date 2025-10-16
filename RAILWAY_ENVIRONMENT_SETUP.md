# Railway Environment Variables Setup

## Required Environment Variables

Set these environment variables in your Railway dashboard:

### 1. Database Configuration
```bash
# Railway automatically provides this when you add PostgreSQL
DATABASE_URL=postgresql://postgres:password@host:port/database
```

### 2. JWT Secrets (REQUIRED)
```bash
# Generate strong secrets (32+ characters minimum)
JWT_ACCESS_SECRET=your-32-character-minimum-secret-key-here
JWT_REFRESH_SECRET=your-another-32-character-minimum-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Application Configuration
```bash
NODE_ENV=production
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
```

### 4. Optional Configuration
```bash
# Railway automatically sets these
PORT=4000
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
```

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add each environment variable listed above
5. Click "Deploy" to apply changes

## Generate JWT Secrets

Run this command to generate secure JWT secrets:

```bash
# Generate JWT Access Secret
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT Refresh Secret  
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Provide connection details

## Verification

After setting up environment variables:

1. Check Railway logs for any errors
2. Visit `https://your-app.railway.app/health` - should return API status
3. Visit `https://your-app.railway.app/api/health` - should return API status
4. Test the application functionality

## Troubleshooting

### Common Issues:

1. **JWT Secret Too Short**: Ensure JWT secrets are at least 32 characters
2. **Database Connection Failed**: Verify DATABASE_URL is set correctly
3. **CORS Errors**: Check CLIENT_ORIGIN is set properly
4. **Build Failures**: Ensure all dependencies are installed correctly

### Debug Commands:

```bash
# Check environment variables
echo $DATABASE_URL
echo $JWT_ACCESS_SECRET

# Test database connection
npx prisma db push

# Check Prisma status
npx prisma migrate status
```