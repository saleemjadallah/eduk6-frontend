import React from 'react';
import { NavLink } from 'react-router-dom';
import './ChildNavigation.css';

const ChildNavigation = () => {
  // Navigation items - Dashboard and Progress only
  const navItems = [
    { to: '/learn', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/learn/achievements', label: 'Progress', icon: '📈' },
  ];

  return (
    <nav className="child-navigation">
      {navItems.map(item => (
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
