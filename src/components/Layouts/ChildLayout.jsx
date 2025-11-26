import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChildNavigation, ModeSwitcher } from '../Navigation';
import { ProfileSwitcher } from '../Profile';
import './ChildLayout.css';

const ChildLayout = () => {
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
      {/* Header */}
      <header className="child-header">
        <div className="child-header-left">
          <div className="app-logo">
            <img src="/assets/orbit-learn-logo-icon3.png" alt="Orbit Learn" className="logo-image" />
          </div>
          <div className="logo-spacer"></div> {/* Spacer for absolute positioned logo */}
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
        <Outlet />
      </main>

      {/* Floating Jeffrey helper for younger children */}
      {currentProfile && currentProfile.age <= 8 && (
        <div className="jeffrey-helper">
          <div className="jeffrey-avatar">
            <span>🤖</span>
          </div>
          <button className="help-button">Need help?</button>
        </div>
      )}
    </div>
  );
};

export default ChildLayout;
