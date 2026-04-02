# Client Interaction Detailed Flows (UML)

This document focuses on the interaction flows between the **Client (User)** and other system components (Backend, Database, Storage, Security) through UML Sequence Diagrams.

---

## 1. Authentication & Security Flow (Auth & MFA)
Describes how the Client interact with the Backend for secure login.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant CF as Cloudflare Tunnel
    participant BE as Backend (NestJS)
    participant DB as MySQL Database

    User->>CF: 1. Request Login (Email/Pass)
    CF->>BE: 2. Forward Request
    BE->>DB: 3. Verify Bcrypt Hash
    DB-->>BE: 4. User Validated
    
    Note right of BE: If MFA Enabled
    BE-->>User: 5. Request TOTP Code (MFA)
    User->>BE: 6. Submit TOTP Code (6 digits)
    BE->>BE: 7. Validate Secret Key
    
    BE->>DB: 8. Write Audit Log (Login Success)
    BE-->>User: 9. Return JWT Access Token
```

---

## 2. End-to-End Encrypted Messaging (E2EE Chat Flow)
Describes the real-time interaction via WebSocket and client-side E2EE processing.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Client A (Sender)
    participant E2EE as E2EE Logic (Browser)
    participant WS as WebSocket Gateway
    participant BE as Backend Logic
    actor Bob as Client B (Receiver)

    Alice->>Alice: Input message: "Hello Bob"
    Alice->>E2EE: Encrypt using Alice's Passphrase
    E2EE-->>Alice: Return { Ciphertext, IV, Tag }
    
    Alice->>WS: Send ciphertext (Socket.emit)
    WS->>BE: Forward data for processing
    BE->>BE: RBAC & Permission check
    BE->>WS: Broadcast message (Broadcast/Private)
    
    WS->>Bob: Receive ciphertext via WebSocket
    Bob->>Bob: Decrypt using Bob's Passphrase
    Bob-->>Bob: Display: "Hello Bob"
```

---

## 3. Secure File Management Flow
Describes the interactions when uploading/downloading encrypted files.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client
    participant BE as Backend (File Service)
    participant Enc as Encryption Layer (Server-side)
    participant Disk as Storage (Local/S3)
    participant Hash as Integrity Checker (SHA-256)

    User->>BE: 1. Upload File (Multipart)
    BE->>Hash: 2. Calculate initial SHA-256 Hash
    BE->>Enc: 3. Encrypt using AES-256-GCM
    Enc->>Disk: 4. Store encrypted data
    BE->>Hash: 5. Log File Integrity
    BE-->>User: 6. Success notification (HTTP 201)

    Note over User, Disk: During Download
    User->>BE: 7. Request Download (FileID)
    BE->>Disk: 8. Read encrypted data
    Disk-->>BE: 9. Return Blob
    BE->>Enc: 10. Decrypt data
    BE->>Hash: 11. Integrity check verified
    BE-->>User: 12. Return raw file (Decrypted Stream)
```

---

## 4. Interaction Summary
- **Client - Cloudflare:** Secure HTTPS/SSL connection over the Internet.
- **Client - Backend:** Stateless exchange using JWT Tokens in Authorization Header.
- **Client - WebSocket:** Persistent full-duplex connection for instant updates.
- **Backend - Storage:** Encrypted binary streams for sensitive data protection at rest.
