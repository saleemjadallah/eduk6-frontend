# Flashcard System Implementation Plan
## K-6 AI Learning Platform - Option C

**Goal:** Create an engaging flashcard system that generates cards from lesson content using AI, presents them in a child-friendly swipeable interface, and implements spaced repetition for optimal learning retention—all while integrating with the existing gamification system to reward progress.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [New Dependencies](#2-new-dependencies)
3. [File Structure](#3-file-structure)
4. [Data Models](#4-data-models)
5. [Context Setup](#5-context-setup)
6. [Component Implementations](#6-component-implementations)
7. [Hook Implementations](#7-hook-implementations)
8. [Spaced Repetition Algorithm](#8-spaced-repetition-algorithm)
9. [AI Flashcard Generation](#9-ai-flashcard-generation)
10. [Integration with Existing Systems](#10-integration-with-existing-systems)
11. [Animations & Sound Effects](#11-animations--sound-effects)
12. [Testing Checklist](#12-testing-checklist)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLASHCARD SYSTEM FLOW                                │
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   GENERATE   │ ──▶│    STUDY     │ ──▶│    REVIEW    │                  │
│   │              │    │              │    │              │                  │
│   │ • From Lesson│    │ • Swipe Cards│    │ • SR Schedule│                  │
│   │ • AI-Powered │    │ • Know/Don't │    │ • Due Cards  │                  │
│   │ • Custom     │    │ • Animations │    │ • Progress   │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                   │                          │
│          ▼                   ▼                   ▼                          │
│   ┌────────────────────────────────────────────────────────────────┐        │
│   │                    FLASHCARD CONTEXT                            │        │
│   │  • Deck management (create, update, delete)                     │        │
│   │  • Card state (front/back, known/unknown)                       │        │
│   │  • Spaced repetition data (intervals, ease factors)             │        │
│   │  • Study session tracking                                       │        │
│   └────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│          ┌───────────────────┼───────────────────┐                          │
│          ▼                   ▼                   ▼                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Lesson     │    │ Gamification │    │  localStorage │                  │
│   │   Context    │    │   Context    │    │  + Backend   │                  │
│   │              │    │              │    │              │                  │
│   │ Source cards │    │ Award XP     │    │ Persist data │                  │
│   │ from lessons │    │ Track badges │    │ Sync state   │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SWIPE INTERACTION MODEL                              │
│                                                                              │
│                        ┌─────────────────┐                                  │
│                        │   FLASHCARD     │                                  │
│                        │                 │                                  │
│                        │   ┌─────────┐   │                                  │
│                        │   │  FRONT  │   │                                  │
│                        │   │  /BACK  │   │                                  │
│                        │   └─────────┘   │                                  │
│                        │       TAP       │                                  │
│                        │     TO FLIP     │                                  │
│                        └─────────────────┘                                  │
│                               │                                              │
│              ┌────────────────┼────────────────┐                            │
│              │                │                │                            │
│              ▼                ▼                ▼                            │
│       ← SWIPE LEFT      TAP CENTER      SWIPE RIGHT →                      │
│       ┌──────────┐      ┌──────────┐      ┌──────────┐                      │
│       │ DON'T    │      │   FLIP   │      │  KNOW    │                      │
│       │ KNOW 😕  │      │   CARD   │      │  IT! 🎉  │                      │
│       │          │      │          │      │          │                      │
│       │ Schedule │      │ Show     │      │ Increase │                      │
│       │ sooner   │      │ answer   │      │ interval │                      │
│       └──────────┘      └──────────┘      └──────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPACED REPETITION (SM-2 SIMPLIFIED)                       │
│                                                                              │
│   Review 1 ──▶ Review 2 ──▶ Review 3 ──▶ Review 4 ──▶ Review N              │
│      │            │            │            │            │                  │
│   1 day        3 days       7 days       14 days      × EF                  │
│                                                                              │
│   EF (Ease Factor): 1.3 → 2.5 (adjusted by performance)                     │
│   • Know it = EF + 0.1 (easier next time)                                   │
│   • Don't know = EF - 0.2 (review sooner)                                   │
│                                                                              │
│   For K-6 children, we use a SIMPLIFIED version:                            │
│   • "Got it!" → Next review in current_interval × 2                         │
│   • "Still learning" → Review again in 1-10 minutes                         │
│   • Minimum interval: 1 day, Maximum: 30 days (age-appropriate)             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-spring": "^9.7.3",
    "react-use-gesture": "^9.1.3",
    "@use-gesture/react": "^10.3.0",
    "use-sound": "^4.0.1"
  }
}
```

**Installation command:**
```bash
npm install react-spring @use-gesture/react use-sound
```

**Libraries explained:**
- `react-spring`: Physics-based animations for smooth card flipping and swiping
- `@use-gesture/react`: Touch gesture handling for swipe interactions
- `use-sound`: Simple hook for playing celebration and feedback sounds

**Note:** These are lightweight and performant for mobile devices, critical for the K-6 audience who primarily use tablets/phones.

---

## 3. File Structure

Create the following new files:

```
src/
├── context/
│   └── FlashcardContext.jsx          # NEW - Deck & card state management
│
├── components/
│   └── Flashcard/
│       ├── FlashcardDeck.jsx         # NEW - Main swipeable deck container
│       ├── FlashcardCard.jsx         # NEW - Individual card with flip
│       ├── SwipeableCard.jsx         # NEW - Swipe gesture wrapper
│       ├── FlashcardGenerator.jsx    # NEW - AI generation interface
│       ├── DeckSelector.jsx          # NEW - Choose which deck to study
│       ├── DeckCreator.jsx           # NEW - Manual card creation
│       ├── StudySession.jsx          # NEW - Active study screen
│       ├── SessionComplete.jsx       # NEW - End of session celebration
│       ├── DueCardsIndicator.jsx     # NEW - Badge showing cards due
│       ├── CardProgress.jsx          # NEW - Progress through current deck
│       └── FlashcardStats.jsx        # NEW - Deck statistics
│
├── pages/
│   ├── FlashcardsPage.jsx            # NEW - Main flashcards hub
│   └── StudySessionPage.jsx          # NEW - Full-screen study mode
│
├── hooks/
│   ├── useFlashcards.js              # NEW - Flashcard operations
│   ├── useSpacedRepetition.js        # NEW - SR algorithm implementation
│   ├── useSwipeGesture.js            # NEW - Swipe handling logic
│   ├── useCardFlip.js                # NEW - Flip animation state
│   └── useStudySession.js            # NEW - Session management
│
├── utils/
│   ├── spacedRepetition.js           # NEW - SM-2 algorithm functions
│   ├── flashcardGenerator.js         # NEW - AI prompt templates
│   └── deckUtils.js                  # NEW - Deck manipulation helpers
│
├── constants/
│   └── flashcardConstants.js         # NEW - SR parameters, card types
│
└── assets/
    └── sounds/
        ├── card-flip.mp3             # NEW - Card flip sound
        ├── swipe-right.mp3           # NEW - Correct answer sound
        ├── swipe-left.mp3            # NEW - Wrong answer sound
        └── session-complete.mp3      # NEW - Session end celebration
```

---

## 4. Data Models

### 4.1 Flashcard Data Schema

```typescript
interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  subject: 'math' | 'science' | 'english' | 'arabic' | 'islamic' | 'social' | 'other';
  lessonId?: string;              // Link to source lesson if AI-generated
  createdAt: string;              // ISO timestamp
  updatedAt: string;
  cards: Flashcard[];
  settings: DeckSettings;
  statistics: DeckStatistics;
}

interface Flashcard {
  id: string;
  deckId: string;
  front: CardContent;
  back: CardContent;
  hint?: string;                  // Optional hint for struggling learners
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];                 // e.g., ['vocabulary', 'chapter-3']
  createdAt: string;
  
  // Spaced Repetition Data
  sr: SpacedRepetitionData;
}

interface CardContent {
  type: 'text' | 'image' | 'audio' | 'mixed';
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  emoji?: string;                 // Visual enhancement for kids
}

interface SpacedRepetitionData {
  interval: number;               // Days until next review
  easeFactor: number;             // 1.3 - 2.5 (SM-2)
  repetitions: number;            // Consecutive correct answers
  dueDate: string;                // ISO date when card is due
  lastReviewed?: string;          // ISO timestamp of last review
  status: 'new' | 'learning' | 'review' | 'mastered';
}

interface DeckSettings {
  newCardsPerDay: number;         // Default: 10
  reviewsPerDay: number;          // Default: 50
  showHints: boolean;             // Show hints after wrong answer
  autoPlayAudio: boolean;         // Auto-play TTS for cards
  shuffleCards: boolean;          // Randomize order
  celebrationLevel: 'minimal' | 'normal' | 'party'; // Animation intensity
}

interface DeckStatistics {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  averageEaseFactor: number;
  studySessions: number;
  totalReviews: number;
  correctRate: number;            // 0-100 percentage
  streakDays: number;             // Consecutive days studying this deck
}

interface StudySession {
  id: string;
  deckId: string;
  startedAt: string;
  completedAt?: string;
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  xpEarned: number;
  duration: number;               // Seconds
  cardResults: CardResult[];
}

interface CardResult {
  cardId: string;
  response: 'correct' | 'incorrect';
  responseTime: number;           // Milliseconds
  previousInterval: number;
  newInterval: number;
}
```

---

## 5. Context Setup

### 5.1 FlashcardContext.jsx

**Location:** `src/context/FlashcardContext.jsx`

```jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calculateNextReview, getCardsForStudy } from '../utils/spacedRepetition';
import { DEFAULT_DECK_SETTINGS, DEFAULT_SR_DATA } from '../constants/flashcardConstants';

// Initial state
const initialState = {
  decks: [],
  currentDeck: null,
  currentSession: null,
  studyQueue: [],           // Cards to study in current session
  currentCardIndex: 0,
  isFlipped: false,
  isLoading: false,
  error: null,
};

// Action types
const ACTIONS = {
  // Deck management
  ADD_DECK: 'ADD_DECK',
  UPDATE_DECK: 'UPDATE_DECK',
  DELETE_DECK: 'DELETE_DECK',
  SET_CURRENT_DECK: 'SET_CURRENT_DECK',
  
  // Card management
  ADD_CARDS: 'ADD_CARDS',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  
  // Study session
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  RECORD_ANSWER: 'RECORD_ANSWER',
  NEXT_CARD: 'NEXT_CARD',
  FLIP_CARD: 'FLIP_CARD',
  RESET_FLIP: 'RESET_FLIP',
  
  // State management
  LOAD_DATA: 'LOAD_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function flashcardReducer(state, action) {
  switch (action.type) {
    // Deck Management
    case ACTIONS.ADD_DECK: {
      const newDeck = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cards: [],
        settings: DEFAULT_DECK_SETTINGS,
        statistics: {
          totalCards: 0,
          newCards: 0,
          learningCards: 0,
          reviewCards: 0,
          masteredCards: 0,
          averageEaseFactor: 2.5,
          studySessions: 0,
          totalReviews: 0,
          correctRate: 0,
          streakDays: 0,
        },
        ...action.payload,
      };
      return {
        ...state,
        decks: [...state.decks, newDeck],
      };
    }

    case ACTIONS.UPDATE_DECK: {
      return {
        ...state,
        decks: state.decks.map(deck =>
          deck.id === action.payload.id
            ? { ...deck, ...action.payload, updatedAt: new Date().toISOString() }
            : deck
        ),
        currentDeck: state.currentDeck?.id === action.payload.id
          ? { ...state.currentDeck, ...action.payload }
          : state.currentDeck,
      };
    }

    case ACTIONS.DELETE_DECK: {
      return {
        ...state,
        decks: state.decks.filter(deck => deck.id !== action.payload),
        currentDeck: state.currentDeck?.id === action.payload ? null : state.currentDeck,
      };
    }

    case ACTIONS.SET_CURRENT_DECK: {
      const deck = state.decks.find(d => d.id === action.payload);
      return {
        ...state,
        currentDeck: deck || null,
      };
    }

    // Card Management
    case ACTIONS.ADD_CARDS: {
      const { deckId, cards } = action.payload;
      const newCards = cards.map(card => ({
        id: uuidv4(),
        deckId,
        createdAt: new Date().toISOString(),
        sr: { ...DEFAULT_SR_DATA },
        difficulty: 'medium',
        tags: [],
        ...card,
      }));

      return {
        ...state,
        decks: state.decks.map(deck => {
          if (deck.id !== deckId) return deck;
          
          const updatedCards = [...deck.cards, ...newCards];
          return {
            ...deck,
            cards: updatedCards,
            updatedAt: new Date().toISOString(),
            statistics: {
              ...deck.statistics,
              totalCards: updatedCards.length,
              newCards: updatedCards.filter(c => c.sr.status === 'new').length,
            },
          };
        }),
      };
    }

    case ACTIONS.UPDATE_CARD: {
      const { deckId, cardId, updates } = action.payload;
      return {
        ...state,
        decks: state.decks.map(deck => {
          if (deck.id !== deckId) return deck;
          return {
            ...deck,
            cards: deck.cards.map(card =>
              card.id === cardId ? { ...card, ...updates } : card
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case ACTIONS.DELETE_CARD: {
      const { deckId, cardId } = action.payload;
      return {
        ...state,
        decks: state.decks.map(deck => {
          if (deck.id !== deckId) return deck;
          const updatedCards = deck.cards.filter(c => c.id !== cardId);
          return {
            ...deck,
            cards: updatedCards,
            statistics: {
              ...deck.statistics,
              totalCards: updatedCards.length,
            },
          };
        }),
      };
    }

    // Study Session
    case ACTIONS.START_SESSION: {
      const { deckId, cards } = action.payload;
      return {
        ...state,
        currentSession: {
          id: uuidv4(),
          deckId,
          startedAt: new Date().toISOString(),
          cardsStudied: 0,
          cardsCorrect: 0,
          cardsIncorrect: 0,
          xpEarned: 0,
          duration: 0,
          cardResults: [],
        },
        studyQueue: cards,
        currentCardIndex: 0,
        isFlipped: false,
      };
    }

    case ACTIONS.END_SESSION: {
      if (!state.currentSession) return state;
      
      const completedSession = {
        ...state.currentSession,
        completedAt: new Date().toISOString(),
        duration: Math.floor(
          (Date.now() - new Date(state.currentSession.startedAt).getTime()) / 1000
        ),
      };

      // Update deck statistics
      const deckId = state.currentSession.deckId;
      return {
        ...state,
        decks: state.decks.map(deck => {
          if (deck.id !== deckId) return deck;
          return {
            ...deck,
            statistics: {
              ...deck.statistics,
              studySessions: deck.statistics.studySessions + 1,
              totalReviews: deck.statistics.totalReviews + completedSession.cardsStudied,
              correctRate: calculateCorrectRate(deck.statistics, completedSession),
            },
          };
        }),
        currentSession: null,
        studyQueue: [],
        currentCardIndex: 0,
        isFlipped: false,
      };
    }

    case ACTIONS.RECORD_ANSWER: {
      const { correct, responseTime } = action.payload;
      const currentCard = state.studyQueue[state.currentCardIndex];
      
      if (!currentCard || !state.currentSession) return state;

      // Calculate new SR values
      const newSR = calculateNextReview(currentCard.sr, correct);

      // Update the card in the deck
      const updatedDecks = state.decks.map(deck => {
        if (deck.id !== currentCard.deckId) return deck;
        return {
          ...deck,
          cards: deck.cards.map(card =>
            card.id === currentCard.id
              ? { ...card, sr: newSR }
              : card
          ),
        };
      });

      // Update session stats
      const cardResult = {
        cardId: currentCard.id,
        response: correct ? 'correct' : 'incorrect',
        responseTime,
        previousInterval: currentCard.sr.interval,
        newInterval: newSR.interval,
      };

      return {
        ...state,
        decks: updatedDecks,
        currentSession: {
          ...state.currentSession,
          cardsStudied: state.currentSession.cardsStudied + 1,
          cardsCorrect: correct 
            ? state.currentSession.cardsCorrect + 1 
            : state.currentSession.cardsCorrect,
          cardsIncorrect: !correct 
            ? state.currentSession.cardsIncorrect + 1 
            : state.currentSession.cardsIncorrect,
          xpEarned: state.currentSession.xpEarned + (correct ? 5 : 2),
          cardResults: [...state.currentSession.cardResults, cardResult],
        },
        // Update the card in study queue too
        studyQueue: state.studyQueue.map((card, idx) =>
          idx === state.currentCardIndex
            ? { ...card, sr: newSR }
            : card
        ),
      };
    }

    case ACTIONS.NEXT_CARD: {
      return {
        ...state,
        currentCardIndex: state.currentCardIndex + 1,
        isFlipped: false,
      };
    }

    case ACTIONS.FLIP_CARD: {
      return {
        ...state,
        isFlipped: !state.isFlipped,
      };
    }

    case ACTIONS.RESET_FLIP: {
      return {
        ...state,
        isFlipped: false,
      };
    }

    // State Management
    case ACTIONS.LOAD_DATA: {
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    }

    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    }

    case ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    default:
      return state;
  }
}

// Helper function
function calculateCorrectRate(currentStats, session) {
  const totalCorrect = (currentStats.correctRate / 100 * currentStats.totalReviews) + session.cardsCorrect;
  const totalReviews = currentStats.totalReviews + session.cardsStudied;
  return totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
}

// Context
const FlashcardContext = createContext(null);

// Provider component
export function FlashcardProvider({ children }) {
  const [state, dispatch] = useReducer(flashcardReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('flashcardData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
      } catch (error) {
        console.error('Error loading flashcard data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      decks: state.decks,
    };
    localStorage.setItem('flashcardData', JSON.stringify(dataToSave));
  }, [state.decks]);

  // Action creators
  const createDeck = useCallback((deckData) => {
    dispatch({ type: ACTIONS.ADD_DECK, payload: deckData });
  }, []);

  const updateDeck = useCallback((deckId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_DECK, payload: { id: deckId, ...updates } });
  }, []);

  const deleteDeck = useCallback((deckId) => {
    dispatch({ type: ACTIONS.DELETE_DECK, payload: deckId });
  }, []);

  const setCurrentDeck = useCallback((deckId) => {
    dispatch({ type: ACTIONS.SET_CURRENT_DECK, payload: deckId });
  }, []);

  const addCards = useCallback((deckId, cards) => {
    dispatch({ type: ACTIONS.ADD_CARDS, payload: { deckId, cards } });
  }, []);

  const updateCard = useCallback((deckId, cardId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_CARD, payload: { deckId, cardId, updates } });
  }, []);

  const deleteCard = useCallback((deckId, cardId) => {
    dispatch({ type: ACTIONS.DELETE_CARD, payload: { deckId, cardId } });
  }, []);

  const startSession = useCallback((deckId) => {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;

    const cards = getCardsForStudy(deck.cards, deck.settings);
    if (cards.length === 0) return;

    dispatch({ type: ACTIONS.START_SESSION, payload: { deckId, cards } });
  }, [state.decks]);

  const endSession = useCallback(() => {
    dispatch({ type: ACTIONS.END_SESSION });
  }, []);

  const recordAnswer = useCallback((correct, responseTime = 0) => {
    dispatch({ type: ACTIONS.RECORD_ANSWER, payload: { correct, responseTime } });
  }, []);

  const nextCard = useCallback(() => {
    dispatch({ type: ACTIONS.NEXT_CARD });
  }, []);

  const flipCard = useCallback(() => {
    dispatch({ type: ACTIONS.FLIP_CARD });
  }, []);

  const resetFlip = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_FLIP });
  }, []);

  // Computed values
  const currentCard = state.studyQueue[state.currentCardIndex] || null;
  const isSessionComplete = state.currentSession && 
    state.currentCardIndex >= state.studyQueue.length;
  const sessionProgress = state.studyQueue.length > 0
    ? (state.currentCardIndex / state.studyQueue.length) * 100
    : 0;

  // Get total due cards across all decks
  const totalDueCards = state.decks.reduce((total, deck) => {
    const dueCards = deck.cards.filter(card => {
      const dueDate = new Date(card.sr.dueDate);
      return dueDate <= new Date();
    });
    return total + dueCards.length;
  }, 0);

  const value = {
    // State
    ...state,
    currentCard,
    isSessionComplete,
    sessionProgress,
    totalDueCards,
    
    // Actions
    createDeck,
    updateDeck,
    deleteDeck,
    setCurrentDeck,
    addCards,
    updateCard,
    deleteCard,
    startSession,
    endSession,
    recordAnswer,
    nextCard,
    flipCard,
    resetFlip,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

// Hook
export function useFlashcardContext() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcardContext must be used within a FlashcardProvider');
  }
  return context;
}

export default FlashcardContext;
```

### 5.2 Update App.jsx with FlashcardProvider

**Update:** `src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import StudySessionPage from './pages/StudySessionPage';

function App() {
    return (
        <LessonProvider>
            <GamificationProvider>
                <FlashcardProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/study" element={<StudyPage />} />
                            <Route path="/achievements" element={<AchievementsPage />} />
                            <Route path="/flashcards" element={<FlashcardsPage />} />
                            <Route path="/flashcards/study/:deckId" element={<StudySessionPage />} />
                        </Routes>
                    </Router>
                </FlashcardProvider>
            </GamificationProvider>
        </LessonProvider>
    );
}

export default App;
```

---

## 6. Component Implementations

### 6.1 FlashcardCard.jsx - The Flippable Card

**Location:** `src/components/Flashcard/FlashcardCard.jsx`

```jsx
import React from 'react';
import { animated, useSpring } from 'react-spring';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb } from 'lucide-react';

const FlashcardCard = ({ 
  card, 
  isFlipped, 
  onFlip, 
  showHint = false,
  onPlayAudio,
  compact = false 
}) => {
  // 3D flip animation
  const { transform, opacity } = useSpring({
    opacity: isFlipped ? 1 : 0,
    transform: `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const cardSize = compact ? 'h-48 w-72' : 'h-72 w-80 md:h-80 md:w-96';

  const renderContent = (content, side) => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        {/* Emoji decoration */}
        {content.emoji && (
          <span className="text-5xl mb-4">{content.emoji}</span>
        )}
        
        {/* Image */}
        {content.imageUrl && (
          <img 
            src={content.imageUrl} 
            alt={content.text || 'Flashcard image'}
            className="max-h-32 max-w-full object-contain rounded-xl border-2 border-black mb-4"
          />
        )}
        
        {/* Text */}
        {content.text && (
          <p className={`font-bold font-comic ${compact ? 'text-lg' : 'text-2xl'} leading-relaxed`}>
            {content.text}
          </p>
        )}
        
        {/* Audio button */}
        {content.audioUrl && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio?.(content.audioUrl);
            }}
            className="mt-4 p-2 bg-nanobanana-blue text-white rounded-full border-2 border-black hover:scale-110 transition-transform"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
        
        {/* Side indicator */}
        <div className={`absolute ${side === 'front' ? 'bottom-4' : 'top-4'} text-xs font-bold text-gray-400`}>
          {side === 'front' ? 'TAP TO REVEAL' : 'ANSWER'}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`relative ${cardSize} cursor-pointer select-none`}
      onClick={onFlip}
    >
      {/* Front of card */}
      <animated.div
        style={{
          opacity: opacity.to(o => 1 - o),
          transform,
          rotateY: '0deg',
        }}
        className={`
          absolute inset-0 ${cardSize}
          bg-gradient-to-br from-nanobanana-yellow to-yellow-300
          rounded-3xl border-4 border-black
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          backface-hidden overflow-hidden
        `}
      >
        {renderContent(card.front, 'front')}
        
        {/* Difficulty indicator */}
        <div className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold border-2 border-black
          ${card.difficulty === 'easy' ? 'bg-green-300' : 
            card.difficulty === 'hard' ? 'bg-red-300' : 'bg-blue-300'}
        `}>
          {card.difficulty === 'easy' ? '⭐' : card.difficulty === 'hard' ? '🔥' : '📚'}
        </div>
      </animated.div>

      {/* Back of card */}
      <animated.div
        style={{
          opacity,
          transform: transform.to(t => `${t} rotateY(180deg)`),
        }}
        className={`
          absolute inset-0 ${cardSize}
          bg-gradient-to-br from-nanobanana-green to-green-400
          rounded-3xl border-4 border-black
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          backface-hidden overflow-hidden
        `}
      >
        {renderContent(card.back, 'back')}
      </animated.div>

      {/* Hint button (shown when card is front) */}
      {!isFlipped && card.hint && showHint && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            // Show hint modal/tooltip
          }}
          className="absolute bottom-3 left-3 p-2 bg-white rounded-full border-2 border-black shadow-md"
        >
          <Lightbulb className="w-4 h-4 text-yellow-600" />
        </motion.button>
      )}
    </div>
  );
};

