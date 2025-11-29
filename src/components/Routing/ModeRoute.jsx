import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';

/**
 * ModeRoute - Route wrapper that enforces mode-based access control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render
 * @param {'child' | 'parent'} props.mode - Required mode for this route
 * @param {boolean} props.requireConsent - Whether to require verified parental consent
 */
const ModeRoute = ({
  children,
  mode,
  requireConsent = true,
}) => {
  const location = useLocation();

  // Try to get auth context
  let authContext = { isAuthenticated: false, hasConsent: false, isLoading: true };
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthProvider not available
  }

  // Try to get mode context
  let modeContext = { currentMode: 'child', parentPinVerified: false };
  try {
    modeContext = useMode();
  } catch (e) {
    // ModeProvider not available
  }

  const { isAuthenticated, hasConsent, isLoading } = authContext;
  const { currentMode, isParentMode } = modeContext;

  if (isLoading) {
    return (
      <div className="mode-route-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>

        <style>{`
          .mode-route-loading {
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

          .mode-route-loading p {
            color: #666;
            font-size: 0.9375rem;
          }
        `}</style>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Check consent if required
  if (requireConsent && !hasConsent) {
    return <Navigate to="/onboarding" state={{ step: 'consent_method' }} replace />;
  }

  // Check mode access
  if (mode === 'parent' && !isParentMode) {
    // Trying to access parent route without PIN verification
    return <Navigate to="/parent/verify-pin" state={{ from: location }} replace />;
  }

  // Parent can access child routes (for viewing child's experience)
  // Child mode cannot access parent routes (handled above)

  return <>{children}</>;
};

export default ModeRoute;
