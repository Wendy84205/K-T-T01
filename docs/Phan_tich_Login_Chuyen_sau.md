# Phân tích Kỹ thuật Chuyên sâu: Quy trình Xác thực & Đăng nhập

Quy trình đăng nhập của CyberSecure không chỉ là kiểm tra mật khẩu, mà là một chuỗi các lớp bảo mật (Defense in Depth) từ Backend đến Frontend.

---

## 1. Tổng quan Luồng Xác thực 3 Giai đoạn
Hệ thống sử dụng quy trình xác thực đa tầng để chống lại các cuộc tấn công Brute-force và đánh cắp thông tin.

1.  **Giai đoạn 1 (Lọc & Khóa)**: Kiểm tra trạng thái tài khoản và giới hạn lần thử.
2.  **Giai đoạn 2 (Xác thực thực thể)**: Kiểm tra Email/Mật khẩu và MFA nếu cần.
3.  **Giai đoạn 3 (Bảo mật cuối)**: Đồng bộ khóa E2EE phía người dùng.

---

## 2. Phân tích chi tiết tại Backend (auth.service.ts)

### 🛡️ Cơ chế chống Brute-force (Lockout)
Nằm tại hàm `validateUser` ([L33-125](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L33-125)):
*   **Đếm lần thử sai**: Mỗi khi mật khẩu sai, `failedLoginAttempts` tăng thêm 1 ([L85](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L85)).
*   **Khóa cứng (Lockdown)**: Đạt **5 lần** sai liên tiếp, hệ thống khóa tài khoản trong **30 phút** ([L91-93](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L91-93)).
*   **Ghi nhật ký Security**: Mọi lần thử sai đều được ghi vào bảng sự kiện bảo mật với mức độ `MEDIUM` hoặc `HIGH` ([L88, L98](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L88-L98)).

### 🔑 Cơ chế MFA (Multi-Factor Authentication)
Nằm tại hàm `login` ([L128-231](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L128-231)):
*   **Bắt buộc MFA**: Nếu cột `mfaRequired` là true, Backend chỉ trả về một `tempToken` (hiệu lực 5 phút) thay vì `accessToken` chính thức ([L171-176](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L171-176)).
*   **Mã OTP**: Người dùng phải gọi đến endpoint `/verify-mfa` để đổi lấy token đăng nhập cuối cùng ([L234+](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L234)).

---

## 3. Phân tích chi tiết tại Frontend (SecureLogin.js)

### ⚙️ Xử lý Trạng thái Khóa (Client-side)
Frontend không chỉ chờ lỗi từ Server mà còn chủ động duy trì trạng thái khóa qua `localStorage` để ngăn chặn người dùng cố gắng spam trang login khi đang bị khóa ([L32-52](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L32-52)).

### 🔐 Quản lý Khóa E2EE (Key Stabilization)
Đây là phần đặc biệt nhất của hệ thống, diễn ra ngay sau khi đăng nhập thành công ([L188-212](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L188-212)):
*   **Kiểm tra Khóa tư nhân**: Hệ thống kiểm tra máy tính hiện tại đã có `privateKey` chưa ([L190](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L190)).
*   **Tạo mới nếu thiếu**: Nếu là máy mới hoặc chưa có Public Key trên server, hệ thống tự sinh cặp khóa RSA-OAEP mới ([L195](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L195)).
*   **Đồng bộ server**: Đẩy Public Key lên Profile để người khác có thể mã hóa tin nhắn gửi cho bạn ([L201](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L201)).

---

## 4. Dòng code quan trọng cần lưu ý

| Vị trí | Dòng | Chức năng |
| :--- | :--- | :--- |
| **Backend** | [auth.service.ts:L145](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L145) | **Default Admin Check**: Đảm bảo quyền Admin tối cao cho email hệ thống. |
| **Backend** | [auth.service.ts:L199](file:///Users/admin/K-T-T01/backend/src/modules/auth/auth.service.ts#L199) | **Session Tracking**: Lưu vết IP và thời hạn token vào DB để Admin có thể quản lý. |
| **Frontend** | [SecureLogin.js:L98-106](file:///Users/admin/K-T-T01/frontend/src/components/Auth/SecureLogin.js#L98-106) | **Redirection Logic**: Điều hướng người dùng về đúng Dashboard dựa vào mảng `roles`. |
| **Frontend** | [api.js:L33](file:///Users/admin/K-T-T01/frontend/src/utils/api.js#L33) | **Auto Logout**: Xóa `accessToken` nếu nhận mã 401 (Unauthorized) từ Server. |

---

## 5. Các công nghệ sử dụng
*   **Bcrypt**: Băm mật khẩu (Backend) - Không bao giờ lưu mật khẩu dạng text.
*   **JWT (JSON Web Token)**: Quản lý phiên làm việc không cần lưu state liên tục trên Server.
*   **SubtleCrypto**: Thư viện mã hóa phía trình duyệt để quản lý E2EE.

---

> [!IMPORTANT]
> **Điểm ưu thế**: Hệ thống không dùng Cookie để lưu Token mà dùng Header `Authorization`. Điều này giúp ứng dụng chống lại hoàn toàn các đòn tấn công **CSRF** (Cross-Site Request Forgery).
