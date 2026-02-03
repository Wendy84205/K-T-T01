const API_BASE_URL = '/api/v1'; // Use relative path with setupProxy
// const API_BASE_URL = 'https://importantly-people-citizen-interest.trycloudflare.com/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    const config = {
      ...options,
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
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // Optional: window.location.href = '/login'; 
        }

        const error = new Error(data.message || data.error || `HTTP ${response.status}`);
        error.data = data; // Attach full response data
        error.status = response.status;
        throw error;
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

  async sendMessage(conversationId, content, messageType = 'text', fileId = null, parentMessageId = null) {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, fileId, parentMessageId }),
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

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
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
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${this.baseURL}/files/${id}/download`, {
      method: 'GET',
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
}

const api = new ApiClient();
export default api;
