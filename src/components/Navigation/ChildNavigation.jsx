import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ChildNavigation.css';

const ChildNavigation = () => {
  const navigate = useNavigate();

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

  const safeNavigate = (to, e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      navigate(to);
    } catch (err) {
      window.location.assign(to);
    }
  };

  return (
    <nav className="child-navigation">
      {getNavItems().map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={(e) => safeNavigate(item.to, e)}
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
