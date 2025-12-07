import React from 'react';
import { motion } from 'framer-motion';

/**
 * Decorative SVG illustrations for the Teacher Portal
 * These are quirky, hand-drawn style illustrations that complement the design system
 */

// Decorative chalkboard with doodles
export const ChalkboardDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Chalkboard frame */}
    <rect x="10" y="10" width="180" height="140" rx="8" fill="#2D5A4A" />
    <rect x="16" y="16" width="168" height="128" rx="4" fill="#1E4035" />

    {/* Chalk doodles */}
    <g stroke="#FAF7F2" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      {/* Math equation */}
      <text x="30" y="45" fill="#FAF7F2" fontSize="14" fontFamily="serif">2 + 2 = 4</text>

      {/* Star */}
      <path d="M150 35 L153 44 L162 44 L155 50 L158 60 L150 54 L142 60 L145 50 L138 44 L147 44 Z" />

      {/* Squiggly line */}
      <path d="M30 80 Q50 70 70 80 Q90 90 110 80 Q130 70 150 80" />

      {/* Apple */}
      <circle cx="45" cy="110" r="12" />
      <path d="M45 98 L45 93" />
      <path d="M45 93 Q52 90 50 95" />

      {/* ABC */}
      <text x="100" y="120" fill="#FAF7F2" fontSize="16" fontFamily="serif">ABC</text>
    </g>

    {/* Chalk dust */}
    <circle cx="170" cy="130" r="2" fill="#FAF7F2" opacity="0.4" />
    <circle cx="165" cy="135" r="1.5" fill="#FAF7F2" opacity="0.3" />
    <circle cx="175" cy="138" r="1" fill="#FAF7F2" opacity="0.5" />
  </svg>
);

// Animated pencil drawing line
export const PencilDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pencil */}
    <g transform="rotate(-45 60 60)">
      {/* Body */}
      <rect x="40" y="20" width="16" height="70" fill="#D4A853" />
      {/* Stripe */}
      <rect x="40" y="20" width="16" height="10" fill="#C75B39" />
      {/* Ferrule */}
      <rect x="38" y="85" width="20" height="8" fill="#9D9790" />
      {/* Eraser */}
      <rect x="40" y="93" width="16" height="10" rx="2" fill="#E07B6B" />
      {/* Tip */}
      <polygon points="40,20 56,20 48,5" fill="#FAF7F2" />
      <polygon points="46,5 50,5 48,0" fill="#1E2A3A" />
    </g>

    {/* Drawing line */}
    <motion.path
      d="M25 95 Q40 85 55 90 Q70 95 85 88"
      stroke="#1E2A3A"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
    />
  </svg>
);

// Stack of papers/documents
export const PaperStackDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Back papers */}
    <rect x="15" y="12" width="60" height="75" rx="2" fill="#E8E4DF" stroke="#1E2A3A" strokeWidth="1.5" />
    <rect x="12" y="8" width="60" height="75" rx="2" fill="#FAF7F2" stroke="#1E2A3A" strokeWidth="1.5" />

    {/* Front paper */}
    <rect x="9" y="4" width="60" height="75" rx="2" fill="white" stroke="#1E2A3A" strokeWidth="2" />

    {/* Lines on front paper */}
    <g stroke="#E8E4DF" strokeWidth="1.5">
      <line x1="18" y1="18" x2="58" y2="18" />
      <line x1="18" y1="28" x2="58" y2="28" />
      <line x1="18" y1="38" x2="48" y2="38" />
      <line x1="18" y1="48" x2="55" y2="48" />
      <line x1="18" y1="58" x2="40" y2="58" />
    </g>

    {/* Checkmark */}
    <path
      d="M45 30 L50 36 L62 22"
      stroke="#7BAE7F"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Red margin line */}
    <line x1="22" y1="4" x2="22" y2="79" stroke="#C75B39" strokeWidth="1" opacity="0.4" />
  </svg>
);

