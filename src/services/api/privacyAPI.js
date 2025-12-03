/**
 * Privacy API Service
 * Handles privacy settings, consent, and data management
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const privacyAPI = {
  /**
   * Get privacy settings and consent status
   * @returns {Promise<Object>} Privacy data
   */
  getPrivacySettings: async () => {
    return makeRequest('/parent/privacy', { method: 'GET' });
  },

  /**
   * Update privacy preferences
   * @param {Object} preferences - Privacy preferences
   * @param {Object} [preferences.dataCollection] - Data collection settings
   * @param {Object} [preferences.dataSharing] - Data sharing settings
   * @returns {Promise<Object>} Updated preferences
   */
  updatePreferences: async (preferences) => {
    return makeRequest('/parent/privacy', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  /**
   * Request data export
   * @returns {Promise<Object>} Export data or confirmation
   */
  exportData: async () => {
    return makeRequest('/parent/privacy/export-data', {
      method: 'POST',
    });
  },

  /**
   * Get consent history
   * @returns {Promise<Object>} Consent history
   */
  getConsentHistory: async () => {
    return makeRequest('/parent/privacy/consent-history', { method: 'GET' });
  },

  /**
   * Delete account (redirects to auth endpoint)
   * @returns {Promise<Object>} Result
   */
  deleteAccount: async () => {
    return makeRequest('/auth/delete-account', {
      method: 'DELETE',
    });
  },
};

export default privacyAPI;
