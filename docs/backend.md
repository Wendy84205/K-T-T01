# Tài liệu API Backend — CSEP KTT01

Tài liệu này chi tiết toàn bộ các Endpoint API của hệ thống KTT01, được xây dựng trên nền tảng **NestJS** với tư duy bảo mật Zero-Trust.

---

## Tổng quan Kỹ thuật

| Đặc tính | Giá trị |
|---|---|
| **Framework** | NestJS (Node.js 20+) |
| **Ngôn ngữ** | TypeScript 5.x |
| **Cơ sở dữ liệu** | MySQL 8.0 (qua TypeORM) |
| **Xác thực** | JWT (Access Token) + MFA TOTP |
| **Thời gian thực** | Socket.IO (WebSocket Gateway) |
| **Mã hóa** | AES-GCM + RSA-OAEP (Hybrid E2EE) |
| **Base URL** | `/api/v1` |

---

## Cơ chế Xác thực (Authentication)

Tất cả các Route (ngoại trừ các endpoint `@Public()`) đều yêu cầu mã **JWT Bearer** trong Header `Authorization`:
```http
Authorization: Bearer <access_token>
```

### Phân quyền (Roles)
| Vai trò | Quyền hạn |
|---|---|
| `Admin` | Toàn quyền kiểm soát hệ thống |
| `Manager` | Quản lý Team + Theo dõi bảo mật |
| `User` | Truy cập dữ liệu cá nhân & Team liên kết |

---

## Danh sách Module & Endpoints

### 1. Module Xác thực — `/api/v1/auth`

| Phương thức | Route | Xác thực | Mô tả |
|---|---|---|---|
| `POST` | `/login` | Public | Đăng nhập bằng username + pass. Trả về JWT hoặc `tempToken` nếu cần MFA |
| `POST` | `/verify-mfa` | Public | Xác thực mã TOTP 6 số dùng `tempToken` |
| `POST` | `/refresh` | JWT | Làm mới Access Token |
| `POST` | `/logout` | JWT | Hủy hiệu lực Token phiên hiện tại |
| `POST` | `/heartbeat` | JWT | Duy trì trạng thái Online |
| `GET` | `/profile` | JWT | Lấy thông tin tài khoản hiện tại (Clearance Level, Public Key) |
| `POST` | `/forgot-password` | Public | Yêu cầu khôi phục mật khẩu qua Email |
| `POST` | `/reset-password` | Public | Thiết lập mật khẩu mới bằng Token bảo mật |

---

### 2. Module Người dùng — `/api/v1/users`

| Phương thức | Route | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/` | Admin/Manager | Danh sách người dùng (Phân trang, Tìm kiếm) |
| `PATCH` | `/profile` | JWT | Cập nhật thông tin cá nhân |
| `GET` | `/profile/sessions` | JWT | Xem các phiên đăng nhập đang hoạt động |
| `DELETE` | `/profile/sessions/:id` | JWT | Đăng xuất từ xa một thiết bị |
| `GET` | `/profile/e2ee-bundle` | JWT | Lấy bản sao lưu Private Key đã mã hóa từ Server |
| `POST` | `/global-lockdown` | Admin | **KHẨN CẤP:** Khóa toàn bộ tài khoản non-admin |
| `PATCH` | `/:id/status` | Admin | Đổi trạng thái (Active, Banned, Pending) |

---

### 3. Module Tin nhắn (Chat) — `/api/v1/chat`

Tất cả tin nhắn trong hệ thống đều được mã hóa **E2EE** tại Client trước khi gửi.

| Phương thức | Route | Mô tả |
|---|---|---|
| `GET` | `/conversations` | Lấy danh sách các cuộc hội thoại |
| `POST` | `/conversations/group` | Tạo nhóm chat mới |
| `POST` | `/conversations/:id/messages` | Gửi tin nhắn (Nội dung đã mã hóa E2EE) |
| `GET` | `/conversations/:id/messages` | Lấy lịch sử tin nhắn (Phân trang) |
| `POST` | `/conversations/:id/read` | Đánh giá trạng thái "Đã xem" |

---

### 4. Module Bảo mật (Security) — `/api/v1/security`

Dành riêng cho Admin và SecOps để giám sát hệ thống.

| Phương thức | Route | Mô tả |
|---|---|---|
| `GET` | `/audit-logs` | Nhật ký toàn bộ hành động trên hệ thống (Immutable) |
| `GET` | `/failed-logins` | Phân tích các lần đăng nhập thất bại (Phát hiện Brute-force) |
| `POST` | `/block-ip` | Chặn địa chỉ IP nghi vấn |
| `POST` | `/integrity/check-files` | Chạy lệnh kiểm tra tính toàn vẹn dữ liệu file |

---

## Cấu trúc Phản hồi Lỗi

Hệ thống sử dụng mã trạng thái HTTP chuẩn kèm JSON chi tiết:

| Mã | Ý nghĩa |
|---|---|
| `400` | Bad Request — Dữ liệu gửi lên không hợp lệ |
| `401` | Unauthorized — Session hết hạn hoặc Token sai |
| `403` | Forbidden — Không đủ quyền hạn truy cập |
| `404` | Not Found — Tài nguyên không tồn tại |
| `409` | Conflict — Trùng lặp dữ liệu hoặc lỗi Logic |

---

## Kiến trúc E2EE (Mã hóa đầu cuối)

Tin nhắn được bảo vệ qua **Mã hóa Lai (Hybrid Encryption)**:

1. Một khóa **AES-256-GCM** ngẫu nhiên được sinh ra cho mỗi tin nhắn.
2. Nội dung tin nhắn được mã hóa bằng khóa AES này.
3. Khóa AES sau đó được khóa lại (wrap) bằng **RSA Public Key** của từng người nhận.
4. Chỉ người sở hữu **RSA Private Key** tương ứng mới có thể mở khóa AES và đọc nội dung.

> **Quan trọng:** Private Key được bảo vệ bằng mã PIN của người dùng qua thuật toán **PBKDF2 (310,000 vòng)** và không bao giờ rời khỏi thiết bị ở dạng rõ.
