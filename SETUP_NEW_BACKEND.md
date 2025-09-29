# Collabotree - Fresh Backend Setup Guide

This guide will help you set up a fresh backend with Express.js, Prisma, and PostgreSQL to replace the Supabase setup.

## 🎯 What's New

- **Express.js Backend**: Modern Node.js API server
- **Prisma ORM**: Type-safe database operations
- **PostgreSQL**: Robust relational database
- **JWT Authentication**: Secure token-based auth
- **RESTful API**: Clean, predictable endpoints
- **TypeScript**: Full type safety

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

## 🚀 Quick Setup

### 1. Set Up Database

Create a PostgreSQL database:

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE collabotree;
CREATE USER collabotree_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE collabotree TO collabotree_user;

-- Exit PostgreSQL
\q
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Run the setup script
./setup.sh
```

The setup script will:
- Install dependencies
- Create `.env` file from template
- Generate Prisma client
- Set up database schema
- Seed with sample data

### 3. Configure Environment

Edit `backend/.env` with your database credentials:

```env
DATABASE_URL="postgresql://collabotree_user:your_secure_password@localhost:5432/collabotree"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Test the API

```bash
cd backend
node test-api.js
```

This will test all major API endpoints.

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Set up database schema
npm run db:push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## 🎨 Frontend Integration

### 1. Update Environment

Add to your frontend `.env` file:

```env
VITE_API_URL="http://localhost:3001/api"
```

### 2. Use New API Client

The new API client is already created at `client/src/lib/api-client.ts`. 

To use it in your components:

```typescript
import { apiClient } from '@/lib/api-client';

// Login
const { user, token } = await apiClient.login(email, password);

// Get projects
const { data: projects } = await apiClient.getProjects();

// Create project
const project = await apiClient.createProject({
  title: 'My Project',
  description: 'Project description',
  ownerRole: 'student',
  budget: 1000,
  tags: ['react', 'nodejs']
});
```

### 3. Update Auth Context

The new auth context is at `client/src/contexts/AuthContextNew.tsx`. Update your `main.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContextNew';

// Use the new AuthProvider
<AuthProvider>
  <App />
</AuthProvider>
```

## 📊 Database Schema

The new database includes these main entities:

- **Users**: User accounts with roles (STUDENT, BUYER, ADMIN)
- **Students**: Student-specific profiles with skills and university
- **Buyers**: Buyer-specific profiles with company info
- **Projects**: Project listings with budgets and tags
- **ProjectApplications**: Student applications to projects
- **ProjectAssignments**: Project assignments after acceptance
- **Orders**: Payment orders and transactions
- **ChatThreads**: Chat conversations between users
- **ChatMessages**: Individual chat messages
- **AdminActions**: Admin activity logs

## 🔐 Default Users

After seeding, these users are available:

- **Admin**: `admin@collabotree.com` / `admin123`
- **Student**: `student@example.com` / `student123`
- **Buyer**: `buyer@example.com` / `buyer123`

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all open projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Applications
- `POST /api/applications` - Apply to project
- `GET /api/applications/project/:projectId` - Get project applications
- `PUT /api/applications/:id/status` - Update application status

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

### Chat
- `POST /api/chat/thread` - Get or create chat thread
- `GET /api/chat/threads` - Get user's chat threads
- `GET /api/chat/thread/:threadId/messages` - Get messages
- `POST /api/chat/thread/:threadId/messages` - Send message

## 🔄 Migration from Supabase

### Key Differences

1. **Authentication**: JWT tokens instead of Supabase auth
2. **Database**: PostgreSQL with Prisma instead of Supabase
3. **Real-time**: No built-in real-time features (can add WebSockets later)
4. **API**: RESTful endpoints instead of Supabase client methods

### Migration Steps

1. **Update API calls**: Replace Supabase client calls with new API client methods
2. **Update data types**: Use new TypeScript interfaces from `api-client.ts`
3. **Update authentication**: Use new auth context and JWT tokens
4. **Test functionality**: Verify all features work with new backend

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection
psql -h localhost -U collabotree_user -d collabotree
```

### Backend Won't Start

1. Check if port 3001 is available
2. Verify `.env` file has correct database URL
3. Ensure PostgreSQL is running
4. Check Node.js version (v18+)

### API Tests Fail

1. Make sure backend server is running
2. Check database connection
3. Verify environment variables
4. Run setup script again

### Frontend Connection Issues

1. Verify `VITE_API_URL` is set correctly
2. Check CORS settings in backend
3. Ensure backend is running on correct port
4. Check browser console for errors

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/collabotree"
JWT_SECRET="very-long-secure-random-string"
PORT=3001
FRONTEND_URL="https://yourdomain.com"
```

### Database

1. Use production PostgreSQL instance
2. Set up proper backups
3. Configure connection pooling
4. Use SSL connections

### Security

1. Use strong JWT secrets
2. Enable HTTPS
3. Set up proper CORS origins
4. Use environment variables for secrets
5. Set up rate limiting

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the backend logs
3. Test API endpoints manually
4. Verify database connectivity
5. Check environment variables

The backend is now ready to use! Start the server and begin integrating with your frontend.
