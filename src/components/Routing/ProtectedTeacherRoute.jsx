import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

/**
 * ProtectedTeacherRoute - Route wrapper that enforces teacher authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {boolean} props.requireEmailVerification - Whether to require verified email (default: true)
 * @param {string} props.redirectTo - Custom redirect path for unauthenticated users
 */
const ProtectedTeacherRoute = ({
  children,
  requireEmailVerification = true,
  redirectTo = '/teacher/login',
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    isReady,
    needsEmailVerification,
  } = useTeacherAuth();

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
            background: linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .protected-route-loading p {
            color: #666;
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

  // Needs email verification
  if (requireEmailVerification && needsEmailVerification) {
    return (
      <Navigate
        to="/teacher/verify-email"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // All checks passed - render the protected content
  return children || <Outlet />;
};

/**
 * PublicTeacherRoute - Route wrapper for pages that should only be accessible when NOT logged in as a teacher
 * (e.g., login page, signup page)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to render
 * @param {string} props.redirectTo - Where to redirect authenticated teachers (default: '/teacher/dashboard')
 */
export const PublicTeacherRoute = ({ children, redirectTo = '/teacher/dashboard' }) => {
  const { isAuthenticated, isLoading, isReady, needsEmailVerification } = useTeacherAuth();

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
            background: linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .protected-route-loading p {
            color: #666;
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  // If authenticated and verified, redirect to dashboard
  if (isAuthenticated && !needsEmailVerification) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authenticated but needs verification, redirect to verify
  if (isAuthenticated && needsEmailVerification) {
    return <Navigate to="/teacher/verify-email" replace />;
  }

  return children;
};

export default ProtectedTeacherRoute;
