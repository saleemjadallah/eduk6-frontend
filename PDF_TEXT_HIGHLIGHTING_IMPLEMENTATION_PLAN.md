# PDF Text Highlighting & Context Menu Implementation Plan
## K-6 AI Learning Platform - Option D

**Goal:** Create an interactive PDF text highlighting system that allows children to select text from uploaded documents, transfer selections to Jeffrey (AI tutor), and access quick-action context menus for creating flashcards, explainer videos, quizzes, or starting a conversation about the selected content.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [New Dependencies](#2-new-dependencies)
3. [File Structure](#3-file-structure)
4. [Data Models](#4-data-models)
5. [Context Setup](#5-context-setup)
6. [Component Implementations](#6-component-implementations)
7. [Hook Implementations](#7-hook-implementations)
8. [PDF Rendering & Text Layer](#8-pdf-rendering--text-layer)
9. [Context Menu Actions](#9-context-menu-actions)
10. [Integration with Existing Systems](#10-integration-with-existing-systems)
11. [Animations & Feedback](#11-animations--feedback)
12. [Child Safety & UX Considerations](#12-child-safety--ux-considerations)
13. [Testing Checklist](#13-testing-checklist)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         PDF HIGHLIGHTING FLOW                                     │
│                                                                                   │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                          STUDY PAGE LAYOUT                                │   │
│   │                                                                           │   │
│   │   ┌─────────────────────────┐     ┌─────────────────────────────────┐    │   │
│   │   │      PDF VIEWER         │     │        CHAT INTERFACE           │    │   │
│   │   │   (Left Pane - 60%)     │     │      (Right Pane - 40%)         │    │   │
│   │   │                         │     │                                  │    │   │
│   │   │  ┌───────────────────┐  │     │  ┌──────────────────────────┐   │    │   │
│   │   │  │   Rendered PDF    │  │     │  │     Jeffrey Avatar       │   │    │   │
│   │   │  │   with Text Layer │  │     │  │   "Tell me more about    │   │    │   │
│   │   │  │                   │  │     │  │    what you selected!"   │   │    │   │
│   │   │  │  [████████████]   │  │────▶│  │                          │   │    │   │
│   │   │  │  (highlighted)    │  │     │  └──────────────────────────┘   │    │   │
│   │   │  │                   │  │     │                                  │    │   │
│   │   │  └───────────────────┘  │     │  ┌──────────────────────────┐   │    │   │
│   │   │                         │     │  │  Selected Text Preview   │   │    │   │
│   │   │                         │     │  │  "The water cycle..."    │   │    │   │
│   │   └─────────────────────────┘     │  └──────────────────────────┘   │    │   │
│   │                                    │                                  │    │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         CONTEXT MENU SYSTEM                                       │
│                                                                                   │
│   User selects text ──▶ Text highlighted ──▶ Right-click/Long-press              │
│                                                      │                            │
│                                                      ▼                            │
│                              ┌─────────────────────────────────────┐              │
│                              │        CONTEXT MENU POPUP           │              │
│                              │  ┌─────────────────────────────────┐│              │
│                              │  │ 💬 Chat with Jeffrey            ││              │
│                              │  │    "Ask me about this!"         ││              │
│                              │  ├─────────────────────────────────┤│              │
│                              │  │ 🃏 Create Flashcards            ││              │
│                              │  │    "Turn this into cards!"      ││              │
│                              │  ├─────────────────────────────────┤│              │
│                              │  │ 🎬 Make Explainer Video         ││              │
│                              │  │    "Watch and learn!"           ││              │
│                              │  ├─────────────────────────────────┤│              │
│                              │  │ 📝 Create Quiz                  ││              │
│                              │  │    "Test your knowledge!"       ││              │
│                              │  ├─────────────────────────────────┤│              │
│                              │  │ 📋 Copy Text                    ││              │
│                              │  │    "Save for later"             ││              │
│                              │  └─────────────────────────────────┘│              │
│                              └─────────────────────────────────────┘              │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                                 │
│                                                                                   │
│   Text Selection ──▶ HighlightContext ──▶ Action Handler ──▶ Target System       │
│                              │                   │                                │
│                              │         ┌─────────┴─────────┐                      │
│                              │         │                   │                      │
│                              ▼         ▼                   ▼                      │
│                      ┌──────────────────────────────────────────┐                 │
│                      │           INTEGRATION POINTS              │                 │
│                      │  ┌────────────┐  ┌────────────────────┐  │                 │
│                      │  │   Chat     │  │    Flashcard       │  │                 │
│                      │  │  Context   │  │     Context        │  │                 │
│                      │  │            │  │                    │  │                 │
│                      │  │ Send text  │  │ Generate cards     │  │                 │
│                      │  │ to Jeffrey │  │ from selection     │  │                 │
│                      │  └────────────┘  └────────────────────┘  │                 │
│                      │                                          │                 │
│                      │  ┌────────────┐  ┌────────────────────┐  │                 │
│                      │  │   Video    │  │      Quiz          │  │                 │
│                      │  │ Generator  │  │    Generator       │  │                 │
│                      │  │            │  │                    │  │                 │
│                      │  │ Create     │  │ Generate quiz      │  │                 │
│                      │  │ explainer  │  │ questions          │  │                 │
│                      │  └────────────┘  └────────────────────┘  │                 │
│                      └──────────────────────────────────────────┘                 │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-pdf": "^7.7.1",
    "pdfjs-dist": "^3.11.174",
    "@floating-ui/react": "^0.26.9",
    "framer-motion": "^11.0.3"
  }
}
```

**Installation command:**
```bash
npm install react-pdf pdfjs-dist @floating-ui/react framer-motion
```

**Libraries explained:**
- `react-pdf`: React wrapper for PDF.js with text layer support
- `pdfjs-dist`: PDF rendering engine with text extraction capabilities
- `@floating-ui/react`: Positioning for context menus and tooltips (child-friendly positioning)
- `framer-motion`: Smooth animations for highlights and menus (likely already installed)

**Note:** react-pdf requires copying the PDF.js worker file. Add this to your build setup or use the CDN version.

---

## 3. File Structure

Create the following new files:

```
src/
├── context/
│   └── HighlightContext.jsx              # NEW - Selection & highlight state management
│
├── components/
│   └── PDF/
│       ├── PDFViewer.jsx                 # NEW - Main PDF rendering component
│       ├── PDFPage.jsx                   # NEW - Individual page with text layer
│       ├── PDFTextLayer.jsx              # NEW - Selectable text overlay
│       ├── PDFControls.jsx               # NEW - Zoom, page navigation
│       ├── HighlightLayer.jsx            # NEW - Visual highlight overlays
│       ├── SelectionPopup.jsx            # NEW - Quick actions after selection
│       ├── ContextMenu.jsx               # NEW - Right-click menu
│       ├── ContextMenuItem.jsx           # NEW - Individual menu item
│       ├── SelectedTextPreview.jsx       # NEW - Shows selection in chat pane
│       └── HighlightTooltip.jsx          # NEW - Hover tooltip for existing highlights
│
├── hooks/
│   ├── useTextSelection.js               # NEW - Text selection detection
│   ├── useHighlights.js                  # NEW - Highlight management
│   ├── useContextMenu.js                 # NEW - Context menu positioning
│   └── usePDFRenderer.js                 # NEW - PDF loading and rendering
│
├── utils/
│   ├── textSelectionUtils.js             # NEW - Selection range utilities
│   ├── highlightStorage.js               # NEW - Persist highlights
│   └── pdfTextExtraction.js              # NEW - Extract text with positions
│
└── constants/
    └── contextMenuConfig.js              # NEW - Menu items configuration
```

---

## 4. Data Models

### 4.1 Selection Schema

```typescript
interface TextSelection {
  id: string;                             // Unique selection ID
  text: string;                           // Selected text content
  pageNumber: number;                     // PDF page number
  boundingRects: BoundingRect[];          // Position data for multi-line selections
  timestamp: string;                      // ISO timestamp
  lessonId: string;                       // Associated lesson
}

interface BoundingRect {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}
```

### 4.2 Highlight Schema

```typescript
interface Highlight {
  id: string;
  selectionId: string;
  text: string;
  pageNumber: number;
  boundingRects: BoundingRect[];
  color: HighlightColor;
  note?: string;                          // Optional note attached to highlight
  createdAt: string;
  lessonId: string;
  actions: HighlightAction[];             // Actions performed on this highlight
}

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

interface HighlightAction {
  type: 'chat' | 'flashcard' | 'video' | 'quiz';
  timestamp: string;
  resultId?: string;                      // ID of created flashcard/video/quiz
}
```

### 4.3 Context Menu Action Schema

```typescript
interface ContextMenuAction {
  id: string;
  icon: string;                           // Emoji for child-friendly display
  label: string;                          // Display text
  description: string;                    // Helper text for kids
  handler: (selection: TextSelection) => Promise<void>;
  isEnabled: (selection: TextSelection) => boolean;
  color: string;                          // Background color for button
  animation?: 'bounce' | 'wiggle' | 'pulse';
}
```

---

## 5. Context Setup

### 5.1 HighlightContext.jsx

**Location:** `src/context/HighlightContext.jsx`

```jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
  currentSelection: null,           // Currently selected text (before highlighting)
  highlights: [],                   // All saved highlights for current lesson
  activeHighlightId: null,          // Highlight being hovered/focused
  isContextMenuOpen: false,
  contextMenuPosition: { x: 0, y: 0 },
  pendingAction: null,              // Action waiting to be executed
  selectionHistory: [],             // Recent selections for quick access
};

// Action types
const ACTIONS = {
  SET_SELECTION: 'SET_SELECTION',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  ADD_HIGHLIGHT: 'ADD_HIGHLIGHT',
  REMOVE_HIGHLIGHT: 'REMOVE_HIGHLIGHT',
  UPDATE_HIGHLIGHT: 'UPDATE_HIGHLIGHT',
  SET_ACTIVE_HIGHLIGHT: 'SET_ACTIVE_HIGHLIGHT',
  OPEN_CONTEXT_MENU: 'OPEN_CONTEXT_MENU',
  CLOSE_CONTEXT_MENU: 'CLOSE_CONTEXT_MENU',
  SET_PENDING_ACTION: 'SET_PENDING_ACTION',
  CLEAR_PENDING_ACTION: 'CLEAR_PENDING_ACTION',
  LOAD_HIGHLIGHTS: 'LOAD_HIGHLIGHTS',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
};

// Reducer
function highlightReducer(state, action) {
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
        isContextMenuOpen: false,
      };
    
    case ACTIONS.ADD_HIGHLIGHT:
      return {
        ...state,
        highlights: [...state.highlights, action.payload],
        currentSelection: null,
        isContextMenuOpen: false,
      };
    
    case ACTIONS.REMOVE_HIGHLIGHT:
      return {
        ...state,
        highlights: state.highlights.filter(h => h.id !== action.payload),
        activeHighlightId: state.activeHighlightId === action.payload ? null : state.activeHighlightId,
      };
    
    case ACTIONS.UPDATE_HIGHLIGHT:
      return {
        ...state,
        highlights: state.highlights.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
        ),
      };
    
    case ACTIONS.SET_ACTIVE_HIGHLIGHT:
      return {
        ...state,
        activeHighlightId: action.payload,
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
    
    case ACTIONS.SET_PENDING_ACTION:
      return {
        ...state,
        pendingAction: action.payload,
      };
    
    case ACTIONS.CLEAR_PENDING_ACTION:
      return {
        ...state,
        pendingAction: null,
      };
    
    case ACTIONS.LOAD_HIGHLIGHTS:
      return {
        ...state,
        highlights: action.payload,
      };
    
    case ACTIONS.ADD_TO_HISTORY:
      const newHistory = [action.payload, ...state.selectionHistory].slice(0, 10);
      return {
        ...state,
        selectionHistory: newHistory,
      };
    
    default:
      return state;
  }
}

// Context
const HighlightContext = createContext(null);

// Provider
export const HighlightProvider = ({ children, lessonId }) => {
  const [state, dispatch] = useReducer(highlightReducer, initialState);

  // Load highlights from localStorage on mount
  useEffect(() => {
    if (lessonId) {
      const stored = localStorage.getItem(`highlights_${lessonId}`);
      if (stored) {
        try {
          const highlights = JSON.parse(stored);
          dispatch({ type: ACTIONS.LOAD_HIGHLIGHTS, payload: highlights });
        } catch (e) {
          console.error('Failed to load highlights:', e);
        }
      }
    }
  }, [lessonId]);

  // Save highlights to localStorage when they change
  useEffect(() => {
    if (lessonId && state.highlights.length > 0) {
      localStorage.setItem(`highlights_${lessonId}`, JSON.stringify(state.highlights));
    }
  }, [state.highlights, lessonId]);

  // Action creators
  const setSelection = useCallback((selection) => {
    dispatch({
      type: ACTIONS.SET_SELECTION,
      payload: {
        id: uuidv4(),
        ...selection,
        timestamp: new Date().toISOString(),
        lessonId,
      },
    });
  }, [lessonId]);

  const clearSelection = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  }, []);

  const addHighlight = useCallback((selection, color = 'yellow') => {
    const highlight = {
      id: uuidv4(),
      selectionId: selection.id,
      text: selection.text,
      pageNumber: selection.pageNumber,
      boundingRects: selection.boundingRects,
      color,
      createdAt: new Date().toISOString(),
      lessonId,
      actions: [],
    };
    dispatch({ type: ACTIONS.ADD_HIGHLIGHT, payload: highlight });
    dispatch({ type: ACTIONS.ADD_TO_HISTORY, payload: selection });
    return highlight;
  }, [lessonId]);

  const removeHighlight = useCallback((highlightId) => {
    dispatch({ type: ACTIONS.REMOVE_HIGHLIGHT, payload: highlightId });
  }, []);

  const updateHighlight = useCallback((highlightId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_HIGHLIGHT,
      payload: { id: highlightId, updates },
    });
  }, []);

  const recordAction = useCallback((highlightId, actionType, resultId) => {
    updateHighlight(highlightId, {
      actions: [
        ...state.highlights.find(h => h.id === highlightId)?.actions || [],
        { type: actionType, timestamp: new Date().toISOString(), resultId },
      ],
    });
  }, [state.highlights, updateHighlight]);

  const setActiveHighlight = useCallback((highlightId) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_HIGHLIGHT, payload: highlightId });
  }, []);

  const openContextMenu = useCallback((position) => {
    dispatch({ type: ACTIONS.OPEN_CONTEXT_MENU, payload: position });
  }, []);

  const closeContextMenu = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_CONTEXT_MENU });
  }, []);

  const setPendingAction = useCallback((action) => {
    dispatch({ type: ACTIONS.SET_PENDING_ACTION, payload: action });
  }, []);

  const clearPendingAction = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_PENDING_ACTION });
  }, []);

  const value = {
    ...state,
    setSelection,
    clearSelection,
    addHighlight,
    removeHighlight,
    updateHighlight,
    recordAction,
    setActiveHighlight,
    openContextMenu,
    closeContextMenu,
    setPendingAction,
    clearPendingAction,
  };

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
};

