import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_EMOJIS = {
  avatar_1: '🐱',
  avatar_2: '🐶',
  avatar_3: '🦉',
  avatar_4: '🦁',
  avatar_5: '🐼',
  avatar_6: '🐰',
  avatar_7: '🐧',
  avatar_8: '🐘',
};

const ProfileSwitcher = ({ compact = false }) => {
  const navigate = useNavigate();
  const { currentProfile, children, switchProfile, canAddChild, signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!currentProfile || children.length === 0) {
    return null;
  }

  const handleSwitchProfile = (childId) => {
    switchProfile(childId);
    setIsOpen(false);
  };

  const handleAddChild = () => {
    setIsOpen(false);
    navigate('/add-child');
  };

  const handleParentDashboard = () => {
    setIsOpen(false);
    navigate('/parent');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
    navigate('/');
  };

  const getAvatarEmoji = (avatarId) => {
    return AVATAR_EMOJIS[avatarId] || '🐱';
  };

  return (
    <div className={`profile-switcher ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <button
        className="current-profile-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch profile"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          <span className="avatar-emoji">{getAvatarEmoji(currentProfile.avatarUrl || currentProfile.avatarId)}</span>
        </div>
        {!compact && (
          <>
            <div className="profile-info">
              <span className="profile-name">{currentProfile.displayName}</span>
              <span className="profile-grade">Grade {currentProfile.gradeLevel ?? currentProfile.grade}</span>
            </div>
            <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="profile-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="dropdown-header">
              <span className="header-label">Switch Profile</span>
              <span className="header-count">{children.length} profile{children.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="profile-list">
              {children.map((child) => (
                <button
                  key={child.id}
                  className={`profile-option ${child.id === currentProfile.id ? 'active' : ''}`}
                  onClick={() => handleSwitchProfile(child.id)}
                >
                  <div className="option-avatar">
                    <span className="avatar-emoji">{getAvatarEmoji(child.avatarUrl || child.avatarId)}</span>
                  </div>
                  <div className="option-info">
                    <span className="option-name">{child.displayName}</span>
                    <span className="option-details">
                      {child.age ? `Age ${child.age}` : ''} • Grade {child.gradeLevel ?? child.grade}
                    </span>
                  </div>
                  {child.id === currentProfile.id && (
                    <span className="active-indicator">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8L6.5 11.5L13 5" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {canAddChild && (
              <button className="add-child-btn" onClick={handleAddChild}>
                <span className="add-icon">+</span>
                <span>Add Another Child</span>
              </button>
            )}

            <div className="dropdown-divider" />

            <div className="dropdown-footer">
              <button className="footer-btn" onClick={handleParentDashboard}>
                <span className="footer-icon">👨‍👩‍👧</span>
                <span>Parent Dashboard</span>
              </button>
              <button className="footer-btn" onClick={handleSignOut}>
                <span className="footer-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>

            <div className="dropdown-user">
              <span className="user-email">{user?.email}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .profile-switcher {
          position: relative;
        }

        .current-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .current-profile-btn:hover {
          border-color: #ffc107;
          box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          background: #ffc107;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-emoji {
          font-size: 1.25rem;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .profile-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: #333;
          line-height: 1.2;
        }

        .profile-grade {
          font-size: 0.75rem;
          color: #666;
        }

        .dropdown-arrow {
          color: #666;
          transition: transform 0.2s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        /* Compact mode */
        .profile-switcher.compact .current-profile-btn {
          padding: 4px;
        }

        .profile-switcher.compact .profile-avatar {
          width: 32px;
          height: 32px;
        }

        .profile-switcher.compact .avatar-emoji {
          font-size: 1rem;
        }

        /* Dropdown */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 280px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 1000;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9f9f9;
          border-bottom: 1px solid #eee;
        }

        .header-label {
          font-weight: 600;
          font-size: 0.8125rem;
          color: #333;
        }

        .header-count {
          font-size: 0.75rem;
          color: #999;
        }

        .profile-list {
          padding: 8px;
        }

        .profile-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .profile-option:hover {
          background: #f5f5f5;
        }

        .profile-option.active {
          background: #fffde7;
        }

        .option-avatar {
          width: 40px;
          height: 40px;
          background: #ffc107;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-name {
          font-weight: 600;
          font-size: 0.9375rem;
          color: #333;
        }

        .option-details {
          font-size: 0.75rem;
          color: #666;
        }

        .active-indicator {
          flex-shrink: 0;
        }

        .add-child-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: calc(100% - 16px);
          margin: 0 8px 8px;
          padding: 10px;
          background: #f5f5f5;
          border: 2px dashed #e0e0e0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #666;
          transition: all 0.15s ease;
        }

        .add-child-btn:hover {
          border-color: #ffc107;
          background: #fffde7;
          color: #f57c00;
        }

        .add-icon {
          width: 24px;
          height: 24px;
          background: #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
        }

        .add-child-btn:hover .add-icon {
          background: #ffc107;
          color: white;
        }

        .dropdown-divider {
          height: 1px;
          background: #eee;
          margin: 0 8px;
        }

        .dropdown-footer {
          padding: 8px;
        }

        .footer-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #666;
          transition: all 0.15s ease;
        }

        .footer-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .footer-icon {
          font-size: 1rem;
        }

        .dropdown-user {
          padding: 10px 16px;
          background: #f9f9f9;
          border-top: 1px solid #eee;
        }

        .user-email {
          font-size: 0.75rem;
          color: #999;
        }

        @media (max-width: 480px) {
          .profile-dropdown {
            min-width: 260px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSwitcher;
