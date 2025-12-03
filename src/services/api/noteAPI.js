/**
 * Note API Service
 * Handles CRUD operations for notebook notes and parent comments
 */

import { makeAuthenticatedRequest as makeRequest } from './apiUtils.js';

// Helper to get current child ID from localStorage
function getCurrentChildId() {
  return localStorage.getItem('current_profile_id') || null;
}

export const noteAPI = {
  // ============================================
  // CHILD ENDPOINTS
  // ============================================

  /**
   * Create a new note
   * @param {Object} noteData - Note data including title, content, etc.
   * @returns {Promise<Object>} Created note with XP reward info
   */
  createNote: async (noteData) => {
    const childId = getCurrentChildId();
    return makeRequest('/notes', {
      method: 'POST',
      body: JSON.stringify({ ...noteData, childId }),
    });
  },

  /**
   * Get all notes for the current child
   * @param {Object} [options] - Optional filters
   * @param {string} [options.subject] - Filter by subject
   * @param {string} [options.lessonId] - Filter by lesson ID
   * @param {boolean} [options.grouped] - Group notes by subject
   * @returns {Promise<Object>} Notes array or grouped notes
   */
  getMyNotes: async (options = {}) => {
    const childId = getCurrentChildId();
    const params = new URLSearchParams();
    if (childId) params.append('childId', childId);
    if (options.subject) params.append('subject', options.subject);
    if (options.lessonId) params.append('lessonId', options.lessonId);
    if (options.grouped) params.append('grouped', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return makeRequest(`/notes/me${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get note statistics for current child
   * @returns {Promise<Object>} Note stats including total, by subject, recent
   */
  getMyNoteStats: async () => {
    const childId = getCurrentChildId();
    const params = childId ? `?childId=${childId}` : '';
    return makeRequest(`/notes/me/stats${params}`, {
      method: 'GET',
    });
  },

  /**
   * Get notes by subject for current child
   * @param {string} subject - Subject to filter by
   * @returns {Promise<Object>} Notes for the specified subject
   */
  getMyNotesBySubject: async (subject) => {
    const childId = getCurrentChildId();
    const params = childId ? `?childId=${childId}` : '';
    return makeRequest(`/notes/me/subject/${subject}${params}`, {
      method: 'GET',
    });
  },

  /**
   * Get a specific note by ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Note details
   */
  getNote: async (noteId) => {
    const childId = getCurrentChildId();
    const params = childId ? `?childId=${childId}` : '';
    return makeRequest(`/notes/${noteId}${params}`, {
      method: 'GET',
    });
  },

  /**
   * Update a note
   * @param {string} noteId - Note ID
   * @param {Object} updateData - Fields to update (title, content, contentFormat, isPinned)
   * @returns {Promise<Object>} Updated note with XP reward info
   */
  updateNote: async (noteId, updateData) => {
    const childId = getCurrentChildId();
    return makeRequest(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updateData, childId }),
    });
  },

  /**
   * Update note cover personalization
   * @param {string} noteId - Note ID
   * @param {Object} coverData - Cover customization (coverColor, coverStickers, coverPattern)
   * @returns {Promise<Object>} Updated note
   */
  updateNoteCover: async (noteId, coverData) => {
    const childId = getCurrentChildId();
    return makeRequest(`/notes/${noteId}/cover`, {
      method: 'PATCH',
      body: JSON.stringify({ ...coverData, childId }),
    });
  },

  /**
   * Toggle pin status for a note
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Updated note with new pin status
   */
  toggleNotePin: async (noteId) => {
    const childId = getCurrentChildId();
    return makeRequest(`/notes/${noteId}/pin`, {
      method: 'POST',
      body: JSON.stringify({ childId }),
    });
  },

  /**
   * Reorder notes
   * @param {string[]} noteIds - Ordered array of note IDs
   * @returns {Promise<Object>} Success status
   */
  reorderNotes: async (noteIds) => {
    const childId = getCurrentChildId();
    return makeRequest('/notes/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ noteIds, childId }),
    });
  },

  /**
   * Delete a note
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Success status
   */
  deleteNote: async (noteId) => {
    const childId = getCurrentChildId();
    const params = childId ? `?childId=${childId}` : '';
    return makeRequest(`/notes/${noteId}${params}`, {
      method: 'DELETE',
    });
  },

  // ============================================
  // PARENT ENDPOINTS
  // ============================================

  /**
   * Get all notes for a specific child (parent view)
   * @param {string} childId - Child ID
   * @param {Object} [options] - Optional filters
   * @param {string} [options.subject] - Filter by subject
   * @param {boolean} [options.grouped] - Group notes by subject
   * @returns {Promise<Object>} Notes for the child
   */
  getChildNotes: async (childId, options = {}) => {
    const params = new URLSearchParams();
    if (options.subject) params.append('subject', options.subject);
    if (options.grouped) params.append('grouped', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return makeRequest(`/notes/child/${childId}${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get note statistics for a specific child (parent view)
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Note stats
   */
  getChildNoteStats: async (childId) => {
    return makeRequest(`/notes/child/${childId}/stats`, {
      method: 'GET',
    });
  },

  /**
   * Get a specific note with full details (parent view)
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Note with child info and all comments
   */
  getNoteForParent: async (noteId) => {
    return makeRequest(`/notes/${noteId}/parent`, {
      method: 'GET',
    });
  },

  /**
   * Add a comment to a note (parent only)
   * @param {string} noteId - Note ID
   * @param {Object} commentData - Comment content and optional emoji
   * @returns {Promise<Object>} Created comment
   */
  addComment: async (noteId, commentData) => {
    return makeRequest(`/notes/${noteId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  /**
   * Get all comments for a note
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Comments array
   */
  getComments: async (noteId) => {
    return makeRequest(`/notes/${noteId}/comments`, {
      method: 'GET',
    });
  },

  /**
   * Delete a parent comment
   * @param {string} noteId - Note ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Success status
   */
  deleteComment: async (noteId, commentId) => {
    return makeRequest(`/notes/${noteId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

export default noteAPI;
