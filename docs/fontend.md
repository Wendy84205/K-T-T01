# Frontend Documentation — KTT01 CyberSecure

## Overview

| Property | Value |
|---|---|
| Framework | React 18 |
| Language | JavaScript (ES2022) |
| State Management | React Hooks (`useState`, `useEffect`, `useContext`) |
| Routing | React Router DOM v6 |
| Real-time | Socket.IO Client |
| Encryption | Web Crypto API (SubtleCrypto) |
| UI | Vanilla CSS (CSS Variables for theming) |
| Charts | Recharts |
| Config | `/src/config.js` (auto-updated by tunnel script) |

---

## Project Structure

```
frontend/src/
├── App.js                  # Root router and protected routes
├── config.js               # Backend URL configuration
├── index.css               # Global styles and CSS variables
├── layouts/                # Layout shells (sidebar + header)
│   ├── UserLayout.js       # Layout for regular users
│   ├── AdminLayout.js      # Layout for Admins
│   └── ManageLayout.js     # Layout for Managers
├── pages/
│   ├── LoginPage.js        # Login entry point
│   ├── admin/              # Admin-only pages
│   ├── manage/             # Manager-only pages
│   └── user/               # User pages
├── components/
│   ├── Auth/               # Login form, MFA, access denied
│   └── chat/               # Chat UI components
├── context/                # React context (theme, etc.)
├── styles/                 # Additional CSS files
└── utils/
    ├── api.js              # Centralized API client (all HTTP calls)
    ├── crypto.js           # E2EE encryption utilities
    └── socket.js           # Socket.IO service wrapper
```

---

## Routing (App.js)

