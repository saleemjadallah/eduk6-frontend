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

  // Navigation items - Dashboard and Progress only
  const getNavItems = () => {
    return [
      { to: '/learn', label: 'Dashboard', icon: '🏠', end: true },
      { to: '/learn/achievements', label: 'Progress', icon: '📈' },
    ];
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
