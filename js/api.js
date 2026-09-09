// ==========================================================
// PeerSolve API Client Helper
// ==========================================================

const API_BASE = 'https://peersolve-backend.onrender.com/api';

export const api = {
  getToken() {
    return localStorage.getItem('peersolve_token');
  },

  getUser() {
    const userStr = localStorage.getItem('peersolve_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setAuth(token, user) {
    localStorage.setItem('peersolve_token', token);
    localStorage.setItem('peersolve_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('peersolve_token');
    localStorage.removeItem('peersolve_user');
    window.location.href = 'login.html';
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request Failed');
    }
    return data;
  },

  // Auth endpoints
  async register(formData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    this.setAuth(data.token, data.user);
    return data;
  },

  async login(identifier, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setAuth(data.token, data.user);
    return data;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Stats endpoint
  async getStats() {
    return this.request('/stats');
  },

  // Questions endpoints
  async getQuestions(filters = {}) {
    const query = new URLSearchParams();
    if (filters.subject && filters.subject !== 'all') query.set('subject', filters.subject);
    if (filters.status && filters.status !== 'all') query.set('status', filters.status);
    if (filters.search) query.set('search', filters.search);
    return this.request(`/questions?${query.toString()}`);
  },

  async getQuestion(id) {
    return this.request(`/questions/${id}`);
  },

  async createQuestion(questionData) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  async toggleMeToo(questionId) {
    return this.request(`/questions/${questionId}/me-too`, {
      method: 'POST',
    });
  },

  // Answers endpoints
  async createAnswer(questionId, content, codeSnippet) {
    return this.request(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ content, code_snippet: codeSnippet }),
    });
  },

  async acceptBestAnswer(answerId) {
    return this.request(`/answers/${answerId}/best`, {
      method: 'POST',
    });
  },

  async upvoteAnswer(answerId) {
    return this.request(`/answers/${answerId}/upvote`, {
      method: 'POST',
    });
  },

  // Leaderboard endpoint
  async getLeaderboard() {
    return this.request('/leaderboard');
  },

  // Notifications endpoint
  async getNotifications() {
    return this.request('/notifications');
  }
};
