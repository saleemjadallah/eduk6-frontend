/**
 * Safety API Service
 * Handles safety logs and incident management for parent dashboard
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const safetyAPI = {
  /**
   * Get paginated list of safety incidents
   * @param {Object} filters - Filter and pagination options
   * @param {string} [filters.childId] - Filter by specific child
   * @param {string} [filters.severity] - Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
   * @param {string} [filters.incidentType] - Filter by incident type
   * @param {string} [filters.startDate] - Filter by start date (ISO string)
   * @param {string} [filters.endDate] - Filter by end date (ISO string)
   * @param {string} [filters.reviewed] - Filter by reviewed status ('true' or 'false')
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.limit=20] - Items per page
   * @param {string} [filters.sortBy='createdAt'] - Sort field
   * @param {string} [filters.sortOrder='desc'] - Sort direction
   * @returns {Promise<Object>} Incidents list with pagination
   */
  getIncidents: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.childId) params.append('childId', filters.childId);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.incidentType) params.append('incidentType', filters.incidentType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.reviewed !== undefined) params.append('reviewed', filters.reviewed);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `/parent/safety/incidents${queryString ? `?${queryString}` : ''}`;

    return makeRequest(url, { method: 'GET' });
  },

  /**
   * Get summary statistics for safety incidents
   * @returns {Promise<Object>} Summary data including counts by severity, trend, etc.
   */
  getSummary: async () => {
    return makeRequest('/parent/safety/summary', { method: 'GET' });
  },

  /**
   * Get full details of a specific incident
   * @param {string} incidentId - Incident ID
   * @returns {Promise<Object>} Full incident details
   */
  getIncidentDetail: async (incidentId) => {
    return makeRequest(`/parent/safety/incidents/${incidentId}`, { method: 'GET' });
  },

  /**
   * Mark incident as reviewed with optional action
   * @param {string} incidentId - Incident ID
   * @param {string} [action='acknowledged'] - Action taken (acknowledged, restricted, discussed_with_child, dismissed)
   * @returns {Promise<Object>} Updated incident
   */
  markAsReviewed: async (incidentId, action = 'acknowledged') => {
    return makeRequest(`/parent/safety/incidents/${incidentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  },
};

export default safetyAPI;
