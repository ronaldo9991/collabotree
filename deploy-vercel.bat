@echo off
echo 🚀 Starting Vercel deployment process...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Generate JWT secrets
echo 🔐 Generating JWT secrets...
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set ACCESS_SECRET=%%i
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set REFRESH_SECRET=%%i

echo Generated ACCESS_SECRET: %ACCESS_SECRET%
echo Generated REFRESH_SECRET: %REFRESH_SECRET%

echo.
echo 📋 Next Steps:
echo 1. Go to https://vercel.com and create two projects:
echo    - Backend project (root directory: backend)
echo    - Frontend project (root directory: client)
echo.
echo 2. For Backend project, set these environment variables:
echo    NODE_ENV=production
echo    PORT=3000
echo    DATABASE_URL=your_database_connection_string
echo    CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
echo    JWT_ACCESS_SECRET=%ACCESS_SECRET%
echo    JWT_REFRESH_SECRET=%REFRESH_SECRET%
echo    JWT_ACCESS_EXPIRES_IN=15m
echo    JWT_REFRESH_EXPIRES_IN=7d
echo    BCRYPT_ROUNDS=12
echo.
echo 3. For Frontend project, set:
echo    VITE_API_URL=https://your-backend-domain.vercel.app
echo.
echo 4. Build command for Backend: npm run vercel-build
echo 5. Build command for Frontend: npm run build
echo.
echo 6. After deployment, run database migration:
echo    npx prisma migrate deploy
echo.
echo ✅ Deployment guide created! Check VERCEL_DEPLOY.md for detailed instructions.
pause
