import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, Sparkles, FileText, CheckCircle, ArrowRight, BookOpen, Clock, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Teacher Exit Intent Popup - Retro Classroom Design
 * Sophisticated, warm academic aesthetic matching teacher portal
 */
const TeacherExitIntentPopup = () => {
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
    const hasSeenPopup = sessionStorage.getItem('teacherExitIntentShown');
    if (hasSeenPopup) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasTriggered.current) {
        hasTriggered.current = true;
        setIsVisible(true);
        sessionStorage.setItem('teacherExitIntentShown', 'true');
      }
    };

    // Mobile fallback: 45 seconds
    const inactivityTimer = setTimeout(() => {
      if (!hasTriggered.current) {
        const hasSeenPopup = sessionStorage.getItem('teacherExitIntentShown');
        if (!hasSeenPopup) {
          hasTriggered.current = true;
          setIsVisible(true);
          sessionStorage.setItem('teacherExitIntentShown', 'true');
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

  // Close on escape
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
          source: 'exit_intent_teacher',
          leadMagnet: 'teacher_toolkit',
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

  const toolkitFeatures = [
    { icon: FileText, text: 'Lesson plan templates' },
    { icon: Clock, text: 'Time-saving strategies' },
    { icon: Zap, text: 'AI prompt guides' },
    { icon: BookOpen, text: 'Assessment frameworks' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-teacher-ink/50 backdrop-blur-sm z-[100]"
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-lg pointer-events-auto">
              {/* Decorative elements - subtle, academic */}
              <motion.div
                animate={{ y: [-6, 6, -6], rotate: [0, 3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 w-12 h-12 bg-teacher-gold/30 rounded-2xl border-2 border-teacher-gold/40 z-0 hidden sm:block"
              />
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-3 -right-3 w-10 h-10 bg-teacher-sage/25 rounded-full border-2 border-teacher-sage/35 z-0 hidden sm:block"
              />

              {/* Main Card - Paper-like texture */}
              <div className="relative bg-teacher-cream rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Paper texture overlay */}
                <div
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white hover:bg-teacher-chalk/10 rounded-full border-2 border-teacher-ink/20 transition-colors"
                >
                  <X className="w-4 h-4 text-teacher-ink" />
                </button>

                {/* Header - Chalkboard inspired */}
                <div className="relative bg-gradient-to-br from-teacher-chalk to-teacher-chalkLight px-6 pt-8 pb-10 overflow-hidden">
                  {/* Chalk dust effect */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
                      }}
                    />
                  </div>

                  {/* Grid lines like notebook paper */}
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
                      backgroundSize: '100% 24px',
                    }}
                  />

                  {/* Badge */}
                  <motion.div
                    initial={{ rotate: -8, scale: 0 }}
                    animate={{ rotate: -8, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="absolute -top-1 -left-1 bg-teacher-gold text-teacher-ink px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    FREE TOOLKIT
                  </motion.div>

                  <div className="relative z-10 text-center pt-3">
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2 leading-tight tracking-tight">
                        Wait! Grab Your Free
                        <br />
                        <span className="text-teacher-gold">AI Teaching Toolkit</span>
                      </h2>
                      <p className="text-teacher-sage/90 text-sm font-medium">
                        Save hours on lesson prep every week
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 -mt-4 relative z-10">
                  {/* Resource Preview Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 mb-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Document icon */}
                      <div className="flex-shrink-0 w-14 h-18 bg-gradient-to-br from-teacher-terracotta/10 to-teacher-gold/10 rounded-lg border-2 border-teacher-terracotta/30 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-teacher-terracotta" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-teacher-ink text-base leading-snug mb-1">
                          The AI Teaching Toolkit
                        </h3>
                        <p className="text-sm text-teacher-inkLight leading-relaxed">
                          Templates, prompts, and strategies to supercharge your teaching with AI.
                        </p>
                      </div>
                    </div>

                    {/* Features grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {toolkitFeatures.map((feature, i) => (
                        <motion.div
                          key={feature.text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-teacher-sage/15 flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-3 h-3 text-teacher-sage" />
                          </div>
                          <span className="text-teacher-ink/80 font-medium">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Form or Success */}
                  <AnimatePresence mode="wait">
                    {!isSuccess ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-3"
                      >
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teacher-inkLight/50" />
                          <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your school email"
                            className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all outline-none font-medium bg-white text-teacher-ink placeholder:text-teacher-inkLight/40"
                            disabled={isLoading}
                          />
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-teacher-coral text-sm font-medium text-center"
                          >
                            {error}
                          </motion.p>
                        )}

                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full bg-teacher-chalk text-white text-base font-bold py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Get Free Toolkit
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>

                        <p className="text-xs text-teacher-inkLight/60 text-center">
                          Join 2,000+ teachers. No spam, unsubscribe anytime.
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
                          className="w-16 h-16 bg-teacher-sage rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <CheckCircle className="w-8 h-8 text-white" />
                        </motion.div>

                        <div>
                          <h3 className="text-xl font-black font-display text-teacher-ink mb-1">
                            You're All Set!
                          </h3>
                          <p className="text-teacher-inkLight text-sm">
                            Your toolkit is ready to download.
                          </p>
                        </div>

                        <motion.button
                          onClick={handleDownload}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full bg-teacher-terracotta text-white text-base font-bold py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Toolkit
                        </motion.button>

                        <button
                          onClick={handleClose}
                          className="text-teacher-inkLight hover:text-teacher-ink text-sm font-medium transition-colors"
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

export default TeacherExitIntentPopup;