// Custom hook
export const useHighlightContext = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlightContext must be used within a HighlightProvider');
  }
  return context;
};

export default HighlightContext;
```

---

## 6. Component Implementations

### 6.1 PDFViewer.jsx - Main PDF Component

**Location:** `src/components/PDF/PDFViewer.jsx`

```jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import PDFPage from './PDFPage';
import PDFControls from './PDFControls';
import ContextMenu from './ContextMenu';
import { useHighlightContext } from '../../context/HighlightContext';
import { useTextSelection } from '../../hooks/useTextSelection';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ 
  pdfUrl, 
  lessonId,
  onTextSelected,
  initialPage = 1 
}) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  const containerRef = useRef(null);
  const {
    currentSelection,
    isContextMenuOpen,
    contextMenuPosition,
    openContextMenu,
    closeContextMenu,
  } = useHighlightContext();

  // Handle document load
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    setLoadError(error);
    setIsLoading(false);
    console.error('PDF load error:', error);
  }, []);

  // Page navigation
  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, numPages || prev));
  }, [numPages]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  // Handle right-click for context menu
  const handleContextMenu = useCallback((e) => {
    if (currentSelection) {
      e.preventDefault();
      openContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, [currentSelection, openContextMenu]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isContextMenuOpen) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isContextMenuOpen, closeContextMenu]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPreviousPage();
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'Escape') closeContextMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage, closeContextMenu]);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col h-full bg-gray-100 rounded-2xl border-4 border-black overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-nanobanana-blue" />
            </motion.div>
            <p className="mt-4 font-comic text-lg text-gray-600">
              Loading your lesson... 📚
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
          <span className="text-6xl mb-4">😕</span>
          <p className="font-comic text-lg text-gray-600">
            Oops! We couldn't load this document.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try uploading it again!
          </p>
        </div>
      )}

      {/* PDF Controls - Top Bar */}
      <PDFControls
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onPageChange={setCurrentPage}
      />

      {/* PDF Document Container */}
      <div className="flex-1 overflow-auto p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex flex-col items-center"
        >
          <PDFPage
            pageNumber={currentPage}
            scale={scale}
            lessonId={lessonId}
            onTextSelected={onTextSelected}
          />
        </Document>
      </div>

      {/* Page Navigation Buttons - Large Touch Targets for Kids */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          className="ml-2 p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToNextPage}
          disabled={currentPage >= numPages}
          className="mr-2 p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {isContextMenuOpen && currentSelection && (
          <ContextMenu
            position={contextMenuPosition}
            selection={currentSelection}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFViewer;
```

### 6.2 PDFPage.jsx - Individual Page with Text Layer

**Location:** `src/components/PDF/PDFPage.jsx`

```jsx
import React, { useCallback, useRef } from 'react';
import { Page } from 'react-pdf';
import { motion } from 'framer-motion';
import HighlightLayer from './HighlightLayer';
import SelectionPopup from './SelectionPopup';
import { useHighlightContext } from '../../context/HighlightContext';
import { useTextSelection } from '../../hooks/useTextSelection';

const PDFPage = ({ pageNumber, scale, lessonId, onTextSelected }) => {
  const pageRef = useRef(null);
  const {
    setSelection,
    currentSelection,
    highlights,
    openContextMenu,
  } = useHighlightContext();

  // Custom text selection handling
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      // Get selection range and bounding rects
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      const pageRect = pageRef.current?.getBoundingClientRect();

      if (pageRect && rects.length > 0) {
        // Convert client rects to page-relative positions
        const boundingRects = Array.from(rects).map(rect => ({
          top: (rect.top - pageRect.top) / scale,
          left: (rect.left - pageRect.left) / scale,
          width: rect.width / scale,
          height: rect.height / scale,
          pageIndex: pageNumber - 1,
        }));

        const selectionData = {
          text: selectedText,
          pageNumber,
          boundingRects,
        };

        setSelection(selectionData);
        onTextSelected?.(selectionData);
      }
    }
  }, [pageNumber, scale, setSelection, onTextSelected]);

  // Handle mouse up for selection
  const handleMouseUp = useCallback((e) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      handleTextSelection();
    }, 10);
  }, [handleTextSelection]);

  // Handle long press for mobile (context menu trigger)
  const handleTouchEnd = useCallback((e) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText) {
      handleTextSelection();
      
      // Get touch position for context menu
      const touch = e.changedTouches[0];
      if (touch) {
        openContextMenu({ x: touch.clientX, y: touch.clientY });
      }
    }
  }, [handleTextSelection, openContextMenu]);

  // Filter highlights for current page
  const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber);

  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white shadow-lg rounded-lg overflow-hidden"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      {/* PDF Page Render */}
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={false}
        className="pdf-page"
        loading={
          <div className="w-full h-96 flex items-center justify-center">
            <span className="text-2xl animate-bounce">📄</span>
          </div>
        }
      />

      {/* Highlight Overlay Layer */}
      <HighlightLayer
        highlights={pageHighlights}
        scale={scale}
      />

      {/* Selection Popup (shows after selection) */}
      {currentSelection && currentSelection.pageNumber === pageNumber && (
        <SelectionPopup
          selection={currentSelection}
          scale={scale}
        />
      )}
    </motion.div>
  );
};

