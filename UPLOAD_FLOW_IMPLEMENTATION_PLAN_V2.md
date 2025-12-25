# Upload Flow Implementation Plan
## K-6 AI Learning Platform - Content Upload System

**Purpose:** Implement the complete upload flow that allows users to add lesson content (PDFs, images, YouTube links), process it with AI, and save to LessonContext for Ollie (AI tutor) to use.

**Prerequisites:** LessonContext must be implemented first (see LESSONCONTEXT_IMPLEMENTATION_PLAN.md)

**Estimated Time:** 4-6 hours for complete implementation

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Dependencies](#2-dependencies)
3. [File Structure](#3-file-structure)
4. [Utility Functions](#4-utility-functions)
5. [Service Layer](#5-service-layer)
6. [Custom Hooks](#6-custom-hooks)
7. [Components](#7-components)
8. [Integration](#8-integration)
9. [Testing Checklist](#9-testing-checklist)
10. [Safety Considerations](#10-safety-considerations)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            UPLOAD FLOW PIPELINE                              │
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│   │   TRIGGER    │    │    INPUT     │    │   PROCESS    │    │   SAVE   │ │
│   │              │ -> │              │ -> │              │ -> │          │ │
│   │ UploadButton │    │ UploadModal  │    │  Processing  │    │ Context  │ │
│   └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘ │
│                              │                    │                         │
│                              ▼                    ▼                         │
│                       ┌─────────────┐      ┌─────────────┐                  │
│                       │ FileDropzone│      │ geminiService│                 │
│                       │ YouTubeInput│      │ (mock/real)  │                 │
│                       └─────────────┘      └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
│                                                                              │
│  User selects file/URL                                                       │
│         │                                                                    │
│         ▼                                                                    │
│  useLessonProcessor.processUpload()                                          │
│         │                                                                    │
│         ├─► extractText (PDF/Image/YouTube)                                  │
│         │         │                                                          │
│         │         ▼                                                          │
│         ├─► geminiService.analyzeContent()                                   │
│         │         │                                                          │
│         │         ▼                                                          │
│         └─► LessonContext.addLesson()                                        │
│                   │                                                          │
│                   ▼                                                          │
│         LessonView + ChatInterface updated                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dependencies

### Install Required Packages
```bash
npm install react-dropzone pdfjs-dist
```

### Package Purposes
| Package | Purpose |
|---------|---------|
| `react-dropzone` | Drag-and-drop file upload with validation |
| `pdfjs-dist` | Extract text from PDF files client-side |
| `uuid` | Already installed from LessonContext |

### Note on Gemini
For MVP development, we use mock responses. When ready for production:
```bash
npm install @google/generative-ai
```

---

## 3. File Structure

```
src/
├── components/
│   └── Upload/
│       ├── index.js                  # Barrel export
│       ├── UploadButton.jsx          # Trigger button (floating + inline)
│       ├── UploadModal.jsx           # Main modal container
│       ├── FileDropzone.jsx          # Drag-and-drop zone
│       ├── YouTubeInput.jsx          # YouTube URL input
│       ├── ProcessingAnimation.jsx   # Fun loading states
│       └── SubjectSelector.jsx       # Subject/grade picker
│
├── hooks/
│   ├── useLessonProcessor.js         # Orchestrates upload flow
│   └── useGemini.js                  # AI interaction hook
│
├── services/
│   └── geminiService.js              # API wrapper (mockable)
│
├── utils/
│   ├── pdfExtractor.js               # PDF text extraction
│   ├── imageExtractor.js             # Image OCR (future)
│   └── youtubeUtils.js               # YouTube URL parsing
│
└── constants/
    └── uploadConstants.js            # File types, limits, messages
```

---

## 4. Utility Functions

### Step 1: Create Upload Constants

**File:** `src/constants/uploadConstants.js`

```javascript
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
  { value: 'arabic', label: '🕌 Arabic', color: 'bg-amber-500' },
  { value: 'islamic', label: '☪️ Islamic Studies', color: 'bg-teal-500' },
  { value: 'social', label: '🌍 Social Studies', color: 'bg-orange-500' },
  { value: 'art', label: '🎨 Art', color: 'bg-pink-500' },
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
    "📤 Sending your lesson to Ollie...",
    "🚀 Zooming to the cloud...",
    "📬 Special delivery incoming!",
  ],
  extracting: [
    "📖 Ollie is reading really fast...",
    "🔍 Looking at every word...",
    "📚 Turning pages at super speed!",
  ],
  analyzing: [
    "🤔 Ollie is thinking hard...",
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
  PROCESSING_FAILED: "Ollie got confused. Let's try a different file! 🤔",
  NETWORK_ERROR: "Can't reach the internet. Check your connection! 🌐",
  EMPTY_FILE: "This file looks empty. Try another one! 📭",
  INVALID_YOUTUBE: "That doesn't look like a YouTube link. Try again! 🎬",
};

// YouTube URL patterns
export const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/, // Just the video ID
];
```

---

### Step 2: Create YouTube Utilities

**File:** `src/utils/youtubeUtils.js`

```javascript
import { YOUTUBE_PATTERNS, ERROR_MESSAGES } from '../constants/uploadConstants';

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL or video ID
 * @returns {string|null} Video ID or null if invalid
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  
  const trimmedUrl = url.trim();
  
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validate a YouTube URL
 * @param {string} url - URL to validate
 * @returns {{ valid: boolean, videoId?: string, error?: string }}
 */
export function validateYouTubeUrl(url) {
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_YOUTUBE,
    };
  }
  
  return {
    valid: true,
    videoId,
  };
}

/**
 * Get YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
 * @returns {string} Thumbnail URL
 */
export function getYouTubeThumbnail(videoId, quality = 'medium') {
  const qualities = {
    default: 'default',      // 120x90
    medium: 'mqdefault',     // 320x180
    high: 'hqdefault',       // 480x360
    maxres: 'maxresdefault', // 1280x720
  };
  
  const qualityKey = qualities[quality] || qualities.medium;
  return `https://img.youtube.com/vi/${videoId}/${qualityKey}.jpg`;
}

/**
 * Get YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} Embed URL
 */
export function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get YouTube watch URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} Watch URL
 */
export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Parse YouTube URL and return full metadata
 * @param {string} url - YouTube URL
 * @returns {Object|null} Video metadata or null
 */
export function parseYouTubeUrl(url) {
  const validation = validateYouTubeUrl(url);
  
  if (!validation.valid) {
    return null;
  }
  
  const { videoId } = validation;
  
  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnail(videoId, 'high'),
    embedUrl: getYouTubeEmbedUrl(videoId),
    watchUrl: getYouTubeWatchUrl(videoId),
  };
}
```

---

### Step 3: Create PDF Extractor

**File:** `src/utils/pdfExtractor.js`

```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// In production, host this file yourself or use CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{ text: string, pageCount: number, metadata: Object }>}
 */
export async function extractTextFromPDF(file, onProgress = () => {}) {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 30);
        onProgress(percent); // First 30% is loading
      }
    };
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (pageText) {
        textParts.push(`[Page ${pageNum}]\n${pageText}`);
      }
      
      // Update progress (30-100%)
      const progressPercent = 30 + Math.round((pageNum / numPages) * 70);
      onProgress(progressPercent);
    }
    
    // Get metadata
    const metadata = await pdf.getMetadata().catch(() => ({}));
    
    return {
      text: textParts.join('\n\n'),
      pageCount: numPages,
      metadata: {
        title: metadata?.info?.Title || '',
        author: metadata?.info?.Author || '',
        subject: metadata?.info?.Subject || '',
        creator: metadata?.info?.Creator || '',
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Extract text from a plain text file
 * @param {File} file - Text file object
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read text file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Main extraction function - routes to appropriate extractor
 * @param {File} file - File to extract text from
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ text: string, metadata: Object }>}
 */
export async function extractText(file, onProgress = () => {}) {
  const { type, name } = file;
  
  // PDF files
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const result = await extractTextFromPDF(file, onProgress);
    return {
      text: result.text,
      metadata: {
        ...result.metadata,
        pageCount: result.pageCount,
        sourceType: 'pdf',
      },
    };
  }
  
  // Plain text files
  if (type === 'text/plain' || name.endsWith('.txt')) {
    const text = await extractTextFromFile(file);
    onProgress(100);
    return {
      text,
      metadata: {
        sourceType: 'text',
      },
    };
  }
  
  // Images - placeholder for future OCR
  if (type.startsWith('image/')) {
    onProgress(100);
    return {
      text: '[Image content - OCR coming soon]',
      metadata: {
        sourceType: 'image',
        requiresOCR: true,
      },
    };
  }
  
  throw new Error(`Unsupported file type: ${type}`);
}
```

---

## 5. Service Layer

### Create Gemini Service (Mock + Real)

**File:** `src/services/geminiService.js`

```javascript
/**
 * Gemini API Service
 * Uses mock responses in development, real API in production
 */

const USE_MOCK = true; // Toggle for development
const API_DELAY = 2000; // Simulate network delay in mock mode

// ============================================
// MOCK RESPONSES (Development)
// ============================================

const MOCK_RESPONSES = {
  analyzeContent: (text, subject) => ({
    title: generateMockTitle(text, subject),
    summary: generateMockSummary(text),
    gradeLevel: 'Grade 3-4',
    subject: subject || 'General',
    chapters: generateMockChapters(text),
    keyConceptsForChat: generateMockConcepts(text),
    vocabulary: generateMockVocabulary(text),
    suggestedQuestions: generateMockQuestions(text),
    relatedTopics: ['Related Topic 1', 'Related Topic 2', 'Related Topic 3'],
  }),
};

// Mock helper functions
function generateMockTitle(text, subject) {
  const firstLine = text.split('\n')[0] || '';
  const cleanLine = firstLine.replace(/\[Page \d+\]/g, '').trim();
  if (cleanLine.length > 5 && cleanLine.length < 60) {
    return cleanLine;
  }
  return subject ? `${subject} Lesson` : 'New Lesson';
}

function generateMockSummary(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }
  return 'This lesson covers important concepts that will help you learn and grow!';
}

function generateMockChapters(text) {
  const pages = text.split(/\[Page \d+\]/g).filter(p => p.trim());
  
  if (pages.length <= 1) {
    return [{
      id: 'ch-1',
      title: 'Main Content',
      content: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
      order: 1,
    }];
  }
  
  return pages.slice(0, 5).map((page, index) => ({
    id: `ch-${index + 1}`,
    title: `Section ${index + 1}`,
    content: page.trim().substring(0, 300) + '...',
    order: index + 1,
  }));
}

function generateMockConcepts(text) {
  // Extract potential key concepts (words that appear multiple times)
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  const concepts = Object.entries(wordCount)
    .filter(([word, count]) => count > 2 && !commonWords.includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  
  return concepts.length > 0 ? concepts : ['Key Concept 1', 'Key Concept 2', 'Key Concept 3'];
}

function generateMockVocabulary(text) {
  const concepts = generateMockConcepts(text);
  return concepts.slice(0, 3).map(term => ({
    term,
    definition: `The meaning of ${term.toLowerCase()} in this context.`,
    example: `Here is how ${term.toLowerCase()} is used in a sentence.`,
  }));
}

function generateMockQuestions(text) {
  const concepts = generateMockConcepts(text);
  return [
    `What is the main idea of this lesson?`,
    concepts[0] ? `Can you explain what ${concepts[0].toLowerCase()} means?` : 'What did you learn?',
    `Why is this topic important?`,
    `Can you give me an example?`,
  ];
}

const commonWords = ['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'which', 'would', 'could', 'should', 'about', 'into', 'your', 'more', 'some', 'them', 'than', 'then', 'when', 'what', 'there', 'these', 'those'];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Analyze content and generate lesson structure
 * @param {string} text - Raw text content
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analyzed lesson data
 */
export async function analyzeContent(text, options = {}) {
  const { subject, gradeLevel, onProgress } = options;
  
  if (USE_MOCK) {
    // Simulate processing time
    await simulateProgress(onProgress);
    return MOCK_RESPONSES.analyzeContent(text, subject);
  }
  
  // Production Gemini API call
  // TODO: Implement when ready
  throw new Error('Production API not implemented yet');
}

/**
 * Generate chat response with lesson context
 * @param {string} message - User message
 * @param {Object} context - Lesson context
 * @param {Array} history - Chat history
 * @returns {Promise<string>} AI response
 */
export async function generateChatResponse(message, context, history = []) {
  if (USE_MOCK) {
    await delay(1000);
    return generateMockChatResponse(message, context);
  }
  
  // Production API
  throw new Error('Production API not implemented yet');
}

function generateMockChatResponse(message, context) {
  const { title, subject } = context || {};
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hi there! 👋 I'm Ollie, your learning buddy! ${title ? `I see we're studying "${title}" today. ` : ''}What would you like to learn about?`;
  }
  
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
    return `Great question! 🌟 Let me explain this in a fun way...\n\nThink of it like this: imagine you have a pizza 🍕 and you want to share it equally with your friends. That's kind of how this concept works!\n\nWould you like me to give you another example?`;
  }
  
  if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
    return `Ooh, you want a challenge? 🎯 Here's a quick question for you:\n\nBased on what we learned, can you tell me one important thing you remember?\n\nTake your time - there's no rush! 😊`;
  }
  
  return `That's a wonderful thought! 💭 ${subject ? `In ${subject}, ` : ''}this is really interesting because it helps us understand the world better.\n\nWant me to tell you more about it, or should we try a fun activity? 🎮`;
}

