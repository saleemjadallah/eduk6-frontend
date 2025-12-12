import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonLimitModal.css';

/**
 * Lesson Limit Modal Component
 *
 * Shows when a user tries to create a lesson and is near/at their limit.
 * Provides options to:
 * - Continue anyway (if not at limit)
 * - Upgrade to unlimited plan
 * - Cancel
 */
const LessonLimitModal = ({
  isOpen,
  onClose,
  onContinue,
  lessonsRemaining,
  lessonsLimit,
  percentUsed,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isLimitReached = lessonsRemaining <= 0;
  const isUrgent = lessonsRemaining <= 2;

  const handleUpgrade = () => {
    onClose();
    navigate('/parent/billing');
  };

  return (
    <div className="lesson-limit-modal-overlay" onClick={onClose}>
      <div className="lesson-limit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={`modal-icon ${isLimitReached ? 'limit-reached' : isUrgent ? 'urgent' : 'warning'}`}>
          {isLimitReached ? '🚫' : isUrgent ? '⚠️' : '📊'}
        </div>

        {/* Title */}
        <h2 className="modal-title">
          {isLimitReached
            ? 'Monthly Lesson Limit Reached'
            : isUrgent
              ? `Only ${lessonsRemaining} Lesson${lessonsRemaining === 1 ? '' : 's'} Left!`
              : 'Running Low on Lessons'}
        </h2>

        {/* Description */}
        <p className="modal-description">
          {isLimitReached ? (
            <>
              You've used all <strong>{lessonsLimit} lessons</strong> included in your free plan this month.
              Upgrade for unlimited lessons!
            </>
          ) : (
            <>
              You have <strong>{lessonsRemaining}</strong> of <strong>{lessonsLimit}</strong> lessons remaining this month.
              {isUrgent ? " Upgrade now to keep learning!" : " Consider upgrading for unlimited access."}
            </>
          )}
        </p>

        {/* Progress visualization */}
        <div className="modal-progress-container">
          <div className="modal-progress-bar">
            <div
              className="modal-progress-fill"
              style={{
                width: `${Math.min(percentUsed, 100)}%`,
                background: isLimitReached || isUrgent
                  ? 'linear-gradient(90deg, #f44336, #ff5722)'
                  : 'linear-gradient(90deg, #ff9800, #ffc107)',
              }}
            />
          </div>
          <div className="modal-progress-labels">
            <span>{lessonsLimit - lessonsRemaining} used</span>
            <span>{lessonsRemaining} remaining</span>
          </div>
        </div>

        {/* Benefits callout for upgrade */}
        <div className="upgrade-benefits">
          <h4>Upgrade Benefits:</h4>
          <ul>
            <li>Unlimited lessons every month</li>
            <li>Add more child profiles</li>
            <li>Priority support</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="upgrade-btn" onClick={handleUpgrade}>
            Upgrade Now
            <span className="trial-badge">7-day free trial</span>
          </button>

          {!isLimitReached && (
            <button className="continue-btn" onClick={onContinue}>
              Continue Anyway ({lessonsRemaining} left)
            </button>
          )}

          <button className="cancel-btn" onClick={onClose}>
            {isLimitReached ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonLimitModal;
