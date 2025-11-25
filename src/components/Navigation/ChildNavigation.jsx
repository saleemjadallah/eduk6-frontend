import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ChildNavigation.css';

const ChildNavigation = () => {
  // Try to get auth context
  let currentProfile = null;
  try {
    const authContext = useAuth();
    currentProfile = authContext?.currentProfile;
  } catch (e) {
    // AuthProvider not available
  }

  // Age-appropriate navigation items
  const getNavItems = () => {
    const baseItems = [
      { to: '/learn', label: 'Home', icon: '🏠', end: true },
      { to: '/learn/chat', label: 'Chat', icon: '💬' },
      { to: '/learn/flashcards', label: 'Practice', icon: '🎴' },
      { to: '/learn/badges', label: 'Badges', icon: '🏆' },
    ];

    // Only show upload for older kids who can read
    if (currentProfile && currentProfile.age >= 7) {
      baseItems.splice(2, 0, {
        to: '/learn/upload',
        label: 'Upload',
        icon: '📤'
      });
    }

    return baseItems;
  };

  return (
    <nav className="child-navigation">
      {getNavItems().map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `child-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default ChildNavigation;
