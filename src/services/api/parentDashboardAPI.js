/**
 * Parent Dashboard API Service
 * Handles fetching parent dashboard data and child activity
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const parentDashboardAPI = {
  /**
   * Get aggregated dashboard data for parent (across all children)
   * Requires parent authentication
   * @returns {Promise<Object>} Dashboard data including stats, children, and recent activity
   */
  getDashboard: async () => {
    return makeRequest('/parent/dashboard', {
      method: 'GET',
    });
  },

  /**
   * Get detailed activity for a specific child
   * @param {string} childId - Child ID to fetch activity for
   * @param {number} [limit=20] - Maximum number of activities to return
   * @returns {Promise<Object>} Child activity data
   */
  getChildActivity: async (childId, limit = 20) => {
    return makeRequest(`/parent/children/${childId}/activity?limit=${limit}`, {
      method: 'GET',
    });
  },
};

export default parentDashboardAPI;
