# CollaboTree Backend Setup

This document provides instructions for setting up the CollaboTree backend with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your service role key

### 2. Environment Configuration

1. Copy the environment example file:
   ```bash
   cp client/env.example client/.env.local
   ```

2. Update `client/.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_ENV=development
   ```

### 3. Database Migration

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/0001_init.sql`
4. Run the migration to create all tables, policies, and functions

### 4. Install Dependencies

```bash
cd client
npm install
```

### 5. Seed Database (Optional)

Create a `.env` file in the root directory with your service role key:
```env
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then run the seed script:
```bash
npx tsx scripts/seed.ts
```

This will create:
- 2 test users (student and buyer)
- 5 sample projects
- Test credentials:
  - Student: `student@test.com` / `password123`
  - Buyer: `buyer@test.com` / `password123`

### 6. Start Development Server

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## Features Implemented

### ✅ Completed
- **Database Schema**: Complete PostgreSQL schema with RLS policies
- **Authentication**: Supabase Auth integration with role-based access
- **Project Management**: Create, view, and manage projects
- **Application System**: Students can apply to projects, buyers can accept/reject
- **Real-time Chat**: Chat system unlocked after purchase/hire
- **Student Dashboard**: View applications, stats, and activity
- **Marketplace**: Browse and filter projects with real data

### 🔄 In Progress
- **Buyer Dashboard**: Manage projects and applications
- **File Storage**: ID card uploads and project assets
- **Payment Integration**: Stripe integration for transactions
- **Admin Panel**: User and project management

### 📋 Database Tables

- `users` - User profiles extending Supabase auth
- `students` - Student-specific information
- `buyers` - Buyer-specific information  
- `projects` - Project listings
- `project_applications` - Student applications to projects
- `project_assignments` - Accepted project engagements
- `orders` - Purchase/hire transactions
- `chat_threads` - Chat conversations
- `chat_messages` - Individual messages
- `admin_actions` - Admin audit log

### 🔐 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure authentication with Supabase Auth
- Message length limits and archival system
- Chat only unlocked after payment/acceptance

## API Structure

The application uses Supabase client-side APIs with the following main modules:

- `lib/supabase.ts` - Supabase client configuration
- `lib/auth.ts` - Authentication helpers
- `lib/api.ts` - Data access layer for projects, applications, chat, etc.

## Chat System

The chat system is designed to be lightweight and secure:

- Chat threads are only created after a purchase/hire transaction
- Messages are capped at 500 per thread with automatic archival
- Real-time updates using Supabase Realtime
- Read receipts and typing indicators (planned)

## Next Steps

1. Set up your Supabase project and run the migration
2. Configure environment variables
3. Seed the database with test data
4. Start the development server
5. Test the application with the provided credentials

For questions or issues, please refer to the Supabase documentation or create an issue in the repository.
