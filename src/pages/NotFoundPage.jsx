import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Compass } from 'lucide-react';

/**
 * 404 Not Found Page
 * Shown when a user navigates to a route that doesn't exist
 */
const NotFoundPage = () => {
  const location = useLocation();

  // Determine if this looks like a teacher route
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  // Determine if this looks like a parent route
  const isParentRoute = location.pathname.startsWith('/parent');
  // Determine if this looks like a child/learn route
  const isChildRoute = location.pathname.startsWith('/learn') ||
                       location.pathname.startsWith('/study') ||
                       location.pathname.startsWith('/quiz');

  // Determine where to send the user home
  const homeRoute = isTeacherRoute ? '/teacher/dashboard' :
                   isParentRoute ? '/parent' :
                   isChildRoute ? '/learn' : '/';

  // Show child-friendly 404 for learning routes
  if (isChildRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-black"
        >
          {/* Fun illustration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-8xl mb-4"
          >
            🗺️
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Whoops! Lost in Space!
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            This page seems to have floated away. Let's get you back to learning!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/learn"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-black font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-lg"
            >
              <Compass className="w-6 h-6" />
              Back to Learning!
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Teacher portal 404
  if (isTeacherRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teacher-paper to-teacher-chalk/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-white rounded-2xl shadow-teacher-lg p-8 text-center"
        >
          {/* 404 Number */}
          <div className="text-8xl font-display font-bold text-teacher-ink/10 mb-4">
            404
          </div>

          <h1 className="text-2xl font-display font-semibold text-teacher-ink mb-3">
            Page Not Found
          </h1>
          <p className="text-teacher-inkLight mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/teacher/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teacher-chalk text-white font-semibold rounded-xl hover:bg-teacher-chalkHover transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teacher-paper text-teacher-ink font-semibold rounded-xl border border-teacher-ink/10 hover:bg-teacher-ink/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default 404 page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {/* 404 Number */}
        <div className="text-9xl font-bold text-gray-100 mb-2">
          404
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Suggestions */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <p className="font-semibold text-gray-900 mb-3">Looking for something?</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in to your account
              </Link>
            </li>
            <li>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Create a new account
              </Link>
            </li>
            <li>
              <Link to="/teacher/login" className="text-blue-600 hover:underline">
                Teacher portal login
              </Link>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
