/**
 * Teacher API Service
 * Handles teacher-specific API calls
 * Uses unified API client with separate teacher token management
 */

import { tokenManager as parentTokenManager } from './tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Teacher-specific token storage (separate from parent/child tokens)
let teacherAccessToken = null;
let teacherRefreshToken = null;

// Check if localStorage is available
let localStorageAvailable = true;
try {
  const testKey = '__storage_test__';
  localStorage.setItem(testKey, testKey);
  localStorage.removeItem(testKey);
} catch (e) {
  localStorageAvailable = false;
}

function safeGetItem(key) {
  if (!localStorageAvailable) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetItem(key, value) {
  if (!localStorageAvailable) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage`);
  }
}

function safeRemoveItem(key) {
  if (!localStorageAvailable) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove ${key} from localStorage`);
  }
}

/**
 * Teacher Token Manager
 */
export const teacherTokenManager = {
  initialize() {
    const storedAccessToken = safeGetItem('teacher_auth_token');
    const storedRefreshToken = safeGetItem('teacher_refresh_token');

    if (storedAccessToken) {
      teacherAccessToken = storedAccessToken;
    }
    if (storedRefreshToken) {
      teacherRefreshToken = storedRefreshToken;
    }

    return {
      hasAccessToken: !!teacherAccessToken,
    };
  },

  getAccessToken() {
    return teacherAccessToken;
  },

  getRefreshToken() {
    if (teacherRefreshToken) return teacherRefreshToken;
    return safeGetItem('teacher_refresh_token');
  },

  setTokens({ token, refreshToken }) {
    if (token) {
      teacherAccessToken = token;
      safeSetItem('teacher_auth_token', token);
    }
    if (refreshToken) {
      teacherRefreshToken = refreshToken;
      safeSetItem('teacher_refresh_token', refreshToken);
    }
  },

  clearTokens() {
    teacherAccessToken = null;
    teacherRefreshToken = null;
    safeRemoveItem('teacher_auth_token');
    safeRemoveItem('teacher_refresh_token');
  },

  isAuthenticated() {
    return !!teacherAccessToken;
  },

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/teacher/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;

    this.setTokens({
      token: data.token,
      refreshToken: data.refreshToken,
    });

    return data;
  },
};

/**
 * Make a teacher-authenticated API request
 */
async function teacherRequest(endpoint, options = {}, retryCount = 0) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = teacherTokenManager.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher${endpoint}`, fetchConfig);

    // Handle 401 Unauthorized
    if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/refresh')) {
      try {
        await teacherTokenManager.refreshAccessToken();
        return teacherRequest(endpoint, options, 1);
      } catch (refreshError) {
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

/**
 * Make a public teacher API request (no auth)
 */
async function teacherPublicRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher${endpoint}`, fetchConfig);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

export const teacherAPI = {
  /**
   * Sign up a new teacher account
   */
  signUp: async ({ email, password, firstName, lastName }) => {
    return teacherPublicRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  /**
   * Sign in an existing teacher account
   */
  signIn: async ({ email, password }) => {
    const response = await teacherPublicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      const data = response.data || response;
      if (data.token) {
        teacherTokenManager.setTokens({
          token: data.token,
          refreshToken: data.refreshToken,
        });
      }
    }

    return response;
  },

  /**
   * Sign out the current teacher
   */
  logout: async () => {
    const refreshToken = teacherTokenManager.getRefreshToken();
    try {
      await teacherRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      teacherTokenManager.clearTokens();
    }
  },

  /**
   * Verify email with OTP code
   */
  verifyEmail: async (email, code) => {
    const response = await teacherPublicRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.success && response.data?.token) {
      teacherTokenManager.setTokens({
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      });
    }

    return response;
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email) => {
    return teacherPublicRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    return teacherPublicRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify password reset code
   */
  verifyResetCode: async (email, code) => {
    return teacherPublicRequest('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /**
   * Reset password after OTP verification
   */
  resetPassword: async (email, newPassword) => {
    return teacherPublicRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  /**
   * Get current teacher data
   */
  getCurrentTeacher: async () => {
    return teacherRequest('/auth/me', { method: 'GET' });
  },

  /**
   * Update teacher profile
   */
  updateProfile: async (data) => {
    return teacherRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return teacherRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Delete account
   */
  deleteAccount: async () => {
    return teacherRequest('/auth/delete-account', { method: 'DELETE' });
  },

  /**
   * Get quota information
   */
  getQuota: async () => {
    return teacherRequest('/quota', { method: 'GET' });
  },

  /**
   * Get usage statistics
   */
  getUsageStats: async (period = 'month') => {
    return teacherRequest(`/quota/usage?period=${period}`, { method: 'GET' });
  },

  /**
   * Check quota for a specific operation
   */
  checkQuota: async (operation, tokens) => {
    const params = new URLSearchParams({ operation });
    if (tokens) params.append('tokens', tokens);
    return teacherRequest(`/quota/check?${params}`, { method: 'GET' });
  },

  // ============================================
  // CONTENT MANAGEMENT
  // ============================================

  /**
   * List all content with optional filters
   */
  listContent: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return teacherRequest(`/content?${queryParams}`, { method: 'GET' });
  },

  /**
   * Get content statistics
   */
  getContentStats: async () => {
    return teacherRequest('/content/stats', { method: 'GET' });
  },

  /**
   * Get recent content
   */
  getRecentContent: async (limit = 5) => {
    return teacherRequest(`/content/recent?limit=${limit}`, { method: 'GET' });
  },

  /**
   * Create new content
   */
  createContent: async (data) => {
    return teacherRequest('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get content by ID
   */
  getContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}`, { method: 'GET' });
  },

  /**
   * Update content
   */
  updateContent: async (contentId, data) => {
    return teacherRequest(`/content/${contentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete content
   */
  deleteContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}`, { method: 'DELETE' });
  },

  /**
   * Duplicate content
   */
  duplicateContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}/duplicate`, { method: 'POST' });
  },

  /**
   * Update content status
   */
  updateContentStatus: async (contentId, status) => {
    return teacherRequest(`/content/${contentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // ============================================
  // AI GENERATION
  // ============================================

  /**
   * Generate a lesson from a topic
   */
  generateLesson: async (data) => {
    return teacherRequest('/content/generate/lesson', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate a quiz from content
   */
  generateQuiz: async (contentId, data, save = false) => {
    return teacherRequest(`/content/${contentId}/generate/quiz?save=${save}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate flashcards from content
   */
  generateFlashcards: async (contentId, data, save = false) => {
    return teacherRequest(`/content/${contentId}/generate/flashcards?save=${save}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate study guide from content
   */
  generateStudyGuide: async (contentId, data) => {
    return teacherRequest(`/content/${contentId}/generate/study-guide`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Analyze content
   */
  analyzeContent: async (content, options = {}) => {
    return teacherRequest('/content/analyze', {
      method: 'POST',
      body: JSON.stringify({ content, ...options }),
    });
  },
};

export default teacherAPI;
