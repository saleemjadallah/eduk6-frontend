import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherAPI } from '../../services/api/teacherAPI';

const TeacherForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await teacherAPI.requestPasswordReset(email);
      setStep('code');
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await teacherAPI.verifyResetCode(email, code);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
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

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await teacherAPI.resetPassword(email, newPassword);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Step: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a verification code.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step: Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600 mb-6">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full mt-3 text-gray-600 text-sm hover:underline"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Step: Reset */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Password</h2>
              <p className="text-gray-600 mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700"
              >
                Return to Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeacherForgotPasswordModal;
