import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childStatsAPI } from '../services/api/childStatsAPI';
import { parentDashboardAPI } from '../services/api/parentDashboardAPI';
import { profileAPI } from '../services/api/profileAPI';
import EditChildModal from '../components/Parent/EditChildModal';
import ResetPinModal from '../components/Parent/ResetPinModal';
import './ChildDetailsPage.css';

const ChildDetailsPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all data for the child
  const fetchChildData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile, stats, and activity in parallel
      const [profileRes, statsRes, activityRes] = await Promise.all([
        profileAPI.getProfile(childId),
        childStatsAPI.getChildStats(childId),
        parentDashboardAPI.getChildActivity(childId, 20),
      ]);

      if (profileRes.success) {
        // Calculate age from profile data
        const profile = profileRes.data;
        setChild(profile);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (activityRes.success) {
        setActivity(activityRes.data.activities || []);
      }
    } catch (err) {
      console.error('Failed to fetch child data:', err);
      setError(err.message || 'Failed to load child data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchChildData();
  };

  const handleDelete = () => {
    navigate('/parent/children');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="child-details-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="child-details-page">
        <div className="page-error">
          <p>Unable to load profile</p>
          <p className="error-message">{error}</p>
          <button onClick={fetchChildData}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="child-details-page">
        <div className="page-error">
          <p>Child not found</p>
          <button onClick={() => navigate('/parent/children')}>Back to Children</button>
        </div>
      </div>
    );
  }

  const getAvatarEmoji = (avatarUrl, ageGroup) => {
    if (avatarUrl && avatarUrl.startsWith('avatar_')) {
      const avatarMap = {
        avatar_1: '🐱',
        avatar_2: '🐶',
        avatar_3: '🦉',
        avatar_4: '🦁',
        avatar_5: '🐼',
        avatar_6: '🐰',
        avatar_7: '🐧',
        avatar_8: '🐘',
      };
      return avatarMap[avatarUrl] || (ageGroup === 'YOUNG' ? '🧒' : '👧');
    }
    return ageGroup === 'YOUNG' ? '🧒' : '👧';
  };

  const getGradeLabel = (grade) => {
    if (grade === 0) return 'Pre-K';
    return `Grade ${grade}`;
  };

  const getLearningStyleInfo = (style) => {
    const styles = {
      VISUAL: { label: 'Visual Learner', icon: '👁️', description: 'Learns best with pictures and diagrams' },
      AUDITORY: { label: 'Auditory Learner', icon: '👂', description: 'Learns best by listening' },
      READING: { label: 'Reading/Writing', icon: '📖', description: 'Learns best through reading and writing' },
      KINESTHETIC: { label: 'Hands-on Learner', icon: '✋', description: 'Learns best by doing activities' },
    };
    return styles[style] || { label: style, icon: '📚', description: '' };
  };

  const getCurriculumLabel = (type) => {
    const curricula = {
      AMERICAN: 'American (Common Core)',
      BRITISH: 'British (IGCSE)',
      INDIAN_CBSE: 'Indian (CBSE)',
      INDIAN_ICSE: 'Indian (ICSE)',
      IB: 'International Baccalaureate',
      ARABIC: 'Arabic Curriculum',
    };
    return curricula[type] || type;
  };

  const learningStyle = getLearningStyleInfo(child.learningStyle);

  return (
    <div className="child-details-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/parent/children')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Children
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {child.avatarUrl && !child.avatarUrl.startsWith('avatar_') ? (
            <img src={child.avatarUrl} alt={child.displayName} />
          ) : (
            <span className="avatar-emoji">
              {getAvatarEmoji(child.avatarUrl, child.ageGroup)}
            </span>
          )}
        </div>
        <div className="profile-info">
          <h1>{child.displayName}</h1>
          <div className="profile-meta">
            <span className="meta-item">
              <span className="meta-icon">🎂</span>
              {child.ageGroup === 'YOUNG' ? '4-7' : '8-12'} years old
            </span>
            <span className="meta-item">
              <span className="meta-icon">📚</span>
              {getGradeLabel(child.gradeLevel)}
            </span>
            <span className="meta-item">
              <span className="meta-icon">{learningStyle.icon}</span>
              {learningStyle.label}
            </span>
          </div>
        </div>
        <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-value">{stats.xp.toLocaleString()}</span>
              <span className="stat-label">Total XP</span>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.percentToNextLevel}%` }}
                ></div>
              </div>
              <span className="progress-text">{stats.xpToNextLevel} XP to Level {stats.level + 1}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <span className="stat-value">{stats.level}</span>
              <span className="stat-label">Current Level</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-value">{stats.streak?.current || 0}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            {stats.streak?.longest > 0 && (
              <span className="stat-badge">Best: {stats.streak.longest}</span>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <span className="stat-value">{stats.lessonsCompleted}</span>
              <span className="stat-label">Lessons Done</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <span className="stat-value">{stats.badgesEarned}</span>
              <span className="stat-label">Badges Earned</span>
            </div>
            <span className="stat-badge secondary">{stats.totalBadges} available</span>
          </div>
        </div>
      )}

      {/* XP Stats (Today/Week/Month) */}
      {stats?.xpStats && (
        <div className="xp-breakdown">
          <h3>XP Progress</h3>
          <div className="xp-cards">
            <div className="xp-card">
              <span className="xp-period">Today</span>
              <span className="xp-value">{stats.xpStats.todayXP}</span>
              <span className="xp-unit">XP</span>
            </div>
            <div className="xp-card">
              <span className="xp-period">This Week</span>
              <span className="xp-value">{stats.xpStats.weekXP}</span>
              <span className="xp-unit">XP</span>
            </div>
            <div className="xp-card">
              <span className="xp-period">This Month</span>
              <span className="xp-value">{stats.xpStats.monthXP}</span>
              <span className="xp-unit">XP</span>
            </div>
            <div className="xp-card highlight">
              <span className="xp-period">Daily Average</span>
              <span className="xp-value">{Math.round(stats.xpStats.averageDailyXP)}</span>
              <span className="xp-unit">XP/day</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Badges */}
      {stats?.recentBadges && stats.recentBadges.length > 0 && (
        <div className="recent-badges-section">
          <h3>Recent Badges</h3>
          <div className="badges-grid">
            {stats.recentBadges.map((badge, index) => (
              <div key={index} className="badge-card">
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-date">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-section">
                <h4>Learning Profile</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Learning Style</span>
                    <span className="info-value">
                      {learningStyle.icon} {learningStyle.label}
                    </span>
                    <span className="info-description">{learningStyle.description}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Curriculum</span>
                    <span className="info-value">{getCurriculumLabel(child.curriculumType)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Preferred Language</span>
                    <span className="info-value">
                      {child.preferredLanguage === 'en' ? 'English' : child.preferredLanguage}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">
                      {new Date(child.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              {activity.length > 0 ? (
                <div className="activity-list">
                  {activity.map((item) => (
                    <div key={item.id} className="activity-item">
                      <div className="activity-icon">{item.icon}</div>
                      <div className="activity-content">
                        <span className="activity-description">{item.description}</span>
                        <span className="activity-time">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-activity">
                  <span className="empty-icon">📭</span>
                  <p>No recent activity</p>
                  <span className="empty-hint">Activity will appear here as your child learns</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-section">
                <h4>Profile Actions</h4>
                <div className="settings-actions">
                  <button className="settings-btn" onClick={() => setShowEditModal(true)}>
                    <span className="settings-btn-icon">✏️</span>
                    <div className="settings-btn-content">
                      <span className="settings-btn-title">Edit Profile</span>
                      <span className="settings-btn-desc">Update name, avatar, and preferences</span>
                    </div>
                  </button>
                  <button
                    className="settings-btn"
                    onClick={() => navigate(`/parent/children/${childId}/notebook`)}
                  >
                    <span className="settings-btn-icon">📓</span>
                    <div className="settings-btn-content">
                      <span className="settings-btn-title">View Notebook</span>
                      <span className="settings-btn-desc">See notes and leave encouragement</span>
                    </div>
                  </button>
                  <button
                    className="settings-btn"
                    onClick={() => navigate(`/parent/children/${childId}/safety`)}
                  >
                    <span className="settings-btn-icon">🛡️</span>
                    <div className="settings-btn-content">
                      <span className="settings-btn-title">Safety Settings</span>
                      <span className="settings-btn-desc">Manage content filters and restrictions</span>
                    </div>
                  </button>
                  <button
                    className="settings-btn"
                    onClick={() => navigate(`/parent/children/${childId}/progress`)}
                  >
                    <span className="settings-btn-icon">📊</span>
                    <div className="settings-btn-content">
                      <span className="settings-btn-title">Progress Report</span>
                      <span className="settings-btn-desc">View detailed learning analytics</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <h4>Security</h4>
                <div className="settings-actions">
                  <button
                    className="settings-btn"
                    onClick={() => setShowResetPinModal(true)}
                  >
                    <span className="settings-btn-icon">🔐</span>
                    <div className="settings-btn-content">
                      <span className="settings-btn-title">Reset PIN</span>
                      <span className="settings-btn-desc">Change or unlock the child's PIN</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditChildModal
          child={child}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          onDelete={handleDelete}
        />
      )}

      {/* Reset PIN Modal */}
      {showResetPinModal && (
        <ResetPinModal
          child={child}
          onClose={() => setShowResetPinModal(false)}
          onSuccess={() => {
            // Optionally refresh data
          }}
        />
      )}
    </div>
  );
};

export default ChildDetailsPage;
