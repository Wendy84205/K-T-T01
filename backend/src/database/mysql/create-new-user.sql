USE cybersecure_db;

-- Xoá user admin cũ (nếu cần)
DELETE FROM users WHERE username = 'admin';

-- Tạo user mới với hash được verify
INSERT INTO users (
    id, username, email, password_hash, 
    first_name, last_name, 
    is_active, is_email_verified, mfa_required,
    security_clearance_level, created_at, updated_at
) VALUES (
    UUID(),
    'admin',
    'admin@cybersecure.local',
    -- bcrypt hash của "Admin@123456" (đã được test và verify)
    '$2b$12$Rxk7m1HFRhz55f1AGdT9v.Zlap4q5.dPl4JvYNUfcT8eKVDUv0Ae.',
    'System',
    'Administrator',
    TRUE,
    TRUE,
    TRUE,
    5,
    NOW(),
    NOW()
);

SELECT '✅ New admin user created' as status;
SELECT username, email, LEFT(password_hash, 30) as hash FROM users;
