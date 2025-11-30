/**
 * Gamification API Service
 * Handles XP, streaks, badges, and stats from the database
 *
 * Supports both:
 * - Child mode (child token): Uses /children/me/* endpoints
 * - Parent mode (parent token + childId): Uses /children/:childId/* endpoints
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';
import { tokenManager } from './tokenManager.js';

/**
 * Get the current child ID from localStorage
 */
function getCurrentChildId() {
  try {
    return localStorage.getItem('current_profile_id');
  } catch (e) {
    return null;
  }
}

export const gamificationAPI = {
  /**
   * Get current child's stats (XP, level, streak, badges)
   * Works in both child mode and parent mode
   * @returns {Promise<Object>} Child stats
   */
  getMyStats: async () => {
    const isChildMode = tokenManager.isChildMode();
    const childId = getCurrentChildId();

    // If in child mode, use /me endpoint
    if (isChildMode) {
      return makeRequest('/children/me/stats', {
        method: 'GET',
      });
    }

    // If parent mode with selected child, use /:childId endpoint
    if (childId) {
      return makeRequest(`/children/${childId}/stats`, {
        method: 'GET',
      });
    }

    // No child context available
    return { success: false, error: 'No child profile selected' };
  },

  /**
   * Award XP to current child
   * Works in both child mode and parent mode
   * @param {number} amount - XP amount to award (1-1000)
   * @param {string} reason - Reason for XP
   * @param {string} [sourceType] - Source type
   * @param {string} [sourceId] - Source ID
   * @returns {Promise<Object>} XP award result
   */
  awardXP: async (amount, reason, sourceType = null, sourceId = null) => {
    const isChildMode = tokenManager.isChildMode();
    const childId = getCurrentChildId();

    // If in child mode, use /me endpoint
    if (isChildMode) {
      return makeRequest('/children/me/xp', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          reason,
          sourceType,
          sourceId,
        }),
      });
    }

    // If parent mode with selected child, use /:childId endpoint
    if (childId) {
      return makeRequest(`/children/${childId}/xp`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          reason,
          sourceType,
          sourceId,
        }),
      });
    }

    // No child context
    console.log('XP award skipped - no child profile selected');
    return { success: false, error: 'No child profile selected' };
  },

  /**
   * Record activity for streak tracking
   * Works in both child mode and parent mode
   * @returns {Promise<Object>} Updated streak info
   */
  recordActivity: async () => {
    const isChildMode = tokenManager.isChildMode();
    const childId = getCurrentChildId();

    // If in child mode, use /me endpoint
    if (isChildMode) {
      return makeRequest('/children/me/activity', {
        method: 'POST',
      });
    }

    // If parent mode with selected child, use /:childId endpoint
    if (childId) {
      return makeRequest(`/children/${childId}/activity`, {
        method: 'POST',
      });
    }

    // No child context
    console.log('Activity recording skipped - no child profile selected');
    return { success: false, error: 'No child profile selected' };
  },

  /**
   * Get all badges for current child
   * Works in both child mode and parent mode
   * @returns {Promise<Object>} Earned and available badges
   */
  getMyBadges: async () => {
    const isChildMode = tokenManager.isChildMode();
    const childId = getCurrentChildId();

    if (isChildMode) {
      return makeRequest('/children/me/badges', {
        method: 'GET',
      });
    }

    // Parent mode - badges endpoint doesn't exist for /:childId
    // Return empty for now (parent sees badges through stats)
    if (childId) {
      // Could add a parent-accessible badges endpoint later
      return { success: true, data: { earned: [], available: [] } };
    }

    return { success: false, error: 'No child profile selected' };
  },

  /**
   * Get XP history for current child
   * Only works in child mode
   * @param {number} [days=7] - Number of days of history
   * @returns {Promise<Object>} XP transactions and daily totals
   */
  getMyXPHistory: async (days = 7) => {
    const isChildMode = tokenManager.isChildMode();

    if (!isChildMode) {
      return { success: false, error: 'XP history only available in child mode' };
    }

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
