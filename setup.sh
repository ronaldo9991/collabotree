#!/bin/bash

echo "🚀 CollaboTree Setup Script"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd client
npm install

echo ""
echo "🔧 Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development
VITE_APP_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update client/.env with your Supabase credentials:"
echo "   - VITE_SUPABASE_URL: Your Supabase project URL"
echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key"
echo ""
echo "2. Run the database migration in your Supabase dashboard:"
echo "   - Copy the contents of supabase/migrations/0001_init.sql"
echo "   - Paste and run it in your Supabase SQL Editor"
echo ""
echo "3. (Optional) Seed the database:"
echo "   - Set SUPABASE_SERVICE_ROLE_KEY in a .env file in the root"
echo "   - Run: npx tsx scripts/seed.ts"
echo ""
echo "4. Start the development server:"
echo "   cd client && npm run dev"
echo ""
echo "🎉 Setup complete! The frontend will be available at http://localhost:5173"
