# 📋 Kế hoạch triển khai Backend - CyberSecure Enterprise Platform

**Ngày tạo:** 26/01/2026  
**Dự án:** Xây dựng hệ thống web quản lý giao tiếp và tài liệu nội bộ doanh nghiệp tích hợp các cơ chế an ninh mạng nâng cao

---

## 📌 Tổng quan

### Yêu cầu chính từ đề tài:
1. ✅ **Xác thực & Phân quyền:** Login, JWT, MFA/2FA, RBAC
2. ⚠️ **Giao tiếp nội bộ an toàn:** Chat với mã hóa E2EE, log truy cập
3. ⚠️ **Quản lý tài liệu:** Upload/download, mã hóa file, SHA-256 hash, kiểm tra integrity
4. ✅ **Bảo mật:** Zero Trust (một phần), Audit Trail, Rate Limiting, Brute-force protection

---

## 🗂️ Kế hoạch theo Module/File

### 1. **AUTH MODULE** ✅ (Đã hoàn thành cơ bản)

#### `src/modules/auth/auth.service.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ Login với email/username
- ✅ MFA flow (temp token → verify → full token)
- ✅ JWT token generation với roles
- ✅ Refresh token endpoint
- ⚠️ **Bổ sung:** Rate limiting cho login attempts (tích hợp với `RateLimitGuard`)
- ⚠️ **Bổ sung:** Log failed login attempts vào `FailedLoginAttempt` entity
- ⚠️ **Bổ sung:** Device fingerprinting cho session tracking

#### `src/modules/auth/auth.controller.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ POST `/auth/login`
- ✅ POST `/auth/verify-mfa`
- ✅ GET `/auth/profile`
- ✅ POST `/auth/refresh`
- ⚠️ **Bổ sung:** POST `/auth/logout` (invalidate session)
- ⚠️ **Bổ sung:** POST `/auth/forgot-password` (reset password flow)
- ⚠️ **Bổ sung:** POST `/auth/reset-password` (với token)

#### `src/modules/auth/dto/login.dto.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ Hỗ trợ email hoặc username
- ✅ Password validation
- ✅ Transform lowercase cho email

#### `src/modules/auth/services/register.service.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ User registration với validation
- ✅ MFA settings creation
- ✅ Email domain validation
- ⚠️ **Bổ sung:** Email verification flow (gửi email với token)
- ⚠️ **Bổ sung:** Manager approval workflow cho một số department

---

### 2. **CHAT MODULE** ⚠️ (Cần implement đầy đủ)

#### `src/modules/chat/chat.service.ts`
**Trạng thái:** ⚠️ Chỉ có TODO comments  
**Cần làm:**
1. **Conversation Management:**
   - `createConversation(userId: string, participantIds: string[], isEncrypted: boolean)` - Tạo conversation mới
   - `getUserConversations(userId: string)` - Lấy danh sách conversations của user
   - `addParticipant(conversationId: string, userId: string)` - Thêm thành viên
   - `removeParticipant(conversationId: string, userId: string)` - Xóa thành viên
   - `getConversationById(conversationId: string, userId: string)` - Lấy chi tiết conversation (kiểm tra quyền)

2. **Message Encryption & Storage:**
   - `sendMessage(conversationId: string, senderId: string, content: string, fileId?: string)` - Gửi tin nhắn
     - Lấy encryption key từ `ConversationMember.encryptionKeyId` hoặc tạo mới
     - Encrypt content bằng `EncryptionService.encryptText()`
     - Lưu `encryptedContent`, `initializationVector`, `encryptionKeyId` vào DB
     - Log vào `AuditLog` (eventType: 'MESSAGE_SENT')
   - `getMessages(conversationId: string, userId: string, page: number, limit: number)` - Lấy messages
     - Kiểm tra user có trong conversation
     - Decrypt messages trước khi trả về
   - `decryptMessage(message: Message, userId: string)` - Helper decrypt message
     - Lấy encryption key từ `EncryptionKey` entity
     - Decrypt bằng `EncryptionService.decryptText()`

