# Upload Flow Implementation Plan
## K-6 AI Learning Platform - Option A

**Goal:** Enable users to upload lesson content (PDFs, images, YouTube links) → process with Gemini AI → store in context → make Ollie (AI tutor) aware of the content for contextual conversations.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [New Dependencies](#2-new-dependencies)
3. [File Structure](#3-file-structure)
4. [Context Setup](#4-context-setup)
5. [Component Implementations](#5-component-implementations)
6. [Hook Implementations](#6-hook-implementations)
7. [Integration with Existing Components](#7-integration-with-existing-components)
8. [Styling Updates](#8-styling-updates)
9. [Testing Checklist](#9-testing-checklist)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UPLOAD FLOW                                    │
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │   UPLOAD     │     │   PROCESS    │     │    STORE     │            │
│   │   MODAL      │ ──▶ │   WITH AI    │ ──▶ │  IN CONTEXT  │            │
│   │              │     │   (Gemini)   │     │              │            │
│   └──────────────┘     └──────────────┘     └──────────────┘            │
│          │                    │                    │                     │
│          ▼                    ▼                    ▼                     │
│   • Drag & Drop        • Extract text       • LessonContext             │
│   • File picker        • Generate summary   • Available to Chat         │
│   • YouTube URL        • Create chapters    • Persistent state          │
│   • Camera capture     • Key concepts       • History tracking          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                        │
│                                                                          │
│   User Upload ──▶ FileProcessor ──▶ GeminiAPI ──▶ LessonContext         │
│                                                         │                │
│                                                         ▼                │
│                                          ┌──────────────────────────┐   │
│                                          │     StudyPage            │   │
│                                          │  ┌────────┐ ┌────────┐   │   │
│                                          │  │Lesson  │ │ Chat   │   │   │
│                                          │  │View    │ │Interface│  │   │
│                                          │  │(reads) │ │(reads) │   │   │
│                                          │  └────────┘ └────────┘   │   │
│                                          └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.3",
    "pdfjs-dist": "^4.0.379",
    "uuid": "^9.0.1"
  }
}
```

**Installation command:**
```bash
npm install react-dropzone pdfjs-dist uuid
```

**Note:** For production Gemini integration, you'll need `@google/generative-ai` but for now we'll mock the API responses to allow frontend development.

---

## 3. File Structure

Create the following new files:

```
src/
├── context/
│   └── LessonContext.jsx           # NEW - Global lesson state
│
├── components/
│   └── Upload/
│       ├── UploadModal.jsx         # NEW - Main upload interface
│       ├── FileDropzone.jsx        # NEW - Drag & drop zone
│       ├── YouTubeInput.jsx        # NEW - YouTube URL input
│       ├── ProcessingAnimation.jsx # NEW - Loading state
│       └── UploadButton.jsx        # NEW - Trigger button
│
├── hooks/
│   ├── useLessonProcessor.js       # NEW - Process uploaded files
│   └── useGemini.js                # NEW - Gemini API integration
│
├── utils/
│   ├── fileProcessors.js           # NEW - PDF/Image text extraction
│   └── youtubeUtils.js             # NEW - YouTube URL parsing
│
└── services/
    └── geminiService.js            # NEW - API wrapper (mockable)
```

---

## 4. Context Setup

### 4.1 LessonContext.jsx

**Location:** `src/context/LessonContext.jsx`

```jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
    currentLesson: null,
    lessons: [],
    isProcessing: false,
    processingProgress: 0,
    processingStage: '', // 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete'
    error: null,
};

// Action types
const ACTIONS = {
    START_PROCESSING: 'START_PROCESSING',
    UPDATE_PROGRESS: 'UPDATE_PROGRESS',
    SET_PROCESSING_STAGE: 'SET_PROCESSING_STAGE',
    ADD_LESSON: 'ADD_LESSON',
    SET_CURRENT_LESSON: 'SET_CURRENT_LESSON',
    UPDATE_LESSON: 'UPDATE_LESSON',
    DELETE_LESSON: 'DELETE_LESSON',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    RESET_PROCESSING: 'RESET_PROCESSING',
};

// Reducer
function lessonReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_PROCESSING:
            return {
                ...state,
                isProcessing: true,
                processingProgress: 0,
                processingStage: 'uploading',
                error: null,
            };
        case ACTIONS.UPDATE_PROGRESS:
            return {
                ...state,
                processingProgress: action.payload,
            };
        case ACTIONS.SET_PROCESSING_STAGE:
            return {
                ...state,
                processingStage: action.payload,
            };
        case ACTIONS.ADD_LESSON:
            return {
                ...state,
                lessons: [...state.lessons, action.payload],
                currentLesson: action.payload,
                isProcessing: false,
                processingProgress: 100,
                processingStage: 'complete',
            };
        case ACTIONS.SET_CURRENT_LESSON:
            return {
                ...state,
                currentLesson: state.lessons.find(l => l.id === action.payload) || null,
            };
        case ACTIONS.UPDATE_LESSON:
            return {
                ...state,
                lessons: state.lessons.map(l => 
                    l.id === action.payload.id ? { ...l, ...action.payload } : l
                ),
                currentLesson: state.currentLesson?.id === action.payload.id 
                    ? { ...state.currentLesson, ...action.payload }
                    : state.currentLesson,
            };
        case ACTIONS.DELETE_LESSON:
            return {
                ...state,
                lessons: state.lessons.filter(l => l.id !== action.payload),
                currentLesson: state.currentLesson?.id === action.payload 
                    ? null 
                    : state.currentLesson,
            };
        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isProcessing: false,
            };
        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case ACTIONS.RESET_PROCESSING:
            return {
                ...state,
                isProcessing: false,
                processingProgress: 0,
                processingStage: '',
            };
        default:
            return state;
    }
}

// Context
const LessonContext = createContext(null);

// Provider component
export function LessonProvider({ children }) {
    const [state, dispatch] = useReducer(lessonReducer, initialState);

    // Action creators
    const startProcessing = useCallback(() => {
        dispatch({ type: ACTIONS.START_PROCESSING });
    }, []);

    const updateProgress = useCallback((progress) => {
        dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress });
    }, []);

    const setProcessingStage = useCallback((stage) => {
        dispatch({ type: ACTIONS.SET_PROCESSING_STAGE, payload: stage });
    }, []);

    const addLesson = useCallback((lesson) => {
        const newLesson = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            ...lesson,
        };
        dispatch({ type: ACTIONS.ADD_LESSON, payload: newLesson });
        return newLesson;
    }, []);

    const setCurrentLesson = useCallback((lessonId) => {
        dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: lessonId });
    }, []);

    const updateLesson = useCallback((lessonUpdate) => {
        dispatch({ type: ACTIONS.UPDATE_LESSON, payload: lessonUpdate });
    }, []);

    const deleteLesson = useCallback((lessonId) => {
        dispatch({ type: ACTIONS.DELETE_LESSON, payload: lessonId });
    }, []);

    const setError = useCallback((error) => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []);

    const resetProcessing = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_PROCESSING });
    }, []);

    const value = {
        // State
        ...state,
        // Actions
        startProcessing,
        updateProgress,
        setProcessingStage,
        addLesson,
        setCurrentLesson,
        updateLesson,
        deleteLesson,
        setError,
        clearError,
        resetProcessing,
    };

    return (
        <LessonContext.Provider value={value}>
            {children}
        </LessonContext.Provider>
    );
}

