/**
 * Gamification API Service
 * Handles XP, streaks, badges, and stats from the database
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

export const gamificationAPI = {
  /**
   * Get current child's stats (XP, level, streak, badges)
   * Requires child authentication
   * @returns {Promise<Object>} Child stats
   */
  getMyStats: async () => {
    return makeRequest('/children/me/stats', {
      method: 'GET',
    });
  },

  /**
   * Award XP to current child
   * @param {number} amount - XP amount to award (1-1000)
   * @param {string} reason - Reason for XP (e.g., 'CHAT_QUESTION', 'LESSON_COMPLETE')
   * @param {string} [sourceType] - Source type (e.g., 'lesson', 'flashcard')
   * @param {string} [sourceId] - Source ID
   * @returns {Promise<Object>} XP award result
   */
  awardXP: async (amount, reason, sourceType = null, sourceId = null) => {
    return makeRequest('/children/me/xp', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        reason,
        sourceType,
        sourceId,
      }),
    });
  },

  /**
   * Record activity for streak tracking
   * Call on app open or lesson start
   * @returns {Promise<Object>} Updated streak info
   */
  recordActivity: async () => {
    return makeRequest('/children/me/activity', {
      method: 'POST',
    });
  },

  /**
   * Get all badges for current child
   * @returns {Promise<Object>} Earned and available badges
   */
  getMyBadges: async () => {
    return makeRequest('/children/me/badges', {
      method: 'GET',
    });
  },

  /**
   * Get XP history for current child
   * @param {number} [days=7] - Number of days of history
   * @returns {Promise<Object>} XP transactions and daily totals
   */
  getMyXPHistory: async (days = 7) => {
    return makeRequest(`/children/me/xp-history?days=${days}`, {
      method: 'GET',
    });
  },

  /**
   * Get stats for a specific child (parent view)
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child stats with XP history
   */
  getChildStats: async (childId) => {
    return makeRequest(`/children/${childId}/stats`, {
      method: 'GET',
    });
  },
};

export default gamificationAPI;
