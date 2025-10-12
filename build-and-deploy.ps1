# Build and Deploy Script for Collabotree
# This script builds both frontend and backend, then deploys to Vercel

Write-Host "🚀 Starting Build Process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "📦 Step 1/4: Building frontend..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Copy Frontend to Backend
Write-Host "📂 Step 2/4: Copying frontend to backend..." -ForegroundColor Green
if (Test-Path "backend\dist\dist") {
    Remove-Item -Recurse -Force "backend\dist\dist"
}
Copy-Item -Recurse -Force "dist" "backend\dist\"
Write-Host "✅ Frontend copied to backend/dist/dist" -ForegroundColor Green
Write-Host ""

# Step 3: Build Backend
Write-Host "🔧 Step 3/4: Building backend..." -ForegroundColor Green
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy to Vercel
Write-Host "🚀 Step 4/4: Deploying to Vercel..." -ForegroundColor Green
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "💡 Try running 'vercel login' first if authentication failed" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "✨ Your app should be live at your Vercel URL" -ForegroundColor Green


