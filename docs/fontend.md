# Tài liệu Frontend — CSEP KTT01

Tài liệu này mô tả kiến trúc, thành phần và quy trình vận hành của giao diện người dùng (Frontend) hệ thống KTT01, được xây dựng trên nền tảng **React 18** với trải nghiệm người dùng (UX) hiện đại và bảo mật cao.

---

## Tổng quan Công nghệ

| Đặc tính | Giá trị |
|---|---|
| **Framework** | React 18 |
| **Ngôn ngữ** | JavaScript (ES2022) |
| **Quản lý Trạng thái** | React Hooks (`useState`, `useEffect`, `useContext`) |
| **Định tuyến (Routing)** | React Router DOM v6 |
| **Thời gian thực** | Socket.IO Client |
| **Mã hóa (E2EE)** | Web Crypto API (SubtleCrypto) |
| **Giao diện (UI)** | Vanilla CSS (Sử dụng hệ thống CSS Variables) |
| **Biểu đồ** | Recharts |

---

## Cấu trúc Thư mục Dự án

```text
frontend/src/
├── App.js                  # Định tuyến gốc và các Route bảo vệ
├── config.js               # Cấu hình URL Backend (tự động cập nhật)
├── index.css               # Phong cách toàn cầu và biến CSS
├── layouts/                # Các khung giao diện chính (Sidebar + Header)
│   ├── UserLayout.js       # Giao diện cho nhân viên thường
│   ├── AdminLayout.js      # Giao diện cho Quản trị viên
│   └── ManageLayout.js     # Giao diện cho Quản lý (Manager)
├── pages/
│   ├── LoginPage.js        # Cổng đăng nhập chính
│   ├── ResetPasswordPage.js# Cổng đặt lại mật khẩu
│   ├── admin/              # Các trang đặc quyền Admin
│   ├── manage/             # Các trang đặc quyền Manager
│   └── user/               # Các trang chức năng người dùng
├── components/
│   ├── Auth/               # Form đăng nhập, MFA, Thông báo lỗi
│   └── chat/               # Các thành phần giao diện Chat E2EE
├── utils/
│   ├── api.js              # Client API tập trung (Axios/Fetch wrapper)
│   ├── crypto.js           # Thư viện tiện ích mã hóa E2EE (Web Crypto)
│   └── socket.js           # Dịch vụ Socket.IO client
```

---

## Luồng Giao diện & Chức năng Chính

### 1. Hệ thống Trang chủ (`/home` — UserHomePage)
Đây là trung tâm điều hành của người dùng, tích hợp nhiều chức năng trong một giao diện duy nhất:

- **Chat E2EE**: Hệ thống nhắn tin thời gian thực, có hỗ trợ Reaction, chia sẻ file, ghim tin nhắn và trả lời trích dẫn.
- **Trung tâm Thông báo**: Hiển thị các cảnh báo bảo mật, thông báo nhiệm vụ mới và tin nhắn chưa đọc.
- **Nhiệm vụ của tôi (My Tasks)**: Quản lý danh sách công việc được giao, cập nhật tiến độ và gửi báo cáo.
- **Cài đặt bảo mật**: Thiết lập MFA, đổi mật khẩu, quản lý phiên đăng nhập và xem nhật ký hoạt động cá nhân.

### 2. Quản lý Tài liệu (`/documents`)
Văn phòng số an toàn cho phép:
- Tải lên tệp tin và tự động mã hóa AES-256-GCM tại backend.
- Chia sẻ tệp với nhiều cấp độ quyền (`Xem`, `Sửa`, `Toàn quyền`).
- Kiểm tra tính toàn vẹn (Integrity Check) để đảm bảo file không bị Hacker can thiệp.

### 3. Hệ thống Quản trị & Giám sát (Admin & Manager)
- **Security Dashboard**: Theo dõi các sự kiện bảo mật theo thời gian thực.
- **Network Traffic**: Trực quan hóa lưu lượng mạng và các kết nối đang hoạt động.
- **Audit Logs**: Truy xuất nhật ký mọi thay đổi trên hệ thống để phục vụ điều tra.

---

## Cơ chế Bảo mật tại Frontend

Hệ thống tuân thủ nghiêm ngặt các nguyên tắc bảo mật:

| Lĩnh vực | Triển khai thực tế |
|---|---|
| **Lưu trữ Token** | `localStorage` (Chỉ dành cho Access Token) |
| **Khóa Private Key** | Lưu trong `sessionStorage` (RAM), tự xóa khi đóng trình duyệt |
| **Mã hóa E2EE** | Thực hiện hoàn toàn tại Client bằng Web Crypto API trước khi gửi HTTP Request |
| **Bảo vệ mã PIN** | Sử dụng **PBKDF2 (310,000 rounds)** để băm mã PIN người dùng thành khóa mã hóa |
| **Xác thực 2 lớp** | Quy trình 2 bước với `tempToken` và mã TOTP 6 số từ ứng dụng Authenticator |

---

## Hướng dẫn Phát triển

```bash
# Cài đặt thư viện
cd frontend && npm install

# Chạy môi trường phát triển (Local)
npm start

# Cập nhật URL Backend tự động (khi dùng Cloudflare)
# Scripts này sẽ tự động ghi đè file src/config.js
cd ../scripts && ./start-tunnels.sh
```

---

## Các biến CSS chính (Theming)

Hệ thống hỗ trợ Dark/Light mode linh hoạt qua các biến CSS tại `index.css`:
- `--primary`: Màu chủ đạo dự án (`#667eea`).
- `--bg-app`: Màu nền chính.
- `--text-main`: Màu chữ chính.
- `--green-color` / `--red-color`: Trạng thái Thành công / Lỗi.