export default FlashcardCard;
```

### 6.2 SwipeableCard.jsx - Gesture Handler

**Location:** `src/components/Flashcard/SwipeableCard.jsx`

```jsx
import React, { useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import FlashcardCard from './FlashcardCard';

const SwipeableCard = ({ 
  card, 
  isFlipped, 
  onFlip, 
  onSwipeLeft, 
  onSwipeRight,
  onSkip,
  disabled = false 
}) => {
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [gone, setGone] = useState(false);

  // Spring for card position and rotation
  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    config: { friction: 50, tension: 500 },
  }));

  // Drag gesture handler
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      if (disabled) return;
      
      // Trigger threshold (px)
      const trigger = 150;
      
      // Determine if the swipe is strong enough
      const shouldTrigger = Math.abs(mx) > trigger;
      
      // Set visual feedback direction
      if (active && Math.abs(mx) > 50) {
        setSwipeDirection(mx > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }

      if (!active && shouldTrigger) {
        // Card is released past trigger point
        setGone(true);
        const isRight = mx > 0;
        
        api.start({
          x: isRight ? 500 : -500,
          rotate: isRight ? 45 : -45,
          scale: 0.5,
          config: { friction: 30, tension: 200 },
        });

        // Trigger the appropriate callback
        setTimeout(() => {
          if (isRight) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }, 200);
      } else if (!active) {
        // Card returns to center
        api.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
        });
        setSwipeDirection(null);
      } else {
        // Card is being dragged
        api.start({
          x: mx,
          rotate: mx / 20,
          scale: 1.05,
          immediate: true,
        });
      }
    },
    { axis: 'x' }
  );

  // Reset card position
  const resetCard = () => {
    setGone(false);
    api.start({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    });
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Swipe feedback indicators */}
      <AnimatePresence>
        {swipeDirection === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-green-500 text-white px-4 py-2 rounded-full border-4 border-black font-bold text-lg"
          >
            Got it! 🎉
          </motion.div>
        )}
        {swipeDirection === 'left' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white px-4 py-2 rounded-full border-4 border-black font-bold text-lg"
          >
            Still learning 📚
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable card */}
      <animated.div
        {...bind()}
        style={{
          x,
          y,
          rotate,
          scale,
          touchAction: 'none',
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <FlashcardCard
          card={card}
          isFlipped={isFlipped}
          onFlip={onFlip}
          showHint={!isFlipped}
        />
      </animated.div>

      {/* Action buttons (shown when card is flipped) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-4 mt-6"
          >
            {/* Don't Know button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSwipeLeft}
              className="flex flex-col items-center justify-center w-20 h-20 bg-orange-400 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              <ThumbsDown className="w-8 h-8 text-white" />
              <span className="text-xs font-bold text-white mt-1">Nope</span>
            </motion.button>

            {/* Skip button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSkip}
              className="flex flex-col items-center justify-center w-14 h-14 bg-gray-200 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            {/* Know button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSwipeRight}
              className="flex flex-col items-center justify-center w-20 h-20 bg-green-500 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              <ThumbsUp className="w-8 h-8 text-white" />
              <span className="text-xs font-bold text-white mt-1">Got it!</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap instruction when not flipped */}
      {!isFlipped && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-gray-500 font-medium text-sm"
        >
          Tap card to see answer • Swipe to respond
        </motion.p>
      )}
    </div>
  );
};

