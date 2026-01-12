"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('security', () => ({
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    passwordRequireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    loginLockoutTime: parseInt(process.env.LOGIN_LOCKOUT_TIME || '900000', 10),
    requireMfa: process.env.REQUIRE_MFA === 'true',
    requireHttps: process.env.REQUIRE_HTTPS === 'true',
    hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
}));
//# sourceMappingURL=security.config.js.map