3. **Real-time với WebSocket:**
   - Tích hợp Socket.IO hoặc WebSocket gateway
   - `onMessage(conversationId, message)` - Broadcast message đến participants
   - `onTyping(conversationId, userId)` - Typing indicator
   - `onReadReceipt(messageId, userId)` - Đánh dấu đã đọc

4. **Read Receipts:**
   - `markAsRead(messageId: string, userId: string)` - Tạo `MessageRead` record
   - `getUnreadCount(conversationId: string, userId: string)` - Đếm tin nhắn chưa đọc

5. **File Sharing trong Chat:**
   - `attachFile(messageId: string, fileId: string)` - Gắn file vào message
   - Kiểm tra quyền truy cập file trước khi attach

**Dependencies:**
- `EncryptionService` (đã có)
- `Conversation`, `Message`, `ConversationMember` entities (đã có)
- `AuditService` để log

#### `src/modules/chat/chat.controller.ts`
**Trạng thái:** ⚠️ File rỗng  
**Cần làm:**
1. **Endpoints:**
   - `POST /chat/conversations` - Tạo conversation mới
     - Body: `{ participantIds: string[], isEncrypted: boolean, name?: string }`
     - Guard: `JwtAuthGuard`
   - `GET /chat/conversations` - Lấy danh sách conversations của user
     - Query: `page`, `limit`
   - `GET /chat/conversations/:id` - Lấy chi tiết conversation
   - `POST /chat/conversations/:id/participants` - Thêm participant
   - `DELETE /chat/conversations/:id/participants/:userId` - Xóa participant
   - `POST /chat/conversations/:id/messages` - Gửi message
     - Body: `{ content: string, fileId?: string }`
   - `GET /chat/conversations/:id/messages` - Lấy messages
     - Query: `page`, `limit`, `beforeMessageId?`
   - `POST /chat/messages/:id/read` - Đánh dấu đã đọc
   - `GET /chat/conversations/:id/unread-count` - Lấy số tin nhắn chưa đọc
   - `DELETE /chat/messages/:id` - Xóa message (soft delete)

2. **Guards & Validation:**
   - Tất cả endpoints cần `JwtAuthGuard`
   - Kiểm tra user có trong conversation trước khi truy cập messages
   - Validate DTOs với class-validator

#### `src/modules/chat/chat.module.ts`
**Trạng thái:** ⚠️ File rỗng  
**Cần làm:**
- Import `TypeOrmModule.forFeature([Conversation, Message, ConversationMember, MessageRead])`
- Import `EncryptionService` từ `common/service`
- Import `AuditService` từ `common/service`
- Export `ChatService` để các module khác dùng
- Có thể cần `WebSocketGateway` nếu dùng Socket.IO

#### `src/modules/chat/dto/` (Cần tạo)
**Cần làm:**
- `create-conversation.dto.ts` - `participantIds: string[], isEncrypted: boolean, name?: string`
- `send-message.dto.ts` - `content: string, fileId?: string`
- `message-response.dto.ts` - Response với decrypted content
- `conversation-response.dto.ts` - Response với participant info

---

### 3. **FILE STORAGE MODULE** ⚠️ (Cần implement đầy đủ)

#### `src/modules/file-storage/file-storage.service.ts`
**Trạng thái:** ⚠️ Chỉ có TODO comments  
**Cần làm:**
1. **File Upload:**
   - `uploadFile(file: Express.Multer.File, userId: string, folderId?: string, teamId?: string, isPublic?: boolean)`
     - Validate file type, size (max 100MB)
     - Tính SHA-256 hash: `EncryptionService.hashSHA256(file.buffer)`
     - Generate encryption key: `EncryptionService.generateRandomKey()`
     - Encrypt file buffer: `EncryptionService.encryptFile(file.buffer, key)`
     - Lưu encrypted file vào storage (local hoặc S3)
     - Lưu encryption key vào `EncryptionKey` entity
     - Tạo `File` record với:
       - `fileHash` (SHA-256)
       - `encryptedStoragePath`
       - `encryptionKeyId`
       - `isEncrypted: true`
       - `virusScanStatus: 'pending'`
     - Queue virus scan job (nếu có)
     - Log vào `AuditLog` (eventType: 'FILE_UPLOADED')

