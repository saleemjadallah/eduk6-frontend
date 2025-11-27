/**
 * Consent API Service
 * Handles parental consent verification API calls
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const consentAPI = {
  /**
   * Get current consent status
   * @returns {Promise<Object>} Response with consent status details
   */
  getConsentStatus: async () => {
    return makeRequest('/auth/consent/status', {
      method: 'GET',
    });
  },

  /**
   * Initiate credit card consent verification
   * @returns {Promise<Object>} Response with Stripe client secret
   */
  initiateCreditCardConsent: async () => {
    return makeRequest('/auth/consent/initiate-cc', {
      method: 'POST',
    });
  },

  /**
   * Verify consent with credit card payment
   * @param {Object} data - Verification data
   * @param {string} data.paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Response with verification status
   */
  verifyCreditCard: async ({ paymentIntentId }) => {
    return makeRequest('/auth/consent/verify-cc', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  },

  /**
   * Get KBQ (Knowledge-Based Questions) for verification
   * Returns isSetup=true if user needs to set up questions first
   * @returns {Promise<Object>} Response with questions array and isSetup flag
   */
  getKBQQuestions: async () => {
    return makeRequest('/auth/consent/kbq/questions', {
      method: 'GET',
    });
  },

  /**
   * Setup KBQ answers (first-time only)
   * @param {Object} data - KBQ setup data
   * @param {Array} data.answers - Array of answer objects
   * @returns {Promise<Object>} Response with setup and verification status
   */
  setupKBQ: async ({ answers }) => {
    return makeRequest('/auth/consent/kbq/setup', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  /**
   * Submit KBQ answers for verification (existing questions)
   * @param {Object} data - KBQ submission data
   * @param {Array} data.answers - Array of answer objects
   * @returns {Promise<Object>} Response with verification status
   */
  verifyKBQ: async ({ answers }) => {
    return makeRequest('/auth/consent/kbq/verify', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

export default consentAPI;
