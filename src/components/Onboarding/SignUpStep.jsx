import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import GoogleSignInButton from './GoogleSignInButton';

const SignUpStep = ({ isSignIn = false, onComplete, onSwitchToSignIn, onSwitchToSignUp }) => {
  const { signUp, signIn, googleSignIn, isLoading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!isSignIn) {
      // Additional password checks for sign up
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    // Confirm password (sign up only)
    if (!isSignIn && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setApiError('');

    try {
      if (isSignIn) {
        await signIn(formData.email, formData.password);
        onComplete?.();
      } else {
        await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        // Pass email to the next step for verification
        onComplete?.(formData.email);
      }
    } catch (err) {
      setApiError(err.message || `Failed to ${isSignIn ? 'sign in' : 'sign up'}`);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setGoogleLoading(true);
    setApiError('');

    try {
      const result = await googleSignIn(idToken);
      // Pass isNewUser flag so OnboardingFlow can handle appropriately
      // New users skip email verification (Google already verified) and go to consent
      onComplete?.({ isGoogleAuth: true, isNewUser: result.isNewUser });
    } catch (err) {
      setApiError(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setApiError(error || 'Google sign in failed');
  };

  return (
    <div className="signup-step">
      <div className="step-header">
        <h2>{isSignIn ? 'Welcome Back!' : 'Create Your Account'}</h2>
        <p className="subtitle">
          {isSignIn
            ? 'Sign in to continue learning with Jeffrey'
            : "Join OrbitLearn and help your child learn with Jeffrey"}
        </p>
      </div>

      {apiError && <div className="error-message">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {!isSignIn && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="parent@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder={isSignIn ? 'Your password' : 'Create a strong password'}
            value={formData.password}
            onChange={handleChange}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
          {!isSignIn && !errors.password && (
            <div className="form-hint">
              At least 8 characters with uppercase, lowercase, and number
            </div>
          )}
        </div>

        {!isSignIn && (
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="form-error">{errors.confirmPassword}</div>
            )}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isLoading || googleLoading}>
          {isLoading ? (
            <>
              <span className="loading-spinner" />
              {isSignIn ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            isSignIn ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <div className="google-signin-wrapper">
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={isLoading || googleLoading}
          text={isSignIn ? 'signin_with' : 'continue_with'}
        />
        {googleLoading && (
          <div className="google-loading-overlay">
            <span className="loading-spinner" />
            <span>Signing in with Google...</span>
          </div>
        )}
      </div>

      <div className="auth-switch">
        {isSignIn ? (
          <p>
            Don't have an account?{' '}
            <button type="button" className="link-btn" onClick={onSwitchToSignUp}>
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button type="button" className="link-btn" onClick={onSwitchToSignIn}>
              Sign in
            </button>
          </p>
        )}
      </div>

      {isSignIn && (
        <div className="forgot-password">
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot your password?
          </button>
        </div>
      )}

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .auth-switch {
          text-align: center;
          font-size: 0.9375rem;
          color: #666;
        }

        .auth-switch p {
          margin: 0;
        }

        .forgot-password {
          text-align: center;
          margin-top: 12px;
        }

        .google-signin-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .google-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          font-size: 14px;
          color: #666;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpStep;
