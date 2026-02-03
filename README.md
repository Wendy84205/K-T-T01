# 🛡️ CyberSecure Enterprise Platform (K-T-T01)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

**Hệ thống quản lý giao tiếp và tài liệu nội bộ doanh nghiệp với bảo mật cấp cao**

[Tính năng](#-tính-năng-chính) • [Cài đặt](#-cài-đặt-nhanh) • [Hướng dẫn](#-hướng-dẫn-chi-tiết) • [API Docs](#-api-documentation)

</div>

---

## 📌 Giới thiệu

**CyberSecure Enterprise Platform (CSEP)** là hệ thống web quản lý giao tiếp và tài liệu nội bộ doanh nghiệp, tích hợp các cơ chế an ninh mạng nâng cao theo mô hình **Zero Trust Architecture**. 

### 🎯 Mục tiêu dự án
- ✅ Xây dựng hệ thống chat nội bộ với **mã hóa end-to-end (E2EE)**
- ✅ Quản lý tài liệu an toàn với **mã hóa AES-256-GCM**
- ✅ Triển khai **xác thực đa yếu tố (MFA)** và **RBAC**
- ✅ Giám sát bảo mật real-time với **audit logging**
- ✅ Proof-of-concept cho cybersecurity trong doanh nghiệp

---

## ✨ Tính năng chính

### 💬 **Chat & Messaging (Telegram-style)**
- ✅ Nhắn tin real-time với WebSocket
- ✅ Mã hóa end-to-end (AES-256-GCM)
- ✅ Chat 1-1 và Group Chat
- ✅ **Reply** (trả lời tin nhắn)
- ✅ **Edit** (chỉnh sửa tin nhắn)
- ✅ **Forward** (chuyển tiếp tin nhắn)
- ✅ **Delete** (xóa tin nhắn)
- ✅ **Pin** (ghim tin nhắn quan trọng)
- ✅ **Reactions** (thả cảm xúc)
- ✅ **Read Receipts** (trạng thái đã đọc)
- ✅ **Voice Messages** (tin nhắn thoại)
- ✅ **Typing Indicator** (đang soạn tin...)
- ✅ **File Sharing** (chia sẻ file mã hóa)

### 📞 **Voice & Video Call**
- ✅ Gọi thoại (Voice Call)
- ✅ Gọi video (Video Call)
- ✅ Trạng thái cuộc gọi real-time

### 📁 **File Management**
- ✅ Upload/Download file mã hóa
- ✅ Secure Vault (kho lưu trữ bảo mật)
- ✅ File versioning
- ✅ File sharing với quyền hạn
- ✅ Kiểm tra tính toàn vẹn (SHA-256)

### 🔐 **Security & Authentication**
- ✅ JWT Authentication
- ✅ Multi-Factor Authentication (MFA/2FA)
- ✅ Role-Based Access Control (RBAC)
- ✅ Session Management
- ✅ Rate Limiting & Brute-force Protection
- ✅ Audit Logging
- ✅ Security Dashboard

### 👥 **User Management**
- ✅ User profiles
- ✅ Role management (Admin/Manager/User)
- ✅ Permission system
- ✅ User activity tracking

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React.js)                      │
│              Port 3000 | Cloudflare Tunnel                  │
├─────────────────────────────────────────────────────────────┤
│                   Backend API (NestJS)                      │
│              Port 3001 | RESTful + WebSocket                │
├─────────────────────────────────────────────────────────────┤
│                   Database (MySQL 8.0)                      │
│                        Port 3307                            │
├─────────────────────────────────────────────────────────────┤
│                  File Storage (Local/S3)                    │
│                   Encryption Layer                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React.js 18** - UI Framework
- 🎨 **Vanilla CSS** - Styling (Modern design)
- 🔌 **WebSocket** - Real-time communication
- 📡 **Axios** - HTTP client
- 🎯 **React Router v6** - Navigation
- 🎨 **Lucide React** - Icon library

### **Backend**
- 🚀 **NestJS** - Node.js framework
- 📘 **TypeScript** - Type-safe development
- 🗄️ **MySQL 8.0** - Relational database
- 🔗 **TypeORM** - ORM
- 🔐 **JWT** - Authentication
- 🔒 **Crypto** - Encryption (AES-256-GCM)
- 📝 **Winston** - Logging

### **DevOps & Tools**
- 🐳 **Docker & Docker Compose** - Containerization
- ☁️ **Cloudflare Tunnel** - Public access
- 🔧 **PM2** - Process management
- 📊 **MySQL Workbench** - Database management

