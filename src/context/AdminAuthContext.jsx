import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI, adminTokenManager } from '../services/api/adminAPI';

// Create context
const AdminAuthContext = createContext(null);

// Provider component
export function AdminAuthProvider({ children }) {
  // State
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Load auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Initialize token manager
        const { hasAccessToken } = adminTokenManager.initialize();

        if (!hasAccessToken && !adminTokenManager.getRefreshToken()) {
          // No tokens at all - user needs to log in
          return;
        }

        // Try to get current admin with existing token
        if (hasAccessToken) {
          try {
            const response = await adminAPI.getCurrentAdmin();
            const adminData = response.data || response;
            setAdmin(adminData);
            return;
          } catch (err) {
            console.log('Access token invalid, attempting refresh...');
          }
        }

        // Try to refresh the token
        if (adminTokenManager.getRefreshToken()) {
          try {
            await adminTokenManager.refreshAccessToken();
            const adminResponse = await adminAPI.getCurrentAdmin();
            const adminData = adminResponse.data || adminResponse;
            setAdmin(adminData);
            return;
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            adminTokenManager.clearTokens();
          }
        }
      } catch (err) {
        console.error('Load admin auth error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadAuth();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.signIn({ email, password });

      if (!response.success) {
        throw new Error(response.error || 'Sign in failed');
      }

      const data = response.data || response;
      const adminData = data.admin;

      if (!adminData) {
        throw new Error('Invalid login response: missing admin data');
      }

      setAdmin(adminData);
      setIsInitialized(true);

      return { success: true, admin: adminData };
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
      await adminAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Reset state
    setAdmin(null);
    setError(null);
  }, []);

  // Refresh auth (re-fetch admin data)
  const refreshAuth = useCallback(async () => {
    try {
      const response = await adminAPI.getCurrentAdmin();
      const adminData = response.data || response;
      setAdmin(adminData);
    } catch (err) {
      console.error('Refresh auth error:', err);
      setError(err.message);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const response = await adminAPI.changePassword(currentPassword, newPassword);
    return response;
  }, []);

  // Derived state
  const isAuthenticated = !!admin;
  const isReady = !isLoading && isInitialized;
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  // Context value
  const value = useMemo(() => ({
    // State
    admin,
    isLoading,
    isInitialized,
    error,

    // Derived state
    isAuthenticated,
    isReady,
    isSuperAdmin,

    // Auth actions
    signIn,
    signOut,
    refreshAuth,
    changePassword,
  }), [
    admin,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    isReady,
    isSuperAdmin,
    signIn,
    signOut,
    refreshAuth,
    changePassword,
  ]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Custom hook
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

// Export context and hook
export { AdminAuthContext };
export default AdminAuthContext;
