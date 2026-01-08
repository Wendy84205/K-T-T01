export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_DATABASE || 'cybersecure_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecretKey',
    expiration: process.env.JWT_EXPIRATION || '3600s',
  },
  app: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  security: {
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS 
      ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) 
      : 12,
  },
});
