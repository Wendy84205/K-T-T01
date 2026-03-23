# Sơ đồ Chi tiết: Luồng Tin nhắn Mã hoá (E2EE)

Hệ thống KTT01 sử dụng **hai lớp mã hoá độc lập** để bảo vệ tin nhắn. Tài liệu này mô tả toàn bộ luồng từ lúc người dùng gõ nội dung cho đến khi tin nhắn được hiển thị an toàn ở phía người nhận.

---

## Kiến trúc 2 lớp mã hoá

| Lớp | Tên | Thuật toán | Nơi thực thi | Ghi chú |
|-----|-----|------------|--------------|---------|
| **Layer 1** | Transport Encryption | `AES-256-GCM` | `chat.service.ts` (Backend) | Bảo vệ dữ liệu khi lưu xuống Database |
| **Layer 2** | E2EE Hybrid Encryption | `AES-256-GCM` + `RSA-OAEP-2048` | `crypto.js` (Frontend) | Chỉ người nhận có Private Key mới đọc được |

---

## Sơ đồ 1: Setup Khóa E2EE (Lần đầu đăng nhập)

```plantuml
@startuml
skinparam NoteBackgroundColor #fffde7
skinparam handwritten false
skinparam sequenceArrowThickness 2

title Luồng Setup Khóa E2EE Lần Đầu (crypto.js)

actor "Người dùng" as User
participant "Frontend\n(crypto.js)" as FE
participant "Backend API\n(users.controller)" as API
database "Database\n(users table)" as DB

User -> FE: Đăng nhập lần đầu
FE -> FE: Kiểm tra localStorage có e2ee_bundle chưa?\n(hasE2EEBundle L168)

alt Chưa có bundle
    FE -> FE: generateKeyPair() - L176\n[RSA-OAEP-2048: tạo cặp khóa Public/Private]
    FE -> FE: encryptPrivateKeyWithPassword(privateKey, PIN) - L51\n→ Salt (32 bytes random)\n→ IV (12 bytes random)\n→ AES-GCM encrypt  Private Key\n→ encryptedPrivateKey (bundle)
    
    note over FE
      **PBKDF2 (crypto.js L29-L45):**
      Input: PIN + Salt
      Iterations: 310,000 (OWASP 2023)
      Output: AES-256 Key
      Mục đích: Chống brute-force mã PIN
    end note
    
    FE -> FE: Lưu bundle vào localStorage (L104)\n{encryptedPrivateKey, salt, iv, publicKey}
    FE -> API: POST /users/profile/e2ee-bundle\n{encryptedPrivateKey, salt, iv} (L109)
    API -> DB: Lưu publicKey vào cột users.publicKey
    API -> DB: Lưu bundle (encrypted) vào bảng e2ee_bundles
    FE --> User: Sẵn sàng chat mã hoá
else Đã có bundle
    FE -> FE: unlockE2EEWithPassword(userId, PIN) - L129\n→ Lấy bundle từ localStorage\n→ Giải mã Private Key bằng PIN
    FE --> User: Sẵn sàng chat mã hoá (không cần setup lại)
end

@enduml
```

---

## Sơ đồ 2: Gửi Tin nhắn (2 lớp mã hoá)

```plantuml
@startuml
skinparam NoteBackgroundColor #e8f5e9
skinparam handwritten false
skinparam sequenceArrowThickness 2

title Luồng Gửi Tin nhắn Mã hoá (2 lớp)

actor "Alice\n(Người gửi)" as Alice
participant "Frontend Alice\n(ChatWindow.js)" as FE_A
participant "Frontend Alice\n(crypto.js)" as Crypto
participant "Chat Controller\n(chat.controller.ts)" as API
participant "Chat Service\n(chat.service.ts)" as SVC
database "MySQL\n(messages table)" as DB
participant "Socket.IO\n(chat.gateway.ts)" as Socket

== LAYER 2: E2EE Hybrid Encryption (Phía Frontend) ==

Alice -> FE_A: Nhập nội dung tin nhắn & nhấn Gửi
FE_A -> Crypto: encryptHybrid(content, recipientPublicKeysMap) - L247

note over Crypto
  **Bước 1: Tạo Message Key (AES)**
  - window.crypto.subtle.generateKey(AES-GCM 256) (L249)
  - Sinh IV ngẫu nhiên 12 bytes (L250)
end note

Crypto -> Crypto: AES-GCM encrypt(content + MessageKey) → CipherText (L254)
Crypto -> Crypto: exportKey(MessageKey) → rawAesKey (L261)

loop For each recipient (Alice & Bob)
    Crypto -> Crypto: importKey(recipientPublicKey) (L268)
    Crypto -> Crypto: RSA-OAEP encrypt(rawAesKey + PublicKey) → EncryptedKey (L269)
end

Crypto --> FE_A: Payload { v:"2", iv, ciphertext, keys:{userId: encryptedKey} }

== LAYER 1: Transport Encryption (Phía Backend) ==

FE_A -> Socket: socket.emit("sendMessage", payload) → đến Gateway (chat.gateway.ts L111)
Socket -> API: POST /chat/:id/messages (chat.controller.ts)
API -> SVC: sendMessage(conversationId, userId, payload) (chat.service.ts L378)

note over SVC
  **Bước 1: Backend AES-256-GCM**
  EncryptionService.encryptText(content, chatMasterKey) (L390)
  - IV ngẫu nhiên mới
  - Auth Tag (GCM mode)
  Lưu: encryptedContent, initializationVector, authTag
end note

SVC -> DB: INSERT message\n{encryptedContent, initializationVector, authTag,\n isEncrypted:true, encryptionAlgorithm:"AES-256-GCM"} (L398-L410)
SVC --> Socket: Trả về message object (L424)
Socket -> Socket: emitNewMessage(conversationId, message) (L111)

@enduml
```

