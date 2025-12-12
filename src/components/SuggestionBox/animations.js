/**
 * Framer Motion animation variants for the Suggestion Box
 * Two versions: Student (playful) and Teacher (professional)
 */

// =========================================
// STUDENT PORTAL ANIMATIONS
// Playful, bouncy, cartoon-like
// =========================================

export const studentMailbox = {
  // Idle breathing animation
  idle: {
    y: [0, -8, 0],
    rotate: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // Initial state (for AnimatePresence)
  initial: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },

  // Animate in on mount
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.5,
    },
  },

  // Exit animation
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },

  // Hover state - excited wiggle
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, -5, 5, 0],
    transition: {
      scale: { duration: 0.2 },
      rotate: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    },
  },

  // Tap/click state - squish
  tap: {
    scale: 0.9,
    rotate: 0,
    transition: { duration: 0.1 },
  },

  // Receiving letter - gulp animation
  receive: {
    scale: [1, 1.2, 0.9, 1.05, 1],
    rotate: [0, -5, 5, -2, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.2, 0.4, 0.7, 1],
      ease: 'easeOut',
    },
  },
};

// Student mailbox flag animation
export const studentFlag = {
  down: {
    rotate: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  up: {
    rotate: -45,
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
};

// =========================================
// TEACHER PORTAL ANIMATIONS
// Subtle, professional, refined
// =========================================

export const teacherMailbox = {
  // Gentle idle float
  idle: {
    y: [0, -4, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // Initial state
  initial: {
    scale: 0.8,
    opacity: 0,
    y: 20,
  },

  // Animate in on mount
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      delay: 0.5,
    },
  },

  // Exit animation
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 },
  },

  // Hover state - subtle lift and glow
  hover: {
    scale: 1.05,
    y: -2,
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Tap state
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },

  // Receiving - subtle pulse
  receive: {
    scale: [1, 1.08, 0.98, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.3, 0.6, 1],
      ease: 'easeOut',
    },
  },
};

// =========================================
// MODAL ANIMATIONS
// =========================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const studentModal = {
  initial: {
    opacity: 0,
    scale: 0.5,
    y: 100,
    rotate: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: 100,
    rotate: 10,
    transition: { duration: 0.2 },
  },
};

export const teacherModal = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 250,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 30,
    transition: { duration: 0.2 },
  },
};

// =========================================
// LETTER FLYING ANIMATION
// =========================================

export const createLetterFlyAnimation = (targetX, targetY) => ({
  initial: {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    x: [0, -50, -30, targetX],
    y: [0, -120, -80, targetY],
    scale: [1, 1.3, 1.1, 0.3],
    rotate: [0, 15, -10, 360],
    opacity: [1, 1, 1, 0],
    transition: {
      duration: 1.2,
      times: [0, 0.25, 0.5, 1],
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
});

// =========================================
// SUCCESS ANIMATIONS
// =========================================

export const successCheckmark = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut' },
      opacity: { duration: 0.2 },
    },
  },
};

export const successCircle = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

export const successConfetti = {
  initial: { y: 0, opacity: 1, scale: 1 },
  animate: (i) => ({
    y: [-20, -60 - Math.random() * 40],
    x: (Math.random() - 0.5) * 100,
    opacity: [1, 1, 0],
    scale: [1, 1.2, 0.8],
    rotate: Math.random() * 360,
    transition: {
      duration: 0.8 + Math.random() * 0.4,
      delay: i * 0.05,
      ease: 'easeOut',
    },
  }),
};

// =========================================
// FORM ELEMENT ANIMATIONS
// =========================================

export const formElements = {
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  },
};

export const buttonPress = {
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

// =========================================
// TOOLTIP ANIMATION
// =========================================

export const tooltip = {
  initial: { opacity: 0, x: 10, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};
