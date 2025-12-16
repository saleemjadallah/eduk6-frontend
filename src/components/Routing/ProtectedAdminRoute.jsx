import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * ProtectedAdminRoute - Route wrapper that enforces admin authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {boolean} props.requireSuperAdmin - Whether to require SUPER_ADMIN role
 * @param {string} props.redirectTo - Custom redirect path for unauthenticated users
 */
const ProtectedAdminRoute = ({
  children,
  requireSuperAdmin = false,
  redirectTo = '/admin/login',
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    isReady,
    isSuperAdmin,
  } = useAdminAuth();

  // Show loading state while auth is initializing
  if (isLoading || !isReady) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>

        <style>{`
          .protected-route-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: 16px;
            background: #1a1a2e;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .protected-route-loading p {
            color: #9ca3af;
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Requires SUPER_ADMIN but user is not
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <Navigate
        to="/admin/analytics"
        state={{ error: 'Super admin privileges required' }}
        replace
      />
    );
  }

  // All checks passed - render the protected content
  return children || <Outlet />;
};

/**
 * PublicAdminRoute - Route wrapper for pages that should only be accessible when NOT logged in
 * (e.g., login page)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to render
 * @param {string} props.redirectTo - Where to redirect authenticated admins
 */
export const PublicAdminRoute = ({ children, redirectTo = '/admin/analytics' }) => {
  const { isAuthenticated, isLoading, isReady } = useAdminAuth();

  // Show loading state
  if (isLoading || !isReady) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>

        <style>{`
          .protected-route-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: 16px;
            background: #1a1a2e;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .protected-route-loading p {
            color: #9ca3af;
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export { ProtectedAdminRoute };
export default ProtectedAdminRoute;
