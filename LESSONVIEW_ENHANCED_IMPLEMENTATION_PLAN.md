# Enhanced LessonView with Real Content Rendering
## K-6 AI Learning Platform - Complete Interactive Learning Experience

**Purpose:** Transform LessonView from a placeholder component into a fully functional content viewer that renders PDFs, images, and text with interactive features including text selection, highlighting, context menus, and seamless chat integration with Jeffrey AI tutor.

**Target Completion:** 8-12 developer hours for complete implementation

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Dependencies](#2-dependencies)
3. [File Structure](#3-file-structure)
4. [Data Models](#4-data-models)
5. [Core Components](#5-core-components)
6. [Interactive Features](#6-interactive-features)
7. [Integration Points](#7-integration-points)
8. [Child Safety & UX](#8-child-safety--ux)
9. [Testing Checklist](#9-testing-checklist)
10. [Implementation Steps](#10-implementation-steps)

---

## 1. Overview & Architecture

### Design Philosophy
- **Content-First**: Display uploaded content (PDFs, images, text) prominently
- **Interaction-Rich**: Enable text selection, highlighting, and contextual actions
- **Jeffrey Integration**: Seamless connection between content and AI tutor
- **Child-Friendly**: Large touch targets, fun animations, clear feedback
- **Progressive Enhancement**: Start with viewing, add interactivity layer by layer

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENHANCED LESSONVIEW SYSTEM                          │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │                        LessonView Container                          │ │
│   │                                                                      │ │
│   │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │ │
│   │   │  Content Type  │  │   Interactive  │  │     Jeffrey    │      │ │
│   │   │    Detector    │  │     Layer      │  │   Connection   │      │ │
│   │   └────────────────┘  └────────────────┘  └────────────────┘      │ │
│   │            │                   │                    │               │ │
│   └────────────┼───────────────────┼────────────────────┼───────────────┘ │
│                │                   │                    │                  │
│     ┌──────────▼──────────┐  ┌─────▼──────────┐  ┌─────▼──────────┐     │
│     │   PDF Renderer      │  │  Text Selection │  │ Selection to   │     │
│     │  (react-pdf)        │  │   & Highlight   │  │  Chat Bridge   │     │
│     │                     │  │                 │  │                │     │
│     │  • Multi-page       │  │ • Mouse/Touch   │  │ • Context Menu │     │
│     │  • Text layer       │  │ • Highlight     │  │ • Quick Actions│     │
│     │  • Navigation       │  │ • Persistence   │  │ • AI Actions   │     │
│     │  • Zoom controls    │  │ • Annotations   │  │                │     │
│     └─────────────────────┘  └─────────────────┘  └────────────────┘     │
│                                                                             │
│     ┌─────────────────────┐  ┌─────────────────┐  ┌────────────────┐     │
│     │   Image Viewer      │  │  Context Menu   │  │  Flashcard     │     │
│     │                     │  │                 │  │   Generator    │     │
│     │  • Pinch zoom       │  │ • Ask Jeffrey   │  │                │     │
│     │  • Pan/drag         │  │ • Create Card   │  │ • AI-powered   │     │
│     │  • Annotations      │  │ • Explain More  │  │ • Spaced Rep   │     │
│     │  • Captions         │  │ • Make Quiz     │  │ • Review       │     │
│     └─────────────────────┘  └─────────────────┘  └────────────────┘     │
│                                                                             │
│     ┌─────────────────────┐  ┌─────────────────┐  ┌────────────────┐     │
│     │   Text Viewer       │  │  Highlight      │  │   Quiz         │     │
│     │                     │  │   Storage       │  │  Generator     │     │
│     │  • Formatted text   │  │                 │  │                │     │
│     │  • Selectable       │  │ • localStorage  │  │ • Question gen │     │
│     │  • Highlightable    │  │ • Sync state    │  │ • Answer check │     │
│     │  • Copy/share       │  │ • Export/Import │  │ • Feedback     │     │
│     └─────────────────────┘  └─────────────────┘  └────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
LessonView/
├── ContentRenderer (smart router)
│   ├── PDFContentView
│   │   ├── PDFViewer
│   │   ├── PDFToolbar (zoom, navigate)
│   │   ├── PDFTextLayer (for selection)
│   │   └── PDFHighlightOverlay
│   ├── ImageContentView
│   │   ├── ImageViewer
│   │   ├── ImageToolbar (zoom, rotate)
│   │   └── ImageAnnotations
│   └── TextContentView
│       ├── TextRenderer
│       └── TextHighlighter
├── InteractionLayer
│   ├── SelectionHandler
│   ├── HighlightManager
│   ├── ContextMenu
│   └── SelectionPopup
├── ActionHandlers
│   ├── AskJeffreyHandler
│   ├── FlashcardGenerator
│   ├── QuizGenerator
│   └── ExplainerRequest
└── LessonMetadata
    ├── LessonHeader
    ├── ProgressIndicator
    └── VocabularyPanel
```

---

## 2. Dependencies

### Required npm Packages

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-pdf": "^7.7.1",
    "pdfjs-dist": "^3.11.174",
    "@floating-ui/react": "^0.26.9",
    "framer-motion": "^11.0.3",
    "lucide-react": "^0.294.0",
    "react-zoom-pan-pinch": "^3.3.0",
    "uuid": "^9.0.1"
  }
}
```

### Installation Command

```bash
npm install react-pdf pdfjs-dist @floating-ui/react framer-motion react-zoom-pan-pinch
```

### Package Explanations

- **react-pdf**: PDF rendering with text layer for selection
- **pdfjs-dist**: PDF.js engine for text extraction
- **@floating-ui/react**: Smart positioning for context menus
- **framer-motion**: Smooth animations (already in project)
- **react-zoom-pan-pinch**: Pan/zoom for images and PDFs
- **uuid**: Generate unique IDs for highlights

---

## 3. File Structure

### New Files to Create

```
src/
├── components/
│   ├── LessonView/
│   │   ├── LessonView.jsx                    # ENHANCED - Main container
│   │   ├── ContentRenderer.jsx               # NEW - Content type router
│   │   │
│   │   ├── PDF/
│   │   │   ├── PDFContentView.jsx            # NEW - PDF wrapper
│   │   │   ├── PDFViewer.jsx                 # NEW - Core PDF renderer
│   │   │   ├── PDFToolbar.jsx                # NEW - Navigation controls
│   │   │   ├── PDFTextLayer.jsx              # NEW - Selectable text
│   │   │   └── PDFHighlightOverlay.jsx       # NEW - Visual highlights
│   │   │
│   │   ├── Image/
│   │   │   ├── ImageContentView.jsx          # NEW - Image wrapper
│   │   │   ├── ImageViewer.jsx               # NEW - Zoomable image
│   │   │   └── ImageToolbar.jsx              # NEW - Image controls
│   │   │
│   │   ├── Text/
│   │   │   ├── TextContentView.jsx           # NEW - Text wrapper
│   │   │   └── TextRenderer.jsx              # NEW - Formatted text
│   │   │
│   │   ├── Interaction/
│   │   │   ├── SelectionHandler.jsx          # NEW - Selection detection
│   │   │   ├── HighlightManager.jsx          # NEW - Highlight state
│   │   │   ├── ContextMenu.jsx               # NEW - Action menu
│   │   │   ├── ContextMenuItem.jsx           # NEW - Menu item
│   │   │   └── SelectionPopup.jsx            # NEW - Quick actions
│   │   │
│   │   ├── Metadata/
│   │   │   ├── LessonHeader.jsx              # NEW - Title, subject
│   │   │   ├── ProgressIndicator.jsx         # NEW - % complete
│   │   │   └── VocabularyPanel.jsx           # NEW - Key terms
│   │   │
│   │   └── EmptyState.jsx                    # NEW - No lesson view
│   │
│   └── Chat/
│       └── SelectedTextPreview.jsx           # NEW - Shows selection
│
├── context/
│   ├── LessonContext.jsx                     # EXISTS - Add methods
│   └── HighlightContext.jsx                  # NEW - Highlight state
│
├── hooks/
│   ├── useTextSelection.js                   # NEW - Selection handling
│   ├── useHighlights.js                      # NEW - Highlight CRUD
│   ├── useContextMenu.js                     # NEW - Menu positioning
│   ├── usePDFRenderer.js                     # NEW - PDF loading
│   └── useContentActions.js                  # NEW - Action handlers
│
├── utils/
│   ├── contentDetection.js                   # NEW - MIME type detection
│   ├── textSelectionUtils.js                 # NEW - Selection helpers
│   ├── highlightStorage.js                   # NEW - Persist highlights
│   ├── pdfTextExtraction.js                  # NEW - Extract text
│   └── pdfConfig.js                          # NEW - PDF.js setup
│
├── constants/
│   ├── contentTypes.js                       # NEW - Supported types
│   └── contextMenuConfig.js                  # NEW - Menu actions
│
└── styles/
    └── pdf-text-layer.css                    # NEW - PDF selection styles
```

---

## 4. Data Models

### 4.1 Enhanced Lesson Schema (Add to existing)

```typescript
interface Lesson {
  // ... existing fields ...
  
  // NEW FIELDS FOR CONTENT RENDERING
  contentType: 'pdf' | 'image' | 'text' | 'youtube';
  contentUrl?: string;              // For PDFs/images (could be blob URL or file path)
  contentData?: string;             // For text content or base64
  fileMetadata?: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    pageCount?: number;            // For PDFs
    dimensions?: {                 // For images
      width: number;
      height: number;
    };
  };
  
  // Highlighting & annotations
  highlights: Highlight[];
  annotations: Annotation[];
  
  // Viewing preferences
  viewPreferences?: {
    zoom: number;
    currentPage?: number;          // For PDFs
    scrollPosition?: number;
  };
}
```

### 4.2 Highlight Schema

```typescript
interface Highlight {
  id: string;                      // uuid
  lessonId: string;
  text: string;                    // Selected text
  color: HighlightColor;
  
  // Position data
  pageNumber?: number;             // For PDFs
  boundingRects: BoundingRect[];   // Visual position data
  
  // Metadata
  createdAt: string;               // ISO timestamp
  note?: string;                   // User annotation
  tags?: string[];                 // Categorization
  
  // Action history
  actions?: HighlightAction[];     // What user did with this
}

interface BoundingRect {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex?: number;              // For PDFs
}

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

interface HighlightAction {
  type: 'asked_jeffrey' | 'created_flashcard' | 'made_quiz' | 'requested_video';
  timestamp: string;
  result?: any;                    // Store result data
}
```

### 4.3 Text Selection Schema

```typescript
interface TextSelection {
  id: string;
  text: string;
  pageNumber?: number;
  boundingRects: BoundingRect[];
  timestamp: string;
  lessonId: string;
}
```

### 4.4 Context Menu Action Schema

```typescript
interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  emoji: string;
  color: string;
  handler: (selection: TextSelection) => Promise<void>;
  requiresAI?: boolean;
  xpReward?: number;
}
```

---

## 5. Core Components

### 5.1 Enhanced LessonView.jsx (Main Container)

**Location:** `src/components/LessonView/LessonView.jsx`

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLessonContext } from '../../context/LessonContext';
import { HighlightProvider } from '../../context/HighlightContext';
import ContentRenderer from './ContentRenderer';
import LessonHeader from './Metadata/LessonHeader';
import ProgressIndicator from './Metadata/ProgressIndicator';
import VocabularyPanel from './Metadata/VocabularyPanel';
import EmptyState from './EmptyState';
import { useContentActions } from '../../hooks/useContentActions';

/**
 * Enhanced LessonView - Renders uploaded content with interactive features
 * 
 * Features:
 * - Multi-format support (PDF, image, text, YouTube)
 * - Text selection and highlighting
 * - Context menus for actions
 * - Jeffrey chat integration
 * - Progress tracking
 */
const LessonView = () => {
  const { 
    currentLesson, 
    isProcessing,
    updateLessonProgress,
  } = useLessonContext();
  
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [viewPreferences, setViewPreferences] = useState({
    zoom: 1.0,
    currentPage: 1,
  });

  // Track time spent on lesson
  useEffect(() => {
    if (!currentLesson) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      updateLessonProgress(currentLesson.id, { timeSpent });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentLesson, updateLessonProgress]);

  // Save view preferences to lesson
  useEffect(() => {
    if (!currentLesson) return;
    
    const saveTimer = setTimeout(() => {
      updateLessonProgress(currentLesson.id, { viewPreferences });
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [viewPreferences, currentLesson, updateLessonProgress]);

  // Handle zoom changes
  const handleZoomChange = useCallback((newZoom) => {
    setViewPreferences(prev => ({ ...prev, zoom: newZoom }));
  }, []);

  // Handle page changes (for PDFs)
  const handlePageChange = useCallback((newPage) => {
    setViewPreferences(prev => ({ ...prev, currentPage: newPage }));
  }, []);

  // Show empty state if no lesson
  if (!currentLesson) {
    return <EmptyState />;
  }

  // Show processing state
  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-nanobanana-yellow/20 to-nanobanana-pink/20 p-8"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <span className="text-6xl">📚</span>
          </motion.div>
          <h2 className="text-2xl font-bold font-comic mb-2">
            Getting Your Lesson Ready!
          </h2>
          <p className="text-gray-600">
            Jeffrey is preparing something awesome...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <HighlightProvider lessonId={currentLesson.id}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Lesson Header */}
        <LessonHeader 
          lesson={currentLesson}
          onToggleVocabulary={() => setShowVocabulary(!showVocabulary)}
          showVocabulary={showVocabulary}
        />

        {/* Progress Bar */}
        <ProgressIndicator 
          progress={currentLesson.progress?.percentComplete || 0}
          timeSpent={currentLesson.progress?.timeSpent || 0}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Content Renderer */}
          <div className={`
            ${showVocabulary ? 'w-3/4' : 'w-full'}
            transition-all duration-300
          `}>
            <ContentRenderer
              lesson={currentLesson}
              viewPreferences={viewPreferences}
              onZoomChange={handleZoomChange}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Vocabulary Panel (Sidebar) */}
          <AnimatePresence>
            {showVocabulary && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '25%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l-4 border-black"
              >
                <VocabularyPanel 
                  vocabulary={currentLesson.vocabulary || []}
                  lessonId={currentLesson.id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </HighlightProvider>
  );
};

export default LessonView;
```

### 5.2 ContentRenderer.jsx (Smart Router)

**Location:** `src/components/LessonView/ContentRenderer.jsx`

```jsx
import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { detectContentType } from '../../utils/contentDetection';
import { FileQuestion } from 'lucide-react';

// Lazy load content viewers for code splitting
const PDFContentView = lazy(() => import('./PDF/PDFContentView'));
const ImageContentView = lazy(() => import('./Image/ImageContentView'));
const TextContentView = lazy(() => import('./Text/TextContentView'));

/**
 * ContentRenderer - Smart component that detects content type
 * and renders the appropriate viewer
 */
const ContentRenderer = ({ lesson, viewPreferences, onZoomChange, onPageChange }) => {
  const contentType = lesson.contentType || detectContentType(lesson);

  // Loading fallback
  const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16"
      >
        <span className="text-5xl">⏳</span>
      </motion.div>
    </div>
  );

  // Render appropriate content viewer
  const renderContent = () => {
    switch (contentType) {
      case 'pdf':
        return (
          <PDFContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
            onZoomChange={onZoomChange}
            onPageChange={onPageChange}
          />
        );

      case 'image':
        return (
          <ImageContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
            onZoomChange={onZoomChange}
          />
        );

      case 'text':
        return (
          <TextContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
          />
        );

      case 'youtube':
        // TODO: Implement YouTube viewer
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🎥</span>
              <p className="text-xl font-bold">YouTube videos coming soon!</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileQuestion className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-bold text-gray-600">
                Unsupported content type
              </p>
              <p className="text-gray-500 mt-2">
                We're working on supporting more file types!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderContent()}
    </Suspense>
  );
};

export default ContentRenderer;
```

### 5.3 PDFContentView.jsx (PDF Viewer Wrapper)

**Location:** `src/components/LessonView/PDF/PDFContentView.jsx`

```jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import PDFViewer from './PDFViewer';
import PDFToolbar from './PDFToolbar';
import { useHighlightContext } from '../../../context/HighlightContext';
import ContextMenu from '../Interaction/ContextMenu';

/**
 * PDFContentView - Container for PDF rendering with toolbar and interactions
 */
const PDFContentView = ({ 
  lesson, 
  viewPreferences, 
  onZoomChange, 
  onPageChange 
}) => {
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    currentSelection,
    isContextMenuOpen,
    contextMenuPosition,
    closeContextMenu,
  } = useHighlightContext();

  const handleDocumentLoad = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const handleDocumentError = useCallback((error) => {
    console.error('PDF load error:', error);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* PDF Toolbar */}
      <PDFToolbar
        currentPage={viewPreferences.currentPage}
        numPages={numPages}
        zoom={viewPreferences.zoom}
        onPageChange={onPageChange}
        onZoomChange={onZoomChange}
        isLoading={isLoading}
      />

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto">
        <PDFViewer
          pdfUrl={lesson.contentUrl}
          lessonId={lesson.id}
          initialPage={viewPreferences.currentPage}
          scale={viewPreferences.zoom}
          onDocumentLoad={handleDocumentLoad}
          onDocumentError={handleDocumentError}
          onPageChange={onPageChange}
        />
      </div>

      {/* Context Menu Overlay */}
      {isContextMenuOpen && currentSelection && (
        <ContextMenu
          position={contextMenuPosition}
          selection={currentSelection}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default PDFContentView;
```

### 5.4 PDFViewer.jsx (Core PDF Renderer)

**Location:** `src/components/LessonView/PDF/PDFViewer.jsx`

```jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useHighlightContext } from '../../../context/HighlightContext';
import PDFHighlightOverlay from './PDFHighlightOverlay';
import SelectionPopup from '../Interaction/SelectionPopup';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFViewer - Core PDF rendering with text layer for selection
 */
const PDFViewer = ({
  pdfUrl,
  lessonId,
  initialPage = 1,
  scale = 1.0,
  onDocumentLoad,
  onDocumentError,
  onPageChange,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const containerRef = useRef(null);

  const {
    setSelection,
    currentSelection,
    highlights,
    openContextMenu,
  } = useHighlightContext();

  // Handle document load success
  const handleLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    onDocumentLoad?.({ numPages });
  }, [onDocumentLoad]);

  // Handle page navigation
  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, numPages || page));
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  }, [numPages, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage]);

  // Text selection handler
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 3) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect && rects.length > 0) {
        // Convert client rects to page-relative positions
        const boundingRects = Array.from(rects).map(rect => ({
          top: (rect.top - containerRect.top) / scale,
          left: (rect.left - containerRect.left) / scale,
          width: rect.width / scale,
          height: rect.height / scale,
          pageIndex: currentPage - 1,
        }));

        const selectionData = {
          id: `sel-${Date.now()}`,
          text: selectedText,
          pageNumber: currentPage,
          boundingRects,
          timestamp: new Date().toISOString(),
          lessonId,
        };

        setSelection(selectionData);
      }
    }
  }, [currentPage, scale, lessonId, setSelection]);

  // Handle mouse up for selection
  const handleMouseUp = useCallback(() => {
    setTimeout(handleTextSelection, 10);
  }, [handleTextSelection]);

  // Filter highlights for current page
  const pageHighlights = highlights.filter(h => h.pageNumber === currentPage);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center py-8 px-4"
      onMouseUp={handleMouseUp}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={onDocumentError}
        loading={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-12"
          >
            <Loader2 className="w-12 h-12 animate-spin text-nanobanana-yellow" />
          </motion.div>
        }
        error={
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <span className="text-6xl mb-4 block">😕</span>
              <p className="text-xl font-bold text-gray-600">
                Oops! Couldn't load the PDF
              </p>
              <p className="text-gray-500 mt-2">
                Try uploading it again, or ask a grown-up for help!
              </p>
            </div>
          </div>
        }
      >
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
        >
          {/* PDF Page */}
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            className="pdf-page"
          />

          {/* Highlight Overlay */}
          <PDFHighlightOverlay
            highlights={pageHighlights}
            scale={scale}
          />

          {/* Selection Popup */}
          {currentSelection && currentSelection.pageNumber === currentPage && (
            <SelectionPopup
              selection={currentSelection}
              scale={scale}
            />
          )}
        </motion.div>
      </Document>

      {/* Page Navigation */}
      {numPages && numPages > 1 && (
        <div className="flex items-center gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <div className="px-6 py-2 bg-nanobanana-yellow border-4 border-black rounded-full font-bold font-comic">
            Page {currentPage} of {numPages}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
```

---

## 6. Interactive Features

### 6.1 HighlightContext.jsx (State Management)

**Location:** `src/context/HighlightContext.jsx`

```jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadHighlights, saveHighlights } from '../utils/highlightStorage';

const HighlightContext = createContext(null);

// Action types
const ACTIONS = {
  SET_SELECTION: 'SET_SELECTION',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  ADD_HIGHLIGHT: 'ADD_HIGHLIGHT',
  REMOVE_HIGHLIGHT: 'REMOVE_HIGHLIGHT',
  UPDATE_HIGHLIGHT: 'UPDATE_HIGHLIGHT',
  OPEN_CONTEXT_MENU: 'OPEN_CONTEXT_MENU',
  CLOSE_CONTEXT_MENU: 'CLOSE_CONTEXT_MENU',
  LOAD_HIGHLIGHTS: 'LOAD_HIGHLIGHTS',
};

// Reducer
const highlightReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_SELECTION:
      return {
        ...state,
        currentSelection: action.payload,
      };

    case ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        currentSelection: null,
      };

    case ACTIONS.ADD_HIGHLIGHT:
      return {
        ...state,
        highlights: [...state.highlights, action.payload],
      };

    case ACTIONS.REMOVE_HIGHLIGHT:
      return {
        ...state,
        highlights: state.highlights.filter(h => h.id !== action.payload),
      };

    case ACTIONS.UPDATE_HIGHLIGHT:
      return {
        ...state,
        highlights: state.highlights.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
        ),
      };

    case ACTIONS.OPEN_CONTEXT_MENU:
      return {
        ...state,
        isContextMenuOpen: true,
        contextMenuPosition: action.payload,
      };

    case ACTIONS.CLOSE_CONTEXT_MENU:
      return {
        ...state,
        isContextMenuOpen: false,
      };

    case ACTIONS.LOAD_HIGHLIGHTS:
      return {
        ...state,
        highlights: action.payload,
      };

    default:
      return state;
  }
};

