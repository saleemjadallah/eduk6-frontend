/**
 * Admin API Service
 * Handles admin dashboard API calls for VC Analytics
 * Uses separate admin token management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Admin-specific token storage (separate from parent/child/teacher tokens)
let adminAccessToken = null;
let adminRefreshToken = null;

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
 * Admin Token Manager
 */
export const adminTokenManager = {
  initialize() {
    const storedAccessToken = safeGetItem('admin_auth_token');
    const storedRefreshToken = safeGetItem('admin_refresh_token');

    if (storedAccessToken) {
      adminAccessToken = storedAccessToken;
    }
    if (storedRefreshToken) {
      adminRefreshToken = storedRefreshToken;
    }

    return {
      hasAccessToken: !!adminAccessToken,
    };
  },

  getAccessToken() {
    return adminAccessToken;
  },

  getRefreshToken() {
    if (adminRefreshToken) return adminRefreshToken;
    return safeGetItem('admin_refresh_token');
  },

  setTokens({ token, refreshToken }) {
    if (token) {
      adminAccessToken = token;
      safeSetItem('admin_auth_token', token);
    }
    if (refreshToken) {
      adminRefreshToken = refreshToken;
      safeSetItem('admin_refresh_token', refreshToken);
    }
  },

  clearTokens() {
    adminAccessToken = null;
    adminRefreshToken = null;
    safeRemoveItem('admin_auth_token');
    safeRemoveItem('admin_refresh_token');
  },

  isAuthenticated() {
    return !!adminAccessToken;
  },

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
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
 * Make an admin-authenticated API request
 */
async function adminRequest(endpoint, options = {}, retryCount = 0) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = adminTokenManager.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchConfig);

    // Handle 401 - try to refresh token
    if (response.status === 401 && retryCount < 1) {
      try {
        await adminTokenManager.refreshAccessToken();
        return adminRequest(endpoint, options, retryCount + 1);
      } catch (refreshError) {
        adminTokenManager.clearTokens();
        throw new Error('Session expired. Please log in again.');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.message === 'Session expired. Please log in again.') {
      throw error;
    }
    throw new Error(error.message || 'Network error');
  }
}

/**
 * Admin API methods
 */
export const adminAPI = {
  // ============================================
  // AUTHENTICATION
  // ============================================

  async signIn({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store tokens
    if (data.data) {
      adminTokenManager.setTokens({
        token: data.data.token,
        refreshToken: data.data.refreshToken,
      });
    }

    return data;
  },

  async logout() {
    const refreshToken = adminTokenManager.getRefreshToken();

    try {
      await adminRequest('/api/admin/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.warn('Logout API call failed:', err);
    }

    adminTokenManager.clearTokens();
  },

  async getCurrentAdmin() {
    return adminRequest('/api/admin/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return adminRequest('/api/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // ============================================
  // ADMIN MANAGEMENT (SUPER_ADMIN only)
  // ============================================

  async listAdmins() {
    return adminRequest('/api/admin/auth/admins');
  },

  async createAdmin({ email, password, name, role }) {
    return adminRequest('/api/admin/auth/admins', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  async updateAdminRole(adminId, role) {
    return adminRequest(`/api/admin/auth/admins/${adminId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async deleteAdmin(adminId) {
    return adminRequest(`/api/admin/auth/admins/${adminId}`, {
      method: 'DELETE',
    });
  },

  // ============================================
  // ANALYTICS - OVERVIEW
  // ============================================

  async getOverview() {
    return adminRequest('/api/admin/analytics/overview');
  },

  // ============================================
  // ANALYTICS - ACTIVE USERS
  // ============================================

  async getActiveUsers(days = 30) {
    return adminRequest(`/api/admin/analytics/active-users?days=${days}`);
  },

  async getUserGrowth(days = 30) {
    return adminRequest(`/api/admin/analytics/user-growth?days=${days}`);
  },

  // ============================================
  // ANALYTICS - COHORTS
  // ============================================

  async getCohortRetention(months = 12) {
    return adminRequest(`/api/admin/analytics/cohorts?months=${months}`);
  },

  async getAverageRetention(months = 6) {
    return adminRequest(`/api/admin/analytics/retention-average?months=${months}`);
  },

  // ============================================
  // ANALYTICS - FUNNEL
  // ============================================

  async getConversionFunnel() {
    return adminRequest('/api/admin/analytics/funnel');
  },

  async getChurnRate(months = 1) {
    return adminRequest(`/api/admin/analytics/churn?months=${months}`);
  },

  // ============================================
  // ANALYTICS - REVENUE
  // ============================================

  async getRevenue() {
    return adminRequest('/api/admin/analytics/revenue');
  },

  async getMRRSeries(months = 12) {
    return adminRequest(`/api/admin/analytics/revenue/mrr-series?months=${months}`);
  },

  async getDailyMRR(days = 30) {
    return adminRequest(`/api/admin/analytics/revenue/daily?days=${days}`);
  },

  async getTeacherRevenue() {
    return adminRequest('/api/admin/analytics/revenue/teacher');
  },

  // ============================================
  // ANALYTICS - SEGMENTS
  // ============================================

  async getSegments() {
    return adminRequest('/api/admin/analytics/segments');
  },

  // ============================================
  // ANALYTICS - TEACHERS
  // ============================================

  async getTeacherMetrics() {
    return adminRequest('/api/admin/analytics/teachers');
  },

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  async invalidateCache() {
    return adminRequest('/api/admin/analytics/cache/invalidate', {
      method: 'POST',
    });
  },
};

export default adminAPI;
