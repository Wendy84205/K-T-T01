import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  // App configuration
  get app() {
    return this.configService.get('app');
  }

  // Database configuration
  get database() {
    return this.configService.get('database');
  }

  // JWT configuration
  get jwt() {
    return this.configService.get('jwt');
  }

  // Security configuration
  get security() {
    return this.configService.get('security');
  }

  // File configuration
  get file() {
    return this.configService.get('file');
  }

  // Email configuration
  get email() {
    return this.configService.get('email');
  }

  // Redis configuration
  get redis() {
    return this.configService.get('redis');
  }

  // Helper methods
  get isDevelopment(): boolean {
    return this.app?.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.app?.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.app?.nodeEnv === 'test';
  }

  get apiUrl(): string {
    return `${this.app?.apiUrl}/${this.app?.apiPrefix}`;
  }

  // TypeORM connection options
  get typeOrmConfig() {
    return {
      type: 'mysql',
      host: this.database?.host,
      port: this.database?.port,
      username: this.database?.username,
      password: this.database?.password,
      database: this.database?.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.database?.synchronize,
      logging: this.database?.logging,
      migrationsRun: this.database?.migrationsRun,
      dropSchema: this.database?.dropSchema,
      extra: {
        connectionLimit: this.database?.maxConnections,
        connectTimeout: this.database?.connectionTimeout,
      },
      ssl: this.database?.ssl
        ? {
            cert: this.database?.sslCert,
            key: this.database?.sslKey,
            ca: this.database?.sslCa,
            rejectUnauthorized: false,
          }
        : false,
    };
  }
}