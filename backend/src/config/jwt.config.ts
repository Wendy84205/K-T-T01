import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  
  // Cookie settings
  cookieName: process.env.JWT_COOKIE_NAME || 'refresh_token',
  cookieDomain: process.env.JWT_COOKIE_DOMAIN,
  cookieSecure: process.env.JWT_COOKIE_SECURE === 'true',
  cookieHttpOnly: process.env.JWT_COOKIE_HTTP_ONLY !== 'false',
  cookieSameSite: process.env.JWT_COOKIE_SAME_SITE || 'strict',
  cookieMaxAge: parseInt(process.env.JWT_COOKIE_MAX_AGE || '604800000', 10),
  
  // Token issuer
  issuer: process.env.JWT_ISSUER || 'cybersecure-api',
  audience: process.env.JWT_AUDIENCE || 'cybersecure-client',
}));