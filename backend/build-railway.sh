#!/bin/bash

echo "🚀 Railway Build Script for CollaboTree"

# Set production environment
export NODE_ENV=production

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Railway build completed successfully!"
