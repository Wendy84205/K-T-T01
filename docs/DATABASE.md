# Tài liệu Cơ sở Dữ liệu — KTT01 CyberSecure

Tài liệu này mô tả cấu trúc các bảng dữ liệu trong hệ thống KTT01, được quản lý bởi **MySQL 8.0** và **TypeORM**.

---

## Tổng quan Kỹ thuật

| Thuộc tính | Giá trị |
|---|---|
| **RDBMS** | MySQL 8.x |
| **ORM** | TypeORM (NestJS) |
| **Tên Database** | `cybersecure_db` |
| **Collation** | `utf8mb4_unicode_ci` |
| **Khóa chính** | UUIDs (`char(36)`) cho các thực thể chính |

---

## 🏗️ Các bảng cốt lõi (Core Tables)

### 1. Bảng `users` (Người dùng)
Lưu trữ danh tính, thông tin đăng nhập và trạng thái bảo mật.

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `id` | `char(36)` | PK (UUID) |
| `username` | `varchar(50)` | Tên đăng nhập (Duy nhất) |
| `email` | `varchar(255)` | Email (Duy nhất) |
| `password_hash` | `varchar(255)` | Mã băm mật khẩu (Bcrypt) |
| `status` | `enum` | Trạng thái: `pending`, `active`, `banned` |
| `is_locked` | `tinyint(1)` | Cờ khóa tài khoản (Security Lockdown) |
| `security_clearance` | `tinyint` | Cấp độ bảo mật (1-5) |
| `public_key` | `text` | Khóa RSA Public cho E2EE |
| `e2ee_bundle` | `longtext` | Private Key đã mã hóa (Sao lưu trên Server) |

### 2. Bảng `teams` & `team_members`
Quản lý cấu trúc tổ chức và phân quyền nhóm.

---

## 🔐 Xác thực & Phiên làm việc

### 3. Bảng `user_sessions`
Quản lý các phiên đăng nhập để có thể thu hồi (Revoke) ngay lập tức.

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `id` | `char(36)` | ID phiên (JWT JTI) |
| `user_id` | `char(36)` | FK liên kết người dùng |
| `ip_address` | `varchar(45)` | IP khi đăng nhập |
| `revoked_at` | `timestamp` | Nếu không NULL, phiên này đã bị vô hiệu hóa |

---

## 💬 Liên lạc & Tin nhắn

### 4. Bảng `messages` (Tin nhắn E2EE)
Toàn bộ nội dung tin nhắn được lưu dưới dạng bản mã (Ciphertext).

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `id` | `char(36)` | PK |
| `conversation_id`| `char(36)` | FK liên kết phòng chat |
| `content` | `text` | **Nội dung đã mã hóa E2EE** |
| `is_encrypted` | `tinyint(1)` | Luôn là 1 cho các tin nhắn bảo mật |

---

## 📂 Lưu trữ Tệp tin

### 5. Bảng `files` (Tệp tin mã hóa)
Quản lý siêu dữ liệu (Metadata) của các tệp tin đã mã hóa.

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `id` | `varchar(36)` | PK |
| `path` | `varchar(500)` | Đường dẫn vật lý trên ổ đĩa (`.enc`) |
| `encryption_iv` | `varchar(255)` | Vector khởi tạo cho AES-GCM |
| `checksum` | `varchar(255)` | Mã băm SHA-256 để kiểm tra tính toàn vẹn |

---

## 🚨 Nhật ký & Giám sát

### 6. Bảng `audit_logs`
Ghi lại mọi hành động nhạy cảm trên hệ thống (Bản ghi bất biến).

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `event_type` | `varchar(100)` | Loại sự kiện (VD: `LOGIN`, `FILE_DELETE`) |
| `entity_id` | `char(36)` | ID của đối tượng bị tác động |
| `description` | `text` | Chi tiết hành động bằng ngôn ngữ tự nhiên |

---

## Ghi chú về Migrations
Các thay đổi về cấu trúc Database được quản lý thông qua TypeORM Migrations hoặc các script SQL thủ công trong thư mục `backend/src/database/migrations/`.
