import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api/authAPI';
import { tokenManager } from '../services/api/tokenManager';
import { storageManager } from '../services/storage/storageManager';

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [childProfiles, setChildProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Safe localStorage helpers for incognito mode
  const safeGetItem = useCallback((key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }, []);

  const safeSetItem = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to set ${key} in localStorage (incognito mode?)`);
    }
  }, []);

  const safeRemoveItem = useCallback((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove ${key} from localStorage (incognito mode?)`);
    }
  }, []);

  // Helper to set user data and profile from API response
  const setUserDataFromResponse = useCallback((userData) => {
    setUser(userData.user);
    setChildProfiles(userData.children || []);

    // Initialize storage manager with user context
    if (userData.user?.id) {
      const lastProfileId = safeGetItem('current_profile_id');
      let activeChildId = null;

      if (lastProfileId && userData.children?.length > 0) {
        const profile = userData.children.find(c => c.id === lastProfileId);
        if (profile) {
          setCurrentProfile(profile);
          activeChildId = profile.id;
        } else if (userData.children.length > 0) {
          setCurrentProfile(userData.children[0]);
          activeChildId = userData.children[0].id;
          safeSetItem('current_profile_id', activeChildId);
        }
      } else if (userData.children?.length > 0) {
        setCurrentProfile(userData.children[0]);
        activeChildId = userData.children[0].id;
        safeSetItem('current_profile_id', activeChildId);
      }

      // Initialize storage manager with user and child context
      storageManager.initialize(userData.user.id, activeChildId);
    }
  }, [safeGetItem, safeSetItem]);

  // Load auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Initialize token manager
        const { hasAccessToken } = tokenManager.initialize();

        if (!hasAccessToken && !tokenManager.getRefreshToken()) {
          // No tokens at all - user needs to log in
          return;
        }

        // Try to get current user with existing token
        if (hasAccessToken) {
          try {
            const response = await authAPI.getCurrentUser();
            const userData = response.data || response;
            setUserDataFromResponse(userData);
            return;
          } catch (err) {
            console.log('Access token invalid, attempting refresh...');
          }
        }

        // Try to refresh the token
        if (tokenManager.getRefreshToken()) {
          try {
            await tokenManager.refreshAccessToken();
            const userResponse = await authAPI.getCurrentUser();
            const userData = userResponse.data || userResponse;
            setUserDataFromResponse(userData);
            console.log('Token refreshed successfully');
            return;
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            tokenManager.clearTokens();
          }
        }
      } catch (err) {
        console.error('Load auth error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadAuth();
  }, [setUserDataFromResponse]);

  // Sign up function
  const signUp = useCallback(async (email, password, firstName, lastName) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.signUp({ email, password, firstName, lastName });

      if (!response.success) {
        throw new Error(response.error || 'Sign up failed');
      }

      return { success: true, requiresEmailVerification: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.signIn({ email, password });

      if (!response.success) {
        throw new Error(response.error || 'Sign in failed');
      }

      // Normalize API response in case the backend omits the `data` wrapper
      const data = response.data || response;
      const parent = data.parent || data.user;
      const childList = data.children || [];

      if (!parent) {
        throw new Error('Invalid login response: missing user data');
      }

      // Set user data
      setUser(parent);
      setChildProfiles(childList);

      // Set first child as current profile and initialize storage
      if (childList.length > 0) {
        setCurrentProfile(childList[0]);
        safeSetItem('current_profile_id', childList[0].id);
        storageManager.initialize(parent.id, childList[0].id);
      } else {
        storageManager.initialize(parent.id, null);
      }

      // Ensure auth state is marked ready after explicit sign-in
      setIsInitialized(true);

      return { success: true, user: parent, children: childList };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [safeSetItem]);

  // Sign out function - clears ALL user data
  const signOut = useCallback(async () => {
    try {
      // Call backend logout to invalidate tokens
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear all user-specific cached data
    storageManager.clearUserData();

    // Clear tokens (handled by authAPI.logout, but ensure it's done)
    tokenManager.clearTokens();

    // Reset state
    setUser(null);
    setCurrentProfile(null);
    setChildProfiles([]);
    setError(null);
  }, []);

  // Switch profile function
  const switchProfile = useCallback((childId) => {
    const profile = childProfiles.find(c => c.id === childId);
    if (profile) {
      setCurrentProfile(profile);
      safeSetItem('current_profile_id', childId);

      // Update storage manager context
      if (user?.id) {
        storageManager.initialize(user.id, childId);
      }
    }
  }, [childProfiles, user?.id, safeSetItem]);

  // Update user consent status
  const updateConsentStatus = useCallback((status) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, consentStatus: status };
    });
  }, []);

  // Add child profile (updates local state after API call)
  const addChildProfile = useCallback((childData) => {
    const newChild = {
      ...childData,
      id: childData.id || `child-${Date.now()}`,
    };

    setChildProfiles(prev => [...prev, newChild]);

    // Set as current profile if it's the first child
    if (childProfiles.length === 0) {
      setCurrentProfile(newChild);
      safeSetItem('current_profile_id', newChild.id);
      if (user?.id) {
        storageManager.initialize(user.id, newChild.id);
      }
    }

    return newChild;
  }, [childProfiles.length, user?.id, safeSetItem]);

  // Update child profile (updates local state after API call)
  const updateChildProfile = useCallback((childId, updates) => {
    setChildProfiles(prev =>
      prev.map(child =>
        child.id === childId ? { ...child, ...updates } : child
      )
    );

    // Update current profile if it's the one being updated
    if (currentProfile?.id === childId) {
      setCurrentProfile(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [currentProfile?.id]);

  // Remove child profile (updates local state after API call)
  const removeChildProfile = useCallback((childId) => {
    // Clear child's cached data
    storageManager.clearChildData(childId);

    setChildProfiles(prev => prev.filter(child => child.id !== childId));

    // Switch to another profile if current one was removed
    if (currentProfile?.id === childId) {
      const remaining = childProfiles.filter(c => c.id !== childId);
      if (remaining.length > 0) {
        setCurrentProfile(remaining[0]);
        safeSetItem('current_profile_id', remaining[0].id);
        if (user?.id) {
          storageManager.initialize(user.id, remaining[0].id);
        }
      } else {
        setCurrentProfile(null);
        safeRemoveItem('current_profile_id');
      }
    }
  }, [currentProfile?.id, childProfiles, user?.id, safeSetItem, safeRemoveItem]);

  // Refresh auth (re-fetch user data)
  const refreshAuth = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data || response;
      setUser(userData.user);
      setChildProfiles(userData.children || []);
    } catch (err) {
      console.error('Refresh auth error:', err);
      setError(err.message);
    }
  }, []);

  // Verify email - also logs user in after successful verification
  const verifyEmail = useCallback(async (email, code) => {
    const response = await authAPI.verifyEmail(email, code);

    if (response.success && response.token) {
      // Set user data
      setUser(response.parent);
      setChildProfiles(response.children || []);

      // Set first child as current profile if any
      if (response.children?.length > 0) {
        setCurrentProfile(response.children[0]);
        safeSetItem('current_profile_id', response.children[0].id);
        storageManager.initialize(response.parent.id, response.children[0].id);
      } else {
        storageManager.initialize(response.parent.id, null);
      }
    }

    return response;
  }, [safeSetItem]);

  // Switch to child mode (uses child token)
  const switchToChildMode = useCallback(async (childId, pin) => {
    try {
      const response = await authAPI.switchToChild(childId, pin);
      if (response.success) {
        // Update current profile
        const profile = childProfiles.find(c => c.id === childId);
        if (profile) {
          setCurrentProfile(profile);
          safeSetItem('current_profile_id', childId);
          storageManager.setCurrentChild(childId);
        }
      }
      return response;
    } catch (err) {
      console.error('Switch to child mode error:', err);
      throw err;
    }
  }, [childProfiles, safeSetItem]);

  // Switch back to parent mode
  const switchToParentMode = useCallback(() => {
    authAPI.switchToParent();
    // Stay on current profile but in parent mode
  }, []);

  // Derived state
  const isAuthenticated = !!user;
  const hasConsent = user?.consentStatus === 'verified';
  const needsEmailVerification = user && !user.emailVerified;
  const needsConsent = user && user.emailVerified && user.consentStatus !== 'verified';
  const needsChildProfile = user && user.emailVerified && hasConsent && childProfiles.length === 0;
  const isReady = !isLoading && isInitialized;
  const isChildMode = tokenManager.isChildMode();

  // Get max children allowed based on subscription tier
  const maxChildrenAllowed = useMemo(() => {
    switch (user?.subscriptionTier) {
      case 'free':
        return 1;
      case 'family':
      case 'annual':
        return 2;
      case 'family_plus':
        return 4;
      default:
        return 1;
    }
  }, [user?.subscriptionTier]);

  const canAddChild = childProfiles.length < maxChildrenAllowed;

  // Context value
  const value = useMemo(() => ({
    // State
    user,
    currentProfile,
    children: childProfiles,
    isLoading,
    isInitialized,
    error,

    // Derived state
    isAuthenticated,
    hasConsent,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
    isReady,
    isChildMode,
    maxChildrenAllowed,
    canAddChild,

    // Auth actions
    signUp,
    signIn,
    signOut,
    verifyEmail,
    refreshAuth,

    // Child mode actions
    switchToChildMode,
    switchToParentMode,

    // Consent actions
    updateConsentStatus,

    // Profile actions
    switchProfile,
    addChildProfile,
    updateChildProfile,
    removeChildProfile,
  }), [
    user,
    currentProfile,
    childProfiles,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    hasConsent,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
    isReady,
    isChildMode,
    maxChildrenAllowed,
    canAddChild,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    refreshAuth,
    switchToChildMode,
    switchToParentMode,
    updateConsentStatus,
    switchProfile,
    addChildProfile,
    updateChildProfile,
    removeChildProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export context and hook
export { AuthContext };
export default AuthContext;
