#!/bin/bash

echo "==========================================="
echo "RESET AND SETUP DATABASE"
echo "==========================================="

# 1. Xóa database cũ
echo "Removing old database..."
mysql -u root -ppassword -e "DROP DATABASE IF EXISTS cybersecure_db;" 2>/dev/null

# 2. Chạy setup hoàn chỉnh
echo "Running complete setup..."
./run_complete_setup.sh

echo ""
echo "DATABASE RESET COMPLETE!"
