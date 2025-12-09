/**
 * Auth API Service
 * Handles authentication-related API calls
 * Uses unified API client with token manager
 */

import { api, publicRequest } from './apiClient.js';
import { tokenManager } from './tokenManager.js';

export const authAPI = {
  /**
   * Sign up a new parent account
   * @param {Object} data - Sign up data
   * @param {string} data.email - Parent email
   * @param {string} data.password - Parent password
   * @param {string} [data.firstName] - Parent first name
   * @param {string} [data.lastName] - Parent last name
   * @param {string} [data.country] - Country code (default: 'US')
   * @returns {Promise<Object>} Response with success status
   */
  signUp: async ({ email, password, firstName, lastName, country }) => {
    return publicRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        country: country || 'US',
      }),
    });
  },

  /**
   * Sign in an existing parent account
   * @param {Object} data - Sign in data
   * @param {string} data.email - Parent email
   * @param {string} data.password - Parent password
   * @returns {Promise<Object>} Response with token and user data
   */
  signIn: async ({ email, password }) => {
    const response = await publicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens via token manager
    // Handle both response.data.token and response.token formats
    if (response.success) {
      const data = response.data || response;
      if (data.token) {
        tokenManager.setTokens({
          token: data.token,
          refreshToken: data.refreshToken,
        });
      }
    }

    return response;
  },

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Response with success status
   */
  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    try {
      const response = await api.post('/auth/logout', { refreshToken });
      return response;
    } finally {
      // Always clear tokens, even if API call fails
      tokenManager.clearTokens();
    }
  },

  /**
   * Verify email with OTP code
   * @param {string} email - User email
   * @param {string} code - OTP verification code
   * @returns {Promise<Object>} Response with success status and tokens
   */
  verifyEmail: async (email, code) => {
    const response = await publicRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    // Store tokens if verification successful
    if (response.success && response.token) {
      tokenManager.setTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    }

    return response;
  },

  /**
   * Resend verification email
   * @param {string} email - Email to resend verification to
   * @returns {Promise<Object>} Response with success status
   */
  resendVerificationEmail: async (email) => {
    return publicRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Request password reset
   * @param {string} email - Email to send reset link
   * @returns {Promise<Object>} Response with success status
   */
  requestPasswordReset: async (email) => {
    return publicRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify password reset code
   * @param {string} email - User email
   * @param {string} code - OTP code
   * @returns {Promise<Object>} Response with success status
   */
  verifyResetCode: async (email, code) => {
    return publicRequest('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /**
   * Reset password after OTP verification
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with success status
   */
  resetPassword: async (email, newPassword) => {
    return publicRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} Response with new access token
   */
  refreshToken: async () => {
    return tokenManager.refreshAccessToken();
  },

  /**
   * Get current user data
   * @returns {Promise<Object>} Current user data with children
   */
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  /**
   * Update parent profile
   * @param {Object} data - Profile update data
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (data) => {
    return api.patch('/auth/profile', data);
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with success status
   */
  changePassword: async (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Delete account (COPPA compliance - data deletion)
   * @returns {Promise<Object>} Response with success status
   */
  deleteAccount: async () => {
    return api.delete('/auth/delete-account');
  },

  /**
   * Switch to child session
   * @param {string} childId - Child ID to switch to
   * @param {string} pin - Parent PIN for verification
   * @returns {Promise<Object>} Response with child token
   */
  switchToChild: async (childId, pin) => {
    const response = await api.post(`/auth/children/${childId}/switch`, { pin });

    // Store child token if successful
    // Handle both response.data.childToken and response.childToken formats
    if (response.success) {
      const data = response.data || response;
      if (data.childToken) {
        tokenManager.setChildToken(data.childToken);
      }
    }

    return response;
  },

  /**
   * Switch back to parent mode
   * Clears child token
   */
  switchToParent: () => {
    tokenManager.clearChildToken();
  },

  /**
   * Logout from all devices
   * @returns {Promise<Object>} Response with sessions invalidated count
   */
  logoutAll: async () => {
    const response = await api.post('/auth/logout-all', {});
    tokenManager.clearTokens();
    return response;
  },

  // ============================================
  // PIN RECOVERY
  // ============================================

  /**
   * Get child PIN lockout status
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} PIN status (isLocked, attempts, remainingMinutes)
   */
  getChildPinStatus: async (childId) => {
    return api.get(`/auth/children/${childId}/pin-status`);
  },

  /**
   * Reset child PIN (requires parent password confirmation)
   * @param {string} childId - Child ID
   * @param {string} password - Parent password for verification
   * @param {string} newPin - New 4-digit PIN
   * @returns {Promise<Object>} Response with success status
   */
  resetChildPin: async (childId, password, newPin) => {
    return api.post(`/auth/children/${childId}/reset-pin`, { password, newPin });
  },

  /**
   * Unlock child PIN (clear lockout without changing PIN)
   * @param {string} childId - Child ID
   * @param {string} password - Parent password for verification
   * @returns {Promise<Object>} Response with success status
   */
  unlockChildPin: async (childId, password) => {
    return api.post(`/auth/children/${childId}/unlock-pin`, { password });
  },

  // ============================================
  // KBQ (SECURITY QUESTIONS) RECOVERY
  // ============================================

  /**
   * Check if parent has security questions set up
   * @returns {Promise<Object>} Response with hasKBQ boolean
   */
  getKBQStatus: async () => {
    return api.get('/auth/kbq/status');
  },

  /**
   * Get all available security questions (for reset flow)
   * @returns {Promise<Object>} Response with questions array
   */
  getAllKBQQuestions: async () => {
    return api.get('/auth/kbq/all-questions');
  },

  /**
   * Reset security questions (requires password verification)
   * @param {string} password - Parent password for verification
   * @param {Array} answers - Array of {questionId, answer} objects
   * @returns {Promise<Object>} Response with success status
   */
  resetKBQ: async (password, answers) => {
    return api.post('/auth/kbq/reset', { password, answers });
  },

  /**
   * Initiate KBQ reset via credit card (when password unknown)
   * @returns {Promise<Object>} Response with clientSecret and resetToken
   */
  initiateKBQResetViaCC: async () => {
    return api.post('/auth/kbq/reset/initiate-cc', {});
  },

  /**
   * Complete KBQ reset after credit card verification
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {Array} answers - Array of {questionId, answer} objects
   * @returns {Promise<Object>} Response with success status
   */
  completeKBQResetViaCC: async (paymentIntentId, answers) => {
    return api.post('/auth/kbq/reset/complete-cc', { paymentIntentId, answers });
  },
};

export default authAPI;
