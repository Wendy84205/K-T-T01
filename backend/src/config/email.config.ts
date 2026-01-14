import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  enabled: process.env.EMAIL_ENABLED === 'true',
  
  // SMTP settings
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  
  // Email defaults
  fromName: process.env.EMAIL_FROM_NAME || 'Cybersecure System',
  fromEmail: process.env.EMAIL_FROM_EMAIL || 'noreply@cybersecure.local',
  
  // Templates
  templateDir: process.env.EMAIL_TEMPLATE_DIR || './templates/email',
  
  // Email verification
  verificationTokenExpiry: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY || '86400000', 10), // 24 hours
  
  // Password reset
  resetTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY || '3600000', 10), // 1 hour
}));