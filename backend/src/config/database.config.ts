import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'cybersecure_db',
  
  // TypeORM specific
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  dropSchema: process.env.DB_DROP_SCHEMA === 'true',
  
  // Connection pool
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  
  // SSL (for production)
  ssl: process.env.DB_SSL === 'true',
  sslCert: process.env.DB_SSL_CERT,
  sslKey: process.env.DB_SSL_KEY,
  sslCa: process.env.DB_SSL_CA,
}));