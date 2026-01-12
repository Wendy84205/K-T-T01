#!/bin/bash
echo "QUICK DATABASE CHECK"
echo "======================"

mysql -u root -ppassword cybersecure_db -e "
-- Tổng quan
SELECT 'DATABASE SUMMARY' as title;
SELECT 'Tables:' as metric, COUNT(*) as value FROM information_schema.tables WHERE table_schema='cybersecure_db'
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Roles:', COUNT(*) FROM roles
UNION ALL
SELECT 'Teams:', COUNT(*) FROM teams
UNION ALL
SELECT 'Projects:', COUNT(*) FROM projects;

SELECT '';
SELECT ' ADMIN USER DETAILS' as title;
SELECT username, email, security_clearance_level, is_active FROM users;

SELECT '';
SELECT 'ADMIN ROLES' as title;
SELECT u.username, r.name as role, r.level, r.security_level_required 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

SELECT '';
SELECT 'READY FOR DEVELOPMENT!' as status;
SELECT 'Username: admin' as credential;
SELECT 'Password: Admin@123456' as credential;
SELECT 'Email: admin@cybersecure.local' as credential;
"