export default SwipeableCard;
```

### 6.3 FlashcardDeck.jsx - Deck Container

**Location:** `src/components/Flashcard/FlashcardDeck.jsx`

```jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { useGamificationContext } from '../../context/GamificationContext';
import SwipeableCard from './SwipeableCard';
import CardProgress from './CardProgress';
import SessionComplete from './SessionComplete';
import useSound from 'use-sound';

const FlashcardDeck = ({ deckId, onSessionEnd }) => {
  const {
    currentCard,
    isFlipped,
    flipCard,
    recordAnswer,
    nextCard,
    isSessionComplete,
    sessionProgress,
    currentSession,
    startSession,
    endSession,
    studyQueue,
    currentCardIndex,
  } = useFlashcardContext();

  const { earnXP } = useGamificationContext();

  // Sound effects
  const [playFlip] = useSound('/sounds/card-flip.mp3', { volume: 0.5 });
  const [playCorrect] = useSound('/sounds/swipe-right.mp3', { volume: 0.5 });
  const [playIncorrect] = useSound('/sounds/swipe-left.mp3', { volume: 0.3 });

  // Start session on mount
  useEffect(() => {
    startSession(deckId);
    
    return () => {
      // Cleanup on unmount
    };
  }, [deckId, startSession]);

  const handleFlip = () => {
    playFlip();
    flipCard();
  };

  const handleCorrect = () => {
    playCorrect();
    recordAnswer(true, 0);
    
    // Award XP
    earnXP(5, 'Flashcard correct!');
    
    // Move to next card after short delay
    setTimeout(() => {
      nextCard();
    }, 300);
  };

  const handleIncorrect = () => {
    playIncorrect();
    recordAnswer(false, 0);
    
    // Still award some XP for trying
    earnXP(2, 'Flashcard reviewed');
    
    setTimeout(() => {
      nextCard();
    }, 300);
  };

  const handleSkip = () => {
    // Skip without recording - just move to next
    nextCard();
  };

  const handleEndSession = () => {
    endSession();
    onSessionEnd?.();
  };

  // Session complete screen
  if (isSessionComplete) {
    return (
      <SessionComplete 
        session={currentSession}
        onContinue={handleEndSession}
      />
    );
  }

  // No cards to study
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold font-comic mb-2">All caught up!</h2>
        <p className="text-gray-600 mb-6">No cards to review right now.</p>
        <button
          onClick={handleEndSession}
          className="px-6 py-3 bg-nanobanana-blue text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[70vh] py-8">
      {/* Progress bar */}
      <CardProgress 
        current={currentCardIndex + 1}
        total={studyQueue.length}
        progress={sessionProgress}
      />

      {/* Card stack */}
      <div className="relative flex-1 flex items-center justify-center my-8">
        {/* Background cards (stack effect) */}
        {studyQueue.slice(currentCardIndex + 1, currentCardIndex + 3).map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ scale: 0.9, y: 10 }}
            animate={{ 
              scale: 0.95 - (idx * 0.03), 
              y: 10 + (idx * 10),
              zIndex: -idx - 1,
            }}
            className="absolute w-80 h-72 bg-gray-200 rounded-3xl border-4 border-gray-300"
            style={{
              transformOrigin: 'center bottom',
            }}
          />
        ))}

        {/* Current card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <SwipeableCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onSwipeRight={handleCorrect}
              onSwipeLeft={handleIncorrect}
              onSkip={handleSkip}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Session stats */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-2xl font-black text-green-500">
            {currentSession?.cardsCorrect || 0}
          </div>
          <div className="text-xs font-bold text-gray-500">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-black text-orange-500">
            {currentSession?.cardsIncorrect || 0}
          </div>
          <div className="text-xs font-bold text-gray-500">Learning</div>
        </div>
        <div>
          <div className="text-2xl font-black text-nanobanana-blue">
            +{currentSession?.xpEarned || 0}
          </div>
          <div className="text-xs font-bold text-gray-500">XP</div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeck;
```

### 6.4 CardProgress.jsx - Progress Indicator

**Location:** `src/components/Flashcard/CardProgress.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';

const CardProgress = ({ current, total, progress }) => {
  return (
    <div className="w-full max-w-md">
      {/* Card count */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-600">
          Card {current} of {total}
        </span>
        <span className="text-sm font-bold text-nanobanana-blue">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-nanobanana-yellow to-nanobanana-green"
        />
      </div>
      
      {/* Card dots */}
      <div className="flex justify-center gap-1 mt-3">
        {Array.from({ length: Math.min(total, 10) }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`
              w-2 h-2 rounded-full border border-black
              ${idx < current 
                ? 'bg-nanobanana-green' 
                : idx === current - 1 
                  ? 'bg-nanobanana-yellow' 
                  : 'bg-gray-200'
              }
            `}
          />
        ))}
        {total > 10 && (
          <span className="text-xs text-gray-400">+{total - 10}</span>
        )}
      </div>
    </div>
  );
};

