import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import TeacherForgotPasswordModal from '../../components/teacher/TeacherForgotPasswordModal';

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const {
    signIn,
    isLoading,
    isAuthenticated,
    needsEmailVerification,
    isReady,
  } = useTeacherAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Track if we just signed in to handle post-login redirect
  const justSignedIn = useRef(false);

  // Redirect based on authentication state
  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      let targetPath = '/teacher/dashboard';

      if (needsEmailVerification) {
        targetPath = '/teacher/verify-email';
      }

      if (justSignedIn.current) {
        justSignedIn.current = false;
        window.location.href = targetPath;
      } else {
        navigate(targetPath, { replace: true });
      }
    }
  }, [isAuthenticated, needsEmailVerification, isReady, navigate]);

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
      justSignedIn.current = true;
      await signIn(formData.email, formData.password);
    } catch (err) {
      justSignedIn.current = false;
      setApiError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center w-fit">
          <img src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png" alt="OrbitLearn" className="h-16 md:h-20 w-auto rounded-xl" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h1>
              <p className="text-gray-600">Sign in to access your teaching tools</p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
                  placeholder="teacher@school.edu"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
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
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              New to OrbitLearn?{' '}
              <Link to="/teacher/signup" className="text-indigo-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-indigo-600 text-sm hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p className="mb-2">
              Looking for the student/parent portal?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Sign in here
              </Link>
            </p>
            <p>
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>,{' '}
              <a href="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</a>, and{' '}
              <a href="/coppa" className="text-indigo-600 hover:underline">COPPA Compliance</a>.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <TeacherForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
};

export default TeacherLoginPage;
