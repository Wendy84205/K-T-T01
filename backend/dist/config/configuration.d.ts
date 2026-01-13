export declare class DatabaseConfig {
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    DB_SYNC: boolean;
    DB_LOGGING: boolean;
}
export declare class JwtConfig {
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION: string;
}
export declare class AppConfig {
    NODE_ENV: string;
    PORT: number;
    API_PREFIX: string;
    CORS_ORIGIN: string;
}
export declare class SecurityConfig {
    BCRYPT_SALT_ROUNDS: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
    SESSION_SECRET: string;
}
export declare class FileConfig {
    UPLOAD_PATH: string;
    MAX_FILE_SIZE: number;
    ALLOWED_MIME_TYPES: string;
    STORAGE_TYPE: string;
}
export declare class Configuration {
    database: DatabaseConfig;
    jwt: JwtConfig;
    app: AppConfig;
    security: SecurityConfig;
    file: FileConfig;
    constructor();
}
export declare function validate(config: Record<string, any>): Configuration;
