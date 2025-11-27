/**
 * Shared API Utilities
 * Common request handling with automatic token refresh
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<Object>} New token data
 */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Refresh failed - clear tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_profile_id');
    throw new Error('Token refresh failed');
  }

  const responseData = await response.json();
  // Backend wraps response in { success, data }, unwrap it
  const data = responseData.data || responseData;

  // Store new tokens
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem('refresh_token', data.refreshToken);
  }

  return data;
}

/**
 * Make an API request with automatic token refresh on 401
 * @param {string} endpoint - API endpoint (e.g., '/auth/me')
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Internal retry counter
 * @returns {Promise<Object>} Response data
 */
export async function makeAuthenticatedRequest(endpoint, options = {}, retryCount = 0) {
  // Support both child token and parent auth token
  const token = localStorage.getItem('child_token') || localStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  // If unauthorized and we haven't retried yet, try to refresh the token
  if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/refresh')) {
    try {
      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      // Retry the original request with new token
      return makeAuthenticatedRequest(endpoint, options, retryCount + 1);
    } catch (refreshError) {
      isRefreshing = false;
      refreshPromise = null;
      console.error('Token refresh failed:', refreshError);
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL };
export default makeAuthenticatedRequest;
