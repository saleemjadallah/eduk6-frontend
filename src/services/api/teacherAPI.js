/**
 * Teacher API Service
 * Handles teacher-specific API calls
 * Uses unified API client with separate teacher token management
 */

import { tokenManager as parentTokenManager } from './tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Teacher-specific token storage (separate from parent/child tokens)
let teacherAccessToken = null;
let teacherRefreshToken = null;

// Check if localStorage is available
let localStorageAvailable = true;
try {
  const testKey = '__storage_test__';
  localStorage.setItem(testKey, testKey);
  localStorage.removeItem(testKey);
} catch (e) {
  localStorageAvailable = false;
}

function safeGetItem(key) {
  if (!localStorageAvailable) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetItem(key, value) {
  if (!localStorageAvailable) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage`);
  }
}

function safeRemoveItem(key) {
  if (!localStorageAvailable) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove ${key} from localStorage`);
  }
}

// Session expired callback - set by TeacherAuthContext
let onSessionExpiredCallback = null;

/**
 * Set the callback to be called when session expires
 * This allows the auth context to handle session expiration globally
 */
export function setSessionExpiredCallback(callback) {
  onSessionExpiredCallback = callback;
}

/**
 * Teacher Token Manager
 */
export const teacherTokenManager = {
  initialize() {
    const storedAccessToken = safeGetItem('teacher_auth_token');
    const storedRefreshToken = safeGetItem('teacher_refresh_token');

    if (storedAccessToken) {
      teacherAccessToken = storedAccessToken;
    }
    if (storedRefreshToken) {
      teacherRefreshToken = storedRefreshToken;
    }

    return {
      hasAccessToken: !!teacherAccessToken,
    };
  },

  getAccessToken() {
    return teacherAccessToken;
  },

  getRefreshToken() {
    if (teacherRefreshToken) return teacherRefreshToken;
    return safeGetItem('teacher_refresh_token');
  },

  setTokens({ token, refreshToken }) {
    if (token) {
      teacherAccessToken = token;
      safeSetItem('teacher_auth_token', token);
    }
    if (refreshToken) {
      teacherRefreshToken = refreshToken;
      safeSetItem('teacher_refresh_token', refreshToken);
    }
  },

  clearTokens() {
    teacherAccessToken = null;
    teacherRefreshToken = null;
    safeRemoveItem('teacher_auth_token');
    safeRemoveItem('teacher_refresh_token');
  },

  isAuthenticated() {
    return !!teacherAccessToken;
  },

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/teacher/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;

    this.setTokens({
      token: data.token,
      refreshToken: data.refreshToken,
    });

    return data;
  },
};

/**
 * Make a teacher-authenticated API request
 */
async function teacherRequest(endpoint, options = {}, retryCount = 0) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = teacherTokenManager.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher${endpoint}`, fetchConfig);

    // Handle 401 Unauthorized
    if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/refresh')) {
      try {
        await teacherTokenManager.refreshAccessToken();
        return teacherRequest(endpoint, options, 1);
      } catch (refreshError) {
        teacherTokenManager.clearTokens();
        // Trigger global session expired handler for auto-redirect
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        const error = new Error('Your session has expired. Please sign in again to continue.');
        error.code = 'SESSION_EXPIRED';
        error.status = 401;
        throw error;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let userMessage = errorData.error || errorData.message || `Something went wrong. Please try again.`;

      // Map technical errors to user-friendly messages
      if (userMessage.toLowerCase().includes('invalid token') ||
          userMessage.toLowerCase().includes('unauthorized') ||
          userMessage.toLowerCase().includes('token expired')) {
        teacherTokenManager.clearTokens();
        // Trigger global session expired handler for auto-redirect
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        userMessage = 'Your session has expired. Please sign in again to continue.';
        const error = new Error(userMessage);
        error.code = 'SESSION_EXPIRED';
        error.status = 401;
        throw error;
      }

      const error = new Error(userMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

/**
 * Make a public teacher API request (no auth)
 */
async function teacherPublicRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchConfig = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher${endpoint}`, fetchConfig);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error. Please check your connection.';
    }
    throw error;
  }
}

