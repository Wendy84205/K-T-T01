# Backend API Documentation — KTT01 CyberSecure

## Overview

| Property | Value |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| Database | MySQL 8 (via TypeORM) |
| Auth | JWT (Access Token + MFA TOTP) |
| Real-time | Socket.IO (WebSocket Gateway) |
| Encryption | AES-GCM + RSA-OAEP (Hybrid E2EE) |
| Base URL | `/api/v1` |

---

## Authentication

All routes (except `@Public()` endpoints) require a JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Roles
| Role | Level |
|---|---|
| `Admin` | Full system access |
| `Manager` | Team + Security visibility |
| `User` | Own data only |

---

## Modules

### 1. Auth — `/api/v1/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | Public | Login with username + password. Returns JWT or `tempToken` if MFA required |
| `POST` | `/verify-mfa` | Public | Verify TOTP code using `tempToken` from login step |
| `POST` | `/refresh` | JWT | Refresh access token |
| `POST` | `/logout` | JWT | Invalidate current session token |
| `POST` | `/heartbeat` | JWT | Ping to keep session alive |
| `GET` | `/profile` | JWT | Get current user profile (roles, publicKey, clearance level) |
| `POST` | `/verify-password` | JWT | Verify user's current password |
| `GET` | `/health` | Public | Health check endpoint |