export default PDFPage;
```

### 6.3 HighlightLayer.jsx - Visual Highlight Overlays

**Location:** `src/components/PDF/HighlightLayer.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useHighlightContext } from '../../context/HighlightContext';

const HIGHLIGHT_COLORS = {
  yellow: 'rgba(255, 235, 59, 0.4)',
  green: 'rgba(76, 175, 80, 0.4)',
  blue: 'rgba(33, 150, 243, 0.4)',
  pink: 'rgba(233, 30, 99, 0.4)',
  orange: 'rgba(255, 152, 0, 0.4)',
};

const HighlightLayer = ({ highlights, scale }) => {
  const { activeHighlightId, setActiveHighlight } = useHighlightContext();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map((highlight) => (
        <div key={highlight.id}>
          {highlight.boundingRects.map((rect, index) => (
            <motion.div
              key={`${highlight.id}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: activeHighlightId === highlight.id ? 1.02 : 1,
              }}
              whileHover={{ scale: 1.02 }}
              style={{
                position: 'absolute',
                top: rect.top * scale,
                left: rect.left * scale,
                width: rect.width * scale,
                height: rect.height * scale,
                backgroundColor: HIGHLIGHT_COLORS[highlight.color] || HIGHLIGHT_COLORS.yellow,
                borderRadius: '2px',
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setActiveHighlight(highlight.id)}
              onMouseLeave={() => setActiveHighlight(null)}
              className="transition-all duration-200"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HighlightLayer;
```

### 6.4 ContextMenu.jsx - Right-Click/Long-Press Menu

**Location:** `src/components/PDF/ContextMenu.jsx`

```jsx
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  CreditCard, 
  Video, 
  FileQuestion, 
  Copy,
  Highlighter,
  X 
} from 'lucide-react';
import ContextMenuItem from './ContextMenuItem';
import { useHighlightContext } from '../../context/HighlightContext';
import { useLessonContext } from '../../context/LessonContext';
import { useFlashcardContext } from '../../context/FlashcardContext';

const ContextMenu = ({ position, selection, onClose }) => {
  const menuRef = useRef(null);
  const { addHighlight, recordAction } = useHighlightContext();
  const { sendToJeffrey } = useLessonContext();
  const { generateFlashcardsFromText } = useFlashcardContext();

  // Adjust position to stay within viewport
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 20;
      }
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 20;
      }

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [position]);

  // Menu items configuration
  const menuItems = [
    {
      id: 'chat',
      icon: <MessageCircle className="w-5 h-5" />,
      emoji: '💬',
      label: 'Ask Jeffrey',
      description: 'Chat about this text',
      color: 'bg-nanobanana-blue',
      handler: async () => {
        const highlight = addHighlight(selection, 'blue');
        await sendToJeffrey(selection.text, 'explain');
        recordAction(highlight.id, 'chat');
        onClose();
      },
    },
    {
      id: 'flashcard',
      icon: <CreditCard className="w-5 h-5" />,
      emoji: '🃏',
      label: 'Make Flashcards',
      description: 'Turn into study cards',
      color: 'bg-nanobanana-yellow',
      handler: async () => {
        const highlight = addHighlight(selection, 'yellow');
        await generateFlashcardsFromText(selection.text);
        recordAction(highlight.id, 'flashcard');
        onClose();
      },
    },
    {
      id: 'video',
      icon: <Video className="w-5 h-5" />,
      emoji: '🎬',
      label: 'Explainer Video',
      description: 'Watch and learn!',
      color: 'bg-pink-400',
      handler: async () => {
        const highlight = addHighlight(selection, 'pink');
        // Video generation would be triggered here
        recordAction(highlight.id, 'video');
        onClose();
      },
    },
    {
      id: 'quiz',
      icon: <FileQuestion className="w-5 h-5" />,
      emoji: '📝',
      label: 'Create Quiz',
      description: 'Test your knowledge!',
      color: 'bg-nanobanana-green',
      handler: async () => {
        const highlight = addHighlight(selection, 'green');
        // Quiz generation would be triggered here
        recordAction(highlight.id, 'quiz');
        onClose();
      },
    },
    {
      id: 'highlight',
      icon: <Highlighter className="w-5 h-5" />,
      emoji: '✨',
      label: 'Just Highlight',
      description: 'Save for later',
      color: 'bg-orange-400',
      handler: () => {
        addHighlight(selection, 'orange');
        onClose();
      },
    },
    {
      id: 'copy',
      icon: <Copy className="w-5 h-5" />,
      emoji: '📋',
      label: 'Copy Text',
      description: 'Copy to clipboard',
      color: 'bg-gray-400',
      handler: async () => {
        await navigator.clipboard.writeText(selection.text);
        onClose();
      },
    },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed z-50 min-w-[240px] bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with selected text preview */}
      <div className="p-3 bg-gray-100 border-b-4 border-black">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Selected Text</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-gray-800 line-clamp-2">
          "{selection.text}"
        </p>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item, index) => (
          <ContextMenuItem
            key={item.id}
            {...item}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Footer hint for kids */}
      <div className="px-3 pb-3 pt-1">
        <p className="text-xs text-gray-400 text-center italic">
          Pick what you want to do! ✨
        </p>
      </div>
    </motion.div>
  );
};

export default ContextMenu;
```

### 6.5 ContextMenuItem.jsx - Individual Menu Item

**Location:** `src/components/PDF/ContextMenuItem.jsx`

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContextMenuItem = ({
  id,
  icon,
  emoji,
  label,
  description,
  color,
  handler,
  delay = 0,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await handler();
    } catch (error) {
      console.error(`Error executing ${id} action:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl 
        border-2 border-black ${color} 
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        active:shadow-none active:translate-x-1 active:translate-y-1
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-wait
        mb-2 last:mb-0
      `}
    >
      {/* Emoji for visual appeal (kids love emojis) */}
      <span className="text-2xl">{emoji}</span>
      
      {/* Text content */}
      <div className="flex-1 text-left">
        <span className="block font-bold text-sm">{label}</span>
        <span className="block text-xs text-gray-700 opacity-80">{description}</span>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-lg"
        >
          ⏳
        </motion.span>
      )}
    </motion.button>
  );
};

export default ContextMenuItem;
```

### 6.6 SelectionPopup.jsx - Quick Action Popup After Selection

**Location:** `src/components/PDF/SelectionPopup.jsx`

```jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { useHighlightContext } from '../../context/HighlightContext';

const SelectionPopup = ({ selection, scale }) => {
  const { openContextMenu, addHighlight } = useHighlightContext();

  // Calculate popup position (above the selection)
  const popupPosition = useMemo(() => {
    if (!selection?.boundingRects?.length) return null;

    const firstRect = selection.boundingRects[0];
    return {
      top: firstRect.top * scale - 50, // Position above selection
      left: (firstRect.left + firstRect.width / 2) * scale,
    };
  }, [selection, scale]);

  if (!popupPosition) return null;

  const handleQuickChat = () => {
    // Quick action to send to Jeffrey
    addHighlight(selection, 'blue');
    // Trigger chat interface
  };

  const handleMoreOptions = (e) => {
    e.stopPropagation();
    openContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        position: 'absolute',
        top: popupPosition.top,
        left: popupPosition.left,
        transform: 'translateX(-50%)',
      }}
      className="flex items-center gap-2 bg-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-2 py-1 z-40"
    >
      {/* Quick Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleQuickChat}
        className="flex items-center gap-2 px-3 py-2 bg-nanobanana-blue text-white rounded-full font-bold text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        Ask Jeffrey
      </motion.button>

      {/* More Options Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMoreOptions}
        className="p-2 bg-gray-100 rounded-full border-2 border-black"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>

      {/* Arrow pointing to selection */}
      <div 
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-4 border-b-4 border-black rotate-45"
        style={{ marginBottom: '-8px' }}
      />
    </motion.div>
  );
};

export default SelectionPopup;
```

### 6.7 SelectedTextPreview.jsx - Preview in Chat Pane

**Location:** `src/components/PDF/SelectedTextPreview.jsx`

```jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Highlighter } from 'lucide-react';
import { useHighlightContext } from '../../context/HighlightContext';

const SelectedTextPreview = ({ onSendToChat }) => {
  const { currentSelection, clearSelection, addHighlight } = useHighlightContext();

  if (!currentSelection) return null;

  const handleSendToJeffrey = () => {
    addHighlight(currentSelection, 'blue');
    onSendToChat(currentSelection.text);
    clearSelection();
  };

  const handleHighlightOnly = () => {
    addHighlight(currentSelection, 'yellow');
    clearSelection();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 20, height: 0 }}
        className="mx-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-bold text-sm">You selected:</span>
          </div>
          <button
            onClick={clearSelection}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Text */}
        <div className="p-3 bg-white rounded-xl border-2 border-gray-200 mb-3 max-h-24 overflow-y-auto">
          <p className="text-sm text-gray-800 italic">
            "{currentSelection.text}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendToJeffrey}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-nanobanana-blue text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
          >
            <Send className="w-4 h-4" />
            Send to Jeffrey
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHighlightOnly}
            className="p-3 bg-nanobanana-yellow font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
            title="Just highlight"
          >
            <Highlighter className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Hint for kids */}
        <p className="text-xs text-center text-gray-500 mt-2 italic">
          Right-click for more options! 🖱️
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default SelectedTextPreview;
```

### 6.8 PDFControls.jsx - Zoom and Navigation Controls

**Location:** `src/components/PDF/PDFControls.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const PDFControls = ({
  currentPage,
  numPages,
  scale,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onPageChange,
}) => {
  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b-4 border-black">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-1 px-3 py-2 bg-nanobanana-yellow rounded-lg border-2 border-black font-bold">
          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= numPages) {
                onPageChange(page);
              }
            }}
            min={1}
            max={numPages || 1}
            className="w-8 text-center bg-transparent outline-none font-bold"
          />
          <span className="text-gray-600">/</span>
          <span>{numPages || '?'}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextPage}
          disabled={currentPage >= numPages}
          className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>

        <div className="px-3 py-2 bg-white rounded-lg border-2 border-black font-bold min-w-[60px] text-center">
          {zoomPercentage}%
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onZoomIn}
          disabled={scale >= 3}
          className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default PDFControls;
