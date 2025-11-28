import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/Onboarding/ForgotPasswordModal';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    signIn,
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

  // Redirect based on authentication state
  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      // Check what the user needs to complete
      if (needsEmailVerification) {
        navigate('/onboarding', { state: { step: 'email_verification' } });
      } else if (needsConsent) {
        navigate('/onboarding', { state: { step: 'consent_method' } });
      } else if (needsChildProfile) {
        navigate('/onboarding', { state: { step: 'create_profile' } });
      } else if (hasConsent && children.length > 0) {
        // Fully set up - go to dashboard
        navigate('/learn');
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
      await signIn(formData.email, formData.password);
      // Navigation is handled by the useEffect after auth state updates
    } catch (err) {
      setApiError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center w-fit">
          <img src="/assets/Logo-nobg.png" alt="OrbitLearn" className="h-16 md:h-20 w-auto" />
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
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black font-comic mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Sign in to continue learning</p>
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
                disabled={isLoading}
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
              <a href="/privacy" className="text-nanobanana-blue hover:underline">Privacy Policy</a>.
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
    </div>
  );
};

export default LoginPage;
