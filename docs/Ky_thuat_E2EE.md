# Kỹ thuật: Mã hóa Đầu-cuối (End-to-End Encryption - E2EE)

Dưới đây là bốc tách chi tiết về cơ chế mã hóa tin nhắn "Zero Trust" của CyberSecure, sử dụng mô hình mã hóa lai (Hybrid Encryption) kết hợp giữa RSA và AES-GCM.

---

## 1. Kiến trúc Mã hóa Lai (Hybrid Encryption Architecture)

Tại sao lại dùng mã hóa lai?
*   **AES-256-GCM**: Dùng để mã hóa nội dung tin nhắn thật sự vì nó cực nhanh và không giới hạn độ dài văn bản.
*   **RSA-OAEP (2048-bit)**: Dùng để mã hóa "Khóa AES" cho từng người nhận, vì RSA an toàn nhưng chậm và giới hạn độ dài dữ liệu.

---

## 2. Các thành phần lõi (Core Components)

### 🛠️ Thư viện Tiện ích Mã hóa
Toàn bộ logic xử lý hạ tầng mã hóa nằm tại: [frontend/src/utils/crypto.js](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js)

*   **Tạo cặp khóa (RSA Key Pair)**: [L22-36](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L22-36). Sử dụng `window.crypto.subtle.generateKey`.
*   **Mã hóa Lai (Core Encryption)**: [L93-125](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L93-125).
    *   Gồm 4 bước: Tạo khóa AES ngẫu nhiên -> Mã hóa nội dung bằng AES -> Export khóa AES -> Dùng Public Key RSA để bọc (wrap) khóa AES lại.
*   **Giải mã Lai (Core Decryption)**: [L130-154](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L130-154).
    *   Gồm 3 bước: Dùng Private Key RSA giải mã lấy khóa AES -> Import lại khóa AES -> Giải mã nội dung tin nhắn.

---

## 3. Luồng Gửi tin nhắn (Outgoing Flow)

Khi người dùng nhấn nút "Gửi" tại trang chủ:

*   **Vị trí xử lý**: Hàm `handleSendMessage` trong [UserHomePage.js:L828-847](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L828-847).
*   **Logic**:
    1.  Lấy Public Key của đối phương từ dữ liệu cuộc hội thoại.
    2.  Lấy Public Key của chính mình (để mình cũng có thể đọc lại tin nhắn đã gửi).
    3.  Gọi `encryptHybrid` để tạo ra gói tin bảo mật.
    4.  Đóng gói nội dung theo định dạng `[E2EE]:{json_payload}` trước khi gửi lên Server.

---

## 4. Luồng Nhận tin nhắn (Incoming Flow)

Khi tin nhắn mới bay về hoặc khi tải lịch sử chat:

*   **V vị trí xử lý**: Hàm `decryptMessage` trong [UserHomePage.js:L486-542](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L486-542).
*   **Logic**:
    1.  Kiểm tra prefix `[E2EE]:`. Nếu không có, coi như tin nhắn thường (legacy).
    2.  Lấy **Private Key** từ `localStorage` ([L491](file:///Users/admin/K-T-T01/frontend/src/pages/user/UserHomePage.js#L491)).
    3.  Kiểm tra phiên bản mã hóa (`v: "2"` là Hybrid, version cũ là RSA-only).
    4.  Gọi `decryptHybrid` để trả về văn bản gốc.

---

## 5. Lưu trữ Khóa và Bảo mật
*   **Private Key**: Tuyệt đối không bao giờ rời khỏi thiết bị người dùng. Nó được lưu tại `localStorage` với key `e2ee_private_key_{userId}`.
*   **Public Key**: Được lưu trên Server trong Profile của người dùng để bất kỳ ai muốn chat với bạn đều có thể lấy về để mã hóa tin nhắn.

> [!IMPORTANT]
> **Tính toàn vẹn**: Thuật toán AES-GCM cung cấp tính năng "Authenticated Encryption", nghĩa là nếu gói tin bị Server hoặc kẻ tấn công sửa đổi dù chỉ 1 bit, quá trình giải mã tại client sẽ thất bại ngay lập tức, đảm bảo tin nhắn không bị can thiệp (Tamper-proof).
