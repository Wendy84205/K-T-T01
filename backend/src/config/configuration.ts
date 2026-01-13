import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class DatabaseConfig {
  @IsString()
  DB_HOST: string = 'localhost';

  @IsNumber()
  DB_PORT: number = 3306;

  @IsString()
  DB_USERNAME: string = 'root';

  @IsString()
  DB_PASSWORD: string = '';

  @IsString()
  DB_DATABASE: string = 'cybersecure_db';

  @IsBoolean()
  @IsOptional()
  DB_SYNC: boolean = false;

  @IsBoolean()
  @IsOptional()
  DB_LOGGING: boolean = false;
}

export class JwtConfig {
  @IsString()
  JWT_SECRET: string = 'dev-secret-key-for-development';

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = '3600s';

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET: string = 'dev-refresh-secret-key';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: string = '7d';
}

export class AppConfig {
  @IsString()
  NODE_ENV: string = 'development';

  @IsNumber()
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';
}

export class SecurityConfig {
  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 12;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS: number = 900000; // 15 minutes

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX: number = 100;

  @IsString()
  @IsOptional()
  SESSION_SECRET: string = 'dev-session-secret';
}

export class FileConfig {
  @IsString()
  @IsOptional()
  UPLOAD_PATH: string = './uploads';

  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number = 10485760; // 10MB

  @IsString()
  @IsOptional()
  ALLOWED_MIME_TYPES: string = 'image/jpeg,image/png,application/pdf';

  @IsString()
  @IsOptional()
  STORAGE_TYPE: string = 'local'; // local or s3
}

// Main configuration class
export class Configuration {
  @IsOptional()
  database: DatabaseConfig;

  @IsOptional()
  jwt: JwtConfig;

  @IsOptional()
  app: AppConfig;

  @IsOptional()
  security: SecurityConfig;

  @IsOptional()
  file: FileConfig;

  constructor() {
    this.database = new DatabaseConfig();
    this.jwt = new JwtConfig();
    this.app = new AppConfig();
    this.security = new SecurityConfig();
    this.file = new FileConfig();
  }
}

// Validation function
export function validate(config: Record<string, any>) {
  const validatedConfig = plainToClass(Configuration, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}