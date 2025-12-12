import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UsageWarningBanner.css';

/**
 * Usage Warning Banner Component
 *
 * Displays a warning banner when the parent is approaching or has reached
 * their monthly lesson limit. Shows at different severity levels:
 * - 70-89%: Yellow/orange warning
 * - 90-99%: Red urgent warning
 * - 100%: Red limit reached
 */
const UsageWarningBanner = ({ usage, onDismiss }) => {
  const navigate = useNavigate();

  // Don't show if no usage data or if unlimited
  if (!usage || usage.isUnlimited) {
    return null;
  }

  const { lessonsThisMonth, lessonsLimit, lessonsRemaining, percentUsed } = usage;

  // Don't show if under 70%
  if (percentUsed < 70) {
    return null;
  }

  // Determine severity level
  const isLimitReached = percentUsed >= 100;
  const isUrgent = percentUsed >= 90;
  const severity = isLimitReached ? 'critical' : isUrgent ? 'urgent' : 'warning';

  // Get appropriate message
  const getMessage = () => {
    if (isLimitReached) {
      return {
        icon: '🚫',
        title: 'Monthly Lesson Limit Reached',
        description: `You've used all ${lessonsLimit} lessons this month. Upgrade to continue learning!`,
        cta: 'Upgrade Now',
      };
    }
    if (isUrgent) {
      return {
        icon: '⚠️',
        title: `Only ${lessonsRemaining} Lesson${lessonsRemaining === 1 ? '' : 's'} Remaining!`,
        description: `You've used ${lessonsThisMonth} of ${lessonsLimit} lessons. Upgrade for unlimited access.`,
        cta: 'Upgrade for Unlimited',
      };
    }
    return {
      icon: '📊',
      title: `${percentUsed}% of Monthly Lessons Used`,
      description: `${lessonsRemaining} lesson${lessonsRemaining === 1 ? '' : 's'} remaining this month.`,
      cta: 'See Plans',
    };
  };

  const message = getMessage();

  return (
    <div className={`usage-warning-banner ${severity}`}>
      <div className="banner-content">
        <span className="banner-icon">{message.icon}</span>
        <div className="banner-text">
          <strong className="banner-title">{message.title}</strong>
          <span className="banner-description">{message.description}</span>
        </div>
      </div>
      <div className="banner-actions">
        <button
          className="banner-cta"
          onClick={() => navigate('/parent/billing')}
        >
          {message.cta}
        </button>
        {!isLimitReached && onDismiss && (
          <button className="banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
      {/* Progress bar */}
      <div className="banner-progress">
        <div
          className="banner-progress-fill"
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default UsageWarningBanner;
