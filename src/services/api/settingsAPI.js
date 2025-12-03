/**
 * Settings API Service
 * Handles parent settings, profile, and preferences
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const settingsAPI = {
  /**
   * Get all parent settings (profile + preferences)
   * @returns {Promise<Object>} Settings data
   */
  getSettings: async () => {
    return makeRequest('/parent/settings', { method: 'GET' });
  },

  /**
   * Update parent profile
   * @param {Object} profileData - Profile fields to update
   * @param {string} [profileData.firstName] - First name
   * @param {string} [profileData.lastName] - Last name
   * @param {string} [profileData.phone] - Phone number
   * @param {string} [profileData.country] - Country code
   * @param {string} [profileData.timezone] - Timezone
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    return makeRequest('/parent/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  changePassword: async (currentPassword, newPassword) => {
    return makeRequest('/parent/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Logout from all devices
   * @returns {Promise<Object>} Result
   */
  logoutAll: async () => {
    return makeRequest('/parent/settings/logout-all', {
      method: 'POST',
    });
  },

  /**
   * Get children with PINs (for PIN management)
   * @returns {Promise<Object>} Children list with PINs
   */
  getChildrenPins: async () => {
    return makeRequest('/parent/settings/children', { method: 'GET' });
  },

  /**
   * Reset a child's PIN
   * @param {string} childId - Child ID
   * @param {string} newPin - New 4-digit PIN
   * @returns {Promise<Object>} Result
   */
  resetChildPin: async (childId, newPin) => {
    return makeRequest(`/parent/settings/children/${childId}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ newPin }),
    });
  },
};

export default settingsAPI;
