#!/bin/bash
echo "🩺 HEALTH CHECK FOR CYBERSECURE SERVER"
echo "========================================"

echo -e "\n1. 🐳 DATABASE STATUS"
mysql -u root -ppassword -e "SELECT 'Connected' as status, DATABASE() as db, VERSION() as version;" 2>/dev/null || echo "❌ Cannot connect to MySQL"

echo -e "\n2. 📊 DATABASE TABLES"
mysql -u root -ppassword cybersecure_db -e "SHOW TABLES;" 2>/dev/null | head -10

echo -e "\n3. 👤 USER DATA"
mysql -u root -ppassword cybersecure_db -e "SELECT username, email, is_active, failed_login_attempts FROM users;" 2>/dev/null

echo -e "\n4. 🚀 NODE.JS STATUS"
node --version
npm --version

echo -e "\n5. 📦 DEPENDENCIES"
npm list --depth=0 2>/dev/null | grep -E "(bcrypt|typeorm|@nestjs|mysql)"

echo -e "\n6. 🌐 PORT STATUS"
PORT=3001
if lsof -i :$PORT >/dev/null 2>&1; then
  echo "✅ Port $PORT is in use"
  lsof -i :$PORT | head -5
else
  echo "❌ Port $PORT is not in use"
fi

echo -e "\n7. 💾 DISK SPACE"
df -h . | tail -1

echo -e "\n8. 🐳 DOCKER (if used)"
docker ps 2>/dev/null | grep -E "(mysql|db)" || echo "No docker containers found"

echo -e "\n9. 🔐 PERMISSIONS"
ls -la package.json
ls -la src/ 2>/dev/null | head -5

echo -e "\n✅ Health check complete"