---

## 🚀 Cài đặt nhanh

### **Yêu cầu hệ thống**
- Node.js >= 18.0.0
- Docker & Docker Compose
- Git
- 4GB RAM (khuyến nghị)

### **Quick Start (3 bước)**

```bash
# 1. Clone repository
git clone https://github.com/your-username/K-T-T01.git
cd K-T-T01

# 2. Khởi động với Docker
docker-compose up -d

# 3. Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

**Tài khoản mặc định:**
- Email: `admin@cybersecure.com`
- Password: `Admin@123`

---

## 📖 Hướng dẫn chi tiết

### **Phương án 1: Chạy với Docker (Khuyến nghị)**

#### Bước 1: Clone và chuẩn bị
```bash
# Clone repository
git clone https://github.com/your-username/K-T-T01.git
cd K-T-T01

# Kiểm tra Docker
docker --version
docker-compose --version
```

#### Bước 2: Khởi động services
```bash
# Khởi động tất cả services (MySQL, Backend, Frontend)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Kiểm tra trạng thái
docker-compose ps
```

#### Bước 3: Chờ database migration hoàn tất
```bash
# Kiểm tra migration logs
docker logs cybersecure-migrate

# Khi thấy "Migration completed successfully" là OK
```

#### Bước 4: Truy cập ứng dụng
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **API Health:** http://localhost:3001/health

#### Bước 5: Đăng nhập
```
Email: admin@cybersecure.com
Password: Admin@123
```

---

### **Phương án 2: Chạy local (Development)**

#### Bước 1: Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend (terminal mới)
cd frontend
npm install
```

#### Bước 2: Khởi động MySQL với Docker
```bash
# Chỉ chạy MySQL container
docker-compose up -d mysql

# Chờ MySQL healthy
docker-compose ps
```

#### Bước 3: Chạy migration
```bash
cd backend

# Tạo file .env (nếu chưa có)
cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=cybersecure_db
JWT_SECRET=dev-secret-key-for-development-only-change-this
EOF

# Chạy migration
npm run migration:run
```

#### Bước 4: Khởi động Backend
```bash
cd backend
npm run start:dev

# Backend sẽ chạy tại http://localhost:3001
```

#### Bước 5: Khởi động Frontend
```bash
# Terminal mới
cd frontend

# Tạo file .env
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api/v1
EOF

# Khởi động
npm start

# Frontend sẽ mở tại http://localhost:3000
```

---

### **Phương án 3: Import database có sẵn**

Nếu bạn có file backup database:

```bash
# 1. Khởi động MySQL
docker-compose up -d mysql

# 2. Import full backup
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db < backend/database/exports/full_backup_YYYYMMDD_HHMMSS.sql

# 3. Hoặc import từng bảng
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db < backend/database/exports/users.sql

# 4. Kiểm tra
docker exec cybersecure-mysql mysql -uroot -ppassword cybersecure_db -e "SHOW TABLES;"
```

---

## 🌐 Expose ra Internet với Cloudflare Tunnel

### **Cài đặt Cloudflared**
```bash
# macOS
brew install cloudflared

# Hoặc download manual
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz -o cloudflared.tgz
tar -xzf cloudflared.tgz
sudo mv cloudflared /usr/local/bin/
```

### **Khởi động tunnels**
```bash
# Sử dụng script tự động
./start-tunnels.sh

# Hoặc chạy thủ công
cloudflared tunnel --url http://localhost:3000  # Frontend
cloudflared tunnel --url http://localhost:3001  # Backend
```

### **Kiểm tra trạng thái**
```bash
./check-tunnels.sh
```

📖 **Xem hướng dẫn chi tiết:** [CLOUDFLARE_TUNNEL_GUIDE.md](./CLOUDFLARE_TUNNEL_GUIDE.md)

---

## 📁 Cấu trúc dự án