```

---

## 7. Hook Implementations

### 7.1 useTextSelection.js - Text Selection Detection

**Location:** `src/hooks/useTextSelection.js`

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to detect and manage text selections within a container
 * @param {Object} options - Configuration options
 * @param {number} options.minLength - Minimum selection length to trigger
 * @param {Function} options.onSelect - Callback when text is selected
 * @param {Function} options.onDeselect - Callback when selection is cleared
 */
export const useTextSelection = ({
  minLength = 3,
  onSelect,
  onDeselect,
  containerRef,
} = {}) => {
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionTimeoutRef = useRef(null);

  // Get current selection with position data
  const getSelectionData = useCallback(() => {
    const windowSelection = window.getSelection();
    const selectedText = windowSelection?.toString().trim();

    if (!selectedText || selectedText.length < minLength) {
      return null;
    }

    // Check if selection is within container
    if (containerRef?.current) {
      const anchorNode = windowSelection.anchorNode;
      if (!containerRef.current.contains(anchorNode)) {
        return null;
      }
    }

    try {
      const range = windowSelection.getRangeAt(0);
      const rects = Array.from(range.getClientRects());

      return {
        text: selectedText,
        rects: rects.map(rect => ({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
        })),
        range: {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
        },
      };
    } catch (e) {
      console.error('Error getting selection data:', e);
      return null;
    }
  }, [minLength, containerRef]);

  // Handle selection change
  const handleSelectionChange = useCallback(() => {
    // Debounce to avoid rapid updates during selection
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      const selectionData = getSelectionData();

      if (selectionData) {
        setSelection(selectionData);
        setIsSelecting(false);
        onSelect?.(selectionData);
      } else if (selection) {
        setSelection(null);
        onDeselect?.();
      }
    }, 100);
  }, [getSelectionData, selection, onSelect, onDeselect]);

  // Track selection start
  const handleMouseDown = useCallback(() => {
    setIsSelecting(true);
  }, []);

  // Track selection end
  const handleMouseUp = useCallback(() => {
    // Small delay to ensure selection is complete
    setTimeout(handleSelectionChange, 10);
  }, [handleSelectionChange]);

  // Clear selection programmatically
  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    onDeselect?.();
  }, [onDeselect]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelectionChange, handleMouseDown, handleMouseUp]);

  return {
    selection,
    isSelecting,
    clearSelection,
    getSelectionData,
  };
};

export default useTextSelection;
```