2. **File Download:**
   - `downloadFile(fileId: string, userId: string)`
     - Kiểm tra quyền truy cập (owner, team member, hoặc public)
     - Lấy `File` record
     - Lấy encryption key từ `EncryptionKey`
     - Đọc encrypted file từ storage
     - Decrypt: `EncryptionService.decryptFile(encryptedBuffer, key, iv, tag)`
     - Verify hash: So sánh với `fileHash` trong DB
     - Trả về decrypted buffer
     - Log vào `AuditLog` (eventType: 'FILE_DOWNLOADED')

3. **File Integrity Check:**
   - `verifyFileIntegrity(fileId: string)`
     - Đọc file từ storage
     - Tính lại SHA-256 hash
     - So sánh với `fileHash` trong DB
     - Tạo `FileIntegrity` record nếu có violation
     - Trả về `{ isValid: boolean, hashMatch: boolean }`

4. **File Sharing:**
   - `shareFile(fileId: string, userId: string, permissions: { read: boolean, write: boolean }, expiresAt?: Date)`
     - Tạo `FileShare` record với `shareToken`
     - Trả về share link: `/api/v1/files/shared/:shareToken`
   - `getSharedFile(shareToken: string)`
     - Lấy `FileShare` record
     - Kiểm tra expiration
     - Trả về file (decrypted)

5. **File Versioning:**
   - `uploadNewVersion(fileId: string, file: Express.Multer.File, userId: string)`
     - Tạo `FileVersion` record
     - Set `isLatestVersion: false` cho version cũ
     - Set `isLatestVersion: true` cho version mới
     - Increment `versionNumber`

6. **File Management:**
   - `getUserFiles(userId: string, folderId?: string, page: number, limit: number)`
   - `deleteFile(fileId: string, userId: string)` - Soft delete
   - `moveFile(fileId: string, newFolderId: string, userId: string)`
   - `renameFile(fileId: string, newName: string, userId: string)`

**Dependencies:**
- `EncryptionService` (đã có)
- `IntegrityCheckService` (đã có trong `common/service/integrity-check.service.ts`)
- `FileUploadService` (đã có trong `common/service/file-upload.service.ts`)
- `VirusScanService` (đã có trong `common/service/virus-scan.service.ts`)
- Multer cho file upload

#### `src/modules/file-storage/file-storage.controller.ts`
**Trạng thái:** ⚠️ File rỗng  
**Cần làm:**
1. **Endpoints:**
   - `POST /files/upload` - Upload file
     - `@UseInterceptors(FileInterceptor('file'))`
     - Body: `folderId?`, `teamId?`, `isPublic?`
     - Guard: `JwtAuthGuard`
   - `GET /files/:id/download` - Download file
     - Guard: `JwtAuthGuard` + kiểm tra quyền
   - `GET /files/:id` - Lấy file metadata
   - `GET /files` - Lấy danh sách files
     - Query: `folderId?`, `teamId?`, `page`, `limit`
   - `POST /files/:id/share` - Share file
     - Body: `{ permissions: { read: boolean, write: boolean }, expiresAt?: Date }`
   - `GET /files/shared/:shareToken` - Download shared file (public)
   - `POST /files/:id/verify-integrity` - Verify file integrity
   - `POST /files/:id/versions` - Upload new version
   - `GET /files/:id/versions` - Lấy danh sách versions
   - `DELETE /files/:id` - Xóa file
   - `PATCH /files/:id` - Update metadata (rename, move)

2. **Guards & Validation:**
   - Tất cả endpoints cần `JwtAuthGuard`
   - File size limit: 100MB
   - File type validation (whitelist)
   - DTOs với class-validator

#### `src/modules/file-storage/file-storage.module.ts`
**Trạng thái:** ⚠️ File rỗng  
**Cần làm:**
- Import `TypeOrmModule.forFeature([File, FileVersion, FileShare, FileIntegrity, Folder, EncryptionKey])`
- Import `EncryptionService`, `IntegrityCheckService`, `FileUploadService`, `VirusScanService`
- Import `MulterModule` để config file upload
- Export `FileStorageService`

