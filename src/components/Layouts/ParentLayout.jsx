import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { ParentNavigation, ModeSwitcher } from '../Navigation';
import './ParentLayout.css';

const ParentLayout = () => {
  const navigate = useNavigate();

  // Try to get auth context
  let currentUser = null;
  let children = [];
  try {
    const authContext = useAuth();
    currentUser = authContext?.currentUser;
    children = authContext?.children || [];
  } catch (e) {
    // AuthProvider not available
  }

  // Try to get mode context
  let switchToChildMode = () => {};
  try {
    const modeContext = useMode();
    switchToChildMode = modeContext?.switchToChildMode || (() => {});
  } catch (e) {
    // ModeProvider not available
  }

  const handleLogoClick = () => {
    navigate('/parent/dashboard');
  };

  const handleSwitchToChild = () => {
    switchToChildMode();
    navigate('/learn');
  };

  return (
    <div className="parent-layout">
      {/* Sidebar */}
      <aside className="parent-sidebar">
        <div className="sidebar-header">
          <button className="sidebar-logo" onClick={handleLogoClick}>
            <img src="/assets/orbit-learn-logo-icon3.png" alt="Orbit Learn" className="logo-image" />
          </button>
          <span className="parent-badge">Parent</span>
        </div>

        <ParentNavigation />

        <div className="sidebar-footer">
          <button className="switch-to-child-btn" onClick={handleSwitchToChild}>
            <span className="btn-icon">👧</span>
            <span className="btn-text">Switch to Child View</span>
          </button>

          {currentUser && (
            <div className="parent-info">
              <span className="parent-name">{currentUser.displayName || currentUser.email}</span>
              <span className="child-count">{children.length} {children.length === 1 ? 'child' : 'children'}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="parent-main-wrapper">
        {/* Top bar */}
        <header className="parent-topbar">
          <div className="topbar-left">
            <h1 className="page-title">Parent Dashboard</h1>
          </div>

          <div className="topbar-right">
            <ModeSwitcher />

            {currentUser && (
              <div className="user-menu">
                <div className="user-avatar">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" />
                  ) : (
                    <span>{(currentUser.displayName || currentUser.email || 'P')[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="parent-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
