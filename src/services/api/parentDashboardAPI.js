/**
 * Parent Dashboard API Service
 * Handles fetching parent dashboard data and child activity
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

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
