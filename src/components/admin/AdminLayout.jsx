import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * AdminLayout - Main layout wrapper for the admin dashboard
 * Uses a dark theme with neo-brutalist design elements
 */
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { admin } = useAdminAuth();

  // Get current page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/analytics')) return 'Analytics Dashboard';
    if (path.includes('/cohorts')) return 'Cohort Analysis';
    if (path.includes('/revenue')) return 'Revenue Metrics';
    if (path.includes('/admins')) return 'Admin Management';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-page-title">{getPageTitle()}</h1>
            <div className="admin-header-actions">
              <span className="admin-user-badge">
                {admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Analyst'}
              </span>
              <span className="admin-user-email">{admin?.email}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #0f0f1a;
          color: #f5f5f5;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 260px;
          min-width: 0;
        }

        .admin-header {
          background: #1a1a2e;
          border-bottom: 3px solid #2d2d44;
          padding: 20px 32px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1600px;
          margin: 0 auto;
        }

        .admin-page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-user-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-user-email {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .admin-content {
          flex: 1;
          padding: 32px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        /* Neo-brutalist card style used throughout */
        .admin-card {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          padding: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .admin-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 #000;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 80px;
          }
        }

        @media (max-width: 768px) {
          .admin-main {
            margin-left: 0;
          }

          .admin-header {
            padding: 16px 20px;
          }

          .admin-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
