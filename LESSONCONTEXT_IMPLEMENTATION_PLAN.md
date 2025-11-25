# LessonContext Implementation Plan
## K-6 AI Learning Platform - Core Learning Loop Foundation

**Purpose:** Implement the LessonContext system that enables global lesson state management, connecting uploaded content to the chat interface (Jeffrey AI tutor) and the LessonView component.

**Estimated Time:** 2-4 hours for core implementation

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Models](#3-data-models)
4. [Implementation Steps](#4-implementation-steps)
5. [Integration Points](#5-integration-points)
6. [Testing Checklist](#6-testing-checklist)
7. [Safety Considerations](#7-safety-considerations)

---

## 1. Prerequisites

### Dependencies to Install
```bash
npm install uuid
```

### Assumed Existing Structure
```
src/
├── components/
│   ├── Chat/
│   │   └── ChatInterface.jsx    # Existing - will consume context
│   └── Lesson/
│       └── LessonView.jsx       # Existing - will consume context
├── pages/
│   └── StudyPage.jsx            # Existing - will wrap with provider
└── App.jsx                      # Entry point
```

### Files to Create
```
src/
├── context/
│   └── LessonContext.jsx        # NEW - Main context provider
├── hooks/
│   └── useLessonActions.js      # NEW - Convenience hook for actions
└── constants/
    └── lessonConstants.js       # NEW - Processing stages, defaults
```

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LessonProvider (App.jsx)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          LessonContext                               │ │
│  │                                                                      │ │
│  │  State:                        Actions:                              │ │
│  │  • currentLesson               • startProcessing()                   │ │
│  │  • lessons[]                   • updateProgress()                    │ │
│  │  • isProcessing                • setProcessingStage()                │ │
│  │  • processingProgress          • addLesson()                         │ │
│  │  • processingStage             • setCurrentLesson()                  │ │
│  │  • error                       • updateLesson()                      │ │
│  │                                • deleteLesson()                      │ │
│  │                                • setError()                          │ │
│  │                                • clearError()                        │ │
│  │                                • resetProcessing()                   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│          ┌─────────────────────────┼─────────────────────────┐          │
│          ▼                         ▼                         ▼          │
│   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐    │
│   │ StudyPage   │          │ LessonView  │          │ChatInterface│    │
│   │ (orchestr.) │          │ (display)   │          │ (Jeffrey)   │    │
│   └─────────────┘          └─────────────┘          └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Upload triggers** `startProcessing()` → UI shows loading state
2. **Processing updates** via `updateProgress()` and `setProcessingStage()`
3. **Completion calls** `addLesson()` → automatically sets as current lesson
4. **LessonView** reads `currentLesson` to display content
5. **ChatInterface** reads `currentLesson` to provide context to Jeffrey

---

## 3. Data Models

### Lesson Object Schema
```typescript
interface Lesson {
  // Core identifiers
  id: string;                    // UUID v4
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  
  // Source information
  source: {
    type: 'pdf' | 'image' | 'youtube' | 'text';
    originalName: string;        // "Chapter 5 - Fractions.pdf"
    fileSize?: number;           // Bytes
    mimeType?: string;           // "application/pdf"
    youtubeId?: string;          // "dQw4w9WgXcQ"
    thumbnailUrl?: string;       // YouTube thumbnail
  };
  
  // AI-processed content
  title: string;                 // "Understanding Fractions"
  summary: string;               // 2-3 sentence overview
  gradeLevel: string;            // "Grade 3"
  subject: string;               // "Mathematics"
  
  // Structured content
  rawText: string;               // Original extracted text
  chapters: Chapter[];           // AI-organized sections
  keyConceptsForchat: string[];  // For Jeffrey's context
  vocabulary: VocabWord[];       // Key terms with definitions
  
  // Learning aids
  suggestedQuestions: string[];  // "What is a numerator?"
  relatedTopics: string[];       // "Decimals", "Division"
  
  // Progress tracking (for gamification integration)
  progress: {
    started: boolean;
    percentComplete: number;
    lastAccessedAt: string | null;
    timeSpent: number;           // Seconds
  };
  
  // Child safety metadata
  contentFlags: {
    reviewed: boolean;           // Has parent approved?
    aiConfidence: number;        // 0-1, how confident AI is content is safe
  };
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface VocabWord {
  term: string;
  definition: string;
  example?: string;
}
```

### Processing Stage Enum
```typescript
type ProcessingStage = 
  | 'idle'
  | 'uploading'      // File being uploaded
  | 'extracting'     // Text being extracted from PDF/image
  | 'analyzing'      // Gemini analyzing content
  | 'generating'     // Generating summary, chapters, questions
  | 'complete'       // Done, lesson ready
  | 'error';         // Something went wrong
```

---

## 4. Implementation Steps

### Step 1: Create Constants File

**File:** `src/constants/lessonConstants.js`

```javascript
// Processing stages with child-friendly labels
export const PROCESSING_STAGES = {
  idle: {
    key: 'idle',
    label: '',
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
};

// Local storage keys
export const STORAGE_KEYS = {
  LESSONS: 'nanobanana_lessons',
  CURRENT_LESSON_ID: 'nanobanana_current_lesson_id',
};
```

---

### Step 2: Create LessonContext

**File:** `src/context/LessonContext.jsx`

```jsx
import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PROCESSING_STAGES, 
  DEFAULT_LESSON, 
  STORAGE_KEYS 
} from '../constants/lessonConstants';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  // Current active lesson (null if none selected)
  currentLesson: null,
  
  // All lessons in library
  lessons: [],
  
  // Processing state
  isProcessing: false,
  processingProgress: 0,
  processingStage: 'idle',
  
  // Error handling
  error: null,
  
  // UI state
  isLessonDrawerOpen: false,
};

// ============================================
// ACTION TYPES
// ============================================
const ACTIONS = {
  // Processing lifecycle
  START_PROCESSING: 'START_PROCESSING',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_PROCESSING_STAGE: 'SET_PROCESSING_STAGE',
  RESET_PROCESSING: 'RESET_PROCESSING',
  
  // Lesson CRUD
  ADD_LESSON: 'ADD_LESSON',
  SET_CURRENT_LESSON: 'SET_CURRENT_LESSON',
  UPDATE_LESSON: 'UPDATE_LESSON',
  DELETE_LESSON: 'DELETE_LESSON',
  LOAD_LESSONS: 'LOAD_LESSONS',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // UI state
  TOGGLE_LESSON_DRAWER: 'TOGGLE_LESSON_DRAWER',
  
  // Progress tracking
  UPDATE_LESSON_PROGRESS: 'UPDATE_LESSON_PROGRESS',
  INCREMENT_TIME_SPENT: 'INCREMENT_TIME_SPENT',
};

// ============================================
// REDUCER
// ============================================
function lessonReducer(state, action) {
  switch (action.type) {
    // --- Processing Lifecycle ---
    case ACTIONS.START_PROCESSING:
      return {
        ...state,
        isProcessing: true,
        processingProgress: PROCESSING_STAGES.uploading.progress,
        processingStage: 'uploading',
        error: null,
      };
      
    case ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        processingProgress: Math.min(100, Math.max(0, action.payload)),
      };
      
    case ACTIONS.SET_PROCESSING_STAGE:
      const stage = PROCESSING_STAGES[action.payload];
      return {
        ...state,
        processingStage: action.payload,
        processingProgress: stage ? stage.progress : state.processingProgress,
      };
      
    case ACTIONS.RESET_PROCESSING:
      return {
        ...state,
        isProcessing: false,
        processingProgress: 0,
        processingStage: 'idle',
      };

    // --- Lesson CRUD ---
    case ACTIONS.ADD_LESSON:
      return {
        ...state,
        lessons: [action.payload, ...state.lessons], // Newest first
        currentLesson: action.payload,
        isProcessing: false,
        processingProgress: 100,
        processingStage: 'complete',
      };
      
    case ACTIONS.LOAD_LESSONS:
      return {
        ...state,
        lessons: action.payload.lessons,
        currentLesson: action.payload.currentLesson,
      };
      
    case ACTIONS.SET_CURRENT_LESSON:
      const lesson = state.lessons.find(l => l.id === action.payload);
      return {
        ...state,
        currentLesson: lesson || null,
      };
      
    case ACTIONS.UPDATE_LESSON:
      const updatedLessons = state.lessons.map(l => 
        l.id === action.payload.id 
          ? { ...l, ...action.payload.updates, updatedAt: new Date().toISOString() } 
          : l
      );
      return {
        ...state,
        lessons: updatedLessons,
        currentLesson: state.currentLesson?.id === action.payload.id 
          ? { ...state.currentLesson, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.currentLesson,
      };
      
    case ACTIONS.DELETE_LESSON:
      const filteredLessons = state.lessons.filter(l => l.id !== action.payload);
      return {
        ...state,
        lessons: filteredLessons,
        currentLesson: state.currentLesson?.id === action.payload 
          ? (filteredLessons[0] || null)
          : state.currentLesson,
      };

    // --- Progress Tracking ---
    case ACTIONS.UPDATE_LESSON_PROGRESS:
      return {
        ...state,
        lessons: state.lessons.map(l => 
          l.id === action.payload.id 
            ? { 
                ...l, 
                progress: { ...l.progress, ...action.payload.progress },
                updatedAt: new Date().toISOString(),
              } 
            : l
        ),
        currentLesson: state.currentLesson?.id === action.payload.id 
          ? { 
              ...state.currentLesson, 
              progress: { ...state.currentLesson.progress, ...action.payload.progress },
              updatedAt: new Date().toISOString(),
            }
          : state.currentLesson,
      };
      
    case ACTIONS.INCREMENT_TIME_SPENT:
      if (!state.currentLesson) return state;
      return {
        ...state,
        currentLesson: {
          ...state.currentLesson,
          progress: {
            ...state.currentLesson.progress,
            timeSpent: (state.currentLesson.progress?.timeSpent || 0) + action.payload,
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };

    // --- Error Handling ---
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        processingStage: 'error',
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        processingStage: 'idle',
      };

    // --- UI State ---
    case ACTIONS.TOGGLE_LESSON_DRAWER:
      return {
        ...state,
        isLessonDrawerOpen: action.payload ?? !state.isLessonDrawerOpen,
      };

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================
const LessonContext = createContext(null);

// ============================================
// PROVIDER COMPONENT
// ============================================
export function LessonProvider({ children }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState);

  // --- Persistence: Load from localStorage on mount ---
  useEffect(() => {
    try {
      const storedLessons = localStorage.getItem(STORAGE_KEYS.LESSONS);
      const storedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_LESSON_ID);
      
      if (storedLessons) {
        const lessons = JSON.parse(storedLessons);
        const currentLesson = storedCurrentId 
          ? lessons.find(l => l.id === storedCurrentId) 
          : lessons[0] || null;
          
        dispatch({ 
          type: ACTIONS.LOAD_LESSONS, 
          payload: { lessons, currentLesson } 
        });
      }
    } catch (error) {
      console.error('Failed to load lessons from storage:', error);
    }
  }, []);

  // --- Persistence: Save to localStorage on state change ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(state.lessons));
      if (state.currentLesson) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_LESSON_ID, state.currentLesson.id);
      }
    } catch (error) {
      console.error('Failed to save lessons to storage:', error);
    }
  }, [state.lessons, state.currentLesson]);

  // --- Time tracking: Increment every 30 seconds while lesson is active ---
  useEffect(() => {
    if (!state.currentLesson || state.isProcessing) return;
    
    const interval = setInterval(() => {
      dispatch({ type: ACTIONS.INCREMENT_TIME_SPENT, payload: 30 });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state.currentLesson?.id, state.isProcessing]);

  // ============================================
  // ACTION CREATORS
  // ============================================
  
  // Processing lifecycle
  const startProcessing = useCallback(() => {
    dispatch({ type: ACTIONS.START_PROCESSING });
  }, []);

  const updateProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress });
  }, []);

  const setProcessingStage = useCallback((stage) => {
    dispatch({ type: ACTIONS.SET_PROCESSING_STAGE, payload: stage });
  }, []);

  const resetProcessing = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_PROCESSING });
  }, []);

  // Lesson CRUD
  const addLesson = useCallback((lessonData) => {
    const now = new Date().toISOString();
    const newLesson = {
      ...DEFAULT_LESSON,
      ...lessonData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      progress: {
        ...DEFAULT_LESSON.progress,
        started: true,
        lastAccessedAt: now,
      },
    };
    dispatch({ type: ACTIONS.ADD_LESSON, payload: newLesson });
    return newLesson;
  }, []);

  const setCurrentLesson = useCallback((lessonId) => {
    dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: lessonId });
  }, []);

  const updateLesson = useCallback((lessonId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_LESSON, payload: { id: lessonId, updates } });
  }, []);

  const deleteLesson = useCallback((lessonId) => {
    dispatch({ type: ACTIONS.DELETE_LESSON, payload: lessonId });
  }, []);

  // Progress tracking
  const updateLessonProgress = useCallback((lessonId, progress) => {
    dispatch({ type: ACTIONS.UPDATE_LESSON_PROGRESS, payload: { id: lessonId, progress } });
  }, []);

  const markLessonComplete = useCallback((lessonId) => {
    updateLessonProgress(lessonId, { percentComplete: 100, completedAt: new Date().toISOString() });
  }, [updateLessonProgress]);

  // Error handling
  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // UI state
  const toggleLessonDrawer = useCallback((isOpen) => {
    dispatch({ type: ACTIONS.TOGGLE_LESSON_DRAWER, payload: isOpen });
  }, []);

  // ============================================
  // DERIVED STATE / SELECTORS
  // ============================================
  const derivedState = useMemo(() => ({
    // Check if there's any lesson available
    hasLessons: state.lessons.length > 0,
    
    // Total lessons count
    lessonCount: state.lessons.length,
    
    // Get current processing stage info
    currentStageInfo: PROCESSING_STAGES[state.processingStage] || PROCESSING_STAGES.idle,
    
    // Is ready for interaction (not processing, has lesson)
    isReady: !state.isProcessing && state.currentLesson !== null,
    
    // Get recent lessons (last 5)
    recentLessons: state.lessons.slice(0, 5),
    
    // Get lessons by subject (for filtering)
    lessonsBySubject: state.lessons.reduce((acc, lesson) => {
      const subject = lesson.subject || 'Uncategorized';
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(lesson);
      return acc;
    }, {}),
  }), [state.lessons, state.currentLesson, state.isProcessing, state.processingStage]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = useMemo(() => ({
    // State
    ...state,
    ...derivedState,
    
    // Processing actions
    startProcessing,
    updateProgress,
    setProcessingStage,
    resetProcessing,
    
    // Lesson CRUD
    addLesson,
    setCurrentLesson,
    updateLesson,
    deleteLesson,
    
    // Progress tracking
    updateLessonProgress,
    markLessonComplete,
    
    // Error handling
    setError,
    clearError,
    
    // UI state
    toggleLessonDrawer,
  }), [
    state,
    derivedState,
    startProcessing,
    updateProgress,
    setProcessingStage,
    resetProcessing,
    addLesson,
    setCurrentLesson,
    updateLesson,
    deleteLesson,
    updateLessonProgress,
    markLessonComplete,
    setError,
    clearError,
    toggleLessonDrawer,
  ]);

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================
export function useLessonContext() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
}

// ============================================
// EXPORTS
// ============================================
export { LessonContext, ACTIONS };
export default LessonContext;
```

---

### Step 3: Create Convenience Hook

**File:** `src/hooks/useLessonActions.js`

```javascript
import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';

/**
 * Convenience hook for common lesson action patterns.
 * Simplifies component code by providing pre-composed actions.
 */
export function useLessonActions() {
  const {
    startProcessing,
    updateProgress,
    setProcessingStage,
    addLesson,
    setError,
    resetProcessing,
    currentLesson,
    updateLesson,
  } = useLessonContext();

  /**
   * Process an upload through all stages.
   * Used by UploadModal and related components.
   * 
   * @param {Object} options
   * @param {File|string} options.source - File object or YouTube URL
   * @param {Function} options.extractText - Function to extract text from source
   * @param {Function} options.analyzeContent - Function to analyze with AI
   * @param {Function} options.onComplete - Callback when complete
   */
  const processUpload = useCallback(async ({
    source,
    sourceType,
    extractText,
    analyzeContent,
    onComplete,
  }) => {
    try {
      // Stage 1: Start
      startProcessing();
      
      // Stage 2: Upload/Extract
      setProcessingStage('extracting');
      const rawText = await extractText(source);
      updateProgress(40);
      
      // Stage 3: Analyze
      setProcessingStage('analyzing');
      const analysis = await analyzeContent(rawText);
      updateProgress(70);
      
      // Stage 4: Generate lesson
      setProcessingStage('generating');
      const lessonData = {
        source: {
          type: sourceType,
          originalName: source.name || 'YouTube Video',
          fileSize: source.size,
          mimeType: source.type,
        },
        rawText,
        ...analysis,
      };
      updateProgress(90);
      
      // Stage 5: Complete
      const newLesson = addLesson(lessonData);
      
      if (onComplete) {
        onComplete(newLesson);
      }
      
      return newLesson;
    } catch (error) {
      setError({
        message: error.message || 'Failed to process upload',
        code: error.code || 'PROCESSING_ERROR',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }, [startProcessing, setProcessingStage, updateProgress, addLesson, setError]);

  /**
   * Get context string for chat (Jeffrey).
   * Returns a formatted string with lesson info for AI context.
   */
  const getChatContext = useCallback(() => {
    if (!currentLesson) return null;
    
    return {
      title: currentLesson.title,
      subject: currentLesson.subject,
      gradeLevel: currentLesson.gradeLevel,
      summary: currentLesson.summary,
      keyConcepts: currentLesson.keyConceptsForChat || [],
      vocabulary: currentLesson.vocabulary || [],
      currentChapter: currentLesson.chapters?.[0]?.title || null,
    };
  }, [currentLesson]);

  /**
   * Add a message to lesson chat history.
   * For tracking conversation context.
   */
  const addChatMessage = useCallback((message) => {
    if (!currentLesson) return;
    
    const chatHistory = currentLesson.chatHistory || [];
    updateLesson(currentLesson.id, {
      chatHistory: [...chatHistory, {
        ...message,
        timestamp: new Date().toISOString(),
      }].slice(-50), // Keep last 50 messages
    });
  }, [currentLesson, updateLesson]);

  /**
   * Reset processing state without clearing lessons.
   * Used for retry scenarios.
   */
  const cancelProcessing = useCallback(() => {
    resetProcessing();
  }, [resetProcessing]);

  return {
    processUpload,
    getChatContext,
    addChatMessage,
    cancelProcessing,
  };
}

export default useLessonActions;
```

---

### Step 4: Wrap App with Provider

**Update:** `src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
// Future: import { GamificationProvider } from './context/GamificationContext';

function App() {
  return (
    <LessonProvider>
      {/* Future: Wrap with GamificationProvider when ready */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          {/* Future routes */}
          {/* <Route path="/library" element={<LibraryPage />} /> */}
          {/* <Route path="/achievements" element={<AchievementsPage />} /> */}
        </Routes>
      </Router>
    </LessonProvider>
  );
}

export default App;
```

---

## 5. Integration Points

### 5.1 ChatInterface Integration

**Update your existing ChatInterface to consume lesson context:**

```jsx
// At top of ChatInterface.jsx
import { useLessonContext } from '../../context/LessonContext';
import { useLessonActions } from '../../hooks/useLessonActions';

const ChatInterface = ({ demoMode = false }) => {
  const { 
    currentLesson, 
    isReady,
    hasLessons 
  } = useLessonContext();
  
  const { getChatContext, addChatMessage } = useLessonActions();
  
  // Use lesson context for Jeffrey's awareness
  const lessonContext = getChatContext();
  
  // Suggested questions based on lesson
  const suggestedQuestions = currentLesson?.suggestedQuestions || [
    "What should I learn today?",
    "Can you explain this concept?",
    "Give me a fun fact!",
  ];
  
  // When sending a message to AI, include context
  const handleSend = async () => {
    if (!input.trim() || !isReady) return;
    
    const userMessage = { role: 'user', text: input };
    addChatMessage(userMessage);
    
    // Include lesson context in API call
    const response = await geminiChat({
      message: input,
      context: lessonContext, // <-- Pass lesson context to AI
      history: messages,
    });
    
    addChatMessage({ role: 'assistant', text: response });
  };
  
  // Disable input if no lesson
  const inputDisabled = !isReady && !demoMode;
  
  // ... rest of component
};
```

### 5.2 LessonView Integration

**Update your existing LessonView to display lesson content:**

```jsx
// At top of LessonView.jsx
import { useLessonContext } from '../../context/LessonContext';

const LessonView = () => {
  const { 
    currentLesson, 
    isProcessing, 
    processingStage,
    currentStageInfo,
    hasLessons 
  } = useLessonContext();
  
  // Show processing state
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-xl font-bold mb-4">
          {currentStageInfo.childLabel}
        </div>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-nanobanana-yellow transition-all duration-500"
            style={{ width: `${currentStageInfo.progress}%` }}
          />
        </div>
      </div>
    );
  }
  
  // Show empty state if no lesson
  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold mb-4">
          👋 Hi there!
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a lesson to start learning with Jeffrey!
        </p>
        {/* Upload button will be added here */}
      </div>
    );
  }
  
  // Show lesson content
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 bg-nanobanana-yellow rounded text-sm font-medium">
          {currentLesson.subject}
        </span>
        <span className="px-2 py-1 bg-gray-200 rounded text-sm">
          {currentLesson.gradeLevel}
        </span>
      </div>
      <p className="text-gray-700 mb-6">{currentLesson.summary}</p>
      
      {/* Chapters */}
      {currentLesson.chapters?.map((chapter, index) => (
        <div key={chapter.id} className="mb-6">
          <h2 className="text-lg font-bold mb-2">
            {index + 1}. {chapter.title}
          </h2>
          <p className="text-gray-700">{chapter.content}</p>
        </div>
      ))}
      
      {/* Vocabulary */}
      {currentLesson.vocabulary?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">📚 Key Words</h3>
          <div className="grid gap-2">
            {currentLesson.vocabulary.map((word, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border-2 border-black">
                <span className="font-bold">{word.term}:</span> {word.definition}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 5.3 StudyPage Integration

**Update StudyPage to use context:**

```jsx
import { useLessonContext } from '../context/LessonContext';

const StudyPage = () => {
  const { currentLesson, isProcessing } = useLessonContext();
  
  return (
    <div className="flex h-screen">
      {/* Left: Lesson Content */}
      <div className="w-1/2 border-r-4 border-black overflow-y-auto">
        <LessonView />
      </div>
      
      {/* Right: Chat with Jeffrey */}
      <div className="w-1/2 flex flex-col">
        <ChatInterface demoMode={!currentLesson && !isProcessing} />
      </div>
    </div>
  );
};
```

---

## 6. Testing Checklist

### Unit Tests

- [ ] **LessonContext Reducer**
  - [ ] START_PROCESSING sets correct state
  - [ ] ADD_LESSON adds lesson and sets as current
  - [ ] UPDATE_LESSON modifies correct lesson
  - [ ] DELETE_LESSON removes lesson and updates current
  - [ ] SET_ERROR transitions to error state
  - [ ] CLEAR_ERROR resets error state

### Integration Tests

- [ ] **LessonProvider**
  - [ ] Loads lessons from localStorage on mount
  - [ ] Saves lessons to localStorage on change
  - [ ] Time tracking increments every 30 seconds
  - [ ] Multiple components can read same state

### Component Tests

- [ ] **ChatInterface**
  - [ ] Disables input when no lesson
  - [ ] Shows suggested questions from lesson
  - [ ] Passes context to AI calls

- [ ] **LessonView**
  - [ ] Shows processing animation during upload
  - [ ] Shows empty state when no lesson
  - [ ] Renders lesson content correctly

### Manual Testing

- [ ] Upload a PDF → verify lesson appears
- [ ] Refresh page → verify lesson persists
- [ ] Switch between lessons → verify correct content shows
- [ ] Delete a lesson → verify removal and fallback

---

## 7. Safety Considerations

### Child Safety

1. **Content Flags**: Every lesson has `contentFlags.reviewed` and `aiConfidence`
2. **Parent Dashboard Hook**: `updateLessonProgress` can be used to flag content
3. **No External Links**: Lesson content should be sanitized to remove URLs

### Data Privacy (COPPA/GDPR-K)

1. **localStorage Only**: No server persistence in MVP (data stays on device)
2. **Minimal Data**: Only educational content, no personal identifiers
3. **Clear on Request**: Parent dashboard can call `deleteLesson` to remove data

### Error Handling

1. **Graceful Degradation**: UI never breaks, shows child-friendly error messages
2. **No Raw Errors**: Error messages translated via `PROCESSING_STAGES.error.childLabel`
3. **Retry Mechanism**: `resetProcessing` allows user to try again

---

## Quick Reference: Common Operations

```javascript
// Import context hook
import { useLessonContext } from '../context/LessonContext';

// In component
const { 
  currentLesson,     // Current active lesson object
  isProcessing,      // Boolean: currently processing upload?
  addLesson,         // Function: add new lesson
  setCurrentLesson,  // Function: switch to different lesson (by ID)
  updateLesson,      // Function: update lesson fields
  deleteLesson,      // Function: remove lesson
} = useLessonContext();

// Add a lesson
const newLesson = addLesson({
  title: "Fractions 101",
  subject: "Mathematics",
  gradeLevel: "Grade 3",
  summary: "Learn about numerators and denominators",
  rawText: "...",
  chapters: [...],
});

// Switch lessons
setCurrentLesson("lesson-uuid-here");

// Update a lesson
updateLesson(lessonId, { progress: { percentComplete: 50 } });

// Delete a lesson
deleteLesson(lessonId);
```

---

## Next Steps After Implementation

1. **Upload Flow Components** (UploadModal, FileDropzone, etc.)
2. **Gemini Integration** (useGemini hook for AI processing)
3. **HighlightableContent** (select text → ask Jeffrey)
4. **GamificationContext** (XP, streaks, badges)

---

**Created for:** NanoBanana K-6 AI Learning Platform  
**Last Updated:** Session Date  
**Compatibility:** React 18+, Node.js 18+
