#!/bin/bash

echo "🔨 Building CollaboTree for Railway..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install

# Build backend
echo "🔨 Building backend..."
cd backend
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# Build frontend
echo "🔨 Building frontend..."
cd ../client
npm ci --legacy-peer-deps
npm run build

# Copy frontend to backend
echo "📁 Copying frontend to backend..."
cd ../backend
mkdir -p dist
cp -r ../client/dist dist/frontend

echo "✅ Railway build completed!"
