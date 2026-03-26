#!/bin/bash
# DEMO BẢO MẬT: Kiểm tra tính toàn vẹn của tệp tin (File Integrity)
# Mục đích: Chứng minh tệp tin tải lên có lưu mã Hash (SHA-256) dùng để đối chiếu khi tải xuống

echo "--- BẮT ĐẦU DEMO: KIỂM TRA TÍNH TOÀN VẸN TỆP TIN (SHA-256) ---"
echo "Truy vấn 5 tệp tin mới nhất để kiểm tra chuỗi Hash mã hóa..."
echo "Câu lệnh: SELECT id, original_name, stored_name, file_hash FROM files ORDER BY created_at DESC LIMIT 5;"
echo "Kết quả kỳ vọng: Bất kỳ tệp nào cũng có chuỗi file_hash để đảm bảo tính xác thực nội dung."
echo "--------------------------------------------------------"

docker exec cybersecure-mysql mysql -u root -ppassword cybersecure_db -e "SELECT id, original_name, stored_name, file_hash FROM files ORDER BY created_at DESC LIMIT 5;"

echo "--- KẾT THÚC DEMO ---"
