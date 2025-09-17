#!/bin/bash

# CollaboTree Complete Setup and Start Script
# This script fixes all issues and starts the application

echo "🌳 CollaboTree Complete Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kill all existing processes
print_status "Killing all existing servers..."
pkill -f vite 2>/dev/null || true
pkill -f "node.*dev" 2>/dev/null || true
sleep 2

# Navigate to correct directory
print_status "Navigating to correct directory..."
cd "/Users/rivalin/Downloads/collabotree 2/Collabotree09-main"

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Wrong directory."
    exit 1
fi

print_success "Found package.json in correct directory"

# Check if .env file exists
if [ ! -f "client/.env" ]; then
    print_warning "Creating .env file from template..."
    cp client/env.example client/.env
    print_warning "Please update client/.env with your Supabase credentials!"
    print_warning "You need to:"
    print_warning "1. Go to https://supabase.com and create a project"
    print_warning "2. Get your project URL and anon key from Settings > API"
    print_warning "3. Update client/.env with your credentials"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
fi

# Check if .env has been updated
if grep -q "your_supabase_project_url" client/.env; then
    print_error "Please update client/.env with your actual Supabase credentials"
    print_error "The file still contains placeholder values"
    exit 1
fi

print_success "Environment file configured"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Start the development server
print_status "Starting development server..."
print_success "Server will be available at http://localhost:3000 (or next available port)"
print_success "Press Ctrl+C to stop the server"
echo ""

npm run dev
