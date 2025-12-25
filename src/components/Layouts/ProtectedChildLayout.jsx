import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ChildNavigation, ModeSwitcher } from '../Navigation';
import { ProfileSwitcher } from '../Profile';
import './ChildLayout.css';

/**
 * ProtectedChildLayout - Combined layout with built-in auth protection
 * This is the React Router v7 recommended pattern: auth logic in the layout itself
 */
const ProtectedChildLayout = () => {
  const location = useLocation();

  const {
    isAuthenticated,
    hasConsent,
    isLoading,
    isReady,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
    currentProfile,
  } = useAuth();

  // Show loading while auth initializes
  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-yellow-400 rounded-full" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Needs email verification
  if (needsEmailVerification) {
    return <Navigate to="/onboarding" state={{ step: 'email_verification' }} replace />;
  }

  // Needs consent
  if (needsConsent) {
    return <Navigate to="/onboarding" state={{ step: 'consent_method' }} replace />;
  }

  // Needs child profile
  if (needsChildProfile) {
    return <Navigate to="/onboarding" state={{ step: 'create_profile' }} replace />;
  }

  // Age-based UI class
  const getLayoutClass = () => {
    if (!currentProfile) return 'child-layout';
    const age = currentProfile.age;
    if (age <= 6) return 'child-layout young-learner';
    if (age <= 9) return 'child-layout middle-learner';
    return 'child-layout older-learner';
  };

  return (
    <div className={getLayoutClass()}>
      {/* Cloud Background */}
      <CloudBackground />

      {/* Header */}
      <header className="child-header">
        <div className="child-header-left">
          <div className="app-logo">
            <img src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png" alt="Orbit Learn" className="logo-image" style={{ borderRadius: '12px' }} />
          </div>
        </div>

        <div className="child-header-center">
          <ChildNavigation />
        </div>

        <div className="child-header-right">
          <ProfileSwitcher compact />
          <ModeSwitcher />
        </div>
      </header>

      {/* Main content - Outlet renders child routes */}
      {/* Wrapping in keyed div forces React to remount child route components */}
      <main className="child-main" key={location.pathname}>
        <Outlet />
      </main>

      {/* Floating Ollie helper for younger children */}
      {currentProfile && currentProfile.age <= 8 && (
        <div className="ollie-helper">
          <div className="ollie-avatar">
            <span>🤖</span>
          </div>
          <button className="help-button">Need help?</button>
        </div>
      )}
    </div>
  );
};

// Cloud background component
const CloudBackground = () => {
  return (
    <div className="cloud-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="cloud-top"
      >
        <img
          src="/assets/images/clouds/cloud_backdrop_top.png"
          alt=""
          className="cloud-image cloud-fade-down"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        className="cloud-bottom"
      >
        <img
          src="/assets/images/clouds/cloud_backdrop_bottom.png"
          alt=""
          className="cloud-image cloud-fade-up"
        />
      </motion.div>

      <motion.img
        src="/assets/images/clouds/cloud_single_1.png"
        alt=""
        className="cloud-float cloud-float-1"
        animate={{ x: [0, 15, 0], y: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.img
        src="/assets/images/clouds/cloud_single_2.png"
        alt=""
        className="cloud-float cloud-float-2"
        animate={{ x: [0, -20, 0], y: [0, 8, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.img
        src="/assets/images/clouds/cloud_single_1.png"
        alt=""
        className="cloud-float cloud-float-3"
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ProtectedChildLayout;
