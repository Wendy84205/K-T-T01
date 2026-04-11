import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  // FIX LỖ HỔNG 9: Bắt buộc phải có JWT_SECRET trong môi trường
  // Trước đây: fallback về string hardcoded yếu nếu env thiếu
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      '[JWT Config] CRITICAL: JWT_SECRET is missing or too short (min 32 chars). ' +
      'Set this in your .env file. Never use default values in production.'
    );
  }

  if (!refreshSecret || refreshSecret.length < 32) {
    throw new Error(
      '[JWT Config] CRITICAL: JWT_REFRESH_TOKEN_SECRET is missing or too short (min 32 chars). ' +
      'Set this in your .env file.'
    );
  }

  return {
    secret: jwtSecret,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenSecret: refreshSecret,
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
  };
});