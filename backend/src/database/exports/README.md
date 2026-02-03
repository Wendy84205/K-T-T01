# 📦 Database Exports

Thư mục này chứa các file export từ database MySQL của CyberSecure App.

## 📋 Nội dung

### 🗂️ Individual Table Exports
Mỗi bảng được export thành một file SQL riêng biệt:

#### Core Tables
- `users.sql` - Thông tin người dùng
- `roles.sql` - Vai trò hệ thống
- `permissions.sql` - Quyền hạn
- `user_roles.sql` - Phân quyền người dùng
- `role_permissions.sql` - Quyền của vai trò

#### Chat & Messaging
- `conversations.sql` - Cuộc hội thoại
- `conversation_members.sql` - Thành viên cuộc hội thoại
- `messages.sql` - Tin nhắn
- `message_reactions.sql` - Cảm xúc tin nhắn
- `message_read_receipts.sql` - Trạng thái đã đọc
- `pinned_messages.sql` - Tin nhắn được ghim

#### File Management
- `files.sql` - Thông tin file
- `folders.sql` - Thư mục
- `file_shares.sql` - Chia sẻ file
- `file_versions.sql` - Phiên bản file
- `file_integrity_logs.sql` - Log kiểm tra tính toàn vẹn

#### Security
- `encryption_keys.sql` - Khóa mã hóa
- `mfa_settings.sql` - Cài đặt xác thực 2 lớp
- `user_sessions.sql` - Phiên đăng nhập
- `failed_login_attempts.sql` - Lịch sử đăng nhập thất bại
- `security_events.sql` - Sự kiện bảo mật
- `security_alerts.sql` - Cảnh báo bảo mật
- `security_metrics.sql` - Chỉ số bảo mật
- `security_policies.sql` - Chính sách bảo mật
- `sensitive_operations_log.sql` - Log thao tác nhạy cảm

#### Project Management
- `projects.sql` - Dự án
- `tasks.sql` - Công việc
- `teams.sql` - Nhóm
- `team_members.sql` - Thành viên nhóm
- `manager_profiles.sql` - Hồ sơ quản lý

#### System
- `audit_logs.sql` - Nhật ký kiểm toán
- `system_logs.sql` - Nhật ký hệ thống
- `notifications.sql` - Thông báo
- `access_requests.sql` - Yêu cầu truy cập
- `rate_limits.sql` - Giới hạn tốc độ

### 💾 Full Database Backup
- `full_backup_YYYYMMDD_HHMMSS.sql` - Backup toàn bộ database

## 🚀 Cách sử dụng

### Export Database
```bash
# Chạy script export
./export-database.sh
```

### Import Single Table
```bash
# Import vào Docker container
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db < backend/database/exports/users.sql

# Hoặc import vào MySQL local
mysql -uroot -p cybersecure_db < backend/database/exports/users.sql
```

### Import Full Database
```bash
# Import toàn bộ database vào Docker
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db < backend/database/exports/full_backup_20260203_085759.sql

# Hoặc import vào MySQL local
mysql -uroot -p cybersecure_db < backend/database/exports/full_backup_20260203_085759.sql
```

### Restore to New Database
```bash
# Tạo database mới
docker exec cybersecure-mysql mysql -uroot -ppassword -e "CREATE DATABASE cybersecure_db_backup;"

# Import vào database mới
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db_backup < backend/database/exports/full_backup_20260203_085759.sql
```

## 📊 Thống kê

**Tổng số bảng:** 35 tables  
**Tổng dung lượng:** ~160KB (full backup)

### Bảng lớn nhất:
1. `security_events.sql` - 42KB
2. `audit_logs.sql` - 29KB
3. `user_sessions.sql` - 22KB
4. `messages.sql` - 16KB

## ⚠️ Lưu ý

1. **Bảo mật:** Các file export chứa dữ liệu nhạy cảm (passwords, encryption keys, etc.)
   - ❌ KHÔNG commit vào Git
   - ❌ KHÔNG share công khai
   - ✅ Lưu trữ an toàn

2. **Gitignore:** Thư mục này đã được thêm vào `.gitignore`

3. **Backup định kỳ:** Nên export database thường xuyên để backup

4. **Kiểm tra trước khi import:** Luôn kiểm tra nội dung file trước khi import vào production

## 🔄 Tự động hóa

### Cron Job (Linux/Mac)
```bash
# Thêm vào crontab để backup hàng ngày lúc 2 giờ sáng
0 2 * * * cd /path/to/K-T-T01 && ./export-database.sh
```

### Scheduled Task (Windows)
Tạo Task Scheduler để chạy `export-database.sh` định kỳ

## 📝 Version History

- **2026-02-03 08:57:** Initial export - 35 tables exported successfully

---

**Last Updated:** 2026-02-03  
**Database:** cybersecure_db  
**Container:** cybersecure-mysql