export const teacherAPI = {
  /**
   * Sign up a new teacher account
   */
  signUp: async ({ email, password, firstName, lastName }) => {
    return teacherPublicRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  /**
   * Sign in an existing teacher account
   */
  signIn: async ({ email, password }) => {
    const response = await teacherPublicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      const data = response.data || response;
      if (data.token) {
        teacherTokenManager.setTokens({
          token: data.token,
          refreshToken: data.refreshToken,
        });
      }
    }

    return response;
  },

  /**
   * Google Sign-In / Sign-Up
   * - New users: Creates account with emailVerified=true, returns isNewUser=true
   * - Existing users: Logs them in, returns isNewUser=false
   * - Email-only users: Links Google account to existing account
   * @param {string} idToken - Google ID token from Google Sign-In
   * @returns {Promise<Object>} { success, data: { token, refreshToken, teacher, quota, isNewUser } }
   */
  googleSignIn: async (idToken) => {
    const response = await teacherPublicRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (response.success) {
      const data = response.data || response;
      if (data.token) {
        teacherTokenManager.setTokens({
          token: data.token,
          refreshToken: data.refreshToken,
        });
      }
    }

    return response;
  },

  /**
   * Sign out the current teacher
   */
  logout: async () => {
    const refreshToken = teacherTokenManager.getRefreshToken();
    try {
      await teacherRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      teacherTokenManager.clearTokens();
    }
  },

  /**
   * Verify email with OTP code
   */
  verifyEmail: async (email, code) => {
    const response = await teacherPublicRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    // Backend returns token directly on response, not under .data
    if (response.success && response.token) {
      teacherTokenManager.setTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    }

    return response;
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email) => {
    return teacherPublicRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    return teacherPublicRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify password reset code
   */
  verifyResetCode: async (email, code) => {
    return teacherPublicRequest('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /**
   * Reset password after OTP verification
   */
  resetPassword: async (email, newPassword) => {
    return teacherPublicRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  /**
   * Get current teacher data
   */
  getCurrentTeacher: async () => {
    return teacherRequest('/auth/me', { method: 'GET' });
  },

  /**
   * Update teacher profile
   */
  updateProfile: async (data) => {
    return teacherRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return teacherRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Delete account
   */
  deleteAccount: async () => {
    return teacherRequest('/auth/delete-account', { method: 'DELETE' });
  },

  /**
   * Get quota information
   */
  getQuota: async () => {
    return teacherRequest('/quota', { method: 'GET' });
  },

  /**
   * Get usage statistics
   */
  getUsageStats: async (period = 'month') => {
    return teacherRequest(`/quota/usage?period=${period}`, { method: 'GET' });
  },

  /**
   * Check quota for a specific operation
   */
  checkQuota: async (operation, tokens) => {
    const params = new URLSearchParams({ operation });
    if (tokens) params.append('tokens', tokens);
    return teacherRequest(`/quota/check?${params}`, { method: 'GET' });
  },

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Get available subscription plans (public)
   */
  getPlans: async () => {
    return teacherRequest('/subscription/plans', { method: 'GET' });
  },

  /**
   * Get available credit packs (public)
   */
  getCreditPacks: async () => {
    return teacherRequest('/subscription/credit-packs', { method: 'GET' });
  },

  /**
   * Get current subscription status
   */
  getSubscription: async () => {
    return teacherRequest('/subscription', { method: 'GET' });
  },

  /**
   * Create checkout session for subscription upgrade
   */
  createCheckoutSession: async (tier, isAnnual, successUrl, cancelUrl) => {
    return teacherRequest('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier, isAnnual, successUrl, cancelUrl }),
    });
  },

  /**
   * Create checkout session for credit pack purchase
   */
  createCreditPackCheckout: async (packId, successUrl, cancelUrl) => {
    return teacherRequest('/subscription/credit-pack/checkout', {
      method: 'POST',
      body: JSON.stringify({ packId, successUrl, cancelUrl }),
    });
  },

  /**
   * Create customer portal session for managing billing
   */
  createPortalSession: async (returnUrl) => {
    return teacherRequest('/subscription/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    });
  },

  /**
   * Cancel subscription at period end
   */
  cancelSubscription: async () => {
    return teacherRequest('/subscription/cancel', { method: 'POST' });
  },

  /**
   * Resume cancelled subscription
   */
  resumeSubscription: async () => {
    return teacherRequest('/subscription/resume', { method: 'POST' });
  },

  /**
   * Check Stripe configuration status
   */
  getConfigStatus: async () => {
    return teacherRequest('/subscription/config-status', { method: 'GET' });
  },

  // ============================================
  // CONTENT MANAGEMENT
  // ============================================

  /**
   * List all content with optional filters
   */
  listContent: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return teacherRequest(`/content?${queryParams}`, { method: 'GET' });
  },

  /**
   * Get content statistics
   */
  getContentStats: async () => {
    return teacherRequest('/content/stats', { method: 'GET' });
  },

  /**
   * Get recent content
   */
  getRecentContent: async (limit = 5) => {
    return teacherRequest(`/content/recent?limit=${limit}`, { method: 'GET' });
  },

  /**
   * Create new content
   */
  createContent: async (data) => {
    return teacherRequest('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get content by ID
   */
  getContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}`, { method: 'GET' });
  },

  /**
   * Update content
   */
  updateContent: async (contentId, data) => {
    return teacherRequest(`/content/${contentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete content
   */
  deleteContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}`, { method: 'DELETE' });
  },

  /**
   * Duplicate content
   */
  duplicateContent: async (contentId) => {
    return teacherRequest(`/content/${contentId}/duplicate`, { method: 'POST' });
  },

  /**
   * Update content status
   */
  updateContentStatus: async (contentId, status) => {
    return teacherRequest(`/content/${contentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // ============================================
  // AI GENERATION
  // ============================================

  /**
   * Generate a lesson from a topic
   */
  generateLesson: async (data) => {
    return teacherRequest('/content/generate/lesson', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate a quiz from content
   */
  generateQuiz: async (contentId, data, save = false) => {
    return teacherRequest(`/content/${contentId}/generate/quiz?save=${save}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate flashcards from content
   */
  generateFlashcards: async (contentId, data, save = false) => {
    return teacherRequest(`/content/${contentId}/generate/flashcards?save=${save}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate study guide from content
   */
  generateStudyGuide: async (contentId, data) => {
    return teacherRequest(`/content/${contentId}/generate/study-guide`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Analyze content
   */
  analyzeContent: async (content, options = {}) => {
    return teacherRequest('/content/analyze', {
      method: 'POST',
      body: JSON.stringify({ content, ...options }),
    });
  },

  /**
   * Analyze a PDF file and extract educational content
   * Uses Gemini's native PDF processing capabilities
   * @param {File} file - The PDF file to analyze
   * @returns {Promise<Object>} Analysis result with extracted text, title, subject, etc.
   */
  analyzePDF: async (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('PDF files must be under 10MB');
    }

    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data URL prefix (data:application/pdf;base64,)
        const result = reader.result;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return teacherRequest('/content/analyze-pdf', {
      method: 'POST',
      body: JSON.stringify({
        pdfBase64: base64,
        filename: file.name,
      }),
    });
  },

  /**
   * Analyze a PowerPoint file and extract educational content
   * Uses Gemini's native document processing capabilities
   * @param {File} file - The PPT/PPTX file to analyze
   * @returns {Promise<Object>} Analysis result with extracted text, title, subject, slideCount, etc.
   */
  analyzePPT: async (file) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PowerPoint files (.ppt, .pptx) are supported');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('PowerPoint files must be under 10MB');
    }

    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return teacherRequest('/content/analyze-ppt', {
      method: 'POST',
      body: JSON.stringify({
        pptBase64: base64,
        filename: file.name,
        mimeType: file.type,
      }),
    });
  },

  /**
   * Analyze a document file (PDF or PowerPoint) and extract educational content
   * Automatically routes to the correct analysis endpoint based on file type
   * @param {File} file - The file to analyze (PDF, PPT, or PPTX)
   * @returns {Promise<Object>} Analysis result with extracted text, title, subject, etc.
   */
  analyzeDocument: async (file) => {
    if (file.type === 'application/pdf') {
      return teacherAPI.analyzePDF(file);
    } else if (
      file.type === 'application/vnd.ms-powerpoint' ||
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return teacherAPI.analyzePPT(file);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or PowerPoint file.');
    }
  },

  /**
   * Generate an infographic from content
   * @param {string} contentId - The content ID
   * @param {Object} data - { topic, keyPoints, style?, gradeLevel?, subject? }
   */
  generateInfographic: async (contentId, data) => {
    return teacherRequest(`/content/${contentId}/generate/infographic`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generate a full lesson with quiz, flashcards, and optional infographic
   * Uses Server-Sent Events (SSE) for real-time progress updates
   * @param {Object} data - Lesson generation options
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<Object>} The generated lesson with all components
   */
  generateFullLesson: async (data, onProgress) => {
    // Helper function to make the SSE request
    const makeRequest = async (token) => {
      const response = await fetch(`${API_BASE_URL}/api/teacher/content/generate/full-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return response;
    };

    let token = teacherTokenManager.getAccessToken();
    let response = await makeRequest(token);

    // Handle 401 - try to refresh token and retry once
    if (response.status === 401) {
      try {
        await teacherTokenManager.refreshAccessToken();
        token = teacherTokenManager.getAccessToken();
        response = await makeRequest(token);
      } catch (refreshError) {
        // Refresh failed - clear tokens and throw user-friendly error
        teacherTokenManager.clearTokens();
        const error = new Error('Your session has expired. Please sign in again to continue.');
        error.code = 'SESSION_EXPIRED';
        throw error;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Map technical errors to user-friendly messages
      let userMessage = errorData.error || 'Failed to generate lesson';
      if (userMessage.toLowerCase().includes('invalid token') || userMessage.toLowerCase().includes('unauthorized')) {
        teacherTokenManager.clearTokens();
        userMessage = 'Your session has expired. Please sign in again to continue.';
        const error = new Error(userMessage);
        error.code = 'SESSION_EXPIRED';
        throw error;
      }
      throw new Error(userMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      let eventType = '';
      let eventData = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          eventData = line.slice(6);

          if (eventType && eventData) {
            try {
              const parsed = JSON.parse(eventData);

              if (eventType === 'progress' && onProgress) {
                onProgress(parsed);
              } else if (eventType === 'complete') {
                finalResult = parsed;
              } else if (eventType === 'error') {
                throw new Error(parsed.error || 'Generation failed');
              }
            } catch (parseError) {
              // Ignore parse errors for partial data
              if (eventType === 'error') {
                throw new Error('Generation failed');
              }
            }
          }

          eventType = '';
          eventData = '';
        }
      }
    }

    if (!finalResult) {
      throw new Error('No result received from generation');
    }

    return finalResult;
  },

  /**
   * Generate a full lesson synchronously (no streaming)
   * Use this if SSE is not supported
   */
  generateFullLessonSync: async (data) => {
    return teacherRequest('/content/generate/full-lesson-sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ============================================
  // EXPORT & GOOGLE DRIVE
  // ============================================

  /**
   * Export content to PDF
   * @param {string} contentId - The content ID
   * @param {Object} options - { format, includeAnswers, includeTeacherNotes, paperSize, colorScheme }
   * @returns {Promise<Blob>} PDF blob for download
   */
  exportContentPDF: async (contentId, options = {}) => {
    const params = new URLSearchParams();
    if (options.format) params.append('format', options.format);
    if (options.includeAnswers !== undefined) params.append('includeAnswers', options.includeAnswers);
    if (options.includeTeacherNotes !== undefined) params.append('includeTeacherNotes', options.includeTeacherNotes);
    if (options.paperSize) params.append('paperSize', options.paperSize);
    if (options.colorScheme) params.append('colorScheme', options.colorScheme);

    const token = teacherTokenManager.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/teacher/export/${contentId}?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export content');
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'export.pdf';
    return { blob, filename };
  },

  /**
   * Export content to PowerPoint
   * @param {string} contentId - The content ID
   * @param {Object} options - { theme, slideStyle, includeAnswers, includeTeacherNotes, includeInfographic, aspectRatio }
   * @returns {Promise<{blob: Blob, filename: string}>} PPTX blob for download
   */
  exportContentPPTX: async (contentId, options = {}) => {
    const params = new URLSearchParams();
    if (options.theme) params.append('theme', options.theme);
    if (options.slideStyle) params.append('slideStyle', options.slideStyle);
    if (options.includeAnswers !== undefined) params.append('includeAnswers', options.includeAnswers);
    if (options.includeTeacherNotes !== undefined) params.append('includeTeacherNotes', options.includeTeacherNotes);
    if (options.includeInfographic !== undefined) params.append('includeInfographic', options.includeInfographic);

    const token = teacherTokenManager.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/teacher/export/${contentId}/pptx?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to export PowerPoint');
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'export.pptx';
    return { blob, filename };
  },

  /**
   * Export multiple content items as single PDF
   * @param {string[]} contentIds - Array of content IDs
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} PDF blob
   */
  exportBatchPDF: async (contentIds, options = {}) => {
    const token = teacherTokenManager.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/teacher/export/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ contentIds, options }),
    });

    if (!response.ok) {
      throw new Error('Failed to export content');
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'export.pdf';
    return { blob, filename };
  },

  /**
   * Check Google Drive connection status
   */
  getGoogleDriveStatus: async () => {
    return teacherRequest('/export/drive/status', { method: 'GET' });
  },

  /**
   * Get Google Drive authorization URL
   */
  getGoogleDriveAuthUrl: async () => {
    return teacherRequest('/export/drive/auth-url', { method: 'GET' });
  },

  /**
   * Complete Google Drive OAuth callback
   * @param {string} code - OAuth authorization code
   */
  connectGoogleDrive: async (code) => {
    return teacherRequest('/export/drive/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Disconnect Google Drive
   */
  disconnectGoogleDrive: async () => {
    return teacherRequest('/export/drive/disconnect', { method: 'DELETE' });
  },

  /**
   * Save content to Google Drive
   * @param {string} contentId - Content ID
   * @param {Object} options - Export options
   */
  saveToGoogleDrive: async (contentId, options = {}) => {
    return teacherRequest(`/export/${contentId}/drive`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  /**
   * Save multiple content items to Google Drive
   * @param {string[]} contentIds - Array of content IDs
   * @param {Object} options - Export options
   */
  saveBatchToGoogleDrive: async (contentIds, options = {}) => {
    return teacherRequest('/export/batch/drive', {
      method: 'POST',
      body: JSON.stringify({ contentIds, options }),
    });
  },

  /**
   * List files in Google Drive Orbit folder
   * @param {number} pageSize - Number of files to return
   * @param {string} pageToken - Pagination token
   */
  listGoogleDriveFiles: async (pageSize = 20, pageToken = null) => {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) params.append('pageToken', pageToken);
    return teacherRequest(`/export/drive/files?${params}`, { method: 'GET' });
  },

  /**
   * Delete file from Google Drive
   * @param {string} fileId - Google Drive file ID
   */
  deleteGoogleDriveFile: async (fileId) => {
    return teacherRequest(`/export/drive/files/${fileId}`, { method: 'DELETE' });
  },

  // ============================================
  // AUDIO CLASS UPDATES
  // ============================================

  /**
   * List audio updates with pagination
   */
  listAudioUpdates: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return teacherRequest(`/audio-updates?${queryParams}`, { method: 'GET' });
  },

  /**
   * Get available voice options
   */
  getVoiceOptions: async () => {
    return teacherRequest('/audio-updates/voices', { method: 'GET' });
  },

  /**
   * Create a new audio update
   */
  createAudioUpdate: async (data) => {
    return teacherRequest('/audio-updates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get an audio update by ID
   */
  getAudioUpdate: async (id) => {
    return teacherRequest(`/audio-updates/${id}`, { method: 'GET' });
  },

  /**
   * Update an audio update
   */
  updateAudioUpdate: async (id, data) => {
    return teacherRequest(`/audio-updates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an audio update
   */
  deleteAudioUpdate: async (id) => {
    return teacherRequest(`/audio-updates/${id}`, { method: 'DELETE' });
  },

  /**
   * Regenerate script for an audio update
   */
  regenerateAudioScript: async (id) => {
    return teacherRequest(`/audio-updates/${id}/regenerate`, { method: 'POST' });
  },

  /**
   * Generate audio from script
   */
  generateAudio: async (id) => {
    return teacherRequest(`/audio-updates/${id}/generate-audio`, { method: 'POST' });
  },

  /**
   * Publish an audio update
   */
  publishAudioUpdate: async (id) => {
    return teacherRequest(`/audio-updates/${id}/publish`, { method: 'POST' });
  },

  /**
   * Unpublish an audio update
   */
  unpublishAudioUpdate: async (id) => {
    return teacherRequest(`/audio-updates/${id}/unpublish`, { method: 'POST' });
  },

  // ============================================
  // SUBSTITUTE TEACHER PLANS
  // ============================================

  /**
   * List substitute plans with pagination
   */
  listSubPlans: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return teacherRequest(`/sub-plans?${queryParams}`, { method: 'GET' });
  },

  /**
   * Create a new substitute plan
   */
  createSubPlan: async (data) => {
    return teacherRequest('/sub-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a substitute plan by ID
   */
  getSubPlan: async (id) => {
    return teacherRequest(`/sub-plans/${id}`, { method: 'GET' });
  },

  /**
   * Update a substitute plan
   */
  updateSubPlan: async (id, data) => {
    return teacherRequest(`/sub-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a substitute plan
   */
  deleteSubPlan: async (id) => {
    return teacherRequest(`/sub-plans/${id}`, { method: 'DELETE' });
  },

  /**
   * Duplicate a substitute plan
   */
  duplicateSubPlan: async (id) => {
    return teacherRequest(`/sub-plans/${id}/duplicate`, { method: 'POST' });
  },

  /**
   * Regenerate activities for a substitute plan
   */
  regenerateSubPlanActivities: async (id) => {
    return teacherRequest(`/sub-plans/${id}/regenerate`, { method: 'POST' });
  },

  // ============================================
  // IEP GOAL WRITER
  // ============================================

  /**
   * Get available disability categories
   */
  getDisabilityCategories: async () => {
    return teacherRequest('/iep-goals/disability-categories', { method: 'GET' });
  },

  /**
   * Get available IEP subject areas
   */
  getIEPSubjectAreas: async () => {
    return teacherRequest('/iep-goals/subject-areas', { method: 'GET' });
  },

  /**
   * Generate IEP goals preview (without saving)
   */
  generateIEPGoalsPreview: async (data) => {
    return teacherRequest('/iep-goals/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create an IEP goal session (generates and saves)
   */
  createIEPSession: async (data) => {
    return teacherRequest('/iep-goals/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List IEP goal sessions with pagination and filtering
   */
  listIEPSessions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return teacherRequest(`/iep-goals/sessions?${queryParams}`, { method: 'GET' });
  },

  /**
   * Get an IEP goal session by ID
   */
  getIEPSession: async (id) => {
    return teacherRequest(`/iep-goals/sessions/${id}`, { method: 'GET' });
  },

  /**
   * Update an IEP goal session (save selections)
   */
  updateIEPSession: async (id, data) => {
    return teacherRequest(`/iep-goals/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an IEP goal session
   */
  deleteIEPSession: async (id) => {
    return teacherRequest(`/iep-goals/sessions/${id}`, { method: 'DELETE' });
  },

  /**
   * Regenerate goals for an IEP session
   */
  regenerateIEPGoals: async (id, additionalContext) => {
    return teacherRequest(`/iep-goals/sessions/${id}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ additionalContext }),
    });
  },
};

export default teacherAPI;
