import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Security
  enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
  enableCors: process.env.ENABLE_CORS !== 'false',
  enableHelmet: process.env.ENABLE_HELMET !== 'false',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
}));