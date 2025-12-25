import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ChildNavigation, ModeSwitcher } from '../Navigation';
import { ProfileSwitcher } from '../Profile';
import DashboardFooter from '../common/DashboardFooter';
// SuggestionBox moved to dashboard page directly
import './ChildLayout.css';

// Cloud background using AI-generated images from Gemini
const CloudBackground = () => {
  return (
    <div className="cloud-background">
      {/* Top cloud backdrop - fades down */}
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

      {/* Bottom cloud backdrop - fades up */}
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

      {/* Floating individual clouds with gentle animation */}
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

const ChildLayout = () => {
  const location = useLocation();

  // Try to get auth context
  let currentProfile = null;
  try {
    const authContext = useAuth();
    currentProfile = authContext?.currentProfile;
  } catch (e) {
    // AuthProvider not available
  }

  // Age-based UI class
  const getLayoutClass = () => {
    if (!currentProfile) return 'child-layout';

    const age = currentProfile.age;
    if (age <= 6) {
      return 'child-layout young-learner';
    } else if (age <= 9) {
      return 'child-layout middle-learner';
    } else {
      return 'child-layout older-learner';
    }
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

      {/* Main content */}
      <main className="child-main">
        <Outlet key={location.pathname} />
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

      {/* Footer - child-friendly variant */}
      <DashboardFooter variant="child" />
    </div>
  );
};

export default ChildLayout;