| Path | Component | Access |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/` | Redirect to `/home` | Protected |
| `/home` | `UserHomePage` | User/Manager/Admin |
| `/dashboard` | `UserDashboard` | User/Manager/Admin |
| `/profile` | `ProfilePage` | User/Manager/Admin |
| `/documents` | `DocumentsPage` | User/Manager/Admin |
| `/analytics` | `UserAnalytics` | User/Manager/Admin |
| `/manage/overview` | `ManageOverview` | Manager/Admin |
| `/manage/team` | `ManageTeam` | Manager/Admin |
| `/manage/projects` | `ManageProjects` | Manager/Admin |
| `/manage/reports` | `ManageReports` | Manager/Admin |
| `/manage/settings` | `ManageSettings` | Manager/Admin |
| `/manage/chat` | `ManageChat` | Manager/Admin |
| `/manage/documents` | `ManageDocuments` | Manager/Admin |
| `/admin/home` | `AdminHomePage` | Admin only |
| `/admin/users` | `UsersPage` | Admin only |
| `/admin/security` | `SecurityPage` | Admin only |
| `/admin/security-rules` | `SecurityRulesPage` | Admin only |
| `/admin/network` | `NetworkPage` | Admin only |
| `/admin/logs` | `LogsPage` | Admin only |
| `/admin/teams` | `TeamsPage` | Admin only |
| `/admin/settings` | `SettingsPage` | Admin only |

---

## Layouts

### UserLayout
- Sidebar with: Home, Dashboard, Profile, Documents, Analytics tabs
- Notification bell with unread badge
- Dark mode toggle
- Profile dropdown with account settings

### AdminLayout
- Sidebar with full Admin navigation
- Management, Security, Network, Logs, Teams, Settings sections

### ManageLayout
- Sidebar for Manager role
- Team, Projects, Reports, Settings, Chat, Documents sections

---

## Pages

### `/home` — UserHomePage

The main hub for users. Contains multiple views accessible via sidebar:

| View | Description |
|---|---|
| **Chat** | Full messaging interface with E2EE, reactions, file sharing, pinned messages, replies |
| **Alerts** | Notification center with filters (all/unread/security) |
| **My Tasks** | Tasks assigned to the user with status cycling and progress report submission |
| **Settings** | Profile edit, MFA setup, password change, preferences, sessions, activity logs |

**E2EE PIN Modal** (`E2EEPassphraseModal`):
- Appears on login if session has no E2EE key
- Mode `setup_needed`: User creates a new 6-digit PIN (generates RSA key pair, uploads public key)
- Mode `locked`: User enters existing PIN to unlock their private key
- Automatically checks server bundle if localStorage is empty (cross-device support)

### `/dashboard` — UserDashboard
- Quick stats cards (tasks, messages, files)
- Activity feed
- Recent conversations

### `/profile` — ProfilePage
- Display user info: name, email, department, job title, employee ID, clearance level

### `/documents` — DocumentsPage
- File manager with upload, download, version history
- File sharing with permission levels (`view`, `edit`, `admin`)
- File integrity verification

### `/analytics` — UserAnalytics
- Personal activity analytics
- Charts for message activity, file usage

---

## Admin Pages

### `/admin/users` — UsersPage
- Paginated user table with search/filter
- Create, edit, activate, ban, hard-delete users
- Assign roles, reset passwords
- Bulk status updates
- Global lockdown trigger

### `/admin/security` — SecurityPage
- Security dashboard overview (incidents, alerts, events)
- Audit log viewer with filters
- Security event timeline
- IP blocking/unblocking
- Rate limit management

### `/admin/security-rules` — SecurityRulesPage
- List and manage security policies
- Enable/disable rules

### `/admin/network` — NetworkPage
- Network traffic visualization (Recharts)
- Active connection map
- Bandwidth usage metrics

### `/admin/logs` — LogsPage
- System log viewer with level filter (info, warn, error, debug)

### `/admin/teams` — TeamsPage
- Teams management: create, edit members, update roles

### `/admin/settings` — SettingsPage
- System-wide configuration

---

## Manager Pages

### `/manage/overview` — ManageOverview
- Team KPIs, project progress, member status overview

### `/manage/team` — ManageTeam
- Team member list, workload view, role management

### `/manage/projects` — ManageProjects
- Project/task management
- Assign tasks with priority, due date
- Task status pipeline (todo → in_progress → done)

### `/manage/reports` — ManageReports
- Report generation with filters
- Progress report submissions from team members

### `/manage/chat` — ManageChat
- Team-focused messaging view

### `/manage/documents` — ManageDocuments
- Shared document vault for the team with drag-and-drop upload

---

## Core Utilities

### `utils/api.js`
Centralized HTTP client. All calls include the `Authorization: Bearer <token>` header automatically.

Key methods:
```js
api.login(username, password)          // POST /auth/login
api.verifyMfa(token, tempToken)        // POST /auth/verify-mfa
api.getProfile()                       // GET /auth/profile
api.getConversations()                 // GET /chat/conversations
api.sendMessage(convId, content, ...)  // POST /chat/conversations/:id/messages
api.uploadFile(formData)               // POST /files/upload
api.getE2EEBundle()                    // GET /users/profile/e2ee-bundle
api.saveE2EEBundle(bundle)             // PUT /users/profile/e2ee-bundle
api.getMyTasks()                       // GET /v1/projects/tasks/my
api.getNotifications()                 // GET /notifications
```

### `utils/crypto.js`
Client-side encryption using the **Web Crypto API** (zero backend dependency for actual crypto).

| Function | Description |
|---|---|
| `setupE2EEWithPassword(userId, pin)` | Generate RSA-2048 key pair, encrypt private key with PIN via PBKDF2+AES-GCM, store locally + upload to server |
| `unlockE2EEWithPassword(userId, pin)` | Load bundle from localStorage or server, decrypt private key using PIN |
| `encryptHybrid(content, recipientKeysMap)` | AES-GCM encrypt content, RSA-OAEP encrypt AES key per recipient |
| `decryptHybrid(payload, privateKey, myId)` | Reverse of encryptHybrid |
| `hasE2EEBundle(userId)` | Quick check if localStorage has the bundle |
| `deriveAesKeyFromPassword(password, salt)` | PBKDF2 key derivation (310,000 iterations, SHA-256) |

### `utils/socket.js`
Socket.IO client service:
```js
socketService.connect(token, userId)   // Connect and authenticate
socketService.onNotification(cb)       // Subscribe to notifications
socketService.onTaskAssigned(cb)       // Subscribe to task assignments
socketService.emit(event, data)        // Send event
socketService.disconnect()             // Clean disconnect
```

---

## Theming

The app uses **CSS Variables** for full dark/light mode support, defined in `index.css`:

```css
--bg-app          /* Main background */
--bg-panel        /* Panel/card background */
--bg-light        /* Lighter background */
--text-main       /* Primary text */
--text-muted      /* Secondary/muted text */
--primary         /* Brand color (#667eea) */
--primary-light   /* Light primary (glow effects) */
--border-color    /* All borders */
--shadow          /* Box shadows */
--green-color     /* Success indicators */
--red-color       /* Error/danger indicators */
--accent-amber    /* Warning indicators */
```

Dark mode is toggled via `localStorage.setItem('darkMode', true)` and applied by toggling a class on `document.body`.

---

## Security Considerations

| Area | Implementation |
|---|---|
| Token storage | `localStorage` (accessToken) + `sessionStorage` (E2EE private key per session) |
| E2EE private key | Never sent to server in plain form — only PBKDF2+AES-GCM encrypted bundle |
| PIN | Never leaves the device — used only client-side for key derivation |
| Message content | Encrypted before HTTP request — server only ever sees ciphertext |
| Session expiry | JWT with expiry + server-side session revocation |
| MFA | TOTP (Time-based One-Time Password) via `tempToken` two-step flow |

---

## Development Setup

```bash
# Install dependencies
cd frontend && npm install

# Start dev server (connects to backend via config.js)
npm start

# For external sharing, use the Cloudflare tunnel script:
cd ../scripts && ./start-tunnels.sh
```

> `config.js` is auto-updated by `start-tunnels.sh` with the current backend URL.

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `socket.io-client` | Real-time WebSocket communication |
| `recharts` | Data visualization charts |
| `react-scripts` | CRA build tooling |
| `@emoji-mart/react` | Emoji picker component |
| `lucide-react` | Icon library |
