const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

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
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
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

  async approveUser(id) {
    return this.updateUser(id, { isActive: true, isLocked: false });
  }

  async rejectUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async emergencyLock(id) {
    return this.updateUser(id, { isLocked: true, lockReason: 'EMERGENCY_LOCK' });
  }

  async addUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
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
}

const api = new ApiClient();
export default api;
