import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, LogOut, Menu, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });

  const handleLogout = async () => {
    await api.logout();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/pricing', label: 'Pricing' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                src="/logo-icon.png"
                alt="Mydscvr - AI-Powered Food Photography"
                className="h-12 w-12"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
              <div className="flex flex-col leading-snug">
                <span className="text-2xl font-bold text-charcoal lowercase tracking-tight">
                  mydscvr
                </span>
                <span className="hidden text-xs text-slate md:block">
                  AI-Powered Food Photography
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-3 py-2 text-sm font-medium text-charcoal hover:text-saffron transition-colors"
                >
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-saffron-50 rounded-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/generate"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-white text-sm font-medium hover:bg-saffron-600 hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 transition-colors cursor-pointer"
                    title="Account settings"
                  >
                    <User className="w-4 h-4 text-charcoal" />
                    <span className="text-sm text-charcoal">
                      {user.firstName || user.email}
                    </span>
                  </Link>
                  <motion.button
                    onClick={handleLogout}
                    className="p-3 rounded-lg hover:bg-berry/10 hover:text-berry active:bg-berry/20 transition-colors group cursor-pointer"
                    title="Sign out"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <LogOut className="w-5 h-5 text-charcoal group-hover:text-berry transition-colors" />
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-charcoal hover:text-saffron transition-colors"
                  >
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg gradient-saffron text-white text-sm font-semibold hover:shadow-xl shadow-saffron-300/50 transition-all"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-cream-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-charcoal" />
              ) : (
                <Menu className="w-6 h-6 text-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-charcoal/10 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-cream-200"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/generate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg bg-saffron text-white text-center font-medium"
                  >
                    Generate Images
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-charcoal hover:bg-cream-200 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Account Settings
                  </Link>
                  <motion.button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-berry hover:bg-berry/10 active:bg-berry/20 transition-colors flex items-center gap-2 cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-cream-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg gradient-saffron text-white text-center font-semibold shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo-icon.png"
                  alt="Mydscvr - AI-Powered Food Photography"
                  className="h-16 w-16"
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-charcoal lowercase">mydscvr</span>
                  <span className="text-xs text-slate tracking-wide">
                    AI-Powered Food Photography
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate leading-relaxed">
                Transform your menu into stunning visuals with AI. Professional food photography for restaurants, delivery apps, and social media.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate">
                <li>
                  <Link to="/pricing" className="hover:text-saffron">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-saffron">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate">
                <li><a href="#" className="hover:text-saffron">About</a></li>
                <li><a href="#" className="hover:text-saffron">Contact</a></li>
                <li><a href="#" className="hover:text-saffron">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-charcoal/10 text-center text-sm text-slate">
            <p>&copy; 2025 Jasmine Entertainment FZE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
