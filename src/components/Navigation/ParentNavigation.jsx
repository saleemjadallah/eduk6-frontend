import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ParentNavigation.css';

const ParentNavigation = () => {
  const navigate = useNavigate();

  // Try to get auth context
  let childCount = 0;
  try {
    const authContext = useAuth();
    childCount = authContext?.children?.length || 0;
  } catch (e) {
    // AuthProvider not available
  }

  const navSections = [
    {
      title: 'Overview',
      items: [
        { to: '/parent/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/parent/children', label: 'My Children', icon: '👧', badge: childCount },
      ]
    },
    {
      title: 'Learning',
      items: [
        { to: '/parent/reports', label: 'Progress Reports', icon: '📈' },
        { to: '/parent/safety', label: 'Safety Logs', icon: '🛡️' },
      ]
    },
    {
      title: 'Account',
      items: [
        { to: '/parent/settings', label: 'Settings', icon: '⚙️' },
        { to: '/parent/privacy', label: 'Privacy Controls', icon: '🔒' },
        { to: '/parent/billing', label: 'Subscription', icon: '💳' },
      ]
    },
    {
      title: 'Help',
      items: [
        { to: '/parent/support', label: 'Support', icon: '💬' },
      ]
    }
  ];

  return (
    <nav className="parent-navigation">
      {navSections.map((section, idx) => (
        <div key={idx} className="nav-section">
          <h3 className="nav-section-title">{section.title}</h3>
          <ul className="nav-section-items">
            {section.items.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('[ParentNavigation] Click', { to: item.to, before: window.location.href });
                    navigate(item.to);
                    setTimeout(() => {
                      console.log('[ParentNavigation] After navigate', { to: item.to, href: window.location.href });
                    }, 0);
                  }}
                  className={({ isActive }) =>
                    `parent-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default ParentNavigation;