// Hook
export function useLessonContext() {
    const context = useContext(LessonContext);
    if (!context) {
        throw new Error('useLessonContext must be used within a LessonProvider');
    }
    return context;
}

export default LessonContext;
```

### 4.2 Wrap App with Provider

**Update:** `src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';

function App() {
    return (
        <LessonProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/study" element={<StudyPage />} />
                </Routes>
            </Router>
        </LessonProvider>
    );
}

export default App;
```

---

## 5. Component Implementations

### 5.1 UploadButton.jsx

**Location:** `src/components/Upload/UploadButton.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';

const UploadButton = ({ onClick, variant = 'primary', size = 'medium' }) => {
    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-5 py-3 text-base',
        large: 'px-6 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'bg-nanobanana-yellow hover:bg-yellow-400',
        secondary: 'bg-white hover:bg-gray-100',
        floating: 'bg-nanobanana-green hover:bg-green-500 text-white rounded-full',
    };

    if (variant === 'floating') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="fixed bottom-6 right-6 w-16 h-16 bg-nanobanana-green text-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center z-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            >
                <Plus className="w-8 h-8" />
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={onClick}
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
            `}
        >
            <Upload className="w-5 h-5" />
            Upload Lesson
        </motion.button>
    );
};

export default UploadButton;
```

### 5.2 FileDropzone.jsx

**Location:** `src/components/Upload/FileDropzone.jsx`

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Upload, X, CheckCircle } from 'lucide-react';

