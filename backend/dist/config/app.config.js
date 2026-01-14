"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    logLevel: process.env.LOG_LEVEL || 'debug',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
}));
//# sourceMappingURL=app.config.js.map