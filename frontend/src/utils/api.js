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
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
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
  async getUsers() {
    return this.request('/users', {
      method: 'GET',
    });
  }

  // Teams endpoints
  async getTeams() {
    return this.request('/teams', {
      method: 'GET',
    });
  }
}

export default new ApiClient();
