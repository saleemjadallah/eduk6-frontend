import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { studentMailbox, studentFlag, tooltip } from './animations';
import SuggestionModal from './SuggestionModal';
import LetterAnimation from './LetterAnimation';
import './SuggestionBox.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const StudentSuggestionBox = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [letterAnimation, setLetterAnimation] = useState({
    isAnimating: false,
    startPosition: null,
    endPosition: null,
  });

  const mailboxRef = useRef(null);
  const controls = useAnimation();

  // Animate in on mount, then start idle animation
  useEffect(() => {
    // First animate to visible state, then start idle breathing
    controls.start('animate').then(() => {
      controls.start('idle');
    });
  }, [controls]);

  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('suggestion-box-tooltip-seen');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('suggestion-box-tooltip-seen', 'true');
        }, 4000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
    setIsSuccess(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsSuccess(false);
  }, []);

  const handleSubmit = useCallback(async ({ message, email }) => {
    setIsSubmitting(true);

    try {
      // Get mailbox position for letter animation
      const mailboxRect = mailboxRef.current?.getBoundingClientRect();
      const modalCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      // Get auth token if available
      const token = localStorage.getItem('authToken');

      // Submit to API
      const response = await fetch(`${API_URL}/api/support/suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message,
          email: email || '',
          portal: 'student',
          metadata: {
            page: window.location.pathname,
            browser: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit suggestion');
      }

      // Start letter animation
      if (mailboxRect) {
        setLetterAnimation({
          isAnimating: true,
          startPosition: modalCenter,
          endPosition: {
            x: mailboxRect.left + mailboxRect.width / 2,
            y: mailboxRect.top + mailboxRect.height / 2,
          },
        });
      }

      // Show success after a short delay
      setTimeout(() => {
        setIsSuccess(true);
        // Trigger mailbox receive animation
        controls.start('receive').then(() => controls.start('idle'));
      }, 800);

      // Auto-close modal after success
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting suggestion:', error);
      // Show success anyway to not discourage feedback
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  }, [controls]);

  const handleLetterAnimationComplete = useCallback(() => {
    setLetterAnimation(prev => ({ ...prev, isAnimating: false }));
  }, []);

  return (
    <div className="suggestion-box-wrapper">
      {/* Mailbox button */}
      <motion.button
        ref={mailboxRef}
        className="suggestion-box--student"
        onClick={handleOpenModal}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        variants={studentMailbox}
        initial="initial"
        animate={controls}
        whileHover="hover"
        whileTap="tap"
        aria-label="Open suggestion box to share your ideas"
        aria-haspopup="dialog"
      >
        {/* Main mailbox image */}
        <img
          src="/assets/suggestions/student_mailbox.png"
          alt=""
          aria-hidden="true"
        />

        {/* Flag overlay - raises on hover */}
        <motion.img
          src="/assets/suggestions/student_mailbox_flag.png"
          alt=""
          className="mailbox-flag"
          variants={studentFlag}
          animate={isHovered ? 'up' : 'down'}
          style={{ display: 'none' }} // Hidden unless we have separate flag asset
          aria-hidden="true"
        />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isModalOpen && (
          <motion.div
            className="tooltip"
            variants={tooltip}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            Got an idea? Click me!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <SuggestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        variant="student"
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
      />

      {/* Letter flying animation */}
      <LetterAnimation
        isAnimating={letterAnimation.isAnimating}
        startPosition={letterAnimation.startPosition}
        endPosition={letterAnimation.endPosition}
        onComplete={handleLetterAnimationComplete}
      />
    </div>
  );
};

export default StudentSuggestionBox;
