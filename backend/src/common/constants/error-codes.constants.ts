export const ERROR_CODES = {
    // Authentication error codes
    AUTH: {
        INVALID_CREDENTIALS: 'AUTH_001',
        TOKEN_EXPIRED: 'AUTH_002',
        TOKEN_INVALID: 'AUTH_003',
        MFA_REQUIRED: 'AUTH_004',
        MFA_INVALID: 'AUTH_005',
        ACCOUNT_LOCKED: 'AUTH_006',
    },

    // Authorization error codes
    AUTHZ: {
        INSUFFICIENT_PERMISSIONS: 'AUTHZ_001',
        ROLE_REQUIRED: 'AUTHZ_002',
        ACCESS_DENIED: 'AUTHZ_003',
    },

    // Validation error codes
    VAL: {
        INVALID_INPUT: 'VAL_001',
        MISSING_REQUIRED_FIELD: 'VAL_002',
        INVALID_FORMAT: 'VAL_003',
        VALUE_OUT_OF_RANGE: 'VAL_004',
    },

    // File error codes
    FILE: {
        FILE_TOO_LARGE: 'FILE_001',
        INVALID_FILE_TYPE: 'FILE_002',
        FILE_NOT_FOUND: 'FILE_003',
        ENCRYPTION_FAILED: 'FILE_004',
        VIRUS_DETECTED: 'FILE_005',
    },

    // Database error codes
    DB: {
        DUPLICATE_ENTRY: 'DB_001',
        NOT_FOUND: 'DB_002',
        CONSTRAINT_VIOLATION: 'DB_003',
    },

    // Security error codes
    SEC: {
        SUSPICIOUS_ACTIVITY: 'SEC_001',
        RATE_LIMIT_EXCEEDED: 'SEC_002',
        IP_BLOCKED: 'SEC_003',
        SESSION_HIJACK_DETECTED: 'SEC_004',
    },
};
