# Bốc tách kỹ thuật: Hệ thống Xác thực (Login & AuthContext)

Dưới đây là phân tích chuyên sâu về luồng xác thực của CyberSecure, tích hợp các cơ chế bảo mật đa lớp (JWT, MFA, E2EE) kèm theo chỉ dẫn vị trí code cụ thể.

---

## 1. Luồng Đăng nhập Đa giai đoạn (Multi-stage Login)

### Bước 1: Định danh & Mật khẩu
*   **Frontend**: Gửi thông tin định danh qua hàm `handleLogin` trong [SecureLogin.js:L76-125](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L76-125).
*   **Backend (Validation)**: Xử lý so khớp mật khẩu và kiểm tra trạng thái tại hàm `validateUser` trong [auth.service.ts:L33-125](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L33-125).
    *   *Kiểm tra Lockout (Tài khoản bị khóa)*: [L56-78](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L56-78).
    *   *So sánh Hash BCrypt*: [L81](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L81).

### Bước 2: Kiểm tra MFA (2FA) & Temporary JWT
*   **Backend (Issue Temp Token)**: Nếu cần MFA, server cấp mã tạm tại hàm `login` trong [auth.service.ts:L161-177](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L161-177).
*   **Frontend (MFA Prompt)**: Giao diện chuyển đổi trạng thái `mfaRequired` tại [SecureLogin.js:L84-88](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L84-L88).

### Bước 3: Xác thực mã Bảo mật (Stage 2 Verification)
*   **Frontend**: Gọi hàm `handleMfaVerify` tại [SecureLogin.js:L127-163](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L127-163).
*   **Backend (Final Login)**: Xác thực mã OTP và cấp Access Token chính thức tại hàm `verifyMfaAndLogin` trong [auth.service.ts:L234-330](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L234-330).

---

## 2. Quản lý Trạng thái & Session (AuthContext)

Hệ thống quản lý phiên tại [AuthContext.js](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js).

*   **Login Handling**: Cập nhật `localStorage` và State tại hàm `login` trong [L126-132](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js#L126-132).
*   **Auto-load Profile (F5)**: Gọi API profile khi khởi động tại hàm `loadUser` trong [L88-105](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js#L88-105).
*   **Phân quyền (RBAC)**: Xác định quyền `isAdmin`/`isManager` tại [L134-142](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js#L134-142).

---

## 3. Cơ chế Duy trì Trạng thái (Heartbeat)

Xử lý sự hiện diện của người dùng (Presence tracking):

*   **Frontend**: Thiết lập `setInterval` (3 phút) trong `useEffect` tại [AuthContext.js:L116-123](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js#L116-123).
*   **Backend**: 
    *   *Controller Endpoint*: `@Post('heartbeat')` tại [auth.controller.ts:L78-88](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.controller.ts#L78-88).
    *   *Service Logic*: Cập nhật `lastAccessedAt` tại hàm `heartbeat` trong [auth.service.ts:L434-449](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L434-449).

---

## 4. Bảo mật bổ sung: Khởi tạo E2EE Keys

Đồng bộ khóa ngay sau khi đăng nhập:

*   **Logic chính**: Hàm `ensureE2EEKeys` tại [SecureLogin.js:L188-212](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L188-212).
    *   *Kiểm tra Local Private Key*: [L190](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L190).
    *   *Tạo cặp khóa mới*: [L195](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L195).
    *   *Đẩy Public Key lên Server*: [L201](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L201).

---

> [!TIP]
> **Cybersecurity Policy**: Mã hóa mật khẩu tại backend sử dụng cấu hình 10 Rounds Salt ([auth.service.ts:L5](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L5)), đảm bảo an toàn kể cả khi database bị rò rỉ.
