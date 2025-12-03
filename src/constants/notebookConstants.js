/**
 * Notebook Constants
 * Configuration for cover colors, patterns, stickers, and XP rewards
 */

// Cover color options
export const COVER_COLORS = [
  { value: '#FFD93D', label: 'Sunny Yellow', emoji: '☀️' },
  { value: '#FF6B6B', label: 'Cherry Red', emoji: '🍒' },
  { value: '#4ECDC4', label: 'Ocean Teal', emoji: '🌊' },
  { value: '#95E1D3', label: 'Mint Green', emoji: '🌿' },
  { value: '#A259FF', label: 'Magic Purple', emoji: '✨' },
  { value: '#5C7CFA', label: 'Sky Blue', emoji: '🌤️' },
  { value: '#FF9A9E', label: 'Pink Cloud', emoji: '☁️' },
  { value: '#FAD961', label: 'Golden Sun', emoji: '🌟' },
];

// Cover pattern options
export const COVER_PATTERNS = [
  { value: 'dots', label: 'Polka Dots', icon: '●○●' },
  { value: 'lines', label: 'Lines', icon: '═══' },
  { value: 'stars', label: 'Stars', icon: '★☆★' },
  { value: 'hearts', label: 'Hearts', icon: '♥♡♥' },
  { value: 'waves', label: 'Waves', icon: '〰️' },
  { value: 'confetti', label: 'Confetti', icon: '🎊' },
  { value: 'none', label: 'Plain', icon: '▢' },
];

// Sticker options for cover decoration
export const STICKERS = [
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'lightbulb', emoji: '💡', label: 'Idea' },
  { id: 'trophy', emoji: '🏆', label: 'Trophy' },
  { id: 'pencil', emoji: '✏️', label: 'Pencil' },
  { id: 'book', emoji: '📚', label: 'Books' },
  { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
  { id: 'globe', emoji: '🌍', label: 'Globe' },
  { id: 'atom', emoji: '⚛️', label: 'Atom' },
  { id: 'paint', emoji: '🎨', label: 'Art' },
  { id: 'music', emoji: '🎵', label: 'Music' },
];

// XP rewards for note actions
export const XP_REWARDS = {
  NOTE_CREATED: 5,
  NOTE_EDITED: 2,
};

// Messages shown after saving notes
export const NOTEBOOK_MESSAGES = {
  created: [
    'Great note! Keep learning! 🌟',
    'Saved to your notebook! 📓',
    'Another smart note! You\'re doing awesome! ⭐',
    'Nice work! Your notebook is growing! 📚',
    'Knowledge saved! 🧠',
  ],
  empty: 'Your notebook is empty. Start adding notes from your lessons!',
  emptySubject: 'No notes in this subject yet. Highlight text in a lesson to add notes!',
};

// Subject display names and icons
export const SUBJECT_CONFIG = {
  MATH: { label: 'Math', emoji: '🔢', color: '#5C7CFA' },
  SCIENCE: { label: 'Science', emoji: '🔬', color: '#4ECDC4' },
  ENGLISH: { label: 'English', emoji: '📖', color: '#A259FF' },
  ARABIC: { label: 'Arabic', emoji: '🕌', color: '#95E1D3' },
  ISLAMIC_STUDIES: { label: 'Islamic Studies', emoji: '📿', color: '#FFD93D' },
  SOCIAL_STUDIES: { label: 'Social Studies', emoji: '🌍', color: '#FF9A9E' },
  ART: { label: 'Art', emoji: '🎨', color: '#FF6B6B' },
  MUSIC: { label: 'Music', emoji: '🎵', color: '#FAD961' },
  OTHER: { label: 'Other', emoji: '📝', color: '#CCCCCC' },
};

// Default note cover settings
export const DEFAULT_COVER = {
  color: '#FFD93D',
  pattern: 'dots',
  stickers: [],
};

// Animation variants for Framer Motion
export const NOTEBOOK_ANIMATIONS = {
  coverOpen: {
    closed: {
      rotateY: 0,
      transformOrigin: 'left center',
    },
    open: {
      rotateY: -160,
      transformOrigin: 'left center',
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        delay: 0.2,
      },
    },
  },
  modalEntry: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  cardHover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 },
  },
  pageSlide: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3 },
  },
};

// Rich text editor toolbar options
export const EDITOR_TOOLBAR = {
  young: ['bold', 'highlight', 'emoji'], // Ages 4-7: simplified
  older: ['bold', 'italic', 'underline', 'highlight', 'bulletList', 'emoji'], // Ages 8-12: full
};

// Highlight colors for rich text editor
export const HIGHLIGHT_COLORS = [
  { value: '#FFEB3B', label: 'Yellow' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#E91E63', label: 'Pink' },
  { value: '#FF9800', label: 'Orange' },
];

export default {
  COVER_COLORS,
  COVER_PATTERNS,
  STICKERS,
  XP_REWARDS,
  NOTEBOOK_MESSAGES,
  SUBJECT_CONFIG,
  DEFAULT_COVER,
  NOTEBOOK_ANIMATIONS,
  EDITOR_TOOLBAR,
  HIGHLIGHT_COLORS,
};
