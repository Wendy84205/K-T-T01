#!/bin/bash

echo "DATABASE TABLES CHECK"
echo "========================"

mysql -u root -ppassword cybersecure_db -e "
-- Tổng số bảng
SELECT 'Total Tables:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema='cybersecure_db';

-- Danh sách bảng nhóm theo loại
SELECT '';
SELECT 'CORE TABLES (8):' as category;
SELECT table_name FROM information_schema.tables 
WHERE table_schema='cybersecure_db' 
AND table_name IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'teams', 'team_members', 'manager_profiles')
ORDER BY table_name;

SELECT '';
SELECT 'SECURITY TABLES (11):' as category;
SELECT table_name FROM information_schema.tables 
WHERE table_schema='cybersecure_db' 
AND table_name IN ('mfa_settings', 'user_sessions', 'encryption_keys', 'security_policies', 
                   'failed_login_attempts', 'security_events', 'rate_limits', 'sensitive_operations_log', 
                   'access_requests', 'security_alerts', 'security_metrics')
ORDER BY table_name;

SELECT '';
SELECT 'BUSINESS TABLES (17):' as category;
SELECT table_name FROM information_schema.tables 
WHERE table_schema='cybersecure_db' 
AND table_name IN ('folders', 'files', 'file_versions', 'file_shares', 'file_integrity_logs',
                   'conversations', 'conversation_members', 'messages', 'message_read_receipts',
                   'projects', 'tasks', 'notifications', 'system_logs', 'audit_logs')
ORDER BY table_name;

-- Kiểm tra dữ liệu
SELECT '';
SELECT 'USER DATA:' as section;
SELECT username, email, security_clearance_level, is_active FROM users;

SELECT '';
SELECT 'ROLE ASSIGNMENTS:' as section;
SELECT u.username, r.name as role, r.level 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

SELECT '';
SELECT 'DATABASE READY!' as status;
SELECT 'Admin: admin / Admin@123456' as credentials;
"
