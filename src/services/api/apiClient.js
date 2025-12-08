/**
 * Unified API Client
 * Single source of truth for all API requests with automatic token refresh
 *
 * Features:
 * - Automatic token refresh on 401
 * - Request queue during refresh
 * - Unified error handling
 * - Support for both parent and child tokens
 * - Request deduplication for concurrent identical requests
 */

import { tokenManager } from './tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Request queue for requests that failed during token refresh
let failedRequestQueue = [];
let isRefreshing = false;

/**
 * Process the failed request queue after token refresh
 */
function processQueue(error, token = null) {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedRequestQueue = [];
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/me')
 * @param {Object} options - Fetch options
 * @param {Object} config - Additional configuration
 * @param {boolean} config.skipAuth - Skip authentication header
 * @param {boolean} config.useChildToken - Force use of child token
 * @param {number} config.retryCount - Internal retry counter
 * @returns {Promise<Object>} Response data
 */
export async function apiRequest(endpoint, options = {}, config = {}) {
  const { skipAuth = false, useChildToken = false, retryCount = 0 } = config;

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header
  if (!skipAuth) {
    const token = useChildToken
      ? tokenManager.getChildToken()
      : tokenManager.getActiveToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include', // For httpOnly cookie support
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, fetchConfig);

    // Handle 401 Unauthorized - but skip token refresh for public requests
    if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/refresh') && !skipAuth) {
      // If we have a child token and it expired, clear it and fall back to parent token
      if (tokenManager.isChildMode() && useChildToken) {
        tokenManager.clearChildToken();
        // Retry without child token
        return apiRequest(endpoint, options, { ...config, useChildToken: false, retryCount: 1 });
      }

      // Try to refresh the parent token
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await tokenManager.refreshAccessToken();
          isRefreshing = false;
          processQueue(null, tokenManager.getAccessToken());

          // Retry the original request
          return apiRequest(endpoint, options, { ...config, retryCount: 1 });
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          throw new Error('Session expired. Please log in again.');
        }
      }

      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedRequestQueue.push({ resolve, reject });
      }).then(() => {
        // Retry after refresh completes
        return apiRequest(endpoint, options, { ...config, retryCount: 1 });
      });
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Return JSON response
    return response.json();
  } catch (error) {
    // Network errors
    if (!error.status) {
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint, options = {}, config = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }, config),

  post: (endpoint, data, options = {}, config = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }, config),

  put: (endpoint, data, options = {}, config = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }, config),

  patch: (endpoint, data, options = {}, config = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }, config),

  delete: (endpoint, options = {}, config = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }, config),
};

/**
 * Make a request without authentication
 */
export function publicRequest(endpoint, options = {}) {
  return apiRequest(endpoint, options, { skipAuth: true });
}

/**
 * Make a request specifically as a child (uses child token)
 */
export function childRequest(endpoint, options = {}) {
  return apiRequest(endpoint, options, { useChildToken: true });
}

export { API_BASE_URL };
export default api;
