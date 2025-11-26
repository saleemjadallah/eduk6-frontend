import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api/authAPI';

const EmailVerificationStep = ({ onVerified, email }) => {
  const { verifyEmail } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus appropriate input
    const nextEmpty = newOtp.findIndex(digit => !digit);
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      // All filled, auto-submit
      handleVerify(newOtp.join(''));
    }
  };

  // Verify OTP
  const handleVerify = async (code) => {
    if (!email) {
      setError('Email not found. Please go back and try again.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await verifyEmail(email, code);

      if (response.success) {
        setMessage('Email verified successfully!');
        setTimeout(() => {
          onVerified?.();
        }, 1000);
      } else {
        setError(response.error || 'Invalid verification code. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsResending(true);
    setMessage('');
    setError('');

    try {
      const response = await authAPI.resendVerificationEmail(email);

      if (response.success) {
        setMessage('A new verification code has been sent to your email.');
        setResendCooldown(60); // 60 second cooldown
        // Clear any existing OTP
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Manual submit button
  const handleSubmit = () => {
    const code = otp.join('');
    if (code.length === 6) {
      handleVerify(code);
    } else {
      setError('Please enter all 6 digits.');
    }
  };

  return (
    <div className="email-verification-step">
      <div className="step-header">
        <div className="verification-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#E3F2FD" />
            <path
              d="M56 28H24C22.9 28 22 28.9 22 30V50C22 51.1 22.9 52 24 52H56C57.1 52 58 51.1 58 50V30C58 28.9 57.1 28 56 28Z"
              stroke="#2196F3"
              strokeWidth="2"
              fill="white"
            />
            <path
              d="M58 30L40 42L22 30"
              stroke="#2196F3"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="54" cy="26" r="8" fill="#4CAF50" />
            <path
              d="M51 26L53 28L57 24"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <h2>Verify Your Email</h2>
        <p className="subtitle">
          We've sent a 6-digit verification code to:
        </p>
        <p className="email-display">{email || 'your@email.com'}</p>
      </div>

      {/* OTP Input */}
      <div className="otp-container">
        <p className="otp-label">Enter verification code</p>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`otp-input ${error ? 'otp-input-error' : ''}`}
              disabled={isVerifying}
              autoComplete="one-time-code"
            />
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        className="btn btn-primary verify-btn"
        onClick={handleSubmit}
        disabled={isVerifying || otp.some(d => !d)}
      >
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="verification-actions">
        <p className="resend-text">
          Didn't receive the code?{' '}
          <button
            type="button"
            className="link-btn"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend code'}
          </button>
        </p>

        <div className="email-tips">
          <h4>Can't find the email?</h4>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Add support@orbitlearn.app to your contacts</li>
          </ul>
        </div>
      </div>

      <style>{`
        .email-verification-step {
          text-align: center;
        }

        .verification-icon {
          margin-bottom: 16px;
        }

        .email-display {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2196f3;
          margin: 8px 0 24px;
        }

        .otp-container {
          margin-bottom: 24px;
        }

        .otp-label {
          font-size: 0.9375rem;
          color: #666;
          margin-bottom: 12px;
        }

        .otp-inputs {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .otp-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .otp-input:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .otp-input-error {
          border-color: #f44336;
        }

        .otp-input:disabled {
          background: #f5f5f5;
          color: #999;
        }

        .verify-btn {
          width: 100%;
          padding: 14px 24px;
          font-size: 1rem;
          margin-bottom: 24px;
        }

        .verification-actions {
          text-align: center;
        }

        .resend-text {
          font-size: 0.9375rem;
          color: #666;
          margin-bottom: 20px;
        }

        .link-btn {
          background: none;
          border: none;
          color: #2196f3;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .link-btn:hover:not(:disabled) {
          text-decoration: underline;
        }

        .link-btn:disabled {
          color: #999;
          cursor: not-allowed;
        }

        .error-message {
          color: #f44336;
          font-size: 0.875rem;
          margin-top: 12px;
        }

        .success-message {
          color: #4caf50;
          font-size: 0.875rem;
          margin-top: 12px;
        }

        .email-tips {
          background: #fff3e0;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
        }

        .email-tips h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #e65100;
          margin: 0 0 8px;
        }

        .email-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .email-tips li {
          font-size: 0.8125rem;
          color: #666;
          margin-bottom: 4px;
        }

        .email-tips li:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 480px) {
          .otp-input {
            width: 42px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationStep;
