import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentDashboardAPI } from '../services/api/parentDashboardAPI';
import './ParentDashboard.css';

const ParentDashboard = () => {
  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('[ParentDashboard] MOUNTED');
    return () => console.log('[ParentDashboard] UNMOUNTED');
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Try to get auth context
  let currentUser = null;
  try {
    const authContext = useAuth();
    currentUser = authContext?.user;
  } catch (e) {
    // AuthProvider not available
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await parentDashboardAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="parent-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="parent-dashboard">
        <div className="dashboard-error">
          <p>Unable to load dashboard data</p>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const stats = dashboardData?.stats || {
    totalLessons: 0,
    completedToday: 0,
    streakDays: 0,
    weeklyProgress: 0,
  };

  const childrenData = dashboardData?.children || [];
  const recentActivity = dashboardData?.recentActivity || [];

  // Check if there are no children yet
  const hasChildren = childrenData.length > 0;

  return (
    <div className="parent-dashboard">
      {/* Welcome section */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}!</h1>
          <p>
            {hasChildren
              ? "Here's how your children are doing this week."
              : 'Get started by adding your first child profile.'}
          </p>
        </div>
        <button className="add-child-btn" onClick={() => navigate('/parent/children')}>
          <span>+</span> Add Child
        </button>
      </section>

      {/* Stats overview */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalLessons}</span>
            <span className="stat-label">Total Lessons</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedToday}</span>
            <span className="stat-label">Completed Today</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.streakDays}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-value">{stats.weeklyProgress}%</span>
            <span className="stat-label">Weekly Goal</span>
          </div>
        </div>
      </section>

      {/* Children overview */}
      <section className="dashboard-children">
        <div className="section-header">
          <h2>Your Children</h2>
          <button className="view-all-btn" onClick={() => navigate('/parent/children')}>
            View All
          </button>
        </div>
        {hasChildren ? (
          <div className="children-grid">
            {childrenData.map((child) => (
              <div key={child.id} className="child-card">
                <div className="child-header">
                  <div className="child-avatar">
                    {child.avatarUrl ? (
                      <img src={child.avatarUrl} alt={child.displayName} />
                    ) : (
                      getAvatarEmoji(child.ageGroup)
                    )}
                  </div>
                  <div className="child-info">
                    <h3>{child.displayName}</h3>
                    <span className="child-age">{child.age} years old</span>
                  </div>
                  <span className={`status-badge ${child.wasActiveToday ? 'active' : ''}`}>
                    {child.lastActive}
                  </span>
                </div>
                <div className="child-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-value">{child.lessonsCompleted}</span>
                    <span className="mini-stat-label">Lessons</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-value">{child.currentStreak}</span>
                    <span className="mini-stat-label">Streak</span>
                  </div>
                  <div className="mini-stat progress-stat">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, (child.lessonsCompleted / Math.max(1, child.lessonsCompleted + 5)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="mini-stat-label">Level {child.level}</span>
                  </div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/parent/children/${child.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No children added yet.</p>
            <button className="add-child-btn-inline" onClick={() => navigate('/parent/children')}>
              Add Your First Child
            </button>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="dashboard-activity">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-btn" onClick={() => navigate('/parent/reports')}>
            View Reports
          </button>
        </div>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <span className="activity-child">{activity.child}</span>
                  <span className="activity-action">{activity.action}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent activity yet. Start learning to see activity here!</p>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate('/parent/safety')}>
            <span className="action-icon">🛡️</span>
            <span className="action-label">Safety Settings</span>
          </button>
          <button className="action-card" onClick={() => navigate('/parent/reports')}>
            <span className="action-icon">📊</span>
            <span className="action-label">Progress Reports</span>
          </button>
          <button className="action-card" onClick={() => navigate('/parent/settings')}>
            <span className="action-icon">⚙️</span>
            <span className="action-label">Account Settings</span>
          </button>
          <button className="action-card" onClick={() => navigate('/parent/support')}>
            <span className="action-icon">💬</span>
            <span className="action-label">Get Support</span>
          </button>
        </div>
      </section>
    </div>
  );
};

// Helper function to get avatar emoji based on age group
function getAvatarEmoji(ageGroup) {
  return ageGroup === 'YOUNG' ? '🧒' : '👧';
}

export default ParentDashboard;