### 7.2 useHighlights.js - Highlight Management

**Location:** `src/hooks/useHighlights.js`

```javascript
import { useCallback, useMemo } from 'react';
import { useHighlightContext } from '../context/HighlightContext';

/**
 * Hook for managing highlights with additional utilities
 */
export const useHighlights = (lessonId) => {
  const context = useHighlightContext();

  // Get highlights for specific page
  const getHighlightsForPage = useCallback((pageNumber) => {
    return context.highlights.filter(h => h.pageNumber === pageNumber);
  }, [context.highlights]);

  // Get highlights by color
  const getHighlightsByColor = useCallback((color) => {
    return context.highlights.filter(h => h.color === color);
  }, [context.highlights]);

  // Get highlights with specific action type
  const getHighlightsWithAction = useCallback((actionType) => {
    return context.highlights.filter(h => 
      h.actions.some(a => a.type === actionType)
    );
  }, [context.highlights]);

  // Check if text overlaps with existing highlight
  const hasOverlappingHighlight = useCallback((selection) => {
    return context.highlights.some(highlight => {
      if (highlight.pageNumber !== selection.pageNumber) return false;
      
      // Simple overlap check based on text
      return highlight.text.includes(selection.text) || 
             selection.text.includes(highlight.text);
    });
  }, [context.highlights]);

  // Get all unique pages with highlights
  const pagesWithHighlights = useMemo(() => {
    return [...new Set(context.highlights.map(h => h.pageNumber))].sort((a, b) => a - b);
  }, [context.highlights]);

  // Get highlight statistics
  const stats = useMemo(() => ({
    total: context.highlights.length,
    byColor: {
      yellow: context.highlights.filter(h => h.color === 'yellow').length,
      green: context.highlights.filter(h => h.color === 'green').length,
      blue: context.highlights.filter(h => h.color === 'blue').length,
      pink: context.highlights.filter(h => h.color === 'pink').length,
      orange: context.highlights.filter(h => h.color === 'orange').length,
    },
    withActions: {
      chat: context.highlights.filter(h => h.actions.some(a => a.type === 'chat')).length,
      flashcard: context.highlights.filter(h => h.actions.some(a => a.type === 'flashcard')).length,
      video: context.highlights.filter(h => h.actions.some(a => a.type === 'video')).length,
      quiz: context.highlights.filter(h => h.actions.some(a => a.type === 'quiz')).length,
    },
  }), [context.highlights]);

  // Export highlights as JSON
  const exportHighlights = useCallback(() => {
    return JSON.stringify({
      lessonId,
      exportedAt: new Date().toISOString(),
      highlights: context.highlights,
    }, null, 2);
  }, [lessonId, context.highlights]);

  // Import highlights from JSON
  const importHighlights = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.highlights && Array.isArray(data.highlights)) {
        data.highlights.forEach(highlight => {
          context.addHighlight(highlight, highlight.color);
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import highlights:', e);
    }
    return false;
  }, [context]);

  return {
    ...context,
    getHighlightsForPage,
    getHighlightsByColor,
    getHighlightsWithAction,
    hasOverlappingHighlight,
    pagesWithHighlights,
    stats,
    exportHighlights,
    importHighlights,
  };
};

export default useHighlights;
```

### 7.3 useContextMenu.js - Context Menu Positioning

**Location:** `src/hooks/useContextMenu.js`

