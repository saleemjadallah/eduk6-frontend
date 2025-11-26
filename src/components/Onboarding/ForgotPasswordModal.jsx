import React, { useState } from 'react';
import { authAPI } from '../../services/api/authAPI';

const STEPS = {
  EMAIL: 'email',
  CODE: 'code',
  NEW_PASSWORD: 'new_password',
  SUCCESS: 'success',
};

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setStep(STEPS.EMAIL);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setStep(STEPS.CODE);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyResetCode(email, code);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(email, newPassword);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        {step === STEPS.EMAIL && (
          <div className="forgot-password-step">
            <h2>Forgot Password?</h2>
            <p className="subtitle">
              Enter your email and we'll send you a code to reset your password.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          </div>
        )}

        {step === STEPS.CODE && (
          <div className="forgot-password-step">
            <h2>Enter Code</h2>
            <p className="subtitle">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input
                  type="text"
                  className="form-input code-input"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                className="link-btn"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {step === STEPS.NEW_PASSWORD && (
          <div className="forgot-password-step">
            <h2>Set New Password</h2>
            <p className="subtitle">Create a strong password for your account.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                />
                <div className="form-hint">
                  At least 8 characters with uppercase, lowercase, and number
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {step === STEPS.SUCCESS && (
          <div className="forgot-password-step success-step">
            <div className="success-icon">&#10003;</div>
            <h2>Password Reset!</h2>
            <p className="subtitle">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button className="btn btn-primary" onClick={handleClose}>
              Back to Sign In
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

          .modal-content {
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 420px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
          }

          .modal-close:hover {
            background: #f0f0f0;
          }

          .forgot-password-step h2 {
            margin: 0 0 8px;
            font-size: 1.5rem;
            color: #1a1a1a;
          }

          .forgot-password-step .subtitle {
            color: #666;
            margin: 0 0 24px;
            font-size: 0.9375rem;
          }

          .error-message {
            background: #fff2f2;
            border: 1px solid #ffcccc;
            color: #cc0000;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 0.875rem;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            color: #333;
            font-size: 0.875rem;
          }

          .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }

          .form-input:focus {
            outline: none;
            border-color: #4a90d9;
          }

          .code-input {
            font-size: 1.5rem;
            letter-spacing: 0.5rem;
            text-align: center;
            font-family: monospace;
          }

          .form-hint {
            font-size: 0.8125rem;
            color: #888;
            margin-top: 6px;
          }

          .btn {
            width: 100%;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary {
            background: #4a90d9;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #3a7bc8;
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .resend-section {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }

          .resend-section p {
            margin: 0 0 8px;
            color: #666;
            font-size: 0.875rem;
          }

          .link-btn {
            background: none;
            border: none;
            color: #4a90d9;
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: underline;
          }

          .link-btn:hover {
            color: #3a7bc8;
          }

          .link-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .success-step {
            text-align: center;
          }

          .success-icon {
            width: 64px;
            height: 64px;
            background: #22c55e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: white;
            font-size: 32px;
            font-weight: bold;
          }

          @media (max-width: 480px) {
            .modal-content {
              padding: 24px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
