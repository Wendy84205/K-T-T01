export const APP_NAME = 'CyberSecure Enterprise Platform';
export const APP_VERSION = '1.0.0';
export const API_PREFIX = 'api/v1';

export enum ENVIRONMENT {
    DEVELOPMENT = 'development',
    STAGING = 'staging',
    PRODUCTION = 'production',
}

export const IS_PRODUCTION = process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_TIMEOUT = 30000; // ms

export const FEATURE_FLAGS = {
    ENABLE_MFA: true,
    ENABLE_FILE_ENCRYPTION: true,
    ENABLE_AUDIT_LOGGING: true,
};

export const TIME_CONSTANTS = {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    JWT_EXPIRATION: 86400, // 1 day in seconds
    MFA_CODE_EXPIRATION: 300, // 5 minutes
};

export const FILE_CONSTANTS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_FILE_TYPES: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    UPLOAD_DIR: './uploads',
};
