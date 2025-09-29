# CollaboTree Backend

A robust TypeScript backend for CollaboTree, a student freelancing marketplace built with Express, Prisma, JWT authentication, and Socket.IO.

## Features

### 🔐 Authentication & Security
- **JWT Access/Refresh Token System** with rotation
- **Hashed refresh token storage** with revocation
- **Role-based access control** (BUYER, STUDENT, ADMIN)
- **Rate limiting** on authentication endpoints
- **Strong password policy** with validation
- **CORS protection** and Helmet security headers
- **Zod validation** for all inputs

### 🏪 Marketplace Core
- **User Management** with roles and profiles
- **Service Creation** (students can offer services)
- **Hire Request System** (buyers → students)
- **Order Management** with status tracking
- **Critical Rule**: Buyers can only purchase each service once (lifetime)
- **Review System** for completed orders
- **Wallet System** with transaction tracking
- **Dispute Resolution** with admin oversight

### 💬 Real-time Chat
- **Socket.IO integration** for real-time messaging
- **Chat rooms** bound to accepted hire requests
- **Message persistence** in database
- **Read receipts** and typing indicators
- **Authentication required** for chat access

### 📊 Additional Features
- **Notification system** for key events
- **Pagination** for all list endpoints
- **Comprehensive error handling**
- **Request logging** with Morgan
- **Database migrations** with Prisma

## Tech Stack

- **Node.js 20+** with TypeScript
- **Express.js** web framework
- **Prisma ORM** with PostgreSQL
- **Socket.IO** for real-time features
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for validation
- **Helmet, CORS, Morgan** for security and logging

## Quick Start

### 1. Environment Setup

Copy the environment example and configure:
```bash
cp env.example .env
```

Update `.env` with your values:
```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/collabotree?schema=public
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with test data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/me` - Get current user profile
- `PATCH /api/me` - Update profile
- `PATCH /api/me/password` - Change password
- `GET /api/users/:id` - Get user public profile

### Services
- `GET /api/services` - List services (public)
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (STUDENT only)
- `PATCH /api/services/:id` - Update service (owner only)
- `DELETE /api/services/:id` - Delete service (owner only)

### Hire Requests
- `POST /api/hires` - Create hire request (BUYER only)
- `GET /api/hires/mine` - Get user's hire requests
- `GET /api/hires/:id` - Get hire request details
- `PATCH /api/hires/:id/accept` - Accept hire request (STUDENT only)
- `PATCH /api/hires/:id/reject` - Reject hire request (STUDENT only)
- `PATCH /api/hires/:id/cancel` - Cancel hire request

### Orders
- `POST /api/orders` - Create order from accepted hire
- `GET /api/orders/mine` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/pay` - Process payment

### Chat
- `GET /api/chat/rooms/:hireId/messages` - Get chat messages
- `POST /api/chat/rooms/:hireId/read` - Mark messages as read

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/users/:userId` - Get user reviews

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/entries` - Get wallet transactions

### Disputes
- `POST /api/disputes` - Create dispute
- `GET /api/disputes` - Get disputes
- `GET /api/disputes/:id` - Get dispute details
- `PATCH /api/disputes/:id/status` - Update dispute status (ADMIN only)

## Socket.IO Events

### Client → Server
- `chat:join` - Join chat room for hire request
- `chat:message:send` - Send message
- `chat:message:read` - Mark message as read
- `chat:typing` - Send typing indicator
- `chat:leave` - Leave chat room

### Server → Client
- `chat:joined` - Confirmation of joining room
- `chat:message:new` - New message received
- `chat:message:read` - Message read receipt
- `chat:typing` - Typing indicator from other user
- `chat:left` - Confirmation of leaving room
- `error` - Error messages

## Critical Business Rules

### One Purchase Per Service Rule
- **Enforcement**: Database-level unique constraint on `(buyerId, serviceId)`
- **Application Logic**: Transactional checks before order creation
- **Result**: A buyer can never purchase the same service twice, but can purchase different services from the same student

### Chat Access Control
- **Requirement**: Chat is only available for ACCEPTED hire requests
- **Authentication**: Socket.IO requires valid JWT token
- **Authorization**: Only hire request participants can join chat rooms

### Order Status Flow
```
PENDING → PAID → IN_PROGRESS → DELIVERED → COMPLETED
    ↓        ↓         ↓           ↓
CANCELLED CANCELLED CANCELLED  CANCELLED
```

## Test Data

The seed script creates:
- **1 Admin user**: admin@collabotree.com / admin123
- **2 Student users**: alice@student.com, bob@student.com / student123
- **2 Buyer users**: charlie@buyer.com, diana@buyer.com / buyer123
- **4 Services** with different price points
- **3 Hire requests** in various states
- **2 Orders** (1 completed, 1 in progress)
- **Sample chat messages** and reviews
- **Wallet entries** and notifications

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:deploy      # Deploy migrations (production)
npm run prisma:studio      # Open Prisma Studio
npm run seed              # Seed database

# Type checking
npx tsc --noEmit
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong, unique JWT secrets
3. Configure proper CORS origins
4. Set up PostgreSQL database
5. Run `npm run prisma:deploy` for migrations
6. Use PM2 or similar for process management

## Security Considerations

- **JWT Secrets**: Use cryptographically strong, unique secrets
- **Password Hashing**: bcrypt with 12+ rounds
- **Rate Limiting**: Configured for auth endpoints
- **CORS**: Restricted to client origin
- **Input Validation**: All inputs validated with Zod
- **SQL Injection**: Protected by Prisma ORM
- **XSS Protection**: Helmet middleware configured

## Database Schema

Key models:
- **User**: Authentication and profile data
- **Service**: Student-offered services
- **HireRequest**: Buyer → Student requests
- **Order**: Completed transactions
- **Message**: Chat messages
- **Review**: Order reviews
- **Notification**: User notifications
- **WalletEntry**: Financial transactions
- **Dispute**: Order disputes
- **RefreshToken**: JWT refresh token storage

## Contributing

1. Follow TypeScript best practices
2. Use Zod for all input validation
3. Implement proper error handling
4. Add tests for new features
5. Update documentation for API changes

## License

This project is part of the CollaboTree marketplace platform.
