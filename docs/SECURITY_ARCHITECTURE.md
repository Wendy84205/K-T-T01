# Kiến trúc Bảo mật Tổng thể (Security Architecture) — CSEP KTT01

Tài liệu này cung cấp cái nhìn toàn cảnh về các lớp bảo mật đan xen, bảo vệ dữ liệu từ lúc người dùng đăng nhập cho đến khi dữ liệu được mã hóa lưu trữ lâu dài.

---

## Sơ đồ Tổng thể: Chu trình Bảo mật Dữ liệu

Dưới đây là sơ đồ dòng chảy dữ liệu qua các "chốt chặn" bảo mật của hệ thống:

```plantuml
@startuml
title "Chu trình Bảo mật Dữ liệu Toàn diện (End-to-End)"

actor "Người dùng" as User
participant "Giao diện (Client)" as FE
participant "Cổng Bảo vệ (Gateway/Auth)" as API
database "Lưu trữ (Storage/DB)" as DB
participant "Giám sát (Monitoring)" as Mon

== 1. XÁC THỰC & TRUY CẬP ==

User -> FE : Đăng nhập (Mật khẩu + MFA)
FE -> API : POST /auth/login
API -> API : Rate Limiting & Bcrypt Check
API -> API : Verify TOTP (nếu có)
API --> FE : Cấp JWT Access Token

== 2. THIẾT LẬP MÃ HÓA E2EE ==

User -> FE : Nhập mã PIN cá nhân
FE -> FE : PBKDF2 (310k rounds) giải mã Private Key
FE -> FE : Sẵn sàng môi trường E2EE

== 3. XỬ LÝ & LƯU TRỮ DỮ LIỆU ==

User -> FE : Gửi tin nhắn / Upload file
FE -> FE : Mã hóa E2EE (với Tin nhắn)
FE -> API : Truyền Payload mã hóa
activate API
API -> API : Mã hóa AES-256 (với File/At-Rest)
API -> DB : Lưu trữ bản mã (CipherText)
deactivate API

== 4. GIÁM SÁT & PHẢN ỨNG ==

API -> Mon : Ghi Audit Log hành động
Mon -> Mon : Phát hiện dấu hiệu tấn công?

alt "Phát hiện tấn công"
    Mon -> API : Kích hoạt Global Lockdown
    API -> DB : Vô hiệu hóa toàn bộ Session
    API --> FE : Force Logout
else "An toàn"
    API --> FE : Trả về dữ liệu khi yêu cầu
    FE -> FE : Giải mã và hiển thị cho người dùng
end

@enduml
```

---

## Các lớp bảo mật chính (Defense in Depth)

| Lớp | Công nghệ | Mục tiêu |
|---|---|---|
| **Lớp 1: Xác thực** | JWT, MFA (TOTP), Bcrypt | Đảm bảo đúng người dùng truy cập |
| **Lớp 2: Truyền tải** | Cloudflare Tunnels (TLS) | Chống nghe lén trên đường truyền |
| **Lớp 3: Liên lạc** | E2EE (Web Crypto API) | Bảo vệ tin nhắn, kể cả admin cũng không đọc được |
| **Lớp 4: Lưu trữ** | AES-256-GCM (Backend) | Bảo vệ tệp tin khi lưu trên đĩa (Disk) |
| **Lớp 5: Chính trực** | SHA-256 | Đảm bảo file không bị sửa đổi trái phép |
| **Lớp 6: Giám sát** | Audit Logs, Global Lockdown | Phản ứng nhanh khi có sự cố |

---

## Tham khảo chi tiết
- [Luồng Đăng nhập & Đặt lại mật khẩu](./TECHNICAL_FLOWS.md)
- [Cơ chế mã hóa tin nhắn E2EE](./E2EE_MESSAGE_FLOW.md)
- [Kiểm tra tính toàn vẹn tệp tin](./TECHNICAL_FLOWS.md)
