# 🚀 CollaboTree Complete Setup Guide

This guide will get your CollaboTree application running with Supabase in just a few steps.

## 🎯 **Quick Start (Recommended)**

### **Step 1: Run the Setup Script**

**For Mac/Linux:**
```bash
chmod +x start-app.sh
./start-app.sh
```

**For Windows:**
```cmd
start-app.bat
```

### **Step 2: Set Up Supabase**

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "collabotree"
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Get Your Credentials:**
   - Go to Settings > API
   - Copy your **Project URL**
   - Copy your **anon/public key**

3. **Update Environment File:**
   - Edit `client/.env`
   - Replace `your_supabase_project_url` with your actual URL
   - Replace `your_supabase_anon_key` with your actual key

### **Step 3: Set Up Database**

1. **Go to Supabase SQL Editor**
2. **Copy and paste the contents of `fix-supabase-complete.sql`**
3. **Execute the script**

### **Step 4: Start the Application**

The setup script will automatically start the development server. You'll see:
```
VITE v5.4.19 ready in XXX ms
➜ Local: http://localhost:3000/
```

## 🔧 **Manual Setup (If Scripts Don't Work)**

### **Step 1: Navigate to Correct Directory**
```bash
cd "/Users/rivalin/Downloads/collabotree 2/Collabotree09-main"
```

### **Step 2: Kill Existing Servers**
```bash
pkill -f vite
```

### **Step 3: Create Environment File**
```bash
cp client/env.example client/.env
```

### **Step 4: Update Environment File**
Edit `client/.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### **Step 5: Install Dependencies**
```bash
npm install
```

### **Step 6: Start Development Server**
```bash
npm run dev
```

## 🗄️ **Database Setup**

### **Run the SQL Script**

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor**
3. **Copy the contents of `fix-supabase-complete.sql`**
4. **Paste and execute the script**

This will create:
- All necessary tables
- Row Level Security policies
- Authentication setup
- Sample data structure

## 🧪 **Test the Application**

### **Test Credentials (After Seeding)**
- **Student**: `student@test.com` / `password123`
- **Buyer**: `buyer@test.com` / `password123`

### **Test Flow**
1. **Visit**: http://localhost:3000
2. **Register**: Create a new account
3. **Login**: Use your credentials
4. **Explore**: Check out the marketplace and dashboards

## 🐛 **Troubleshooting**

### **"Connection Refused" Error**
- Make sure you're in the correct directory
- Check that the server is running
- Try different ports (3000, 3001, 3002)

### **"Missing Supabase Environment Variables"**
- Check that `client/.env` exists
- Verify the file has your actual Supabase credentials
- Make sure there are no typos in the URLs

### **"User Registration Fails"**
- Check browser console for errors
- Verify the database setup script ran successfully
- Ensure RLS policies are enabled

### **Blank Page**
- Check browser console for JavaScript errors
- Verify the server is running on the correct port
- Try refreshing the page

## 📁 **Project Structure**

```
Collabotree09-main/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # API clients and utilities
│   │   └── pages/          # Page components
│   └── .env                # Environment variables
├── scripts/                # Database seeding
├── fix-supabase-complete.sql  # Database setup
├── start-app.sh            # Setup script (Mac/Linux)
├── start-app.bat           # Setup script (Windows)
└── package.json            # Dependencies
```

## 🎉 **Success!**

Once everything is set up, you should see:
- ✅ CollaboTree landing page
- ✅ Working authentication
- ✅ Role-based dashboards
- ✅ Project marketplace
- ✅ Real-time functionality

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for errors
2. Verify your Supabase project is set up correctly
3. Make sure you're in the correct directory
4. Try the automated setup scripts

The application is designed to work seamlessly once properly configured!
