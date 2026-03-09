# Phân tích Chuyên sâu: Công nghệ Mã hóa Tin nhắn (E2EE)

Hệ thống CyberSecure sử dụng kiến trúc **Mã hóa Lai (Hybrid Encryption)** để đảm bảo tính an toàn tuyệt đối cho tin nhắn, kết hợp giữa tốc độ của mã hóa đối xứng (AES) và sự linh hoạt của mã hóa bất đối xứng (RSA).

---

## 1. Kiến trúc Mã hóa Lai (Hybrid Encryption)
Đây là tiêu chuẩn vàng trong các ứng dụng như Signal hay WhatsApp, giải quyết được giới hạn về độ dài của RSA (vốn chỉ mã hóa được gói tin nhỏ).

### ⚙️ Các thuật toán sử dụng:
*   **AES-256-GCM**: Dùng để mã hóa nội dung tin nhắn thực tế. GCM (Galois/Counter Mode) cung cấp cả tính bảo mật (Secrecy) và tính toàn vẹn (Integrity).
*   **RSA-OAEP 2048-bit**: Dùng để mã hóa khóa AES. Khóa RSA Public của mỗi người nhận sẽ "khóa" lại chìa khóa AES dùng chung cho tin nhắn đó.
*   **SHA-256**: Thuật toán băm dùng cho RSA-OAEP padding.

---

## 2. Luồng Mã hóa (Khi gửi tin nhắn)
Nằm tại hàm `encryptHybrid` trong file [frontend/src/utils/crypto.js:L93-125](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L93-125).

1.  **Tạo khóa tạm**: Client tự sinh một khóa AES và một vector khởi tạo (IV) ngẫu nhiên ([L95-96](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L95-96)).
2.  **Mã hóa nội dung**: Toàn bộ văn bản tin nhắn được mã hóa bằng khóa AES vừa tạo ([L100-104](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L100-104)).
3.  **Khóa chìa khóa (Key Wrapping)**: 
    *   Hệ thống lấy Public Key của tất cả người nhận trong hội thoại.
    *   Với mỗi người, hệ thống dùng Public Key của họ để mã hóa riêng một bản khóa AES ([L111-117](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L111-117)).
4.  **Đóng gói**: Kết quả trả về là một Object JSON chứa:
    *   `v: "2"` (Phiên bản mã hóa lai).
    *   `iv`: Vector khởi tạo (Base64).
    *   `ciphertext`: Nội dung đã mã hóa (Base64).
    *   `keys`: Bản đồ các khóa AES đã được mã hóa theo ID người dùng.

---

## 3. Luồng Giải mã (Khi nhận tin nhắn)
Nằm tại hàm `decryptHybrid` [L130-154](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L130-154).

1.  **Lấy Khóa riêng (Private Key)**: Người nhận lấy Private Key RSA của chính mình từ `localStorage` ([L137](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L137)).
2.  **Giải mã khóa AES**: Sử dụng Private Key để giải mã phần khóa AES dành riêng cho mình trong danh sách `hybridData.keys` ([L139](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L139)).
3.  **Giải mã nội dung**: Sau khi có khóa AES thô, hệ thống dùng nó kết hợp với `iv` và `ciphertext` để khôi phục văn bản gốc ([L147-149](file:///Users/admin/K-T-T01/frontend/src/utils/crypto.js#L147-149)).

---

## 4. Bảo mật Zero-Knowledge (Phía Backend)
Mã nguồn Backend (`chat.service.ts`) chỉ nhận được chuỗi JSON đã mã hóa từ phía Client. 

*   **Server không có chìa khóa**: Vì Private Key nằm tại thiết bị của người dùng, Server không thể nào đọc được nội dung tin nhắn.
*   **Tính riêng tư**: Ngay cả Admin hệ thống cũng chỉ thấy được các chuỗi Base64 vô nghĩa nếu truy cập vào Database.

---

## 5. So sánh các thế hệ mã hóa trong hệ thống

| Phiên bản | Công nghệ | Ưu điểm | Giới hạn |
| :--- | :--- | :--- | :--- |
| **Legacy (v1)** | RSA-OAEP Pure | Đơn giản, không cần khóa phụ. | Giới hạn độ dài (~190 ký tự). |
| **Modern (v2)** | **Hybrid (AES + RSA)** | **Nhanh, không giới hạn độ dài**, bảo mật tuyệt đối. | Phức tạp hơn trong việc quản lý khóa. |

---

> [!CAUTION]
> **Cảnh báo quan trọng**: Nếu người dùng làm mất Private Key (ví dụ: cài lại trình duyệt mà không dự phòng), toàn bộ lịch sử tin nhắn cũ sẽ **mãi mãi không thể giải mã được**, vì Server không lưu bản sao của Private Key.
