import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api/authAPI';

// Initial state for demo/development mode when no backend
const DEMO_MODE = true; // Set to false when backend is ready

const DEMO_USER = {
  id: 'demo-parent-001',
  email: 'parent@demo.com',
  firstName: 'Demo',
  lastName: 'Parent',
  emailVerified: true,
  consentStatus: 'verified',
  subscriptionTier: 'family',
};

const DEMO_CHILDREN = [
  {
    id: 'demo-child-001',
    displayName: 'Alex',
    age: 8,
    grade: 3,
    avatarId: 'avatar_1',
    learningStyle: 'visual',
    curriculumType: 'american',
    language: 'en',
    interests: ['science', 'math', 'animals'],
  },
  {
    id: 'demo-child-002',
    displayName: 'Emma',
    age: 6,
    grade: 1,
    avatarId: 'avatar_2',
    learningStyle: 'kinesthetic',
    curriculumType: 'american',
    language: 'en',
    interests: ['art', 'reading', 'nature'],
  },
];

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
        if (DEMO_MODE) {
          // Demo mode - use mock data
          const storedDemoUser = localStorage.getItem('demo_user');
          const storedDemoChildren = localStorage.getItem('demo_children');
          const storedCurrentProfileId = localStorage.getItem('current_profile_id');

          if (storedDemoUser) {
            const demoUser = JSON.parse(storedDemoUser);
            setUser(demoUser);

            const demoChildren = storedDemoChildren
              ? JSON.parse(storedDemoChildren)
              : DEMO_CHILDREN;
            setChildProfiles(demoChildren);

            // Set current profile
            if (storedCurrentProfileId && demoChildren.length > 0) {
              const profile = demoChildren.find(c => c.id === storedCurrentProfileId);
              setCurrentProfile(profile || demoChildren[0]);
            } else if (demoChildren.length > 0) {
              setCurrentProfile(demoChildren[0]);
            }
          }
        } else {
          // Production mode - use actual API
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
      if (DEMO_MODE) {
        // Demo mode - simulate signup
        const newUser = {
          ...DEMO_USER,
          id: `parent-${Date.now()}`,
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          emailVerified: false,
          consentStatus: 'none',
        };

        localStorage.setItem('demo_user', JSON.stringify(newUser));
        localStorage.setItem('demo_children', JSON.stringify([]));
        setUser(newUser);
        setChildProfiles([]);

        return { success: true, requiresEmailVerification: true };
      } else {
        const response = await authAPI.signUp({ email, password, firstName, lastName });

        if (!response.success) {
          throw new Error(response.error || 'Sign up failed');
        }

        return { success: true, requiresEmailVerification: true };
      }
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
      if (DEMO_MODE) {
        // Demo mode - simulate sign in
        const storedUser = localStorage.getItem('demo_user');
        if (storedUser) {
          const demoUser = JSON.parse(storedUser);
          if (demoUser.email === email) {
            // Simulate email verified user
            demoUser.emailVerified = true;
            setUser(demoUser);
            localStorage.setItem('demo_user', JSON.stringify(demoUser));

            const storedChildren = localStorage.getItem('demo_children');
            const children = storedChildren ? JSON.parse(storedChildren) : [];
            setChildProfiles(children);

            if (children.length > 0) {
              setCurrentProfile(children[0]);
              localStorage.setItem('current_profile_id', children[0].id);
            }

            return { success: true };
          }
        }

        // For demo, auto-login with demo user if email matches
        if (email === 'demo@example.com' || email === 'parent@demo.com') {
          const demoUser = { ...DEMO_USER, email };
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          localStorage.setItem('demo_children', JSON.stringify(DEMO_CHILDREN));
          setUser(demoUser);
          setChildProfiles(DEMO_CHILDREN);
          setCurrentProfile(DEMO_CHILDREN[0]);
          localStorage.setItem('current_profile_id', DEMO_CHILDREN[0].id);
          return { success: true };
        }

        throw new Error('Invalid email or password');
      } else {
        const response = await authAPI.signIn({ email, password });

        if (!response.success) {
          throw new Error(response.error || 'Sign in failed');
        }

        // Store tokens
        localStorage.setItem('auth_token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }

        // Set user data
        setUser(response.parent);
        setChildProfiles(response.parent?.children || []);

        // Set first child as current profile
        if (response.parent?.children?.length > 0) {
          setCurrentProfile(response.parent.children[0]);
          localStorage.setItem('current_profile_id', response.parent.children[0].id);
        }

        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_profile_id');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_children');
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
      const updated = { ...prev, consentStatus: status };
      if (DEMO_MODE) {
        localStorage.setItem('demo_user', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Add child profile
  const addChildProfile = useCallback((childData) => {
    const newChild = {
      ...childData,
      id: childData.id || `child-${Date.now()}`,
    };

    setChildProfiles(prev => {
      const updated = [...prev, newChild];
      if (DEMO_MODE) {
        localStorage.setItem('demo_children', JSON.stringify(updated));
      }
      return updated;
    });

    // Set as current profile if it's the first child
    if (childProfiles.length === 0) {
      setCurrentProfile(newChild);
      localStorage.setItem('current_profile_id', newChild.id);
    }

    return newChild;
  }, [childProfiles.length]);

  // Update child profile
  const updateChildProfile = useCallback((childId, updates) => {
    setChildProfiles(prev => {
      const updated = prev.map(child =>
        child.id === childId ? { ...child, ...updates } : child
      );
      if (DEMO_MODE) {
        localStorage.setItem('demo_children', JSON.stringify(updated));
      }
      return updated;
    });

    // Update current profile if it's the one being updated
    if (currentProfile?.id === childId) {
      setCurrentProfile(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [currentProfile?.id]);

  // Remove child profile
  const removeChildProfile = useCallback((childId) => {
    setChildProfiles(prev => {
      const updated = prev.filter(child => child.id !== childId);
      if (DEMO_MODE) {
        localStorage.setItem('demo_children', JSON.stringify(updated));
      }
      return updated;
    });

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
    if (!DEMO_MODE) {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user);
        setChildProfiles(userData.children || []);
      } catch (err) {
        console.error('Refresh auth error:', err);
        setError(err.message);
      }
    }
  }, []);

  // Verify email (for demo, just mark as verified)
  const verifyEmail = useCallback(async (token) => {
    if (DEMO_MODE) {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, emailVerified: true };
        localStorage.setItem('demo_user', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } else {
      return await authAPI.verifyEmail(token);
    }
  }, []);

  // Derived state
  const isAuthenticated = !!user;
  const hasConsent = user?.consentStatus === 'verified';
  const needsEmailVerification = user && !user.emailVerified;
  const needsConsent = user && user.emailVerified && user.consentStatus !== 'verified';
  const needsChildProfile = user && user.emailVerified && user.consentStatus === 'verified' && childProfiles.length === 0;
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
