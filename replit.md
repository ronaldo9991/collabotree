# CollaboTree - Student-Only Freelancing Platform

## Overview

CollaboTree is a premium student-only freelancing marketplace that connects verified students with buyers for high-quality project work. The platform features a modern, design-first approach with three distinct user roles: students (service providers), buyers (customers), and admins (platform managers). Built with a focus on quality assurance, the platform includes rigorous student verification, real-time communication, and comprehensive project management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Framer Motion** for smooth animations and micro-interactions
- **Tailwind CSS** with custom design tokens for consistent styling
- **shadcn/ui** component library for consistent UI patterns

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **RESTful API design** with clear separation of concerns
- **WebSocket integration** for real-time features like messaging
- **File upload handling** with object storage integration
- **Session-based authentication** with PostgreSQL session storage
- **Middleware pipeline** for request logging, authentication, and error handling

### Data Storage Solutions
- **PostgreSQL** as the primary database with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations and migrations
- **Object storage** for file uploads (profile images, project deliverables)
- **Session storage** in PostgreSQL for authentication state

### Authentication and Authorization
- **Replit Auth** integration with OpenID Connect (OIDC)
- **Role-based access control** with three distinct user types (student, buyer, admin)
- **Email domain validation** for student verification using .edu domains
- **Student ID verification** with OCR technology for additional validation
- **Protected routes** with middleware-based authorization checks

### External Dependencies
- **Neon Database** - Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage** - Object storage for file uploads and media
- **Replit Auth** - OpenID Connect authentication provider
- **WebSocket connections** - Real-time communication for order management and messaging
- **OCR services** - Student ID verification and document processing
- **Email domain validation** - Academic institution verification system

### Key Features Architecture
- **Marketplace search and filtering** with real-time updates
- **Order management system** with status tracking and milestone management
- **Real-time messaging** with file sharing capabilities
- **Review and rating system** for quality assurance
- **Earnings and payout tracking** for students
- **Admin dashboard** for platform management and user verification
- **Command palette** for quick navigation and actions
- **Responsive design** with mobile-first approach and dark mode support

### Design System
- **Custom color palette** with primary blue (#00A9FF) and complementary colors
- **Golden ratio spacing** for consistent visual rhythm
- **Micro-glass card design** with subtle translucency effects
- **Comprehensive theme system** with CSS custom properties
- **Animation choreography** with staggered content reveals and smooth transitions