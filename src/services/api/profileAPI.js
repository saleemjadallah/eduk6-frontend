/**
 * Profile API Service
 * Handles child profile management API calls
 */

import { makeAuthenticatedRequest as makeRequest, API_BASE_URL } from './apiUtils.js';
import { tokenManager } from './tokenManager.js';

export const profileAPI = {
  /**
   * Create a new child profile
   * @param {Object} data - Child profile data
   * @returns {Promise<Object>} Created child profile
   */
  createProfile: async (data) => {
    return makeRequest('/profiles/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all child profiles for the current parent
   * @returns {Promise<Object>} Array of child profiles
   */
  getProfiles: async () => {
    return makeRequest('/profiles/children', {
      method: 'GET',
    });
  },

  /**
   * Get a specific child profile
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child profile data
   */
  getProfile: async (childId) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'GET',
    });
  },

  /**
   * Update a child profile
   * @param {string} childId - Child ID
   * @param {Object} data - Updated profile data
   * @returns {Promise<Object>} Updated child profile
   */
  updateProfile: async (childId, data) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a child profile (soft delete)
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Success status
   */
  deleteProfile: async (childId) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update privacy settings for a child
   * @param {string} childId - Child ID
   * @param {Object} settings - Privacy settings
   * @returns {Promise<Object>} Updated settings
   */
  updatePrivacySettings: async (childId, settings) => {
    return makeRequest(`/profiles/children/${childId}/privacy`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Get privacy settings for a child
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Privacy settings
   */
  getPrivacySettings: async (childId) => {
    return makeRequest(`/profiles/children/${childId}/privacy`, {
      method: 'GET',
    });
  },

  /**
   * Get child activity stats
   * @param {string} childId - Child ID
   * @param {string} [period] - Time period ('day', 'week', 'month')
   * @returns {Promise<Object>} Activity stats
   */
  getActivityStats: async (childId, period = 'week') => {
    return makeRequest(`/profiles/children/${childId}/stats?period=${period}`, {
      method: 'GET',
    });
  },

  /**
   * Upload avatar for a child
   * @param {string} childId - Child ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Updated profile with new avatar URL
   */
  uploadAvatar: async (childId, file) => {
    const token = tokenManager.getActiveToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/api/profiles/children/${childId}/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get available avatars
   * @returns {Promise<Object>} Array of available avatar options
   */
  getAvatarOptions: async () => {
    return makeRequest('/profiles/avatars', {
      method: 'GET',
    });
  },
};

export default profileAPI;
