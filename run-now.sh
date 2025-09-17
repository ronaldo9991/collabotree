#!/bin/bash

# Quick start script for CollaboTree
echo "🌳 Starting CollaboTree..."

# Kill existing processes
pkill -f vite 2>/dev/null || true

# Navigate to correct directory
cd "/Users/rivalin/Downloads/collabotree 2/Collabotree09-main"

# Check if .env exists, if not create it
if [ ! -f "client/.env" ]; then
    echo "Creating .env file..."
    cp client/env.example client/.env
    echo "⚠️  Please update client/.env with your Supabase credentials!"
    echo "You need to:"
    echo "1. Go to https://supabase.com and create a project"
    echo "2. Get your project URL and anon key"
    echo "3. Update client/.env with your credentials"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
fi

# Start the server
echo "🚀 Starting development server..."
npm run dev
