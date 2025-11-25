import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMode } from '../../context/ModeContext';
import './ParentPinVerification.css';

const ParentPinVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { switchToParentMode, hasParentPin, isLocked, remainingAttempts, timeUntilUnlock } = useMode();

  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (index === 3 && value) {
      const fullPin = newPin.join('');
      handleVerify(fullPin);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      const newPin = pastedData.split('');
      setPin(newPin);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (pinToVerify) => {
    if (isLocked) {
      setError(`Too many attempts. Try again in ${timeUntilUnlock} minutes.`);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const success = await switchToParentMode(pinToVerify);

      if (success) {
        // Navigate to intended destination or default to dashboard
        const from = location.state?.from?.pathname || '/parent/dashboard';
        navigate(from);
      } else {
        if (isLocked) {
          setError(`Too many attempts. Try again in ${timeUntilUnlock} minutes.`);
        } else {
          setError(
            hasParentPin
              ? `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
              : 'PIN must be 4 digits.'
          );
        }
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to verify PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    navigate('/learn');
  };

  return (
    <div className="pin-verification-screen">
      <div className="pin-verification-container">
        <div className="pin-header">
          <div className="parent-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#E3F2FD" />
              <circle cx="32" cy="24" r="10" fill="#2196F3" />
              <path d="M16 52C16 43.16 23.16 36 32 36C40.84 36 48 43.16 48 52" stroke="#2196F3" strokeWidth="4" fill="none" />
            </svg>
          </div>
          <h2>{hasParentPin ? 'Enter Parent PIN' : 'Set Parent PIN'}</h2>
          <p className="pin-description">
            {hasParentPin
              ? 'Enter your 4-digit PIN to access parent controls'
              : 'Create a 4-digit PIN to protect parent settings'
            }
          </p>
        </div>

        {isLocked ? (
          <div className="lockout-message">
            <span className="lockout-icon">🔒</span>
            <p>Too many failed attempts</p>
            <p className="lockout-time">Try again in {timeUntilUnlock} minutes</p>
          </div>
        ) : (
          <>
            <div className="pin-input-group" onPaste={handlePaste}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className={`pin-input ${error ? 'error' : ''}`}
                  disabled={isVerifying}
                  aria-label={`PIN digit ${index + 1}`}
                />
              ))}
            </div>

            {error && (
              <div className="pin-error">
                <span className="error-icon">!</span>
                {error}
              </div>
            )}

            {isVerifying && (
              <div className="pin-verifying">
                <span className="verifying-spinner" />
                Verifying...
              </div>
            )}
          </>
        )}

        <div className="pin-actions">
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={isVerifying}
          >
            <span className="back-icon">←</span>
            Back to Learning
          </button>
        </div>

        {!hasParentPin && !isLocked && (
          <div className="pin-setup-notice">
            <div className="notice-icon">💡</div>
            <div className="notice-content">
              <p><strong>Remember your PIN!</strong></p>
              <p>You'll need it to access parent settings, billing, and reports.</p>
            </div>
          </div>
        )}

        <div className="pin-security-notice">
          <span className="lock-icon">🔒</span>
          <span>Your PIN is stored securely and never shared with your child.</span>
        </div>
      </div>
    </div>
  );
};

export default ParentPinVerification;
