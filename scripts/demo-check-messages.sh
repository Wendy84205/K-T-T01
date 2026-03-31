#!/bin/bash
# DEMO BẢO MẬT: Kiểm tra dữ liệu tin nhắn (Mã hóa E2EE)
# Mục đích: Chứng minh cột content chỉ lưu [System Message] và nội dung thật bị mã hóa ở encrypted_content

echo "--- BẮT ĐẦU DEMO: KIỂM TRA MÃ HÓA TIN NHẮN (E2EE) ---"
echo "Truy vấn 5 tin nhắn mới nhất từ cơ sở dữ liệu..."
echo "Câu lệnh: SELECT id, content, LEFT(encrypted_content, 30) as encrypted_preview FROM messages ORDER BY created_at DESC LIMIT 5;"
echo "Kết quả kỳ vọng: content luôn là [System Message], encrypted_content là chuỗi mã hóa không thể đọc."
echo "--------------------------------------------------------"

docker exec cybersecure-mysql mysql -u root -ppassword cybersecure_db -e "SELECT id, content, LEFT(encrypted_content, 30) as encrypted_preview FROM messages ORDER BY created_at DESC LIMIT 5;"

echo "--- KẾT THÚC DEMO ---"