/**
 * Generate flashcards from lesson content
 * @param {Object} lesson - Lesson object
 * @param {number} count - Number of cards to generate
 * @returns {Promise<Array>} Flashcard array
 */
export async function generateFlashcards(lesson, count = 5) {
  if (USE_MOCK) {
    await delay(1500);
    return generateMockFlashcards(lesson, count);
  }
  
  throw new Error('Production API not implemented yet');
}

function generateMockFlashcards(lesson, count) {
  const { vocabulary = [], keyConceptsForChat = [] } = lesson;
  const cards = [];
  
  // From vocabulary
  vocabulary.forEach((vocab, i) => {
    if (cards.length < count) {
      cards.push({
        id: `card-${i}`,
        front: `What is ${vocab.term}?`,
        back: vocab.definition,
        type: 'vocabulary',
      });
    }
  });
  
  // From concepts
  keyConceptsForChat.forEach((concept, i) => {
    if (cards.length < count) {
      cards.push({
        id: `card-concept-${i}`,
        front: `Explain: ${concept}`,
        back: `${concept} is an important concept in this lesson that helps us understand the main ideas.`,
        type: 'concept',
      });
    }
  });
  
  return cards;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateProgress(onProgress) {
  if (!onProgress) {
    await delay(API_DELAY);
    return;
  }
  
  const steps = [20, 40, 60, 80, 100];
  for (const step of steps) {
    await delay(API_DELAY / steps.length);
    onProgress(step);
  }
}

// ============================================
// PRODUCTION API SETUP (for future use)
// ============================================

/*
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// System prompt for child-safe educational content
const SYSTEM_PROMPT = `You are Ollie, a friendly AI tutor for children ages 4-12. 
Your responses should be:
- Age-appropriate and safe for children
- Educational and encouraging
- Fun and engaging with emojis
- Clear and easy to understand
- Never scary, violent, or inappropriate

Current lesson context will be provided. Always relate answers to the lesson when possible.`;

async function analyzeContentProduction(text, options) {
  const prompt = `Analyze this educational content and create a lesson structure:

${text}

Return a JSON object with:
- title: A child-friendly title
- summary: 2-3 sentence summary for kids
- gradeLevel: Appropriate grade level
- chapters: Array of {id, title, content, order}
- keyConceptsForChat: Array of key concepts
- vocabulary: Array of {term, definition, example}
- suggestedQuestions: Array of questions kids might ask`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
*/

export default {
  analyzeContent,
  generateChatResponse,
  generateFlashcards,
};
```

---

## 6. Custom Hooks

### Step 1: Create useGemini Hook

**File:** `src/hooks/useGemini.js`

```javascript
import { useState, useCallback } from 'react';
import geminiService from '../services/geminiService';

/**
 * Hook for interacting with Gemini AI service
 * Provides loading states and error handling
 */
export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Analyze content and generate lesson structure
   */
  const analyzeContent = useCallback(async (text, options = {}) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const result = await geminiService.analyzeContent(text, {
        ...options,
        onProgress: setProgress,
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate chat response with context
   */
  const chat = useCallback(async (message, context, history) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await geminiService.generateChatResponse(message, context, history);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate flashcards from lesson
   */
  const generateFlashcards = useCallback(async (lesson, count) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cards = await geminiService.generateFlashcards(lesson, count);
      return cards;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    progress,
    
    // Actions
    analyzeContent,
    chat,
    generateFlashcards,
    clearError,
  };
}

export default useGemini;
```

---

### Step 2: Create useLessonProcessor Hook

**File:** `src/hooks/useLessonProcessor.js`

```javascript
import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';
import { useGemini } from './useGemini';
import { extractText } from '../utils/pdfExtractor';
import { parseYouTubeUrl } from '../utils/youtubeUtils';
import { ERROR_MESSAGES } from '../constants/uploadConstants';

/**
 * Hook that orchestrates the complete upload → process → save flow
 */
export function useLessonProcessor() {
  const {
    startProcessing,
    updateProgress,
    setProcessingStage,
    addLesson,
    setError,
    resetProcessing,
    isProcessing,
    processingStage,
    processingProgress,
  } = useLessonContext();

  const { analyzeContent } = useGemini();

  /**
   * Process a file upload (PDF, image, text)
   * @param {File} file - File object to process
   * @param {Object} metadata - Additional metadata (subject, gradeLevel)
   * @returns {Promise<Object>} Created lesson
   */
  const processFile = useCallback(async (file, metadata = {}) => {
    try {
      // Stage 1: Start processing
      startProcessing();
      
      // Stage 2: Extract text
      setProcessingStage('extracting');
      const { text, metadata: extractedMeta } = await extractText(file, (progress) => {
        updateProgress(15 + (progress * 0.25)); // 15-40%
      });
      
      if (!text || text.trim().length < 10) {
        throw new Error(ERROR_MESSAGES.EMPTY_FILE);
      }
      
      // Stage 3: Analyze with AI
      setProcessingStage('analyzing');
      const analysis = await analyzeContent(text, {
        subject: metadata.subject,
        gradeLevel: metadata.gradeLevel,
        onProgress: (progress) => {
          updateProgress(40 + (progress * 0.35)); // 40-75%
        },
      });
      
      // Stage 4: Generate lesson structure
      setProcessingStage('generating');
      updateProgress(85);
      
      // Stage 5: Save to context
      const lesson = addLesson({
        // Source info
        source: {
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'text',
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
        
        // Raw content
        rawText: text,
        
        // AI-generated content
        ...analysis,
        
        // User-provided metadata
        subject: metadata.subject || analysis.subject,
        gradeLevel: metadata.gradeLevel || analysis.gradeLevel,
        
        // Content safety (mock for now)
        contentFlags: {
          reviewed: false,
          aiConfidence: 0.95,
        },
      });
      
      return lesson;
      
    } catch (error) {
      console.error('File processing error:', error);
      setError({
        message: error.message || ERROR_MESSAGES.PROCESSING_FAILED,
        code: 'FILE_PROCESSING_ERROR',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }, [startProcessing, setProcessingStage, updateProgress, analyzeContent, addLesson, setError]);

  /**
   * Process a YouTube video
   * @param {string} url - YouTube URL
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created lesson
   */
  const processYouTube = useCallback(async (url, metadata = {}) => {
    try {
      // Stage 1: Start processing
      startProcessing();
      
      // Stage 2: Parse YouTube URL
      setProcessingStage('extracting');
      const videoData = parseYouTubeUrl(url);
      
      if (!videoData) {
        throw new Error(ERROR_MESSAGES.INVALID_YOUTUBE);
      }
      
      updateProgress(30);
      
      // Stage 3: Analyze (mock - in production would use YouTube API + transcript)
      setProcessingStage('analyzing');
      
      // Mock content for YouTube - in production, fetch transcript
      const mockTranscript = `YouTube video content for video ID: ${videoData.videoId}. 
This is placeholder content that would be replaced with actual video transcript or captions.`;
      
      const analysis = await analyzeContent(mockTranscript, {
        subject: metadata.subject,
        gradeLevel: metadata.gradeLevel,
        onProgress: (progress) => {
          updateProgress(30 + (progress * 0.45)); // 30-75%
        },
      });
      
      // Stage 4: Generate lesson
      setProcessingStage('generating');
      updateProgress(85);
      
      // Stage 5: Save
      const lesson = addLesson({
        source: {
          type: 'youtube',
          originalName: metadata.title || `YouTube Video`,
          youtubeId: videoData.videoId,
          thumbnailUrl: videoData.thumbnailUrl,
          embedUrl: videoData.embedUrl,
          watchUrl: videoData.watchUrl,
        },
        rawText: mockTranscript,
        ...analysis,
        subject: metadata.subject || analysis.subject,
        gradeLevel: metadata.gradeLevel || analysis.gradeLevel,
        contentFlags: {
          reviewed: false,
          aiConfidence: 0.85, // Lower confidence for video content
        },
      });
      
      return lesson;
      
    } catch (error) {
      console.error('YouTube processing error:', error);
      setError({
        message: error.message || ERROR_MESSAGES.PROCESSING_FAILED,
        code: 'YOUTUBE_PROCESSING_ERROR',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }, [startProcessing, setProcessingStage, updateProgress, analyzeContent, addLesson, setError]);

  /**
   * Cancel current processing
   */
  const cancelProcessing = useCallback(() => {
    resetProcessing();
  }, [resetProcessing]);

  /**
   * Retry last failed upload
   */
  const retry = useCallback(async (lastUpload) => {
    if (!lastUpload) return;
    
    if (lastUpload.type === 'file') {
      return processFile(lastUpload.file, lastUpload.metadata);
    } else if (lastUpload.type === 'youtube') {
      return processYouTube(lastUpload.url, lastUpload.metadata);
    }
  }, [processFile, processYouTube]);

  return {
    // Actions
    processFile,
    processYouTube,
    cancelProcessing,
    retry,
    
    // State (from context)
    isProcessing,
    processingStage,
    processingProgress,
  };
}

export default useLessonProcessor;
```

---

## 7. Components

### Step 1: Create UploadButton

**File:** `src/components/Upload/UploadButton.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';

/**
 * Button to trigger upload modal
 * Supports multiple variants: primary, secondary, floating
 */
const UploadButton = ({ onClick, variant = 'primary', size = 'medium', disabled = false }) => {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-5 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };

  // Floating action button (FAB) variant
  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`
          fixed bottom-6 right-6 z-50
          w-16 h-16 
          bg-nanobanana-green text-white 
          rounded-full 
          border-4 border-black 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          flex items-center justify-center
          transition-shadow
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label="Upload lesson"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    );
  }

  // Inline button variants
  const variantClasses = {
    primary: 'bg-nanobanana-yellow hover:bg-yellow-400 text-black',
    secondary: 'bg-white hover:bg-gray-100 text-black',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-bold font-comic
        border-4 border-black 
        rounded-xl 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none active:translate-y-1
        transition-all
        flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <Upload className="w-5 h-5" />
      Upload Lesson
    </motion.button>
  );
};

export default UploadButton;
```

---

### Step 2: Create FileDropzone

**File:** `src/components/Upload/FileDropzone.jsx`

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, ERROR_MESSAGES } from '../../constants/uploadConstants';

/**
 * Drag-and-drop file upload zone with validation
 */
const FileDropzone = ({ onFileSelect, selectedFile, onClear, disabled = false }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejections
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const error = rejection.errors[0];
      
      if (error.code === 'file-too-large') {
        alert(ERROR_MESSAGES.FILE_TOO_LARGE);
      } else if (error.code === 'file-invalid-type') {
        alert(ERROR_MESSAGES.INVALID_TYPE);
      }
      return;
    }
    
    // Accept first valid file
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled,
  });

  // Get appropriate icon for file type
  const getFileIcon = (file) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          // Selected file preview
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-green-50 border-4 border-green-500 border-dashed rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {getFileIcon(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{selectedFile.name}</p>
                <p className="text-gray-600 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <button
                  onClick={onClear}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Dropzone
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`
              p-8 border-4 border-dashed rounded-2xl cursor-pointer transition-all
              ${isDragActive && !isDragReject 
                ? 'border-nanobanana-green bg-green-50 scale-[1.02]' 
                : isDragReject 
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-nanobanana-blue hover:bg-blue-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={isDragActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                className={`
                  w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  ${isDragActive 
                    ? isDragReject 
                      ? 'bg-red-500 text-white' 
                      : 'bg-nanobanana-green text-white' 
                    : 'bg-nanobanana-yellow'
                  }
                `}
              >
                {isDragReject ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </motion.div>
              
              <p className="font-bold text-lg font-comic mb-2">
                {isDragActive 
                  ? isDragReject 
                    ? "Oops! Can't use this file 😅" 
                    : "Drop it like it's hot! 🔥"
                  : "Drag & drop your lesson here"
                }
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse • PDF, Images up to 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropzone;
```

---

### Step 3: Create YouTubeInput

**File:** `src/components/Upload/YouTubeInput.jsx`

```jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Link, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { validateYouTubeUrl, getYouTubeThumbnail } from '../../utils/youtubeUtils';

/**
 * YouTube URL input with validation and preview
 */
const YouTubeInput = ({ onVideoSelect, selectedVideo, onClear, disabled = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsValidating(true);
    setError('');

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateYouTubeUrl(url);

    if (!validation.valid) {
      setError(validation.error);
      setIsValidating(false);
      return;
    }

    // Success - pass video data to parent
    onVideoSelect({
      videoId: validation.videoId,
      thumbnailUrl: getYouTubeThumbnail(validation.videoId, 'high'),
      url: url.trim(),
    });

    setUrl('');
    setIsValidating(false);
  }, [url, onVideoSelect]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
    onClear();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedVideo ? (
          // Selected video preview
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-50 border-4 border-red-500 border-dashed rounded-2xl"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-32 h-20 rounded-xl border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="font-bold">YouTube Video</span>
                </div>
                <p className="text-gray-500 text-sm truncate">
                  ID: {selectedVideo.videoId}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Remove video"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // URL input
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Input field */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste YouTube URL here..."
                  disabled={disabled || isValidating}
                  className={`
                    w-full pl-12 pr-4 py-3
                    border-4 border-black rounded-xl
                    font-medium
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    focus:outline-none focus:ring-2 focus:ring-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-500 bg-red-50' : ''}
                  `}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleValidate}
                disabled={disabled || isValidating || !url.trim()}
                className={`
                  px-4 py-3
                  border-4 border-black rounded-xl
                  font-bold
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  active:translate-y-[2px] active:shadow-none
                  transition-all
                  ${isValidating || !url.trim()
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                  }
                `}
              >
                {isValidating ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Link className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-600 text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Help text */}
            <p className="text-gray-500 text-sm text-center">
              Supports youtube.com and youtu.be links
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeInput;
```

---

### Step 4: Create ProcessingAnimation

**File:** `src/components/Upload/ProcessingAnimation.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';
import { PROCESSING_MESSAGES } from '../../constants/uploadConstants';

/**
 * Fun animated loading state during content processing
 */
const ProcessingAnimation = ({ stage, progress }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate through fun messages
  useEffect(() => {
    const messages = PROCESSING_MESSAGES[stage] || PROCESSING_MESSAGES.analyzing;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stage]);

  // Stage configuration
  const stages = [
    { key: 'uploading', label: 'Uploading', icon: BookOpen, color: 'bg-blue-500' },
    { key: 'extracting', label: 'Reading', icon: BookOpen, color: 'bg-purple-500' },
    { key: 'analyzing', label: 'Thinking', icon: Brain, color: 'bg-pink-500' },
    { key: 'generating', label: 'Creating', icon: Lightbulb, color: 'bg-orange-500' },
    { key: 'complete', label: 'Done!', icon: CheckCircle, color: 'bg-green-500' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === stage);
  const CurrentIcon = stages[currentStageIndex]?.icon || Sparkles;
  const messages = PROCESSING_MESSAGES[stage] || PROCESSING_MESSAGES.analyzing;

  return (
    <div className="p-8 flex flex-col items-center">
      {/* Animated mascot/icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`
          w-24 h-24 rounded-full border-4 border-black
          ${stages[currentStageIndex]?.color || 'bg-nanobanana-yellow'}
          flex items-center justify-center mb-6
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        `}
      >
        <CurrentIcon className="w-12 h-12 text-white" />
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-nanobanana-green"
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-1">{Math.round(progress)}%</p>
      </div>

      {/* Stage label */}
      <motion.h3
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold font-comic mb-2"
      >
        {stages[currentStageIndex]?.label || 'Processing'}...
      </motion.h3>

      {/* Fun rotating message */}
      <motion.p
        key={`${stage}-${messageIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-gray-600 text-center"
      >
        {messages[messageIndex]}
      </motion.p>

      {/* Stage dots */}
      <div className="flex gap-2 mt-6">
        {stages.slice(0, -1).map((s, index) => (
          <motion.div
            key={s.key}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              backgroundColor: index <= currentStageIndex ? '#22c55e' : '#e5e7eb',
            }}
            transition={{ delay: index * 0.1 }}
            className="w-3 h-3 rounded-full border-2 border-black"
          />
        ))}
      </div>
    </div>
  );
};

export default ProcessingAnimation;
```

---

### Step 5: Create SubjectSelector

**File:** `src/components/Upload/SubjectSelector.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { SUBJECTS, GRADE_LEVELS } from '../../constants/uploadConstants';

/**
 * Subject and grade level selector for uploaded content
 */
const SubjectSelector = ({ 
  subject, 
  onSubjectChange, 
  gradeLevel, 
  onGradeLevelChange,
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Subject selector */}
      <div>
        <label className="block text-sm font-bold mb-2">
          📚 What subject is this?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map((subj) => (
            <motion.button
              key={subj.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubjectChange(subj.value)}
              disabled={disabled}
              className={`
                p-3 rounded-xl border-2 border-black text-left font-medium
                transition-all
                ${subject === subj.value
                  ? `${subj.color} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                  : 'bg-white hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {subj.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grade level selector */}
      <div>
        <label className="block text-sm font-bold mb-2">
          🎓 What grade level?
        </label>
        <select
          value={gradeLevel}
          onChange={(e) => onGradeLevelChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full p-3 rounded-xl border-4 border-black
            font-medium bg-white
            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <option value="">Select grade level...</option>
          {GRADE_LEVELS.map((grade) => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SubjectSelector;
```

---

### Step 6: Create UploadModal (Main Component)

**File:** `src/components/Upload/UploadModal.jsx`

```jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Youtube, Camera, Sparkles } from 'lucide-react';
import FileDropzone from './FileDropzone';
import YouTubeInput from './YouTubeInput';
import SubjectSelector from './SubjectSelector';
import ProcessingAnimation from './ProcessingAnimation';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonProcessor } from '../../hooks/useLessonProcessor';

const tabs = [
  { id: 'file', label: 'Upload File', icon: FileText },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'camera', label: 'Camera', icon: Camera, disabled: true }, // Future feature
];

/**
 * Main upload modal with tabs for different upload methods
 */
const UploadModal = ({ isOpen, onClose }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('file');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  
  // YouTube state
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Metadata state
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  // Context and hooks
  const { isProcessing, processingStage, processingProgress, error } = useLessonContext();
  const { processFile, processYouTube, cancelProcessing } = useLessonProcessor();

  // Clear selections
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleClearVideo = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setSelectedFile(null);
    setSelectedVideo(null);
    setSubject('');
    setGradeLevel('');
    setActiveTab('file');
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (isProcessing) {
      // Confirm cancel during processing
      if (window.confirm('Are you sure you want to cancel?')) {
        cancelProcessing();
        resetState();
        onClose();
      }
    } else {
      resetState();
      onClose();
    }
  }, [isProcessing, cancelProcessing, resetState, onClose]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const metadata = { subject, gradeLevel };

    try {
      if (activeTab === 'file' && selectedFile) {
        await processFile(selectedFile, metadata);
      } else if (activeTab === 'youtube' && selectedVideo) {
        await processYouTube(selectedVideo.url, metadata);
      }
      
      // Success - close modal after small delay
      setTimeout(() => {
        resetState();
        onClose();
      }, 1500);
      
    } catch (err) {
      // Error handled by context - don't close
      console.error('Upload failed:', err);
    }
  }, [activeTab, selectedFile, selectedVideo, subject, gradeLevel, processFile, processYouTube, resetState, onClose]);

  // Check if can submit
  const canSubmit = (activeTab === 'file' && selectedFile) || 
                    (activeTab === 'youtube' && selectedVideo);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-nanobanana-yellow border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-bold font-comic">Add New Lesson</h2>
              </div>
              {!isProcessing && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-yellow-400 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {isProcessing ? (
                // Processing state
                <ProcessingAnimation 
                  stage={processingStage} 
                  progress={processingProgress} 
                />
              ) : (
                // Input state
                <div className="space-y-6">
                  {/* Tab buttons */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => !tab.disabled && setActiveTab(tab.id)}
                        disabled={tab.disabled}
                        className={`
                          flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                          font-medium transition-all
                          ${activeTab === tab.id
                            ? 'bg-white shadow-md border-2 border-black'
                            : 'hover:bg-gray-200'
                          }
                          ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'file' && (
                      <motion.div
                        key="file-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <FileDropzone
                          onFileSelect={setSelectedFile}
                          selectedFile={selectedFile}
                          onClear={handleClearFile}
                        />
                      </motion.div>
                    )}
                    
                    {activeTab === 'youtube' && (
                      <motion.div
                        key="youtube-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <YouTubeInput
                          onVideoSelect={setSelectedVideo}
                          selectedVideo={selectedVideo}
                          onClear={handleClearVideo}
                        />
                      </motion.div>
                    )}
                    
                    {activeTab === 'camera' && (
                      <motion.div
                        key="camera-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-8 text-center text-gray-500"
                      >
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Coming soon!</p>
                        <p className="text-sm">Take photos of worksheets and textbooks</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Subject/Grade selector - only show when content is selected */}
                  <AnimatePresence>
                    {canSubmit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <SubjectSelector
                          subject={subject}
                          onSubjectChange={setSubject}
                          gradeLevel={gradeLevel}
                          onGradeLevelChange={setGradeLevel}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm">
                      {error.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isProcessing && (
              <div className="p-4 border-t-4 border-black bg-gray-50 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 font-bold border-4 border-black rounded-xl bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`
                    flex-1 px-6 py-3 font-bold border-4 border-black rounded-xl
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    active:translate-y-[2px] active:shadow-none
                    transition-all
                    ${canSubmit
                      ? 'bg-nanobanana-green text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  Start Learning! 🚀
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
```

---

### Step 7: Create Barrel Export

**File:** `src/components/Upload/index.js`

```javascript
export { default as UploadModal } from './UploadModal';
export { default as UploadButton } from './UploadButton';
export { default as FileDropzone } from './FileDropzone';
export { default as YouTubeInput } from './YouTubeInput';
export { default as ProcessingAnimation } from './ProcessingAnimation';
export { default as SubjectSelector } from './SubjectSelector';
```

---

## 8. Integration

### Update StudyPage

**File:** `src/pages/StudyPage.jsx`

```jsx
import React, { useState } from 'react';
import { useLessonContext } from '../context/LessonContext';
import { UploadModal, UploadButton } from '../components/Upload';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';

const StudyPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { currentLesson, isProcessing, hasLessons } = useLessonContext();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel: Lesson Content */}
      <div className="w-1/2 border-r-4 border-black overflow-y-auto bg-white">
        <LessonView />
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="w-1/2 flex flex-col bg-white">
        <ChatInterface demoMode={!currentLesson && !isProcessing} />
      </div>

      {/* Floating Upload Button */}
      <UploadButton 
        variant="floating" 
        onClick={() => setIsUploadModalOpen(true)}
        disabled={isProcessing}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default StudyPage;
```

---

## 9. Testing Checklist

### Upload Modal Tests
- [ ] Opens when clicking Upload button
- [ ] Closes on backdrop click (when not processing)
- [ ] Closes on X button click
- [ ] Tabs switch correctly (File/YouTube/Camera)
- [ ] Cannot close during processing
- [ ] Cancel confirmation appears during processing

### File Dropzone Tests
- [ ] Drag and drop works
- [ ] Click to browse works
- [ ] Shows selected file info
- [ ] Clear button removes selection
- [ ] Rejects invalid file types with message
- [ ] Rejects files over 10MB with message
- [ ] Visual feedback on drag over

### YouTube Input Tests
- [ ] Accepts valid YouTube URLs (youtube.com/watch?v=)
- [ ] Accepts short URLs (youtu.be/)
- [ ] Accepts embed URLs
- [ ] Shows error for invalid URLs
- [ ] Displays video thumbnail after validation
- [ ] Clear button removes selection
- [ ] Enter key triggers validation

### Processing Animation Tests
- [ ] Shows correct stage labels
- [ ] Progress bar animates smoothly
- [ ] Stage dots update correctly
- [ ] Fun messages rotate
- [ ] Icon changes per stage

### Subject Selector Tests
- [ ] All subjects clickable
- [ ] Visual feedback on selection
- [ ] Grade dropdown works
- [ ] Only appears after content selected

### Integration Tests
- [ ] Lesson data persists after upload
- [ ] LessonView displays new lesson content
- [ ] ChatInterface receives lesson context
- [ ] Ollie's greeting is context-aware
- [ ] Error states show child-friendly messages

### Edge Cases
- [ ] Multiple rapid uploads
- [ ] Very long file names (truncation)
- [ ] Empty PDF files
- [ ] Network errors during processing
- [ ] Browser refresh during upload
- [ ] Very large files (rejection)
- [ ] Corrupted PDF files

---

## 10. Safety Considerations

### Content Safety
1. **File Validation**: Strict MIME type and size checks
2. **Content Scanning**: AI confidence score in `contentFlags`
3. **Parent Review Flag**: `contentFlags.reviewed` for parent approval
4. **No External Execution**: Files processed client-side only

### Child Privacy (COPPA/GDPR-K)
1. **No Server Upload**: Files processed in browser, only lesson data stored
2. **Local Storage Only**: No data sent to external servers in MVP
3. **No PII Extraction**: Content analysis doesn't extract personal info

### Error Handling
1. **Child-Friendly Messages**: All errors use `ERROR_MESSAGES` constants
2. **No Raw Exceptions**: Errors caught and translated
3. **Retry Support**: Users can easily try again
4. **Progress Persistence**: Can cancel and restart cleanly

### YouTube Safety
1. **URL Validation**: Only valid YouTube URLs accepted
2. **No Auto-Play**: Videos embedded with controls
3. **Transcript-Based**: Content comes from transcript, not raw video

---

## Quick Reference: Upload Flow Usage

```javascript
// Import components
import { UploadModal, UploadButton } from '../components/Upload';

// In your page component
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <UploadButton onClick={() => setIsOpen(true)} />
    <UploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  </>
);
```

```javascript
// Use processor hook directly
import { useLessonProcessor } from '../hooks/useLessonProcessor';

const { processFile, processYouTube, isProcessing } = useLessonProcessor();

// Process a file
await processFile(file, { subject: 'mathematics', gradeLevel: 'grade-3' });

// Process a YouTube video
await processYouTube('https://youtube.com/watch?v=abc123', { subject: 'science' });
```

---

**Created for:** NanoBanana K-6 AI Learning Platform  
**Dependencies:** LessonContext (must be implemented first)  
**Estimated Time:** 4-6 hours  
**Compatibility:** React 18+, requires framer-motion, react-dropzone, pdfjs-dist
