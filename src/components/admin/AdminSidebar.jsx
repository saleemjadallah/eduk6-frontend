import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Icons as simple SVG components
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const TableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/**
 * AdminSidebar - Navigation sidebar for admin dashboard
 */
const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, signOut, isSuperAdmin } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Overview',
      path: '/admin/analytics',
      hash: '#overview',
      icon: <DashboardIcon />,
    },
    {
      label: 'Active Users',
      path: '/admin/analytics',
      hash: '#users',
      icon: <UsersIcon />,
    },
    {
      label: 'Cohort Retention',
      path: '/admin/analytics',
      hash: '#cohorts',
      icon: <TableIcon />,
    },
    {
      label: 'Revenue',
      path: '/admin/analytics',
      hash: '#revenue',
      icon: <DollarIcon />,
    },
  ];

  const handleNavClick = (e, hash) => {
    if (hash) {
      e.preventDefault();
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Update URL without navigation
      window.history.pushState(null, '', `/admin/analytics${hash}`);
    }
  };

  const adminItems = [
    {
      label: 'Manage Admins',
      path: '/admin/settings/admins',
      icon: <AdminIcon />,
      requireSuperAdmin: true,
    },
    {
      label: 'Settings',
      path: '/admin/settings',
      icon: <SettingsIcon />,
    },
  ];

  const isActive = (path) => {
    if (path === '/admin/analytics') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="url(#grad1)" />
            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!isCollapsed && (
          <div className="logo-text">
            <span className="logo-title">OrbitLearn</span>
            <span className="logo-subtitle">Analytics</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Analytics</span>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.hash || item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.hash === item.hash || (location.pathname === item.path && !location.hash && item.hash === '#overview') ? 'active' : ''}`}
                  title={item.label}
                  onClick={(e) => handleNavClick(e, item.hash)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">Settings</span>
          <ul className="nav-list">
            {adminItems
              .filter(item => !item.requireSuperAdmin || isSuperAdmin)
              .map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    title={item.label}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>

      {/* User section */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <span className="user-name">{admin?.name || 'Admin'}</span>
              <span className="user-role">
                {admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Analyst'}
              </span>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          <LogoutIcon />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>

      <style>{`
        .admin-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: #1a1a2e;
          border-right: 3px solid #2d2d44;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: width 0.2s ease;
        }

        .admin-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          border-bottom: 1px solid #2d2d44;
        }

        .logo-icon {
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 20px 12px;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 12px;
          margin-bottom: 8px;
          display: block;
        }

        .collapsed .nav-section-title {
          display: none;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.15s ease;
          margin-bottom: 4px;
        }

        .nav-link:hover {
          background: #2d2d44;
          color: #ffffff;
        }

        .nav-link.active {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nav-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          white-space: nowrap;
        }

        .collapsed .nav-label {
          display: none;
        }

        .collapsed .nav-link {
          justify-content: center;
          padding: 12px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #2d2d44;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
        }

        .user-role {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: #2d2d44;
          border: 2px solid #3d3d5c;
          border-radius: 8px;
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .logout-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
        }

        .collapsed .logout-btn span {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 80px;
          }

          .logo-text,
          .nav-label,
          .user-info,
          .logout-btn span {
            display: none;
          }

          .nav-link {
            justify-content: center;
            padding: 12px;
          }
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
