import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Route wrapper that enforces authentication and consent
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {boolean} props.requireConsent - Whether to require verified parental consent (default: true)
 * @param {boolean} props.requireProfile - Whether to require at least one child profile (default: true)
 * @param {boolean} props.parentOnly - Whether this route is for parents only (no child profile needed)
 * @param {string} props.redirectTo - Custom redirect path for unauthenticated users
 */
const ProtectedRoute = ({
  children,
  requireConsent = true,
  requireProfile = true,
  parentOnly = false,
  redirectTo = '/onboarding',
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    hasConsent,
    children: childProfiles,
    isLoading,
    isReady,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
  } = useAuth();

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
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #ffc107;
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

  // Not authenticated - redirect to onboarding/login
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
  if (needsEmailVerification) {
    return (
      <Navigate
        to="/onboarding"
        state={{ from: location.pathname, step: 'email_verification' }}
        replace
      />
    );
  }

  // Needs parental consent (if required)
  if (requireConsent && needsConsent) {
    return (
      <Navigate
        to="/onboarding"
        state={{ from: location.pathname, step: 'consent_method' }}
        replace
      />
    );
  }

  // Needs child profile (if required and not parent-only route)
  if (requireProfile && !parentOnly && needsChildProfile) {
    return (
      <Navigate
        to="/onboarding"
        state={{ from: location.pathname, step: 'create_profile' }}
        replace
      />
    );
  }

  // All checks passed - render the protected content
  return children;
};

/**
 * PublicOnlyRoute - Route wrapper for pages that should only be accessible when NOT logged in
 * (e.g., login page, signup page)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to render
 * @param {string} props.redirectTo - Where to redirect authenticated users (default: '/')
 */
export const PublicOnlyRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading, isReady, hasConsent, children: childProfiles } = useAuth();

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
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #ffc107;
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

  // If fully set up, redirect to main app
  if (isAuthenticated && hasConsent && childProfiles.length > 0) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authenticated but not fully set up, redirect to onboarding
  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