export default CardProgress;
```

### 6.5 SessionComplete.jsx - End Screen

**Location:** `src/components/Flashcard/SessionComplete.jsx`

```jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Clock, Target, ArrowRight } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import useSound from 'use-sound';

const SessionComplete = ({ session, onContinue, onStudyMore }) => {
  const [playComplete] = useSound('/sounds/session-complete.mp3', { volume: 0.5 });

  useEffect(() => {
    playComplete();
  }, [playComplete]);

  const accuracy = session.cardsStudied > 0
    ? Math.round((session.cardsCorrect / session.cardsStudied) * 100)
    : 0;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getMessage = () => {
    if (accuracy >= 90) return { emoji: '🏆', text: 'Amazing! You\'re a superstar!' };
    if (accuracy >= 70) return { emoji: '🎉', text: 'Great job! Keep it up!' };
    if (accuracy >= 50) return { emoji: '💪', text: 'Good effort! Practice makes perfect!' };
    return { emoji: '📚', text: 'Keep learning! You\'ve got this!' };
  };

  const message = getMessage();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-8">
      {/* Confetti for high accuracy */}
      {accuracy >= 70 && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={100}
          recycle={false}
          colors={['#FFD93D', '#4169E1', '#32CD32', '#FF6B9D']}
        />
      )}

      {/* Trophy animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        className="w-32 h-32 bg-gradient-to-br from-nanobanana-yellow to-orange-400 rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6"
      >
        <span className="text-6xl">{message.emoji}</span>
      </motion.div>

      {/* Completion message */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-black font-comic mb-2 text-center"
      >
        Session Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-gray-600 font-medium mb-8"
      >
        {message.text}
      </motion.p>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm"
      >
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Cards Studied"
          value={session.cardsStudied}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          label="Accuracy"
          value={`${accuracy}%`}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          label="XP Earned"
          value={`+${session.xpEarned}`}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Time"
          value={formatDuration(session.duration)}
          color="bg-purple-100 text-purple-600"
        />
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-8 mb-8"
      >
        <div className="text-center">
          <div className="text-3xl font-black text-green-500">{session.cardsCorrect}</div>
          <div className="text-sm font-bold text-gray-500">Correct ✓</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-orange-500">{session.cardsIncorrect}</div>
          <div className="text-sm font-bold text-gray-500">To Review</div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4"
      >
        <button
          onClick={onStudyMore}
          className="px-6 py-3 bg-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-colors"
        >
          Study More
        </button>
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 transition-colors"
        >
          Done <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
    </div>
    <div className="text-2xl font-black">{value}</div>
    <div className="text-xs font-bold opacity-70">{label}</div>
  </div>
);