const FileDropzone = ({ onFileSelect, selectedFile, onClear, disabled }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled,
    });

    const getFileIcon = (file) => {
        if (!file) return null;
        if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
        return <FileText className="w-8 h-8" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {selectedFile ? (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-green-50 border-4 border-green-500 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl border-2 border-green-500 flex items-center justify-center text-green-600">
                                {getFileIcon(selectedFile)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-green-800 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-green-600">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <button
                                    onClick={onClear}
                                    className="p-2 hover:bg-green-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-green-700" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        {...getRootProps()}
                        className={`
                            p-8 border-4 border-dashed rounded-2xl cursor-pointer
                            transition-all duration-200
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
                                    ${isDragActive ? 'bg-nanobanana-green text-white' : 'bg-nanobanana-yellow'}
                                `}
                            >
                                <Upload className="w-8 h-8" />
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

### 5.3 YouTubeInput.jsx

**Location:** `src/components/Upload/YouTubeInput.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Link, X, CheckCircle, AlertCircle } from 'lucide-react';

const YouTubeInput = ({ onVideoSelect, selectedVideo, onClear, disabled }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    // Extract video ID from various YouTube URL formats
    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // Validate and fetch video info (mock for now)
    const validateVideo = async (videoId) => {
        setIsValidating(true);
        setError('');
        
        // Simulate API call - in production, call YouTube Data API or your backend
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock video data - replace with actual API call
        const mockVideoData = {
            id: videoId,
            title: 'Educational Video: ' + videoId.substring(0, 8),
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            duration: '5:32',
            channel: 'Learning Channel',
        };
        
        setIsValidating(false);
        return mockVideoData;
    };

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        setError('');
    };

    const handleSubmit = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            setError('Invalid YouTube URL. Please check and try again.');
            return;
        }

        try {
            const videoData = await validateVideo(videoId);
            onVideoSelect(videoData);
            setUrl('');
        } catch (err) {
            setError('Could not load video. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {selectedVideo ? (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-red-50 border-4 border-red-500 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-red-500 flex-shrink-0">
                                <img 
                                    src={selectedVideo.thumbnail} 
                                    alt={selectedVideo.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-red-800 truncate">
                                    {selectedVideo.title}
                                </p>
                                <p className="text-sm text-red-600">
                                    {selectedVideo.channel} • {selectedVideo.duration}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-red-500" />
                                <button
                                    onClick={onClear}
                                    className="p-2 hover:bg-red-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-red-700" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={handleUrlChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Paste YouTube link here..."
                                    disabled={disabled || isValidating}
                                    className={`
                                        w-full pl-12 pr-4 py-3 
                                        border-4 border-black rounded-xl
                                        font-medium
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow
                                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                                        ${error ? 'border-red-500' : ''}
                                    `}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={disabled || isValidating || !url.trim()}
                                className={`
                                    px-5 py-3 font-bold
                                    border-4 border-black rounded-xl
                                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-colors
                                    ${disabled || isValidating || !url.trim()
                                        ? 'bg-gray-200 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }
                                `}
                            >
                                {isValidating ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Link className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <Link className="w-5 h-5" />
                                )}
                            </motion.button>
                        </div>
                        
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default YouTubeInput;
```

### 5.4 ProcessingAnimation.jsx

**Location:** `src/components/Upload/ProcessingAnimation.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Lightbulb, CheckCircle } from 'lucide-react';

const stages = [
    { key: 'uploading', label: 'Uploading your lesson...', icon: BookOpen, color: 'bg-blue-500' },
    { key: 'extracting', label: 'Reading the content...', icon: BookOpen, color: 'bg-purple-500' },
    { key: 'analyzing', label: 'Ollie is thinking...', icon: Brain, color: 'bg-pink-500' },
    { key: 'generating', label: 'Creating your study guide...', icon: Lightbulb, color: 'bg-orange-500' },
    { key: 'complete', label: 'All done! 🎉', icon: CheckCircle, color: 'bg-green-500' },
];

const ProcessingAnimation = ({ stage, progress }) => {
    const currentStageIndex = stages.findIndex(s => s.key === stage);
    const CurrentIcon = stages[currentStageIndex]?.icon || Sparkles;
    const currentColor = stages[currentStageIndex]?.color || 'bg-nanobanana-yellow';

    return (
        <div className="flex flex-col items-center py-8 px-4">
            {/* Animated Character */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className={`
                    w-24 h-24 ${currentColor} 
                    rounded-full border-4 border-black 
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    flex items-center justify-center
                    text-white mb-6
                `}
            >
                <CurrentIcon className="w-12 h-12" />
            </motion.div>

            {/* Stage Label */}
            <motion.p
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold font-comic mb-6 text-center"
            >
                {stages[currentStageIndex]?.label || 'Processing...'}
            </motion.p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mb-6">
                <div className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${currentColor}`}
                    />
                </div>
                <p className="text-center text-sm font-bold mt-2 text-gray-600">
                    {Math.round(progress)}%
                </p>
            </div>

            {/* Stage Progress Dots */}
            <div className="flex gap-2">
                {stages.map((s, index) => (
                    <motion.div
                        key={s.key}
                        initial={{ scale: 0 }}
                        animate={{ 
                            scale: 1,
                            backgroundColor: index <= currentStageIndex ? '#22c55e' : '#e5e7eb'
                        }}
                        transition={{ delay: index * 0.1 }}
                        className="w-3 h-3 rounded-full border-2 border-black"
                    />
                ))}
            </div>

            {/* Fun Messages */}
            <motion.div
                key={stage + '-fun'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
            >
                {stage === 'analyzing' && (
                    <p className="text-gray-500 text-sm italic">
                        ✨ Ollie is finding the coolest facts for you!
                    </p>
                )}
                {stage === 'generating' && (
                    <p className="text-gray-500 text-sm italic">
                        🎨 Making everything look awesome...
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default ProcessingAnimation;
```

### 5.5 UploadModal.jsx (Main Component)

**Location:** `src/components/Upload/UploadModal.jsx`

```jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Youtube, Camera, Sparkles } from 'lucide-react';
import FileDropzone from './FileDropzone';
import YouTubeInput from './YouTubeInput';
import ProcessingAnimation from './ProcessingAnimation';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonProcessor } from '../../hooks/useLessonProcessor';

const tabs = [
    { id: 'file', label: 'Upload File', icon: FileText },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'camera', label: 'Camera', icon: Camera },
];

const UploadModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('file');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [subject, setSubject] = useState('');

    const { isProcessing, processingStage, processingProgress } = useLessonContext();
    const { processFile, processYouTube } = useLessonProcessor();

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file);
        // Auto-fill title from filename
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setLessonTitle(nameWithoutExtension);
    }, []);

    const handleVideoSelect = useCallback((video) => {
        setSelectedVideo(video);
        setLessonTitle(video.title);
    }, []);

    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
        if (!selectedVideo) setLessonTitle('');
    }, [selectedVideo]);

    const handleClearVideo = useCallback(() => {
        setSelectedVideo(null);
        if (!selectedFile) setLessonTitle('');
    }, [selectedFile]);

    const handleSubmit = async () => {
        if (!lessonTitle.trim()) return;

        if (selectedFile) {
            await processFile(selectedFile, lessonTitle, subject);
        } else if (selectedVideo) {
            await processYouTube(selectedVideo, lessonTitle, subject);
        }

        // Reset and close on success
        if (!isProcessing) {
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setSelectedVideo(null);
        setLessonTitle('');
        setSubject('');
        setActiveTab('file');
    };

    const canSubmit = (selectedFile || selectedVideo) && lessonTitle.trim() && !isProcessing;

    // Backdrop click handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-nanobanana-yellow border-b-4 border-black p-4 flex items-center justify-between">
                            <h2 className="text-2xl font-black font-comic flex items-center gap-2">
                                <Sparkles className="w-6 h-6" />
                                Add New Lesson
                            </h2>
                            {!isProcessing && (
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {isProcessing ? (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <ProcessingAnimation 
                                            stage={processingStage} 
                                            progress={processingProgress} 
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Tabs */}
                                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`
                                                        flex-1 flex items-center justify-center gap-2 
                                                        px-4 py-2 rounded-lg font-bold text-sm
                                                        transition-all
                                                        ${activeTab === tab.id
                                                            ? 'bg-white shadow-md border-2 border-black'
                                                            : 'hover:bg-gray-200'
                                                        }
                                                    `}
                                                >
                                                    <tab.icon className="w-4 h-4" />
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content */}
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'file' && (
                                                <motion.div
                                                    key="file-tab"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                >
                                                    <FileDropzone
                                                        onFileSelect={handleFileSelect}
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
                                                        onVideoSelect={handleVideoSelect}
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
                                                    className="p-8 text-center bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300"
                                                >
                                                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                    <p className="font-bold text-gray-500">
                                                        Camera capture coming soon!
                                                    </p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Take photos of worksheets and textbook pages
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Lesson Details */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">
                                                    Lesson Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={lessonTitle}
                                                    onChange={(e) => setLessonTitle(e.target.value)}
                                                    placeholder="e.g., The Solar System"
                                                    className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold mb-2">
                                                    Subject
                                                </label>
                                                <select
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow bg-white"
                                                >
                                                    <option value="">Select a subject...</option>
                                                    <option value="math">🔢 Math</option>
                                                    <option value="science">🔬 Science</option>
                                                    <option value="english">📚 English</option>
                                                    <option value="arabic">🌙 Arabic</option>
                                                    <option value="islamic">☪️ Islamic Studies</option>
                                                    <option value="social">🌍 Social Studies</option>
                                                    <option value="other">📝 Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {!isProcessing && (
                            <div className="p-4 border-t-4 border-black bg-gray-50 flex gap-3">
                                <button
                                    onClick={onClose}
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

## 6. Hook Implementations

### 6.1 useLessonProcessor.js

**Location:** `src/hooks/useLessonProcessor.js`

```javascript
import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';
import { extractTextFromPDF, extractTextFromImage } from '../utils/fileProcessors';
import { getYouTubeTranscript } from '../utils/youtubeUtils';
import { processWithGemini } from '../services/geminiService';

export function useLessonProcessor() {
    const {
        startProcessing,
        updateProgress,
        setProcessingStage,
        addLesson,
        setError,
        resetProcessing,
    } = useLessonContext();

    const processFile = useCallback(async (file, title, subject) => {
        try {
            startProcessing();

            // Stage 1: Upload (simulated - file is already in memory)
            setProcessingStage('uploading');
            updateProgress(10);
            await delay(500);

            // Stage 2: Extract text
            setProcessingStage('extracting');
            updateProgress(25);
            
            let extractedText = '';
            if (file.type === 'application/pdf') {
                extractedText = await extractTextFromPDF(file);
            } else if (file.type.startsWith('image/')) {
                extractedText = await extractTextFromImage(file);
            } else if (file.type === 'text/plain') {
                extractedText = await file.text();
            }
            
            updateProgress(45);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');
            updateProgress(55);
            
            const analysis = await processWithGemini(extractedText, 'analyze');
            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');
            updateProgress(80);
            
            const studyGuide = await processWithGemini(extractedText, 'study_guide');
            updateProgress(95);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                title,
                subject,
                sourceType: 'file',
                sourceFile: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                },
                content: {
                    rawText: extractedText,
                    summary: analysis.summary,
                    keyPoints: analysis.keyPoints,
                    chapters: analysis.chapters,
                    studyGuide: studyGuide,
                    vocabulary: analysis.vocabulary || [],
                },
            });

            await delay(500); // Let user see "complete" state
            return lesson;

        } catch (error) {
            console.error('Error processing file:', error);
            setError(error.message || 'Failed to process file');
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    const processYouTube = useCallback(async (video, title, subject) => {
        try {
            startProcessing();

            // Stage 1: Fetch video info
            setProcessingStage('uploading');
            updateProgress(10);
            await delay(500);

            // Stage 2: Get transcript
            setProcessingStage('extracting');
            updateProgress(25);
            
            const transcript = await getYouTubeTranscript(video.id);
            updateProgress(45);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');
            updateProgress(55);
            
            const analysis = await processWithGemini(transcript, 'analyze');
            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');
            updateProgress(80);
            
            const studyGuide = await processWithGemini(transcript, 'study_guide');
            updateProgress(95);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                title,
                subject,
                sourceType: 'youtube',
                sourceVideo: video,
                content: {
                    rawText: transcript,
                    summary: analysis.summary,
                    keyPoints: analysis.keyPoints,
                    chapters: analysis.chapters,
                    studyGuide: studyGuide,
                    vocabulary: analysis.vocabulary || [],
                },
            });

            await delay(500);
            return lesson;

        } catch (error) {
            console.error('Error processing YouTube video:', error);
            setError(error.message || 'Failed to process video');
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    return {
        processFile,
        processYouTube,
    };
}

// Helper function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 6.2 useGemini.js

**Location:** `src/hooks/useGemini.js`

```javascript
import { useState, useCallback } from 'react';
import { processWithGemini, generateFlashcards, generateQuiz } from '../services/geminiService';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (text) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await processWithGemini(text, 'analyze');
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createFlashcards = useCallback(async (text, count = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateFlashcards(text, count);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createQuiz = useCallback(async (text, count = 5) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateQuiz(text, count);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const askQuestion = useCallback(async (context, question) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await processWithGemini(
                `Context: ${context}\n\nQuestion: ${question}`,
                'question'
            );
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        analyze,
        createFlashcards,
        createQuiz,
        askQuestion,
    };
}
```

---

## 7. Utility & Service Files

### 7.1 fileProcessors.js

**Location:** `src/utils/fileProcessors.js`

```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
}

/**
 * Extract text from an image using browser OCR or API
 * For MVP, we'll use a mock - in production, use Google Vision API or Tesseract.js
 */
export async function extractTextFromImage(file) {
    // Mock implementation - replace with actual OCR
    // Options: Google Vision API, Tesseract.js, or Gemini Vision
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`[Extracted text from image: ${file.name}]
            
This is placeholder text that would be extracted from the uploaded image using OCR technology.

In production, this would use:
- Google Cloud Vision API for accurate OCR
- Or Tesseract.js for client-side processing
- Or Gemini Pro Vision for AI-powered extraction

The extracted text would include all readable content from worksheets, textbook pages, or handwritten notes.`);
        }, 1000);
    });
}

/**
 * Validate file before processing
 */
export function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
        'text/plain',
    ];

    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB.');
    }

    if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, image, or text files.');
    }

    return true;
}
```

### 7.2 youtubeUtils.js

**Location:** `src/utils/youtubeUtils.js`

```javascript
/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Get video metadata (mock - replace with YouTube Data API)
 */
