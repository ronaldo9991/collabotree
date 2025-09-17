# ✅ CollaboTree Setup Checklist

## 🎯 Goal: Fix "Failed to Fetch" Error
The old Supabase project `kovcmbtqpfetpzjncdyk.supabase.co` doesn't exist, causing the error.

## 📋 Setup Steps

### Step 1: Create New Supabase Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Fill in project details:
  - [ ] Name: `collabotree`
  - [ ] Database Password: (create strong password)
  - [ ] Region: (choose closest)
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for project to be ready

### Step 2: Get Credentials
- [ ] Go to Settings → API in your new project
- [ ] Copy Project URL (looks like: `https://abcdefgh.supabase.co`)
- [ ] Copy anon public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Set Up Database
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Click "New query"
- [ ] Copy entire content from `supabase/migrations/0001_init.sql`
- [ ] Paste into SQL editor
- [ ] Click "Run" (or Ctrl+Enter)
- [ ] Wait for migration to complete

### Step 4: Test Connection
- [ ] Open `quick-test.js`
- [ ] Replace placeholder values with your credentials:
  ```javascript
  const SUPABASE_URL = "https://your-project-id.supabase.co"
  const SUPABASE_ANON_KEY = "your-anon-key-here"
  ```
- [ ] Run: `node quick-test.js`
- [ ] Verify all tests pass ✅

### Step 5: Update Environment Variables
- [ ] Open `update-env-simple.js`
- [ ] Replace placeholder values with your credentials
- [ ] Run: `node update-env-simple.js`
- [ ] Verify .env file is updated

### Step 6: Test Application
- [ ] Restart dev server: `npm run dev`
- [ ] Go to http://localhost:3000/signin
- [ ] Try signing up with new account
- [ ] Try logging in
- [ ] Verify no "failed to fetch" errors

## 🎉 Success Criteria
- [ ] No more "failed to fetch" errors
- [ ] Sign-up works
- [ ] Login works
- [ ] User profiles are created correctly

## 📁 Files Available
- `quick-test.js` - Test your connection
- `update-env-simple.js` - Update environment variables
- `QUICK_SETUP_GUIDE.md` - Detailed instructions
- `SUPABASE_SETUP.md` - Technical details
- `step-by-step-setup.js` - Interactive guide

## 🆘 Need Help?
If you get stuck at any step, let me know which step you're on and I'll help you through it!

## 🚀 Current Status
- ✅ Problem identified
- ✅ Setup scripts created
- ⏳ Waiting for new Supabase project
- ⏳ Ready to test and update
