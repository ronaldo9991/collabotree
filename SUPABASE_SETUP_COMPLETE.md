# CollaboTree Supabase Setup Guide

This guide will help you set up Supabase for CollaboTree with proper authentication and role-based routing.

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
node setup-supabase-complete.js
```

This will:
- Create your `.env` file with Supabase configuration
- Generate setup instructions
- Guide you through the process

### 2. Database Setup

Run the SQL script in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-supabase-complete.sql`
4. Execute the script

### 3. Authentication Configuration

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Enable **Email** authentication
3. Set **Site URL** to: `http://localhost:5173`
4. Add these **Redirect URLs**:
   - `http://localhost:5173/dashboard/student`
   - `http://localhost:5173/dashboard/buyer`
   - `http://localhost:5173/admin`

## 🔧 What's Fixed

### Authentication Flow
- ✅ Fixed environment variable names (`VITE_SUPABASE_URL` instead of `VITE_NEXT_PUBLIC_SUPABASE_URL`)
- ✅ Proper role-based routing after sign-in
- ✅ Direct redirect to appropriate dashboard based on user role
- ✅ Fixed registration form data structure

### Database Policies
- ✅ Fixed Row Level Security (RLS) policies
- ✅ Allow user registration without authentication
- ✅ Proper data isolation between users
- ✅ Admin access to all data
- ✅ Role-based access control

### User Registration
- ✅ Fixed data structure mismatch between form and API
- ✅ Proper handling of student vs buyer registration
- ✅ University field for students
- ✅ Company name and industry for buyers

## 🧪 Testing the Setup

### 1. Start Development Server

```bash
cd client
npm run dev
```

### 2. Test Registration

1. Go to `http://localhost:5173/signin`
2. Switch to "Register" tab
3. Try registering as a **Student**:
   - Fill in all required fields
   - Should redirect to `/dashboard/student`
4. Try registering as a **Buyer**:
   - Fill in all required fields
   - Should redirect to `/dashboard/buyer`

### 3. Test Login

1. Use the credentials from registration
2. Should redirect directly to the appropriate dashboard
3. No more generic `/dashboard` redirect

## 🐛 Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
- Check that your `.env` file exists in the `client` directory
- Verify the variable names match: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### "User registration fails"
- Check browser console for specific error messages
- Verify RLS policies are properly set up
- Ensure the SQL script ran successfully

#### "Redirect to wrong dashboard"
- Check that user role is properly set in the database
- Verify the authentication context is working
- Check browser console for errors

#### "Permission denied errors"
- Verify RLS policies are enabled on all tables
- Check that the `fix-supabase-complete.sql` script ran completely
- Ensure user has proper role assigned

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   cd client
   cat .env
   ```

2. **Verify Database Setup**:
   - Go to Supabase dashboard > Table Editor
   - Check that `users`, `students`, and `buyers` tables exist
   - Verify RLS is enabled on all tables

3. **Check Authentication**:
   - Go to Supabase dashboard > Authentication > Users
   - Verify users are being created
   - Check user metadata and roles

4. **Browser Console**:
   - Open browser developer tools
   - Check for JavaScript errors
   - Look for network request failures

## 📁 Files Modified

- `client/src/lib/supabase.ts` - Fixed environment variable names
- `client/src/pages/SignIn.tsx` - Fixed registration form and routing
- `client/src/contexts/AuthContext.tsx` - Updated to return user data
- `fix-supabase-complete.sql` - Complete database setup script
- `setup-supabase-complete.js` - Automated setup script

## 🎯 Expected Behavior

After successful setup:

1. **Registration**: Users can register as students or buyers
2. **Login**: Users are redirected to role-specific dashboards
3. **Data Access**: Users can only see their own data
4. **Admin Access**: Admins can see all data
5. **Security**: Proper RLS policies protect user data

## 🚀 Production Deployment

For production deployment:

1. Update Supabase Auth settings with production URLs
2. Set up proper environment variables
3. Configure additional security features
4. Test thoroughly before going live

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify Supabase dashboard configuration

The setup should now work seamlessly with proper role-based authentication and routing!
