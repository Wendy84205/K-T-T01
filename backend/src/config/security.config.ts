import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // Password
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  passwordRequireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
  
  // Login security
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  loginLockoutTime: parseInt(process.env.LOGIN_LOCKOUT_TIME || '900000', 10), // 15 minutes
  requireMfa: process.env.REQUIRE_MFA === 'true',
  
  // HTTPS/SSL
  requireHttps: process.env.REQUIRE_HTTPS === 'true',
  hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10), // 1 year
}));