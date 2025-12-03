/**
 * Reports API Service
 * Handles progress reports for parent dashboard
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const reportsAPI = {
  /**
   * Get list of children for selector
   * @returns {Promise<Object>} Children list
   */
  getChildren: async () => {
    return makeRequest('/parent/reports/children', { method: 'GET' });
  },

  /**
   * Get progress report for a specific child
   * @param {string} childId - Child ID
   * @param {string} [period='7d'] - Time period (7d, 30d, 90d, all)
   * @returns {Promise<Object>} Progress report data
   */
  getReport: async (childId, period = '7d') => {
    return makeRequest(`/parent/reports/${childId}?period=${period}`, { method: 'GET' });
  },

  /**
   * Export progress report for a child
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Export data
   */
  exportReport: async (childId) => {
    return makeRequest(`/parent/reports/${childId}/export`, { method: 'GET' });
  },
};

export default reportsAPI;
