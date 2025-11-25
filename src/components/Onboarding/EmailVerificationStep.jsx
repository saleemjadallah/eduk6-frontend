import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EmailVerificationStep = ({ onVerified }) => {
  const { user, verifyEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');

  // For demo mode, auto-verify after 3 seconds
  useEffect(() => {
    const DEMO_MODE = true; // Match AuthContext

    if (DEMO_MODE && user) {
      const timer = setTimeout(async () => {
        await verifyEmail('demo-token');
        onVerified?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, verifyEmail, onVerified]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setMessage('');

    try {
      // In production, call API to resend email
      // await authAPI.resendVerificationEmail(user.email);

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Verification email sent! Check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSkipForDemo = async () => {
    await verifyEmail('demo-token');
    onVerified?.();
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
        <h2>Check Your Email</h2>
        <p className="subtitle">
          We've sent a verification link to:
        </p>
        <p className="email-display">{user?.email || 'your@email.com'}</p>
      </div>

      <div className="verification-instructions">
        <div className="instruction">
          <span className="instruction-icon">1</span>
          <span>Open the email we just sent you</span>
        </div>
        <div className="instruction">
          <span className="instruction-icon">2</span>
          <span>Click the verification link</span>
        </div>
        <div className="instruction">
          <span className="instruction-icon">3</span>
          <span>Return here to continue setup</span>
        </div>
      </div>

      {message && (
        <div className={message.includes('Failed') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <div className="verification-actions">
        <p className="resend-text">
          Didn't receive the email?{' '}
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
                : 'Resend email'}
          </button>
        </p>

        <div className="email-tips">
          <h4>Can't find the email?</h4>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Add noreply@nanobanana.com to your contacts</li>
          </ul>
        </div>

        {/* Demo mode skip button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSkipForDemo}
          style={{ marginTop: '16px' }}
        >
          Skip for Demo (Auto-verifying...)
        </button>
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

        .verification-instructions {
          background: #f9f9f9;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .instruction {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          text-align: left;
        }

        .instruction:last-child {
          margin-bottom: 0;
        }

        .instruction-icon {
          width: 28px;
          height: 28px;
          background: #ffc107;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          flex-shrink: 0;
        }

        .verification-actions {
          text-align: center;
        }

        .resend-text {
          font-size: 0.9375rem;
          color: #666;
          margin-bottom: 20px;
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
      `}</style>
    </div>
  );
};

export default EmailVerificationStep;
