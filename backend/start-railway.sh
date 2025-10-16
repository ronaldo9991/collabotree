#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway..."

# Set environment
export NODE_ENV=production

# Test database connection
echo "🔍 Testing database connection..."
npx prisma db push --accept-data-loss

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Start the server
echo "🌟 Starting server..."
npm start
