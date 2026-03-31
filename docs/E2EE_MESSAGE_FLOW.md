# Sơ đồ Chi tiết: Luồng Tin nhắn Mã hoá (E2EE)

Hệ thống KTT01 sử dụng **hai lớp mã hoá độc lập** để bảo vệ tin nhắn. Tài liệu này mô tả toàn bộ luồng từ lúc người dùng gõ nội dung cho đến khi tin nhắn được hiển thị an toàn.

---

## Kiến trúc 2 lớp mã hoá

| Lớp | Tên | Thuật toán | Vị trí | Mục đích |
|-----|-----|------------|--------|---------|
| **Layer 1** | Transport Encryption | `AES-256-GCM` | Backend | Bảo vệ dữ liệu khi lưu xuống Database |
| **Layer 2** | E2EE Hybrid Encryption | `AES-256-GCM` + `RSA-OAEP` | Frontend | Chỉ người nhận có Private Key mới đọc được |

---

## Sơ đồ 1: Thiết lập Khóa E2EE (Lần đầu đăng nhập)

```plantuml
@startuml
title "Luồng Thiết lập Khóa E2EE Lần Đầu"

actor "Người dùng" as User
participant "Frontend (React)" as FE
participant "Backend API" as API
database "MySQL 8.0" as DB

User -> FE : Đăng nhập lần đầu
FE -> FE : Kiểm tra key bundle?

alt "Chưa có bundle"
    FE -> FE : Tạo cặp khóa RSA-2048
    FE -> FE : Mã hóa Private Key bằng PIN (PBKDF2+AES)
    FE -> FE : Lưu bundle vào localStorage
    FE -> API : Tải Public Key và Bundle lên Server
    API -> DB : Lưu vào hồ sơ người dùng
    FE --> User : Sẵn sàng chat bảo mật
else "Đã có bundle"
    FE -> FE : Giải mã Private Key bằng PIN người dùng
    FE --> User : Sẵn sàng chat bảo mật
end

@enduml
```

---

## Sơ đồ 2: Gửi & Nhận Tin nhắn (E2EE)

```plantuml
@startuml
title "Luồng Gửi và Nhận Tin nhắn E2EE"

actor "Alice" as Alice
participant "Frontend Alice" as FE_A
participant "Backend API" as API
database "MySQL 8.0" as DB
participant "Frontend Bob" as FE_B
actor "Bob" as Bob

== GIAI ĐOẠN 1: MÃ KHÓA TẠI MÁY GỬI ==

Alice -> FE_A : Gửi nội dung
FE_A -> FE_A : Tạo khóa AES ngẫu nhiên
FE_A -> FE_A : Mã hóa nội dung (AES)
FE_A -> FE_A : Mã hóa AES key bằng Public Key Bob (RSA)

== GIAI ĐOẠN 2: TRUYỀN TẢI ==

FE_A -> API : Gửi Payload mã hóa
activate API
API -> API : Mã hóa thêm lớp Transport (AES)
API -> DB : Lưu tin nhắn vào Database
API -> FE_B : Gửi qua WebSocket
deactivate API

== GIAI ĐOẠN 3: GIẢI MÃ TẠI MÁY NHẬN ==

FE_B -> FE_B : Giải mã lớp Transport
FE_B -> FE_B : Giải mã AES key bằng Private Key Bob (RSA)
FE_B -> FE_B : Giải mã nội dung chính bằng AES key
FE_B -> Bob : Hiển thị tin nhắn gốc

@enduml
```

---

## Tóm tắt Công nghệ

| Công nghệ | Thư viện | Vị trí | Mục đích |
|-----------|----------|--------|---------|
| **AES-256-GCM** | `window.crypto.subtle` | Frontend | Mã hóa nội dung tin nhắn Payload |
| **RSA-OAEP-2048**| `window.crypto.subtle` | Frontend | Mã hóa/Bọc khóa AES cho từng người nhận |
| **PBKDF2** | `window.crypto.subtle` | Frontend | Băm mã PIN (310k vòng) bảo vệ Private Key |
| **Bcrypt** | `bcrypt` | Backend | Băm mật khẩu đăng nhập hệ thống |
