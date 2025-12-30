import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated prompt encouraging users to rotate their iPad to landscape mode.
 * Shows only once per session when device is in portrait orientation.
 */
const RotateDevicePrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Check if we've already shown the prompt this session
    const hasShownPrompt = sessionStorage.getItem('rotatePromptShown');
    if (hasShownPrompt) return;

    // Check if this is a tablet-sized device (iPad)
    const isTablet = window.innerWidth >= 768 || window.innerHeight >= 768;
    if (!isTablet) return;

    // Check initial orientation
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);

      // Show prompt only if in portrait and hasn't been shown
      if (portrait && !sessionStorage.getItem('rotatePromptShown')) {
        setIsVisible(true);
      } else if (!portrait) {
        // Auto-hide when rotated to landscape
        setIsVisible(false);
      }
    };

    checkOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('rotatePromptShown', 'true');
  };

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/10 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated iPad rotation icon */}
            <div className="relative w-32 h-32">
              {/* iPad outline - portrait */}
              <motion.div
                animate={{
                  rotate: [0, 0, -90, -90, 0],
                  scale: [1, 1, 1, 1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.5, 0.8, 1]
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  width="80"
                  height="100"
                  viewBox="0 0 80 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-lg"
                >
                  {/* iPad body */}
                  <rect
                    x="4"
                    y="4"
                    width="72"
                    height="92"
                    rx="8"
                    stroke="white"
                    strokeWidth="3"
                    fill="rgba(255,255,255,0.1)"
                  />
                  {/* Screen */}
                  <rect
                    x="10"
                    y="12"
                    width="60"
                    height="68"
                    rx="2"
                    fill="rgba(255,255,255,0.2)"
                  />
                  {/* Home button / indicator */}
                  <circle
                    cx="40"
                    cy="88"
                    r="4"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Camera */}
                  <circle
                    cx="40"
                    cy="8"
                    r="2"
                    fill="rgba(255,255,255,0.5)"
                  />
                </svg>
              </motion.div>

              {/* Rotation arrows */}
              <motion.div
                animate={{
                  opacity: [0, 1, 1, 0, 0],
                  rotate: [0, 0, 180, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.5, 0.85, 1]
                }}
                className="absolute -right-2 top-1/2 -translate-y-1/2"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                    fill="#FFD700"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Text */}
            <div className="text-center">
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Rotate for Best Experience
              </motion.h3>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg max-w-xs"
              >
                Turn your iPad sideways for better visibility of lessons and Ollie!
              </motion.p>
            </div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/50 text-sm mt-2"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RotateDevicePrompt;
