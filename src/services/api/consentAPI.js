/**
 * Consent API Service
 * Handles parental consent verification API calls
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

export const consentAPI = {
  /**
   * Initiate consent verification
   * @param {Object} data - Consent initiation data
   * @param {string} data.parentId - Parent ID
   * @param {string} data.method - Verification method ('credit_card' or 'kbq')
   * @returns {Promise<Object>} Response with consent ID and next step data
   */
  initiateConsent: async ({ parentId, method }) => {
    return makeRequest('/consent/initiate', {
      method: 'POST',
      body: JSON.stringify({ parentId, method }),
    });
  },

  /**
   * Verify consent with credit card payment
   * @param {Object} data - Verification data
   * @param {string} data.consentId - Consent ID
   * @param {string} data.paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Response with verification status
   */
  verifyCreditCard: async ({ consentId, paymentIntentId }) => {
    return makeRequest('/consent/verify-cc', {
      method: 'POST',
      body: JSON.stringify({ consentId, paymentIntentId }),
    });
  },

  /**
   * Get KBQ (Knowledge-Based Questions) for verification
   * @param {string} consentId - Consent ID
   * @returns {Promise<Object>} Response with questions array
   */
  getKBQQuestions: async (consentId) => {
    return makeRequest(`/consent/kbq/questions?consentId=${encodeURIComponent(consentId)}`, {
      method: 'GET',
    });
  },

  /**
   * Submit KBQ answers for verification
   * @param {Object} data - KBQ submission data
   * @param {string} data.consentId - Consent ID
   * @param {Array} data.answers - Array of answer objects
   * @returns {Promise<Object>} Response with verification status
   */
  verifyKBQ: async ({ consentId, answers }) => {
    return makeRequest('/consent/verify-kbq', {
      method: 'POST',
      body: JSON.stringify({ consentId, answers }),
    });
  },

  /**
   * Get current consent status
   * @param {string} parentId - Parent ID
   * @returns {Promise<Object>} Response with consent status details
   */
  getConsentStatus: async (parentId) => {
    return makeRequest(`/consent/status?parentId=${encodeURIComponent(parentId)}`, {
      method: 'GET',
    });
  },

  /**
   * Revoke consent (COPPA compliance)
   * @param {string} parentId - Parent ID
   * @returns {Promise<Object>} Response with success status
   */
  revokeConsent: async (parentId) => {
    return makeRequest('/consent/revoke', {
      method: 'POST',
      body: JSON.stringify({ parentId }),
    });
  },

  /**
   * Create Stripe payment intent for verification
   * @param {string} consentId - Consent ID
   * @returns {Promise<Object>} Response with client secret
   */
  createPaymentIntent: async (consentId) => {
    return makeRequest('/consent/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ consentId }),
    });
  },

  /**
   * Get verification history
   * @param {string} parentId - Parent ID
   * @returns {Promise<Object>} Response with verification attempts
   */
  getVerificationHistory: async (parentId) => {
    return makeRequest(`/consent/history?parentId=${encodeURIComponent(parentId)}`, {
      method: 'GET',
    });
  },
};

// Mock implementation for demo/development mode
export const mockConsentAPI = {
  initiateConsent: async ({ parentId, method }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const consentId = `consent-${Date.now()}`;

    if (method === 'credit_card') {
      return {
        success: true,
        consentId,
        nextStep: 'credit_card_form',
        data: {
          // Mock Stripe client secret
          clientSecret: 'mock_client_secret_for_demo',
        },
      };
    } else if (method === 'kbq') {
      return {
        success: true,
        consentId,
        nextStep: 'kbq_questions',
        data: {
          questions: [
            {
              id: 'q1',
              question: 'What year were you born?',
              options: [],
              category: 'personal',
              type: 'text',
            },
            {
              id: 'q2',
              question: 'What is your current country of residence?',
              options: ['USA', 'UAE', 'UK', 'Canada', 'Australia', 'Other'],
              category: 'location',
              type: 'select',
            },
            {
              id: 'q3',
              question: "What is your child's current grade level?",
              options: ['Pre-K', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
              category: 'child',
              type: 'select',
            },
            {
              id: 'q4',
              question: 'Which curriculum does your child follow?',
              options: ['American (Common Core)', 'British (IGCSE)', 'Indian (CBSE/ICSE)', 'IB', 'Other'],
              category: 'education',
              type: 'select',
            },
            {
              id: 'q5',
              question: 'How many children do you have?',
              options: ['1', '2', '3', '4', '5 or more'],
              category: 'family',
              type: 'select',
            },
          ],
        },
      };
    }

    return { success: false, error: 'Invalid verification method' };
  },

  verifyCreditCard: async ({ consentId, paymentIntentId }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Always succeed in demo mode
    return {
      success: true,
      consentStatus: 'verified',
      message: 'Credit card verification successful. The $0.50 charge will be refunded.',
    };
  },

  getKBQQuestions: async (consentId) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      questions: [
        {
          id: 'q1',
          question: 'What year were you born?',
          options: [],
          category: 'personal',
          type: 'text',
        },
        {
          id: 'q2',
          question: 'What is your current country of residence?',
          options: ['USA', 'UAE', 'UK', 'Canada', 'Australia', 'Other'],
          category: 'location',
          type: 'select',
        },
        {
          id: 'q3',
          question: "What is your child's current grade level?",
          options: ['Pre-K', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
          category: 'child',
          type: 'select',
        },
        {
          id: 'q4',
          question: 'Which curriculum does your child follow?',
          options: ['American (Common Core)', 'British (IGCSE)', 'Indian (CBSE/ICSE)', 'IB', 'Other'],
          category: 'education',
          type: 'select',
        },
        {
          id: 'q5',
          question: 'How many children do you have?',
          options: ['1', '2', '3', '4', '5 or more'],
          category: 'family',
          type: 'select',
        },
      ],
    };
  },

  verifyKBQ: async ({ consentId, answers }) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // In demo mode, verify if all questions are answered
    if (!answers || answers.length < 5) {
      return {
        success: false,
        consentStatus: 'pending',
        error: 'Please answer all questions',
        attemptsRemaining: 2,
      };
    }

    // Check for empty answers
    const hasEmptyAnswers = answers.some(a => !a.answer || a.answer.trim() === '');
    if (hasEmptyAnswers) {
      return {
        success: false,
        consentStatus: 'pending',
        error: 'Please answer all questions',
        attemptsRemaining: 2,
      };
    }

    // Always succeed in demo mode if all answered
    return {
      success: true,
      consentStatus: 'verified',
      message: 'Knowledge-based verification successful!',
    };
  },

  getConsentStatus: async (parentId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check localStorage for demo consent status
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        hasConsent: user.consentStatus === 'verified',
        consentStatus: user.consentStatus,
        consentMethod: user.consentMethod || null,
        consentDate: user.consentDate || null,
      };
    }

    return { hasConsent: false, consentStatus: 'none' };
  },

  revokeConsent: async (parentId) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update localStorage in demo mode
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.consentStatus = 'none';
      localStorage.setItem('demo_user', JSON.stringify(user));
    }

    return { success: true };
  },
};

export default consentAPI;
