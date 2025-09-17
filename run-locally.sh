#!/bin/bash

# CollaboTree Local Development Setup Script
# This script sets up and runs the complete CollaboTree application locally

set -e  # Exit on any error

echo "🌳 CollaboTree Local Development Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Setup Supabase
setup_supabase() {
    print_status "Setting up Supabase configuration..."
    
    if [ ! -f "client/.env" ]; then
        print_warning "No .env file found. Creating one from template..."
        cp client/env.example client/.env
        
        print_warning "Please update client/.env with your Supabase credentials:"
        print_warning "1. Go to https://supabase.com and create a new project"
        print_warning "2. Get your project URL and anon key from Settings > API"
        print_warning "3. Update the .env file with your credentials"
        print_warning "4. Run the database setup script"
        echo ""
        
        read -p "Press Enter when you've updated the .env file..."
    fi
    
    # Check if .env has been updated
    if grep -q "your_supabase_project_url" client/.env; then
        print_error "Please update client/.env with your actual Supabase credentials"
        print_error "Run: node setup-supabase-complete.js"
        exit 1
    fi
    
    print_success "Supabase configuration ready"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Root dependencies installed"
    else
        print_success "Root dependencies already installed"
    fi
    
    if [ ! -d "client/node_modules" ]; then
        cd client
        npm install
        cd ..
        print_success "Client dependencies installed"
    else
        print_success "Client dependencies already installed"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ -f "fix-supabase-complete.sql" ]; then
        print_warning "Database setup required!"
        print_warning "Please run the following SQL script in your Supabase SQL Editor:"
        print_warning "1. Go to your Supabase dashboard"
        print_warning "2. Navigate to SQL Editor"
        print_warning "3. Copy and paste the contents of fix-supabase-complete.sql"
        print_warning "4. Execute the script"
        echo ""
        
        read -p "Press Enter when you've run the database setup script..."
        print_success "Database setup completed"
    else
        print_error "Database setup script not found!"
        exit 1
    fi
}

# Seed database (optional)
seed_database() {
    print_status "Setting up database seeding..."
    
    if [ -f "scripts/seed.ts" ]; then
        read -p "Do you want to seed the database with test data? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Seeding database with test data..."
            
            # Check if service role key is available
            if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env 2>/dev/null || grep -q "SUPABASE_SERVICE_ROLE_KEY" client/.env 2>/dev/null; then
                npx tsx scripts/seed.ts
                print_success "Database seeded with test data"
                print_success "Test credentials:"
                print_success "  Student: student@test.com / password123"
                print_success "  Buyer: buyer@test.com / password123"
            else
                print_warning "Service role key not found. Skipping database seeding."
                print_warning "To seed the database later, add SUPABASE_SERVICE_ROLE_KEY to your .env file"
            fi
        fi
    fi
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    cd client
    print_success "Starting Vite development server..."
    print_success "Application will be available at: http://localhost:5173"
    print_success "Press Ctrl+C to stop the server"
    echo ""
    
    npm run dev
}

# Main execution
main() {
    echo "Starting CollaboTree local development setup..."
    echo ""
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Setup steps
    setup_supabase
    install_dependencies
    setup_database
    seed_database
    
    # Start the application
    start_dev_server
}

# Run main function
main "$@"
