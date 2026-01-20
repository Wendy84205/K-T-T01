USE cybersecure_db;

-- Kiểm tra user hiện tại
SELECT username, LEFT(password_hash, 30) as current_hash FROM users WHERE username = 'admin';

-- Update với hash mới ĐÃ ĐƯỢC VERIFY
UPDATE users 
SET password_hash = '$2b$12$Rxk7m1HFRhz55f1AGdT9v.Zlap4q5.dPl4JvYNUfcT8eKVDUv0Ae.',
    failed_login_attempts = 0,
    is_locked = FALSE,
    account_locked_until = NULL,
    lock_reason = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin';

-- Kiểm tra kết quả
SELECT 
    username,
    LEFT(password_hash, 30) as new_hash,
    password_hash = '$2b$12$Rxk7m1HFRhz55f1AGdT9v.Zlap4q5.dPl4JvYNUfcT8eKVDUv0Ae.' as is_correct,
    CHAR_LENGTH(password_hash) as length
FROM users 
WHERE username = 'admin';
