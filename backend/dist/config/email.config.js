"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('email', () => ({
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'Cybersecure System',
    fromEmail: process.env.EMAIL_FROM_EMAIL || 'noreply@cybersecure.local',
    templateDir: process.env.EMAIL_TEMPLATE_DIR || './templates/email',
    verificationTokenExpiry: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY || '86400000', 10),
    resetTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY || '3600000', 10),
}));
//# sourceMappingURL=email.config.js.map