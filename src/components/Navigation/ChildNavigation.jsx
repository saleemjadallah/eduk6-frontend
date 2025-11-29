import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './ChildNavigation.css';

const ChildNavigation = () => {
  const navigate = useNavigate();

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
          // Explicitly drive navigation through the router to avoid cases where
          // the browser updates the URL without React Router rendering the route.
          onClick={(e) => {
            e.preventDefault();
            console.log('[ChildNavigation] Click', { to: item.to, before: window.location.href });
            navigate(item.to, { replace: item.to === '/learn' });
            setTimeout(() => {
              console.log('[ChildNavigation] After navigate', { to: item.to, href: window.location.href });
            }, 0);
          }}
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
