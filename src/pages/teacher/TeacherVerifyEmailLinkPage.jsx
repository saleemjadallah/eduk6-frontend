import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

/**
 * TeacherVerifyEmailLinkPage
 *
 * Handles email verification via link (lower friction than OTP).
 * Users land here when clicking the verification link in their email.
 *
 * URL: /teacher/verify-email-link?token=xxx
 */
const TeacherVerifyEmailLinkPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailLink, isAuthenticated, refreshAuth } = useTeacherAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'expired'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided. Please use the link from your email.');
      return;
    }

    // Verify the token
    const verify = async () => {
      try {
        const result = await verifyEmailLink(token);

        if (result.success) {
          setStatus('success');
          // Refresh auth state to get updated emailVerified status
          if (isAuthenticated) {
            await refreshAuth();
          }
        } else {
          if (result.error?.includes('expired')) {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          setErrorMessage(result.error || 'Verification failed');
        }
      } catch (err) {
        if (err.message?.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setErrorMessage(err.message || 'Verification failed. Please try again.');
      }
    };

    verify();
  }, [searchParams, verifyEmailLink, isAuthenticated, refreshAuth]);

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      navigate('/teacher/dashboard', { replace: true });
    } else {
      navigate('/teacher/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="p-6">
        <Link to="/teacher" className="flex items-center w-fit">
          <img
            src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png"
            alt="Orbit Learn"
            className="h-16 md:h-20 w-auto rounded-xl"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Verifying State */}
            {status === 'verifying' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">
                  Your email has been successfully verified. You now have full access to all features including subscription upgrades.
                </p>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </button>
              </>
            )}

            {/* Expired State */}
            {status === 'expired' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
                <p className="text-gray-600 mb-6">
                  This verification link has expired. Please request a new verification link from your dashboard settings.
                </p>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </button>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherVerifyEmailLinkPage;
