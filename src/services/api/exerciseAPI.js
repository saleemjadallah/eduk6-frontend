/**
 * Exercise API Service
 * Handles interactive exercise API calls
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const exerciseAPI = {
  /**
   * Get all exercises for a lesson with completion status
   * @param {string} lessonId - The lesson ID
   * @returns {Promise<Object>} Response with exercises array
   */
  getExercisesForLesson: async (lessonId) => {
    return makeRequest(`/exercises/lesson/${lessonId}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single exercise by ID
   * @param {string} exerciseId - The exercise ID
   * @returns {Promise<Object>} Response with exercise data
   */
  getExercise: async (exerciseId) => {
    return makeRequest(`/exercises/${exerciseId}`, {
      method: 'GET',
    });
  },

  /**
   * Submit an answer for an exercise
   * @param {string} exerciseId - The exercise ID (can be UUID or marker like "ex-1")
   * @param {string} answer - The submitted answer
   * @param {string} [lessonId] - Required when exerciseId is a marker ID like "ex-1"
   * @returns {Promise<Object>} Response with validation result
   * @returns {boolean} response.data.isCorrect - Whether the answer is correct
   * @returns {string} response.data.feedback - Ollie's feedback message
   * @returns {number|null} response.data.showHint - Which hint to show (1 or 2), or null
   * @returns {string} [response.data.correctAnswer] - The correct answer (if max attempts reached)
   * @returns {string} [response.data.explanation] - Explanation of the answer
   * @returns {number} response.data.xpAwarded - XP awarded for this attempt
   * @returns {number} response.data.attemptNumber - The attempt number
   */
  submitAnswer: async (exerciseId, answer, lessonId = null) => {
    const body = {
      submittedAnswer: answer,
    };

    // Include lessonId if provided (needed for marker ID lookups like "ex-1")
    if (lessonId) {
      body.lessonId = lessonId;
    }

    return makeRequest(`/exercises/${exerciseId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Get a hint for an exercise
   * @param {string} exerciseId - The exercise ID
   * @param {1|2} hintNumber - Which hint to get (1 or 2)
   * @returns {Promise<Object>} Response with hint text
   */
  getHint: async (exerciseId, hintNumber) => {
    return makeRequest(`/exercises/${exerciseId}/hint/${hintNumber}`, {
      method: 'GET',
    });
  },

  /**
   * Get exercise statistics for the current child
   * @returns {Promise<Object>} Response with exercise statistics
   * @returns {number} response.data.totalExercises - Total exercises available
   * @returns {number} response.data.completedExercises - Exercises completed
   * @returns {number} response.data.totalAttempts - Total answer attempts
   * @returns {number} response.data.correctFirstTry - Correct on first attempt
   * @returns {number} response.data.totalXpEarned - Total XP earned from exercises
   */
  getStats: async () => {
    return makeRequest('/exercises/stats/me', {
      method: 'GET',
    });
  },
};

export default exerciseAPI;
