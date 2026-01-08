# 🛡️ CyberSecure Enterprise Platform (CSEP)

## 📌 Giới thiệu
**CyberSecure Enterprise Platform (CSEP)** là hệ thống web quản lý giao tiếp và tài liệu nội bộ doanh nghiệp, tích hợp các cơ chế an ninh mạng nâng cao theo mô hình **Zero Trust**. Dự án được phát triển như một **proof-of-concept** cho việc triển khai cybersecurity trong môi trường doanh nghiệp thực tế.

## 🎯 Tính năng chính
| Module | Chức năng | Bảo mật áp dụng |
|--------|-----------|-----------------|
| **🔐 Xác thực & Phân quyền** | Đăng nhập với tài khoản cá nhân, RBAC (Admin/Manager/Staff) | JWT, 2FA/MFA, Kiểm soát truy cập theo vai trò |
| **💬 Giao tiếp nội bộ** | Nhắn tin real-time giữa nhân viên | Mã hóa end-to-end, Ghi log truy cập |
| **📁 Quản lý tài liệu** | Upload/download tài liệu nội bộ | Mã hóa file (AES), Hash SHA-256, Kiểm tra toàn vẹn |
| **📊 Báo cáo & Giám sát** | Dashboard quản trị, Audit trail, Phát hiện bất thường | Logging tập trung, Rate limiting, Chống brute-force |

## 🏗️ Kiến trúc hệ thống
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React) │
├─────────────────────────────────────────────────────────────┤
│ Backend API (NestJS) │
├─────────────────────────────────────────────────────────────┤
│ Database (PostgreSQL) + Redis (Cache/Session) │
└─────────────────────────────────────────────────────────────┘

text

## 🛠️ Công nghệ sử dụng
### **Frontend**
- React.js 18 + TypeScript
- React Router v6
- Axios (HTTP client)
- Tailwind CSS / MUI
- Socket.io-client (chat real-time)

### **Backend**
- NestJS + TypeScript
- PostgreSQL + TypeORM/Prisma
- Redis (rate limiting, session)
- JWT, Passport.js
- Crypto-js / Node.js crypto (mã hóa)

### **Bảo mật**
- Xác thực 2FA/MFA (TOTP)
- Mã hóa AES-256 (dữ liệu nhạy cảm)
- RBAC (Role-Based Access Control)
- Zero Trust Architecture
- Audit logging với Winston

## 🚀 Bắt đầu

### **1. Clone dự án**
```bash
git clone https://github.com/[username]/cybersecure-enterprise-platform.git
cd cybersecure-enterprise-platform
2. Cài đặt Backend

bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin DB, JWT_SECRET, etc.
npm run migration:run
npm run dev
3. Cài đặt Frontend

bash
cd frontend
npm install
cp .env.example .env
npm start
4. Chạy với Docker (tuỳ chọn)

bash
docker-compose up -d
📁 Cấu trúc thư mục

text
cybersecure-enterprise-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # Component React
│   │   ├── pages/         # Trang chính
│   │   ├── services/      # API calls
│   │   ├── utils/         # Hàm helper
│   │   └── styles/        # CSS/Tailwind
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── modules/       # Module NestJS (auth, chat, file)
│   │   ├── guards/        # Auth guards
│   │   ├── interceptors/  # Logging, transform
│   │   ├── middleware/    # Security middleware
│   │   └── common/        # Shared utilities
│   └── package.json
├── docs/                  # Tài liệu dự án
├── docker-compose.yml
├── .gitignore
└── README.md
🔐 Cấu hình bảo mật (Environment Variables)

Backend (.env)

env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=csep_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# 2FA
MFA_ISSUER=CyberSecure Enterprise

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
Frontend (.env)

env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
👥 Quy trình phát triển

1. Quy trình Git

text
1. git pull origin main                  # Cập nhật code mới nhất
2. git checkout -b feat/your-feature     # Tạo branch mới
3. git add . && git commit -m "feat: ..." # Commit
4. git push origin feat/your-feature     # Push lên remote
5. Tạo Pull Request trên GitHub          # Chờ review
6. Sau khi approved → Merge vào main
2. Quy ước đặt tên branch

feat/: Tính năng mới (feat/login-mfa)
fix/: Sửa lỗi (fix/chat-encryption-bug)
docs/: Tài liệu (docs/update-readme)
refactor/: Tái cấu trúc (refactor/auth-module)
test/: Viết test (test/user-service)
3. Code Review Checklist

Code đúng convention
Không có secret key trong code
Đã test local
Không phá vỡ tính năng cũ
Có logging đầy đủ
📊 API Documentation

Xem chi tiết tại: API Docs

Các endpoint chính:

POST /api/auth/login - Đăng nhập + 2FA
POST /api/auth/verify-2fa - Xác thực 2FA
GET /api/chat/messages - Lấy tin nhắn
POST /api/files/upload - Upload file
GET /api/admin/audit-logs - Xem log (admin only)
🧪 Testing

bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm test
📈 Deployment

Production Setup

Build frontend:
bash
cd frontend
npm run build
Deploy backend với PM2:
bash
cd backend
npm run build
pm2 start dist/main.js --name csep-backend
Cấu hình Nginx (reverse proxy)
Setup SSL với Let's Encrypt
👨‍💻 Thành viên nhóm

Vai trò	Tên	Công việc chính
Team Lead / Backend	[Tên]	Kiến trúc, bảo mật, API, Database
Frontend Lead	[Tên]	UI/UX, React, tích hợp API
Full-stack Support	[Tên]	Hỗ trợ cả hai bên, testing, docs
📅 Timeline dự án

Tuần 1-2: Thiết kế & Setup
Tuần 3-7: Phát triển Backend
Tuần 4-9: Phát triển Frontend
Tuần 10-12: Tích hợp & Testing
Tuần 13-14: Hoàn thiện & Deployment
📞 Liên hệ & Tài liệu

Repository: GitHub Link
Figma Design: [Link thiết kế UI/UX]
Tài liệu bảo mật: [docs/security-plan.md]
Slide báo cáo: [docs/presentation.pptx]
