import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Railway deployment (fixes rate limiting warning)
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

// API routes
app.use('/api', routes);

// Serve static files in production
if (env.NODE_ENV === 'production') {
  // Railway build places frontend at dist/frontend (backend/dist/frontend)
  const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, 'frontend');
  
  // Serve static files
  app.use(express.static(frontendPath, {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
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
    const indexPath = path.join(frontendPath, 'index.html');
    console.log(`🔍 Attempting to serve index.html from: ${indexPath}`);
    
    if (!existsSync(indexPath)) {
      console.error(`❌ index.html not found at: ${indexPath}`);
      console.log(`📁 Frontend directory contents:`, readdirSync(frontendPath));
      
      // Try to serve fallback HTML
      const fallbackPath = path.join(__dirname, 'fallback-index.html');
      if (existsSync(fallbackPath)) {
        console.log(`🔄 Serving fallback HTML from: ${fallbackPath}`);
        res.sendFile(fallbackPath);
        return;
      }
      
      res.status(500).send(`
        <html>
          <head><title>CollaboTree - Setup Required</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5;">
            <h1 style="color: #00B2FF;">CollaboTree</h1>
            <h2>Application Setup Required</h2>
            <p>The frontend files are not available. This usually means the build process needs to complete.</p>
            <p>Please check the deployment logs for build errors.</p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Frontend path: ${frontendPath}<br>
              Index file: ${indexPath}
            </p>
          </body>
        </html>
      `);
      return;
    }
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send(`
          <html>
            <head><title>CollaboTree - Error</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5;">
              <h1 style="color: #00B2FF;">CollaboTree</h1>
              <h2>Error Loading Application</h2>
              <p>There was an error serving the application files.</p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Error: ${err.message}</p>
            </body>
          </html>
        `);
      }
    });
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;