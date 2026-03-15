# Sơ đồ Luồng Đăng nhập & Mã hoá Tin nhắn Đầu cuối (E2EE)

Tài liệu này cung cấp **một sơ đồ duy nhất (Flowchart)** thể hiện toàn bộ vòng đời từ lúc người dùng đăng nhập hệ thống cho đến khi gửi và nhận một tin nhắn mã hoá an toàn theo chuẩn E2EE (Mã hoá đầu cuối).

Sơ đồ này kết hợp cơ chế **Xác thực 2 lớp (MFA)** và **Mã hoá Lai (Hybrid Encryption)** sử dụng thuật toán `AES-256-GCM` và `RSA-OAEP-2048`.

---

### Sơ đồ Tổng quát (PlantUML)

Đoạn code dưới đây sử dụng chuẩn **PlantUML**. Bạn có thể copy/paste hoặc render trực tiếp bằng plugin PlantUML của bạn:

```plantuml
@startuml
skinparam handwritten false
skinparam monochrome false
skinparam packageStyle rectangle
skinparam NoteBackgroundColor #f9f9f9

title Luồng Đăng nhập MFA & Mã hoá Tin nhắn E2EE (K-T-T01 Project)

actor "Người Gửi (User A)" as UserA
participant "Trình duyệt (Frontend)" as ClientA
participant "Máy Chủ (Backend + DB)" as Server
participant "Trình duyệt (Frontend)" as ClientB
actor "Người Nhận (User B)" as UserB

== PHẦN 1: ĐĂNG NHẬP (LOGIN & MFA) ==

UserA -> ClientA: 1. Nhập Email & Password
activate ClientA
ClientA -> Server: POST /auth/login
activate Server

alt Sai thông tin
    Server --> ClientA: 401 Unauthorized
    ClientA --> UserA: Báo lỗi đăng nhập
else Đúng thông tin
    Server -> Server: Sinh TempToken
    Server --> ClientA: Trả về TempToken & Yêu cầu MFA
end

UserA -> ClientA: 2. Nhập mã TOTP (6 số từ Authy/Google Auth)
ClientA -> Server: POST /auth/verify-mfa (TempToken + TOTP)

alt Mã TOTP sai
    Server --> ClientA: 401 Invalid Code
else Mã TOTP đúng
    Server -> Server: Sinh Access Token (JWT)
    Server --> ClientA: Trả về JWT Access Token
end
deactivate Server

== PHẦN 2: MỞ KHOÁ E2EE BUNDLE (LẤY PRIVATE KEY) ==

ClientA -> ClientA: 3. Kiểm tra sessionStorage có E2EE Private Key chưa?
alt Đã có
    ClientA --> UserA: Sẵn sàng vào ứng dụng
else Chưa có
    ClientA -> Server: 4. Gọi API GET /users/profile/e2ee-bundle
    activate Server
    Server --> ClientA: Trả về Encrypted Bundle (Đã mã hoá)
    deactivate Server
    
    ClientA --> UserA: 5. Yêu cầu nhập mã PIN (6 số)
    UserA -> ClientA: Nhập mã PIN
    
    note over ClientA
      **Thuật toán PBKDF2 (310,000 vòng lặp):**
      - Kết hợp mã PIN + Salt (từ Bundle)
      - Sinh ra: Khoá AES-256-GCM
    end note
    
    ClientA -> ClientA: 6. Dùng Khoá AES vừa sinh để giải mã Bundle
    
    alt Giải mã thất bại (Sai PIN)
        ClientA --> UserA: Báo lỗi sai mã PIN
    else Giải mã thành công
        ClientA -> ClientA: 7. Bỏ Private Key (RSA) thật vào RAM (sessionStorage)
        ClientA --> UserA: Sẵn sàng chat an toàn!
    end
end

== PHẦN 3: GỬI TIN NHẮN (MÃ HOÁ LAI - HYBRID ENCRYPTION) ==

UserA -> ClientA: 8. Soạn tin nhắn: "Báo cáo mật..."
ClientA -> ClientA: 9. Tự sinh ngẫu nhiên 1 'Message Key' (AES-256) dùng một lần
ClientA -> ClientA: 10. Dùng 'Message Key' khoá text "Báo cáo mật..." ra **CipherText**

ClientA -> Server: 11. Yêu cầu lấy Public Key (RSA) của những người trong nhóm
activate Server
Server --> ClientA: Trả về danh sách Public Key
deactivate Server

note over ClientA
  **Mã hoá bọc nhiều lớp (RSA-OAEP):**
  Lấy từng Public Key (của A và của B) bọc vòng quanh cái 'Message Key'.
  -> Vậy là cái chìa AES đã bị khoá cứng bằng ổ khoá RSA thành nhiều bản.
end note

ClientA -> ClientA: 12. Khoá 'Message Key' thành các mảng EncryptedAESKeys
ClientA -> Server: 13. Đóng gói (Payload) đẩy qua Socket \n[CipherText + Mảng EncryptedAESKeys]
activate Server
note over Server
  Máy chủ chỉ thấy 1 đống text rác và cục chìa khoà bị encrypt.
  Máy chủ KHÔNG CÓ Private Key để mở, tóm lại là MÙ 100%.
end note
Server -> Server: 14. Lưu ẩn danh vào Database
Server -> ClientB: 15. Push Socket tới Người Nhận (User B)
deactivate Server

== PHẦN 4: NHẬN VÀ GIẢI MÃ TIN NHẮN ==

ClientB -> ClientB: 16. Lọc mảng EncryptedAESKeys để bắt đúng chìa khoá của mình
ClientB -> ClientB: 17. Gọi **Private Key** (đang lưu trên RAM của máy B lúc đăng nhập)
ClientB -> ClientB: 18. Dùng Private Key (RSA) mở khoá -> Thu lại được 'Message Key' (AES) gốc!

ClientB -> ClientB: 19. Cắm 'Message Key' vào CipherText để giải mã
ClientB --> UserB: 20. Hiển thị chữ: "Báo cáo mật..."

@enduml
```

---

### Các Thuật toán Mật mã Được Sử Dụng:
1. **Kiểm tra Mật khẩu Đăng nhập:** `Bcrypt` (Database).
2. **Xác thực 2 Bước:** `TOTP` (Time-Based One Time Password).
3. **Chống Brute-force mã PIN:** `PBKDF2` với `310,000` Iterations (Sinh key cực chậm, cực an toàn theo chuẩn OWASP).
4. **Mã hoá Chìa khoá AES (Để gửi):** `RSA-OAEP-2048` (Mã hoá bất đối xứng cực mạnh).
5. **Mã hoá Nội dung Chat thực tế:** `AES-256-GCM` (Mã hoá đối xứng tốc độ cao).
