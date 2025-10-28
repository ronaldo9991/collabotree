# Railway Deployment Guide

## Recent Optimizations

The Railway deployment has been optimized to fix build timeout issues:

### Changes Made:

1. **Separated Build and Runtime Phases**:
   - Build phase: Uses `build:fast` script to quickly build both client and backend
   - Runtime phase: Uses optimized startup script that avoids duplicate builds

2. **Optimized Build Script** (`build:fast`):
   - Uses `--omit=dev` to skip dev dependencies
   - Builds client and backend efficiently
   - Copies client build to backend dist folder
   - Runs prisma generate only once

3. **New Startup Script** (`start-railway-optimized.sh`):
   - Validates environment variables
   - Runs `prisma migrate deploy` (not db push)
   - Creates admin user
   - Starts server directly

4. **Database Migration Strategy**:
   - Uses `prisma migrate deploy` for production stability
   - Avoids `--accept-data-loss` flag which can cause hangs
   - Proper migration order with the new `signedAt` field

### Required Railway Environment Variables:

- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_PUBLIC_URL` (optional) - Public database URL if different
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `NODE_ENV=production`

### Build Configuration:

The `nixpacks.toml` file configures:
- Node.js 22 and npm 9
- Fast build process
- Optimized startup command

### Troubleshooting:

If build still times out:
1. Check Railway dashboard for specific error messages
2. Verify all environment variables are set
3. Check database connectivity
4. Monitor build logs for hanging processes

### What's Fixed:

- ✅ Build timeout issues
- ✅ Duplicate build processes  
- ✅ Database migration hangs
- ✅ Contract signing functionality
- ✅ signedAt field validation errors

The deployment should now complete successfully within Railway's build time limits.
