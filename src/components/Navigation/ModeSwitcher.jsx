import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../../context/ModeContext';
import './ModeSwitcher.css';

const ModeSwitcher = () => {
  const { currentMode, switchToChildMode } = useMode();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSwitchToParent = () => {
    navigate('/parent/verify-pin');
  };

  const handleSwitchToChild = () => {
    if (currentMode === 'parent') {
      // Show confirmation before switching from parent to child
      setShowConfirm(true);
    }
  };

  const confirmSwitch = () => {
    switchToChildMode();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="mode-switcher">
        {currentMode === 'child' ? (
          <button
            className="mode-switch-button parent-mode"
            onClick={handleSwitchToParent}
            aria-label="Switch to parent mode"
            title="Parent Mode"
          >
            <span className="mode-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="7" r="4" fill="currentColor" />
                <path d="M3 18C3 14.134 6.134 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <span className="mode-label">Parent</span>
          </button>
        ) : (
          <button
            className="mode-switch-button child-mode"
            onClick={handleSwitchToChild}
            aria-label="Switch to child mode"
            title="Back to Learning"
          >
            <span className="mode-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4L3 9V17H7V13H13V17H17V9L10 4Z" fill="currentColor" />
              </svg>
            </span>
            <span className="mode-label">Learning</span>
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="mode-switch-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="mode-switch-confirm" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
                <path d="M24 14V28" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
                <circle cx="24" cy="34" r="2" fill="#FF9800" />
              </svg>
            </div>
            <h3>Switch to Child Mode?</h3>
            <p>You'll need to enter your PIN again to access parent settings.</p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-switch"
                onClick={confirmSwitch}
              >
                Switch to Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeSwitcher;