```javascript
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing context menu state and positioning
 */
export const useContextMenu = (containerRef) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetData, setTargetData] = useState(null);
  const menuRef = useRef(null);

  // Open context menu at position
  const openMenu = useCallback((x, y, data = null) => {
    setPosition({ x, y });
    setTargetData(data);
    setIsOpen(true);
  }, []);

  // Close context menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setTargetData(null);
  }, []);

  // Handle right-click
  const handleContextMenu = useCallback((e, data = null) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY, data);
  }, [openMenu]);

  // Handle long press (for mobile)
  const useLongPress = useCallback((callback, ms = 500) => {
    const timeoutRef = useRef(null);
    const targetRef = useRef(null);

    const start = useCallback((e) => {
      targetRef.current = e.target;
      timeoutRef.current = setTimeout(() => {
        const touch = e.touches?.[0] || e;
        callback(touch.clientX, touch.clientY);
      }, ms);
    }, [callback, ms]);

    const clear = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);

    return {
      onTouchStart: start,
      onTouchEnd: clear,
      onTouchMove: clear,
    };
  }, []);

  // Adjust position to stay within viewport
  const adjustPosition = useCallback(() => {
    if (!menuRef.current || !isOpen) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { x, y } = position;

    // Adjust horizontal position
    if (rect.right > viewport.width) {
      x = viewport.width - rect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (rect.bottom > viewport.height) {
      y = viewport.height - rect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    if (x !== position.x || y !== position.y) {
      setPosition({ x, y });
    }
  }, [isOpen, position]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  // Adjust position after render
  useEffect(() => {
    if (isOpen) {
      adjustPosition();
    }
  }, [isOpen, adjustPosition]);

  return {
    isOpen,
    position,
    targetData,
    menuRef,
    openMenu,
    closeMenu,
    handleContextMenu,
    useLongPress,
  };
};

export default useContextMenu;
```

---

## 8. PDF Rendering & Text Layer

### 8.1 PDF.js Configuration

**Location:** `src/utils/pdfConfig.js`

```javascript
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
// Option 1: CDN (simpler, requires internet)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Option 2: Local worker (for offline support)
// Copy pdf.worker.min.js to public folder and use:
// pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Configure text layer options
export const PDF_TEXT_LAYER_OPTIONS = {
  // Enable text layer for selection
  renderTextLayer: true,
  // Disable annotation layer (no links, forms)
  renderAnnotationLayer: false,
};

// Configure rendering options
export const PDF_RENDER_OPTIONS = {
  // Use high-quality rendering
  intent: 'display',
  // Enable sub-pixel rendering
  renderInteractiveForms: false,
};
```

### 8.2 Text Layer Styling

**Location:** `src/styles/pdf-text-layer.css`

```css
/* PDF Text Layer Styles */
.react-pdf__Page__textContent {
  /* Ensure text layer is positioned correctly */
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2; /* Make text layer slightly visible for debugging */
  line-height: 1.0;
  pointer-events: auto;
}

/* Make text selectable */
.react-pdf__Page__textContent span {
  color: transparent;
  position: absolute;
  white-space: pre;
  transform-origin: 0% 0%;
  cursor: text;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* Selection highlight */
.react-pdf__Page__textContent span::selection {
  background-color: rgba(0, 102, 204, 0.4);
}

.react-pdf__Page__textContent span::-moz-selection {
  background-color: rgba(0, 102, 204, 0.4);
}

/* PDF Page container */
.react-pdf__Page {
  position: relative;
  display: flex;
  justify-content: center;
}

.react-pdf__Page canvas {
  display: block;
}

/* Child-friendly selection color */
.pdf-page ::selection {
  background-color: rgba(255, 215, 0, 0.5); /* Gold/yellow highlight */
}

.pdf-page ::-moz-selection {
  background-color: rgba(255, 215, 0, 0.5);
}
```

---

## 9. Context Menu Actions

### 9.1 Action Handlers Configuration

**Location:** `src/constants/contextMenuConfig.js`

```javascript
/**
 * Context menu configuration for PDF text selection
 * Designed for K-6 children with friendly labels and emojis
 */

export const CONTEXT_MENU_ACTIONS = {
  CHAT: {
    id: 'chat',
    emoji: '💬',
    label: 'Ask Jeffrey',
    description: 'Chat about this text',
    color: 'bg-nanobanana-blue',
    highlightColor: 'blue',
    xpReward: 5,
  },
  FLASHCARD: {
    id: 'flashcard',
    emoji: '🃏',
    label: 'Make Flashcards',
    description: 'Turn into study cards',
    color: 'bg-nanobanana-yellow',
    highlightColor: 'yellow',
    xpReward: 15,
  },
  VIDEO: {
    id: 'video',
    emoji: '🎬',
    label: 'Explainer Video',
    description: 'Watch and learn!',
    color: 'bg-pink-400',
    highlightColor: 'pink',
    xpReward: 20,
    isPremium: true, // Only for Family Plus tier
  },
  QUIZ: {
    id: 'quiz',
    emoji: '📝',
    label: 'Create Quiz',
    description: 'Test your knowledge!',
    color: 'bg-nanobanana-green',
    highlightColor: 'green',
    xpReward: 10,
  },
  HIGHLIGHT: {
    id: 'highlight',
    emoji: '✨',
    label: 'Just Highlight',
    description: 'Save for later',
    color: 'bg-orange-400',
    highlightColor: 'orange',
    xpReward: 2,
  },
  COPY: {
    id: 'copy',
    emoji: '📋',
    label: 'Copy Text',
    description: 'Copy to clipboard',
    color: 'bg-gray-400',
    highlightColor: null, // Doesn't create highlight
    xpReward: 0,
  },
};

export const HIGHLIGHT_COLORS = {
  yellow: {
    name: 'Sunny Yellow',
    emoji: '☀️',
    bg: 'rgba(255, 235, 59, 0.4)',
    border: 'rgba(255, 235, 59, 0.8)',
  },
  green: {
    name: 'Grass Green',
    emoji: '🌱',
    bg: 'rgba(76, 175, 80, 0.4)',
    border: 'rgba(76, 175, 80, 0.8)',
  },
  blue: {
    name: 'Sky Blue',
    emoji: '🌊',
    bg: 'rgba(33, 150, 243, 0.4)',
    border: 'rgba(33, 150, 243, 0.8)',
  },
  pink: {
    name: 'Bubblegum Pink',
    emoji: '🌸',
    bg: 'rgba(233, 30, 99, 0.4)',
    border: 'rgba(233, 30, 99, 0.8)',
  },
  orange: {
    name: 'Tangerine Orange',
    emoji: '🍊',
    bg: 'rgba(255, 152, 0, 0.4)',
    border: 'rgba(255, 152, 0, 0.8)',
  },
};

// Minimum text length for different actions
export const MIN_TEXT_LENGTH = {
  chat: 5,        // "hello" minimum
  flashcard: 20,  // Needs enough content for a card
  video: 50,      // Needs substantial content for video
  quiz: 30,       // Needs content for question generation
  highlight: 3,   // Can highlight almost anything
  copy: 1,        // Can copy single characters
};

// Maximum text length for different actions
export const MAX_TEXT_LENGTH = {
  chat: 5000,
  flashcard: 2000,
  video: 3000,
  quiz: 2000,
  highlight: 10000,
  copy: Infinity,
};
```

### 9.2 Action Handler Implementations

**Location:** `src/utils/contextMenuHandlers.js`

