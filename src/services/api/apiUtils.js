/**
 * Shared API Utilities
 * Re-exports from unified API client for backward compatibility
 *
 * NOTE: This file is maintained for backward compatibility.
 * New code should import directly from apiClient.js
 */

import { apiRequest, API_BASE_URL } from './apiClient.js';

/**
 * Make an API request with automatic token refresh on 401
 * @param {string} endpoint - API endpoint (e.g., '/auth/me')
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Internal retry counter (unused, kept for compatibility)
 * @returns {Promise<Object>} Response data
 *
 * @deprecated Use apiClient.js directly instead
 */
export async function makeAuthenticatedRequest(endpoint, options = {}, retryCount = 0) {
  return apiRequest(endpoint, options, { retryCount });
}

export { API_BASE_URL };
export default makeAuthenticatedRequest;
