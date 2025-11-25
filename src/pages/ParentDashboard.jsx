import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const navigate = useNavigate();

  // Try to get auth context
  let currentUser = null;
  let children = [];
  try {
    const authContext = useAuth();
    currentUser = authContext?.currentUser;
    children = authContext?.children || [];
  } catch (e) {
    // AuthProvider not available
  }

  // Mock data for demonstration
  const stats = {
    totalLessons: 24,
    completedToday: 3,
    streakDays: 7,
    weeklyProgress: 85
  };

  const recentActivity = [
    { id: 1, child: 'Emma', action: 'Completed Math lesson', time: '2 hours ago', icon: '📐' },
    { id: 2, child: 'Emma', action: 'Earned "Quick Learner" badge', time: '3 hours ago', icon: '🏆' },
    { id: 3, child: 'Liam', action: 'Started Science exploration', time: '5 hours ago', icon: '🔬' },
    { id: 4, child: 'Emma', action: 'Asked Jeffrey about planets', time: '1 day ago', icon: '🪐' }
  ];

  const childSummaries = children.length > 0 ? children.map(child => ({
    id: child.id,
    name: child.name,
    avatar: child.avatar || '👧',
    age: child.age,
    lessonsCompleted: Math.floor(Math.random() * 20) + 5,
    currentStreak: Math.floor(Math.random() * 10) + 1,
    lastActive: 'Today',
    progress: Math.floor(Math.random() * 30) + 70
  })) : [
    { id: 1, name: 'Demo Child', avatar: '👧', age: 8, lessonsCompleted: 12, currentStreak: 5, lastActive: 'Today', progress: 78 }
  ];

  return (
    <div className="parent-dashboard">
      {/* Welcome section */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}!</h1>
          <p>Here's how your children are doing this week.</p>
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
        <div className="children-grid">
          {childSummaries.map(child => (
            <div key={child.id} className="child-card">
              <div className="child-header">
                <div className="child-avatar">{child.avatar}</div>
                <div className="child-info">
                  <h3>{child.name}</h3>
                  <span className="child-age">{child.age} years old</span>
                </div>
                <span className={`status-badge ${child.lastActive === 'Today' ? 'active' : ''}`}>
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
                    <div className="progress-fill" style={{ width: `${child.progress}%` }}></div>
                  </div>
                  <span className="mini-stat-label">{child.progress}% complete</span>
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
      </section>

      {/* Recent activity */}
      <section className="dashboard-activity">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-btn" onClick={() => navigate('/parent/reports')}>
            View Reports
          </button>
        </div>
        <div className="activity-list">
          {recentActivity.map(activity => (
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
