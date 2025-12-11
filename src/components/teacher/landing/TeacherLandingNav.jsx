import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, Users } from 'lucide-react';

const TeacherLandingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', sectionId: 'features' },
    { label: 'Pricing', sectionId: 'pricing' },
    { label: 'FAQ', sectionId: 'faq' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled ? 'w-[95%] max-w-6xl' : 'w-[92%] max-w-5xl'
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl border-2 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-xl border-teacher-ink/10 shadow-[0_8px_32px_rgba(30,42,58,0.15)]'
              : 'bg-white/80 backdrop-blur-md border-teacher-ink/5 shadow-teacher'
          }`}
        >
          {/* Logo */}
          <Link to="/teacher" className="flex items-center gap-2">
            <img
              src="/assets/rebranding-jeffrey-2024/orbit-learn-logo-icon 2.png"
              alt="OrbitLearn"
              className="h-10 w-auto rounded-lg"
            />
            <div className="hidden sm:block">
              <span className="font-display font-bold text-teacher-ink text-lg">OrbitLearn</span>
              <span className="ml-1.5 text-xs font-bold text-teacher-chalk bg-teacher-chalk/10 px-2 py-0.5 rounded-full">
                Teachers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => scrollToSection(link.sectionId)}
                className="px-4 py-2 text-sm font-semibold text-teacher-ink/70 hover:text-teacher-chalk transition-colors rounded-lg hover:bg-teacher-chalk/5"
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-teacher-ink/50 hover:text-teacher-terracotta transition-colors"
            >
              <Users className="w-4 h-4" />
              For Parents
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/teacher/login"
              className="px-4 py-2 text-sm font-bold text-teacher-ink hover:text-teacher-chalk transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/teacher/signup"
              className="flex items-center gap-2 px-5 py-2.5 bg-teacher-chalk text-white text-sm font-bold rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-teacher-ink hover:bg-teacher-chalk/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-teacher-ink/10 shadow-teacher-lg p-4"
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.sectionId}
                    onClick={() => scrollToSection(link.sectionId)}
                    className="w-full text-left px-4 py-3 text-base font-semibold text-teacher-ink hover:bg-teacher-chalk/10 rounded-xl transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <Link
                  to="/"
                  className="flex items-center gap-2 w-full px-4 py-3 text-base font-semibold text-teacher-ink/60 hover:bg-teacher-terracotta/10 rounded-xl transition-colors"
                >
                  <Users className="w-5 h-5" />
                  For Parents & Students
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-teacher-ink/10 space-y-2">
                <Link
                  to="/teacher/login"
                  className="block w-full text-center px-4 py-3 text-base font-bold text-teacher-ink hover:bg-teacher-chalk/10 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/teacher/signup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-teacher-chalk text-white text-base font-bold rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default TeacherLandingNav;