// Light bulb (idea) illustration
export const IdeaBulbDoodle = ({ className = '', animated = true }) => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Bulb */}
    <path
      d="M40 15 C20 15 10 32 10 45 C10 55 18 62 25 68 L25 75 L55 75 L55 68 C62 62 70 55 70 45 C70 32 60 15 40 15 Z"
      fill="#D4A853"
      stroke="#1E2A3A"
      strokeWidth="2"
    />

    {/* Bulb highlight */}
    <ellipse cx="30" cy="40" rx="8" ry="12" fill="#E8C97A" opacity="0.6" />

    {/* Base */}
    <rect x="25" y="75" width="30" height="6" fill="#9D9790" stroke="#1E2A3A" strokeWidth="1.5" />
    <rect x="28" y="81" width="24" height="5" fill="#9D9790" stroke="#1E2A3A" strokeWidth="1.5" />
    <rect x="31" y="86" width="18" height="4" rx="2" fill="#1E2A3A" />

    {/* Rays */}
    {animated ? (
      <motion.g
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <line x1="40" y1="0" x2="40" y2="8" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="25" x2="3" y2="20" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="25" x2="77" y2="20" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="45" x2="5" y2="45" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="45" x2="75" y2="45" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    ) : (
      <g>
        <line x1="40" y1="0" x2="40" y2="8" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="25" x2="3" y2="20" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="25" x2="77" y2="20" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="45" x2="5" y2="45" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="45" x2="75" y2="45" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
      </g>
    )}
  </svg>
);

// Trophy/Achievement illustration
export const TrophyDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cup */}
    <path
      d="M25 15 L25 45 C25 60 40 70 50 70 C60 70 75 60 75 45 L75 15 Z"
      fill="#D4A853"
      stroke="#1E2A3A"
      strokeWidth="2"
    />

    {/* Cup shine */}
    <ellipse cx="38" cy="35" rx="6" ry="15" fill="#E8C97A" opacity="0.5" />

    {/* Handles */}
    <path
      d="M25 25 C15 25 10 35 15 45 C18 50 22 50 25 48"
      stroke="#D4A853"
      strokeWidth="6"
      fill="none"
    />
    <path
      d="M25 25 C15 25 10 35 15 45 C18 50 22 50 25 48"
      stroke="#1E2A3A"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M75 25 C85 25 90 35 85 45 C82 50 78 50 75 48"
      stroke="#D4A853"
      strokeWidth="6"
      fill="none"
    />
    <path
      d="M75 25 C85 25 90 35 85 45 C82 50 78 50 75 48"
      stroke="#1E2A3A"
      strokeWidth="2"
      fill="none"
    />

    {/* Stem */}
    <rect x="45" y="70" width="10" height="12" fill="#D4A853" stroke="#1E2A3A" strokeWidth="1.5" />

    {/* Base */}
    <rect x="32" y="82" width="36" height="8" rx="2" fill="#D4A853" stroke="#1E2A3A" strokeWidth="1.5" />
    <rect x="28" y="88" width="44" height="6" rx="2" fill="#1E2A3A" />

    {/* Star on cup */}
    <polygon
      points="50,25 53,35 63,35 55,42 58,52 50,46 42,52 45,42 37,35 47,35"
      fill="#FAF7F2"
      stroke="#1E2A3A"
      strokeWidth="1"
    />
  </svg>
);

// Graduation cap
export const GradCapDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cap top */}
    <polygon
      points="50,5 95,30 50,55 5,30"
      fill="#2D5A4A"
      stroke="#1E2A3A"
      strokeWidth="2"
    />

    {/* Cap band */}
    <path
      d="M20 35 L20 55 C20 60 35 70 50 70 C65 70 80 60 80 55 L80 35"
      fill="#2D5A4A"
      stroke="#1E2A3A"
      strokeWidth="2"
    />

    {/* Button */}
    <circle cx="50" cy="30" r="5" fill="#D4A853" stroke="#1E2A3A" strokeWidth="1.5" />

    {/* Tassel string */}
    <path
      d="M50 35 L50 45 Q45 55 40 60"
      stroke="#D4A853"
      strokeWidth="2"
      fill="none"
    />

    {/* Tassel end */}
    <rect x="35" y="58" width="10" height="15" rx="2" fill="#D4A853" stroke="#1E2A3A" strokeWidth="1" />
    <line x1="36" y1="68" x2="44" y2="68" stroke="#1E2A3A" strokeWidth="1" />
    <line x1="36" y1="72" x2="44" y2="72" stroke="#1E2A3A" strokeWidth="1" />
  </svg>
);

// Book with bookmark
export const BookDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 90 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Book cover */}
    <rect x="10" y="10" width="70" height="80" rx="3" fill="#2D5A4A" stroke="#1E2A3A" strokeWidth="2" />

    {/* Pages */}
    <rect x="15" y="15" width="60" height="70" rx="2" fill="#FAF7F2" stroke="#1E2A3A" strokeWidth="1" />

    {/* Page lines */}
    <g stroke="#E8E4DF" strokeWidth="1">
      <line x1="22" y1="28" x2="68" y2="28" />
      <line x1="22" y1="38" x2="68" y2="38" />
      <line x1="22" y1="48" x2="60" y2="48" />
      <line x1="22" y1="58" x2="68" y2="58" />
      <line x1="22" y1="68" x2="55" y2="68" />
    </g>

    {/* Spine */}
    <line x1="10" y1="10" x2="10" y2="90" stroke="#1E4035" strokeWidth="3" />

    {/* Bookmark */}
    <path
      d="M60 10 L60 35 L65 30 L70 35 L70 10"
      fill="#C75B39"
      stroke="#1E2A3A"
      strokeWidth="1"
    />
  </svg>
);