export default SessionComplete;
```

### 6.6 FlashcardGenerator.jsx - AI Generation Interface

**Location:** `src/components/Flashcard/FlashcardGenerator.jsx`

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, BookOpen, Hash, Loader2 } from 'lucide-react';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { useLessonContext } from '../../context/LessonContext';
import { generateFlashcardsFromContent } from '../../utils/flashcardGenerator';

const FlashcardGenerator = ({ lessonId, onGenerate, onCancel }) => {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [focusArea, setFocusArea] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const { addCards, createDeck } = useFlashcardContext();
  const { lessons, currentLesson } = useLessonContext();

  const lesson = lessonId 
    ? lessons.find(l => l.id === lessonId) 
    : currentLesson;

  const handleGenerate = async () => {
    if (!lesson) return;

    setIsGenerating(true);
    
    try {
      setGenerationStep('Reading lesson content...');
      await delay(500);
      
      setGenerationStep('Finding key concepts...');
      await delay(800);
      
      setGenerationStep('Creating flashcards...');
      
      const generatedCards = await generateFlashcardsFromContent(
        lesson.content.rawText || lesson.content.summary,
        {
          count,
          difficulty,
          focusArea,
          subject: lesson.subject,
          gradeLevel: 'k-6', // Adjust based on user profile
        }
      );
      
      setGenerationStep('Almost done...');
      await delay(300);

      // Create a new deck or add to existing
      const newDeck = {
        name: `${lesson.title} Flashcards`,
        description: `Auto-generated from "${lesson.title}"`,
        subject: lesson.subject || 'other',
        lessonId: lesson.id,
      };

      createDeck(newDeck);
      
      // Wait for deck creation, then add cards
      setTimeout(() => {
        // This is a simplified approach - in production, 
        // createDeck should return the new deck ID
        const deckId = newDeck.id; // You'll need to handle this properly
        addCards(deckId, generatedCards);
        
        setIsGenerating(false);
        onGenerate?.(generatedCards);
      }, 100);
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl border-4 border-black flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black font-comic">Magic Flashcards</h2>
          <p className="text-sm text-gray-600">AI-powered card generation</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-nanobanana-yellow to-orange-400 rounded-full border-4 border-black flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <p className="font-bold text-lg mb-2">{generationStep}</p>
            <p className="text-sm text-gray-500">Jeffrey is working his magic ✨</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Lesson info */}
            {lesson && (
              <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-800 text-sm">
                    {lesson.title}
                  </span>
                </div>
              </div>
            )}

            {/* Number of cards */}
            <div>
              <label className="block text-sm font-bold mb-2">
                How many cards?
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`
                      flex-1 py-2 rounded-xl border-4 border-black font-bold
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                      ${count === num 
                        ? 'bg-nanobanana-yellow' 
                        : 'bg-white hover:bg-gray-100'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Difficulty level
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'easy', label: '⭐ Easy', color: 'bg-green-200' },
                  { value: 'mixed', label: '📚 Mixed', color: 'bg-blue-200' },
                  { value: 'hard', label: '🔥 Challenge', color: 'bg-orange-200' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`
                      flex-1 py-2 px-3 rounded-xl border-4 border-black font-bold text-sm
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                      ${difficulty === opt.value 
                        ? opt.color 
                        : 'bg-white hover:bg-gray-100'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus area */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Focus on
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full p-3 rounded-xl border-4 border-black font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
              >
                <option value="all">📖 All Topics</option>
                <option value="vocabulary">📝 Vocabulary</option>
                <option value="concepts">💡 Key Concepts</option>
                <option value="facts">🔢 Facts & Figures</option>
                <option value="questions">❓ Review Questions</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!lesson}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default FlashcardGenerator;
```

### 6.7 DeckSelector.jsx - Choose Deck

**Location:** `src/components/Flashcard/DeckSelector.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, Star, ChevronRight, Trash2 } from 'lucide-react';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { format } from 'date-fns';

const DeckSelector = ({ onSelectDeck, onCreateDeck }) => {
  const { decks, deleteDeck } = useFlashcardContext();

  const getSubjectEmoji = (subject) => {
    const emojis = {
      math: '🔢',
      science: '🔬',
      english: '📚',
      arabic: '🌙',
      islamic: '☪️',
      social: '🌍',
      other: '📖',
    };
    return emojis[subject] || '📖';
  };

  const getDueCardsCount = (deck) => {
    const now = new Date();
    return deck.cards.filter(card => {
      const dueDate = new Date(card.sr.dueDate);
      return dueDate <= now;
    }).length;
  };

  return (
    <div className="space-y-4">
      {/* Create new deck button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateDeck}
        className="w-full p-4 bg-gradient-to-r from-nanobanana-blue to-blue-600 text-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Create New Deck</div>
          <div className="text-sm opacity-80">Start from scratch or generate from lesson</div>
        </div>
      </motion.button>

      {/* Existing decks */}
      {decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold font-comic mb-2">No decks yet!</h3>
          <p className="text-gray-600">Create your first flashcard deck to start studying.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wide">
            Your Decks ({decks.length})
          </h3>
          
          {decks.map((deck, index) => {
            const dueCards = getDueCardsCount(deck);
            
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <button
                  onClick={() => onSelectDeck(deck.id)}
                  className="w-full p-4 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Subject emoji */}
                  <div className="w-14 h-14 bg-nanobanana-yellow rounded-xl border-2 border-black flex items-center justify-center text-2xl flex-shrink-0">
                    {getSubjectEmoji(deck.subject)}
                  </div>
                  
                  {/* Deck info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg truncate">{deck.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {deck.cards.length} cards
                      </span>
                      {deck.statistics.correctRate > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                          {deck.statistics.correctRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Due cards badge */}
                  {dueCards > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full border-2 border-red-300 font-bold text-sm">
                        {dueCards} due
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  
                  {dueCards === 0 && (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full border-2 border-green-300 font-bold text-sm">
                        ✓ Up to date
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </button>
                
                {/* Delete button (on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this deck? This cannot be undone.')) {
                      deleteDeck(deck.id);
                    }
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeckSelector;
```

### 6.8 DueCardsIndicator.jsx - Navigation Badge

**Location:** `src/components/Flashcard/DueCardsIndicator.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useFlashcardContext } from '../../context/FlashcardContext';

const DueCardsIndicator = ({ compact = false }) => {
  const { totalDueCards } = useFlashcardContext();

  if (totalDueCards === 0) return null;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white"
      >
        {totalDueCards > 9 ? '9+' : totalDueCards}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="px-3 py-1 bg-red-100 text-red-700 rounded-full border-2 border-red-300 text-sm font-bold"
    >
      {totalDueCards} cards due
    </motion.div>
  );
};

export default DueCardsIndicator;
```

---

## 7. Hook Implementations

### 7.1 useSpacedRepetition.js

**Location:** `src/hooks/useSpacedRepetition.js`

```javascript
import { useCallback } from 'react';
import { useFlashcardContext } from '../context/FlashcardContext';
import { 
  calculateNextReview, 
  getCardsForStudy,
  isDue,
  getReviewPriority 
} from '../utils/spacedRepetition';

export function useSpacedRepetition() {
  const { decks, updateCard } = useFlashcardContext();

  /**
   * Get all due cards across all decks
   */
  const getAllDueCards = useCallback(() => {
    const now = new Date();
    const dueCards = [];

    decks.forEach(deck => {
      deck.cards.forEach(card => {
        if (isDue(card.sr.dueDate)) {
          dueCards.push({
            ...card,
            deckName: deck.name,
            deckId: deck.id,
          });
        }
      });
    });

    // Sort by priority (overdue first, then by ease factor)
    return dueCards.sort((a, b) => getReviewPriority(b.sr) - getReviewPriority(a.sr));
  }, [decks]);

  /**
   * Get study queue for a specific deck
   */
  const getStudyQueueForDeck = useCallback((deckId, limit = 20) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [];

    return getCardsForStudy(deck.cards, deck.settings).slice(0, limit);
  }, [decks]);

  /**
   * Record a review and update SR data
   */
  const recordReview = useCallback((deckId, cardId, wasCorrect) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    const card = deck.cards.find(c => c.id === cardId);
    if (!card) return;

    const newSR = calculateNextReview(card.sr, wasCorrect);
    updateCard(deckId, cardId, { sr: newSR });

    return newSR;
  }, [decks, updateCard]);

  /**
   * Get statistics for spaced repetition progress
   */
  const getSRStatistics = useCallback((deckId) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return null;

    const now = new Date();
    const stats = {
      total: deck.cards.length,
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      dueToday: 0,
      overdue: 0,
      averageEaseFactor: 0,
    };

    let totalEF = 0;

    deck.cards.forEach(card => {
      const { status, dueDate, easeFactor } = card.sr;
      
      switch (status) {
        case 'new': stats.new++; break;
        case 'learning': stats.learning++; break;
        case 'review': stats.review++; break;
        case 'mastered': stats.mastered++; break;
      }

      if (isDue(dueDate)) {
        const due = new Date(dueDate);
        if (due.toDateString() === now.toDateString()) {
          stats.dueToday++;
        } else if (due < now) {
          stats.overdue++;
        }
      }

      totalEF += easeFactor;
    });

    stats.averageEaseFactor = deck.cards.length > 0 
      ? (totalEF / deck.cards.length).toFixed(2)
      : 2.5;

    return stats;
  }, [decks]);

  /**
   * Forecast upcoming reviews
   */
  const getReviewForecast = useCallback((deckId, days = 7) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [];

    const forecast = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();

      const dueOnDate = deck.cards.filter(card => {
        const cardDue = new Date(card.sr.dueDate);
        return cardDue.toDateString() === dateStr;
      }).length;

      forecast.push({
        date,
        dateStr,
        count: dueOnDate,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    return forecast;
  }, [decks]);

  return {
    getAllDueCards,
    getStudyQueueForDeck,
    recordReview,
    getSRStatistics,
    getReviewForecast,
  };
}
```

### 7.2 useStudySession.js

**Location:** `src/hooks/useStudySession.js`

```javascript
import { useState, useCallback, useEffect, useRef } from 'react';
import { useFlashcardContext } from '../context/FlashcardContext';
import { useGamificationContext } from '../context/GamificationContext';

export function useStudySession(deckId) {
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentResponseTime, setCurrentResponseTime] = useState(0);
  const responseStartRef = useRef(null);

  const {
    currentCard,
    isFlipped,
    flipCard,
    recordAnswer,
    nextCard,
    isSessionComplete,
    sessionProgress,
    currentSession,
    startSession,
    endSession,
    studyQueue,
    currentCardIndex,
  } = useFlashcardContext();

  const { earnXP, updateStatistics } = useGamificationContext();

  // Start session on mount
  useEffect(() => {
    if (deckId) {
      startSession(deckId);
      setSessionStartTime(Date.now());
    }

    return () => {
      // Cleanup
    };
  }, [deckId, startSession]);

  // Track response time when card is flipped
  useEffect(() => {
    if (isFlipped) {
      responseStartRef.current = Date.now();
    }
  }, [isFlipped]);

  const handleFlip = useCallback(() => {
    if (!isFlipped) {
      responseStartRef.current = Date.now();
    }
    flipCard();
  }, [isFlipped, flipCard]);

  const handleAnswer = useCallback((correct) => {
    const responseTime = responseStartRef.current 
      ? Date.now() - responseStartRef.current 
      : 0;

    recordAnswer(correct, responseTime);

    // Award XP based on correctness
    const xpAmount = correct ? 5 : 2;
    earnXP(xpAmount, correct ? 'Flashcard correct!' : 'Flashcard reviewed');

    // Update statistics
    updateStatistics({
      flashcardsReviewed: (prev) => (prev || 0) + 1,
    });

    // Auto advance after short delay
    setTimeout(() => {
      nextCard();
    }, 300);
  }, [recordAnswer, earnXP, updateStatistics, nextCard]);

  const handleSkip = useCallback(() => {
    nextCard();
  }, [nextCard]);

  const handleEndSession = useCallback(() => {
    endSession();
    
    // Award bonus XP for completing session
    if (currentSession?.cardsStudied >= 5) {
      earnXP(20, 'Flashcard session complete!');
    }
  }, [endSession, currentSession, earnXP]);

  // Computed stats
  const accuracy = currentSession?.cardsStudied > 0
    ? Math.round((currentSession.cardsCorrect / currentSession.cardsStudied) * 100)
    : 0;

  const sessionDuration = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime) / 1000)
    : 0;

  return {
    // State
    currentCard,
    isFlipped,
    isSessionComplete,
    sessionProgress,
    studyQueue,
    currentCardIndex,
    accuracy,
    sessionDuration,
    session: currentSession,

    // Actions
    handleFlip,
    handleAnswer,
    handleSkip,
    handleEndSession,
  };
}
```

### 7.3 useCardFlip.js

**Location:** `src/hooks/useCardFlip.js`

```javascript
import { useState, useCallback } from 'react';
import { useSpring } from 'react-spring';

export function useCardFlip(initialFlipped = false) {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  // Animation spring
  const { transform, opacity } = useSpring({
    opacity: isFlipped ? 1 : 0,
    transform: `perspective(1000px) rotateY(${isFlipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const flip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const setFlipped = useCallback((value) => {
    setIsFlipped(value);
  }, []);

  return {
    isFlipped,
    flip,
    reset,
    setFlipped,
    animation: { transform, opacity },
  };
}
```

---

## 8. Spaced Repetition Algorithm

### 8.1 spacedRepetition.js

**Location:** `src/utils/spacedRepetition.js`

```javascript
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * SM-2 Algorithm Constants (Simplified for K-6)
 */
const SR_CONFIG = {
  // Initial intervals (in days)
  INITIAL_INTERVAL: 1,
  SECOND_INTERVAL: 3,
  
  // Ease factor bounds
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  DEFAULT_EASE_FACTOR: 2.5,
  
  // Ease factor adjustments
  CORRECT_BONUS: 0.1,
  INCORRECT_PENALTY: 0.2,
  
  // Maximum interval (days) - keep it reasonable for children
  MAX_INTERVAL: 30,
  
  // Graduation threshold (repetitions to become "mastered")
  MASTERY_THRESHOLD: 5,
  
  // Learning steps (minutes) for new cards
  LEARNING_STEPS: [1, 10],
};

/**
 * Calculate the next review date and updated SR data
 * 
 * @param {SpacedRepetitionData} currentSR - Current SR data
 * @param {boolean} wasCorrect - Whether the answer was correct
 * @returns {SpacedRepetitionData} Updated SR data
 */
export function calculateNextReview(currentSR, wasCorrect) {
  const now = new Date();
  let { interval, easeFactor, repetitions, status } = currentSR;

  if (wasCorrect) {
    // Correct answer - increase interval
    repetitions += 1;
    
    // Calculate new interval based on repetition count
    if (repetitions === 1) {
      interval = SR_CONFIG.INITIAL_INTERVAL;
    } else if (repetitions === 2) {
      interval = SR_CONFIG.SECOND_INTERVAL;
    } else {
      interval = Math.min(
        Math.round(interval * easeFactor),
        SR_CONFIG.MAX_INTERVAL
      );
    }
    
    // Increase ease factor (card is getting easier)
    easeFactor = Math.min(
      easeFactor + SR_CONFIG.CORRECT_BONUS,
      SR_CONFIG.MAX_EASE_FACTOR
    );
    
    // Update status based on repetitions
    if (repetitions >= SR_CONFIG.MASTERY_THRESHOLD) {
      status = 'mastered';
    } else if (repetitions >= 2) {
      status = 'review';
    } else {
      status = 'learning';
    }
    
  } else {
    // Incorrect answer - reset progress
    repetitions = 0;
    interval = SR_CONFIG.INITIAL_INTERVAL;
    
    // Decrease ease factor (card is harder than thought)
    easeFactor = Math.max(
      easeFactor - SR_CONFIG.INCORRECT_PENALTY,
      SR_CONFIG.MIN_EASE_FACTOR
    );
    
    status = 'learning';
  }

  // Calculate due date
  const dueDate = addDays(startOfDay(now), interval);

  return {
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    dueDate: dueDate.toISOString(),
    lastReviewed: now.toISOString(),
    status,
  };
}

/**
 * Check if a card is due for review
 * 
 * @param {string} dueDateStr - ISO date string of due date
 * @returns {boolean} Whether the card is due
 */
export function isDue(dueDateStr) {
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  return isBefore(dueDate, now) || dueDate.toDateString() === now.toDateString();
}

/**
 * Get cards that need to be studied, ordered by priority
 * 
 * @param {Flashcard[]} cards - Array of flashcards
 * @param {DeckSettings} settings - Deck settings
 * @returns {Flashcard[]} Cards to study, ordered by priority
 */
export function getCardsForStudy(cards, settings = {}) {
  const {
    newCardsPerDay = 10,
    reviewsPerDay = 50,
    shuffleCards = true,
  } = settings;

  const now = new Date();
  
  // Separate cards by type
  const newCards = cards.filter(c => c.sr.status === 'new');
  const learningCards = cards.filter(c => 
    c.sr.status === 'learning' && isDue(c.sr.dueDate)
  );
  const reviewCards = cards.filter(c => 
    (c.sr.status === 'review' || c.sr.status === 'mastered') && isDue(c.sr.dueDate)
  );

  // Apply daily limits
  const selectedNew = newCards.slice(0, newCardsPerDay);
  const selectedReview = reviewCards
    .sort((a, b) => getReviewPriority(b.sr) - getReviewPriority(a.sr))
    .slice(0, reviewsPerDay);

  // Combine: Learning cards first (urgent), then interleave new and review
  let studyQueue = [
    ...learningCards,
    ...interleaveCards(selectedNew, selectedReview),
  ];

  // Shuffle if enabled
  if (shuffleCards) {
    // Keep learning cards first, shuffle the rest
    const learning = studyQueue.filter(c => c.sr.status === 'learning');
    const others = studyQueue.filter(c => c.sr.status !== 'learning');
    studyQueue = [...learning, ...shuffleArray(others)];
  }

  return studyQueue;
}

/**
 * Calculate review priority (higher = more urgent)
 * 
 * @param {SpacedRepetitionData} sr - SR data
 * @returns {number} Priority score
 */
export function getReviewPriority(sr) {
  const now = new Date();
  const dueDate = new Date(sr.dueDate);
  
  // Days overdue (negative if not due yet)
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  // Base priority on how overdue the card is
  let priority = daysOverdue * 10;
  
  // Lower ease factor = higher priority (harder cards first)
  priority += (SR_CONFIG.MAX_EASE_FACTOR - sr.easeFactor) * 5;
  
  // Learning cards get highest priority
  if (sr.status === 'learning') {
    priority += 100;
  }
  
  return priority;
}

/**
 * Get the default SR data for a new card
 * 
 * @returns {SpacedRepetitionData} Default SR data
 */
export function getDefaultSRData() {
  const now = new Date();
  
  return {
    interval: 0,
    easeFactor: SR_CONFIG.DEFAULT_EASE_FACTOR,
    repetitions: 0,
    dueDate: now.toISOString(), // Due immediately
    lastReviewed: null,
    status: 'new',
  };
}

/**
 * Calculate forecast of upcoming reviews
 * 
 * @param {Flashcard[]} cards - Array of flashcards
 * @param {number} days - Number of days to forecast
 * @returns {Object[]} Array of daily review counts
 */
export function getReviewForecast(cards, days = 7) {
  const forecast = [];
  const now = startOfDay(new Date());

  for (let i = 0; i < days; i++) {
    const date = addDays(now, i);
    const count = cards.filter(card => {
      const cardDue = startOfDay(new Date(card.sr.dueDate));
      return cardDue.getTime() === date.getTime();
    }).length;

    forecast.push({
      date,
      count,
    });
  }

  return forecast;
}

// Helper: Interleave two arrays
function interleaveCards(arr1, arr2) {
  const result = [];
  const maxLen = Math.max(arr1.length, arr2.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (i < arr1.length) result.push(arr1[i]);
    if (i < arr2.length) result.push(arr2[i]);
  }
  
  return result;
}

// Helper: Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 8.2 flashcardConstants.js

**Location:** `src/constants/flashcardConstants.js`

```javascript
/**
 * Default settings for new decks
 */
export const DEFAULT_DECK_SETTINGS = {
  newCardsPerDay: 10,
  reviewsPerDay: 50,
  showHints: true,
  autoPlayAudio: false,
  shuffleCards: true,
  celebrationLevel: 'normal', // 'minimal' | 'normal' | 'party'
};

/**
 * Default SR data for new cards
 */
export const DEFAULT_SR_DATA = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  dueDate: new Date().toISOString(),
  lastReviewed: null,
  status: 'new',
};

/**
 * Card type definitions
 */
export const CARD_TYPES = {
  TEXT_TEXT: 'text-text',         // Text question, text answer
  TEXT_IMAGE: 'text-image',       // Text question, image answer
  IMAGE_TEXT: 'image-text',       // Image question, text answer
  AUDIO_TEXT: 'audio-text',       // Audio question, text answer
  CLOZE: 'cloze',                 // Fill in the blank
};

/**
 * Subject-specific emoji and color mappings
 */
export const SUBJECT_THEMES = {
  math: {
    emoji: '🔢',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-100',
  },
  science: {
    emoji: '🔬',
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-100',
  },
  english: {
    emoji: '📚',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-100',
  },
  arabic: {
    emoji: '🌙',
    color: 'from-teal-400 to-teal-600',
    bgColor: 'bg-teal-100',
  },
  islamic: {
    emoji: '☪️',
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  social: {
    emoji: '🌍',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-100',
  },
  other: {
    emoji: '📖',
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-100',
  },
};

/**
 * XP values for flashcard activities
 */
export const FLASHCARD_XP = {
  CORRECT_ANSWER: 5,
  INCORRECT_ANSWER: 2,
  SESSION_COMPLETE: 20,
  DECK_MASTERED: 100,
  PERFECT_SESSION: 50,
};

/**
 * Animation timings (ms)
 */
export const ANIMATION_TIMING = {
  CARD_FLIP: 400,
  CARD_SWIPE: 300,
  CELEBRATION: 2000,
  AUTO_ADVANCE: 500,
};
```

---

## 9. AI Flashcard Generation

### 9.1 flashcardGenerator.js

**Location:** `src/utils/flashcardGenerator.js`

```javascript
/**
 * AI-powered flashcard generation using Gemini
 * 
 * This is a mock implementation for frontend development.
 * Replace with actual Gemini API calls in production.
 */

const MOCK_DELAY = 2000;

/**
 * Generate flashcards from content using AI
 * 
 * @param {string} content - The lesson content to generate from
 * @param {Object} options - Generation options
 * @returns {Promise<Flashcard[]>} Generated flashcards
 */
export async function generateFlashcardsFromContent(content, options = {}) {
  const {
    count = 10,
    difficulty = 'mixed',
    focusArea = 'all',
    subject = 'other',
    gradeLevel = 'k-6',
  } = options;

  // Simulate API delay
  await delay(MOCK_DELAY);

  // In production, this would call Gemini API
  // For now, return mock flashcards
  return generateMockFlashcards(content, count, difficulty, subject);
}

/**
 * Generate flashcards from vocabulary list
 */
export async function generateVocabularyCards(words, subject = 'english') {
  await delay(MOCK_DELAY / 2);
  
  return words.map((word, index) => ({
    front: {
      type: 'text',
      text: word.term || word,
      emoji: '📝',
    },
    back: {
      type: 'text',
      text: word.definition || `Definition of ${word}`,
    },
    difficulty: 'medium',
    tags: ['vocabulary', subject],
  }));
}

/**
 * Generate Q&A flashcards from questions
 */
export async function generateQACards(questions) {
  await delay(MOCK_DELAY / 2);
  
  return questions.map((q, index) => ({
    front: {
      type: 'text',
      text: q.question,
      emoji: '❓',
    },
    back: {
      type: 'text',
      text: q.answer,
    },
    difficulty: q.difficulty || 'medium',
    tags: ['qa'],
  }));
}

// Mock implementation
function generateMockFlashcards(content, count, difficulty, subject) {
  const mockCards = [];
  const subjectEmojis = {
    math: ['🔢', '➕', '✖️', '📐'],
    science: ['🔬', '🌍', '🌡️', '⚡'],
    english: ['📚', '✍️', '📖', '🔤'],
    arabic: ['🌙', '📜', '✨'],
    default: ['💡', '📝', '🎯', '⭐'],
  };

  const emojis = subjectEmojis[subject] || subjectEmojis.default;

  for (let i = 0; i < count; i++) {
    const cardDifficulty = difficulty === 'mixed'
      ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
      : difficulty;

    mockCards.push({
      front: {
        type: 'text',
        text: `Question ${i + 1}: What is an important concept from this lesson?`,
        emoji: emojis[i % emojis.length],
      },
      back: {
        type: 'text',
        text: `Answer ${i + 1}: This is a key concept that helps understand the topic better. Remember to review this regularly!`,
      },
      hint: i % 3 === 0 ? 'Think about the main idea we discussed.' : undefined,
      difficulty: cardDifficulty,
      tags: [subject, `card-${i + 1}`],
    });
  }

  return mockCards;
}

// Helper
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
 * export async function generateFlashcardsFromContent(content, options) {
 *   const prompt = buildFlashcardPrompt(content, options);
 *   const result = await model.generateContent(prompt);
 *   const response = await result.response;
 *   return parseFlashcardResponse(response.text());
 * }
 * 
 * function buildFlashcardPrompt(content, options) {
 *   return `
 *     You are an expert educational content creator for K-6 children.
 *     
 *     Create ${options.count} flashcards from the following lesson content.
 *     
 *     Subject: ${options.subject}
 *     Difficulty: ${options.difficulty}
 *     Focus Area: ${options.focusArea}
 *     
 *     Guidelines:
 *     - Use simple, age-appropriate language
 *     - Include helpful emojis where appropriate
 *     - Make questions clear and specific
 *     - Answers should be concise but complete
 *     - For "hard" cards, include more detail
 *     - For "easy" cards, focus on basic facts
 *     
 *     Content:
 *     ${content}
 *     
 *     Return a JSON array of flashcards with this structure:
 *     [
 *       {
 *         "front": { "type": "text", "text": "...", "emoji": "..." },
 *         "back": { "type": "text", "text": "..." },
 *         "hint": "optional hint",
 *         "difficulty": "easy|medium|hard",
 *         "tags": ["tag1", "tag2"]
 *       }
 *     ]
 *     
 *     ONLY return valid JSON, no other text.
 *   `;
 * }
 */
```

---

## 10. Page Implementations

### 10.1 FlashcardsPage.jsx

**Location:** `src/pages/FlashcardsPage.jsx`

```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import DeckSelector from '../components/Flashcard/DeckSelector';
import FlashcardGenerator from '../components/Flashcard/FlashcardGenerator';
import DeckCreator from '../components/Flashcard/DeckCreator';
import ProgressWidget from '../components/Gamification/ProgressWidget';
import { useFlashcardContext } from '../context/FlashcardContext';
import { useLessonContext } from '../context/LessonContext';

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  
  const { totalDueCards } = useFlashcardContext();
  const { currentLesson } = useLessonContext();

  const handleSelectDeck = (deckId) => {
    navigate(`/flashcards/study/${deckId}`);
  };

  const handleCreateDeck = () => {
    if (currentLesson) {
      // If there's a current lesson, offer to generate from it
      setShowGenerator(true);
    } else {
      // Otherwise, show manual deck creator
      setShowCreator(true);
    }
  };

  const handleGenerateComplete = (cards) => {
    setShowGenerator(false);
    // Navigate to the new deck
    // The deck ID would be returned from the generator
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/study"
              className="flex items-center gap-2 text-nanobanana-blue font-bold hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            
            {totalDueCards > 0 && (
              <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full border-2 border-red-300 font-bold text-sm">
                🔥 {totalDueCards} cards due
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-black font-comic mb-2 flex items-center gap-3">
            <span className="text-4xl">🃏</span>
            Flashcards
          </h1>
          <p className="text-gray-600">
            Study smarter with spaced repetition!
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-4 pb-8">
        {/* Progress widget */}
        <div className="mb-6">
          <ProgressWidget layout="compact" />
        </div>

        {/* Quick start if there's a current lesson */}
        {currentLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowGenerator(true)}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-lg">Generate from Lesson</div>
                <div className="text-sm opacity-80 truncate">
                  {currentLesson.title}
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Deck selector */}
        <DeckSelector
          onSelectDeck={handleSelectDeck}
          onCreateDeck={handleCreateDeck}
        />
      </div>

      {/* Generator modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FlashcardGenerator
                lessonId={currentLesson?.id}
                onGenerate={handleGenerateComplete}
                onCancel={() => setShowGenerator(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator modal */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DeckCreator
                onComplete={() => setShowCreator(false)}
                onCancel={() => setShowCreator(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashcardsPage;
```

### 10.2 StudySessionPage.jsx

**Location:** `src/pages/StudySessionPage.jsx`

```jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Pause } from 'lucide-react';
import FlashcardDeck from '../components/Flashcard/FlashcardDeck';
import RewardPopup from '../components/Gamification/RewardPopup';
import { useFlashcardContext } from '../context/FlashcardContext';

const StudySessionPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks, currentSession } = useFlashcardContext();

  const deck = decks.find(d => d.id === deckId);

  const handleEndSession = () => {
    navigate('/flashcards');
  };

  const handleClose = () => {
    if (currentSession?.cardsStudied > 0) {
      if (confirm('End session? Your progress will be saved.')) {
        handleEndSession();
      }
    } else {
      navigate('/flashcards');
    }
  };

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Deck not found</h2>
          <button
            onClick={() => navigate('/flashcards')}
            className="text-nanobanana-blue font-bold hover:underline"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b-4 border-black p-4"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold font-comic truncate max-w-[200px] md:max-w-none">
                {deck.name}
              </h1>
              <p className="text-xs text-gray-600">
                {deck.cards.length} cards
              </p>
            </div>
          </div>

          {/* Session stats */}
          {currentSession && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-black text-green-500">
                  {currentSession.cardsCorrect}
                </div>
                <div className="text-[10px] font-bold text-gray-500">✓</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-orange-500">
                  {currentSession.cardsIncorrect}
                </div>
                <div className="text-[10px] font-bold text-gray-500">✗</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Study area */}
      <div className="max-w-2xl mx-auto px-4">
        <FlashcardDeck 
          deckId={deckId}
          onSessionEnd={handleEndSession}
        />
      </div>

      {/* Reward popup */}
      <RewardPopup />
    </div>
  );
};

export default StudySessionPage;
```

### 10.3 DeckCreator.jsx

**Location:** `src/components/Flashcard/DeckCreator.jsx`

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, BookOpen, Check } from 'lucide-react';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { SUBJECT_THEMES } from '../../constants/flashcardConstants';

const DeckCreator = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [deckName, setDeckName] = useState('');
  const [subject, setSubject] = useState('other');
  const [cards, setCards] = useState([
    { front: '', back: '' },
  ]);

  const { createDeck, addCards } = useFlashcardContext();

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSubmit = () => {
    // Create deck
    const newDeck = {
      id: Date.now().toString(), // Temporary - context should generate real ID
      name: deckName,
      subject,
    };
    createDeck(newDeck);

    // Add cards
    const formattedCards = cards
      .filter(c => c.front.trim() && c.back.trim())
      .map(c => ({
        front: { type: 'text', text: c.front },
        back: { type: 'text', text: c.back },
        difficulty: 'medium',
        tags: [],
      }));

    if (formattedCards.length > 0) {
      addCards(newDeck.id, formattedCards);
    }

    onComplete?.();
  };

  const isValid = deckName.trim() && cards.some(c => c.front.trim() && c.back.trim());

  return (
    <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black font-comic flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Create Deck
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Deck name */}
          <div>
            <label className="block text-sm font-bold mb-2">Deck Name *</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g., Science Vocabulary"
              className="w-full p-3 rounded-xl border-4 border-black font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold mb-2">Subject</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(SUBJECT_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setSubject(key)}
                  className={`
                    p-3 rounded-xl border-4 border-black text-center
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    ${subject === key ? theme.bgColor : 'bg-white hover:bg-gray-100'}
                  `}
                >
                  <div className="text-2xl">{theme.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!deckName.trim()}
            className="w-full py-3 bg-nanobanana-blue text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Add Cards
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Cards */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {cards.map((card, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200 relative"
              >
                <div className="absolute top-2 right-2 text-xs font-bold text-gray-400">
                  #{index + 1}
                </div>
                {cards.length > 1 && (
                  <button
                    onClick={() => handleRemoveCard(index)}
                    className="absolute top-2 right-8 p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                    placeholder="Front (question)"
                    className="w-full p-2 rounded-lg border-2 border-gray-300 text-sm"
                  />
                  <input
                    type="text"
                    value={card.back}
                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                    placeholder="Back (answer)"
                    className="w-full p-2 rounded-lg border-2 border-gray-300 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add card button */}
          <button
            onClick={handleAddCard}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Plus className="w-5 h-5" />
            Add Another Card
          </button>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1 py-3 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Create Deck
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeckCreator;
```

---

## 11. Integration with Existing Systems

### 11.1 Update ChatInterface.jsx - Add Flashcard Button

**Location:** `src/components/Chat/ChatInterface.jsx`

Add to the Gemini Tools section:

```jsx
{/* Gemini Tools */}
{!demoMode && lesson && (
  <div className="p-2 bg-gray-50 border-t-4 border-black grid grid-cols-3 gap-2">
    <button 
      onClick={onGenerateFlashcards}
      className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
    >
      <FileText className="w-5 h-5 mb-1" />
      <span className="text-xs font-bold">Flashcards</span>
    </button>
    {/* ... other buttons ... */}
  </div>
)}
```

### 11.2 Update StudyPage.jsx - Add Flashcard Navigation

**Location:** `src/pages/StudyPage.jsx`

Add a link to flashcards:

```jsx
import DueCardsIndicator from '../components/Flashcard/DueCardsIndicator';
import { Link } from 'react-router-dom';

// In the header area:
<Link 
  to="/flashcards"
  className="relative p-3 bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
>
  <span className="text-2xl">🃏</span>
  <DueCardsIndicator compact />
</Link>
```

### 11.3 Sound Assets Setup

**Location:** `public/sounds/`

Create placeholder sound files or add actual sounds:

```bash
# Create placeholder files (replace with actual sounds)
public/
  sounds/
    card-flip.mp3
    swipe-right.mp3
    swipe-left.mp3
    session-complete.mp3
```

**Recommended free sound sources:**
- [Freesound.org](https://freesound.org) - CC licensed sounds
- [Mixkit](https://mixkit.co/free-sound-effects/) - Free sound effects
- Custom creation using Web Audio API for simple tones

---

## 12. Testing Checklist

### Functionality Tests

- [ ] **Deck Management**
  - [ ] Create new deck with name and subject
  - [ ] Delete deck with confirmation
  - [ ] Update deck settings
  - [ ] View deck statistics

- [ ] **Card Management**
  - [ ] Add cards manually
  - [ ] Generate cards from AI (mock)
  - [ ] Edit existing cards
  - [ ] Delete cards
  - [ ] Cards have proper SR data initialized

- [ ] **Study Session**
  - [ ] Start session loads correct cards
  - [ ] Card flip animation works smoothly
  - [ ] Swipe right records correct answer
  - [ ] Swipe left records incorrect answer
  - [ ] Session progress updates
  - [ ] Session complete screen shows stats

- [ ] **Spaced Repetition**
  - [ ] Correct answer increases interval
  - [ ] Incorrect answer resets to learning
  - [ ] Due date calculated correctly
  - [ ] Cards sorted by priority
  - [ ] "Due cards" count is accurate

- [ ] **Gestures & Animations**
  - [ ] Card flip responds to tap
  - [ ] Swipe gesture feels natural
  - [ ] Visual feedback during swipe
  - [ ] Return to center on incomplete swipe
  - [ ] Exit animation on complete swipe

- [ ] **Gamification Integration**
  - [ ] XP awarded for correct answers
  - [ ] XP awarded for session completion
  - [ ] Statistics update in gamification context
  - [ ] Reward popup shows for big XP gains

- [ ] **Persistence**
  - [ ] Decks save to localStorage
  - [ ] SR data persists between sessions
  - [ ] Session recovery after page reload

### Edge Cases

- [ ] Empty deck handling
- [ ] All cards mastered (no due cards)
- [ ] Very long card text
- [ ] Rapid swipe gestures
- [ ] Session exit mid-study
- [ ] Browser back button during session
- [ ] Multiple decks with same name

### Performance

- [ ] Smooth animations on mobile devices
- [ ] Card flip doesn't lag
- [ ] Large decks (100+ cards) handle well
- [ ] Sound effects don't delay interactions

### Accessibility

- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Reduced motion preference respected

---

## Summary

This flashcard system provides:

1. **FlashcardContext** - Centralized state management for decks, cards, and sessions
2. **FlashcardCard** - Beautiful 3D flip card with animations
3. **SwipeableCard** - Touch-friendly swipe gestures
4. **FlashcardDeck** - Study session container
5. **FlashcardGenerator** - AI-powered card generation from lessons
6. **DeckSelector** - Browse and select decks
7. **DeckCreator** - Manual deck creation
8. **SessionComplete** - Celebration screen with stats
9. **Spaced Repetition** - SM-2 algorithm adapted for K-6
10. **Full Gamification Integration** - XP, badges, progress tracking

**Estimated implementation time:** 5-7 days for a developer familiar with React and gesture handling.

**Key Dependencies:**
- react-spring (animations)
- @use-gesture/react (swipe gestures)
- use-sound (audio feedback)
- date-fns (date calculations)

**Next Steps After Implementation:**
1. Add actual sound effect files
2. Connect to real Gemini API for card generation
3. Add cloze deletion card type
4. Implement image-based cards
5. Add TTS for card content
6. Create parent dashboard view of flashcard progress
7. Add offline mode with service worker caching
