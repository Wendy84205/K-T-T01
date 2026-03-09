# Phân tích Kỹ thuật Chuyên sâu: Hệ thống Người dùng (User Experience)

Tài liệu này bốc tách chi tiết cấu trúc mã nguồn, công nghệ giao tiếp và bảo mật của phân quyền Người dùng (User).

---

## 🚀 Trang Chủ Người Dùng (UserHomePage.js)
Đây là trái tim của ứng dụng, nơi xử lý các tác vụ bảo mật phức tạp nhất và trải nghiệm giao tiếp đa phương tiện.

### ⚙️ Luồng vận hành (Execution Flow)
1.  **Khởi tạo Socket & Real-time**: Khi vào trang, `useEffect` ([L222-284](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L222-284)) thiết lập kết nối Socket.io. Nó lắng nghe các sự kiện `new_message`, `user_status`, và đặc biệt là `call_made` để xử lý cuộc gọi đến.
2.  **Mã hóa & Giải mã E2EE**: 
    *   **Giải mã**: Hàm `decryptMessage` ([L486-542](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L486-542)) xử lý tự động 3 đời công nghệ: `Hybrid (AES+RSA)`, `Legacy Dual RSA`, và `Pure Ciphertext`.
    *   **Mã hóa**: Khi gửi, hệ thống tự động kiểm tra Public Key của đối phương để thực hiện `encryptHybrid` tại đầu cuối ([L799+](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L799)).
3.  **Cơ chế WebRTC (Video/Audio Call)**: Sử dụng `RTCPeerConnection` ([L132-163](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L132-163)) kết hợp với STUN server. Luồng tín hiệu (Signaling) được truyền qua Socket để trao đổi `Offer/Answer` và `ICE Candidates`.
4.  **Kho lưu trữ Bảo mật (Secure Vault)**: Yêu cầu xác thực lại mật khẩu qua `api.verifyPassword` ([L610](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L610)) trước khi gán `isVaultUnlocked = true`, bảo vệ tệp tin ngay cả khi máy tính bị chiếm dụng lúc đang đăng nhập.

### 🛠️ Dòng code quan trọng
*   **Polling dự phòng**: Mặc dù dùng Socket, hệ thống vẫn duy trì `setInterval` mỗi 4 giây ([L444-449](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L444-449)) để làm mới danh sách hội thoại.
*   **Voice Messages**: Sử dụng `MediaRecorder` API ([L306](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L306)) để nén âm thanh định dạng `.webm` trước khi đẩy lên server qua API `uploadFile`.

### 📡 Công nghệ cốt lõi
*   **Signaling**: Socket.io phục vụ thông báo đẩy và WebRTC.
*   **P2P**: WebRTC phục vụ gọi thoại/video trực tiếp không qua server.
*   **Crypto**: Web Crypto API cho mọi tác vụ mã hóa phía Client.

---

> [!IMPORTANT]
> **Security Design**: Mọi khóa tư nhân (Private Key) được lưu trong `localStorage` và không bao giờ rời khỏi trình duyệt. Nếu người dùng xóa Cache hoặc đổi máy, họ phải nhập lại bộ khóa dự phòng.