// Coffee cup (for teacher vibe)
export const CoffeeDoodle = ({ className = '', steaming = true }) => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cup body */}
    <path
      d="M15 30 L20 90 L60 90 L65 30 Z"
      fill="white"
      stroke="#1E2A3A"
      strokeWidth="2"
    />

    {/* Coffee */}
    <path
      d="M18 35 L22 85 L58 85 L62 35 Z"
      fill="#6B4423"
    />

    {/* Handle */}
    <path
      d="M65 40 C80 40 80 65 65 65"
      stroke="#1E2A3A"
      strokeWidth="3"
      fill="none"
    />

    {/* Steam */}
    {steaming && (
      <motion.g
        animate={{ y: [-2, -8, -2], opacity: [0.7, 0.3, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <path d="M30 25 Q32 15 28 10" stroke="#9D9790" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M40 22 Q42 12 38 5" stroke="#9D9790" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 25 Q52 15 48 10" stroke="#9D9790" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.g>
    )}

    {/* Heart on cup */}
    <path
      d="M35 55 C30 48 30 55 35 62 C40 55 40 48 35 55"
      fill="#C75B39"
    />
    <path
      d="M45 55 C40 48 40 55 45 62 C50 55 50 48 45 55"
      fill="#C75B39"
    />
    <path
      d="M35 62 L40 70 L45 62"
      fill="#C75B39"
    />
  </svg>
);

// Decorative stars cluster
export const StarClusterDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Big star */}
    <motion.polygon
      points="50,5 58,35 90,38 65,58 73,90 50,72 27,90 35,58 10,38 42,35"
      fill="#D4A853"
      stroke="#1E2A3A"
      strokeWidth="2"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ transformOrigin: 'center' }}
    />

    {/* Small stars */}
    <polygon
      points="20,20 22,26 28,26 23,30 25,36 20,32 15,36 17,30 12,26 18,26"
      fill="#E8C97A"
      stroke="#1E2A3A"
      strokeWidth="1"
    />
    <polygon
      points="80,15 82,21 88,21 83,25 85,31 80,27 75,31 77,25 72,21 78,21"
      fill="#E8C97A"
      stroke="#1E2A3A"
      strokeWidth="1"
    />
    <polygon
      points="85,70 86,74 90,74 87,77 88,81 85,78 82,81 83,77 80,74 84,74"
      fill="#E8C97A"
      stroke="#1E2A3A"
      strokeWidth="1"
    />
  </svg>
);

// Notebook with spiral binding
export const NotebookDoodle = ({ className = '' }) => (
  <svg
    viewBox="0 0 90 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cover */}
    <rect x="15" y="5" width="65" height="100" rx="3" fill="#7B5EA7" stroke="#1E2A3A" strokeWidth="2" />

    {/* Pages */}
    <rect x="20" y="10" width="55" height="90" rx="2" fill="#FAF7F2" stroke="#1E2A3A" strokeWidth="1" />

    {/* Lines */}
    <g stroke="#E8E4DF" strokeWidth="1">
      {[25, 35, 45, 55, 65, 75, 85].map((y) => (
        <line key={y} x1="28" y1={y} x2="68" y2={y} />
      ))}
    </g>

    {/* Red margin */}
    <line x1="32" y1="10" x2="32" y2="100" stroke="#C75B39" strokeWidth="1" opacity="0.5" />

    {/* Spiral binding */}
    <g fill="#9D9790" stroke="#1E2A3A" strokeWidth="1">
      {[18, 32, 46, 60, 74, 88].map((y) => (
        <ellipse key={y} cx="15" cy={y} rx="5" ry="3" />
      ))}
    </g>
  </svg>
);

export default {
  ChalkboardDoodle,
  PencilDoodle,
  PaperStackDoodle,
  IdeaBulbDoodle,
  TrophyDoodle,
  GradCapDoodle,
  BookDoodle,
  CoffeeDoodle,
  StarClusterDoodle,
  NotebookDoodle,
};
