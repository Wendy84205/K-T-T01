# Phân tích Kỹ thuật Chuyên sâu: Hệ thống User & Manage

Tài liệu này bốc tách chi tiết cấu trúc mã nguồn, công nghệ mã hóa và luồng vận hành của các phân quyền Người dùng (User) và Quản lý (Manage).

---

## 1. Hệ thống User (UserHomePage.js)
Đây là trái tim của ứng dụng, nơi xử lý các tác vụ bảo mật phức tạp nhất.

### ⚙️ Luồng vận hành (Execution Flow)
1.  **Khởi tạo Socket & Bảo mật**: Khi vào trang, `useEffect` ([L222-284](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L222-284)) thiết lập kết nối Socket.io và lắng nghe các sự kiện: `new_message`, `user_status`, `call_made` (WebRTC).
2.  **Cơ chế WebRTC (Video/Audio Call)**: Sử dụng `RTCPeerConnection` ([L132-163](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L132-163)) kết hợp với STUN server của Google để thiết lập cuộc gọi P2P.
3.  **Giải mã Tin nhắn (E2EE)**: Vô cùng quan trọng. Hàm `decryptMessage` ([L486-542](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L486-542)) xử lý 3 đời công nghệ mã hóa:
    *   **v2 (Hybrid)**: Mã hóa lai AES+RSA (nhanh và bảo mật nhất).
    *   **v1 (Legacy Dual)**: RSA thuần cho từng người nhận.
    *   **Oldest**: Ciphertext thô.
4.  **Kho lưu trữ (Secure Vault)**: Yêu cầu xác thực lại mật khẩu qua `api.verifyPassword` ([L610](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L610)) trước khi gán `isVaultUnlocked = true`.

### 🛠️ Dòng code quan trọng
*   **Polling dự phòng**: Dù có Socket, hệ thống vẫn dùng `setInterval` mỗi 4 giây ([L444-449](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L444-449)) để đảm bảo tin nhắn không bao giờ bị sót.
*   **Ghi âm tin nhắn thoại**: Sử dụng `MediaRecorder` API ([L306](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L306)) để nén âm thanh định dạng `.webm` trước khi upload.

---

## 2. Hệ thống Manage (ManageHomePage.js)
Dành cho cấp quản lý để điều phối đội ngũ và dự án.

### ⚙️ Luồng vận hành
1.  **Tải dữ liệu đa luồng**: Hàm `loadData` ([L732-752](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L732-752)) sử dụng `Promise.all` để tải đồng thời danh sách Dự án và Thành viên.
2.  **Quản lý Real-time (Socket)**: Manager cũng có luồng Socket tương tự User ([L65-114](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L65-114)) nhưng tập trung vào việc hiển thị trạng thái `Operational/Restricted` của nhân viên.
3.  **Hệ thống Dynamic Styling**: Manager có bộ chuyển đổi Dark/Light Mode vô cùng chi tiết bằng cách can thiệp trực tiếp vào CSS Variables của `document.documentElement` ([L683-728](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L683-728)).

### 🛠️ Dòng code quan trọng
*   **Tính toán năng suất**: `teamCapacity` được mô phỏng ngẫu nhiên (hoặc lấy từ API) tại [L744](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L744).
*   **Mã hóa tin nhắn Manager**: Khi Manager gửi tin nhắn cho nhân viên, hệ thống tự động tìm Public Key của nhân sự đó để mã hóa ([L202-216](file:///Users/admin/K-T-T01/frontend/src/pages/manage/ManageHomePage.js#L202-216)).

---

## 3. Công nghệ dùng chung (Core Architecture)

| Tính năng | Công nghệ | Vị trí tham chiếu |
| :--- | :--- | :--- |
| **Real-time** | Socket.io | [frontend/src/utils/socket.js](file:///Users/admin/K-T-T01/frontend/src/utils/socket.js) |
| **Mã hóa** | Web Crypto API | [frontend/src/utils/crypto.js](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js) |
| **State** | React Context (Auth) | [frontend/src/context/AuthContext.js](file:///Users/admin/K-T-T01/frontend/src/context/AuthContext.js) |

---

> [!TIP]
> **Điểm khác biệt**: Trang **User** thiên về *Trải nghiệm Giao tiếp* (Call, Sticker, Poll), trong khi trang **Manage** thiên về *Giám sát & Điều phối* (Directory, Project Stats). Tuy nhiên, cả hai đều sử dụng chung một lõi bảo mật E2EE khắt khe.
