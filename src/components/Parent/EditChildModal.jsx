import React, { useState } from 'react';
import { profileAPI } from '../../services/api/profileAPI';
import { useAuth } from '../../context/AuthContext';
import './ChildModal.css';

const AVATARS = [
  { id: 'avatar_1', name: 'Cool Cat', emoji: '🐱' },
  { id: 'avatar_2', name: 'Happy Dog', emoji: '🐶' },
  { id: 'avatar_3', name: 'Smart Owl', emoji: '🦉' },
  { id: 'avatar_4', name: 'Brave Lion', emoji: '🦁' },
  { id: 'avatar_5', name: 'Friendly Panda', emoji: '🐼' },
  { id: 'avatar_6', name: 'Curious Bunny', emoji: '🐰' },
  { id: 'avatar_7', name: 'Playful Penguin', emoji: '🐧' },
  { id: 'avatar_8', name: 'Mighty Elephant', emoji: '🐘' },
];

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', icon: '👁️', description: 'Pictures and diagrams' },
  { value: 'auditory', label: 'Auditory', icon: '👂', description: 'Listening and discussion' },
  { value: 'kinesthetic', label: 'Hands-on', icon: '✋', description: 'Activities and practice' },
];

const CURRICULA = [
  { value: 'american', label: 'American (Common Core)' },
  { value: 'british', label: 'British (IGCSE)' },
  { value: 'indian', label: 'Indian (CBSE/ICSE)' },
  { value: 'ib', label: 'International Baccalaureate' },
];

const EditChildModal = ({ child, onClose, onSuccess, onDelete }) => {
  const { updateChildProfile, removeChildProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    displayName: child.displayName || '',
    avatarId: child.avatarUrl || 'avatar_1',
    learningStyle: child.learningStyle?.toLowerCase() || 'visual',
    curriculumType: child.curriculumType?.toLowerCase() || 'american',
    language: child.preferredLanguage || 'en',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = 'Name must be 50 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData = {
        displayName: formData.displayName.trim(),
        avatarId: formData.avatarId,
        learningStyle: formData.learningStyle,
        curriculumType: formData.curriculumType,
        language: formData.language,
      };

      const response = await profileAPI.updateProfile(child.id, updateData);

      if (response.success) {
        updateChildProfile(child.id, response.data);
        onSuccess?.();
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      await profileAPI.deleteProfile(child.id);
      removeChildProfile(child.id);
      onDelete?.();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to delete profile' });
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarEmoji = (avatarId) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.emoji || '🐱';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container edit-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Delete Confirmation */}
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <div className="delete-icon">⚠️</div>
            <h3>Delete {child.displayName}'s Profile?</h3>
            <p>This will permanently delete all learning progress, achievements, and data associated with this profile. This action cannot be undone.</p>
            {errors.submit && <div className="modal-error">{errors.submit}</div>}
            <div className="delete-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with child info */}
            <div className="modal-header edit-header">
              <div className="edit-child-info">
                <div className="edit-avatar">
                  {getAvatarEmoji(formData.avatarId)}
                </div>
                <div>
                  <h2>Edit Profile</h2>
                  <p className="modal-subtitle">{child.displayName}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`modal-tab ${activeTab === 'avatar' ? 'active' : ''}`}
                onClick={() => setActiveTab('avatar')}
              >
                Avatar
              </button>
              <button
                className={`modal-tab ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
              >
                Learning
              </button>
            </div>

            {errors.submit && <div className="modal-error">{errors.submit}</div>}

            <div className="modal-body">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Child's name"
                      className={errors.displayName ? 'error' : ''}
                    />
                    {errors.displayName && <span className="field-error">{errors.displayName}</span>}
                    <span className="field-hint">This is the name Jeffrey will use</span>
                  </div>

                  <div className="form-group">
                    <label>Curriculum</label>
                    <select
                      name="curriculumType"
                      value={formData.curriculumType}
                      onChange={handleChange}
                    >
                      {CURRICULA.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <div className="info-box">
                    <span className="info-icon">ℹ️</span>
                    <p>Age and grade level cannot be changed after profile creation. Contact support if you need to update these.</p>
                  </div>
                </div>
              )}

              {/* Avatar Tab */}
              {activeTab === 'avatar' && (
                <div className="form-step">
                  <div className="avatar-grid">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button"
                        className={`avatar-option ${formData.avatarId === avatar.id ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, avatarId: avatar.id }))}
                      >
                        <span className="avatar-emoji">{avatar.emoji}</span>
                        <span className="avatar-name">{avatar.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Tab */}
              {activeTab === 'learning' && (
                <div className="form-step">
                  <label className="section-label">Learning Style</label>
                  <div className="learning-options">
                    {LEARNING_STYLES.map(style => (
                      <button
                        key={style.value}
                        type="button"
                        className={`learning-option ${formData.learningStyle === style.value ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, learningStyle: style.value }))}
                      >
                        <span className="learning-icon">{style.icon}</span>
                        <div className="learning-text">
                          <span className="learning-label">{style.label}</span>
                          <span className="learning-desc">{style.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer edit-footer">
              <button
                type="button"
                className="btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Profile
              </button>
              <div className="footer-right">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditChildModal;