```
K-T-T01/
├── 📂 frontend/                    # React Frontend
│   ├── public/                    # Static files
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── chat/            # Chat components
│   │   │   └── common/          # Common UI
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   └── user/            # User pages
│   │   ├── context/             # React Context
│   │   ├── utils/               # Utilities & API client
│   │   ├── App.js               # Main app
│   │   └── index.js             # Entry point
│   └── package.json
│
├── 📂 backend/                     # NestJS Backend
│   ├── src/
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── chat/           # Chat & messaging
│   │   │   ├── files/          # File management
│   │   │   ├── users/          # User management
│   │   │   ├── security/       # Security features
│   │   │   └── notification/   # Notifications
│   │   ├── database/
│   │   │   ├── entities/       # TypeORM entities
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── mysql/          # MySQL scripts
│   │   │   └── exports/        # Database backups
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Interceptors
│   │   ├── middleware/         # Middleware
│   │   └── main.ts             # Entry point
│   └── package.json
│
├── 📂 docker/                      # Docker configs
│   └── migrate-entrypoint.sh    # Migration script
│
├── 📂 logs/                        # Application logs
│   ├── cloudflare-frontend.log
│   ├── cloudflare-backend.log
│   └── tunnel-urls.txt
│
├── 📂 uploads/                     # Uploaded files (encrypted)
│
├── 📄 docker-compose.yml          # Docker Compose config
├── 📄 .gitignore
├── 📄 README.md                   # This file
├── 📄 CLOUDFLARE_TUNNEL_GUIDE.md # Tunnel guide
├── 📄 start-tunnels.sh           # Start tunnels script
├── 📄 check-tunnels.sh           # Check tunnels script
└── 📄 export-database.sh         # Export database script
```

---

## 🔧 Scripts hữu ích

### **Backend Scripts**
```bash
cd backend

# Development
npm run start:dev          # Chạy dev mode với hot-reload
npm run start:debug        # Chạy debug mode

# Build & Production
npm run build              # Build production
npm run start:prod         # Chạy production

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Test coverage

# Database
npm run migration:run      # Chạy migrations
npm run migration:revert   # Revert migration
```

### **Frontend Scripts**
```bash
cd frontend

npm start                  # Development server
npm run build              # Build production
npm test                   # Run tests
```

### **Docker Scripts**
```bash
# Khởi động tất cả
docker-compose up -d

# Khởi động service cụ thể
docker-compose up -d mysql
docker-compose up -d backend
docker-compose up -d frontend

# Xem logs
docker-compose logs -f
docker-compose logs -f backend

# Dừng services
docker-compose stop
docker-compose down         # Dừng và xóa containers

# Rebuild
docker-compose up -d --build

# Xóa volumes (cẩn thận - mất data!)
docker-compose down -v
```

### **Database Scripts**
```bash
# Export database
./export-database.sh

# Import database
docker exec -i cybersecure-mysql mysql -uroot -ppassword cybersecure_db < backend/database/exports/full_backup_YYYYMMDD_HHMMSS.sql

# Access MySQL shell
docker exec -it cybersecure-mysql mysql -uroot -ppassword cybersecure_db

# Backup manual
docker exec cybersecure-mysql mysqldump -uroot -ppassword cybersecure_db > backup.sql
```

### **Cloudflare Tunnel Scripts**
```bash
# Khởi động tunnels
./start-tunnels.sh

# Kiểm tra trạng thái
./check-tunnels.sh

# Dừng tunnels
pkill cloudflared
```

---

## 🔐 Environment Variables

### **Backend (.env)**
```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=cybersecure_db
DB_SYNC=false

# JWT
JWT_SECRET=dev-secret-key-for-development-only-change-this
JWT_EXPIRES_IN=1d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# MFA
MFA_ISSUER=CyberSecure Enterprise

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### **Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_WS_URL=ws://localhost:3001
```

---

## 📊 API Documentation

### **Base URL**
```
http://localhost:3001/api/v1
```

### **Authentication Endpoints**
```http
POST   /auth/register          # Đăng ký
POST   /auth/login             # Đăng nhập
POST   /auth/verify-2fa        # Xác thực 2FA
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Đăng xuất
GET    /auth/profile           # Lấy profile
```

### **Chat Endpoints**
```http
GET    /chat/conversations                    # Danh sách cuộc hội thoại
POST   /chat/conversations                    # Tạo cuộc hội thoại
GET    /chat/conversations/:id/messages       # Lấy tin nhắn
POST   /chat/conversations/:id/messages       # Gửi tin nhắn
PATCH  /chat/messages/:id/edit               # Sửa tin nhắn
POST   /chat/messages/:id/forward            # Chuyển tiếp
DELETE /chat/messages/:id                    # Xóa tin nhắn
POST   /chat/messages/:id/react              # Thả cảm xúc
```

### **File Endpoints**
```http
POST   /files/upload           # Upload file
GET    /files/:id/download     # Download file
GET    /files                  # Danh sách files
DELETE /files/:id              # Xóa file
```

