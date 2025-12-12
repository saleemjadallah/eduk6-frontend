import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentDashboardAPI } from '../services/api/parentDashboardAPI';
import { subscriptionAPI } from '../services/api/subscriptionAPI';
import UsageWarningBanner from '../components/Parent/UsageWarningBanner';
import './ParentDashboard.css';

// Avatar mapping - matches CreateProfileStep
const AVATARS = {
  avatar_1: { name: 'Cool Cat', emoji: '🐱' },
  avatar_2: { name: 'Happy Dog', emoji: '🐶' },
  avatar_3: { name: 'Smart Owl', emoji: '🦉' },
  avatar_4: { name: 'Brave Lion', emoji: '🦁' },
  avatar_5: { name: 'Friendly Panda', emoji: '🐼' },
  avatar_6: { name: 'Curious Bunny', emoji: '🐰' },
  avatar_7: { name: 'Playful Penguin', emoji: '🐧' },
  avatar_8: { name: 'Mighty Elephant', emoji: '🐘' },
};

// Get avatar emoji from avatarId/avatarUrl
function getAvatarEmoji(avatarId) {
  if (avatarId && AVATARS[avatarId]) {
    return AVATARS[avatarId].emoji;
  }
  return '🧒'; // Default fallback
}

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
  const [usageData, setUsageData] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Try to get auth context
  let currentUser = null;
  try {
    const authContext = useAuth();
    currentUser = authContext?.user;
  } catch (e) {
    // AuthProvider not available
  }

  // Fetch dashboard data and usage info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch dashboard data and subscription/usage in parallel
        const [dashboardRes, subscriptionRes] = await Promise.all([
          parentDashboardAPI.getDashboard(),
          subscriptionAPI.getSubscription().catch(() => null), // Don't fail if subscription fetch fails
        ]);

        if (dashboardRes.success) {
          setDashboardData(dashboardRes.data);
        } else {
          setError('Failed to load dashboard data');
        }

        // Set usage data if available
        if (subscriptionRes?.success && subscriptionRes.data?.usage) {
          setUsageData(subscriptionRes.data.usage);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

      {/* Usage warning banner - shows when approaching or at limit */}
      {!bannerDismissed && usageData && (
        <UsageWarningBanner
          usage={usageData}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

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
              <div key={child.id} className="child-card-new">
                <div className="child-card-top">
                  <div className="child-avatar-large">
                    {getAvatarEmoji(child.avatarUrl)}
                  </div>
                  <div className="child-details">
                    <h3 className="child-name">{child.displayName}</h3>
                    <span className="child-age-text">{child.age} years old</span>
                  </div>
                  <span className={`activity-badge ${child.wasActiveToday ? 'active-today' : ''}`}>
                    {child.lastActive}
                  </span>
                </div>

                <div className="child-stats-row">
                  <div className="stat-item">
                    <span className="stat-icon-small">📚</span>
                    <div className="stat-content">
                      <span className="stat-number">{child.lessonsCompleted}</span>
                      <span className="stat-text">Lessons</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon-small">🔥</span>
                    <div className="stat-content">
                      <span className="stat-number">{child.currentStreak}</span>
                      <span className="stat-text">Day Streak</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon-small">⭐</span>
                    <div className="stat-content">
                      <span className="stat-number">{child.level}</span>
                      <span className="stat-text">Level</span>
                    </div>
                  </div>
                </div>

                <button
                  className="view-details-btn-new"
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

export default ParentDashboard;
