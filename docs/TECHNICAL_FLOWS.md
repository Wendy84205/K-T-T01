# Tài liệu Kỹ thuật: Luồng Đăng nhập & Tin nhắn E2EE

Tài liệu này chi tiết hóa các quy trình kỹ thuật cốt lõi của hệ thống KTT01, bao gồm tham chiếu dòng code và giải thích công nghệ.

---

## 1. Luồng Đăng nhập & Xác thực Đa nhân tố (MFA)

Luồng này kết hợp xác thực mật khẩu truyền thống với mã TOTP (Time-based One-Time Password) để đảm bảo an toàn tuyệt đối.

### Sơ đồ Luồng Chi tiết

```plantuml
@startuml
title "Luồng Đăng nhập MFA Chi tiết (K-T-T01)"

actor "Người dùng" as User
participant "Frontend" as FE
participant "AuthService" as BE_Auth
participant "MfaService" as BE_MFA
participant "Authenticator App" as App

== GIAI ĐOẠN 1: XÁC THỰC MẬT KHẨU ==

User -> FE : Nhập Email/Username & Password
FE -> BE_Auth : POST /auth/login
activate BE_Auth
BE_Auth -> BE_Auth : Kiểm tra mật khẩu (Bcrypt)

alt "Yêu cầu MFA"
    BE_Auth -> FE : Trả về tempToken & mfaMethods
    deactivate BE_Auth
    FE -> FE : Chuyển sang màn hình nhập OTP

    note over FE, BE_Auth : == GIAI ĐOẠN 2: XÁC THỰC MFA (REAL-TIME) ==

    App -> User : Hiển thị mã 6 số (TOTP)
    User -> FE : Nhập mã 6 số
    FE -> BE_Auth : POST /auth/verify-mfa
    activate BE_Auth
    BE_Auth -> BE_MFA : verifyTotpLogin()
    activate BE_MFA
    BE_MFA -> BE_MFA : speakeasy.totp.verify()

    alt "Mã đúng"
        BE_MFA --> BE_Auth : verified: true
        BE_Auth --> FE : Trả về accessToken JWT chính thức
        FE -> User : Đăng nhập thành công
        deactivate BE_Auth
    else "Mã sai"
        BE_MFA --> BE_Auth : verified: false
        deactivate BE_MFA
        BE_Auth --> FE : 401 Unauthorized
        deactivate BE_Auth
        FE -> User : Báo lỗi "Invalid MFA token"
    end
else "Không yêu cầu MFA"
    BE_Auth --> FE : Trả về accessToken JWT
    deactivate BE_Auth
    FE -> User : Vào thẳng ứng dụng
end

@enduml
```

### Chi tiết Công nghệ & Cơ chế
- **Bcrypt**: Dùng để băm mật khẩu bảo mật (`auth.service.ts`).
- **Speakeasy**: Thư viện xử lý mã TOTP (`mfa.service.ts`).
- **JWT**: Token xác thực phiên làm việc (`@nestjs/jwt`).

---

## 2. Luồng Gửi & Nhận Tin nhắn Mã hoá (E2EE)

### Sơ đồ Luồng Chi tiết

```plantuml
@startuml
title "Luồng Gửi & Nhận Tin nhắn E2EE"

actor "Alice (Người gửi)" as Alice
participant "Frontend Alice" as AliceFE
participant "WebSocket Gateway" as Socket
database "MySQL 8.0" as DB
participant "Frontend Bob" as BobFE
actor "Bob (Người nhận)" as Bob

== GIAI ĐOẠN 1: MÃ HOÁ TẠI MÁY GỬI ==

Alice -> AliceFE : Soạn tin nhắn
AliceFE -> AliceFE : Tạo khóa AES-256 ngẫu nhiên
AliceFE -> AliceFE : Mã hóa nội dung bằng AES
AliceFE -> AliceFE : Mã hóa AES key bằng Public Key Bob (RSA)

== GIAI ĐOẠN 2: TRUYỀN TẢI ==

AliceFE -> Socket : Gửi Payload mã hóa
activate Socket
Socket -> DB : Lưu trữ bản mã tin nhắn
Socket -> BobFE : Đẩy tin nhắn qua Socket
deactivate Socket

== GIAI ĐOẠN 3: GIẢI MÃ TẠI MÁY NHẬN ==

BobFE -> BobFE : Lấy Private Key từ RAM
BobFE -> BobFE : Giải mã AES key bằng Private Key Bob (RSA)
BobFE -> BobFE : Giải mã nội dung bằng AES key
BobFE -> Bob : Hiển thị tin nhắn gốc

@enduml
```

---

