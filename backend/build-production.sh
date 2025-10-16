#!/bin/bash

echo "🔨 Building CollaboTree for Railway Production..."

# Set production environment
export NODE_ENV=production

# Generate Prisma client (no database connection required)
echo "📦 Generating Prisma client..."
npx prisma generate

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Production build completed successfully!"
