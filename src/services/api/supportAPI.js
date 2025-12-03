/**
 * Support API Service
 * Handles FAQ and contact form
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const supportAPI = {
  /**
   * Get FAQ content
   * @returns {Promise<Object>} FAQ data
   */
  getFAQ: async () => {
    // FAQ endpoint doesn't require auth
    const response = await fetch(`${API_URL}/support/faq`);
    if (!response.ok) {
      throw new Error('Failed to load FAQ');
    }
    return response.json();
  },

  /**
   * Submit contact form
   * @param {Object} data - Contact form data
   * @param {string} data.subject - Subject line
   * @param {string} data.category - Category (optional)
   * @param {string} data.message - Message body
   * @returns {Promise<Object>} Result with ticket ID
   */
  submitContact: async (data) => {
    return makeRequest('/support/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default supportAPI;
