import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { teacherMailbox, tooltip } from './animations';
import SuggestionModal from './SuggestionModal';
import LetterAnimation from './LetterAnimation';
import './SuggestionBox.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TeacherSuggestionBox = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [letterAnimation, setLetterAnimation] = useState({
    isAnimating: false,
    startPosition: null,
    endPosition: null,
  });

  const mailboxRef = useRef(null);
  const controls = useAnimation();

  // Start idle animation on mount
  useEffect(() => {
    controls.start('idle');
  }, [controls]);

  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('teacher-suggestion-tooltip-seen');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('teacher-suggestion-tooltip-seen', 'true');
        }, 5000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show tooltip on hover
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered && !isModalOpen) {
      const timer = setTimeout(() => setShowTooltip(true), 300);
      return () => clearTimeout(timer);
    } else if (!isHovered) {
      setShowTooltip(false);
    }
  }, [isHovered, isModalOpen]);

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

      // Get teacher auth token if available
      const token = localStorage.getItem('teacherToken');

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
          portal: 'teacher',
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
        className="suggestion-box--teacher"
        onClick={handleOpenModal}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        variants={teacherMailbox}
        initial="initial"
        animate={controls}
        whileHover="hover"
        whileTap="tap"
        aria-label="Open suggestion box to share feedback"
        aria-haspopup="dialog"
      >
        {/* Teacher mailbox/suggestion box image */}
        <img
          src="/assets/suggestions/teacher_mailbox.png"
          alt=""
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
            Share your feedback
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <SuggestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        variant="teacher"
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

export default TeacherSuggestionBox;
