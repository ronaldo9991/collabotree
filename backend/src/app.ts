import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Railway (fixes rate limiting error)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - more permissive for production
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002', 
  env.CLIENT_ORIGIN
].filter(Boolean);

// Add dynamic origin for production
if (env.NODE_ENV === 'production') {
  allowedOrigins.push('https://*.onrender.com');
  allowedOrigins.push('https://*.vercel.app');
  allowedOrigins.push('https://*.railway.app');
  allowedOrigins.push('https://*.up.railway.app');
  
  // Add Railway's provided domain if available
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL;
  if (railwayDomain) {
    allowedOrigins.push(`https://${railwayDomain}`);
    allowedOrigins.push(`http://${railwayDomain}`);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        return origin.includes(allowed.replace('*', ''));
      }
      return origin === allowed;
    })) {
      return callback(null, true);
    }
    
    // For production, be more permissive
    if (env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
});

// Test endpoint to check if server is working
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <head><title>CollaboTree Test</title></head>
      <body>
        <h1>🚀 CollaboTree Server is Running!</h1>
        <p>Environment: ${env.NODE_ENV}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Frontend should be served at the root path (/)</p>
      </body>
    </html>
  `);
});

// API routes
app.use('/api', routes);

// Serve static files in production
if (env.NODE_ENV === 'production') {
  // Frontend files are copied to dist/frontend during build
  const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, 'frontend');
  
  console.log(`🌍 Production mode: Serving frontend + backend`);
  console.log(`📁 Frontend path: ${frontendPath}`);
  console.log(`📁 Current directory: ${__dirname}`);
  
  // Debug: Check if frontend files exist
  const { existsSync, readdirSync } = await import('fs');
  if (existsSync(frontendPath)) {
    console.log(`✅ Frontend directory exists`);
    const files = readdirSync(frontendPath);
    console.log(`📋 Frontend files:`, files);
    
    const indexPath = path.join(frontendPath, 'index.html');
    if (existsSync(indexPath)) {
      console.log(`✅ index.html exists at: ${indexPath}`);
    } else {
      console.log(`❌ index.html NOT found at: ${indexPath}`);
    }
  } else {
    console.log(`❌ Frontend directory does NOT exist: ${frontendPath}`);
  }
  
  // Serve static files with proper headers for CSS/JS assets
  app.use(express.static(frontendPath, {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set proper MIME types for CSS and JS files
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  }));
  
  // Handle SPA routing - serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    // Don't handle API routes, health check, or socket.io
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/socket.io') || 
        req.path === '/health') {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;