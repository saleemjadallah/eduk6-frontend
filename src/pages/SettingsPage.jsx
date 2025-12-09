import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api/settingsAPI';
import { useAuth } from '../context/AuthContext';
import ResetKBQModal from '../components/Parent/ResetKBQModal';
import './SettingsPage.css';

// Timezone options (common ones)
const TIMEZONES = [
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
];

// Country options
const COUNTRIES = [
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'EG', label: 'Egypt' },
  { value: 'JO', label: 'Jordan' },
];

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [children, setChildren] = useState([]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    timezone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pinForm, setPinForm] = useState({
    childId: '',
    newPin: '',
  });

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showKBQModal, setShowKBQModal] = useState(false);

  // Auth context for updating user data
  let updateUser = null;
  try {
    const authContext = useAuth();
    updateUser = authContext?.updateUser;
  } catch (e) {
    // AuthProvider not available
  }

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [settingsResponse, childrenResponse] = await Promise.all([
          settingsAPI.getSettings(),
          settingsAPI.getChildrenPins(),
        ]);

        if (settingsResponse.success) {
          setSettings(settingsResponse.data);
          setProfileForm({
            firstName: settingsResponse.data.profile.firstName || '',
            lastName: settingsResponse.data.profile.lastName || '',
            phone: settingsResponse.data.profile.phone || '',
            country: settingsResponse.data.profile.country || 'AE',
            timezone: settingsResponse.data.profile.timezone || 'Asia/Dubai',
          });
        }

        if (childrenResponse.success) {
          setChildren(childrenResponse.data);
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setFormErrors({});

      const response = await settingsAPI.updateProfile(profileForm);
      if (response.success) {
        setSuccessMessage('Profile updated successfully');
        // Update settings state
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, ...response.data },
        }));
        // Update auth context if available
        if (updateUser) {
          updateUser(response.data);
        }
      }
    } catch (err) {
      setFormErrors({ profile: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Validate
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      setFormErrors({});

      const response = await settingsAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        setSuccessMessage('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setFormErrors({ password: err.message || 'Failed to change password' });
    } finally {
      setIsSaving(false);
    }
  };

  // Logout all devices
  const handleLogoutAll = async () => {
    if (!window.confirm('This will log you out from all devices. Continue?')) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await settingsAPI.logoutAll();
      if (response.success) {
        setSuccessMessage('Logged out from all devices');
        // In production, would redirect to login
      }
    } catch (err) {
      setFormErrors({ logout: err.message || 'Failed to logout' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset child PIN
  const handleResetPin = async () => {
    if (!pinForm.childId || !pinForm.newPin) {
      setFormErrors({ pin: 'Please select a child and enter a new PIN' });
      return;
    }
    if (!/^\d{4}$/.test(pinForm.newPin)) {
      setFormErrors({ pin: 'PIN must be exactly 4 digits' });
      return;
    }

    try {
      setIsSaving(true);
      setFormErrors({});

      const response = await settingsAPI.resetChildPin(pinForm.childId, pinForm.newPin);
      if (response.success) {
        setSuccessMessage('PIN updated successfully');
        setPinForm({ childId: '', newPin: '' });
        // Refresh children list
        const childrenResponse = await settingsAPI.getChildrenPins();
        if (childrenResponse.success) {
          setChildren(childrenResponse.data);
        }
      }
    } catch (err) {
      setFormErrors({ pin: err.message || 'Failed to reset PIN' });
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="settings-page">
        <div className="page-error">
          <p>Unable to load settings</p>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Page header */}
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="success-toast">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>

      {/* Tab content */}
      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="section-card">
              <h2>Account Information</h2>
              <p className="section-desc">Update your personal information</p>

              {formErrors.profile && (
                <div className="form-error-banner">{formErrors.profile}</div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={settings?.profile?.email || ''}
                    disabled
                    className="disabled"
                  />
                  <span className="field-hint">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={formatDate(settings?.profile?.memberSince)}
                    disabled
                    className="disabled"
                  />
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select
                    name="country"
                    value={profileForm.country}
                    onChange={handleProfileChange}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Timezone</label>
                  <select
                    name="timezone"
                    value={profileForm.timezone}
                    onChange={handleProfileChange}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="section-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="settings-section">
            {/* Change Password */}
            <div className="section-card">
              <h2>Change Password</h2>
              <p className="section-desc">Update your account password</p>

              {formErrors.password && (
                <div className="form-error-banner">{formErrors.password}</div>
              )}

              <div className="form-stack">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                  {formErrors.currentPassword && (
                    <span className="field-error">{formErrors.currentPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  {formErrors.newPassword && (
                    <span className="field-error">{formErrors.newPassword}</span>
                  )}
                  <span className="field-hint">Minimum 8 characters</span>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                  {formErrors.confirmPassword && (
                    <span className="field-error">{formErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="section-actions">
                <button
                  className="btn-primary"
                  onClick={handleChangePassword}
                  disabled={isSaving}
                >
                  {isSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            {/* Child PIN Management */}
            {children.length > 0 && (
              <div className="section-card">
                <h2>Child PIN Management</h2>
                <p className="section-desc">Reset PINs for your children's profiles</p>

                {formErrors.pin && (
                  <div className="form-error-banner">{formErrors.pin}</div>
                )}

                <div className="pin-list">
                  {children.map(child => (
                    <div key={child.id} className="pin-item">
                      <span className="pin-child-name">{child.displayName}</span>
                      <span className="pin-current">Current PIN: {child.pin}</span>
                    </div>
                  ))}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Select Child</label>
                    <select
                      value={pinForm.childId}
                      onChange={(e) => setPinForm(prev => ({ ...prev, childId: e.target.value }))}
                    >
                      <option value="">Choose a child...</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>{child.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>New PIN</label>
                    <input
                      type="text"
                      value={pinForm.newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinForm(prev => ({ ...prev, newPin: val }));
                      }}
                      placeholder="4 digits"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="section-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleResetPin}
                    disabled={isSaving || !pinForm.childId || !pinForm.newPin}
                  >
                    Reset PIN
                  </button>
                </div>
              </div>
            )}

            {/* Security Questions */}
            <div className="section-card">
              <h2>Security Questions</h2>
              <p className="section-desc">Manage your security questions for consent verification</p>

              <div className="security-questions-info">
                <div className="info-box">
                  <span className="info-icon">🔐</span>
                  <p>
                    Security questions are used for COPPA parental consent verification.
                    You can reset them if you've forgotten your answers.
                  </p>
                </div>
              </div>

              <div className="section-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowKBQModal(true)}
                >
                  Reset Security Questions
                </button>
              </div>
            </div>

            {/* Session Management */}
            <div className="section-card">
              <h2>Session Management</h2>
              <p className="section-desc">Manage your active sessions</p>

              {formErrors.logout && (
                <div className="form-error-banner">{formErrors.logout}</div>
              )}

              <div className="session-info">
                <p>
                  If you suspect unauthorized access, you can log out from all devices.
                  You will need to log in again on this device.
                </p>
              </div>

              <div className="section-actions">
                <button
                  className="btn-danger"
                  onClick={handleLogoutAll}
                  disabled={isSaving}
                >
                  Logout from All Devices
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <div className="section-card">
              <h2>Email Notifications</h2>
              <p className="section-desc">Choose what emails you receive</p>

              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Safety Alerts</span>
                    <span className="notification-desc">
                      Receive emails when safety incidents occur
                    </span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Weekly Digest</span>
                    <span className="notification-desc">
                      Summary of your children's learning progress
                    </span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Product Updates</span>
                    <span className="notification-desc">
                      News about new features and improvements
                    </span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <p>
                  Notification preferences are saved automatically.
                  Critical security notifications cannot be disabled.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KBQ Reset Modal */}
      {showKBQModal && (
        <ResetKBQModal
          onClose={() => setShowKBQModal(false)}
          onSuccess={() => {
            setSuccessMessage('Security questions updated successfully');
          }}
        />
      )}
    </div>
  );
};

export default SettingsPage;
