import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api/profileAPI';

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

const GRADES = [
  { value: 0, label: 'Pre-K' },
  { value: 1, label: 'Grade 1' },
  { value: 2, label: 'Grade 2' },
  { value: 3, label: 'Grade 3' },
  { value: 4, label: 'Grade 4' },
  { value: 5, label: 'Grade 5' },
  { value: 6, label: 'Grade 6' },
  { value: 7, label: 'Grade 7' },
  { value: 8, label: 'Grade 8' },
];

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', icon: '👁️', description: 'Learns best with pictures and diagrams' },
  { value: 'auditory', label: 'Auditory', icon: '👂', description: 'Learns best by listening' },
  { value: 'kinesthetic', label: 'Hands-on', icon: '✋', description: 'Learns best by doing activities' },
];

const CURRICULA = [
  { value: 'american', label: 'American (Common Core)' },
  { value: 'british', label: 'British (IGCSE)' },
  { value: 'indian', label: 'Indian (CBSE/ICSE)' },
  { value: 'ib', label: 'International Baccalaureate (IB)' },
];

const CreateProfileStep = ({ onComplete }) => {
  const { addChildProfile, maxChildrenAllowed } = useAuth();

  const [profileData, setProfileData] = useState({
    displayName: '',
    age: '',
    grade: '',
    avatarId: 'avatar_1',
    learningStyle: 'visual',
    curriculumType: 'american',
    pin: '',
    confirmPin: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic, 2: Avatar, 3: Learning

  const validateBasic = () => {
    const newErrors = {};

    if (!profileData.displayName.trim()) {
      newErrors.displayName = "Please enter your child's name";
    } else if (profileData.displayName.length > 50) {
      newErrors.displayName = 'Name must be 50 characters or less';
    }

    if (!profileData.age) {
      newErrors.age = "Please enter your child's age";
    } else {
      const age = parseInt(profileData.age);
      if (age < 4 || age > 14) {
        newErrors.age = 'Age must be between 4 and 14';
      }
    }

    if (profileData.grade === '') {
      newErrors.grade = "Please select your child's grade";
    }

    // PIN validation
    if (!profileData.pin) {
      newErrors.pin = 'Please create a 4-digit PIN';
    } else if (!/^\d{4}$/.test(profileData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }

    if (!profileData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (profileData.pin !== profileData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarSelect = (avatarId) => {
    setProfileData(prev => ({ ...prev, avatarId }));
  };

  const handleLearningStyleSelect = (style) => {
    setProfileData(prev => ({ ...prev, learningStyle: style }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateBasic()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const newProfile = {
        displayName: profileData.displayName.trim(),
        age: parseInt(profileData.age),
        grade: parseInt(profileData.grade),
        avatarId: profileData.avatarId,
        learningStyle: profileData.learningStyle,
        curriculumType: profileData.curriculumType,
        language: 'en',
        pin: profileData.pin,
      };

      // Call API to create the profile in the database
      const response = await profileAPI.createProfile(newProfile);

      if (response.success && response.data) {
        // Update local state with the created profile
        addChildProfile(response.data);
      }

      onComplete?.();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-profile-step">
      <div className="step-header">
        <h2>
          {currentStep === 1 && "Tell us about your child"}
          {currentStep === 2 && "Choose an avatar"}
          {currentStep === 3 && "Learning preferences"}
        </h2>
        <p className="subtitle">
          {currentStep === 1 && "This helps Ollie personalize the learning experience."}
          {currentStep === 2 && "Pick a fun character to represent your child!"}
          {currentStep === 3 && "Help us tailor lessons to your child's style."}
        </p>
      </div>

      {/* Mini progress */}
      <div className="profile-progress">
        <div className={`progress-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
        <div className="progress-line-mini" />
        <div className={`progress-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        <div className="progress-line-mini" />
        <div className={`progress-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
      </div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="profile-form">
          <div className="form-group">
            <label className="form-label">Child's First Name</label>
            <input
              type="text"
              name="displayName"
              className={`form-input ${errors.displayName ? 'error' : ''}`}
              placeholder="e.g., Alex"
              value={profileData.displayName}
              onChange={handleChange}
            />
            {errors.displayName && <div className="form-error">{errors.displayName}</div>}
            <div className="form-hint">First name only (for privacy)</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <select
                name="age"
                className={`form-input form-select ${errors.age ? 'error' : ''}`}
                value={profileData.age}
                onChange={handleChange}
              >
                <option value="">Select age</option>
                {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(age => (
                  <option key={age} value={age}>{age} years old</option>
                ))}
              </select>
              {errors.age && <div className="form-error">{errors.age}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Grade</label>
              <select
                name="grade"
                className={`form-input form-select ${errors.grade ? 'error' : ''}`}
                value={profileData.grade}
                onChange={handleChange}
              >
                <option value="">Select grade</option>
                {GRADES.map(grade => (
                  <option key={grade.value} value={grade.value}>{grade.label}</option>
                ))}
              </select>
              {errors.grade && <div className="form-error">{errors.grade}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Curriculum</label>
            <select
              name="curriculumType"
              className="form-input form-select"
              value={profileData.curriculumType}
              onChange={handleChange}
            >
              {CURRICULA.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Parent PIN Section */}
          <div className="pin-section">
            <div className="pin-section-header">
              <label className="form-label">Parent PIN</label>
              <div className="form-hint pin-hint">
                This 4-digit PIN protects parent settings from your child. You'll need it to access the parent dashboard.
              </div>
            </div>

            <div className="pin-entry-row">
              <div className="pin-entry-group">
                <label className="form-label-small">Create PIN</label>
                <div className={`pin-boxes ${errors.pin ? 'error' : ''}`}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={`pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      className="pin-box"
                      value={profileData.pin[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 1) {
                          const newPin = profileData.pin.split('');
                          newPin[index] = value;
                          setProfileData(prev => ({ ...prev, pin: newPin.join('') }));
                          if (errors.pin) setErrors(prev => ({ ...prev, pin: '' }));
                          // Auto-focus next input
                          if (value && index < 3) {
                            const nextInput = e.target.parentElement.children[index + 1];
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace to go to previous input
                        if (e.key === 'Backspace' && !profileData.pin[index] && index > 0) {
                          const prevInput = e.target.parentElement.children[index - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.pin && <div className="form-error">{errors.pin}</div>}
              </div>

              <div className="pin-entry-group">
                <label className="form-label-small">Confirm PIN</label>
                <div className={`pin-boxes ${errors.confirmPin ? 'error' : ''}`}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={`confirmPin-${index}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      className="pin-box"
                      value={profileData.confirmPin[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 1) {
                          const newPin = profileData.confirmPin.split('');
                          newPin[index] = value;
                          setProfileData(prev => ({ ...prev, confirmPin: newPin.join('') }));
                          if (errors.confirmPin) setErrors(prev => ({ ...prev, confirmPin: '' }));
                          // Auto-focus next input
                          if (value && index < 3) {
                            const nextInput = e.target.parentElement.children[index + 1];
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace to go to previous input
                        if (e.key === 'Backspace' && !profileData.confirmPin[index] && index > 0) {
                          const prevInput = e.target.parentElement.children[index - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.confirmPin && <div className="form-error">{errors.confirmPin}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Avatar Selection */}
      {currentStep === 2 && (
        <div className="avatar-selection">
          <div className="avatar-grid">
            {AVATARS.map(avatar => (
              <button
                key={avatar.id}
                type="button"
                className={`avatar-option ${profileData.avatarId === avatar.id ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatar.id)}
              >
                <span className="avatar-emoji">{avatar.emoji}</span>
                <span className="avatar-name">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Learning Preferences */}
      {currentStep === 3 && (
        <div className="learning-selection">
          <div className="learning-styles">
            {LEARNING_STYLES.map(style => (
              <button
                key={style.value}
                type="button"
                className={`style-option ${profileData.learningStyle === style.value ? 'selected' : ''}`}
                onClick={() => handleLearningStyleSelect(style.value)}
              >
                <span className="style-icon">{style.icon}</span>
                <span className="style-label">{style.label}</span>
                <span className="style-description">{style.description}</span>
              </button>
            ))}
          </div>

          <div className="profile-summary">
            <h4>Profile Summary</h4>
            <div className="summary-content">
              <div className="summary-avatar">
                <span className="summary-emoji">
                  {AVATARS.find(a => a.id === profileData.avatarId)?.emoji || '🐱'}
                </span>
              </div>
              <div className="summary-details">
                <span className="summary-name">{profileData.displayName || 'Child'}</span>
                <span className="summary-info">
                  {profileData.age} years old • {GRADES.find(g => g.value === parseInt(profileData.grade))?.label || 'Grade'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        {currentStep > 1 && (
          <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
            Back
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNextStep}
            style={currentStep === 1 ? { gridColumn: '1 / -1' } : {}}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </button>
        )}
      </div>

      <style>{`
        .create-profile-step {
          text-align: center;
        }

        .profile-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .progress-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #999;
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          background: #ffc107;
          color: white;
        }

        .progress-line-mini {
          width: 40px;
          height: 2px;
          background: #e0e0e0;
        }

        .profile-form {
          text-align: left;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 40px;
        }

        /* PIN section */
        .pin-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .pin-section-header {
          margin-bottom: 16px;
        }

        .pin-hint {
          margin-top: 4px;
          color: #666;
          font-size: 0.8125rem;
          line-height: 1.4;
        }

        .form-label-small {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 8px;
        }

        .pin-entry-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .pin-entry-group {
          display: flex;
          flex-direction: column;
        }

        .pin-boxes {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }

        .pin-boxes.error .pin-box {
          border-color: #ef4444;
        }

        .pin-box {
          width: 48px;
          height: 56px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: center;
          background: #fff;
          transition: all 0.2s ease;
        }

        .pin-box:focus {
          outline: none;
          border-color: #ffc107;
          box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
        }

        .pin-box::-webkit-inner-spin-button,
        .pin-box::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        @media (max-width: 480px) {
          .pin-entry-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .pin-boxes {
            justify-content: center;
          }

          .pin-box {
            width: 52px;
            height: 60px;
          }
        }

        /* Avatar selection */
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .avatar-option {
          padding: 16px 8px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .avatar-option:hover {
          border-color: #ffc107;
          transform: translateY(-2px);
        }

        .avatar-option.selected {
          border-color: #ffc107;
          background: #fffde7;
          transform: scale(1.05);
        }

        .avatar-emoji {
          font-size: 2rem;
        }

        .avatar-name {
          font-size: 0.6875rem;
          color: #666;
        }

        /* Learning styles */
        .learning-styles {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .style-option {
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto auto;
          gap: 4px 12px;
          text-align: left;
        }

        .style-option:hover {
          border-color: #ffc107;
        }

        .style-option.selected {
          border-color: #ffc107;
          background: #fffde7;
        }

        .style-icon {
          font-size: 1.5rem;
          grid-row: span 2;
          display: flex;
          align-items: center;
        }

        .style-label {
          font-weight: 600;
          color: #333;
        }

        .style-description {
          font-size: 0.8125rem;
          color: #666;
        }

        /* Profile summary */
        .profile-summary {
          background: #f9f9f9;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
        }

        .profile-summary h4 {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          margin: 0 0 12px;
        }

        .summary-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-avatar {
          width: 48px;
          height: 48px;
          background: #ffc107;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-emoji {
          font-size: 1.5rem;
        }

        .summary-details {
          display: flex;
          flex-direction: column;
        }

        .summary-name {
          font-weight: 600;
          color: #333;
        }

        .summary-info {
          font-size: 0.8125rem;
          color: #666;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
        }

        @media (max-width: 480px) {
          .avatar-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateProfileStep;