**Login Response:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": { "id": "...", "email": "...", "roles": ["User"] }
}
```
**MFA Login Response (step 1):**
```json
{
  "requiresMfa": true,
  "tempToken": "eyJhbGci..."
}
```

---

### 2. Users — `/api/v1/users`

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Admin/Manager | List all users (paginated) with filters: `role`, `status`, `search` |
| `PATCH` | `/profile` | JWT | Update own profile fields |
| `POST` | `/profile/avatar` | JWT | Upload avatar image (multipart/form-data) |
| `GET` | `/profile/activity` | JWT | Get own recent audit activity |
| `GET` | `/profile/sessions` | JWT | Get own active sessions |
| `DELETE` | `/profile/sessions/:sessionId` | JWT | Revoke own session |
| `GET` | `/profile/e2ee-bundle` | JWT | Get server-stored encrypted E2EE private key bundle |
| `PUT` | `/profile/e2ee-bundle` | JWT | Upload/update encrypted E2EE bundle to server |
| `GET` | `/avatar/:filename` | Public | Serve user avatar image |
| `GET` | `/:id` | JWT | Get user by ID |
| `POST` | `/` | Admin/Manager | Create new user |
| `PATCH` | `/:id` | Admin/Manager | Update user |
| `PATCH` | `/:id/status` | Admin/Manager | Change user status (`active`, `banned`, `pending`) |
| `DELETE` | `/:id` | Admin/Manager | Soft-delete (deactivate) user |
| `DELETE` | `/:id/purge` | Admin | Hard-delete user permanently |
| `POST` | `/:id/reset-password` | Admin | Reset user password (returns temp password) |
| `POST` | `/bulk-status` | Admin | Bulk update status for multiple users |
| `POST` | `/global-lockdown` | Admin | Lock all non-admin accounts immediately |
| `GET` | `/:id/sessions` | Admin/Manager | Get sessions for a specific user |
| `DELETE` | `/sessions/:sessionId/admin` | Admin/Manager | Admin revoke any session |

---

### 3. Chat — `/api/v1/chat`

All routes require JWT.

#### Conversations
| Method | Route | Description |
|---|---|---|
| `GET` | `/conversations` | Get all conversations for current user |
| `POST` | `/conversations/direct` | Create or get existing direct message conversation |
| `POST` | `/conversations/group` | Create a new group conversation |
| `GET` | `/conversations/:id/messages` | Get messages (paginated, `page` + `limit` query params) |
| `POST` | `/conversations/:id/messages` | Send a message (text/file/reply/self-destruct) |
| `GET` | `/conversations/:id/info` | Get conversation metadata and members |
| `DELETE` | `/conversations/:id` | Delete conversation |
| `POST` | `/conversations/:id/read` | Mark conversation as read |
| `POST` | `/conversations/:id/typing` | Set typing status |
| `GET` | `/conversations/:id/typing` | Get who is typing |
| `POST` | `/conversations/:id/members` | Add member to group |
| `DELETE` | `/conversations/:id/members/:memberId` | Remove member from group |
| `POST` | `/conversations/:id/leave` | Leave a group |
| `PATCH` | `/conversations/:id/name` | Rename group |
| `POST` | `/conversations/:id/members/:memberId/promote` | Promote member to admin |
| `POST` | `/conversations/:id/members/:memberId/demote` | Demote admin to member |
| `GET` | `/conversations/:id/pinned` | Get pinned messages |
| `POST` | `/conversations/:id/pin` | Pin a message |
| `DELETE` | `/conversations/:id/pin/:messageId` | Unpin a message |
| `GET` | `/conversations/:id/search?q=` | Search messages in conversation |
| `GET` | `/conversations/:id/media` | Get shared images/videos |
| `GET` | `/conversations/:id/files` | Get shared files |
| `GET` | `/conversations/:id/links` | Get shared links |

#### Messages
| Method | Route | Description |
|---|---|---|
| `DELETE` | `/messages/:id` | Delete a message |
| `POST` | `/messages/:id/edit` | Edit message content |
| `POST` | `/messages/:id/forward` | Forward message to another conversation |
| `POST` | `/messages/:id/reactions` | Add emoji reaction |
| `GET` | `/messages/:id/reactions` | Get reactions for a message |

#### Discovery & Calls
| Method | Route | Description |
|---|---|---|
| `GET` | `/users` | Get all users (for starting new conversations) |
| `GET` | `/calls/history` | Get call history |
| `GET` | `/discover/groups` | Discover public groups (search, category) |
| `GET` | `/discover/users` | Get suggested users |
| `POST` | `/groups/:id/join` | Join a public group |

#### WebSocket Events (Socket.IO)

| Event (Client → Server) | Description |
|---|---|
| `join_conversation` | Join a conversation room |
| `leave_conversation` | Leave a conversation room |
| `typing` | Notify typing status |
| `send_message` | Send message via socket |
| `mark_read` | Mark messages as read |

| Event (Server → Client) | Description |
|---|---|
| `new_message` | New message received |
| `message_deleted` | Message was deleted |
| `message_edited` | Message was edited |
| `typing_update` | Typing status changed |
| `user_online` | User came online |
| `notification` | New notification |
| `task_assigned` | Task was assigned to user |

---

### 4. Security — `/api/v1/security`

Requires Admin or Manager role.

| Method | Route | Role | Description |
|---|---|---|---|
| `GET` | `/dashboard?days=7` | Admin/Manager | Security dashboard overview |
| `GET` | `/metrics` | Admin | Metrics for date range |
| `GET` | `/audit-logs` | Admin | All audit logs (filterable) |
| `GET` | `/audit-logs/:id` | Admin | Get single audit log |
| `GET` | `/events` | Admin/Manager | Security events (filterable by severity) |
| `GET` | `/events/:id` | Admin/Manager | Get single security event |
| `POST` | `/events/:id/resolve` | Admin | Resolve a security event |
| `GET` | `/failed-logins` | Admin | Analyze failed login attempts |
| `GET` | `/suspicious-ips` | Admin | List suspicious IP addresses |
| `POST` | `/block-ip` | Admin | Block an IP address |
| `POST` | `/unblock-ip` | Admin | Unblock an IP address |
| `GET` | `/rate-limits` | Admin | View rate limit status |
| `POST` | `/rate-limits/reset` | Admin | Reset rate limit for identifier |
| `GET` | `/alerts` | Admin/Manager | Get security alerts |
| `POST` | `/alerts/:id/acknowledge` | Admin/Manager | Acknowledge an alert |
| `POST` | `/alerts/:id/resolve` | Admin | Resolve an alert |
| `GET` | `/system-logs` | Admin | View system logs |
| `GET` | `/policies` | Admin/Manager | List security policies |
| `GET` | `/policies/:id` | Admin/Manager | Get policy detail |
| `POST` | `/policies` | Admin | Create security policy |
| `POST` | `/policies/:id` | Admin | Update security policy |
| `POST` | `/policies/:id/toggle` | Admin | Enable/disable policy |
| `GET` | `/monitoring/active-sessions` | Admin | View all active user sessions |
| `GET` | `/monitoring/current-activity` | Admin | Activity in last N minutes |
| `GET` | `/monitoring/risk-assessment` | Admin | System risk score |
| `GET` | `/reports/daily` | Admin | Daily security report |
| `GET` | `/reports/weekly` | Admin | Weekly security report |
| `POST` | `/reports/generate` | Admin | Generate custom report |
| `POST` | `/integrity/check-files` | Admin | Run file integrity check |
| `GET` | `/integrity/violations` | Admin | List integrity violations |
| `GET` | `/network/traffic` | Admin/Manager | Network traffic data |

---

### 5. File Storage — `/api/v1/files`

| Method | Route | Description |
|---|---|---|
| `POST` | `/upload` | Upload a file (multipart/form-data, field: `file`) |
| `GET` | `/` | List all files owned or shared with current user |
| `GET` | `/:id` | Get file metadata |
| `GET` | `/:id/download?version=` | Download file (specific version optional) |
| `DELETE` | `/:id` | Delete a file |
| `POST` | `/:id/share` | Share file with another user (`targetUserId`, `permission`: view/edit/admin) |
| `GET` | `/:id/shares` | List who this file is shared with |
| `DELETE` | `/:id/shares/:shareId` | Revoke a share |
| `POST` | `/:id/verify` | Verify file integrity (hash check) |
| `GET` | `/:id/versions` | Get version history |
| `POST` | `/:id/versions/:v/restore` | Restore a previous version |
| `DELETE` | `/:id/versions/:v` | Delete a specific version |

---

### 6. Teams — `/api/v1/teams`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Get all teams |
| `POST` | `/` | Create new team |
| `GET` | `/:id` | Get team by ID |
| `GET` | `/:id/members` | Get team members |
| `GET` | `/:id/stats` | Get team statistics |
| `POST` | `/:id/members` | Add member to team (`userId`, `role`) |
| `PUT` | `/:id/members/:userId` | Update member role |
| `DELETE` | `/:id/members/:userId` | Remove member from team |
| `DELETE` | `/:id` | Delete a team |

---

### 7. Projects — `/api/v1/projects`

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Get all projects visible to current user |
| `POST` | `/` | Create new project |
| `GET` | `/:id` | Get project by ID |
| `GET` | `/:id/tasks` | Get tasks for a project |
| `POST` | `/:id/tasks` | Create task in project (sends Socket.IO notification) |
| `POST` | `/tasks/:id` | Update a task (status, progress note, etc.) |
| `GET` | `/tasks/my` | Get tasks assigned to current user |

---

## Error Responses

| Code | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — no or invalid JWT |
| `403` | Forbidden — insufficient role |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate or logic constraint |
| `500` | Internal Server Error |

---

## E2EE Architecture

Messages are encrypted client-side before being sent to the server using **Hybrid Encryption**:

1. A random **AES-256-GCM** key is generated per message
2. The message content is encrypted with this AES key
3. The AES key is encrypted with each recipient's **RSA-2048 public key**
4. Only the encrypted payload is stored in the database

**Private keys** are derived from the user's 6-digit PIN using **PBKDF2** (310,000 iterations) and stored as encrypted bundles — both in the browser's `localStorage` and as a server-side backup at `GET/PUT /api/v1/users/profile/e2ee-bundle`.

The PIN never leaves the user's device.
