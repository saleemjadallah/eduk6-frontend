import React, { useState, useEffect } from 'react';
import { safetyAPI } from '../../services/api/safetyAPI';
import './SafetyComponents.css';

// Incident type config
const INCIDENT_TYPES = {
  PROFANITY: { icon: '🤬', label: 'Profanity', description: 'Language containing profane or inappropriate words' },
  PII_DETECTED: { icon: '🔐', label: 'Personal Information', description: 'Attempt to share personal identifying information' },
  INAPPROPRIATE_TOPIC: { icon: '⚠️', label: 'Inappropriate Topic', description: 'Discussion of topics not suitable for children' },
  JAILBREAK_ATTEMPT: { icon: '🚫', label: 'Jailbreak Attempt', description: 'Attempt to bypass AI safety guidelines' },
  HARMFUL_CONTENT: { icon: '☠️', label: 'Harmful Content', description: 'Content that could be harmful to children' },
  BLOCKED_BY_GEMINI: { icon: '🛡️', label: 'Blocked by AI', description: 'Content blocked by AI safety filters' },
  PARENT_OVERRIDE: { icon: '👤', label: 'Parent Override', description: 'Action overridden by parent settings' },
};

// Severity config
const SEVERITY_CONFIG = {
  LOW: { label: 'Low', className: 'severity-low', description: 'Minor concern, informational only' },
  MEDIUM: { label: 'Medium', className: 'severity-medium', description: 'Moderate concern, review recommended' },
  HIGH: { label: 'High', className: 'severity-high', description: 'Significant concern, action may be needed' },
  CRITICAL: { label: 'Critical', className: 'severity-critical', description: 'Serious concern, immediate attention required' },
};

// Action options
const ACTIONS = [
  { value: 'acknowledged', label: 'Acknowledge', icon: '👁️', description: 'Mark as seen and reviewed' },
  { value: 'discussed_with_child', label: 'Discussed', icon: '💬', description: 'Had a conversation with child about this' },
  { value: 'restricted', label: 'Restricted', icon: '🔒', description: 'Added restrictions based on this incident' },
  { value: 'dismissed', label: 'Dismiss', icon: '✗', description: 'Not a concern, dismiss this incident' },
];

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const IncidentDetailModal = ({ incident, onClose, onMarkReviewed }) => {
  const [fullIncident, setFullIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('acknowledged');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch full incident details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await safetyAPI.getIncidentDetail(incident.id);
        if (response.success) {
          setFullIncident(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch incident details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [incident.id]);

  const handleMarkReviewed = async () => {
    try {
      setIsSubmitting(true);
      await onMarkReviewed(incident.id, selectedAction);
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const typeConfig = INCIDENT_TYPES[incident.incidentType] || { icon: '❓', label: incident.incidentType };
  const severityConfig = SEVERITY_CONFIG[incident.severity] || { label: incident.severity, className: '' };
  const data = fullIncident || incident;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container incident-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="incident-header">
          <div className="incident-badges">
            <span className={`severity-badge large ${severityConfig.className}`}>
              {severityConfig.label}
            </span>
            <span className="type-badge">
              <span className="type-icon">{typeConfig.icon}</span>
              {typeConfig.label}
            </span>
          </div>
          {data.reviewed && (
            <span className="reviewed-badge">Reviewed</span>
          )}
        </div>

        {/* Body */}
        <div className="incident-body">
          {isLoading ? (
            <div className="loading-section">
              <div className="loading-spinner-small"></div>
              <p>Loading details...</p>
            </div>
          ) : (
            <>
              {/* Meta info */}
              <div className="incident-meta">
                <div className="meta-item">
                  <span className="meta-label">Child</span>
                  <span className="meta-value">{data.childName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Time</span>
                  <span className="meta-value">{formatDate(data.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Action Taken</span>
                  <span className={`meta-value ${data.wasBlocked ? 'blocked' : 'allowed'}`}>
                    {data.wasBlocked ? 'Blocked' : 'Allowed'}
                  </span>
                </div>
              </div>

              {/* Type description */}
              <div className="info-section">
                <div className="info-header">
                  <span className="info-icon">ℹ️</span>
                  <span className="info-title">What happened</span>
                </div>
                <p className="info-text">{typeConfig.description}</p>
              </div>

              {/* Input/Output text */}
              {(data.inputText || data.outputText) && (
                <div className="context-section">
                  <h4>Context</h4>
                  {data.inputText && (
                    <div className="context-block">
                      <span className="context-label">Child's Input:</span>
                      <p className="context-text">{data.inputText}</p>
                    </div>
                  )}
                  {data.outputText && (
                    <div className="context-block">
                      <span className="context-label">AI Response:</span>
                      <p className="context-text">{data.outputText}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Flags */}
              {data.flags && data.flags.length > 0 && (
                <div className="flags-section">
                  <h4>Flagged Content</h4>
                  <div className="flags-list">
                    {data.flags.map((flag, index) => (
                      <span key={index} className="flag-pill">{flag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Safety Ratings */}
              {data.geminiSafetyRatings && (
                <div className="ratings-section">
                  <h4>AI Safety Ratings</h4>
                  <div className="ratings-grid">
                    {Object.entries(data.geminiSafetyRatings).map(([category, rating]) => (
                      <div key={category} className="rating-item">
                        <span className="rating-category">{category.replace(/_/g, ' ')}</span>
                        <span className={`rating-value ${String(rating).toLowerCase()}`}>
                          {String(rating)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action selector */}
              {!data.reviewed && (
                <div className="action-section">
                  <h4>Take Action</h4>
                  <div className="action-options">
                    {ACTIONS.map(action => (
                      <button
                        key={action.value}
                        className={`action-option ${selectedAction === action.value ? 'selected' : ''}`}
                        onClick={() => setSelectedAction(action.value)}
                      >
                        <span className="action-icon">{action.icon}</span>
                        <div className="action-text">
                          <span className="action-label">{action.label}</span>
                          <span className="action-desc">{action.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Already reviewed info */}
              {data.reviewed && data.parentAction && (
                <div className="reviewed-section">
                  <h4>Review Status</h4>
                  <div className="reviewed-info">
                    <span className="reviewed-action">
                      Action: {data.parentAction.replace(/_/g, ' ')}
                    </span>
                    {data.parentNotifiedAt && (
                      <span className="reviewed-date">
                        Reviewed on {formatDate(data.parentNotifiedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="incident-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {!data.reviewed && (
            <button
              className="btn-primary"
              onClick={handleMarkReviewed}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Saving...' : 'Mark as Reviewed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