export async function getVideoMetadata(videoId) {
    // Mock implementation - in production, use YouTube Data API
    return {
        id: videoId,
        title: `Educational Video`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: '5:00',
        channel: 'Learning Channel',
    };
}

/**
 * Get video transcript (mock - replace with YouTube Transcript API or your backend)
 */
export async function getYouTubeTranscript(videoId) {
    // Mock implementation
    // In production, use:
    // - youtube-transcript npm package
    // - Your backend with yt-dlp
    // - Third-party API like youtubetranscript.com
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`[Transcript for video: ${videoId}]

Welcome to today's lesson! We're going to learn about something really exciting.

First, let's start with the basics. This topic is important because it helps us understand the world around us.

Here are some key points to remember:
1. The first important concept is foundational to everything else.
2. Building on that, we can explore more complex ideas.
3. Finally, we'll see how this applies to real life.

Let's dive deeper into each of these points...

[This is mock transcript content. In production, this would be the actual video transcript extracted via API.]`);
        }, 1500);
    });
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 7.3 geminiService.js

**Location:** `src/services/geminiService.js`

```javascript
/**
 * Gemini API Service
 * 
 * This is a mock implementation for frontend development.
 * Replace with actual Gemini API calls in production.
 * 
 * Production implementation would use:
 * - @google/generative-ai package
 * - Or your backend API that wraps Gemini
 */

const MOCK_DELAY = 1500;

/**
 * Process text with Gemini for various tasks
 */
export async function processWithGemini(text, task) {
    // Simulate API delay
    await delay(MOCK_DELAY);

    switch (task) {
        case 'analyze':
            return mockAnalyze(text);
        case 'study_guide':
            return mockStudyGuide(text);
        case 'question':
            return mockAnswerQuestion(text);
        default:
            throw new Error(`Unknown task: ${task}`);
    }
}

/**
 * Generate flashcards from text
 */
export async function generateFlashcards(text, count = 10) {
    await delay(MOCK_DELAY);
    
    return {
        flashcards: Array.from({ length: count }, (_, i) => ({
            id: `card-${i + 1}`,
            front: `Question ${i + 1}: What is an important concept from this lesson?`,
            back: `Answer ${i + 1}: This is a key concept that helps understand the topic better.`,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        })),
    };
}

/**
 * Generate quiz questions from text
 */
export async function generateQuiz(text, count = 5) {
    await delay(MOCK_DELAY);
    
    return {
        questions: Array.from({ length: count }, (_, i) => ({
            id: `q-${i + 1}`,
            question: `Quiz Question ${i + 1}: Which of the following is correct?`,
            options: [
                'Option A - This could be the answer',
                'Option B - This might be correct',
                'Option C - Consider this option',
                'Option D - Think about this one',
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            explanation: 'This is the explanation for why this answer is correct.',
        })),
    };
}

// Mock implementations
function mockAnalyze(text) {
    const wordCount = text.split(/\s+/).length;
    
    return {
        summary: `This lesson covers important educational content spanning approximately ${wordCount} words. The material introduces key concepts that build upon each other, leading to a comprehensive understanding of the topic.`,
        keyPoints: [
            'First major concept introduced in the lesson',
            'Second important idea that builds on the first',
            'Third key point connecting everything together',
            'Practical application of the learned concepts',
            'Summary of the main takeaways',
        ],
        chapters: [
            { title: 'Introduction', startIndex: 0 },
            { title: 'Main Concepts', startIndex: Math.floor(wordCount * 0.2) },
            { title: 'Deep Dive', startIndex: Math.floor(wordCount * 0.5) },
            { title: 'Conclusion', startIndex: Math.floor(wordCount * 0.8) },
        ],
        vocabulary: [
            { term: 'Concept', definition: 'An abstract idea or general notion' },
            { term: 'Analysis', definition: 'Detailed examination of elements or structure' },
            { term: 'Synthesis', definition: 'Combination of ideas to form a theory or system' },
        ],
        difficulty: 'intermediate',
        estimatedReadTime: Math.ceil(wordCount / 200), // minutes
    };
}

function mockStudyGuide(text) {
    return {
        objectives: [
            'Understand the main concepts presented',
            'Apply knowledge to solve problems',
            'Connect ideas to real-world scenarios',
        ],
        reviewQuestions: [
            'What is the main idea of this lesson?',
            'How do the concepts connect to each other?',
            'Can you give an example from your own experience?',
        ],
        activities: [
            {
                type: 'reflection',
                prompt: 'Write down three things you learned today.',
            },
            {
                type: 'practice',
                prompt: 'Try to explain this topic to someone else.',
            },
        ],
        tips: [
            'Review this material again tomorrow for better retention',
            'Try to create your own examples',
            'Ask Ollie if anything is unclear!',
        ],
    };
}

function mockAnswerQuestion(text) {
    return {
        answer: 'Based on the lesson content, here\'s what I found: The answer relates to the key concepts we covered. Remember that understanding the basics helps with more complex ideas. Would you like me to explain further?',
        confidence: 0.85,
        relatedTopics: ['Related Topic 1', 'Related Topic 2'],
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * PRODUCTION IMPLEMENTATION TEMPLATE
 * 
 * Replace the mock functions above with this pattern:
 * 
 * import { GoogleGenerativeAI } from '@google/generative-ai';
 * 
 * const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 * const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 * 
 * export async function processWithGemini(text, task) {
 *     const prompt = buildPrompt(text, task);
 *     const result = await model.generateContent(prompt);
 *     const response = await result.response;
 *     return JSON.parse(response.text());
 * }
 * 
 * function buildPrompt(text, task) {
 *     const prompts = {
 *         analyze: `Analyze this educational content for a K-6 student...`,
 *         study_guide: `Create a study guide for this content...`,
 *         // etc.
 *     };
 *     return prompts[task] + '\n\nContent:\n' + text;
 * }
 */
```

