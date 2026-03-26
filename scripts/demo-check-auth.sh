#!/bin/bash
# DEMO BẢO MẬT: Kiểm tra tính năng chống Brute-force & Rate Limit
# Mục đích: Hiển thị các tài khoản đang bị khóa do nhập sai mật khẩu quá nhiều lần

echo "--- BẮT ĐẦU DEMO: KIỂM TRA KHÓA TÀI KHOẢN (RATE LIMIT & BRUTE FORCE) ---"
echo "Truy vấn các tài khoản có số lần đăng nhập sai (failed_login_attempts) > 0 hoặc đang bị khóa (is_locked = 1)..."
echo "Câu lệnh: SELECT username, email, is_locked, account_locked_until, failed_login_attempts FROM users WHERE failed_login_attempts > 0 OR is_locked = 1 LIMIT 5;"
echo "Kết quả kỳ vọng: Hiển thị trạng thái khóa của người dùng bị dính Brute-force limit."
echo "--------------------------------------------------------"

docker exec cybersecure-mysql mysql -u root -ppassword cybersecure_db -e "SELECT username, email, is_locked, account_locked_until, failed_login_attempts FROM users WHERE failed_login_attempts > 0 OR is_locked = 1 LIMIT 5;"

echo "--- KẾT THÚC DEMO ---"
