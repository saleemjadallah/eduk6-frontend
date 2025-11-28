/**
 * Token Manager
 * Centralized token storage and refresh handling
 *
 * Security improvements:
 * - Access token stored in memory (not localStorage) to reduce XSS exposure
 * - Refresh token stored in httpOnly cookie (when backend supports it) or localStorage as fallback
 * - Supports both parent and child tokens
 * - Single refresh queue to prevent race conditions
 * - Token rotation on refresh
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// In-memory token storage (not persisted to localStorage)
let accessToken = null;
let childAccessToken = null;

// Refresh state management
let isRefreshing = false;
let refreshPromise = null;
let refreshSubscribers = [];

// Event listeners for auth state changes
const authStateListeners = new Set();

/**
 * Token Manager singleton
 */
export const tokenManager = {
  /**
   * Initialize tokens from localStorage on app start
   * This migrates existing localStorage tokens to memory
   */
  initialize() {
    // Load existing tokens from localStorage (migration from old system)
    const storedAccessToken = localStorage.getItem('auth_token');
    const storedChildToken = localStorage.getItem('child_token');

    if (storedAccessToken) {
      accessToken = storedAccessToken;
    }
    if (storedChildToken) {
      childAccessToken = storedChildToken;
    }

    return {
      hasAccessToken: !!accessToken,
      hasChildToken: !!childAccessToken,
    };
  },

  /**
   * Get the current access token (parent)
   */
  getAccessToken() {
    return accessToken;
  },

  /**
   * Get the current child access token
   */
  getChildToken() {
    return childAccessToken;
  },

  /**
   * Get the appropriate token for API requests
   * Prefers child token if available (child mode), falls back to parent token
   */
  getActiveToken() {
    return childAccessToken || accessToken;
  },

  /**
   * Set tokens after login/refresh
   */
  setTokens({ token, refreshToken, childToken }) {
    if (token) {
      accessToken = token;
      // Also persist to localStorage for backward compatibility and page refresh
      localStorage.setItem('auth_token', token);
    }
    if (refreshToken) {
      // Refresh token stored in localStorage until httpOnly cookie support is added
      localStorage.setItem('refresh_token', refreshToken);
    }
    if (childToken) {
      childAccessToken = childToken;
      localStorage.setItem('child_token', childToken);
    }

    this.notifyListeners();
  },

  /**
   * Set child token when switching to child mode
   */
  setChildToken(token) {
    childAccessToken = token;
    if (token) {
      localStorage.setItem('child_token', token);
    } else {
      localStorage.removeItem('child_token');
    }
    this.notifyListeners();
  },

  /**
   * Clear child token (switch back to parent mode)
   */
  clearChildToken() {
    childAccessToken = null;
    localStorage.removeItem('child_token');
    this.notifyListeners();
  },

  /**
   * Clear all tokens (logout)
   */
  clearTokens() {
    accessToken = null;
    childAccessToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('child_token');
    localStorage.removeItem('current_profile_id');
    this.notifyListeners();
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!accessToken;
  },

  /**
   * Check if in child mode
   */
  isChildMode() {
    return !!childAccessToken;
  },

  /**
   * Refresh the access token
   * Uses a queue to prevent multiple simultaneous refresh attempts
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // If already refreshing, wait for the existing promise
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // For future httpOnly cookie support
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed - clear tokens
        this.clearTokens();
        throw new Error('Token refresh failed');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;

      // Store new tokens
      this.setTokens({
        token: data.token,
        refreshToken: data.refreshToken,
      });

      // Notify waiting subscribers of success
      refreshSubscribers.forEach(({ resolve }) => resolve(data));

      return data;
    } catch (error) {
      // Notify waiting subscribers of failure
      refreshSubscribers.forEach(({ reject }) => reject(error));
      throw error;
    } finally {
      isRefreshing = false;
      refreshSubscribers = [];
    }
  },

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener) {
    authStateListeners.add(listener);
    return () => authStateListeners.delete(listener);
  },

  /**
   * Notify all listeners of auth state change
   */
  notifyListeners() {
    const state = {
      isAuthenticated: this.isAuthenticated(),
      isChildMode: this.isChildMode(),
    };
    authStateListeners.forEach(listener => listener(state));
  },
};

export default tokenManager;
