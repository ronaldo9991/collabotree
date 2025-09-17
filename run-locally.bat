@echo off
REM CollaboTree Local Development Setup Script for Windows
REM This script sets up and runs the complete CollaboTree application locally

echo 🌳 CollaboTree Local Development Setup
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] npm is installed
npm --version
echo.

REM Setup Supabase
echo [INFO] Setting up Supabase configuration...

if not exist "client\.env" (
    echo [WARNING] No .env file found. Creating one from template...
    copy "client\env.example" "client\.env"
    
    echo [WARNING] Please update client\.env with your Supabase credentials:
    echo [WARNING] 1. Go to https://supabase.com and create a new project
    echo [WARNING] 2. Get your project URL and anon key from Settings ^> API
    echo [WARNING] 3. Update the .env file with your credentials
    echo [WARNING] 4. Run the database setup script
    echo.
    
    pause
)

REM Check if .env has been updated
findstr /C:"your_supabase_project_url" "client\.env" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Please update client\.env with your actual Supabase credentials
    echo [ERROR] Run: node setup-supabase-complete.js
    pause
    exit /b 1
)

echo [SUCCESS] Supabase configuration ready
echo.

REM Install dependencies
echo [INFO] Installing dependencies...

if not exist "node_modules" (
    npm install
    echo [SUCCESS] Root dependencies installed
) else (
    echo [SUCCESS] Root dependencies already installed
)

if not exist "client\node_modules" (
    cd client
    npm install
    cd ..
    echo [SUCCESS] Client dependencies installed
) else (
    echo [SUCCESS] Client dependencies already installed
)

echo.

REM Setup database
echo [INFO] Setting up database...

if exist "fix-supabase-complete.sql" (
    echo [WARNING] Database setup required!
    echo [WARNING] Please run the following SQL script in your Supabase SQL Editor:
    echo [WARNING] 1. Go to your Supabase dashboard
    echo [WARNING] 2. Navigate to SQL Editor
    echo [WARNING] 3. Copy and paste the contents of fix-supabase-complete.sql
    echo [WARNING] 4. Execute the script
    echo.
    
    pause
    echo [SUCCESS] Database setup completed
) else (
    echo [ERROR] Database setup script not found!
    pause
    exit /b 1
)

echo.

REM Seed database (optional)
echo [INFO] Setting up database seeding...

if exist "scripts\seed.ts" (
    set /p seed_choice="Do you want to seed the database with test data? (y/n): "
    
    if /i "%seed_choice%"=="y" (
        echo [INFO] Seeding database with test data...
        
        REM Check if service role key is available
        findstr /C:"SUPABASE_SERVICE_ROLE_KEY" ".env" >nul 2>&1
        if %errorlevel% equ 0 (
            npx tsx scripts/seed.ts
            echo [SUCCESS] Database seeded with test data
            echo [SUCCESS] Test credentials:
            echo [SUCCESS]   Student: student@test.com / password123
            echo [SUCCESS]   Buyer: buyer@test.com / password123
        ) else (
            findstr /C:"SUPABASE_SERVICE_ROLE_KEY" "client\.env" >nul 2>&1
            if %errorlevel% equ 0 (
                npx tsx scripts/seed.ts
                echo [SUCCESS] Database seeded with test data
                echo [SUCCESS] Test credentials:
                echo [SUCCESS]   Student: student@test.com / password123
                echo [SUCCESS]   Buyer: buyer@test.com / password123
            ) else (
                echo [WARNING] Service role key not found. Skipping database seeding.
                echo [WARNING] To seed the database later, add SUPABASE_SERVICE_ROLE_KEY to your .env file
            )
        )
    )
)

echo.

REM Start development server
echo [INFO] Starting development server...

cd client
echo [SUCCESS] Starting Vite development server...
echo [SUCCESS] Application will be available at: http://localhost:5173
echo [SUCCESS] Press Ctrl+C to stop the server
echo.

npm run dev
