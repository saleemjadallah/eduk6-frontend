import { useState, useEffect, useCallback } from 'react';
import { privacyAPI } from '../services/api/privacyAPI';
import './PrivacyControlsPage.css';

export default function PrivacyControlsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [privacyData, setPrivacyData] = useState(null);
  const [preferences, setPreferences] = useState({
    dataCollection: {
      learningAnalytics: true,
      usageAnalytics: true,
      personalization: true,
    },
    dataSharing: {
      thirdPartyAnalytics: false,
      improvementResearch: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchPrivacyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await privacyAPI.getPrivacySettings();
      if (response.success) {
        setPrivacyData(response.data);
        if (response.data.preferences) {
          setPreferences(response.data.preferences);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrivacyData();
  }, [fetchPrivacyData]);

  const handleToggle = (category, setting) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const response = await privacyAPI.updatePreferences(preferences);
      if (response.success) {
        setSuccessMessage('Privacy preferences updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await privacyAPI.exportData();
      if (response.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orbit-learn-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccessMessage('Data export downloaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      setDeleting(true);
      await privacyAPI.deleteAccount();
      // Redirect to home after account deletion
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="privacy-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  if (error && !privacyData) {
    return (
      <div className="privacy-page">
        <div className="page-error">
          <p>Unable to load privacy settings</p>
          <p className="error-message">{error}</p>
          <button onClick={fetchPrivacyData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="privacy-page">
      <div className="page-header">
        <h1>Privacy Controls</h1>
        <p>Manage your data, consent, and privacy preferences</p>
      </div>

      {successMessage && (
        <div className="success-toast">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-toast">
          <span className="error-icon">!</span>
          {error}
          <button className="dismiss-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="privacy-sections">
        {/* COPPA Consent Status */}
        <section className="section-card">
          <div className="section-header">
            <div className="section-icon consent-icon">
              <span>✓</span>
            </div>
            <div>
              <h2>Parental Consent (COPPA)</h2>
              <p className="section-desc">
                Your consent status for your children's accounts
              </p>
            </div>
          </div>

          <div className="consent-status">
            {privacyData?.consent ? (
              <>
                <div className="consent-badge active">
                  <span className="badge-icon">✓</span>
                  Consent Active
                </div>
                <div className="consent-details">
                  <div className="detail-row">
                    <span className="label">Method:</span>
                    <span className="value">{privacyData.consent.method}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Granted:</span>
                    <span className="value">{formatDate(privacyData.consent.grantedAt)}</span>
                  </div>
                  {privacyData.consent.expiresAt && (
                    <div className="detail-row">
                      <span className="label">Expires:</span>
                      <span className="value">{formatDate(privacyData.consent.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="consent-badge inactive">
                <span className="badge-icon">!</span>
                No Active Consent
              </div>
            )}
          </div>

          <div className="info-box">
            <span className="info-icon">ℹ</span>
            <p>
              Under COPPA regulations, parental consent is required for children under 13
              to use our educational platform. Your consent allows us to provide personalized
              learning experiences for your children.
            </p>
          </div>
        </section>

        {/* Data Collection Preferences */}
        <section className="section-card">
          <div className="section-header">
            <div className="section-icon data-icon">
              <span>📊</span>
            </div>
            <div>
              <h2>Data Collection</h2>
              <p className="section-desc">
                Control what data we collect to improve learning experiences
              </p>
            </div>
          </div>

          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Learning Analytics</h4>
                <p>Track progress, strengths, and areas for improvement</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.dataCollection.learningAnalytics}
                  onChange={() => handleToggle('dataCollection', 'learningAnalytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Usage Analytics</h4>
                <p>Help us understand how the app is used to improve it</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.dataCollection.usageAnalytics}
                  onChange={() => handleToggle('dataCollection', 'usageAnalytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Personalization</h4>
                <p>Use learning data to personalize content and recommendations</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.dataCollection.personalization}
                  onChange={() => handleToggle('dataCollection', 'personalization')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Data Sharing Preferences */}
        <section className="section-card">
          <div className="section-header">
            <div className="section-icon sharing-icon">
              <span>🔗</span>
            </div>
            <div>
              <h2>Data Sharing</h2>
              <p className="section-desc">
                Control how your data may be shared with third parties
              </p>
            </div>
          </div>

          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Third-Party Analytics</h4>
                <p>Share anonymized data with analytics providers</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.dataSharing.thirdPartyAnalytics}
                  onChange={() => handleToggle('dataSharing', 'thirdPartyAnalytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Research & Improvement</h4>
                <p>Contribute anonymized data to educational research</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preferences.dataSharing.improvementResearch}
                  onChange={() => handleToggle('dataSharing', 'improvementResearch')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="section-actions">
            <button
              className="btn-primary"
              onClick={handleSavePreferences}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </section>

        {/* Data Summary */}
        <section className="section-card">
          <div className="section-header">
            <div className="section-icon summary-icon">
              <span>📁</span>
            </div>
            <div>
              <h2>Your Data Summary</h2>
              <p className="section-desc">
                Overview of data we have stored for your account
              </p>
            </div>
          </div>

          {privacyData?.dataSummary && (
            <div className="data-summary-grid">
              <div className="summary-item">
                <span className="summary-value">{privacyData.dataSummary.totalLessons}</span>
                <span className="summary-label">Lessons Created</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{privacyData.dataSummary.totalChatMessages}</span>
                <span className="summary-label">Chat Messages</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{privacyData.dataSummary.totalFlashcards}</span>
                <span className="summary-label">Flashcard Decks</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{privacyData.dataSummary.accountAgeMonths}</span>
                <span className="summary-label">Months Active</span>
              </div>
            </div>
          )}

          <div className="children-list">
            <h4>Children's Profiles</h4>
            {privacyData?.children?.length > 0 ? (
              <ul>
                {privacyData.children.map(child => (
                  <li key={child.id}>{child.displayName}</li>
                ))}
              </ul>
            ) : (
              <p className="no-children">No children profiles created yet</p>
            )}
          </div>
        </section>

        {/* Data Management */}
        <section className="section-card">
          <div className="section-header">
            <div className="section-icon manage-icon">
              <span>⚙</span>
            </div>
            <div>
              <h2>Data Management</h2>
              <p className="section-desc">
                Export or delete your data
              </p>
            </div>
          </div>

          <div className="data-actions">
            <div className="action-card">
              <div className="action-info">
                <h4>Export Your Data</h4>
                <p>Download a copy of all your data in JSON format, including account info, children's profiles, lessons, and progress.</p>
              </div>
              <button
                className="btn-secondary"
                onClick={handleExportData}
                disabled={exporting}
              >
                {exporting ? 'Preparing Export...' : 'Export Data'}
              </button>
            </div>

            <div className="action-card danger">
              <div className="action-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button
                className="btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="warning-banner">
                <span className="warning-icon">⚠</span>
                <p>This action is permanent and cannot be undone!</p>
              </div>
              <p>Deleting your account will:</p>
              <ul className="delete-consequences">
                <li>Remove your parent account</li>
                <li>Delete all children's profiles and their data</li>
                <li>Erase all lessons, progress, and achievements</li>
                <li>Cancel any active subscription</li>
              </ul>
              <div className="confirm-input">
                <label>Type <strong>DELETE</strong> to confirm:</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
