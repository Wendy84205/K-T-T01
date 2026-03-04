export const STRING_VALIDATION = {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 50,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
};

export const EMAIL_VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_EMAIL_LENGTH: 255,
};

export const PHONE_VALIDATION = {
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
};

export const NUMERIC_VALIDATION = {
    MIN_AGE: 18,
    MAX_AGE: 120,
    MIN_SALARY: 0,
    MAX_SALARY: 999999999,
};

export const FILE_VALIDATION = {
    MAX_FILENAME_LENGTH: 255,
    ALLOWED_EXTENSIONS: ['.jpg', '.png', '.pdf', '.docx'],
};

export const TEXT_VALIDATION = {
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 5000,
    MIN_COMMENT_LENGTH: 1,
    MAX_COMMENT_LENGTH: 1000,
};

export const URL_VALIDATION = {
    URL_REGEX: /^https?:\/\/.+/,
    MAX_URL_LENGTH: 2048,
};
