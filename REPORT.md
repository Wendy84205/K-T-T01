# Nền tảng Doanh nghiệp CyberSecure - Báo Cáo Triển Khai

## 1. Tổng Quan Dự Án
**CyberSecure Enterprise Platform** là một nền tảng cộng tác thời gian thực bảo mật cao, được thiết kế chuyên biệt cho môi trường doanh nghiệp. Hệ thống ưu tiên hàng đầu việc bảo vệ dữ liệu, toàn vẹn thông tin và kiểm soát truy cập chặt chẽ, đồng thời cung cấp các tính năng giao tiếp hiện đại như chat mã hóa, gọi video và kho lưu trữ file an toàn (Vault).

## 2. Công Nghệ Sử Dụng
- **Backend**: NestJS (Node.js), TypeORM, Socket.io
- **Frontend**: React.js, Lucide Icons
- **Cơ sở dữ liệu**: MySQL 8.0 (Dockerized)
- **Hạ tầng**: Docker Compose, Nginx (Reverse Proxy)
- **Giao thức Bảo mật**:
    - AES-256-GCM (Mã hóa Tin nhắn & File)
    - JWT (Xác thực phiên đăng nhập)
    - TOTP (Xác thực đa yếu tố - MFA)
    - SHA-256 (Kiểm tra toàn vẹn dữ liệu)

## 3. Các Tính Năng Đã Triển Khai

### A. Bảo Mật & Định Danh (IAM)
- **Xác thực Đa yếu tố (MFA)**: Hỗ trợ Backend cho việc xác minh qua mã TOTP (Google Authenticator).
- **Phân Quyền Theo Vai Trò (RBAC)**: Phân chia rõ ràng quyền hạn giữa Người dùng (User) và Quản trị viên (Admin).
- **Quản lý Phiên (Session Management)**: Theo dõi chặt chẽ các phiên đăng nhập, ghi nhận thiết bị và IP truy cập.
- **Nhật Ký Kiểm Toán (Audit Logging)**: Hệ thống ghi vết toàn diện mọi hành động của người dùng (đăng nhập, truy cập file, thao tác nhạy cảm).
- **Bảng Điều Khiển Bảo Mật (Security Dashboard)**:
    - Giao diện "Sentinel SOC" cho Admin giám sát các mối đe dọa.
    - Biểu đồ thời gian thực về các vector tấn công và thời gian hoạt động hệ thống.
    - Quản lý các quy tắc bảo mật chi tiết (mô phỏng Tường lửa, WAF).

### B. Giao Tiếp An Toàn
- **Mã Hóa Đầu Cuối (E2EE)**: Tin nhắn được mã hóa bằng thuật toán AES-256-GCM trước khi lưu trữ xuống Database.
- **Nhắn Tin Thời Gian Thực**: Sử dụng công nghệ WebSockets (Socket.io) cho tốc độ phản hồi tức thì.
- **Chat Nhóm**: Tính năng tạo nhóm hoàn chỉnh, quản lý thành viên và quyền trưởng nhóm.
- **Gọi Audio/Video P2P**: Tích hợp WebRTC để thực hiện cuộc gọi bảo mật ngang hàng.
- **Trạng Thái Người Dùng**: Hiển thị trạng thái Online/Offline theo thời gian thực.
- **Kiểm Soát Riêng Tư**: Tùy chọn bật/tắt "Đã xem" (Read Receipts) và "Đang soạn tin" (Typing Indicators).

### C. Kho Dữ Liệu Bảo Mật (Vault)
- **Lưu Trữ Mã Hóa**: Các tệp tin được mã hóa ngay khi tải lên (Encryption at Rest).
- **Xác Thực Toàn Vẹn**: Đã cài đặt logic tính toán và đối chiếu mã băm SHA-256 của file để phát hiện thay đổi trái phép.
- **Kiểm Soát Truy Cập**: Cơ chế phân quyền sở hữu và chia sẻ file chặt chẽ.

### D. Giao Diện Người Dùng (UX)
- **Thẩm Mỹ Hiện Đại**: Thiết kế "Glossy Dark Mode" chuyên nghiệp, phù hợp môi trường doanh nghiệp.
- **Không Gian Làm Việc Tích Hợp**: Thanh điều hướng Sidebar kết hợp: Tin nhắn, Danh bạ, Cuộc gọi, Vault và Cài đặt.
- **Cá Nhân Hóa**: Người dùng có thể tùy chỉnh màu chủ đạo, âm thanh thông báo và các thiết lập riêng tư.
- **Quản Lý Hoạt Động**: Xem lịch sử đăng nhập và thu hồi phiên truy cập từ xa.

## 4. Cấu Trúc Cơ Sở Dữ Liệu
Hệ thống vận hành trên một lược đồ CSDL quan hệ mạnh mẽ với **35 bảng**, được phân nhóm:
1.  **Định danh (Core Identity)**: `users`, `roles`, `mfa_settings`, `user_sessions`.
2.  **Giao tiếp (Communication)**: `conversations`, `messages`, `conversation_members`, `call_logs`.
3.  **Lưu trữ (Storage)**: `files`, `folders`, `file_versions`, `file_integrity_logs`.
4.  **Bảo mật & Giám sát (Security)**: `audit_logs`, `encryption_keys`, `access_requests`, `failed_login_attempts`.
5.  **Làm việc nhóm (Teamwork)**: `teams`, `projects`, `tasks`, `task_assignments`.

*(Sơ đồ ERD chi tiết đã được tạo và đối chiếu khớp với dữ liệu thực tế)*

## 5. Kết Quả Đạt Được Gần Nhất
- **Sao Lưu Dữ Liệu**: Đã tự động hóa quy trình backup toàn bộ Database thông qua script `export-database.sh`.
- **Lọc Người Dùng**: Tăng cường bảo mật bằng cơ chế chỉ hiển thị các tài khoản đã kích hoạt và xác thực email trong danh bạ.
- **Sửa Lỗi Nhóm Chat**: Đã khắc phục logic giao diện trong quy trình tạo nhóm mới.
- **Hiển Thị Avatar**: Tối ưu hóa việc hiển thị ảnh đại diện người dùng với tỉ lệ chuẩn.
- **Báo Cáo Bảo Mật**: Xuất thành công các file SQL dump chi tiết cho toàn bộ bảng hệ thống.

## 6. Các Bước Tiếp Theo (Pending)
- **Giao Diện Vault**: Thêm nút "Xác thực Toàn vẹn" (Verify Integrity) trực quan để người dùng có thể tự kiểm tra mã SHA-256.
- **Giao Diện MFA**: Bổ sung màn hình quét mã QR trong Cài đặt để người dùng tự kích hoạt bảo mật 2 lớp.
- **Tin Nhắn Tự Hủy**: Triển khai logic đếm ngược để tự động xóa tin nhắn nhạy cảm.

---
*Báo cáo được tạo ngày: 04/02/2026*
