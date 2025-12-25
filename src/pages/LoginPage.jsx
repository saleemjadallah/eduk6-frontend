import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/Onboarding/ForgotPasswordModal';
import GoogleSignInButton from '../components/Onboarding/GoogleSignInButton';
import { ExitIntentPopup } from '../components/Landing';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    signIn,
    googleSignIn,
    isLoading,
    isAuthenticated,
    hasConsent,
    children,
    needsEmailVerification,
    needsConsent,
    needsChildProfile,
    isReady,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Track if we just signed in to handle post-login redirect
  const justSignedIn = useRef(false);

  // Redirect based on authentication state
  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      // Determine where to redirect
      let targetPath = '/learn'; // Default destination
      let targetState = undefined;

      if (needsEmailVerification) {
        targetPath = '/onboarding';
        targetState = { step: 'email_verification' };
      } else if (needsConsent) {
        targetPath = '/onboarding';
        targetState = { step: 'consent_method' };
      } else if (needsChildProfile) {
        targetPath = '/onboarding';
        targetState = { step: 'create_profile' };
      }
      // If none of the above, targetPath remains '/learn'

      // For post-login redirect, use window.location to ensure clean navigation
      // This avoids race conditions with React state propagation
      if (justSignedIn.current) {
        justSignedIn.current = false;
        window.location.href = targetPath;
      } else {
        // For initial page load redirects (already authenticated), use navigate
        navigate(targetPath, targetState ? { state: targetState, replace: true } : { replace: true });
      }
    }
  }, [isAuthenticated, hasConsent, children, needsEmailVerification, needsConsent, needsChildProfile, isReady, navigate]);

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
      // Mark that we're signing in so the useEffect uses window.location
      justSignedIn.current = true;
      await signIn(formData.email, formData.password);
      // Navigation is handled by the useEffect after auth state updates
    } catch (err) {
      justSignedIn.current = false;
      setApiError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setGoogleLoading(true);
    setApiError('');

    try {
      justSignedIn.current = true;
      const result = await googleSignIn(idToken);

      // For new Google users, redirect to onboarding consent step
      if (result.isNewUser) {
        window.location.href = '/onboarding?step=consent_method';
      }
      // For existing users, useEffect will handle redirect based on their state
    } catch (err) {
      justSignedIn.current = false;
      setApiError(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setApiError(error || 'Google sign in failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center w-fit">
          <img src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png" alt="Orbit Learn" className="h-16 md:h-20 w-auto rounded-xl" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            {/* Ollie Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <img
                src="/assets/images/ollie-avatar.png"
                alt="Ollie"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black font-comic mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Sign in to continue learning with Ollie</p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:border-nanobanana-blue focus:outline-none transition-colors`}
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:border-nanobanana-blue focus:outline-none transition-colors`}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full bg-nanobanana-yellow text-black font-bold py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t-2 border-gray-200"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t-2 border-gray-200"></div>
            </div>

            {/* Google Sign-In */}
            <div className="mb-6 relative">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isLoading || googleLoading}
                text="signin_with"
              />
              {googleLoading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/90 rounded-xl">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm text-gray-600">Signing in with Google...</span>
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/onboarding" className="text-nanobanana-blue font-bold hover:underline">
                Sign up
              </Link>
            </p>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-nanobanana-blue font-medium hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-nanobanana-blue hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-nanobanana-blue hover:underline">Privacy Policy</a>.
            </p>
            <p className="mt-2">
              We take your child's privacy seriously.{' '}
              <a href="/coppa" className="text-nanobanana-blue hover:underline">Learn about our COPPA compliance</a>.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
};

export default LoginPage;