// Provider
export const HighlightProvider = ({ children, lessonId }) => {
  const [state, dispatch] = useReducer(highlightReducer, {
    currentSelection: null,
    highlights: [],
    isContextMenuOpen: false,
    contextMenuPosition: { x: 0, y: 0 },
  });

  // Load highlights on mount
  useEffect(() => {
    const highlights = loadHighlights(lessonId);
    dispatch({ type: ACTIONS.LOAD_HIGHLIGHTS, payload: highlights });
  }, [lessonId]);

  // Save highlights on change
  useEffect(() => {
    if (state.highlights.length > 0) {
      saveHighlights(lessonId, state.highlights);
    }
  }, [lessonId, state.highlights]);

  // Actions
  const setSelection = useCallback((selection) => {
    dispatch({ type: ACTIONS.SET_SELECTION, payload: selection });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  }, []);

  const addHighlight = useCallback((highlight) => {
    const newHighlight = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...highlight,
    };
    dispatch({ type: ACTIONS.ADD_HIGHLIGHT, payload: newHighlight });
    return newHighlight;
  }, []);

  const removeHighlight = useCallback((highlightId) => {
    dispatch({ type: ACTIONS.REMOVE_HIGHLIGHT, payload: highlightId });
  }, []);

  const updateHighlight = useCallback((highlightId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_HIGHLIGHT,
      payload: { id: highlightId, updates },
    });
  }, []);

  const openContextMenu = useCallback((position) => {
    dispatch({ type: ACTIONS.OPEN_CONTEXT_MENU, payload: position });
  }, []);

  const closeContextMenu = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_CONTEXT_MENU });
  }, []);

  const value = {
    ...state,
    setSelection,
    clearSelection,
    addHighlight,
    removeHighlight,
    updateHighlight,
    openContextMenu,
    closeContextMenu,
  };

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlightContext = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlightContext must be used within HighlightProvider');
  }
  return context;
};
```

### 6.2 ContextMenu.jsx (Action Menu)

**Location:** `src/components/LessonView/Interaction/ContextMenu.jsx`

```jsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloating, offset, flip, shift } from '@floating-ui/react';
import ContextMenuItem from './ContextMenuItem';
import { CONTEXT_MENU_ACTIONS } from '../../../constants/contextMenuConfig';
import { useContentActions } from '../../../hooks/useContentActions';

