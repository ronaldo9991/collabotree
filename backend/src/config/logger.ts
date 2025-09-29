import morgan from 'morgan';
import { env } from './env.js';

const isDevelopment = env.NODE_ENV === 'development';

// Custom token for request ID
morgan.token('id', (req: any) => req.id);

// Development format with colors
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format as JSON
const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time ms',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  remoteAddr: ':remote-addr',
  timestamp: ':date[iso]'
});

export const logger = morgan(isDevelopment ? devFormat : prodFormat, {
  skip: (req, res) => {
    // Skip logging for health checks in production
    return env.NODE_ENV === 'production' && req.url === '/health';
  }
});

export const createRequestLogger = () => logger;
