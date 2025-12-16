import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api/adminAPI';
import {
  KPICards,
  CohortRetentionTable,
  SubscriptionFunnel,
  ActiveUsersChart,
  RevenueChart,
} from '../../components/admin/charts';

/**
 * AnalyticsDashboard - Main dashboard page for VC Analytics
 * Displays all key metrics in a single view
 */
const AnalyticsDashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [activeUsersData, setActiveUsersData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);

  const [isLoading, setIsLoading] = useState({
    overview: true,
    cohorts: true,
    activeUsers: true,
    revenue: true,
    funnel: true,
  });

  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setError(null);

    try {
      // Fetch all data in parallel
      const [overview, cohorts, activeUsers, revenue, funnel, mrrSeries] = await Promise.all([
        adminAPI.getOverview().catch(err => { console.error('Overview error:', err); return null; }),
        adminAPI.getCohortRetention(12).catch(err => { console.error('Cohorts error:', err); return null; }),
        adminAPI.getActiveUsers(30).catch(err => { console.error('Active users error:', err); return null; }),
        adminAPI.getRevenue().catch(err => { console.error('Revenue error:', err); return null; }),
        adminAPI.getConversionFunnel().catch(err => { console.error('Funnel error:', err); return null; }),
        adminAPI.getMRRSeries(12).catch(err => { console.error('MRR series error:', err); return null; }),
      ]);

      // Set data
      if (overview?.data) {
        setOverviewData(overview.data);
        setIsLoading(prev => ({ ...prev, overview: false }));
      }

      if (cohorts?.data) {
        setCohortData(cohorts.data);
        setIsLoading(prev => ({ ...prev, cohorts: false }));
      }

      if (activeUsers?.data) {
        setActiveUsersData(activeUsers.data);
        setIsLoading(prev => ({ ...prev, activeUsers: false }));
      }

      if (revenue?.data && mrrSeries?.data) {
        setRevenueData({
          ...revenue.data,
          mrrSeries: mrrSeries.data,
        });
        setIsLoading(prev => ({ ...prev, revenue: false }));
      }

      if (funnel?.data) {
        setFunnelData(funnel.data);
        setIsLoading(prev => ({ ...prev, funnel: false }));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setIsLoading({
        overview: false,
        cohorts: false,
        activeUsers: false,
        revenue: false,
        funnel: false,
      });
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading({
      overview: true,
      cohorts: true,
      activeUsers: true,
      revenue: true,
      funnel: true,
    });
    fetchDashboardData();
  };

  return (
    <div className="analytics-dashboard">
      {/* Header with refresh */}
      <div className="dashboard-actions">
        <div className="last-updated">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
        <button className="refresh-btn" onClick={handleRefresh}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="dashboard-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <section id="overview" className="dashboard-section">
        <KPICards data={overviewData} isLoading={isLoading.overview} />
      </section>

      {/* Main charts row */}
      <section id="users" className="dashboard-section charts-row">
        <div className="chart-column wide">
          <ActiveUsersChart data={activeUsersData} isLoading={isLoading.activeUsers} />
        </div>
        <div className="chart-column">
          <SubscriptionFunnel data={funnelData} isLoading={isLoading.funnel} />
        </div>
      </section>

      {/* Revenue section */}
      <section id="revenue" className="dashboard-section">
        <RevenueChart data={revenueData} isLoading={isLoading.revenue} />
      </section>

      {/* Cohort retention table */}
      <section id="cohorts" className="dashboard-section">
        <CohortRetentionTable data={cohortData} isLoading={isLoading.cohorts} />
      </section>

      <style>{`
        .analytics-dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .last-updated {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #2d2d44;
          border: 2px solid #3d3d5c;
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .refresh-btn:hover {
          background: #3d3d5c;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
        }

        .dashboard-error button {
          margin-left: auto;
          padding: 6px 12px;
          background: #ef4444;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .dashboard-section {
          /* Section spacing handled by gap */
        }

        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .chart-column.wide {
          min-width: 0;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-actions {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
