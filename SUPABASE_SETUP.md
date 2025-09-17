# Supabase Setup Instructions

## Problem Identified
The current Supabase project URL `kovcmbtqpfetpzjncdyk.supabase.co` does not exist (NXDOMAIN error), causing the "failed to fetch" error during sign-up and login.

## Solution: Create New Supabase Project

### Step 1: Create Supabase Account & Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `collabotree` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
6. Click "Create new project"

### Step 2: Get Your Project Credentials
1. Once the project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Update Environment Variables
Replace the values in your `.env` file:

```bash
# Supabase Configuration
VITE_NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migration script from `supabase/migrations/0001_init.sql`
3. This will create all the necessary tables for the application

### Step 5: Test the Connection
After updating the environment variables:
1. Restart your development server
2. Try signing up and logging in
3. The "failed to fetch" error should be resolved

## Alternative: Use Local Supabase (Development)
If you prefer to run Supabase locally for development:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Start local Supabase
supabase start

# This will give you local URLs and keys to use in your .env file
```

## Current Status
- ❌ Supabase project URL is invalid/non-existent
- ✅ Network connection is working
- ✅ Application code is correct
- ⏳ Waiting for new Supabase project setup