```javascript
import { CONTEXT_MENU_ACTIONS, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from '../constants/contextMenuConfig';

/**
 * Validate if action can be performed on selection
 */
export const canPerformAction = (actionId, selection, userTier = 'free') => {
  const action = CONTEXT_MENU_ACTIONS[actionId.toUpperCase()];
  if (!action) return false;

  const textLength = selection.text.length;

  // Check text length requirements
  if (textLength < MIN_TEXT_LENGTH[actionId]) return false;
  if (textLength > MAX_TEXT_LENGTH[actionId]) return false;

  // Check premium requirement
  if (action.isPremium && userTier === 'free') return false;

  return true;
};

/**
 * Get action unavailability reason for UI feedback
 */
export const getActionUnavailableReason = (actionId, selection, userTier = 'free') => {
  const action = CONTEXT_MENU_ACTIONS[actionId.toUpperCase()];
  if (!action) return 'Unknown action';

  const textLength = selection.text.length;

  if (textLength < MIN_TEXT_LENGTH[actionId]) {
    return `Select more text! (at least ${MIN_TEXT_LENGTH[actionId]} characters)`;
  }

  if (textLength > MAX_TEXT_LENGTH[actionId]) {
    return `Text is too long! (max ${MAX_TEXT_LENGTH[actionId]} characters)`;
  }

  if (action.isPremium && userTier === 'free') {
    return 'Upgrade to Family Plus for this feature! ⭐';
  }

  return null;
};

/**
 * Create chat prompt from selection
 */
export const createChatPrompt = (selection, promptType = 'explain') => {
  const { text, pageNumber } = selection;

  const prompts = {
    explain: `Can you explain this to me in a simple way? Here's what I'm trying to understand:\n\n"${text}"`,
    simplify: `Can you make this easier to understand? I'm having trouble with:\n\n"${text}"`,
    examples: `Can you give me some fun examples about this?\n\n"${text}"`,
    quiz: `Can you ask me a question about this to see if I understand?\n\n"${text}"`,
    story: `Can you tell me a story that helps explain this?\n\n"${text}"`,
  };

  return prompts[promptType] || prompts.explain;
};

/**
 * Create flashcard generation request
 */
export const createFlashcardRequest = (selection, numCards = 3) => {
  return {
    sourceText: selection.text,
    pageNumber: selection.pageNumber,
    numCards,
    cardTypes: ['definition', 'question', 'fill-blank'],
    difficulty: 'age-appropriate', // System will adjust based on grade level
  };
};

/**
 * Create quiz generation request
 */
export const createQuizRequest = (selection, numQuestions = 5) => {
  return {
    sourceText: selection.text,
    pageNumber: selection.pageNumber,
    numQuestions,
    questionTypes: ['multiple-choice', 'true-false', 'fill-blank'],
    difficulty: 'adaptive',
  };
};

/**
 * Create video generation request
 */
export const createVideoRequest = (selection) => {
  return {
    sourceText: selection.text,
    pageNumber: selection.pageNumber,
    style: 'educational',
    duration: 'short', // 30-60 seconds
    voiceStyle: 'friendly',
    visualStyle: 'animated',
  };
};
```

---

## 10. Integration with Existing Systems

### 10.1 Update LessonContext - Add Jeffrey Communication

**Location:** Update `src/context/LessonContext.jsx`

Add the following to the existing LessonContext:

```jsx
// Add to existing actions
const ACTIONS = {
  // ... existing actions
  SEND_TO_CHAT: 'SEND_TO_CHAT',
  SET_CHAT_CONTEXT: 'SET_CHAT_CONTEXT',
};

// Add to reducer
case ACTIONS.SEND_TO_CHAT:
  return {
    ...state,
    pendingChatMessage: action.payload,
  };

case ACTIONS.SET_CHAT_CONTEXT:
  return {
    ...state,
    chatContext: {
      ...state.chatContext,
      ...action.payload,
    },
  };

// Add to provider value
const sendToJeffrey = useCallback((text, promptType = 'explain') => {
  const prompt = createChatPrompt({ text }, promptType);
  dispatch({
    type: ACTIONS.SEND_TO_CHAT,
    payload: {
      text,
      prompt,
      promptType,
      timestamp: new Date().toISOString(),
    },
  });
}, []);

const setChatContext = useCallback((context) => {
  dispatch({
    type: ACTIONS.SET_CHAT_CONTEXT,
    payload: context,
  });
}, []);
```

### 10.2 Update ChatInterface - Handle Incoming Selections

**Location:** Update `src/components/Chat/ChatInterface.jsx`

Add support for receiving selected text:

```jsx
import SelectedTextPreview from '../PDF/SelectedTextPreview';
import { useHighlightContext } from '../../context/HighlightContext';

// Inside ChatInterface component:
const { currentSelection } = useHighlightContext();
const { pendingChatMessage } = useLessonContext();

// Handle incoming chat messages from selections
useEffect(() => {
  if (pendingChatMessage) {
    // Auto-populate input or send message
    setInput(pendingChatMessage.prompt);
    // Optionally auto-send
    // handleSend();
  }
}, [pendingChatMessage]);

// Add SelectedTextPreview above input area
return (
  <div className="flex flex-col h-full">
    {/* ... existing chat messages ... */}

    {/* Selected Text Preview - shows when text is selected in PDF */}
    <SelectedTextPreview 
      onSendToChat={(text) => {
        setInput(`Can you explain this? "${text}"`);
      }}
    />

    {/* ... existing input area ... */}
  </div>
);
```

### 10.3 Update StudyPage - Integrate PDF Viewer

**Location:** Update `src/pages/StudyPage.jsx`

```jsx
import PDFViewer from '../components/PDF/PDFViewer';
import { HighlightProvider } from '../context/HighlightContext';

const StudyPage = () => {
  const { currentLesson } = useLessonContext();

  return (
    <HighlightProvider lessonId={currentLesson?.id}>
      <div className="flex h-screen">
        {/* Left Pane - PDF Viewer */}
        <div className="w-3/5 p-4">
          {currentLesson?.type === 'pdf' ? (
            <PDFViewer
              pdfUrl={currentLesson.fileUrl}
              lessonId={currentLesson.id}
              onTextSelected={(selection) => {
                console.log('Selected:', selection);
              }}
            />
          ) : (
            <LessonView lesson={currentLesson} />
          )}
        </div>

        {/* Right Pane - Chat */}
        <div className="w-2/5 border-l-4 border-black">
          <ChatInterface lesson={currentLesson} />
        </div>
      </div>
    </HighlightProvider>
  );
};
```

### 10.4 Integration with Flashcard System

**Location:** Update `src/context/FlashcardContext.jsx`

Add method for generating flashcards from highlighted text:

```jsx
const generateFlashcardsFromText = useCallback(async (text, options = {}) => {
  const { numCards = 3, deckId, createNewDeck = false } = options;

  setIsGenerating(true);

  try {
    // Call AI service to generate flashcards
    const cards = await geminiService.generateFlashcards({
      sourceText: text,
      numCards,
      gradeLevel: currentUser.gradeLevel,
    });

    // Create new deck if needed
    let targetDeckId = deckId;
    if (createNewDeck || !deckId) {
      const newDeck = await createDeck({
        name: `From Highlight - ${new Date().toLocaleDateString()}`,
        subject: 'General',
        source: 'highlight',
      });
      targetDeckId = newDeck.id;
    }

    // Add cards to deck
    for (const card of cards) {
      await addCard(targetDeckId, {
        front: card.question,
        back: card.answer,
        type: card.type,
        sourceText: text,
      });
    }

    // Award XP for creating flashcards
    addXP(15 * cards.length, 'flashcard_create');

    return { deckId: targetDeckId, cardsCreated: cards.length };
  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    throw error;
  } finally {
    setIsGenerating(false);
  }
}, [addCard, createDeck, addXP, currentUser]);
```

### 10.5 Integration with Gamification System

**Location:** Update gamification triggers in highlight actions

```jsx
// In ContextMenu.jsx or action handlers
import { useGamificationContext } from '../../context/GamificationContext';

const { addXP, checkAchievements } = useGamificationContext();

