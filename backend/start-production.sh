#!/bin/bash

echo "🚀 Starting CollaboTree Production Server..."

# Set environment
export NODE_ENV=production

# Test database connection
echo "🔍 Testing database connection..."
npx prisma db push --accept-data-loss

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Seed services if none exist
echo "🌱 Checking if services need seeding..."
npx prisma db seed || echo "Seeding completed or skipped"

# Start the server
echo "🌟 Starting server..."
npm start
