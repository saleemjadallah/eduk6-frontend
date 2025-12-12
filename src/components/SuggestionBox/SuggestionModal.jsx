import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, MessageSquare } from 'lucide-react';
import {
  modalBackdrop,
  studentModal,
  teacherModal,
  formElements,
  buttonPress,
  successCheckmark,
  successCircle,
  successConfetti,
} from './animations';

const CONFETTI_COLORS = ['#FFD700', '#4169E1', '#22C55E', '#EC4899', '#F59E0B', '#8B5CF6'];

const SuggestionModal = ({
  isOpen,
  onClose,
  onSubmit,
  variant = 'student',
  isSubmitting = false,
  isSuccess = false,
}) => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  const isStudent = variant === 'student';
  const modalVariants = isStudent ? studentModal : teacherModal;
  const maxChars = 1000;
  const minChars = 10;

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current && !isSuccess) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, isSuccess]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setEmail('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.length < minChars || isSubmitting) return;
    onSubmit({ message, email });
  };

  const charCount = message.length;
  const isOverLimit = charCount > maxChars;
  const canSubmit = charCount >= minChars && !isOverLimit && !isSubmitting;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="suggestion-modal-overlay">
          {/* Backdrop */}
          <motion.div
            className="suggestion-modal-backdrop"
            {...modalBackdrop}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`suggestion-modal suggestion-modal--${variant}`}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-modal-title"
          >
            {/* Close button */}
            <motion.button
              className="btn-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close modal"
            >
              <X size={18} />
            </motion.button>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <SuccessState key="success" variant={variant} />
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Header */}
                  <motion.div className="modal-header" variants={formElements.item}>
                    <img
                      src={`/assets/suggestions/${isStudent ? 'student_mailbox' : 'teacher_mailbox'}.png`}
                      alt=""
                      className="modal-icon"
                    />
                    <div>
                      <h2 id="suggestion-modal-title" className="modal-title">
                        {isStudent ? 'Share Your Ideas!' : 'Share Your Feedback'}
                      </h2>
                      <p className="modal-subtitle">
                        {isStudent
                          ? "We'd love to hear what you think!"
                          : 'Help us improve OrbitLearn for educators'}
                      </p>
                    </div>
                  </motion.div>

                  {/* Message field */}
                  <motion.div className="form-group" variants={formElements.item}>
                    <label htmlFor="suggestion-message" className="form-label">
                      <MessageSquare size={16} style={{ display: 'inline', marginRight: 6 }} />
                      {isStudent ? 'Your Idea' : 'Your Suggestion'}
                    </label>
                    <textarea
                      ref={textareaRef}
                      id="suggestion-message"
                      className="form-textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isStudent
                          ? 'What would make learning more fun? Tell us your ideas!'
                          : 'Share your ideas, feature requests, or feedback...'
                      }
                      maxLength={maxChars + 50}
                      aria-describedby="char-count"
                    />
                    <div
                      id="char-count"
                      className={`char-count ${isOverLimit ? 'warning' : ''}`}
                    >
                      {charCount} / {maxChars} characters
                      {charCount < minChars && charCount > 0 && (
                        <span> (minimum {minChars})</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Email field */}
                  <motion.div className="form-group" variants={formElements.item}>
                    <label htmlFor="suggestion-email" className="form-label">
                      <Mail size={16} style={{ display: 'inline', marginRight: 6 }} />
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="suggestion-email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        isStudent
                          ? "Your parent's email (if you want a reply)"
                          : 'Your email (if you would like us to follow up)'
                      }
                    />
                    <p className="form-hint">
                      {isStudent
                        ? 'Leave this empty if you prefer not to share.'
                        : "We'll only use this to respond to your feedback."}
                    </p>
                  </motion.div>

                  {/* Actions */}
                  <motion.div className="modal-actions" variants={formElements.item}>
                    <motion.button
                      type="button"
                      className="btn-cancel"
                      onClick={onClose}
                      {...buttonPress}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn-submit"
                      disabled={!canSubmit}
                      {...buttonPress}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {isStudent ? 'Send My Idea!' : 'Submit Feedback'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Success state component
const SuccessState = ({ variant }) => {
  const isStudent = variant === 'student';

  return (
    <motion.div
      className="suggestion-success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Confetti particles (student only) */}
      {isStudent && (
        <div className="confetti-container">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="confetti-particle"
              style={{
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
              variants={successConfetti}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}
        </div>
      )}

      {/* Success icon */}
      <div className="success-icon-wrapper">
        <motion.div
          className="success-circle"
          variants={successCircle}
          initial="initial"
          animate="animate"
        />
        <motion.svg
          className="success-checkmark"
          viewBox="0 0 24 24"
          variants={successCheckmark}
          initial="initial"
          animate="animate"
        >
          <motion.path d="M5 12l5 5L19 7" />
        </motion.svg>
      </div>

      {/* Success text */}
      <motion.h3
        className="success-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isStudent ? 'Awesome! Thanks!' : 'Thank You!'}
      </motion.h3>
      <motion.p
        className="success-message"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {isStudent
          ? 'Your idea is on its way to our team!'
          : 'Your feedback helps us improve OrbitLearn.'}
      </motion.p>
    </motion.div>
  );
};

export default SuggestionModal;
