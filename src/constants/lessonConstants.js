// Processing stages with child-friendly labels
export const PROCESSING_STAGES = {
  idle: {
    key: 'idle',
    label: '',
    childLabel: '',
    progress: 0,
  },
  uploading: {
    key: 'uploading',
    label: 'Uploading your lesson...',
    childLabel: '📤 Sending to Jeffrey...',
    progress: 15,
  },
  extracting: {
    key: 'extracting',
    label: 'Reading the content...',
    childLabel: '📖 Jeffrey is reading...',
    progress: 35,
  },
  analyzing: {
    key: 'analyzing',
    label: 'Understanding the lesson...',
    childLabel: '🤔 Jeffrey is thinking...',
    progress: 60,
  },
  generating: {
    key: 'generating',
    label: 'Preparing your study materials...',
    childLabel: '✨ Making it fun to learn...',
    progress: 85,
  },
  complete: {
    key: 'complete',
    label: 'Ready to learn!',
    childLabel: '🎉 Let\'s go!',
    progress: 100,
  },
  error: {
    key: 'error',
    label: 'Something went wrong',
    childLabel: '😕 Oops! Let\'s try again',
    progress: 0,
  },
};

// Fun loading messages for kids (rotate during processing)
export const LOADING_MESSAGES = [
  "Jeffrey is putting on his reading glasses... 🤓",
  "Turning pages really fast... 📚",
  "Looking for the important stuff... 🔍",
  "Making flashcards in his head... 🧠",
  "Getting excited to teach you! 🎉",
  "Almost ready for learning fun! ⭐",
];

// Default lesson structure for empty state
export const DEFAULT_LESSON = {
  title: '',
  summary: '',
  gradeLevel: '',
  subject: '',
  rawText: '',
  chapters: [],
  keyConceptsForChat: [],
  vocabulary: [],
  suggestedQuestions: [],
  relatedTopics: [],
  progress: {
    started: false,
    percentComplete: 0,
    lastAccessedAt: null,
    timeSpent: 0,
  },
  contentFlags: {
    reviewed: false,
    aiConfidence: 0,
  },
};

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': { ext: '.pdf', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/png': { ext: '.png', maxSize: 5 * 1024 * 1024 },        // 5MB
  'image/jpeg': { ext: '.jpg', maxSize: 5 * 1024 * 1024 },       // 5MB
  'image/webp': { ext: '.webp', maxSize: 5 * 1024 * 1024 },      // 5MB
  'text/plain': { ext: '.txt', maxSize: 2 * 1024 * 1024 },       // 2MB
};

// Default suggested questions when no lesson is loaded
export const DEFAULT_SUGGESTED_QUESTIONS = [
  "What should I learn today?",
  "Can you explain this concept?",
  "Give me a fun fact!",
  "Help me with my homework!",
];

// Grade levels supported
export const GRADE_LEVELS = [
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
];

// Common subjects (must match backend Prisma Subject enum)
export const SUBJECTS = [
  'MATH',
  'SCIENCE',
  'ENGLISH',
  'ARABIC',
  'ISLAMIC_STUDIES',
  'SOCIAL_STUDIES',
  'ART',
  'MUSIC',
  'OTHER',
];