### **User Management**
```http
GET    /users                  # Danh sách users (Admin)
GET    /users/:id              # Chi tiết user
PUT    /users/:id              # Cập nhật user
DELETE /users/:id              # Xóa user
```

### **Security**
```http
GET    /security/audit-logs    # Audit logs
GET    /security/events        # Security events
GET    /security/metrics       # Security metrics
POST   /security/alerts        # Create alert
```

📖 **Full API Documentation:** Xem trong code hoặc Swagger UI (nếu enabled)

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### **Frontend Tests**
```bash
cd frontend

# Run tests
npm test

# Coverage
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### **Lỗi: Port đã được sử dụng**
```bash
# Kiểm tra port đang dùng
lsof -i :3000
lsof -i :3001
lsof -i :3307

# Kill process
kill -9 <PID>
```

### **Lỗi: Docker container không start**
```bash
# Xem logs
docker-compose logs mysql
docker-compose logs backend

# Restart
docker-compose restart mysql

# Rebuild
docker-compose up -d --build
```

### **Lỗi: Database connection failed**
```bash
# Kiểm tra MySQL đang chạy
docker ps | grep mysql

# Kiểm tra health
docker-compose ps

# Restart MySQL
docker-compose restart mysql
```

### **Lỗi: Migration failed**
```bash
# Xem logs migration
docker logs cybersecure-migrate

# Chạy lại migration
docker-compose up migrate

# Reset database (cẩn thận!)
docker-compose down -v
docker-compose up -d
```

### **Lỗi: Frontend không connect được Backend**
```bash
# Kiểm tra REACT_APP_API_URL trong .env
cat frontend/.env

# Kiểm tra CORS trong backend
# File: backend/src/main.ts
```

---

## 📈 Performance & Optimization

### **Backend Optimization**
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching với Redis (optional)
- ✅ Rate limiting
- ✅ Compression

### **Frontend Optimization**
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Minification

---

## 🔒 Security Best Practices

### **Đã triển khai**
- ✅ JWT với expiration
- ✅ Password hashing (bcrypt)
- ✅ MFA/2FA
- ✅ RBAC
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Encryption at rest (AES-256-GCM)
- ✅ Encryption in transit (HTTPS)
- ✅ Audit logging
- ✅ Session management

### **Khuyến nghị Production**
- 🔐 Sử dụng HTTPS/SSL
- 🔐 Environment variables riêng
- 🔐 Firewall rules
- 🔐 Regular security audits
- 🔐 Backup strategy
- 🔐 Monitoring & alerting

---

## 📚 Tài liệu tham khảo

### **Hướng dẫn chi tiết**
- [CLOUDFLARE_TUNNEL_GUIDE.md](./CLOUDFLARE_TUNNEL_GUIDE.md) - Hướng dẫn Cloudflare Tunnel

### **External Documentation**
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

## 👥 Team Members

| Vai trò | Tên | Công việc chính |
|---------|-----|-----------------|
| **Team Lead / Backend** | [Tên] | Kiến trúc, Backend API, Database, Security |
| **Frontend Lead** | [Tên] | UI/UX, React, Integration |
| **Full-stack Support** | [Tên] | Support, Testing, Documentation |

---

## 📅 Project Timeline

- **Tuần 1-2:** Thiết kế & Setup
- **Tuần 3-7:** Phát triển Backend (Auth, Chat, Files, Security)
- **Tuần 4-9:** Phát triển Frontend (UI/UX, Integration)
- **Tuần 10-12:** Tích hợp & Testing
- **Tuần 13-14:** Hoàn thiện & Deployment

---

## 📝 Changelog

### Version 1.0.0 (2026-02-03)
- ✅ Initial release
- ✅ Complete chat system with E2EE
- ✅ File management with encryption
- ✅ MFA/2FA authentication
- ✅ RBAC implementation
- ✅ Security dashboard
- ✅ Audit logging
- ✅ Docker deployment
- ✅ Cloudflare Tunnel integration

---

## 📞 Contact & Support

- **Repository:** [GitHub Link]
- **Issues:** [GitHub Issues]
- **Email:** support@cybersecure.com
- **Documentation:** [Wiki/Docs]

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- NestJS Team
- React Team
- TypeORM Team
- Cloudflare Team
- All contributors

---

<div align="center">

**Made with ❤️ by CyberSecure Team**

⭐ Star this repo if you find it helpful!

</div>