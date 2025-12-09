import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api/authAPI';
import './ChildModal.css';

const STEPS = {
  OPTIONS: 'options',
  RESET_PIN: 'reset_pin',
  UNLOCK: 'unlock',
  SUCCESS: 'success',
};

const ResetPinModal = ({ child, onClose, onSuccess }) => {
  const [step, setStep] = useState(STEPS.OPTIONS);
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState(null);

  // Fetch PIN status on mount
  useEffect(() => {
    const fetchPinStatus = async () => {
      try {
        const response = await authAPI.getChildPinStatus(child.id);
        if (response.success) {
          setPinStatus(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch PIN status:', err);
      }
    };
    fetchPinStatus();
  }, [child.id]);

  const handleResetPin = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetChildPin(child.id, password, newPin);
      if (response.success) {
        setStep(STEPS.SUCCESS);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to reset PIN. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.unlockChildPin(child.id, password);
      if (response.success) {
        setStep(STEPS.SUCCESS);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to unlock PIN. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        {step === STEPS.OPTIONS && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">🔐</span>
              <h2>PIN Management</h2>
              <p className="modal-subtitle">
                Manage the PIN for {child.displayName}'s profile
              </p>
            </div>

            {pinStatus?.isLocked && (
              <div className="alert alert-warning">
                <span className="alert-icon">⚠️</span>
                <div>
                  <strong>PIN is locked</strong>
                  <p>
                    Too many failed attempts. Locked for {pinStatus.remainingMinutes} more minutes.
                  </p>
                </div>
              </div>
            )}

            <div className="options-grid">
              <button
                className="option-card"
                onClick={() => setStep(STEPS.RESET_PIN)}
              >
                <span className="option-icon">🔄</span>
                <div className="option-content">
                  <h3>Reset PIN</h3>
                  <p>Set a new 4-digit PIN for this child</p>
                </div>
              </button>

              {pinStatus?.isLocked && (
                <button
                  className="option-card"
                  onClick={() => setStep(STEPS.UNLOCK)}
                >
                  <span className="option-icon">🔓</span>
                  <div className="option-content">
                    <h3>Unlock PIN</h3>
                    <p>Clear the lockout without changing the PIN</p>
                  </div>
                </button>
              )}
            </div>

            <div className="security-note">
              <span className="note-icon">🛡️</span>
              <p>
                For security, you'll need to confirm your password before making changes.
              </p>
            </div>
          </div>
        )}

        {step === STEPS.RESET_PIN && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">🔄</span>
              <h2>Reset PIN</h2>
              <p className="modal-subtitle">
                Create a new PIN for {child.displayName}
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                {error}
              </div>
            )}

            <form onSubmit={handleResetPin}>
              <div className="form-group">
                <label>Your Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  autoFocus
                />
                <span className="form-hint">
                  Required to confirm your identity
                </span>
              </div>

              <div className="form-group">
                <label>New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit PIN"
                  className="pin-input"
                />
              </div>

              <div className="form-group">
                <label>Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirm 4-digit PIN"
                  className="pin-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStep(STEPS.OPTIONS);
                    setPassword('');
                    setNewPin('');
                    setConfirmPin('');
                    setError('');
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset PIN'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === STEPS.UNLOCK && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">🔓</span>
              <h2>Unlock PIN</h2>
              <p className="modal-subtitle">
                Clear the lockout for {child.displayName}'s PIN
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                {error}
              </div>
            )}

            <form onSubmit={handleUnlock}>
              <div className="form-group">
                <label>Your Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  autoFocus
                />
                <span className="form-hint">
                  Required to confirm your identity
                </span>
              </div>

              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <p>
                  This will clear the lockout so the current PIN can be used again.
                  The PIN itself will not change.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStep(STEPS.OPTIONS);
                    setPassword('');
                    setError('');
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Unlocking...' : 'Unlock PIN'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === STEPS.SUCCESS && (
          <div className="modal-content success-content">
            <div className="success-icon-large">✓</div>
            <h2>Success!</h2>
            <p>
              {step === STEPS.SUCCESS && newPin
                ? `PIN has been reset for ${child.displayName}.`
                : `PIN has been unlocked for ${child.displayName}.`}
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-container {
            background: white;
            border-radius: 20px;
            max-width: 480px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
            z-index: 10;
          }

          .modal-close-btn:hover {
            background: #f0f0f0;
          }

          .modal-content {
            padding: 32px;
          }

          .modal-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .modal-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
          }

          .modal-header h2 {
            margin: 0 0 8px;
            font-size: 1.5rem;
            color: #1a1a1a;
          }

          .modal-subtitle {
            color: #666;
            margin: 0;
            font-size: 0.9375rem;
          }

          .alert {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .alert-warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
          }

          .alert-warning .alert-icon {
            font-size: 20px;
          }

          .alert-warning strong {
            color: #92400e;
          }

          .alert-warning p {
            margin: 4px 0 0;
            color: #78350f;
            font-size: 0.875rem;
          }

          .alert-error {
            background: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
            font-size: 0.9375rem;
          }

          .options-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
          }

          .option-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .option-card:hover {
            border-color: #7c3aed;
            background: #f5f3ff;
          }

          .option-icon {
            font-size: 32px;
            flex-shrink: 0;
          }

          .option-content h3 {
            margin: 0 0 4px;
            font-size: 1rem;
            color: #1a1a1a;
          }

          .option-content p {
            margin: 0;
            color: #666;
            font-size: 0.875rem;
          }

          .security-note {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f0fdf4;
            border-radius: 12px;
            border: 1px solid #22c55e;
          }

          .note-icon {
            font-size: 24px;
          }

          .security-note p {
            margin: 0;
            color: #166534;
            font-size: 0.875rem;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1a1a1a;
          }

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }

          .form-group input:focus {
            outline: none;
            border-color: #7c3aed;
          }

          .pin-input {
            font-size: 1.5rem !important;
            letter-spacing: 0.5rem;
            text-align: center;
            font-family: monospace;
          }

          .form-hint {
            display: block;
            font-size: 0.8125rem;
            color: #666;
            margin-top: 6px;
          }

          .info-box {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 12px;
            border: 1px solid #0ea5e9;
            margin-bottom: 20px;
          }

          .info-icon {
            font-size: 20px;
          }

          .info-box p {
            margin: 0;
            color: #0369a1;
            font-size: 0.875rem;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
          }

          .btn {
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #7c3aed, #2dd4bf);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }

          .btn-secondary:hover {
            background: #e5e7eb;
          }

          .success-content {
            text-align: center;
            padding: 48px 32px;
          }

          .success-icon-large {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #22c55e, #10b981);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 40px;
            color: white;
          }

          .success-content h2 {
            margin: 0 0 12px;
            color: #1a1a1a;
          }

          .success-content p {
            color: #666;
            margin: 0 0 24px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ResetPinModal;
