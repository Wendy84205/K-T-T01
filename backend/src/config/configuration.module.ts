import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import securityConfig from './security.config';
import fileConfig from './file.config';
import emailConfig from './email.config';
import redisConfig from './redis.config';
import { ConfigurationService } from './configuration.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        securityConfig,
        fileConfig,
        emailConfig,
        redisConfig,
      ],
      validationSchema: Joi.object({
        // App
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'staging')
          .default('development'),
        PORT: Joi.number().port().default(3001),
        API_PREFIX: Joi.string().default('api/v1'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        API_URL: Joi.string().default('http://localhost:3001'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        
        // Database
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
        
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),
        JWT_COOKIE_NAME: Joi.string().default('refresh_token'),
        JWT_COOKIE_SECURE: Joi.boolean().default(false),
        JWT_COOKIE_HTTP_ONLY: Joi.boolean().default(true),
        JWT_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('strict'),
        JWT_COOKIE_MAX_AGE: Joi.number().default(604800000),
        
        // Security
        BCRYPT_SALT_ROUNDS: Joi.number().default(12),
        PASSWORD_MIN_LENGTH: Joi.number().default(8),
        RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
        RATE_LIMIT_MAX: Joi.number().default(100),
        SESSION_SECRET: Joi.string().default('your-session-secret'),
        MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
        LOGIN_LOCKOUT_TIME: Joi.number().default(900000),
        REQUIRE_MFA: Joi.boolean().default(false),
        
        // File
        UPLOAD_PATH: Joi.string().default('./uploads'),
        MAX_FILE_SIZE: Joi.number().default(10485760),
        ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,application/pdf'),
        STORAGE_TYPE: Joi.string().valid('local', 's3', 'azure', 'gcs').default('local'),
        
        // Email
        EMAIL_ENABLED: Joi.boolean().default(false),
        SMTP_HOST: Joi.string().default('smtp.gmail.com'),
        SMTP_PORT: Joi.number().port().default(587),
        SMTP_SECURE: Joi.boolean().default(false),
        
        // Redis
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
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}