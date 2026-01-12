"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Joi = require("joi");
const app_config_1 = require("./app.config");
const database_config_1 = require("./database.config");
const jwt_config_1 = require("./jwt.config");
const security_config_1 = require("./security.config");
const file_config_1 = require("./file.config");
const email_config_1 = require("./email.config");
const redis_config_1 = require("./redis.config");
const configuration_service_1 = require("./configuration.service");
let ConfigurationModule = class ConfigurationModule {
};
ConfigurationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    app_config_1.default,
                    database_config_1.default,
                    jwt_config_1.default,
                    security_config_1.default,
                    file_config_1.default,
                    email_config_1.default,
                    redis_config_1.default,
                ],
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'test', 'staging')
                        .default('development'),
                    PORT: Joi.number().port().default(3001),
                    API_PREFIX: Joi.string().default('api/v1'),
                    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
                    API_URL: Joi.string().default('http://localhost:3001'),
                    FRONTEND_URL: Joi.string().default('http://localhost:3000'),
                    DB_HOST: Joi.string().default('localhost'),
                    DB_PORT: Joi.number().port().default(3306),
                    DB_USERNAME: Joi.string().default('root'),
                    DB_PASSWORD: Joi.string().allow('').default(''),
                    DB_DATABASE: Joi.string().default('cybersecure_db'),
                    DB_SYNC: Joi.boolean().default(false),
                    DB_LOGGING: Joi.boolean().default(false),
                    DB_MIGRATIONS_RUN: Joi.boolean().default(false),
                    DB_DROP_SCHEMA: Joi.boolean().default(false),
                    DB_MAX_CONNECTIONS: Joi.number().default(10),
                    DB_CONNECTION_TIMEOUT: Joi.number().default(30000),
                    DB_SSL: Joi.boolean().default(false),
                    JWT_SECRET: Joi.string().required(),
                    JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
                    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
                    JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),
                    JWT_COOKIE_NAME: Joi.string().default('refresh_token'),
                    JWT_COOKIE_SECURE: Joi.boolean().default(false),
                    JWT_COOKIE_HTTP_ONLY: Joi.boolean().default(true),
                    JWT_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('strict'),
                    JWT_COOKIE_MAX_AGE: Joi.number().default(604800000),
                    BCRYPT_SALT_ROUNDS: Joi.number().default(12),
                    PASSWORD_MIN_LENGTH: Joi.number().default(8),
                    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
                    RATE_LIMIT_MAX: Joi.number().default(100),
                    SESSION_SECRET: Joi.string().default('your-session-secret'),
                    MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
                    LOGIN_LOCKOUT_TIME: Joi.number().default(900000),
                    REQUIRE_MFA: Joi.boolean().default(false),
                    UPLOAD_PATH: Joi.string().default('./uploads'),
                    MAX_FILE_SIZE: Joi.number().default(10485760),
                    ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,application/pdf'),
                    STORAGE_TYPE: Joi.string().valid('local', 's3', 'azure', 'gcs').default('local'),
                    EMAIL_ENABLED: Joi.boolean().default(false),
                    SMTP_HOST: Joi.string().default('smtp.gmail.com'),
                    SMTP_PORT: Joi.number().port().default(587),
                    SMTP_SECURE: Joi.boolean().default(false),
                    REDIS_ENABLED: Joi.boolean().default(false),
                    REDIS_HOST: Joi.string().default('localhost'),
                    REDIS_PORT: Joi.number().port().default(6379),
                }),
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: false,
                },
                envFilePath: [
                    `.env.${process.env.NODE_ENV || 'development'}`,
                    '.env',
                ],
            }),
        ],
        providers: [configuration_service_1.ConfigurationService],
        exports: [configuration_service_1.ConfigurationService],
    })
], ConfigurationModule);
exports.ConfigurationModule = ConfigurationModule;
//# sourceMappingURL=configuration.module.js.map