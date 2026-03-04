export const PASSWORD_POLICY = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
};

export const RATE_LIMITING = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    MAX_API_REQUESTS_PER_MINUTE: 60,
    MAX_FILE_UPLOADS_PER_HOUR: 100,
};

export const SESSION_SETTINGS = {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_CONCURRENT_SESSIONS: 3,
};

export const MFA_POLICIES = {
    MFA_CODE_LENGTH: 6,
    MFA_CODE_EXPIRATION: 300, // 5 minutes
    MFA_BACKUP_CODES_COUNT: 10,
};

export const ENCRYPTION_SETTINGS = {
    ENCRYPTION_ALGORITHM: 'aes-256-gcm',
    KEY_ROTATION_DAYS: 90,
    HASH_ALGORITHM: 'sha256',
};

export const IP_SECURITY = {
    MAX_FAILED_ATTEMPTS_PER_IP: 10,
    IP_BLOCK_DURATION: 60 * 60 * 1000, // 1 hour
};

export const FILE_SECURITY = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
    SCAN_FILES_FOR_VIRUS: true,
};
