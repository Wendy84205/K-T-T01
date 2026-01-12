USE cybersecure_db;

-- Thêm cột security_clearance_level vào users (nếu chưa có)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS security_clearance_level INT DEFAULT 1 AFTER is_email_verified,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER security_clearance_level,
ADD COLUMN IF NOT EXISTS password_history JSON NULL AFTER last_password_change;

-- Thêm cột level vào roles (nếu chưa có)
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS level INT DEFAULT 10 AFTER description,
ADD COLUMN IF NOT EXISTS security_level_required INT DEFAULT 1 AFTER level;

-- Cập nhật giá trị mặc định cho các role (nếu chưa có)
UPDATE roles SET 
    level = CASE 
        WHEN name = 'System Admin' THEN 100
        WHEN name = 'Security Admin' THEN 90
        WHEN name = 'Department Manager' THEN 60
        WHEN name = 'Team Manager' THEN 50
        WHEN name = 'Senior Staff' THEN 20
        WHEN name = 'Staff' THEN 10
        WHEN name = 'Guest' THEN 1
        ELSE 50
    END,
    security_level_required = CASE 
        WHEN name = 'System Admin' THEN 5
        WHEN name = 'Security Admin' THEN 5
        WHEN name = 'Department Manager' THEN 4
        WHEN name = 'Team Manager' THEN 3
        WHEN name = 'Senior Staff' THEN 2
        WHEN name = 'Staff' THEN 2
        WHEN name = 'Guest' THEN 1
        ELSE 1
    END
WHERE level IS NULL OR security_level_required IS NULL;

-- Cập nhật security_clearance_level cho admin user (nếu chưa có)
UPDATE users 
SET security_clearance_level = 5 
WHERE username = 'admin' AND security_clearance_level IS NULL;

SELECT '✅ Security columns updated successfully!' as message;

-- Kiểm tra
SELECT 
    u.username,
    u.security_clearance_level,
    r.name as role,
    r.level,
    r.security_level_required
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';
