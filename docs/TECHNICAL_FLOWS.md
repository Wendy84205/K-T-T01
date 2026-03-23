# Tài liệu Kỹ thuật: Luồng Đăng nhập & Tin nhắn E2EE

Tài liệu này chi tiết hóa các quy trình kỹ thuật cốt lõi của hệ thống KTT01, bao gồm tham chiếu dòng code và giải thích công nghệ.

---

## 1. Luồng Đăng nhập & Xác thực Đa nhân tố (MFA)

Luồng này kết hợp xác thực mật khẩu truyền thống với mã TOTP (Time-based One-Time Password) để đảm bảo an toàn tuyệt đối.

### Sơ đồ Luồng Chi tiết

```plantuml
@startuml
skinparam handwritten false
skinparam monochrome false
skinparam packageStyle rectangle
skinparam NoteBackgroundColor #f9f9f9

title Luồng Đăng nhập MFA Chi tiết (K-T-T01)

actor "Người dùng" as User
participant "Frontend (LoginForm.js)" as FE
participant "AuthService (NestJS)" as BE_Auth
participant "MfaService (speakeasy)" as BE_MFA
participant "Authenticator App" as App

== GIAI ĐOẠN 1: XÁC THỰC MẬT KHẨU ==

User -> FE: Nhập Email/Username & Password
FE -> BE_Auth: POST /auth/login (handleLogin L33)
activate BE_Auth
BE_Auth -> BE_Auth: validateUser (L33-L125): Kiểm tra Bcrypt hash

alt MFA Required
    BE_Auth -> FE: Trả về tempToken & mfaMethods (L171-L175)
    deactivate BE_Auth
    FE -> FE: Chuyển sang giao diện nhập OTP (L89-L158)
    
    == GIAI ĐOẠN 2: XÁC THỰC MFA (REAL-TIME) ==
    
    App -> User: Hiển thị mã 6 số (Dựa trên thời gian thực)
    User -> FE: Nhập mã 6 số
    FE -> BE_Auth: POST /auth/verify-mfa (handleMfaVerify L59)
    activate BE_Auth
    BE_Auth -> BE_MFA: verifyTotpLogin (L274): Kiểm tra mã OTP
    activate BE_MFA
    BE_MFA -> BE_MFA: speakeasy.totp.verify (L69-L74): So khớp với Secret Key
    
    alt Mã đúng
        BE_MFA --> BE_Auth: verified: true
        BE_Auth --> FE: Trả về accessToken JWT chính thức (L312)
        FE -> User: Đăng nhập thành công
    else Mã sai
        BE_MFA --> BE_Auth: verified: false
        deactivate BE_MFA
        BE_Auth --> FE: 401 Unauthorized (L279)
        deactivate BE_Auth
        FE -> User: Báo lỗi "Invalid MFA token"
    end
else MFA Not Required
    BE_Auth --> FE: Trả về accessToken JWT (L213)
    FE -> User: Vào thẳng ứng dụng
end

@enduml
```

### Chi tiết Công nghệ & Cơ chế
- **Bcrypt:** Dùng để băm mật khẩu (`auth.service.ts:L81`).
- **TOTP (RFC 6238):** Sử dụng thư viện `speakeasy`.
- **Tại sao lại xác nhận Real-time?** Mã 6 số được sinh ra dựa trên thuật toán kết hợp giữa **Shared Secret Key** và **Unix Time** (thời gian hiện tại). Cứ mỗi 30 giây mã sẽ thay đổi. Backend dùng cùng Secret Key và thời gian hiện tại để tính toán mã; nếu khớp thì xác nhận thành công.
- **Dòng code then chốt:**
    - Backend: `auth.service.ts` dòng 232 (`verifyMfaAndLogin`), `mfa.service.ts` dòng 69 (`speakeasy.totp.verify`).
    - Frontend: `LoginForm.js` dòng 33 (`api.login`) và dòng 59 (`api.verifyMfa`).

---

## 2. Luồng Gửi & Nhận Tin nhắn Mã hoá (E2EE)

Hệ thống sử dụng **Mã hoá Lai (Hybrid Encryption)**: AES cho nội dung và RSA cho chìa khoá.

### Sơ đồ Luồng Chi tiết

```plantuml
@startuml
skinparam NoteBackgroundColor #f9f9f9

title Luồng Gửi & Nhận Tin nhắn E2EE Chi tiết

actor "Alice (Người gửi)" as Alice
participant "Frontend (crypto.js)" as AliceFE
participant "Socket.IO Gateway" as Socket
participant "Database" as DB
participant "Bob (Người nhận)" as BobFE
actor "Bob (Người nhận)" as Bob

== GIAI ĐOẠN 1: MÃ HOÁ TẠI MÁY GỬI ==

Alice -> AliceFE: Soạn tin nhắn
AliceFE -> AliceFE: generateKey (AES-GCM 256bit) -> Message Key
AliceFE -> AliceFE: encrypt (Nội dung + Message Key) -> CipherText (L254)
AliceFE -> AliceFE: Lấy Public Key Bob từ hệ thống
AliceFE -> AliceFE: encrypt (Message Key + Public Key Bob) -> EncryptedKey (L269)

== GIAI ĐOẠN 2: TRUYỀN TẢI (MÙ 100%) ==

AliceFE -> Socket: Gửi Payload [CipherText + EncryptedKey] (L111)
activate Socket
Socket -> DB: Lưu trữ bản mã (L108)
Socket -> BobFE: Đẩy tin nhắn qua Socket (L109)
deactivate Socket

== GIAI ĐOẠN 3: GIẢI MÃ TẠI MÁY NHẬN ==

BobFE -> BobFE: Gọi Private Key (RSA) từ RAM (L287)
BobFE -> BobFE: decrypt (EncryptedKey + Private Key Bob) -> Message Key (L293)
BobFE -> BobFE: decrypt (CipherText + Message Key) -> Tin nhắn gốc (L301)
BobFE -> Bob: Hiển thị nội dung tin nhắn

@enduml
```

### Chi tiết Công nghệ
- **Web Crypto API (`window.crypto.subtle`):** Thư viện native của trình duyệt, cực kỳ nhanh và an toàn.
- **AES-256-GCM:** Mã hoá đối xứng dùng để khoá nội dung tin nhắn vì tốc độ nhanh (`crypto.js:L14-L17`).
- **RSA-OAEP-2048:** Mã hoá bất đối xứng dùng để bọc "chìa khoá" AES (`crypto.js:L7-L12`).
- **Dòng code then chốt:**
    - Frontend Mã hoá: `crypto.js` dòng 247 (`encryptHybrid`).
    - Frontend Giải mã: `crypto.js` dòng 284 (`decryptHybrid`).
    - Backend Trung chuyển: `chat.gateway.ts` dòng 111 (`emitNewMessage`).

---

## 3. Tại sao hệ thống an toàn?
1. **Zero Knowledge:** Máy chủ chỉ lưu `CipherText` (văn bản rác) và `EncryptedKey` (chìa khoá bị khoá). Máy chủ KHÔNG có `Private Key` nên không thể đọc được nội dung.
2. **PBKDF2 (310,000 vòng):** Được dùng để bảo vệ `Private Key` bằng mã PIN của người dùng (`crypto.js:L19`). Ngay cả khi hacker lấy được file bundle trên server, họ cũng mất hàng chục năm để brute-force mã PIN.