---

## 8. Integration with Existing Components

### 8.1 Update StudyPage.jsx

**Location:** `src/pages/StudyPage.jsx`

```jsx
import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';
import UploadButton from '../components/Upload/UploadButton';
import UploadModal from '../components/Upload/UploadModal';
import { useLessonContext } from '../context/LessonContext';

const StudyPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { currentLesson } = useLessonContext();

    return (
        <MainLayout>
            {currentLesson ? (
                <>
                    <LessonView lesson={currentLesson} />
                    <ChatInterface lesson={currentLesson} />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <span className="text-5xl">📚</span>
                        </div>
                        <h2 className="text-3xl font-black font-comic mb-4">
                            Ready to Learn?
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md">
                            Upload a lesson to get started! Ollie is excited to help you learn.
                        </p>
                        <UploadButton 
                            onClick={() => setIsUploadModalOpen(true)}
                            size="large"
                        />
                    </div>
                </div>
            )}

            {/* Floating upload button when lesson is active */}
            {currentLesson && (
                <UploadButton 
                    variant="floating"
                    onClick={() => setIsUploadModalOpen(true)}
                />
            )}

            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </MainLayout>
    );
};

export default StudyPage;
```

### 8.2 Update LessonView.jsx

**Location:** `src/components/Lesson/LessonView.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, Star, Clock, FileText } from 'lucide-react';

const LessonView = ({ lesson }) => {
    // Fallback to default content if no lesson provided
    const displayLesson = lesson || {
        title: 'The Solar System Adventure',
        subject: 'science',
        content: {
            summary: 'The Solar System is our home in the galaxy! It consists of the Sun and everything that orbits around it.',
            keyPoints: [
                'The Sun contains 99.86% of the Solar System\'s known mass!',
                'Gravity keeps all objects in orbit around the Sun.',
            ],
        },
    };

    const subjectEmoji = {
        math: '🔢',
        science: '🔬',
        english: '📚',
        arabic: '🌙',
        islamic: '☪️',
        social: '🌍',
        other: '📝',
    };

    return (
        <div className="flex-[1.5] bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
            {/* Lesson Header */}
            <div className="bg-nanobanana-green border-b-4 border-black p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {subjectEmoji[displayLesson.subject] || '📝'} {displayLesson.subject || 'Lesson'}
                    </span>
                    {displayLesson.content?.estimatedReadTime && (
                        <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            {displayLesson.content.estimatedReadTime} min read
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {displayLesson.title}
                </h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="space-y-6">
                    {/* Video if YouTube source */}
                    {displayLesson.sourceType === 'youtube' && displayLesson.sourceVideo && (
                        <div className="aspect-video bg-black rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group cursor-pointer overflow-hidden">
                            <img
                                src={displayLesson.sourceVideo.thumbnail}
                                alt={displayLesson.sourceVideo.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-8 h-8 ml-1" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {displayLesson.content?.summary && (
                        <div className="prose prose-lg max-w-none">
                            <h3 className="font-comic font-bold text-2xl mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                Summary
                            </h3>
                            <p className="font-medium text-gray-700 leading-relaxed">
                                {displayLesson.content.summary}
                            </p>
                        </div>
                    )}

                    {/* Key Points */}
                    {displayLesson.content?.keyPoints?.length > 0 && (
                        <div className="my-6 p-4 bg-yellow-50 border-l-8 border-nanobanana-yellow rounded-r-xl">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-black" />
                                Key Points
                            </h4>
                            <ul className="space-y-2">
                                {displayLesson.content.keyPoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-nanobanana-yellow rounded-full border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Vocabulary */}
                    {displayLesson.content?.vocabulary?.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Vocabulary
                            </h4>
                            <div className="grid gap-3">
                                {displayLesson.content.vocabulary.map((item, index) => (
                                    <div 
                                        key={index}
                                        className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200"
                                    >
                                        <span className="font-bold text-blue-800">{item.term}:</span>{' '}
                                        <span className="text-blue-600">{item.definition}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonView;
```

