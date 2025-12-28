/**
 * Chat API Service
 * Handles chat-related API calls to Ollie AI assistant
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

// Get API base URL for standalone demo requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const chatAPI = {
  /**
   * Send a demo message to Ollie AI (completely standalone - no auth)
   * Used for landing page interactive demo - limited to 3 messages per session
   * This uses a raw fetch to avoid any auth/token logic
   * @param {Object} data - Message data
   * @param {string} data.message - The user's message
   * @param {Array} [data.conversationHistory] - Previous messages for context
   * @param {string} [data.sessionId] - Session ID for tracking demo usage
   * @returns {Promise<Object>} Response with AI reply
   */
  sendDemoMessage: async ({ message, conversationHistory, sessionId }) => {
    // Standalone fetch - no auth, no token refresh, no complex logic
    const response = await fetch(`${API_BASE_URL}/api/chat/demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Demo chat failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Send a message to Ollie AI assistant
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

  /**
   * Generate a quiz from lesson content
   * @param {Object} data - Quiz generation data
   * @param {string} data.content - Lesson content to quiz on
   * @param {string} [data.title] - Lesson title
   * @param {number} [data.count] - Number of questions (default: 5)
   * @param {string} [data.type] - Question type: 'multiple_choice', 'true_false', 'fill_blank'
   * @param {string} [data.childId] - Child ID
   * @param {string} [data.ageGroup] - Age group
   * @returns {Promise<Object>} Response with quiz data
   */
  generateQuiz: async ({ content, title, count = 5, type = 'multiple_choice', childId, ageGroup }) => {
    return makeRequest('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({
        content,
        count,
        type,
        childId,
        ageGroup,
      }),
    });
  },

  /**
   * Generate an audio summary of the lesson using Ollie's voice
   * @param {Object} data - Audio summary generation data
   * @param {string} data.lessonId - Lesson ID
   * @param {string} [data.ageGroup] - Age group: 'YOUNG' (4-7) or 'OLDER' (8-12)
   * @returns {Promise<Object>} Response with audio URL and duration
   */
  generateAudioSummary: async ({ lessonId, ageGroup = 'OLDER' }) => {
    return makeRequest(`/lessons/${lessonId}/audio-summary`, {
      method: 'POST',
      body: JSON.stringify({
        ageGroup,
      }),
    });
  },

  /**
   * Get the audio summary status for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Response with status, audioUrl, and duration
   */
  getAudioSummaryStatus: async (lessonId) => {
    return makeRequest(`/lessons/${lessonId}/audio-summary`, {
      method: 'GET',
    });
  },
};

export default chatAPI;