// After successful action
const handleChatAction = async () => {
  const highlight = addHighlight(selection, 'blue');
  await sendToJeffrey(selection.text, 'explain');
  recordAction(highlight.id, 'chat');
  
  // Award XP
  addXP(5, 'highlight_chat');
  
  // Check for highlight-related achievements
  checkAchievements({
    type: 'highlight',
    action: 'chat',
    totalHighlights: highlights.length + 1,
  });
  
  onClose();
};
```

---

## 11. Animations & Feedback

### 11.1 Highlight Animation Variants

**Location:** `src/components/PDF/animations.js`

```javascript
import { keyframes } from 'framer-motion';

// Highlight appearance animation
export const highlightVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
};

// Context menu animation
export const menuVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

// Menu item stagger animation
export const menuItemVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  }),
};

// Selection popup animation
export const popupVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.9,
  },
};

// Success celebration animation
export const celebrateVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [−180, 10, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
    },
  },
};
```

### 11.2 Sound Effects Integration

**Location:** Add to `src/hooks/useHighlightSounds.js`

```javascript
import useSound from 'use-sound';

export const useHighlightSounds = () => {
  const [playHighlight] = useSound('/sounds/highlight.mp3', { volume: 0.5 });
  const [playMenuOpen] = useSound('/sounds/menu-open.mp3', { volume: 0.3 });
  const [playAction] = useSound('/sounds/action-success.mp3', { volume: 0.5 });
  const [playError] = useSound('/sounds/error.mp3', { volume: 0.3 });

  return {
    playHighlight,
    playMenuOpen,
    playAction,
    playError,
  };
};
```

---

## 12. Child Safety & UX Considerations

### 12.1 Safety Guidelines

```javascript
/**
 * Child Safety Checks for Highlighted Text
 * Ensures content processed through AI is appropriate
 */

// Content filtering before sending to AI
export const sanitizeSelectionForAI = (text) => {
  // Remove any potential PII patterns
  const sanitized = text
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]') // Phone numbers
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
    .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[ID]'); // SSN-like patterns

  return sanitized;
};

// Check if selection is appropriate for processing
export const isSelectionSafe = (text) => {
  const lowercaseText = text.toLowerCase();
  
  // Basic safety checks (expand based on needs)
  const flaggedPatterns = [
    // Add patterns that shouldn't be processed
  ];

  return !flaggedPatterns.some(pattern => pattern.test(lowercaseText));
};
```

### 12.2 UX Guidelines for K-6

```javascript
/**
 * UX Constants for Child-Friendly Design
 */

export const CHILD_UX_CONFIG = {
  // Minimum touch target size (px)
  MIN_TOUCH_TARGET: 44,
  
  // Animation duration limits (ms)
  MAX_ANIMATION_DURATION: 500,
  
  // Text limits for display
  MAX_PREVIEW_LENGTH: 100,
  
  // Colors optimized for readability
  CONTRAST_RATIO: 4.5,
  
  // Feedback timing
  FEEDBACK_DELAY: 100,
  CELEBRATION_DURATION: 2000,
  
  // Font sizes
  MIN_FONT_SIZE: 14,
  PREFERRED_FONT_SIZE: 16,
  
  // Simplify labels based on age
  LABELS: {
    K_2: {
      chat: 'Talk to Jeffrey',
      flashcard: 'Make Cards',
      video: 'Watch Video',
      quiz: 'Play Quiz',
      highlight: 'Color It',
      copy: 'Save It',
    },
    3_6: {
      chat: 'Ask Jeffrey',
      flashcard: 'Make Flashcards',
      video: 'Explainer Video',
      quiz: 'Create Quiz',
      highlight: 'Highlight',
      copy: 'Copy Text',
    },
  },
};
```

---

## 13. Testing Checklist

### Functionality Tests

- [ ] **PDF Loading**
  - [ ] PDF loads without errors
  - [ ] Loading animation displays
  - [ ] Error state shows for invalid PDFs
  - [ ] Multi-page PDFs navigate correctly

- [ ] **Text Selection**
  - [ ] Text can be selected via mouse drag
  - [ ] Text can be selected via touch (long press)
  - [ ] Selection is visually highlighted
  - [ ] Selection popup appears
  - [ ] Minimum text length enforced

- [ ] **Context Menu**
  - [ ] Menu opens on right-click
  - [ ] Menu opens on long-press (mobile)
  - [ ] Menu positions within viewport
  - [ ] Menu closes on outside click
  - [ ] Menu closes on Escape key
  - [ ] All menu items render correctly
  - [ ] Menu items show loading state

- [ ] **Highlight Creation**
  - [ ] Highlights persist after page navigation
  - [ ] Highlights persist after refresh (localStorage)
  - [ ] Multiple highlights can coexist
  - [ ] Highlights display correct colors
  - [ ] Overlapping highlights handled

- [ ] **Action Integration**
  - [ ] "Ask Jeffrey" sends text to chat
  - [ ] "Make Flashcards" generates cards
  - [ ] "Create Quiz" initiates quiz generation
  - [ ] "Explainer Video" triggers video creation
  - [ ] "Copy Text" copies to clipboard
  - [ ] Actions record to highlight history

- [ ] **Chat Integration**
  - [ ] Selected text preview appears in chat pane
  - [ ] "Send to Jeffrey" populates chat input
  - [ ] Jeffrey responds contextually
  - [ ] Chat history includes selection context

- [ ] **Gamification Integration**
  - [ ] XP awarded for actions
  - [ ] Achievements trigger for milestones
  - [ ] Stats update correctly

### Edge Cases

- [ ] Very long text selections (5000+ chars)
- [ ] Single character selections
- [ ] Multi-page selections (if supported)
- [ ] Rapid selection/deselection
- [ ] Context menu during page turn
- [ ] Multiple context menus (shouldn't happen)
- [ ] PDF with no selectable text
- [ ] PDF with images only
- [ ] Network failure during AI actions

### Performance

- [ ] PDF renders without lag
- [ ] Smooth scroll on large PDFs
- [ ] Highlight layer doesn't impact scroll
- [ ] Context menu appears quickly
- [ ] No memory leaks on page changes

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Touch targets meet 44px minimum
- [ ] Focus indicators visible

### Mobile/Tablet

- [ ] Touch selection works
- [ ] Long-press triggers menu
- [ ] Pinch zoom works
- [ ] Menu positions correctly on small screens
- [ ] Buttons are appropriately sized

---

## Summary

This implementation provides:

1. **PDFViewer** - Full PDF rendering with text layer and navigation
2. **HighlightContext** - Centralized state for selections and highlights
3. **ContextMenu** - Child-friendly action menu with emojis
4. **SelectionPopup** - Quick action toolbar after selection
5. **SelectedTextPreview** - Shows selection in chat pane
6. **Integration hooks** - Connect to flashcards, chat, gamification
7. **Text selection utilities** - Robust selection handling
8. **Child safety** - Content filtering and UX guidelines

**Estimated implementation time:** 6-8 days for a developer familiar with React and PDF.js.

**Key Dependencies:**
- react-pdf (PDF rendering)
- pdfjs-dist (text layer)
- @floating-ui/react (positioning)
- framer-motion (animations)

**Next Steps After Implementation:**
1. Add actual sound effect files
2. Connect to real Gemini API for action handlers
3. Implement quiz generation system
4. Add video explainer generation
5. Create highlight export/import for study sharing
6. Add collaborative highlighting (future feature)
7. Implement offline highlight sync
8. Add parent view of highlighted content
