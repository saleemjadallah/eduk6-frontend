import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { TeacherExitIntentPopup } from '../../components/teacher/landing';

const TeacherSignupPage = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, isAuthenticated, isReady } = useTeacherAuth();

  const [step, setStep] = useState('signup'); // 'signup' | 'verification_sent'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [isAuthenticated, isReady, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      setStep('verification_sent');
    } catch (err) {
      setApiError(err.message || 'Failed to create account. Please try again.');
    }
  };

  // Verification sent view
  if (step === 'verification_sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        <header className="p-6">
          <Link to="/" className="flex items-center w-fit">
            <img src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png" alt="OrbitLearn" className="h-16 md:h-20 w-auto rounded-xl" />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification code to <strong>{formData.email}</strong>.
                Please check your inbox and enter the code to complete your registration.
              </p>
              <Link
                to="/teacher/verify-email"
                state={{ email: formData.email }}
                className="inline-block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Enter Verification Code
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setStep('signup')}
                  className="text-indigo-600 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Teacher Account</h1>
              <p className="text-gray-600">Start using AI-powered teaching tools</p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/teacher/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p className="mb-2">
              Looking for the student/parent portal?{' '}
              <Link to="/onboarding" className="text-indigo-600 hover:underline">
                Sign up here
              </Link>
            </p>
            <p>
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>,{' '}
              <a href="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</a>, and{' '}
              <a href="/coppa" className="text-indigo-600 hover:underline">COPPA Compliance</a>.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Exit Intent Popup */}
      <TeacherExitIntentPopup />
    </div>
  );
};

export default TeacherSignupPage;
