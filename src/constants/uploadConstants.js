// Supported file types with validation
export const SUPPORTED_FILES = {
  'application/pdf': {
    extension: '.pdf',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: 'FileText',
    label: 'PDF Document',
  },
  'image/png': {
    extension: '.png',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: 'Image',
    label: 'PNG Image',
  },
  'image/jpeg': {
    extension: '.jpg',
    maxSize: 5 * 1024 * 1024,
    icon: 'Image',
    label: 'JPEG Image',
  },
  'image/webp': {
    extension: '.webp',
    maxSize: 5 * 1024 * 1024,
    icon: 'Image',
    label: 'WebP Image',
  },
  'text/plain': {
    extension: '.txt',
    maxSize: 1 * 1024 * 1024, // 1MB
    icon: 'FileText',
    label: 'Text File',
  },
};

// Accept string for react-dropzone
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  'text/plain': ['.txt'],
};

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Subject options for K-6
export const SUBJECTS = [
  { value: 'mathematics', label: '🔢 Mathematics', color: 'bg-blue-500' },
  { value: 'science', label: '🔬 Science', color: 'bg-green-500' },
  { value: 'english', label: '📚 English', color: 'bg-purple-500' },
  { value: 'reading', label: '📖 Reading', color: 'bg-indigo-500' },
  { value: 'arabic', label: '🌙 Arabic', color: 'bg-amber-500' },
  { value: 'islamic', label: '☪️ Islamic Studies', color: 'bg-teal-500' },
  { value: 'social', label: '🌍 Social Studies', color: 'bg-orange-500' },
  { value: 'history', label: '📜 History', color: 'bg-rose-500' },
  { value: 'art', label: '🎨 Art', color: 'bg-pink-500' },
  { value: 'music', label: '🎵 Music', color: 'bg-cyan-500' },
  { value: 'other', label: '📝 Other', color: 'bg-gray-500' },
];

// Grade levels
export const GRADE_LEVELS = [
  { value: 'kg', label: 'Kindergarten' },
  { value: 'grade-1', label: 'Grade 1' },
  { value: 'grade-2', label: 'Grade 2' },
  { value: 'grade-3', label: 'Grade 3' },
  { value: 'grade-4', label: 'Grade 4' },
  { value: 'grade-5', label: 'Grade 5' },
  { value: 'grade-6', label: 'Grade 6' },
];

// Fun loading messages for kids
export const PROCESSING_MESSAGES = {
  uploading: [
    "📤 Sending your lesson to Jeffrey...",
    "🚀 Zooming to the cloud...",
    "📬 Special delivery incoming!",
  ],
  extracting: [
    "📖 Jeffrey is reading really fast...",
    "🔍 Looking at every word...",
    "📚 Turning pages at super speed!",
  ],
  analyzing: [
    "🤔 Jeffrey is thinking hard...",
    "🧠 Finding the coolest facts...",
    "✨ Discovering hidden treasures!",
  ],
  generating: [
    "🎨 Making everything look awesome...",
    "⭐ Creating your study guide...",
    "🎁 Wrapping up something special!",
  ],
  complete: [
    "🎉 All done! Let's learn!",
    "🏆 Ready for an adventure!",
    "🌟 Your lesson is ready!",
  ],
};

// Error messages (child-friendly)
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "Oops! This file is too big. Try a smaller one! 📦",
  INVALID_TYPE: "Hmm, I can't read this type of file. Try a PDF or image! 📄",
  UPLOAD_FAILED: "Something went wrong. Let's try again! 🔄",
  PROCESSING_FAILED: "Jeffrey got confused. Let's try a different file! 🤔",
  NETWORK_ERROR: "Can't reach the internet. Check your connection! 🌐",
  EMPTY_FILE: "This file looks empty. Try another one! 📭",
  INVALID_YOUTUBE: "That doesn't look like a YouTube link. Try again! 🎬",
};

// YouTube URL patterns
export const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/, // Just the video ID
];
