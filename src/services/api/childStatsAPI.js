/**
 * Child Stats API Service
 * Handles fetching child dashboard stats and gamification data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  // Try child token first (for child sessions), then parent token
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const childStatsAPI = {
  /**
   * Get current child's stats (for child dashboard)
   * Requires child authentication
   * @returns {Promise<Object>} Child stats including XP, streak, badges, lessons
   */
  getMyStats: async () => {
    return makeRequest('/children/me/stats', {
      method: 'GET',
    });
  },

  /**
   * Get a specific child's stats (for parent to view)
   * Requires parent authentication
   * @param {string} childId - Child ID to fetch stats for
   * @returns {Promise<Object>} Child stats with additional XP history
   */
  getChildStats: async (childId) => {
    return makeRequest(`/children/${childId}/stats`, {
      method: 'GET',
    });
  },

  /**
   * Get all badges for current child
   * @returns {Promise<Object>} Earned and available badges
   */
  getMyBadges: async () => {
    return makeRequest('/children/me/badges', {
      method: 'GET',
    });
  },

  /**
   * Get XP history for current child
   * @param {number} [days=7] - Number of days of history to fetch
   * @returns {Promise<Object>} XP transactions and daily totals
   */
  getMyXPHistory: async (days = 7) => {
    return makeRequest(`/children/me/xp-history?days=${days}`, {
      method: 'GET',
    });
  },
};

export default childStatsAPI;