#### `src/modules/file-storage/dto/` (Cần tạo)
**Cần làm:**
- `upload-file.dto.ts` - `folderId?: string, teamId?: string, isPublic?: boolean`
- `file-response.dto.ts` - Response với metadata (không có encryption key)
- `share-file.dto.ts` - `permissions: { read: boolean, write: boolean }, expiresAt?: Date`
- `file-version.dto.ts` - Version info

---

### 4. **SECURITY MODULE** ✅ (Đã hoàn thành tốt)

#### `src/modules/security/security.service.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ Audit logs
- ✅ Security events
- ✅ Failed login analysis
- ✅ Rate limiting
- ✅ Security alerts
- ✅ Security policies
- ⚠️ **Bổ sung:** Implement các TODO methods:
  - `getActiveSessions()` - Lấy active sessions từ `UserSession` entity
  - `getRiskAssessment()` - Tính toán risk score dựa trên events, failed logins, etc.
  - `generateDailyReport()`, `generateWeeklyReport()`, `generateCustomReport()` - Tạo báo cáo chi tiết
  - `checkFileIntegrity()` - Tích hợp với `FileIntegrity` entity
  - `getIntegrityViolations()` - Lấy violations từ `FileIntegrity`

#### `src/modules/security/security.controller.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ Tất cả endpoints đã có
- ⚠️ **Bổ sung:** WebSocket endpoint cho real-time security alerts (nếu cần)

---

### 5. **MFA MODULE** ✅ (Đã hoàn thành)

#### `src/modules/mfa/mfa.service.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ TOTP setup và verify
- ✅ Backup codes
- ✅ MFA status
- ⚠️ **Bổ sung:** Email MFA implementation (gửi OTP qua email)
- ⚠️ **Bổ sung:** SMS MFA implementation (gửi OTP qua SMS - cần tích hợp SMS provider)

#### `src/modules/mfa/mfa.controller.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ Tất cả endpoints đã có
- ⚠️ **Bổ sung:** Endpoints cho Email/SMS MFA setup

---

### 6. **COMMON SERVICES** ✅ (Đã có sẵn)

#### `src/common/service/encryption.service.ts`
**Trạng thái:** ✅ Hoàn thành  
**Cần làm:**
- ✅ AES-256-GCM encryption/decryption
- ✅ SHA-256 hashing
- ✅ File và text encryption
- ✅ Password hashing (bcrypt)
- ✅ Key derivation (PBKDF2)

#### `src/common/service/integrity-check.service.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem service đã implement chưa
- Nếu chưa: Implement `verifyFileIntegrity(fileId: string, expectedHash: string)`
- Tích hợp với `FileIntegrity` entity để lưu violations

#### `src/common/service/file-upload.service.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem service đã implement chưa
- Nếu chưa: Implement Multer config, file storage (local/S3), file validation

#### `src/common/service/virus-scan.service.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem service đã implement chưa
- Nếu chưa: Tích hợp với ClamAV hoặc cloud virus scanning service
- Update `File.virusScanStatus` sau khi scan

---

### 7. **GUARDS & MIDDLEWARE** ✅ (Đã có sẵn)

#### `src/common/guards/rate-limit.guard.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem guard đã implement chưa
- Nếu chưa: Implement rate limiting dựa trên IP/userId
- Tích hợp với `RateLimit` entity
- Apply cho login, register, API endpoints

#### `src/common/guards/mfa.guard.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem guard đã implement chưa
- Nếu chưa: Implement guard để yêu cầu MFA cho sensitive operations
- Tích hợp với `MfaService.validateMfaForAccess()`

#### `src/common/middleware/device-fingerprint.middleware.ts`
**Trạng thái:** ⚠️ Cần kiểm tra  
**Cần làm:**
- Kiểm tra xem middleware đã implement chưa
- Nếu chưa: Implement device fingerprinting từ User-Agent, IP, etc.
- Lưu vào `UserSession` entity

---

### 8. **APP MODULE** ✅ (Cần uncomment modules)

#### `src/app.module.ts`
**Trạng thái:** ⚠️ Một số modules bị comment  
**Cần làm:**
- Uncomment `ChatModule` sau khi implement xong
- Uncomment `FileStorageModule` sau khi implement xong
- Uncomment `NotificationModule` nếu cần
- Uncomment `ProjectModule` nếu cần

---

