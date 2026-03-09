# Phân tích Luồng Người dùng CyberSecure: Từ Đăng nhập đến Gửi Tin nhắn

Dưới đây là bản "bốc tách" chi tiết về cấu trúc UI và logic chức năng của hệ thống CyberSecure dành cho người dùng cuối.

---

## 1. Giai đoạn Xác thực (Authentication)

### 🔐 Giao diện Đăng nhập (`LoginPage.js`)
*   **Bên ngoài**: Form thiết kế hiện đại, hỗ trợ Dark Mode.
*   **Chức năng**:
    *   Xác thực Email/Password qua API `/auth/login`.
    *   Hỗ trợ **MFA (Multi-Factor Authentication)**: Nếu tài khoản bật 2FA, người dùng sẽ được yêu cầu nhập mã OTP từ Google Authenticator.
    *   **Lưu trữ**: Sau khi đăng nhập thành công, `accessToken` và thông tin `user` được lưu vào `localStorage` và cập nhật vào `AuthContext`.

### 🛡️ Quản lý Session (`AuthContext.js`)
*   **Hệ thống Heartbeat**: Cứ mỗi 3 phút, client gửi một tín hiệu "nhịp tim" (`api.heartbeat()`) để báo cáo trạng thái "Active" (Online) lên Server.
*   **Phân quyền (RBAC)**: Tự động xác định người dùng là `Admin`, `Manager` hay `User` để hiển thị các công cụ tương ứng.

---

## 2. Giao diện Chính & Tổng quan Workspace (`UserHomePage.js`)

Hệ thống sử dụng kiến trúc **Single Page Deep Integration**, chia làm 3 khu vực chính:

### 📑 Thanh Điều hướng (NavRail - Trái ngoài cùng)
*   **Chức năng**: Chuyển đổi giữa các phân khu chức năng:
    *   `Messages`: Tổng hành dinh chat.
    *   `Secure Vault`: Kho lưu trữ file mã hóa.
    *   `Alerts`: Trung tâm thông báo bảo mật.
    *   `Settings`: Cấu hình cá nhân và bảo mật (đổi pass, bật MFA).

### 👥 Thanh Sidebar (Danh sách Hội thoại)
*   **Phân loại**: Chia rõ ràng thành `Channels` (Nhóm làm việc) và `Direct Messages` (Chat 1-1).
*   **Tìm kiếm**: `SearchBar` tích hợp cho phép lọc nhanh hội thoại theo tên.
*   **Trạng thái**: Hiển thị chấm xanh (Online) dựa trên dữ liệu thời gian thực từ WebSockets.

---

## 3. Luồng Giao tiếp Thời gian thực (WebSockets & Messaging)

### 📡 Kết nối Socket (`socketService.js`)
*   Ngay khi vào trang chủ, client thiết lập kết nối Socket.io bằng `accessToken`.
*   **Listeners**: Lắng nghe mọi sự kiện biến động:
    *   `new_message`: Có tin nhắn mới.
    *   `user_typing`: Ai đó đang soạn tin.
    *   `message_deleted`: Tin nhắn tự hủy hoặc bị xóa.
    *   `user_status`: Cập nhật ai vừa online/offline.

### 🔑 Cơ chế Mã hóa End-to-End (E2EE)
Đây là "trái tim" bảo mật của dự án. Quy trình gửi tin nhắn diễn ra như sau:
1.  **Mã hóa tại Client**: Nội dung văn bản được mã hóa bằng thuật toán **AES-256-GCM** (Symmetric). 
2.  **Khóa lai (Hybrid)**: Khóa AES này sau đó được mã hóa bằng **Public Key (RSA)** của tất cả người nhận trong hội thoại.
3.  **Gửi đi**: Server chỉ nhận được một gói tin JSON chứa các đoạn mã vô nghĩa, không thể đọc được nội dung gốc.
4.  **Giải mã**: Khi nhận tin, client sử dụng **Private Key** (lưu an toàn trong máy người dùng) để giải mã khóa AES, từ đó hiển thị nội dung gốc.

---

## 4. Chi tiết Chức năng Gửi Tin nhắn

### ✍️ Soạn thảo & Gửi
*   **Typing Indicator**: Khi người dùng gõ phím, một sự kiện `typing` được gửi lên để hiển thị "User is typing..." cho đối phương.
*   **Đa phương tiện**: Hỗ trợ gửi File (mã hóa), Sticker, Ghi âm (Voice Message) và Poll (Khảo sát).
*   **Reply & Forward**: Lưu vết `parentMessageId` để hiển thị cây thư mục tin nhắn.

### 🏁 Hoàn tất (Read Receipts)
*   **Tích xanh (Single Tick)**: Tin nhắn đã lên server.
*   **Tích xanh đôi (Double Tick)**: Đối phương đã nhận/mở hội thoại (sự kiện `mark_as_read`).

---

## 5. Các Chức năng Phụ trợ Đặc biệt
*   **Tin nhắn Tự hủy (Self-destruct)**: Người dùng có thể hẹn giờ xóa (10s, 1m, 1h). Khi hết hạn, Server gửi lệnh xóa và client thực hiện "xóa cứng" khỏi bộ nhớ (State).
*   **Chỉnh sửa (Edit)**: Cho phép sửa nội dung đã gửi, tự động cập nhật UI cho người nhận mà không cần load lại trang.

---

> [!NOTE]
> Toàn bộ logic này được thiết kế theo mô hình **Zero Trust**, nghĩa là Server không bao giờ được phép biết nội dung tin nhắn của người dùng.
