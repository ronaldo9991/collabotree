#!/bin/bash

echo "🚀 Starting CollaboTree Backend on Railway (Optimized)..."

# Set production environment
export NODE_ENV=production

# Check environment variables quickly
if [ -z "$DATABASE_URL" ] || [ -z "$JWT_ACCESS_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
  echo "❌ Missing required environment variables"
  exit 1
fi

echo "✅ Environment variables validated"

# Determine database URL
FINAL_DATABASE_URL="${DATABASE_PUBLIC_URL:-$DATABASE_URL}"

# Quick validation
if [[ ! "$FINAL_DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "❌ Invalid DATABASE_URL format"
  exit 1
fi

# Run database migrations quickly
echo "🗄️ Running database migrations..."
DATABASE_URL="$FINAL_DATABASE_URL" npx prisma migrate deploy --schema=prisma/schema.prisma

# Ensure admin exists
echo "👤 Creating admin user..."
node force-create-admin.js || true

# Start server directly
echo "🌟 Starting server..."
node dist/server.js
