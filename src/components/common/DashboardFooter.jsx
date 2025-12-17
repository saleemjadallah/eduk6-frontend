import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DashboardFooter - Reusable footer component for authenticated dashboard pages
 * Displays legal links (Terms, Privacy, COPPA) consistently across all dashboards
 *
 * @param {Object} props
 * @param {string} [props.variant='default'] - 'default' | 'minimal' | 'child' - styling variant
 * @param {string} [props.className] - Additional CSS classes
 */
const DashboardFooter = ({ variant = 'default', className = '' }) => {
  const currentYear = new Date().getFullYear();

  // Minimal variant for child-facing pages (simpler, less distracting)
  if (variant === 'child') {
    return (
      <footer className={`py-4 px-6 text-center ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>&copy; {currentYear} Orbit Learn</span>
          <span className="hidden sm:inline">|</span>
          <Link to="/terms" className="hover:text-gray-600 transition-colors">
            Terms
          </Link>
          <Link to="/privacy-policy" className="hover:text-gray-600 transition-colors">
            Privacy
          </Link>
          <Link to="/coppa" className="hover:text-gray-600 transition-colors">
            Kids' Privacy
          </Link>
        </div>
      </footer>
    );
  }

  // Minimal variant - single line, subtle
  if (variant === 'minimal') {
    return (
      <footer className={`py-4 px-6 border-t border-gray-100 ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span>&copy; {currentYear} Orbit Learn</span>
          <span className="text-gray-300">|</span>
          <Link to="/terms" className="hover:text-indigo-600 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/coppa" className="hover:text-indigo-600 transition-colors">
            COPPA Compliance
          </Link>
        </div>
      </footer>
    );
  }

  // Default variant - full footer with more details
  return (
    <footer className={`py-6 px-6 border-t border-gray-200 bg-gray-50/50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            &copy; {currentYear} Orbit Learn. All rights reserved.
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              to="/terms"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/coppa"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              COPPA Compliance
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
