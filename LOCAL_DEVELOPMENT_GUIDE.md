# CollaboTree Local Development Guide

This guide will help you set up and run the complete CollaboTree application locally.

## 🏗️ Architecture Overview

CollaboTree uses a modern full-stack architecture:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Database + Authentication + Real-time)
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React Context + Hooks
- **Routing**: Wouter (lightweight router)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make the script executable and run it
chmod +x run-locally.sh
./run-locally.sh
```

This script will:
- Check system requirements
- Set up Supabase configuration
- Install all dependencies
- Guide you through database setup
- Optionally seed test data
- Start the development server

### Option 2: Manual Setup

Follow the steps below for manual setup.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase Account** - [Sign up here](https://supabase.com)

## 🔧 Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd "Collabotree09-main"
```

### 2. Supabase Project Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "collabotree"
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Get Project Credentials**:
   - Go to Settings > API
   - Copy your Project URL
   - Copy your anon/public key

### 3. Environment Configuration

```bash
# Copy the environment template
cp client/env.example client/.env

# Edit the .env file with your Supabase credentials
nano client/.env  # or use your preferred editor
```

Update `client/.env` with your actual Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:5000/api

# Development
VITE_APP_ENV=development
```

### 4. Database Setup

1. **Run Database Migration**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy the contents of `fix-supabase-complete.sql`
   - Paste and execute the script

2. **Verify Tables Created**:
   - Go to Table Editor
   - You should see these tables:
     - `users`
     - `students`
     - `buyers`
     - `projects`
     - `project_applications`
     - `project_assignments`
     - `orders`
     - `chat_threads`
     - `chat_messages`
     - `admin_actions`

### 5. Authentication Setup

In your Supabase dashboard:

1. **Go to Authentication > Settings**
2. **Enable Email authentication**
3. **Set Site URL**: `http://localhost:5173`
4. **Add Redirect URLs**:
   - `http://localhost:5173/dashboard/student`
   - `http://localhost:5173/dashboard/buyer`
   - `http://localhost:5173/admin`

### 6. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 7. Seed Database (Optional)

Create a `.env` file in the root directory for seeding:

```bash
# Create root .env file
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

Get your service role key from Supabase Settings > API.

Then run the seed script:

```bash
npx tsx scripts/seed.ts
```

This creates test users:
- **Student**: `student@test.com` / `password123`
- **Buyer**: `buyer@test.com` / `password123`

### 8. Start Development Server

```bash
cd client
npm run dev
```

The application will be available at: **http://localhost:5173**

## 🧪 Testing the Application

### 1. Test Registration

1. Go to `http://localhost:5173/signin`
2. Switch to "Register" tab
3. Register as a **Student**:
   - Fill in all required fields
   - Should redirect to `/dashboard/student`
4. Register as a **Buyer**:
   - Fill in all required fields
   - Should redirect to `/dashboard/buyer`

### 2. Test Login

1. Use the credentials from registration or seeded data
2. Should redirect directly to the appropriate dashboard
3. Verify role-based access

### 3. Test Core Features

- **Student Dashboard**: View applications, create projects
- **Buyer Dashboard**: View projects, manage applications
- **Marketplace**: Browse and filter projects
- **Project Details**: View project information
- **Applications**: Apply to projects (students) or manage applications (buyers)

## 🐛 Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
```bash
# Check your .env file
cat client/.env

# Ensure variables are set correctly
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### "User registration fails"
- Check browser console for errors
- Verify RLS policies are set up correctly
- Ensure the database migration ran successfully

#### "Permission denied errors"
- Verify RLS is enabled on all tables
- Check that the `fix-supabase-complete.sql` script ran completely
- Ensure user has proper role assigned

#### "Port already in use"
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
cd client
npm run dev -- --port 3000
```

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   cd client
   cat .env
   ```

2. **Verify Database Setup**:
   - Go to Supabase dashboard > Table Editor
   - Check that all tables exist
   - Verify RLS is enabled

3. **Check Authentication**:
   - Go to Supabase dashboard > Authentication > Users
   - Verify users are being created
   - Check user metadata

4. **Browser Console**:
   - Open browser developer tools
   - Check for JavaScript errors
   - Look for network request failures

## 📁 Project Structure

```
Collabotree09-main/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API clients
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   ├── .env                # Environment variables
│   └── package.json        # Frontend dependencies
├── scripts/                # Database seeding scripts
├── supabase/              # Database migrations
├── fix-supabase-complete.sql  # Database setup script
├── run-locally.sh         # Automated setup script
└── package.json           # Root dependencies
```

## 🔧 Development Scripts

```bash
# Start development server
cd client && npm run dev

# Build for production
cd client && npm run build

# Preview production build
cd client && npm run preview

# Type checking
cd client && npm run check

# Seed database
npx tsx scripts/seed.ts
```

## 🌐 Available Routes

- `/` - Landing page
- `/signin` - Authentication (login/register)
- `/marketplace` - Browse projects
- `/dashboard/student` - Student dashboard
- `/dashboard/buyer` - Buyer dashboard
- `/admin` - Admin dashboard
- `/service/:id` - Project details
- `/how-it-works` - How it works page
- `/about` - About page

## 🚀 Production Deployment

For production deployment:

1. **Update Environment Variables**:
   - Set production Supabase URLs
   - Update redirect URLs in Supabase Auth settings

2. **Build the Application**:
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**:
   - Deploy the `client/dist` folder to your hosting service
   - Update Supabase Auth settings with production URLs

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify Supabase dashboard configuration
5. Ensure all environment variables are set correctly

The application should now be running locally with full functionality!