## 📊 Thứ tự ưu tiên triển khai

### **Phase 1: Hoàn thiện Auth & Security** (Ưu tiên cao)
1. ✅ Auth module (đã xong)
2. ✅ MFA module (đã xong)
3. ✅ Security module (đã xong)
4. ⚠️ Bổ sung rate limiting cho login
5. ⚠️ Bổ sung device fingerprinting
6. ⚠️ Hoàn thiện các TODO trong SecurityService

### **Phase 2: Chat Module** (Ưu tiên cao)
1. ⚠️ Implement `ChatService` với encryption
2. ⚠️ Implement `ChatController` với endpoints
3. ⚠️ Tích hợp WebSocket/Socket.IO cho real-time
4. ⚠️ Test encryption/decryption flow
5. ⚠️ Frontend integration

### **Phase 3: File Storage Module** (Ưu tiên cao)
1. ⚠️ Implement `FileStorageService` với encryption & hash
2. ⚠️ Implement `FileStorageController` với upload/download
3. ⚠️ Implement file integrity checking
4. ⚠️ Implement file sharing với tokens
5. ⚠️ Tích hợp virus scanning
6. ⚠️ Frontend integration

### **Phase 4: Common Services & Guards** (Ưu tiên trung bình)
1. ⚠️ Kiểm tra và hoàn thiện `IntegrityCheckService`
2. ⚠️ Kiểm tra và hoàn thiện `FileUploadService`
3. ⚠️ Kiểm tra và hoàn thiện `VirusScanService`
4. ⚠️ Implement `RateLimitGuard`
5. ⚠️ Implement `MfaGuard`
6. ⚠️ Implement `DeviceFingerprintMiddleware`

### **Phase 5: Testing & Documentation** (Ưu tiên trung bình)
1. ⚠️ Unit tests cho các services
2. ⚠️ Integration tests cho API endpoints
3. ⚠️ E2E tests cho authentication flow
4. ⚠️ Security testing (penetration testing)
5. ⚠️ API documentation (Swagger/OpenAPI)

---

## 🔒 Security Checklist

### **Đã implement:**
- ✅ JWT authentication
- ✅ MFA/2FA (TOTP)
- ✅ Password hashing (bcrypt)
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit logging
- ✅ Rate limiting (entity có sẵn)
- ✅ Failed login tracking

### **Cần implement:**
- ⚠️ Rate limiting guard (apply cho endpoints)
- ⚠️ File encryption (AES-256-GCM)
- ⚠️ Message encryption (E2EE cho chat)
- ⚠️ File integrity checking (SHA-256)
- ⚠️ Device fingerprinting
- ⚠️ Session management
- ⚠️ Zero Trust architecture (device trust, location-based access)
- ⚠️ Virus scanning cho file uploads

---

## 📝 Notes

1. **Encryption Keys:** Cần implement `KeyManagementService` để quản lý encryption keys, rotation, và secure storage.

2. **WebSocket:** Cần quyết định dùng Socket.IO hay native WebSocket. Socket.IO có nhiều features hơn (rooms, namespaces, fallback).

3. **File Storage:** Cần quyết định dùng local storage hay cloud storage (S3, Azure Blob). Local storage đơn giản hơn nhưng không scalable.

4. **Virus Scanning:** Cần tích hợp với ClamAV (local) hoặc cloud service như VirusTotal API.

5. **Email/SMS:** Cần tích hợp email service (SendGrid, AWS SES) và SMS service (Twilio, AWS SNS) cho MFA.

6. **Testing:** Cần test kỹ encryption/decryption flow để đảm bảo không mất dữ liệu.

---

## ✅ Checklist hoàn thành

- [x] Auth module (login, register, JWT, MFA)
- [x] Security module (audit logs, events, alerts)
- [x] MFA module (TOTP)
- [x] EncryptionService (AES-256-GCM, SHA-256)
- [ ] Chat module (service, controller, WebSocket)
- [ ] File Storage module (upload, download, encryption, integrity)
- [ ] Rate limiting guard
- [ ] Device fingerprinting
- [ ] File integrity checking service
- [ ] Virus scanning service
- [ ] Email/SMS MFA
- [ ] Key management service
- [ ] Testing & Documentation
