import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  enabled: process.env.REDIS_ENABLED === 'true',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  
  // Connection settings
  tls: process.env.REDIS_TLS === 'true',
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
  
  // Cache settings
  defaultTtl: parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10), // 1 hour
  prefix: process.env.REDIS_PREFIX || 'cybersecure:',
}));