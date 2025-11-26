import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentDashboardAPI } from '../services/api/parentDashboardAPI';
import AddChildModal from '../components/Parent/AddChildModal';
import EditChildModal from '../components/Parent/EditChildModal';
import './MyChildrenPage.css';

const MyChildrenPage = () => {
  const navigate = useNavigate();
  const { user, maxChildrenAllowed, canAddChild, refreshAuth } = useAuth();

  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  // Fetch children data with stats
  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await parentDashboardAPI.getDashboard();
      if (response.success) {
        setChildren(response.data.children || []);
      }
    } catch (err) {
      console.error('Failed to fetch children:', err);
      setError(err.message || 'Failed to load children');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async () => {
    setShowAddModal(false);
    await refreshAuth();
    await fetchChildren();
  };

  const handleEditChild = async () => {
    setEditingChild(null);
    await refreshAuth();
    await fetchChildren();
  };

  const handleDeleteChild = async () => {
    setEditingChild(null);
    await refreshAuth();
    await fetchChildren();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="my-children-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading children...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-children-page">
        <div className="page-error">
          <p>Unable to load children</p>
          <p className="error-message">{error}</p>
          <button onClick={fetchChildren}>Try Again</button>
        </div>
      </div>
    );
  }

  const hasChildren = children.length > 0;

  return (
    <div className="my-children-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>My Children</h1>
          <p>
            {hasChildren
              ? `Managing ${children.length} of ${maxChildrenAllowed} profile${maxChildrenAllowed > 1 ? 's' : ''}`
              : 'Add your first child to get started'}
          </p>
        </div>
        {canAddChild && (
          <button className="add-child-btn" onClick={() => setShowAddModal(true)}>
            <span className="btn-icon">+</span>
            Add Child
          </button>
        )}
      </div>

      {/* Children Grid */}
      {hasChildren ? (
        <div className="children-grid">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onViewDetails={() => navigate(`/parent/children/${child.id}`)}
              onEdit={() => setEditingChild(child)}
            />
          ))}

          {/* Add Child Card (if allowed) */}
          {canAddChild && (
            <button className="add-child-card" onClick={() => setShowAddModal(true)}>
              <div className="add-icon">+</div>
              <span>Add Another Child</span>
            </button>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">
            <span className="empty-emoji">👧</span>
            <span className="empty-emoji">👦</span>
          </div>
          <h2>No Children Yet</h2>
          <p>Add your first child to start their learning journey with Jeffrey!</p>
          <button className="add-child-btn-large" onClick={() => setShowAddModal(true)}>
            <span className="btn-icon">+</span>
            Add Your First Child
          </button>
        </div>
      )}

      {/* Subscription Info */}
      {!canAddChild && hasChildren && (
        <div className="subscription-notice">
          <div className="notice-icon">i</div>
          <div className="notice-content">
            <p>
              You've reached the maximum of {maxChildrenAllowed} child profile
              {maxChildrenAllowed > 1 ? 's' : ''} for your plan.
            </p>
            <button
              className="upgrade-link"
              onClick={() => navigate('/parent/billing')}
            >
              Upgrade to add more
            </button>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <AddChildModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddChild}
        />
      )}

      {/* Edit Child Modal */}
      {editingChild && (
        <EditChildModal
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onSuccess={handleEditChild}
          onDelete={handleDeleteChild}
        />
      )}
    </div>
  );
};

// Child Card Component
const ChildCard = ({ child, onViewDetails, onEdit }) => {
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

  const getLearningStyleLabel = (style) => {
    const styles = {
      VISUAL: 'Visual Learner',
      AUDITORY: 'Auditory Learner',
      READING: 'Reading/Writing',
      KINESTHETIC: 'Hands-on Learner',
    };
    return styles[style] || style;
  };

  return (
    <div className="child-card">
      <div className="card-header">
        <div className="child-avatar">
          {child.avatarUrl && !child.avatarUrl.startsWith('avatar_') ? (
            <img src={child.avatarUrl} alt={child.displayName} />
          ) : (
            <span className="avatar-emoji">
              {getAvatarEmoji(child.avatarUrl, child.ageGroup)}
            </span>
          )}
        </div>
        <button className="edit-btn" onClick={onEdit} title="Edit profile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      <div className="card-body">
        <h3 className="child-name">{child.displayName}</h3>
        <div className="child-meta">
          <span>{child.age} years old</span>
          <span className="meta-dot">•</span>
          <span>{getGradeLabel(child.gradeLevel)}</span>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{child.lessonsCompleted}</span>
            <span className="stat-label">Lessons</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{child.currentStreak}</span>
            <span className="stat-label">Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{child.level}</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{child.xp}</span>
            <span className="stat-label">XP</span>
          </div>
        </div>

        {/* Activity Status */}
        <div className="activity-status">
          <span className={`status-dot ${child.wasActiveToday ? 'active' : ''}`}></span>
          <span className="status-text">
            {child.wasActiveToday ? 'Active today' : `Last active: ${child.lastActive}`}
          </span>
        </div>

        {/* Recent Badges */}
        {child.recentBadges && child.recentBadges.length > 0 && (
          <div className="recent-badges">
            <span className="badges-label">Recent badges:</span>
            <div className="badges-list">
              {child.recentBadges.slice(0, 3).map((badge, index) => (
                <span key={index} className="badge-icon" title={badge.name}>
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button className="view-details-btn" onClick={onViewDetails}>
          View Details
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MyChildrenPage;
