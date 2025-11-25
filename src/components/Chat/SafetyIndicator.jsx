import React, { useState } from 'react';
import { Shield, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * SafetyIndicator - Visual indicator for chat safety status
 * Shows the current safety state of the chat conversation
 */
const SafetyIndicator = ({ flags = [], showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine safety status based on flags
  const getSafetyStatus = () => {
    if (flags.length === 0) return 'safe';

    const highSeverityFlags = ['profanity', 'pii_detected', 'inappropriate_topic', 'manipulation_attempt'];
    if (flags.some(f => highSeverityFlags.includes(f))) {
      return 'warning';
    }
    return 'info';
  };

  const status = getSafetyStatus();

  // Get status-specific styles
  const getStatusStyles = () => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: 'text-amber-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-500',
        };
    }
  };

  const styles = getStatusStyles();

  // Get status icon
  const StatusIcon = () => {
    switch (status) {
      case 'safe':
        return <Shield className={`w-4 h-4 ${styles.icon}`} />;
      case 'warning':
        return <AlertTriangle className={`w-4 h-4 ${styles.icon}`} />;
      default:
        return <Info className={`w-4 h-4 ${styles.icon}`} />;
    }
  };

  // Get status label
  const getStatusLabel = () => {
    switch (status) {
      case 'safe':
        return 'Safe Mode';
      case 'warning':
        return 'Content Filtered';
      default:
        return 'Safety Active';
    }
  };

  // Format flag for display
  const formatFlag = (flag) => {
    const labels = {
      profanity: 'Language filtered',
      pii_detected: 'Personal info protected',
      inappropriate_topic: 'Topic redirected',
      manipulation_attempt: 'Safety check',
      inappropriate_content: 'Content filtered',
      external_links: 'Links removed',
      message_too_long: 'Message length',
      low_educational_value: 'Enhanced response',
      language_too_complex: 'Simplified language',
    };
    return labels[flag] || flag.replace(/_/g, ' ');
  };

  return (
    <div className={`rounded-lg border ${styles.bg} ${styles.border} transition-all duration-200`}>
      <button
        onClick={() => showDetails && setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-3 py-1.5 w-full
          ${showDetails && flags.length > 0 ? 'cursor-pointer' : 'cursor-default'}
        `}
        disabled={!showDetails || flags.length === 0}
      >
        <StatusIcon />
        <span className={`text-xs font-medium ${styles.text}`}>
          {getStatusLabel()}
        </span>

        {showDetails && flags.length > 0 && (
          <>
            <span className={`
              ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
              ${status === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}
            `}>
              {flags.length}
            </span>
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronUp className={`w-3 h-3 ${styles.icon}`} />
              ) : (
                <ChevronDown className={`w-3 h-3 ${styles.icon}`} />
              )}
            </span>
          </>
        )}
      </button>

      {/* Expanded details */}
      {showDetails && isExpanded && flags.length > 0 && (
        <div className={`px-3 pb-2 pt-1 border-t ${styles.border}`}>
          <p className={`text-xs ${styles.text} mb-1.5`}>
            Safety checks detected:
          </p>
          <ul className="space-y-1">
            {flags.map((flag, index) => (
              <li
                key={index}
                className={`text-xs ${styles.text} flex items-center gap-1.5`}
              >
                <span className="w-1 h-1 rounded-full bg-current" />
                {formatFlag(flag)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Compact version for inline use
 */
export const SafetyIndicatorCompact = ({ flags = [] }) => {
  const status = flags.length === 0 ? 'safe' :
    flags.some(f => ['profanity', 'pii_detected', 'inappropriate_topic'].includes(f))
      ? 'warning' : 'info';

  const colors = {
    safe: 'text-green-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`flex items-center gap-1 ${colors[status]}`}>
      <Shield className="w-3.5 h-3.5" />
      {flags.length > 0 && (
        <span className="text-[10px] font-medium">
          {flags.length}
        </span>
      )}
    </div>
  );
};

export default SafetyIndicator;
