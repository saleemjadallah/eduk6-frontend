import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, Sparkles, BookOpen, CheckCircle, ArrowRight, Gift } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Exit Intent Popup - Neobrutalist Design
 * Captures email leads with curriculum guide offer
 */
const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');
  const hasTriggered = useRef(false);
  const inputRef = useRef(null);

  // Exit intent detection
  useEffect(() => {
    // Don't show if already seen in this session
    const hasSeenPopup = sessionStorage.getItem('exitIntentShown');
    if (hasSeenPopup) return;

    const handleMouseLeave = (e) => {
      // Only trigger when mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !hasTriggered.current) {
        hasTriggered.current = true;
        setIsVisible(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Also trigger after 45 seconds of inactivity on page (mobile fallback)
    const inactivityTimer = setTimeout(() => {
      if (!hasTriggered.current) {
        const hasSeenPopup = sessionStorage.getItem('exitIntentShown');
        if (!hasSeenPopup) {
          hasTriggered.current = true;
          setIsVisible(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(inactivityTimer);
    };
  }, []);

  // Focus input when popup opens
  useEffect(() => {
    if (isVisible && inputRef.current && !isSuccess) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isVisible, isSuccess]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsVisible(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent',
          leadMagnet: 'curriculum_guide',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
        setIsSuccess(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-lg pointer-events-auto">
              {/* Decorative floating shapes */}
              <motion.div
                animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-6 w-16 h-16 bg-nanobanana-yellow rounded-full border-4 border-black z-0 hidden sm:block"
              />
              <motion.div
                animate={{ y: [6, -6, 6], rotate: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 w-12 h-12 bg-nanobanana-green rounded-full border-4 border-black z-0 hidden sm:block"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/2 -right-8 w-8 h-8 bg-pink-400 rounded-full border-4 border-black z-0 hidden sm:block"
              />

              {/* Main Card */}
              <div className="relative bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full border-2 border-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-nanobanana-blue via-blue-500 to-purple-500 px-6 pt-8 pb-12 relative overflow-hidden">
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                  </div>

                  {/* Gift Badge */}
                  <motion.div
                    initial={{ rotate: -12, scale: 0 }}
                    animate={{ rotate: -12, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="absolute -top-2 -left-2 bg-nanobanana-yellow text-black px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    FREE GUIDE
                  </motion.div>

                  <div className="relative z-10 text-center pt-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-2xl sm:text-3xl font-black font-comic text-white mb-2 leading-tight">
                        Wait! Don't Miss Your
                        <br />
                        <span className="text-nanobanana-yellow">Free Curriculum Guide</span>
                      </h2>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 -mt-6 relative z-10">
                  {/* Guide Preview Card */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-20 bg-white rounded-lg border-2 border-black flex items-center justify-center shadow-inner">
                        <BookOpen className="w-8 h-8 text-nanobanana-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">
                          The Complete Parent's Curriculum Guide
                        </h3>
                        <p className="text-sm text-gray-600">
                          25+ pages covering K-8 milestones, curricula comparison, and home learning strategies.
                        </p>
                      </div>
                    </div>

                    {/* What's Inside */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        'Grade-by-grade milestones',
                        'Curriculum comparisons',
                        'Home learning tips',
                        'Warning signs to watch',
                      ].map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-nanobanana-green flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Form or Success State */}
                  <AnimatePresence mode="wait">
                    {!isSuccess ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none font-medium"
                            disabled={isLoading}
                          />
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-sm font-medium text-center"
                          >
                            {error}
                          </motion.p>
                        )}

                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-nanobanana-green text-white text-lg font-bold py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Get My Free Guide
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </motion.button>

                        <p className="text-xs text-gray-500 text-center">
                          We respect your privacy. Unsubscribe anytime.
                        </p>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 15 }}
                          className="w-20 h-20 bg-nanobanana-green rounded-full border-4 border-black flex items-center justify-center mx-auto"
                        >
                          <CheckCircle className="w-10 h-10 text-white" />
                        </motion.div>

                        <div>
                          <h3 className="text-2xl font-black font-comic text-gray-900 mb-2">
                            You're All Set! 🎉
                          </h3>
                          <p className="text-gray-600">
                            Your curriculum guide is ready to download.
                          </p>
                        </div>

                        <motion.button
                          onClick={handleDownload}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-nanobanana-blue text-white text-lg font-bold py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
                        >
                          <Download className="w-5 h-5" />
                          Download Now
                        </motion.button>

                        <button
                          onClick={handleClose}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                        >
                          I'll download later
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
