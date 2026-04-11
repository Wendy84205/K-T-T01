import { API_BASE_URL } from '../config';
// FIX LỖ HỔNG 7: Import getter lấy token từ bộ nhớ — không còn từ localStorage
import { getInMemoryToken } from '../context/AuthContext';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // FIX LỖ HỔNG 7: Lấy token từ in-memory store, không từ localStorage
    const token = getInMemoryToken();

    const config = {
      ...options,
      // credentials: 'include' cho phép HttpOnly cookie (refresh_token) được gửi kèm
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      let data = {};
      try {
        const text = await response.text();
        if (text) data = JSON.parse(text);
      } catch {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return {};
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Let the AuthContext handle token expiration and redirect
          // instead of clearing immediately here, which causes race conditions.
          console.warn(`Auth error ${response.status} on ${endpoint}`);
        }

        const error = new Error(data.message || data.error || `HTTP ${response.status}`);
        error.data = data; // Attach full response data
        error.status = response.status;
        throw error;
      }

      if (data && data.success && data.data !== undefined) {
        return data.data;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  /** @param {string} identifier - Email or username */
  async login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: identifier.trim(), password }),
    });
  }

  async verifyMfa(token, tempToken) {
    return this.request('/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify({ token, tempToken }),
    });
  }

  async setupMfa() {
    return this.request('/mfa/setup/totp', {
      method: 'POST',
    });
  }

  async verifyMfaSetup(token) {
    return this.request('/mfa/verify/totp-setup', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async checkAvailability(field, value) {
    const params = new URLSearchParams({ field, value: String(value) });
    return this.request(`/auth/register/check-availability?${params}`, {
      method: 'GET',
    });
  }

  async getProfile() {
    return this.request('/auth/profile', {
      method: 'GET',
    });
  }

  async verifyPassword(password) {
    return this.request('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async requestPasswordReset(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPasswordWithToken(token, email, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, newPassword }),
    });
  }

  async heartbeat() {
    try {
      return await this.request('/auth/heartbeat', { method: 'POST' });
    } catch {
      return {};
    }
  }

  // Users endpoints
  async getUsers(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/users?${params}`, {
      method: 'GET',
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    // FIX LỖ HỔNG 7: Dùng in-memory token thay vì localStorage
    const token = getInMemoryToken();
    const response = await fetch(`${this.baseURL}/users/profile/avatar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Avatar upload failed');
    }
    return response.json();
  }

  async getUserActivity() {
    return this.request('/users/profile/activity', {
      method: 'GET',
    });
  }

  async getUserSessions() {
    return this.request('/users/profile/sessions', {
      method: 'GET',
    });
  }

  async revokeSession(sessionId) {
    return this.request(`/users/profile/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async saveE2EEBundle(bundle) {
    return this.request('/users/profile/e2ee-bundle', {
      method: 'PUT',
      body: JSON.stringify(bundle),
    });
  }

  async getE2EEBundle() {
    return this.request('/users/profile/e2ee-bundle', {
      method: 'GET',
    });
  }

  // Admin Session Management
  async getAdminUserSessions(userId) {
    return this.request(`/users/${userId}/sessions`, {
      method: 'GET',
    });
  }

  async adminRevokeSession(sessionId) {
    return this.request(`/users/sessions/${sessionId}/admin`, {
      method: 'DELETE',
    });
  }

  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllNotifications() {
    return this.request('/notifications/all', {
      method: 'DELETE',
    });
  }

  async updateStatus(id, status) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async approveUser(id) {
    return this.updateStatus(id, 'active');
  }

  async rejectUser(id) {
    return this.updateStatus(id, 'banned');
  }

  async emergencyLock(id) {
    return this.updateStatus(id, 'banned');
  }

  async addUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async bulkUpdateStatus(ids, status) {
    return this.request('/users/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
  }

  async globalLockdown() {
    return this.request('/users/global-lockdown', {
      method: 'POST',
    });
  }

  async resetPassword(id) {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  // Security endpoints
  async getSecurityDashboard(days = 7) {
    return this.request(`/security/dashboard?days=${days}`, {
      method: 'GET',
    });
  }

  async getSecurityAlerts(active = true, severity) {
    let url = `/security/alerts?active=${active}`;
    if (severity) url += `&severity=${severity}`;
    return this.request(url, {
      method: 'GET',
    });
  }

  async getSecurityEvents(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/security/events?${params}`, {
      method: 'GET',
    });
  }

  async getAuditLogs(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    return this.request(`/security/audit-logs?${params}`, {
      method: 'GET',
    });
  }

  async runDiagnostics() {
    return this.request('/security/integrity/check-files', {
      method: 'POST',
    });
  }

  async exportSecurityReport() {
    return this.request('/security/reports/daily', {
      method: 'GET',
    });
  }

  async acknowledgeAlert(id) {
    return this.request(`/security/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ notes: 'Acknowledged via Dashboard' }),
    });
  }

  // Security Policy Management
  async getSecurityPolicies(type) {
    let url = '/security/policies';
    if (type) url += `?type=${type}`;
    return this.request(url, { method: 'GET' });
  }

  async createSecurityPolicy(data) {
    return this.request('/security/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSecurityPolicy(id, data) {
    return this.request(`/security/policies/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleSecurityPolicy(id, isActive) {
    return this.request(`/security/policies/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteSecurityPolicy(id) {
    return this.request(`/security/policies/${id}/delete`, {
      method: 'POST',
    });
  }

  async getNetworkTraffic() {
    return this.request('/security/network/traffic', {
      method: 'GET',
    });
  }

  async blockIP(data) {
    return this.request('/security/block-ip', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSettings() {
    return this.request('/settings', {
      method: 'GET',
    });
  }

  async updateSettings(config) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Chat endpoints
  async getConversations() {
    return this.request(`/chat/conversations?t=${Date.now()}`, {
      method: 'GET',
    });
  }

  async getOrCreateDirectConversation(otherUserId) {
    return this.request('/chat/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    });
  }

  async getConversationMessages(conversationId, page = 1, limit = 50) {
    return this.request(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}&t=${Date.now()}`, {
      method: 'GET',
    });
  }

  async sendMessage(conversationId, content, messageType = 'text', fileId = null, parentMessageId = null, selfDestructTime = null) {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        messageType,
        fileId,
        parentMessageId,
        selfDestructTime // optional timer in seconds
      }),
    });
  }

  async markAsRead(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  }

  async getChatUsers() {
    return this.request('/chat/users', {
      method: 'GET',
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async editMessage(messageId, content) {
    return this.request(`/chat/messages/${messageId}/edit`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async forwardMessage(messageId, targetConversationId) {
    return this.request(`/chat/messages/${messageId}/forward`, {
      method: 'POST',
      body: JSON.stringify({ targetConversationId }),
    });
  }

  async createGroupConversation(name, memberIds) {
    return this.request('/chat/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name, memberIds }),
    });
  }

  async addMemberToGroup(conversationId, userId) {
    return this.request(`/chat/conversations/${conversationId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async leaveGroup(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/leave`, {
      method: 'POST',
    });
  }

  async deleteConversation(conversationId) {
    return this.request(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // File Storage endpoints
  async uploadFile(file, filename = null) {
    const formData = new FormData();
    if (filename) {
      formData.append('file', file, filename);
    } else {
      formData.append('file', file);
    }

    // FIX LỖ HỔNG 7: Dùng in-memory token thay vì localStorage
    const token = getInMemoryToken();
    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  async downloadFile(id, filename) {
    // FIX LỖ HỔNG 7: Dùng in-memory token thay vì localStorage
    const token = getInMemoryToken();
    const response = await fetch(`${this.baseURL}/files/${id}/download`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    this.triggerDownload(blob, filename);
  }

  triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getFiles() {
    return this.request('/files', {
      method: 'GET',
    });
  }

  async deleteFile(id) {
    return this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyFileIntegrity(id) {
    return this.request(`/files/${id}/verify`, {
      method: 'POST',
    });
  }

  // ── File Versioning ──────────────────────────────────────────
  async getFileVersions(id) {
    return this.request(`/files/${id}/versions`, {
      method: 'GET',
    });
  }

  async restoreFileVersion(fileId, versionNumber) {
    return this.request(`/files/${fileId}/versions/${versionNumber}/restore`, {
      method: 'POST',
    });
  }

  async deleteFileVersion(fileId, versionNumber) {
    return this.request(`/files/${fileId}/versions/${versionNumber}`, {
      method: 'DELETE',
    });
  }

  // ── File Sharing ─────────────────────────────────────────────
  async shareFile(fileId, targetUserId, permission = 'view') {
    return this.request(`/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId, permission }),
    });
  }

  async getFileShares(fileId) {
    return this.request(`/files/${fileId}/shares`, {
      method: 'GET',
    });
  }

  async revokeFileShare(fileId, shareId) {
    return this.request(`/files/${fileId}/shares/${shareId}`, {
      method: 'DELETE',
    });
  }



  async setTyping(conversationId, isTyping) {
    return this.request(`/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ isTyping }),
    });
  }

  async getTypingUsers(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/typing`, {
      method: 'GET',
    });
  }

  // Reactions
  async addReaction(messageId, emoji) {
    return this.request(`/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async getMessageReactions(messageId) {
    return this.request(`/chat/messages/${messageId}/reactions`, {
      method: 'GET',
    });
  }

  // Pinned messages
  async pinMessage(conversationId, messageId) {
    return this.request(`/chat/conversations/${conversationId}/pin`, {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    });
  }

  async unpinMessage(conversationId, messageId) {
    return this.request(`/chat/conversations/${conversationId}/pin/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getPinnedMessages(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/pinned`, {
      method: 'GET',
    });
  }

  // Search
  async searchMessages(conversationId, query) {
    return this.request(`/chat/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async getCallHistory() {
    return this.request('/chat/calls/history', {
      method: 'GET',
    });
  }

  // Shared content
  async getSharedMedia(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/media`, {
      method: 'GET',
    });
  }

  async getSharedFiles(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/files`, {
      method: 'GET',
    });
  }

  async getSharedLinks(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/links`, {
      method: 'GET',
    });
  }

  // Discover methods
  async discoverPublicGroups(search = '', category = '', page = 1, limit = 20) {
    const params = new URLSearchParams({ search, category, page, limit });
    return this.request(`/chat/discover/groups?${params}`, {
      method: 'GET',
    });
  }

  async discoverSuggestedUsers(limit = 10) {
    return this.request(`/chat/discover/users?limit=${limit}`, {
      method: 'GET',
    });
  }

  async joinPublicGroup(conversationId) {
    return this.request(`/chat/groups/${conversationId}/join`, {
      method: 'POST',
    });
  }

  // Group Management
  async getConversationInfo(conversationId) {
    return this.request(`/chat/conversations/${conversationId}/info`, {
      method: 'GET',
    });
  }

  async renameGroup(conversationId, name) {
    return this.request(`/chat/conversations/${conversationId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async removeMemberFromGroup(conversationId, memberId) {
    return this.request(`/chat/conversations/${conversationId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async promoteToAdmin(conversationId, memberId) {
    return this.request(`/chat/conversations/${conversationId}/members/${memberId}/promote`, {
      method: 'POST',
    });
  }

  async demoteToMember(conversationId, memberId) {
    return this.request(`/chat/conversations/${conversationId}/members/${memberId}/demote`, {
      method: 'POST',
    });
  }

  // --- Team Collaboration: Projects ---
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async getProjectTasks(projectId) {
    return this.request(`/projects/${projectId}/tasks`);
  }

  async createTask(projectId, taskData) {
    return this.request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getMyTasks() {
    return this.request('/projects/tasks/my', {
      method: 'GET',
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/projects/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/projects/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Team Management
  async getTeams() {
    return this.request('/teams');
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async getTeamMembers(teamId) {
    return this.request(`/teams/${teamId}/members`);
  }

  async getTeamStats(teamId) {
    return this.request(`/teams/${teamId}/stats`);
  }

  async addTeamMember(teamId, userId, role = 'member') {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async removeTeamMember(teamId, userId) {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async deleteTeam(teamId) {
    return this.request(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  }
}

const api = new ApiClient();
export default api;
