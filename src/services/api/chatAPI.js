/**
 * Chat API Service
 * Handles chat-related API calls to Jeffrey AI assistant
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make API requests with automatic token refresh
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

export const chatAPI = {
  /**
   * Send a message to Jeffrey AI assistant
   * @param {Object} data - Message data
   * @param {string} data.message - The user's message
   * @param {string} [data.childId] - The child's ID (optional)
   * @param {string} [data.ageGroup] - Age group: 'YOUNG' (4-7) or 'OLDER' (8-12)
   * @param {Object} [data.lessonContext] - Current lesson context
   * @param {string} [data.lessonContext.lessonId] - Lesson ID
   * @param {string} [data.lessonContext.title] - Lesson title
   * @param {string} [data.lessonContext.subject] - Subject area
   * @param {string[]} [data.lessonContext.keyConcepts] - Key concepts from lesson
   * @param {string} [data.lessonContext.content] - Full lesson content text
   * @param {string} [data.lessonContext.summary] - Lesson summary
   * @param {Array} [data.conversationHistory] - Previous messages for context
   * @param {string} [data.selectedText] - Selected text from lesson content
   * @returns {Promise<Object>} Response with AI reply
   */
  sendMessage: async ({
    message,
    childId,
    ageGroup,
    lessonContext,
    conversationHistory,
    selectedText,
  }) => {
    return makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        childId,
        ageGroup,
        lessonContext,
        conversationHistory,
        selectedText,
      }),
    });
  },

  /**
   * Generate flashcards from lesson content
   * @param {Object} data - Flashcard generation data
   * @param {string} data.content - Lesson content to generate flashcards from
   * @param {number} [data.count] - Number of flashcards to generate (default: 5)
   * @param {string} [data.childId] - Child ID
   * @param {string} [data.ageGroup] - Age group
   * @returns {Promise<Object>} Response with flashcards array
   */
  generateFlashcards: async ({ content, count = 5, childId, ageGroup }) => {
    return makeRequest('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify({
        content,
        count,
        childId,
        ageGroup,
      }),
    });
  },

  /**
   * Generate a visual summary of the lesson
   * @param {Object} data - Summary generation data
   * @param {string} data.content - Lesson content to summarize
   * @param {string} [data.title] - Lesson title
   * @param {string} [data.childId] - Child ID
   * @param {string} [data.ageGroup] - Age group
   * @returns {Promise<Object>} Response with structured summary
   */
  generateSummary: async ({ content, title, childId, ageGroup }) => {
    return makeRequest('/chat/summarize', {
      method: 'POST',
      body: JSON.stringify({
        content,
        title,
        childId,
        ageGroup,
      }),
    });
  },

  /**
   * Generate an infographic image for the lesson
   * @param {Object} data - Infographic generation data
   * @param {string} data.content - Lesson content
   * @param {string} [data.title] - Lesson title
   * @param {string[]} [data.keyConcepts] - Key concepts to include
   * @param {string} [data.childId] - Child ID
   * @param {string} [data.ageGroup] - Age group
   * @returns {Promise<Object>} Response with image data
   */
  generateInfographic: async ({ content, title, keyConcepts, childId, ageGroup }) => {
    return makeRequest('/chat/infographic', {
      method: 'POST',
      body: JSON.stringify({
        content,
        title,
        keyConcepts,
        childId,
        ageGroup,
      }),
    });
  },
};

export default chatAPI;
