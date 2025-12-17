import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { teacherAPI, teacherTokenManager } from '../services/api/teacherAPI';

// Create context
const TeacherAuthContext = createContext(null);

// Provider component
export function TeacherAuthProvider({ children }) {
  // State
  const [teacher, setTeacher] = useState(null);
  const [quota, setQuota] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Load auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Initialize token manager
        const { hasAccessToken } = teacherTokenManager.initialize();

        if (!hasAccessToken && !teacherTokenManager.getRefreshToken()) {
          // No tokens at all - user needs to log in
          return;
        }

        // Try to get current teacher with existing token
        if (hasAccessToken) {
          try {
            const response = await teacherAPI.getCurrentTeacher();
            const teacherData = response.data || response;
            setTeacher(teacherData.teacher);

            // Also fetch quota info
            try {
              const quotaResponse = await teacherAPI.getQuota();
              setQuota(quotaResponse.data || quotaResponse);
            } catch (quotaErr) {
              console.warn('Failed to fetch quota:', quotaErr);
            }
            return;
          } catch (err) {
            console.log('Access token invalid, attempting refresh...');
          }
        }

        // Try to refresh the token
        if (teacherTokenManager.getRefreshToken()) {
          try {
            await teacherTokenManager.refreshAccessToken();
            const teacherResponse = await teacherAPI.getCurrentTeacher();
            const teacherData = teacherResponse.data || teacherResponse;
            setTeacher(teacherData.teacher);

            // Also fetch quota info
            try {
              const quotaResponse = await teacherAPI.getQuota();
              setQuota(quotaResponse.data || quotaResponse);
            } catch (quotaErr) {
              console.warn('Failed to fetch quota:', quotaErr);
            }
            return;
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            teacherTokenManager.clearTokens();
          }
        }
      } catch (err) {
        console.error('Load teacher auth error:', err);
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
      const response = await teacherAPI.signUp({ email, password, firstName, lastName });

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
      const response = await teacherAPI.signIn({ email, password });

      if (!response.success) {
        throw new Error(response.error || 'Sign in failed');
      }

      const data = response.data || response;
      const teacherData = data.teacher;

      if (!teacherData) {
        throw new Error('Invalid login response: missing teacher data');
      }

      setTeacher(teacherData);
      setIsInitialized(true);

      // Fetch quota info after login
      try {
        const quotaResponse = await teacherAPI.getQuota();
        setQuota(quotaResponse.data || quotaResponse);
      } catch (quotaErr) {
        console.warn('Failed to fetch quota:', quotaErr);
      }

      return { success: true, teacher: teacherData };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google Sign-In function
  const googleSignIn = useCallback(async (idToken) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.googleSignIn(idToken);

      if (!response.success) {
        throw new Error(response.error || 'Google sign in failed');
      }

      const data = response.data || response;
      const teacherData = data.teacher;
      const isNewUser = data.isNewUser || false;

      if (!teacherData) {
        throw new Error('Invalid login response: missing teacher data');
      }

      setTeacher(teacherData);
      setIsInitialized(true);

      // Set quota from response (already included)
      if (data.quota) {
        setQuota(data.quota);
      } else {
        // Fetch quota info if not included
        try {
          const quotaResponse = await teacherAPI.getQuota();
          setQuota(quotaResponse.data || quotaResponse);
        } catch (quotaErr) {
          console.warn('Failed to fetch quota:', quotaErr);
        }
      }

      return { success: true, teacher: teacherData, isNewUser };
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
      await teacherAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Reset state
    setTeacher(null);
    setQuota(null);
    setError(null);
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (email, code) => {
    const response = await teacherAPI.verifyEmail(email, code);

    if (response.success && response.data?.teacher) {
      setTeacher(response.data.teacher);

      // Fetch quota info after verification
      try {
        const quotaResponse = await teacherAPI.getQuota();
        setQuota(quotaResponse.data || quotaResponse);
      } catch (quotaErr) {
        console.warn('Failed to fetch quota:', quotaErr);
      }
    }

    return response;
  }, []);

  // Refresh auth (re-fetch teacher data)
  const refreshAuth = useCallback(async () => {
    try {
      const response = await teacherAPI.getCurrentTeacher();
      const teacherData = response.data || response;
      setTeacher(teacherData.teacher);

      // Also refresh quota
      try {
        const quotaResponse = await teacherAPI.getQuota();
        setQuota(quotaResponse.data || quotaResponse);
      } catch (quotaErr) {
        console.warn('Failed to fetch quota:', quotaErr);
      }
    } catch (err) {
      console.error('Refresh auth error:', err);
      setError(err.message);
    }
  }, []);

  // Refresh quota
  const refreshQuota = useCallback(async () => {
    try {
      const quotaResponse = await teacherAPI.getQuota();
      setQuota(quotaResponse.data || quotaResponse);
    } catch (err) {
      console.error('Refresh quota error:', err);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data) => {
    const response = await teacherAPI.updateProfile(data);
    if (response.success) {
      setTeacher(prev => ({ ...prev, ...data }));
    }
    return response;
  }, []);

  // Derived state
  const isAuthenticated = !!teacher;
  const needsEmailVerification = teacher && !teacher.emailVerified;
  const isReady = !isLoading && isInitialized;

  // Get subscription tier info
  const subscriptionInfo = useMemo(() => {
    if (!teacher) return null;
    return {
      tier: teacher.subscriptionTier || 'FREE',
      monthlyQuota: teacher.monthlyTokenQuota || 100000,
      currentUsage: teacher.currentMonthUsage || 0,
      quotaResetDate: teacher.quotaResetDate,
    };
  }, [teacher]);

  // Context value
  const value = useMemo(() => ({
    // State
    teacher,
    quota,
    isLoading,
    isInitialized,
    error,

    // Derived state
    isAuthenticated,
    needsEmailVerification,
    isReady,
    subscriptionInfo,

    // Auth actions
    signUp,
    signIn,
    googleSignIn,
    signOut,
    verifyEmail,
    refreshAuth,
    updateProfile,

    // Quota actions
    refreshQuota,
  }), [
    teacher,
    quota,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    needsEmailVerification,
    isReady,
    subscriptionInfo,
    signUp,
    signIn,
    googleSignIn,
    signOut,
    verifyEmail,
    refreshAuth,
    updateProfile,
    refreshQuota,
  ]);

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

// Custom hook
export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error('useTeacherAuth must be used within TeacherAuthProvider');
  }
  return context;
}

// Export context and hook
export { TeacherAuthContext };
export default TeacherAuthContext;