---

## Sơ đồ 3: Nhận & Giải mã Tin nhắn

```plantuml
@startuml
skinparam NoteBackgroundColor #e3f2fd
skinparam handwritten false
skinparam sequenceArrowThickness 2

title Luồng Nhận & Giải mã Tin nhắn (2 lớp)

participant "Socket.IO\n(chat.gateway.ts)" as Socket
participant "Chat Service\n(chat.service.ts)" as SVC
database "MySQL\n(messages table)" as DB
participant "Frontend Bob\n(crypto.js)" as Crypto
actor "Bob\n(Người nhận)" as Bob

== LAYER 1: Backend Giải mã để Relay ==

Socket -> SVC: getConversationMessages (L300)
SVC -> DB: SELECT message WHERE isDeleted=false
DB --> SVC: {encryptedContent, initializationVector, authTag}
SVC -> SVC: decryptIfNeeded(message) - L179\nEncryptionService.decryptText(encryptedContent,\nchatMasterKey, IV, authTag) - L182

note over SVC
  Layer 1 chỉ giải mã để chuyển tiếp.
  Nội dung vẫn là CipherText E2EE Layer 2.
  Server KHÔNG thể đọc nội dung thật vì
  không có RSA Private Key của người dùng!
end note

SVC --> Socket: message.content = E2EE_CipherText_JSON

== LAYER 2: E2EE Giải mã tại Frontend ==

Socket -> Crypto: socket.on("newMessage", hybridData) 
Crypto -> Crypto: decryptHybrid(hybridData, privateKey, myId) - L284

note over Crypto
  **Bước 1: Lấy AES Key (RSA giải mã)**
  - Lấy keys[myUserId] = EncryptedAesKey (L286)
  - importKey(privateKey, RSA-OAEP) (L291)
  - RSA-OAEP decrypt(EncryptedAesKey) → rawAesKey (L293)
  
  **Bước 2: Giải mã nội dung (AES)**
  - importKey(rawAesKey, AES-GCM) (L296)
  - AES-GCM decrypt(ciphertext + iv) → plaintext (L301)
end note

Crypto --> Bob: Hiển thị nội dung tin nhắn gốc

@enduml
```

---

## Tóm tắt Công nghệ

| Công nghệ | Vị trí | Dòng code | Mục đích |
|-----------|--------|-----------|---------|
| `AES-256-GCM` (Backend) | `chat.service.ts` | L390, L499 | Mã hoá transport, bảo vệ Database |
| `EncryptionService` | `encryption.service.ts` | L182 | Service tiện ích mã hoá/giải mã AES |
| `AES-256-GCM` (Frontend) | `crypto.js` | L249–L257 | Mã hoá nội dung tin nhắn E2EE |
| `RSA-OAEP-2048` | `crypto.js` | L267–L270 | Bọc/khoá AES key cho từng người nhận |
| `PBKDF2 (310,000 rounds)` | `crypto.js` | L19, L38 | Bảo vệ Private Key bằng mã PIN |
| `Web Crypto API` | `crypto.js` | Toàn file | Native browser API, không có thư viện bên ngoài |
| `Socket.IO` | `chat.gateway.ts` | L111 | Real-time relay tin nhắn |
| `speakeasy` (TOTP) | `mfa.service.ts` | L69 | Xác thực 2 bước khi đăng nhập |

---

## Câu hỏi thường gặp

### Tại sao có 2 lớp mã hoá?
- **Layer 1 (Backend)** bảo vệ dữ liệu trong DB nếu server bị tấn công — nhưng server vẫn đọc được (có master key).
- **Layer 2 (Frontend E2EE)** đảm bảo ngay cả server cũng không đọc được nội dung. Chỉ người có `Private Key` mới giải mã được.

### Server có thể đọc tin nhắn không?
Không. Server chỉ lưu `CipherText` (văn bản đã mã hoá bằng E2EE). Để đọc được cần `Private Key (RSA)` của người nhận, mà `Private Key` này **không bao giờ rời khỏi thiết bị người dùng** — nó nằm trong `sessionStorage` (RAM) của trình duyệt.

### Tại sao cần RSA bọc AES key?
Vì AES là mã hoá **đối xứng** (cùng 1 key để mã hoá và giải mã). Trong nhóm chat nhiều người, không thể chia sẻ key AES an toàn. RSA cho phép mỗi người nhận nhận một bản `AES key` được bọc riêng bằng `Public Key` của họ — chỉ `Private Key` tương ứng mới giải ra được.
