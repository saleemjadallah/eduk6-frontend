/**
 * Profile API Service
 * Handles child profile management API calls
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

export const profileAPI = {
  /**
   * Create a new child profile
   * @param {Object} data - Child profile data
   * @returns {Promise<Object>} Created child profile
   */
  createProfile: async (data) => {
    return makeRequest('/profiles/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all child profiles for the current parent
   * @returns {Promise<Object>} Array of child profiles
   */
  getProfiles: async () => {
    return makeRequest('/profiles/children', {
      method: 'GET',
    });
  },

  /**
   * Get a specific child profile
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child profile data
   */
  getProfile: async (childId) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'GET',
    });
  },

  /**
   * Update a child profile
   * @param {string} childId - Child ID
   * @param {Object} data - Updated profile data
   * @returns {Promise<Object>} Updated child profile
   */
  updateProfile: async (childId, data) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a child profile (soft delete)
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Success status
   */
  deleteProfile: async (childId) => {
    return makeRequest(`/profiles/children/${childId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update privacy settings for a child
   * @param {string} childId - Child ID
   * @param {Object} settings - Privacy settings
   * @returns {Promise<Object>} Updated settings
   */
  updatePrivacySettings: async (childId, settings) => {
    return makeRequest(`/profiles/children/${childId}/privacy`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Get privacy settings for a child
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Privacy settings
   */
  getPrivacySettings: async (childId) => {
    return makeRequest(`/profiles/children/${childId}/privacy`, {
      method: 'GET',
    });
  },

  /**
   * Get child activity stats
   * @param {string} childId - Child ID
   * @param {string} [period] - Time period ('day', 'week', 'month')
   * @returns {Promise<Object>} Activity stats
   */
  getActivityStats: async (childId, period = 'week') => {
    return makeRequest(`/profiles/children/${childId}/stats?period=${period}`, {
      method: 'GET',
    });
  },

  /**
   * Upload avatar for a child
   * @param {string} childId - Child ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Updated profile with new avatar URL
   */
  uploadAvatar: async (childId, file) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/api/profiles/children/${childId}/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get available avatars
   * @returns {Promise<Object>} Array of available avatar options
   */
  getAvatarOptions: async () => {
    return makeRequest('/profiles/avatars', {
      method: 'GET',
    });
  },
};

// Mock implementation for demo/development mode
export const mockProfileAPI = {
  createProfile: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newProfile = {
      id: `child-${Date.now()}`,
      displayName: data.displayName,
      age: data.age,
      grade: data.grade,
      avatarId: data.avatarId || 'avatar_1',
      learningStyle: data.learningStyle || 'visual',
      curriculumType: data.curriculumType || 'american',
      language: data.language || 'en',
      interests: data.interests || [],
      stats: {
        xp: 0,
        currentStreak: 0,
        totalLessons: 0,
        totalMinutes: 0,
      },
      privacySettings: {
        dataCollectionConsent: true,
        shareProgressWithParent: true,
        allowAIContentGeneration: true,
        contentSafetyLevel: 'strict',
        maxDailyScreenTime: null,
        allowedSubjects: null,
        blockedTopics: [],
      },
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for demo
    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    children.push(newProfile);
    localStorage.setItem('demo_children', JSON.stringify(children));

    return {
      success: true,
      profile: newProfile,
    };
  },

  getProfiles: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];

    return {
      success: true,
      profiles: children,
    };
  },

  getProfile: async (childId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    const profile = children.find(c => c.id === childId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      success: true,
      profile,
    };
  },

  updateProfile: async (childId, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    const index = children.findIndex(c => c.id === childId);

    if (index === -1) {
      throw new Error('Profile not found');
    }

    children[index] = { ...children[index], ...data };
    localStorage.setItem('demo_children', JSON.stringify(children));

    return {
      success: true,
      profile: children[index],
    };
  },

  deleteProfile: async (childId) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    const filtered = children.filter(c => c.id !== childId);
    localStorage.setItem('demo_children', JSON.stringify(filtered));

    return { success: true };
  },

  updatePrivacySettings: async (childId, settings) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    const index = children.findIndex(c => c.id === childId);

    if (index === -1) {
      throw new Error('Profile not found');
    }

    children[index].privacySettings = {
      ...children[index].privacySettings,
      ...settings,
    };
    localStorage.setItem('demo_children', JSON.stringify(children));

    return {
      success: true,
      settings: children[index].privacySettings,
    };
  },

  getPrivacySettings: async (childId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const storedChildren = localStorage.getItem('demo_children');
    const children = storedChildren ? JSON.parse(storedChildren) : [];
    const profile = children.find(c => c.id === childId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      success: true,
      settings: profile.privacySettings || {
        dataCollectionConsent: true,
        shareProgressWithParent: true,
        allowAIContentGeneration: true,
        contentSafetyLevel: 'strict',
        maxDailyScreenTime: null,
        allowedSubjects: null,
        blockedTopics: [],
      },
    };
  },

  getActivityStats: async (childId, period = 'week') => {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return mock stats
    return {
      success: true,
      stats: {
        xp: Math.floor(Math.random() * 500) + 100,
        currentStreak: Math.floor(Math.random() * 7),
        totalLessons: Math.floor(Math.random() * 20) + 5,
        totalMinutes: Math.floor(Math.random() * 300) + 60,
        activeDays: Math.floor(Math.random() * 7) + 1,
        lessonsCompleted: Math.floor(Math.random() * 10),
        flashcardsReviewed: Math.floor(Math.random() * 50),
        quizzesTaken: Math.floor(Math.random() * 5),
      },
    };
  },

  getAvatarOptions: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      avatars: [
        { id: 'avatar_1', name: 'Cool Cat', url: '/avatars/avatar_1.png' },
        { id: 'avatar_2', name: 'Happy Dog', url: '/avatars/avatar_2.png' },
        { id: 'avatar_3', name: 'Smart Owl', url: '/avatars/avatar_3.png' },
        { id: 'avatar_4', name: 'Brave Lion', url: '/avatars/avatar_4.png' },
        { id: 'avatar_5', name: 'Friendly Panda', url: '/avatars/avatar_5.png' },
        { id: 'avatar_6', name: 'Curious Bunny', url: '/avatars/avatar_6.png' },
        { id: 'avatar_7', name: 'Playful Penguin', url: '/avatars/avatar_7.png' },
        { id: 'avatar_8', name: 'Mighty Elephant', url: '/avatars/avatar_8.png' },
      ],
    };
  },
};

export default profileAPI;
