@echo off
REM CollaboTree Complete Setup and Start Script for Windows

echo 🌳 CollaboTree Complete Setup
echo ==============================
echo.

REM Kill all existing processes
echo [INFO] Killing all existing servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im vite.exe 2>nul
timeout /t 2 /nobreak >nul

REM Navigate to correct directory
echo [INFO] Navigating to correct directory...
cd /d "C:\Users\rivalin\Downloads\collabotree 2\Collabotree09-main"

REM Verify we're in the right place
if not exist "package.json" (
    echo [ERROR] package.json not found! Wrong directory.
    pause
    exit /b 1
)

echo [SUCCESS] Found package.json in correct directory

REM Check if .env file exists
if not exist "client\.env" (
    echo [WARNING] Creating .env file from template...
    copy "client\env.example" "client\.env"
    echo [WARNING] Please update client\.env with your Supabase credentials!
    echo [WARNING] You need to:
    echo [WARNING] 1. Go to https://supabase.com and create a project
    echo [WARNING] 2. Get your project URL and anon key from Settings ^> API
    echo [WARNING] 3. Update client\.env with your credentials
    echo.
    pause
)

REM Check if .env has been updated
findstr /C:"your_supabase_project_url" "client\.env" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Please update client\.env with your actual Supabase credentials
    echo [ERROR] The file still contains placeholder values
    pause
    exit /b 1
)

echo [SUCCESS] Environment file configured

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    echo [SUCCESS] Dependencies installed
) else (
    echo [SUCCESS] Dependencies already installed
)

REM Start the development server
echo [INFO] Starting development server...
echo [SUCCESS] Server will be available at http://localhost:3000 (or next available port)
echo [SUCCESS] Press Ctrl+C to stop the server
echo.

npm run dev