## 3. Luồng Đặt lại Mật khẩu (Forgot/Reset Password)

```plantuml
@startuml
title "Luồng Đặt lại Mật khẩu An toàn"

actor "Người dùng" as User
participant "Frontend" as FE
participant "AuthService" as BE_Auth
participant "MailService" as Email
database "MySQL 8.0" as DB

== GIAI ĐOẠN 1: YÊU CẦU ĐẶT LẠI ==

User -> FE : Nhập Email
FE -> BE_Auth : POST /auth/forgot-password
activate BE_Auth
BE_Auth -> DB : Kiểm tra User tồn tại

alt "User tồn tại"
    BE_Auth -> BE_Auth : Sinh token & băm (Bcrypt)
    BE_Auth -> DB : Lưu token băm & hạn dùng
    BE_Auth -> Email : Gửi link reset (Nodemailer)
    activate Email
    Email --> User : Giao email chứa token
    deactivate Email
end

BE_Auth --> FE : 200 OK
deactivate BE_Auth
FE -> User : Thông báo kiểm tra email

== GIAI ĐOẠN 2: THIẾT LẬP MẬT KHẨU MỚI ==

User -> FE : Nhấp link từ email
FE -> BE_Auth : POST /auth/reset-password
activate BE_Auth
BE_Auth -> DB : Lấy User & kiểm tra Token

alt "Token hợp lệ"
    BE_Auth -> BE_Auth : Băm mật khẩu mới (Bcrypt)
    BE_Auth -> DB : Cập nhật pass_hash & xóa token
    BE_Auth --> FE : 200 OK
    FE -> User : Thông báo thành công
else "Token không hợp lệ"
    BE_Auth --> FE : 400 Bad Request
    FE -> User : Báo lỗi Token
end
deactivate BE_Auth

@enduml
```

---

## 4. Luồng Quản lý Tài liệu & Kiểm tra Tính toàn vẹn (File Integrity)

```plantuml
@startuml
title "Luồng Tải lên & Kiểm tra Tính toàn vẹn File"

actor "Người dùng" as User
participant "Frontend" as FE
participant "FileService" as BE_File
participant "EncryptionService" as Crypto
database "MySQL 8.0" as DB
entity "Storage" as Storage

== GIAI ĐOẠN 1: TẢI LÊN & MÃ HÓA ==

User -> FE : Chọn tệp tải lên
FE -> BE_File : POST /files/upload
activate BE_File

BE_File -> Crypto : encryptFile()
activate Crypto
Crypto -> Crypto : Mã hóa AES-256-GCM
Crypto --> BE_File : Trả về bản mã + IV + AuthTag
deactivate Crypto

BE_File -> BE_File : Tính SHA-256 checksum
BE_File -> Storage : Lưu file (.enc)
BE_File -> DB : Lưu metadata
BE_File --> FE : 201 Created
deactivate BE_File

== GIAI ĐOẠN 2: KIỂM TRA TÍNH TOÀN VẸN ==

User -> FE : Nhấn "Verify Integrity"
FE -> BE_File : POST /files/:id/verify
activate BE_File
BE_File -> Storage : Đọc file mã hóa
BE_File -> Crypto : decryptFile()
BE_File -> BE_File : So sánh checksum

alt "Checksum khớp"
    BE_File --> FE : 200 OK (Hợp lệ)
else "Checksum không khớp"
    BE_File --> FE : 400 Bad Request (Bị sửa đổi)
end
deactivate BE_File

@enduml
```

---

## 5. Luồng Khóa Toàn cầu (Global Lockdown)

```plantuml
@startuml
title "Luồng Khóa Toàn cầu (Incident Response)"

actor "Administrator" as Admin
participant "Frontend" as FE
participant "UserService" as BE_User
participant "SessionService" as BE_Session
database "MySQL 8.0" as DB
participant "WebSocket Gateway" as Socket
actor "User" as NormalUser

Admin -> FE : Kích hoạt Lockdown
FE -> BE_User : POST /users/global-lockdown
activate BE_User

BE_User -> DB : Khóa mọi tài khoản non-admin
BE_User -> BE_Session : Thu hồi Sessions
BE_Session -> DB : Cập nhật revoked_at
BE_User -> Socket : emit('lockdown')
Socket -> NormalUser : Thông báo Real-time
BE_User --> FE : 200 OK
deactivate BE_User

NormalUser -> FE : Thực hiện thao tác tiếp theo
FE -> BE_User : Request JWT
activate BE_User
BE_User -> DB : Kiểm tra Session revoked
BE_User --> FE : 401 Unauthorized
deactivate BE_User
FE -> NormalUser : Đăng xuất cưỡng bức

@enduml
```
