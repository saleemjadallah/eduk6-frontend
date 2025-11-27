/**
 * Child Stats API Service
 * Handles fetching child dashboard stats and gamification data
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

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
