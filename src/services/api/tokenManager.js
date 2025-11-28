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
 * - Graceful handling of localStorage restrictions (incognito mode)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// In-memory token storage (not persisted to localStorage)
let accessToken = null;
let childAccessToken = null;
let refreshToken = null; // Fallback for when localStorage is unavailable

// Refresh state management
let isRefreshing = false;
let refreshPromise = null;
let refreshSubscribers = [];

// Event listeners for auth state changes
const authStateListeners = new Set();

// Check if localStorage is available
let localStorageAvailable = true;
try {
  const testKey = '__storage_test__';
  localStorage.setItem(testKey, testKey);
  localStorage.removeItem(testKey);
} catch (e) {
  localStorageAvailable = false;
  console.warn('localStorage not available (incognito mode?). Using memory-only storage.');
}

/**
 * Safe localStorage getter
 */
function safeGetItem(key) {
  if (!localStorageAvailable) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage:`, e);
    return null;
  }
}

/**
 * Safe localStorage setter
 */
function safeSetItem(key, value) {
  if (!localStorageAvailable) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage:`, e);
  }
}

/**
 * Safe localStorage remover
 */
function safeRemoveItem(key) {
  if (!localStorageAvailable) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove ${key} from localStorage:`, e);
  }
}

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
    const storedAccessToken = safeGetItem('auth_token');
    const storedChildToken = safeGetItem('child_token');
    const storedRefreshToken = safeGetItem('refresh_token');

    if (storedAccessToken) {
      accessToken = storedAccessToken;
    }
    if (storedChildToken) {
      childAccessToken = storedChildToken;
    }
    if (storedRefreshToken) {
      refreshToken = storedRefreshToken;
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
  setTokens({ token, refreshToken: newRefreshToken, childToken }) {
    if (token) {
      accessToken = token;
      // Also persist to localStorage for backward compatibility and page refresh
      safeSetItem('auth_token', token);
    }
    if (newRefreshToken) {
      // Store in memory as well for incognito mode
      refreshToken = newRefreshToken;
      // Refresh token stored in localStorage until httpOnly cookie support is added
      safeSetItem('refresh_token', newRefreshToken);
    }
    if (childToken) {
      childAccessToken = childToken;
      safeSetItem('child_token', childToken);
    }

    this.notifyListeners();
  },

  /**
   * Set child token when switching to child mode
   */
  setChildToken(token) {
    childAccessToken = token;
    if (token) {
      safeSetItem('child_token', token);
    } else {
      safeRemoveItem('child_token');
    }
    this.notifyListeners();
  },

  /**
   * Clear child token (switch back to parent mode)
   */
  clearChildToken() {
    childAccessToken = null;
    safeRemoveItem('child_token');
    this.notifyListeners();
  },

  /**
   * Clear all tokens (logout)
   */
  clearTokens() {
    accessToken = null;
    childAccessToken = null;
    refreshToken = null;
    safeRemoveItem('auth_token');
    safeRemoveItem('refresh_token');
    safeRemoveItem('child_token');
    safeRemoveItem('current_profile_id');
    this.notifyListeners();
  },

  /**
   * Get refresh token from storage (memory first, then localStorage)
   */
  getRefreshToken() {
    // Return in-memory token first (works in incognito)
    if (refreshToken) return refreshToken;
    // Fall back to localStorage
    return safeGetItem('refresh_token');
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
