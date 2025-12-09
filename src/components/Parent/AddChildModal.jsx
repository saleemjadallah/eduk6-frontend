import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api/profileAPI';
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

const AddChildModal = ({ onClose, onSuccess }) => {
  const { addChildProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    grade: '',
    avatarId: 'avatar_1',
    learningStyle: 'visual',
    curriculumType: 'american',
    pin: '',
    confirmPin: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = 'Name must be 50 characters or less';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (age < 4 || age > 14) {
        newErrors.age = 'Age must be between 4 and 14';
      }
    }

    if (formData.grade === '') {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.pin) {
      newErrors.pin = '4-digit PIN required';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'Must be exactly 4 digits';
    }

    if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const profileData = {
        displayName: formData.displayName.trim(),
        age: parseInt(formData.age),
        grade: parseInt(formData.grade),
        avatarId: formData.avatarId,
        learningStyle: formData.learningStyle,
        curriculumType: formData.curriculumType,
        language: 'en',
        pin: formData.pin,
      };

      const response = await profileAPI.createProfile(profileData);

      if (response.success && response.data) {
        addChildProfile(response.data);
        onSuccess?.();
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinInput = (index, value, field) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 1) {
      const currentPin = formData[field].split('');
      currentPin[index] = cleanValue;
      setFormData(prev => ({ ...prev, [field]: currentPin.join('') }));

      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }

      // Auto-focus next input
      if (cleanValue && index < 3) {
        const nextInput = document.querySelector(`[data-pin="${field}-${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handlePinKeyDown = (e, index, field) => {
    if (e.key === 'Backspace' && !formData[field][index] && index > 0) {
      const prevInput = document.querySelector(`[data-pin="${field}-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-header">
          <h2>
            {step === 1 && 'Add New Child'}
            {step === 2 && 'Choose an Avatar'}
            {step === 3 && 'Learning Preferences'}
          </h2>
          <p className="modal-subtitle">
            {step === 1 && 'Enter your child\'s basic information'}
            {step === 2 && 'Pick a fun character for your child'}
            {step === 3 && 'Help us personalize the experience'}
          </p>
        </div>

        {/* Progress dots */}
        <div className="step-progress">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {errors.submit && <div className="modal-error">{errors.submit}</div>}

        <div className="modal-body">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Child's First Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g., Alex"
                  className={errors.displayName ? 'error' : ''}
                />
                {errors.displayName && <span className="field-error">{errors.displayName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <select
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={errors.age ? 'error' : ''}
                  >
                    <option value="">Select age</option>
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={errors.grade ? 'error' : ''}
                  >
                    <option value="">Select grade</option>
                    {GRADES.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                  {errors.grade && <span className="field-error">{errors.grade}</span>}
                </div>
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

              <div className="pin-section">
                <label>Parent PIN</label>
                <p className="pin-hint">Create a 4-digit PIN to protect parent settings</p>
                <div className="pin-row">
                  <div className="pin-group">
                    <span className="pin-label">Create PIN</span>
                    <div className={`pin-inputs ${errors.pin ? 'error' : ''}`}>
                      {[0, 1, 2, 3].map(i => (
                        <input
                          key={`pin-${i}`}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          data-pin={`pin-${i}`}
                          value={formData.pin[i] || ''}
                          onChange={e => handlePinInput(i, e.target.value, 'pin')}
                          onKeyDown={e => handlePinKeyDown(e, i, 'pin')}
                        />
                      ))}
                    </div>
                    {errors.pin && <span className="field-error">{errors.pin}</span>}
                  </div>
                  <div className="pin-group">
                    <span className="pin-label">Confirm PIN</span>
                    <div className={`pin-inputs ${errors.confirmPin ? 'error' : ''}`}>
                      {[0, 1, 2, 3].map(i => (
                        <input
                          key={`confirmPin-${i}`}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          data-pin={`confirmPin-${i}`}
                          value={formData.confirmPin[i] || ''}
                          onChange={e => handlePinInput(i, e.target.value, 'confirmPin')}
                          onKeyDown={e => handlePinKeyDown(e, i, 'confirmPin')}
                        />
                      ))}
                    </div>
                    {errors.confirmPin && <span className="field-error">{errors.confirmPin}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Avatar */}
          {step === 2 && (
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

          {/* Step 3: Learning Preferences */}
          {step === 3 && (
            <div className="form-step">
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

              <div className="profile-preview">
                <h4>Profile Preview</h4>
                <div className="preview-content">
                  <div className="preview-avatar">
                    {AVATARS.find(a => a.id === formData.avatarId)?.emoji || '🐱'}
                  </div>
                  <div className="preview-info">
                    <span className="preview-name">{formData.displayName || 'Child'}</span>
                    <span className="preview-meta">
                      {formData.age} years old • {GRADES.find(g => g.value === parseInt(formData.grade))?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              style={step === 1 ? { width: '100%' } : {}}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddChildModal;
