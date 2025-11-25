/**
 * Auth API Service
 * Handles authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const authAPI = {
  /**
   * Sign up a new parent account
   * @param {Object} data - Sign up data
   * @param {string} data.email - Parent email
   * @param {string} data.password - Parent password
   * @param {string} [data.firstName] - Parent first name
   * @param {string} [data.lastName] - Parent last name
   * @param {string} [data.country] - Country code (default: 'AE')
   * @returns {Promise<Object>} Response with success status
   */
  signUp: async ({ email, password, firstName, lastName, country }) => {
    return makeRequest('/auth/signup', {
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
    return makeRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Response with success status
   */
  signOut: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    return makeRequest('/auth/signout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Response with success status
   */
  verifyEmail: async (token) => {
    return makeRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },

  /**
   * Resend verification email
   * @param {string} email - Email to resend verification to
   * @returns {Promise<Object>} Response with success status
   */
  resendVerificationEmail: async (email) => {
    return makeRequest('/auth/resend-verification', {
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
    return makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with success status
   */
  resetPassword: async (token, newPassword) => {
    return makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} Response with new access token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Get current user data
   * @returns {Promise<Object>} Current user data with children
   */
  getCurrentUser: async () => {
    return makeRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Update parent profile
   * @param {Object} data - Profile update data
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (data) => {
    return makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with success status
   */
  changePassword: async (currentPassword, newPassword) => {
    return makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Delete account (COPPA compliance - data deletion)
   * @returns {Promise<Object>} Response with success status
   */
  deleteAccount: async () => {
    return makeRequest('/auth/delete-account', {
      method: 'DELETE',
    });
  },
};

export default authAPI;
