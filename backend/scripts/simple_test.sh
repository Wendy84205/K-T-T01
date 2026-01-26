#!/bin/bash
echo "SIMPLE DATABASE TEST"
echo "======================="

# Kiểm tra connection
mysql -u root -ppassword -e "SELECT 'MySQL is running' as status;" 2>/dev/null

# Kiểm tra database
mysql -u root -ppassword -e "SHOW DATABASES LIKE 'cybersecure_db';" 2>/dev/null

# Kiểm tra tables
echo ""
echo "Checking tables..."
mysql -u root -ppassword cybersecure_db -e "SHOW TABLES;" 2>/dev/null | head -10

# Kiểm tra admin user
echo ""
echo "Checking admin user..."
mysql -u root -ppassword cybersecure_db -e "SELECT username, email, is_active FROM users;" 2>/dev/null

echo ""
echo "Test completed!"
echo "Use: mysql -u root -ppassword cybersecure_db"