### 8.3 Update ChatInterface.jsx

**Location:** `src/components/Chat/ChatInterface.jsx`

Add lesson context awareness to Ollie's chat.

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Video, FileText, Sparkles } from 'lucide-react';
import Ollie from '../Avatar/Ollie';

const ChatInterface = ({ demoMode = false, lesson = null }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize with context-aware greeting
    useEffect(() => {
        if (lesson) {
            setMessages([{
                id: 1,
                type: 'bot',
                text: `Hi! I'm Ollie! 🎉 I just read "${lesson.title}" and I'm ready to help you learn! What would you like to know?`
            }]);
        } else {
            setMessages([{
                id: 1,
                type: 'bot',
                text: "Hi! I'm Ollie. Upload a lesson and I'll help you learn! 📚"
            }]);
        }
    }, [lesson?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Demo mode animation
    useEffect(() => {
        if (demoMode) {
            const demoSequence = [
                { delay: 1000, type: 'user', text: "Tell me about the sun!" },
                { delay: 2500, type: 'bot', text: "The Sun is a giant star at the center of our Solar System! ☀️" },
                { delay: 4500, type: 'bot', text: "It gives us light and heat. Without it, Earth would be frozen!" },
                { delay: 6000, type: 'user', text: "Wow, that's hot!" },
                { delay: 7500, type: 'bot', text: "Super hot! It's about 27 million degrees Fahrenheit at the core! 🔥" }
            ];

            let timeouts = [];
            demoSequence.forEach(({ delay, type, text }, index) => {
                const timeout = setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + index, type, text }]);
                }, delay);
                timeouts.push(timeout);
            });

            return () => timeouts.forEach(clearTimeout);
        }
    }, [demoMode]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMessage = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response (replace with actual Gemini call)
        setTimeout(() => {
            const responses = lesson ? [
                `Great question about "${lesson.title}"! ${lesson.content?.keyPoints?.[0] || "Let me help you understand this better."}`,
                `Based on what we learned, ${lesson.content?.summary?.slice(0, 100) || "this is really interesting!"}...`,
                "That's a fantastic question! Let me explain...",
            ] : [
                "Upload a lesson first, and I can help you understand it better!",
                "I'd love to help! Upload your study material to get started.",
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                type: 'bot', 
                text: response 
            }]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    // Suggested questions based on lesson
    const suggestedQuestions = lesson ? [
        `What's the main idea of "${lesson.title}"?`,
        "Can you explain this in simpler words?",
        "What should I remember most?",
    ] : [];

    return (
        <div className={`flex-1 flex flex-col bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden ${demoMode ? 'h-full' : ''}`}>
            {/* Header */}
            <div className="bg-nanobanana-yellow border-b-4 border-black p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={demoMode ? "scale-75 origin-left" : ""}>
                        <Ollie />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl font-comic">Chat with Ollie</h2>
                        <div className="flex items-center gap-1 text-xs font-bold opacity-70">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {lesson ? `Studying: ${lesson.title.slice(0, 20)}...` : 'Ready to help!'}
                        </div>
                    </div>
                </div>
                {!demoMode && (
                    <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <Sparkles className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.type === 'user'
                                ? 'bg-nanobanana-blue text-white rounded-br-none'
                                : 'bg-gray-100 text-black rounded-bl-none'
                                }`}
                        >
                            <p className="font-medium text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-gray-100 p-3 rounded-2xl border-2 border-black rounded-bl-none">
                            <div className="flex gap-1">
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {!demoMode && suggestedQuestions.length > 0 && messages.length < 3 && (
                <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {suggestedQuestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(q)}
                            className="flex-shrink-0 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border-2 border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Gemini Tools */}
            {!demoMode && lesson && (
                <div className="p-2 bg-gray-50 border-t-4 border-black grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                        <FileText className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Flashcards</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-green transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                        <Image className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Infographic</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                        <Video className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Video</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t-2 border-gray-200">
                {demoMode ? (
                    <div className="h-12 bg-gray-100 rounded-xl border-2 border-gray-300 flex items-center px-4 text-gray-400 italic text-sm">
                        Ask Ollie anything...
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={lesson ? "Ask Ollie about the lesson..." : "Upload a lesson to start..."}
                            disabled={!lesson}
                            className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!lesson || !input.trim()}
                            className="p-3 bg-nanobanana-blue text-white border-2 border-black rounded-xl hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
```

---

## 9. Testing Checklist

### Functionality Tests

- [ ] **Upload Modal**
  - [ ] Opens when clicking Upload button
  - [ ] Closes on backdrop click (when not processing)
  - [ ] Closes on X button click
  - [ ] Tabs switch correctly (File/YouTube/Camera)
  - [ ] Cannot close during processing

- [ ] **File Dropzone**
  - [ ] Drag and drop works
  - [ ] Click to browse works
  - [ ] Shows selected file info
  - [ ] Clear button removes selection
  - [ ] Rejects invalid file types
  - [ ] Rejects files over 10MB

- [ ] **YouTube Input**
  - [ ] Accepts valid YouTube URLs
  - [ ] Shows error for invalid URLs
  - [ ] Displays video thumbnail after validation
  - [ ] Clear button removes selection

- [ ] **Processing Animation**
  - [ ] Shows correct stage labels
  - [ ] Progress bar animates
  - [ ] Stage dots update correctly
  - [ ] Fun messages appear

- [ ] **Lesson Context**
  - [ ] Lesson data persists after upload
  - [ ] LessonView displays lesson content
  - [ ] ChatInterface receives lesson context
  - [ ] Ollie's greeting is context-aware

- [ ] **Chat Integration**
  - [ ] Suggested questions appear for new lessons
  - [ ] Input is disabled without a lesson
  - [ ] Messages scroll to bottom
  - [ ] Typing indicator shows

### Edge Cases

- [ ] Multiple rapid uploads
- [ ] Very long file names
- [ ] Empty PDF files
- [ ] Network errors during processing
- [ ] Browser refresh during upload

---

## Summary

This implementation plan provides:

1. **LessonContext** - Global state management for lessons
2. **UploadModal** - Complete upload interface with tabs
3. **FileDropzone** - Drag-and-drop file upload
4. **YouTubeInput** - YouTube URL validation and preview
5. **ProcessingAnimation** - Fun loading states
6. **useLessonProcessor** - Hook for processing uploads
7. **useGemini** - Hook for AI interactions
8. **Utility files** - PDF extraction, YouTube parsing
9. **geminiService** - Mock API for development (production-ready template included)
10. **Updated existing components** - StudyPage, LessonView, ChatInterface

The mock implementations allow frontend development without API keys. Replace with actual Gemini calls when ready for production.

**Estimated implementation time:** 3-5 days for a developer familiar with React.
