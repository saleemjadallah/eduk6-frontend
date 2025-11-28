/**
 * Storage Manager
 * Namespaced localStorage management per user/child
 *
 * Features:
 * - Isolates data per user and child profile
 * - Clears all user data on logout
 * - Migrates legacy global keys to namespaced keys
 * - Handles JSON serialization/deserialization
 */

// Legacy keys that need migration (global keys without namespacing)
const LEGACY_KEYS = {
  LESSONS: 'orbitlearn_lessons',
  CURRENT_LESSON_ID: 'orbitlearn_current_lesson_id',
  GAME_PROGRESS: 'userGameProgress',
};

// Storage key prefixes
const PREFIX = {
  USER: 'orbitlearn:user:',
  CHILD: 'orbitlearn:child:',
  GLOBAL: 'orbitlearn:global:',
};

// Current user context
let currentUserId = null;
let currentChildId = null;

// Event listeners for storage changes
const storageListeners = new Set();

/**
 * Storage Manager singleton
 */
export const storageManager = {
  /**
   * Initialize storage manager with user context
   * @param {string} userId - Parent user ID
   * @param {string} [childId] - Currently active child profile ID
   */
  initialize(userId, childId = null) {
    currentUserId = userId;
    currentChildId = childId;

    // Migrate legacy data if needed
    if (userId) {
      this.migrateLegacyData(userId, childId);
    }
  },

  /**
   * Update the current child context
   * @param {string} childId - Child profile ID
   */
  setCurrentChild(childId) {
    currentChildId = childId;
  },

  /**
   * Build a namespaced key
   * @param {string} key - Base key name
   * @param {Object} options - Scoping options
   * @param {boolean} options.userScoped - Scope to current user
   * @param {boolean} options.childScoped - Scope to current child
   * @returns {string} Namespaced key
   */
  buildKey(key, { userScoped = true, childScoped = false } = {}) {
    if (childScoped && currentChildId) {
      return `${PREFIX.CHILD}${currentChildId}:${key}`;
    }
    if (userScoped && currentUserId) {
      return `${PREFIX.USER}${currentUserId}:${key}`;
    }
    return `${PREFIX.GLOBAL}${key}`;
  },

  /**
   * Get an item from storage
   * @param {string} key - Key name
   * @param {Object} options - Scoping options
   * @returns {any} Parsed value or null
   */
  get(key, options = {}) {
    try {
      const namespacedKey = this.buildKey(key, options);
      const value = localStorage.getItem(namespacedKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set an item in storage
   * @param {string} key - Key name
   * @param {any} value - Value to store
   * @param {Object} options - Scoping options
   */
  set(key, value, options = {}) {
    try {
      const namespacedKey = this.buildKey(key, options);
      localStorage.setItem(namespacedKey, JSON.stringify(value));
      this.notifyListeners(key, value);
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  },

  /**
   * Remove an item from storage
   * @param {string} key - Key name
   * @param {Object} options - Scoping options
   */
  remove(key, options = {}) {
    try {
      const namespacedKey = this.buildKey(key, options);
      localStorage.removeItem(namespacedKey);
      this.notifyListeners(key, null);
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
    }
  },

  /**
   * Clear all data for the current user
   * Called on logout
   */
  clearUserData() {
    if (!currentUserId) return;

    const keysToRemove = [];

    // Find all keys for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith(`${PREFIX.USER}${currentUserId}`) ||
        (currentChildId && key.startsWith(`${PREFIX.CHILD}${currentChildId}`))
      )) {
        keysToRemove.push(key);
      }
    }

    // Also find all child keys for this user's children
    // We need to clear all children's data, not just the current child
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX.CHILD)) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Also clear legacy keys
    Object.values(LEGACY_KEYS).forEach(key => localStorage.removeItem(key));

    // Clear context
    currentUserId = null;
    currentChildId = null;

    this.notifyListeners('__clear__', null);
  },

  /**
   * Clear data for a specific child
   * @param {string} childId - Child ID to clear data for
   */
  clearChildData(childId) {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${PREFIX.CHILD}${childId}`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  /**
   * Migrate legacy global data to namespaced keys
   * @param {string} userId - User ID
   * @param {string} childId - Child ID
   */
  migrateLegacyData(userId, childId) {
    // Migrate lessons (user-scoped)
    const legacyLessons = localStorage.getItem(LEGACY_KEYS.LESSONS);
    if (legacyLessons && childId) {
      const childLessonsKey = this.buildKey('lessons', { childScoped: true });
      if (!localStorage.getItem(childLessonsKey)) {
        localStorage.setItem(childLessonsKey, legacyLessons);
      }
      // Don't remove legacy data yet - wait for successful migration verification
    }

    // Migrate current lesson ID (child-scoped)
    const legacyCurrentLessonId = localStorage.getItem(LEGACY_KEYS.CURRENT_LESSON_ID);
    if (legacyCurrentLessonId && childId) {
      const childCurrentLessonKey = this.buildKey('currentLessonId', { childScoped: true });
      if (!localStorage.getItem(childCurrentLessonKey)) {
        localStorage.setItem(childCurrentLessonKey, JSON.stringify(legacyCurrentLessonId));
      }
    }

    // Migrate gamification progress (child-scoped)
    const legacyGameProgress = localStorage.getItem(LEGACY_KEYS.GAME_PROGRESS);
    if (legacyGameProgress && childId) {
      const childGameProgressKey = this.buildKey('gameProgress', { childScoped: true });
      if (!localStorage.getItem(childGameProgressKey)) {
        localStorage.setItem(childGameProgressKey, legacyGameProgress);
      }
    }
  },

  /**
   * Subscribe to storage changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    storageListeners.add(listener);
    return () => storageListeners.delete(listener);
  },

  /**
   * Notify all listeners of storage change
   * @param {string} key - Changed key
   * @param {any} value - New value
   */
  notifyListeners(key, value) {
    storageListeners.forEach(listener => listener({ key, value }));
  },

  // Convenience methods for common data types

  /**
   * Get lessons for current child
   */
  getLessons() {
    return this.get('lessons', { childScoped: true }) || [];
  },

  /**
   * Set lessons for current child
   */
  setLessons(lessons) {
    this.set('lessons', lessons, { childScoped: true });
  },

  /**
   * Get current lesson ID for current child
   */
  getCurrentLessonId() {
    return this.get('currentLessonId', { childScoped: true });
  },

  /**
   * Set current lesson ID for current child
   */
  setCurrentLessonId(lessonId) {
    this.set('currentLessonId', lessonId, { childScoped: true });
  },

  /**
   * Get gamification progress for current child
   */
  getGameProgress() {
    return this.get('gameProgress', { childScoped: true });
  },

  /**
   * Set gamification progress for current child
   */
  setGameProgress(progress) {
    this.set('gameProgress', progress, { childScoped: true });
  },

  /**
   * Get user preferences (user-scoped)
   */
  getUserPreferences() {
    return this.get('preferences', { userScoped: true, childScoped: false });
  },

  /**
   * Set user preferences (user-scoped)
   */
  setUserPreferences(preferences) {
    this.set('preferences', preferences, { userScoped: true, childScoped: false });
  },
};

export default storageManager;