/**
 * ContextMenu - Child-friendly action menu with emoji icons
 */
const ContextMenu = ({ position, selection, onClose }) => {
  const menuRef = useRef(null);
  const { handleAction } = useContentActions();

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleMenuAction = async (action) => {
    try {
      await handleAction(action.id, selection);
      onClose();
    } catch (error) {
      console.error('Menu action error:', error);
      // TODO: Show error toast
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
        }}
        className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[260px]"
      >
        {/* Menu Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-nanobanana-yellow to-nanobanana-pink border-b-4 border-black">
          <p className="font-bold font-comic text-sm truncate">
            "{selection.text.slice(0, 40)}..."
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {CONTEXT_MENU_ACTIONS.map((action, index) => (
            <ContextMenuItem
              key={action.id}
              action={action}
              onClick={() => handleMenuAction(action)}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;
```

### 6.3 ContextMenuItem.jsx

**Location:** `src/components/LessonView/Interaction/ContextMenuItem.jsx`

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * ContextMenuItem - Individual action item in context menu
 */
const ContextMenuItem = ({ action, onClick, index }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: action.color + '20', x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={isLoading}
      className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors disabled:opacity-50"
    >
      {/* Emoji Icon */}
      <span className="text-2xl">{action.emoji}</span>

      {/* Label */}
      <div className="flex-1">
        <span className="font-bold font-comic text-sm block">
          {action.label}
        </span>
        {action.description && (
          <span className="text-xs text-gray-500 block">
            {action.description}
          </span>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      )}

      {/* XP Badge */}
      {action.xpReward && !isLoading && (
        <div className="px-2 py-1 bg-nanobanana-yellow border-2 border-black rounded-full text-xs font-bold">
          +{action.xpReward} XP
        </div>
      )}
    </motion.button>
  );
};

export default ContextMenuItem;
```

---

## 7. Integration Points

### 7.1 Chat Integration with Jeffrey

**Update ChatInterface to accept selected text:**

**Location:** `src/components/Chat/ChatInterface.jsx`

```jsx
// Add new prop
const ChatInterface = ({ lesson, selectedText }) => {
  const [input, setInput] = useState('');
  const { addMessage } = useChatContext();

  // Populate input with selected text
  useEffect(() => {
    if (selectedText) {
      setInput(`Tell me more about: "${selectedText}"`);
    }
  }, [selectedText]);

  // ... rest of component
};
```

**Create SelectedTextPreview component:**

**Location:** `src/components/Chat/SelectedTextPreview.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

/**
 * SelectedTextPreview - Shows selected text at top of chat
 */
const SelectedTextPreview = ({ selection, onClear, onAskJeffrey }) => {
  if (!selection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 bg-gradient-to-r from-nanobanana-yellow/30 to-nanobanana-pink/30 border-b-4 border-black"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Sparkles className="w-6 h-6 text-nanobanana-purple" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 mb-1">
            SELECTED TEXT
          </p>
          <p className="text-sm font-medium line-clamp-2">
            {selection.text}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAskJeffrey}
            className="px-3 py-1 bg-nanobanana-purple text-white border-2 border-black rounded-lg font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Ask Jeffrey
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedTextPreview;
```

### 7.2 Flashcard Integration

**Create hook for flashcard generation:**

**Location:** `src/hooks/useFlashcardGeneration.js`

```javascript
import { useState, useCallback } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { geminiGenerateFlashcards } from '../services/gemini';

export const useFlashcardGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { awardXP } = useGamificationContext();

  const generateFlashcards = useCallback(async (selectedText, lessonContext) => {
    setIsGenerating(true);
    
    try {
      // Call Gemini to generate flashcards
      const flashcards = await geminiGenerateFlashcards({
        text: selectedText,
        context: lessonContext,
      });

      // Award XP
      awardXP(10, 'flashcard_created');

      // Save to flashcard system (to be implemented)
      // saveFlashcards(flashcards);

      return flashcards;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [awardXP]);

  return { generateFlashcards, isGenerating };
};
```

---

## 8. Child Safety & UX

### 8.1 Content Safety Filters

**Location:** `src/utils/contentSafety.js`

```javascript
/**
 * Content safety utilities for child protection
 */

// Check if text contains inappropriate content markers
export const containsInappropriateContent = (text) => {
  // This would integrate with AI safety filters in production
  const flaggedPhrases = [
    // Add filtered terms (keep list secure/private)
  ];

  const lowerText = text.toLowerCase();
  return flaggedPhrases.some(phrase => lowerText.includes(phrase));
};

// Sanitize HTML content
export const sanitizeHTML = (html) => {
  // Remove all script tags and event handlers
  const clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return clean;
};

// Validate external links (prevent phishing)
export const isLinkSafe = (url) => {
  try {
    const parsed = new URL(url);
    
    // Block suspicious TLDs
    const blockedTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    if (blockedTLDs.some(tld => parsed.hostname.endsWith(tld))) {
      return false;
    }

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
```

### 8.2 Parental Control Hooks

**Location:** `src/hooks/useParentalControls.js`

```javascript
import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';

export const useParentalControls = () => {
  const { updateLesson } = useLessonContext();

  // Flag content for parent review
  const flagContentForReview = useCallback(async (lessonId, reason) => {
    await updateLesson(lessonId, {
      contentFlags: {
        reviewed: false,
        flaggedForReview: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
      },
    });
  }, [updateLesson]);

  // Check if feature requires parental approval
  const requiresParentalApproval = useCallback((featureName) => {
    const restrictedFeatures = [
      'external_video',
      'ai_image_generation',
      'social_sharing',
    ];

    return restrictedFeatures.includes(featureName);
  }, []);

  return {
    flagContentForReview,
    requiresParentalApproval,
  };
};
```

### 8.3 Touch Target Guidelines

**Location:** `src/constants/touchTargets.js`

```javascript
/**
 * Touch target sizes for child-friendly UI
 * Following iOS HIG and Android Material guidelines
 */

export const TOUCH_TARGETS = {
  // Minimum touch target (Apple HIG: 44x44pt)
  MIN_SIZE: 44,
  
  // Recommended for children (easier to tap)
  CHILD_SIZE: 56,
  
  // Large buttons for primary actions
  PRIMARY_SIZE: 64,
  
  // Text sizes for readability
  TEXT_SIZES: {
    TITLE: '1.5rem',      // 24px
    BODY: '1.125rem',     // 18px
    CAPTION: '0.875rem',  // 14px
  },
};
```

---

## 9. Testing Checklist

### 9.1 Content Rendering Tests

- [ ] **PDF Rendering**
  - [ ] Single-page PDF loads correctly
  - [ ] Multi-page PDF navigates smoothly
  - [ ] Text layer renders for selection
  - [ ] Zoom in/out works without breaking layout
  - [ ] Page numbers display correctly
  - [ ] Error state shows for corrupted PDFs

- [ ] **Image Rendering**
  - [ ] PNG images display
  - [ ] JPEG images display
  - [ ] WebP images display
  - [ ] Zoom/pan gestures work
  - [ ] Image maintains aspect ratio
  - [ ] Large images don't crash app

- [ ] **Text Rendering**
  - [ ] Plain text displays with formatting
  - [ ] Line breaks preserved
  - [ ] Selectable text works
  - [ ] Scroll performance is smooth

### 9.2 Text Selection Tests

- [ ] **Mouse Selection**
  - [ ] Click-drag selects text
  - [ ] Selection highlights visually
  - [ ] Selection popup appears
  - [ ] Minimum 3 characters enforced
  - [ ] Selection clears on click away

- [ ] **Touch Selection**
  - [ ] Long-press selects word
  - [ ] Drag handles adjust selection
  - [ ] Touch selection on mobile works
  - [ ] Selection handles are 56px+ (child-sized)

- [ ] **Context Menu**
  - [ ] Menu opens on right-click
  - [ ] Menu opens on selection popup click
  - [ ] Menu positions within viewport
  - [ ] Menu closes on outside click
  - [ ] Menu closes on Escape key

### 9.3 Highlight Tests

- [ ] **Creation**
  - [ ] Highlights save on action
  - [ ] Multiple highlights supported
  - [ ] Highlight colors work
  - [ ] Overlapping highlights handled

- [ ] **Persistence**
  - [ ] Highlights persist after page refresh
  - [ ] Highlights sync across pages
  - [ ] localStorage saves correctly
  - [ ] Highlights load on mount

- [ ] **Deletion**
  - [ ] Individual highlights deletable
  - [ ] All highlights clearable
  - [ ] Deletion confirmed before action

### 9.4 Action Tests

- [ ] **Ask Jeffrey**
  - [ ] Selection sends to chat
  - [ ] Chat populates with context
  - [ ] Jeffrey responds appropriately
  - [ ] XP awarded for action

- [ ] **Create Flashcard**
  - [ ] AI generates card from selection
  - [ ] Card saves to flashcard system
  - [ ] User can review card
  - [ ] XP awarded for creation

- [ ] **Generate Quiz**
  - [ ] Questions generated from text
  - [ ] Multiple choice format
  - [ ] Answers validated
  - [ ] XP awarded for completion

### 9.5 Integration Tests

- [ ] **LessonContext Integration**
  - [ ] View preferences save
  - [ ] Progress updates correctly
  - [ ] Time tracking increments

- [ ] **GamificationContext Integration**
  - [ ] XP awarded for actions
  - [ ] Achievements trigger
  - [ ] Streaks update

- [ ] **Chat Integration**
  - [ ] Selected text appears in chat
  - [ ] Chat maintains conversation history
  - [ ] Jeffrey's responses are contextual

### 9.6 Child Safety Tests

- [ ] **Content Filtering**
  - [ ] Inappropriate content flagged
  - [ ] External links blocked
  - [ ] HTML sanitized properly

- [ ] **Parental Controls**
  - [ ] Restricted features require approval
  - [ ] Content flagging works
  - [ ] Parent dashboard shows flags

### 9.7 Performance Tests

- [ ] Large PDFs (100+ pages) render
- [ ] Multiple highlights don't slow down
- [ ] Memory usage stays reasonable
- [ ] Smooth scrolling maintained
- [ ] No memory leaks on unmount

### 9.8 Accessibility Tests

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] High contrast mode supported
- [ ] Touch targets meet 44px minimum
- [ ] Focus indicators visible

---

## 10. Implementation Steps

### Phase 1: Core Rendering (Days 1-3)

**Step 1:** Set up PDF.js configuration
```bash
# Copy PDF.js worker to public folder
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

**Step 2:** Create PDF rendering components
- [ ] PDFViewer.jsx
- [ ] PDFToolbar.jsx
- [ ] PDFContentView.jsx

**Step 3:** Create Image/Text viewers
- [ ] ImageContentView.jsx
- [ ] ImageViewer.jsx
- [ ] TextContentView.jsx

**Step 4:** Update LessonView.jsx
- [ ] Add ContentRenderer
- [ ] Add loading states
- [ ] Add empty states

**Step 5:** Test basic rendering
- [ ] Upload PDF and verify display
- [ ] Upload image and verify display
- [ ] Test navigation controls

### Phase 2: Text Selection (Days 4-5)

**Step 6:** Create HighlightContext
- [ ] Implement state management
- [ ] Add persistence layer

**Step 7:** Implement text selection
- [ ] Mouse selection handler
- [ ] Touch selection handler
- [ ] Selection popup component

**Step 8:** Test selection features
- [ ] Verify selection works on all devices
- [ ] Test minimum character enforcement
- [ ] Test selection clearing

### Phase 3: Interactive Features (Days 6-7)

**Step 9:** Create ContextMenu system
- [ ] ContextMenu.jsx
- [ ] ContextMenuItem.jsx
- [ ] Define menu actions

**Step 10:** Implement highlight overlay
- [ ] PDFHighlightOverlay.jsx
- [ ] Highlight rendering
- [ ] Highlight persistence

**Step 11:** Test interactions
- [ ] Context menu positioning
- [ ] Highlight creation
- [ ] Highlight deletion

### Phase 4: Integrations (Days 8-10)

**Step 12:** Connect to Chat
- [ ] SelectedTextPreview component
- [ ] Update ChatInterface
- [ ] Test Jeffrey responses

**Step 13:** Connect to Flashcards
- [ ] useFlashcardGeneration hook
- [ ] AI flashcard generation
- [ ] Save to flashcard system

**Step 14:** Connect to Gamification
- [ ] XP rewards for actions
- [ ] Achievement triggers
- [ ] Progress tracking

### Phase 5: Polish & Safety (Days 11-12)

**Step 15:** Add safety features
- [ ] Content filtering
- [ ] Parental controls
- [ ] HTML sanitization

**Step 16:** Child-friendly UI polish
- [ ] Touch target adjustments
- [ ] Animation refinements
- [ ] Error state improvements

**Step 17:** Comprehensive testing
- [ ] Run full testing checklist
- [ ] Fix bugs
- [ ] Performance optimization

---

## Quick Start Command

Once all files are in place, run this to verify setup:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to test
# Navigate to StudyPage
# Upload a PDF
# Try selecting text
# Check context menu appears
# Verify highlights persist after refresh
```

---

## Configuration Files

### PDF.js Config

**Location:** `src/utils/pdfConfig.js`

```javascript
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PDF rendering options
export const PDF_OPTIONS = {
  renderTextLayer: true,
  renderAnnotationLayer: false,
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  cMapPacked: true,
};

// PDF viewer defaults
export const PDF_DEFAULTS = {
  scale: 1.0,
  minScale: 0.5,
  maxScale: 3.0,
  scaleStep: 0.25,
};
```

### Context Menu Actions Config

**Location:** `src/constants/contextMenuConfig.js`

```javascript
import { MessageCircle, BookOpen, HelpCircle, Video, Copy } from 'lucide-react';

export const CONTEXT_MENU_ACTIONS = [
  {
    id: 'ask_jeffrey',
    label: 'Ask Jeffrey',
    description: 'Chat about this text',
    emoji: '💬',
    icon: MessageCircle,
    color: '#8B5CF6',
    xpReward: 5,
  },
  {
    id: 'create_flashcard',
    label: 'Make Flashcard',
    description: 'Study this later',
    emoji: '🎴',
    icon: BookOpen,
    color: '#F59E0B',
    xpReward: 10,
  },
  {
    id: 'generate_quiz',
    label: 'Make Quiz',
    description: 'Test yourself',
    emoji: '❓',
    icon: HelpCircle,
    color: '#10B981',
    xpReward: 15,
  },
  {
    id: 'explain_more',
    label: 'Explain More',
    description: 'Get a simple explanation',
    emoji: '🔍',
    icon: MessageCircle,
    color: '#3B82F6',
    xpReward: 5,
  },
  {
    id: 'create_video',
    label: 'Video Explainer',
    description: 'Watch a video about this',
    emoji: '🎥',
    icon: Video,
    color: '#EF4444',
    xpReward: 20,
    requiresAI: true,
  },
  {
    id: 'copy_text',
    label: 'Copy Text',
    description: 'Copy to clipboard',
    emoji: '📋',
    icon: Copy,
    color: '#6B7280',
    xpReward: 0,
  },
];
```

---

## Success Criteria

This implementation is complete when:

1. ✅ PDFs render with selectable text layer
2. ✅ Images display with zoom/pan controls
3. ✅ Text selections trigger context menu
4. ✅ Highlights persist across sessions
5. ✅ "Ask Jeffrey" sends text to chat
6. ✅ Flashcard generation works
7. ✅ XP rewards trigger for actions
8. ✅ All child safety checks pass
9. ✅ Touch targets meet 44px minimum
10. ✅ Component passes accessibility audit

---

## Next Steps After Implementation

1. **Quiz Generation System** - Build out full quiz flow
2. **Video Explainer Generation** - Integrate Veo API
3. **Flashcard Spaced Repetition** - Implement review algorithm
4. **Collaborative Highlighting** - Share highlights with classmates
5. **Offline Support** - PWA with cached content
6. **Parent Dashboard** - View child's highlights and progress
7. **Export Features** - Print study guides from highlights
8. **Advanced Annotations** - Drawing tools, voice notes

---

**Created for:** NanoBanana K-6 AI Learning Platform  
**Author:** AI Implementation Guide  
**Last Updated:** Session Date  
**Estimated Completion:** 8-12 developer hours  
**Dependencies:** React 18+, react-pdf, pdfjs-dist, framer-motion  

**Status:** Ready for Claude Code implementation 🚀
