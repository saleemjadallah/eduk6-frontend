import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api/authAPI';

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

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData.user);
            setChildProfiles(userData.children || []);

            // Load last active profile
            const lastProfileId = localStorage.getItem('current_profile_id');
            if (lastProfileId && userData.children?.length > 0) {
              const profile = userData.children.find(c => c.id === lastProfileId);
              setCurrentProfile(profile || userData.children[0]);
            } else if (userData.children?.length > 0) {
              setCurrentProfile(userData.children[0]);
            }
          } catch (err) {
            console.error('Auth verification failed:', err);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
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
  }, []);

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

      // Response structure: { success: true, data: { token, refreshToken, parent, children } }
      const data = response.data;

      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      // Set user data
      setUser(data.parent);
      setChildProfiles(data.children || []);

      // Set first child as current profile
      if (data.children?.length > 0) {
        setCurrentProfile(data.children[0]);
        localStorage.setItem('current_profile_id', data.children[0].id);
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // Call backend logout to invalidate tokens
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_profile_id');
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
      localStorage.setItem('current_profile_id', childId);
    }
  }, [childProfiles]);

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
      localStorage.setItem('current_profile_id', newChild.id);
    }

    return newChild;
  }, [childProfiles.length]);

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
    setChildProfiles(prev => prev.filter(child => child.id !== childId));

    // Switch to another profile if current one was removed
    if (currentProfile?.id === childId) {
      const remaining = childProfiles.filter(c => c.id !== childId);
      if (remaining.length > 0) {
        setCurrentProfile(remaining[0]);
        localStorage.setItem('current_profile_id', remaining[0].id);
      } else {
        setCurrentProfile(null);
        localStorage.removeItem('current_profile_id');
      }
    }
  }, [currentProfile?.id, childProfiles]);

  // Refresh auth (re-fetch user data)
  const refreshAuth = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
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
      // Store tokens
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }

      // Set user data
      setUser(response.parent);
      setChildProfiles(response.children || []);

      // Set first child as current profile if any
      if (response.children?.length > 0) {
        setCurrentProfile(response.children[0]);
        localStorage.setItem('current_profile_id', response.children[0].id);
      }
    }

    return response;
  }, []);

  // Derived state
  const isAuthenticated = !!user;
  const hasConsent = user?.consentStatus === 'verified';
  const needsEmailVerification = user && !user.emailVerified;
  const needsConsent = user && user.emailVerified && user.consentStatus !== 'verified';
  const needsChildProfile = user && user.emailVerified && hasConsent && childProfiles.length === 0;
  const isReady = !isLoading && isInitialized;

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
    maxChildrenAllowed,
    canAddChild,

    // Auth actions
    signUp,
    signIn,
    signOut,
    verifyEmail,
    refreshAuth,

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
    maxChildrenAllowed,
    canAddChild,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    refreshAuth,
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
