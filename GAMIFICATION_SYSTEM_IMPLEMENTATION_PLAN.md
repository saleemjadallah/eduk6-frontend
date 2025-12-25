# Gamification System Implementation Plan
## K-6 AI Learning Platform - Option B

**Goal:** Create an engaging, age-appropriate reward system that motivates learning through XP (Experience Points), daily streaks, achievement badges, and celebration moments—without being manipulative or distracting from educational objectives.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [New Dependencies](#2-new-dependencies)
3. [File Structure](#3-file-structure)
4. [Data Models](#4-data-models)
5. [Context Setup](#5-context-setup)
6. [Component Implementations](#6-component-implementations)
7. [Hook Implementations](#7-hook-implementations)
8. [Integration with Existing Components](#8-integration-with-existing-components)
9. [Parent Dashboard Features](#9-parent-dashboard-features)
10. [Progression Formula & Balance](#10-progression-formula--balance)
11. [Testing Checklist](#11-testing-checklist)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GAMIFICATION FLOW                                │
│                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│   │   ACTIONS    │ ──▶│   REWARDS    │ ──▶│  CELEBRATION │            │
│   │              │    │              │    │              │            │
│   │ • Complete   │    │ • Earn XP    │    │ • Popup      │            │
│   │   lesson     │    │ • Update     │    │ • Animation  │            │
│   │ • Answer     │    │   streak     │    │ • Sound FX   │            │
│   │   question   │    │ • Unlock     │    │              │            │
│   │ • Create     │    │   badge      │    │              │            │
│   │   flashcard  │    │ • Level up   │    │              │            │
│   └──────────────┘    └──────────────┘    └──────────────┘            │
│          │                    │                    │                    │
│          ▼                    ▼                    ▼                    │
│   ┌──────────────────────────────────────────────────────┐            │
│   │            GAMIFICATION CONTEXT                       │            │
│   │  • Current XP, Level, Streak                          │            │
│   │  • Unlocked badges                                    │            │
│   │  • Progress toward next reward                        │            │
│   │  • Daily challenge status                             │            │
│   └──────────────────────────────────────────────────────┘            │
│                              │                                          │
│                              ▼                                          │
│   ┌──────────────────────────────────────────────────────┐            │
│   │              UI COMPONENTS                            │            │
│   │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │            │
│   │  │ XP Bar │  │Streaks │  │ Badges │  │ Level  │    │            │
│   │  │████░░░ │  │ 🔥 5   │  │ 🏆 12  │  │ Lvl 7  │    │            │
│   │  └────────┘  └────────┘  └────────┘  └────────┘    │            │
│   └──────────────────────────────────────────────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE                                  │
│                                                                          │
│   User Action ──▶ GameProgress Hook ──▶ Context Update ──▶ UI Update   │
│                              │                                           │
│                              ▼                                           │
│                       ┌──────────────┐                                  │
│                       │ localStorage │ (Immediate)                      │
│                       └──────────────┘                                  │
│                              │                                           │
│                              ▼                                           │
│                       ┌──────────────┐                                  │
│                       │   Backend    │ (Debounced sync)                │
│                       │   Postgres   │                                  │
│                       └──────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "react-confetti": "^6.1.0",
    "confetti-js": "^0.0.18",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.3"
  }
}
```

**Installation command:**
```bash
npm install react-confetti confetti-js date-fns recharts
```

**Libraries explained:**
- `react-confetti`: Celebration animations
- `confetti-js`: Alternative confetti implementation
- `date-fns`: Date manipulation for streaks
- `recharts`: Progress charts for parent dashboard

---

## 3. File Structure

Create the following new files:

```
src/
├── context/
│   └── GamificationContext.jsx      # NEW - XP, badges, streaks state
│
├── components/
│   └── Gamification/
│       ├── XPBar.jsx                # NEW - Experience progress bar
│       ├── LevelIndicator.jsx       # NEW - Current level display
│       ├── StreakCounter.jsx        # NEW - Daily streak counter
│       ├── BadgeDisplay.jsx         # NEW - Achievement badges grid
│       ├── BadgeCard.jsx            # NEW - Individual badge component
│       ├── RewardPopup.jsx          # NEW - Celebration overlay
│       ├── ConfettiEffect.jsx       # NEW - Confetti animation
│       ├── DailyChallenge.jsx       # NEW - Daily goal widget
│       ├── ProgressWidget.jsx       # NEW - Compact progress display
│       └── AchievementToast.jsx     # NEW - Small notification
│
├── pages/
│   └── AchievementsPage.jsx         # NEW - Full achievements view
│
├── hooks/
│   ├── useGameProgress.js           # NEW - XP/level calculations
│   ├── useAchievements.js           # NEW - Badge unlock logic
│   ├── useStreaks.js                # NEW - Streak management
│   └── useCelebration.js            # NEW - Celebration triggers
│
├── utils/
│   ├── xpCalculations.js            # NEW - XP formulas
│   ├── achievementDefinitions.js    # NEW - Badge criteria
│   └── streakUtils.js               # NEW - Streak date logic
│
└── constants/
    └── gamificationConstants.js      # NEW - XP values, level thresholds
```

---

## 4. Data Models

### 4.1 User Progress Schema

```typescript
interface UserProgress {
  userId: string;
  currentXP: number;
  currentLevel: number;
  totalXP: number;              // Lifetime XP earned
  xpToNextLevel: number;
  streak: StreakData;
  badges: Badge[];
  dailyChallenge: DailyChallenge;
  statistics: UserStatistics;
  lastActive: string;           // ISO timestamp
}

interface StreakData {
  current: number;              // Current streak days
  longest: number;              // Best streak ever
  lastActivityDate: string;     // YYYY-MM-DD format
  freezeAvailable: boolean;     // Can skip one day
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;                 // Emoji or icon name
  category: 'learning' | 'streak' | 'mastery' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;           // ISO timestamp
  progress?: number;            // For progressive badges (0-100)
}

interface DailyChallenge {
  date: string;                 // YYYY-MM-DD
  challenge: ChallengeDefinition;
  progress: number;
  completed: boolean;
  xpReward: number;
}

interface ChallengeDefinition {
  id: string;
  type: 'lessons' | 'questions' | 'flashcards' | 'time' | 'streak';
  target: number;               // e.g., "complete 3 lessons"
  description: string;
  icon: string;
}

interface UserStatistics {
  lessonsCompleted: number;
  questionsAnswered: number;
  flashcardsReviewed: number;
  totalStudyTime: number;       // Minutes
  perfectScores: number;
  subjectProgress: {
    [subject: string]: {
      level: number;
      xp: number;
      lessonsCompleted: number;
    }
  };
}
```

---

## 5. Context Setup

### 5.1 GamificationContext.jsx

**Location:** `src/context/GamificationContext.jsx`

```jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { differenceInCalendarDays, format, isToday } from 'date-fns';
import { calculateLevel, calculateXPForLevel } from '../utils/xpCalculations';
import { checkAchievements } from '../utils/achievementDefinitions';
import { DAILY_CHALLENGES } from '../constants/gamificationConstants';

// Initial state
const initialState = {
  currentXP: 0,
  currentLevel: 1,
  totalXP: 0,
  xpToNextLevel: 100,
  streak: {
    current: 0,
    longest: 0,
    lastActivityDate: null,
    freezeAvailable: true,
  },
  badges: [],
  dailyChallenge: null,
  statistics: {
    lessonsCompleted: 0,
    questionsAnswered: 0,
    flashcardsReviewed: 0,
    totalStudyTime: 0,
    perfectScores: 0,
    subjectProgress: {},
  },
  recentAchievements: [],
  pendingCelebration: null,
};

// Action types
const ACTIONS = {
  EARN_XP: 'EARN_XP',
  LEVEL_UP: 'LEVEL_UP',
  UPDATE_STREAK: 'UPDATE_STREAK',
  UNLOCK_BADGE: 'UNLOCK_BADGE',
  UPDATE_DAILY_CHALLENGE: 'UPDATE_DAILY_CHALLENGE',
  COMPLETE_DAILY_CHALLENGE: 'COMPLETE_DAILY_CHALLENGE',
  UPDATE_STATISTICS: 'UPDATE_STATISTICS',
  SET_PENDING_CELEBRATION: 'SET_PENDING_CELEBRATION',
  CLEAR_PENDING_CELEBRATION: 'CLEAR_PENDING_CELEBRATION',
  LOAD_PROGRESS: 'LOAD_PROGRESS',
  RESET_PROGRESS: 'RESET_PROGRESS',
};

// Reducer
function gamificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.EARN_XP: {
      const newTotalXP = state.totalXP + action.payload.amount;
      const newCurrentXP = state.currentXP + action.payload.amount;
      const xpNeeded = calculateXPForLevel(state.currentLevel + 1);
      
      // Check if level up
      if (newCurrentXP >= xpNeeded) {
        return {
          ...state,
          totalXP: newTotalXP,
          currentXP: newCurrentXP - xpNeeded,
          currentLevel: state.currentLevel + 1,
          xpToNextLevel: calculateXPForLevel(state.currentLevel + 2),
          pendingCelebration: {
            type: 'levelUp',
            level: state.currentLevel + 1,
            xpEarned: action.payload.amount,
            reason: action.payload.reason,
          },
        };
      }
      
      return {
        ...state,
        totalXP: newTotalXP,
        currentXP: newCurrentXP,
        xpToNextLevel: xpNeeded,
        pendingCelebration: action.payload.amount >= 50 ? {
          type: 'bigXP',
          xpEarned: action.payload.amount,
          reason: action.payload.reason,
        } : null,
      };
    }

    case ACTIONS.LEVEL_UP:
      return {
        ...state,
        currentLevel: action.payload.level,
        currentXP: 0,
        xpToNextLevel: calculateXPForLevel(action.payload.level + 1),
      };

    case ACTIONS.UPDATE_STREAK:
      return {
        ...state,
        streak: action.payload,
        pendingCelebration: action.payload.current > state.streak.current && 
          action.payload.current % 7 === 0 ? {
          type: 'streakMilestone',
          streak: action.payload.current,
        } : null,
      };

    case ACTIONS.UNLOCK_BADGE:
      return {
        ...state,
        badges: [...state.badges, action.payload],
        pendingCelebration: {
          type: 'badge',
          badge: action.payload,
        },
      };

    case ACTIONS.UPDATE_DAILY_CHALLENGE:
      return {
        ...state,
        dailyChallenge: action.payload,
      };

    case ACTIONS.COMPLETE_DAILY_CHALLENGE:
      return {
        ...state,
        dailyChallenge: {
          ...state.dailyChallenge,
          completed: true,
        },
        pendingCelebration: {
          type: 'dailyChallenge',
          xpReward: action.payload.xpReward,
        },
      };

    case ACTIONS.UPDATE_STATISTICS:
      return {
        ...state,
        statistics: {
          ...state.statistics,
          ...action.payload,
        },
      };

    case ACTIONS.SET_PENDING_CELEBRATION:
      return {
        ...state,
        pendingCelebration: action.payload,
      };

    case ACTIONS.CLEAR_PENDING_CELEBRATION:
      return {
        ...state,
        pendingCelebration: null,
      };

    case ACTIONS.LOAD_PROGRESS:
      return {
        ...state,
        ...action.payload,
      };

    case ACTIONS.RESET_PROGRESS:
      return initialState;

    default:
      return state;
  }
}

// Context
const GamificationContext = createContext(null);

// Provider component
export function GamificationProvider({ children }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('userGameProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        dispatch({ type: ACTIONS.LOAD_PROGRESS, payload: progress });
        
        // Update streak on app open
        updateStreakOnAppOpen(progress.streak);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    
    // Initialize daily challenge if needed
    initializeDailyChallenge();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('userGameProgress', JSON.stringify(state));
    // TODO: Also sync to backend (debounced)
  }, [state]);

  // Update streak logic on app open
  const updateStreakOnAppOpen = useCallback((currentStreak) => {
    if (!currentStreak.lastActivityDate) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastDate = currentStreak.lastActivityDate;
    
    if (lastDate === today) {
      // Already logged in today, no change
      return;
    }
    
    const daysSince = differenceInCalendarDays(new Date(today), new Date(lastDate));
    
    if (daysSince === 1) {
      // Consecutive day - increment streak
      const newStreak = {
        current: currentStreak.current + 1,
        longest: Math.max(currentStreak.longest, currentStreak.current + 1),
        lastActivityDate: today,
        freezeAvailable: currentStreak.freezeAvailable,
      };
      dispatch({ type: ACTIONS.UPDATE_STREAK, payload: newStreak });
    } else if (daysSince === 2 && currentStreak.freezeAvailable) {
      // Missed 1 day but have freeze - maintain streak
      const newStreak = {
        current: currentStreak.current,
        longest: currentStreak.longest,
        lastActivityDate: today,
        freezeAvailable: false, // Use up the freeze
      };
      dispatch({ type: ACTIONS.UPDATE_STREAK, payload: newStreak });
    } else if (daysSince > 1) {
      // Missed 2+ days - reset streak
      const newStreak = {
        current: 1,
        longest: currentStreak.longest,
        lastActivityDate: today,
        freezeAvailable: true,
      };
      dispatch({ type: ACTIONS.UPDATE_STREAK, payload: newStreak });
    }
  }, []);

  // Initialize or refresh daily challenge
  const initializeDailyChallenge = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (!state.dailyChallenge || state.dailyChallenge.date !== today) {
      // Generate new challenge
      const challenges = DAILY_CHALLENGES;
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      
      dispatch({
        type: ACTIONS.UPDATE_DAILY_CHALLENGE,
        payload: {
          date: today,
          challenge: randomChallenge,
          progress: 0,
          completed: false,
          xpReward: randomChallenge.xpReward,
        },
      });
    }
  }, [state.dailyChallenge]);

  // Action creators
  const earnXP = useCallback((amount, reason) => {
    dispatch({
      type: ACTIONS.EARN_XP,
      payload: { amount, reason },
    });
    
    // Check for new badge unlocks
    const newBadges = checkAchievements(state.statistics, state.badges);
    newBadges.forEach(badge => {
      dispatch({ type: ACTIONS.UNLOCK_BADGE, payload: badge });
    });
    
    // Update daily challenge progress
    updateDailyChallengeProgress(reason, amount);
  }, [state.statistics, state.badges]);

  const updateDailyChallengeProgress = useCallback((action, value) => {
    if (!state.dailyChallenge || state.dailyChallenge.completed) return;
    
    const challenge = state.dailyChallenge.challenge;
    let newProgress = state.dailyChallenge.progress;
    
    switch (challenge.type) {
      case 'lessons':
        if (action === 'lessonCompleted') newProgress += 1;
        break;
      case 'questions':
        if (action === 'questionAnswered') newProgress += 1;
        break;
      case 'flashcards':
        if (action === 'flashcardReviewed') newProgress += value || 1;
        break;
      case 'time':
        if (action === 'studyTime') newProgress += value || 0;
        break;
      default:
        break;
    }
    
    if (newProgress >= challenge.target) {
      dispatch({
        type: ACTIONS.COMPLETE_DAILY_CHALLENGE,
        payload: { xpReward: state.dailyChallenge.xpReward },
      });
      earnXP(state.dailyChallenge.xpReward, 'Daily Challenge Complete!');
    } else {
      dispatch({
        type: ACTIONS.UPDATE_DAILY_CHALLENGE,
        payload: {
          ...state.dailyChallenge,
          progress: newProgress,
        },
      });
    }
  }, [state.dailyChallenge, earnXP]);

  const updateStatistics = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_STATISTICS, payload: updates });
  }, []);

  const clearCelebration = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_PENDING_CELEBRATION });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_PROGRESS });
  }, []);

  const value = {
    // State
    ...state,
    // Actions
    earnXP,
    updateStatistics,
    clearCelebration,
    resetProgress,
    updateStreakOnAppOpen,
    initializeDailyChallenge,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

// Hook
export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used within a GamificationProvider');
  }
  return context;
}

export default GamificationContext;
```

### 5.2 Wrap App with Provider

**Update:** `src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';

function App() {
    return (
        <LessonProvider>
            <GamificationProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/study" element={<StudyPage />} />
                        <Route path="/achievements" element={<AchievementsPage />} />
                    </Routes>
                </Router>
            </GamificationProvider>
        </LessonProvider>
    );
}

export default App;
```

---

## 6. Component Implementations

### 6.1 XPBar.jsx

**Location:** `src/components/Gamification/XPBar.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';

const XPBar = ({ compact = false, showLabel = true }) => {
  const { currentXP, xpToNextLevel, currentLevel } = useGamificationContext();
  
  const progress = (currentXP / xpToNextLevel) * 100;
  const isNearLevel = progress > 80;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-nanobanana-yellow px-2 py-1 rounded-full border-2 border-black text-xs font-bold">
          <Star className="w-3 h-3 fill-black" />
          {currentLevel}
        </div>
        <div className="flex-1 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden min-w-[60px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${isNearLevel ? 'bg-gradient-to-r from-nanobanana-yellow to-orange-400' : 'bg-nanobanana-yellow'}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-nanobanana-yellow text-black" />
            <span className="font-bold font-comic">Level {currentLevel}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentXP} / {xpToNextLevel} XP
          </span>
        </div>
      )}
      
      <div className="relative h-6 bg-gray-200 rounded-full border-4 border-black overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-nanobanana-yellow via-yellow-400 to-orange-400 relative"
        >
          {/* Shimmer effect when near level up */}
          {isNearLevel && (
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          )}
        </motion.div>
        
        {/* Sparkles at the end of progress bar */}
        {isNearLevel && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
          </motion.div>
        )}
      </div>
      
      {/* Next level preview */}
      {showLabel && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          {xpToNextLevel - currentXP} XP to Level {currentLevel + 1}! 🎉
        </p>
      )}
    </div>
  );
};

export default XPBar;
```

### 6.2 StreakCounter.jsx

**Location:** `src/components/Gamification/StreakCounter.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';

const StreakCounter = ({ compact = false }) => {
  const { streak } = useGamificationContext();
  
  const getStreakColor = (days) => {
    if (days >= 30) return 'from-purple-500 to-pink-500';
    if (days >= 14) return 'from-orange-500 to-red-500';
    if (days >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getFlameAnimation = (days) => {
    if (days >= 7) {
      return {
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
      };
    }
    return {
      scale: [1, 1.1, 1],
    };
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-2 border-black">
        <motion.div
          animate={getFlameAnimation(streak.current)}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
        </motion.div>
        <span className="font-bold text-sm">{streak.current}</span>
        {streak.freezeAvailable && (
          <Shield className="w-4 h-4 text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-comic flex items-center gap-2">
          <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
          Day Streak
        </h3>
        {streak.freezeAvailable && (
          <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full border-2 border-blue-200">
            <Shield className="w-3 h-3 text-blue-500" />
            <span className="font-bold text-blue-700">Freeze</span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Large streak number */}
        <motion.div
          animate={getFlameAnimation(streak.current)}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`
            text-5xl font-black font-comic text-center 
            bg-gradient-to-br ${getStreakColor(streak.current)}
            bg-clip-text text-transparent
          `}
        >
          {streak.current}
        </motion.div>
        
        <p className="text-center text-sm text-gray-600 font-medium mt-1">
          days in a row! 🔥
        </p>
      </div>

      {/* Longest streak badge */}
      {streak.longest > streak.current && (
        <div className="mt-3 pt-3 border-t-2 border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            <span className="font-bold">Personal Best:</span> {streak.longest} days 🏆
          </p>
        </div>
      )}

      {/* Motivational message */}
      <div className="mt-3 p-2 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-xs text-yellow-800 text-center font-medium">
          {streak.current >= 7 
            ? "Wow! You're on fire! 🔥"
            : "Keep learning daily to build your streak!"}
        </p>
      </div>
    </div>
  );
};

export default StreakCounter;
```

### 6.3 BadgeDisplay.jsx

**Location:** `src/components/Gamification/BadgeDisplay.jsx`

```jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';
import BadgeCard from './BadgeCard';
import { ALL_BADGES } from '../utils/achievementDefinitions';

const BadgeDisplay = ({ limit = null, category = null }) => {
  const { badges } = useGamificationContext();
  
  // Get all possible badges
  const allBadges = ALL_BADGES;
  
  // Filter by category if specified
  const filteredBadges = category 
    ? allBadges.filter(b => b.category === category)
    : allBadges;
  
  // Separate unlocked and locked badges
  const unlockedIds = new Set(badges.map(b => b.id));
  const displayBadges = filteredBadges.map(badge => ({
    ...badge,
    unlocked: unlockedIds.has(badge.id),
    unlockedAt: badges.find(b => b.id === badge.id)?.unlockedAt,
  }));
  
  // Apply limit if specified
  const badgesToShow = limit ? displayBadges.slice(0, limit) : displayBadges;
  
  const unlockedCount = badgesToShow.filter(b => b.unlocked).length;
  const totalCount = badgesToShow.length;

  return (
    <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-comic flex items-center gap-2">
          <Trophy className="w-5 h-5 fill-nanobanana-yellow text-black" />
          Achievements
        </h3>
        <div className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full border-2 border-black">
          {unlockedCount}/{totalCount}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence>
          {badgesToShow.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <BadgeCard badge={badge} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more hint if limited */}
      {limit && totalCount > limit && (
        <div className="mt-4 text-center">
          <button className="text-sm text-nanobanana-blue font-bold hover:underline">
            View all {totalCount} badges →
          </button>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
```

### 6.4 BadgeCard.jsx

**Location:** `src/components/Gamification/BadgeCard.jsx`

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star } from 'lucide-react';

const RARITY_COLORS = {
  common: 'from-gray-300 to-gray-400',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_BORDERS = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

const BadgeCard = ({ badge }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.1, rotate: badge.unlocked ? 5 : 0 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className={`
          relative aspect-square rounded-2xl border-4 cursor-pointer
          ${badge.unlocked 
            ? `${RARITY_BORDERS[badge.rarity]} bg-gradient-to-br ${RARITY_COLORS[badge.rarity]}` 
            : 'border-gray-300 bg-gray-100'
          }
          shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          flex flex-col items-center justify-center p-2
          transition-all
        `}
      >
        {/* Badge Icon/Emoji */}
        <div className={`text-3xl ${!badge.unlocked && 'opacity-30 grayscale'}`}>
          {badge.unlocked ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
        </div>

        {/* Rarity indicator for unlocked badges */}
        {badge.unlocked && badge.rarity !== 'common' && (
          <div className="absolute top-1 right-1">
            <Star className={`w-3 h-3 fill-yellow-400 text-yellow-600`} />
          </div>
        )}

        {/* Progress indicator for progressive badges */}
        {!badge.unlocked && badge.progress !== undefined && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${badge.progress}%` }}
                className="h-full bg-nanobanana-blue"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black text-white rounded-xl text-xs pointer-events-none"
          >
            <div className="font-bold mb-1">{badge.name}</div>
            <div className="text-gray-300">{badge.description}</div>
            {badge.unlocked && badge.unlockedAt && (
              <div className="text-gray-400 mt-1 text-[10px]">
                Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
              </div>
            )}
            {!badge.unlocked && badge.progress !== undefined && (
              <div className="text-yellow-400 mt-1">
                Progress: {badge.progress}%
              </div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeCard;
```

### 6.5 RewardPopup.jsx

**Location:** `src/components/Gamification/RewardPopup.jsx`

```jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Flame, Gift } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';
import ConfettiEffect from './ConfettiEffect';

const RewardPopup = () => {
  const { pendingCelebration, clearCelebration } = useGamificationContext();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (pendingCelebration) {
      const timer = setTimeout(() => {
        clearCelebration();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingCelebration, clearCelebration]);

  if (!pendingCelebration) return null;

  const renderContent = () => {
    switch (pendingCelebration.type) {
      case 'levelUp':
        return (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1,
                times: [0, 0.5, 1],
              }}
              className="w-24 h-24 bg-gradient-to-br from-nanobanana-yellow to-orange-400 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
            >
              <Star className="w-12 h-12 fill-white text-black" />
            </motion.div>
            <h2 className="text-4xl font-black font-comic mb-2">
              Level Up! 🎉
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-2">
              You're now Level {pendingCelebration.level}!
            </p>
            <p className="text-sm text-gray-600">
              +{pendingCelebration.xpEarned} XP earned
            </p>
          </>
        );

      case 'badge':
        return (
          <>
            <motion.div
              animate={{
                scale: [0, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.8,
              }}
              className={`
                w-24 h-24 rounded-full border-4 
                ${pendingCelebration.badge.rarity === 'legendary' ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-orange-500' : 
                  pendingCelebration.badge.rarity === 'epic' ? 'border-purple-500 bg-gradient-to-br from-purple-400 to-purple-600' :
                  'border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600'}
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                flex items-center justify-center mb-4 text-5xl
              `}
            >
              {pendingCelebration.badge.icon}
            </motion.div>
            <h2 className="text-4xl font-black font-comic mb-2">
              New Badge! 🏆
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-2">
              {pendingCelebration.badge.name}
            </p>
            <p className="text-sm text-gray-600">
              {pendingCelebration.badge.description}
            </p>
          </>
        );

      case 'streakMilestone':
        return (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
              className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
            >
              <Flame className="w-12 h-12 fill-white text-orange-600" />
            </motion.div>
            <h2 className="text-4xl font-black font-comic mb-2">
              Amazing Streak! 🔥
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-2">
              {pendingCelebration.streak} days in a row!
            </p>
            <p className="text-sm text-gray-600">
              You're unstoppable! Keep it up!
            </p>
          </>
        );

      case 'dailyChallenge':
        return (
          <>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
              className="w-24 h-24 bg-gradient-to-br from-nanobanana-green to-green-600 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
            >
              <Gift className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black font-comic mb-2">
              Challenge Complete! ✨
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-2">
              Daily Goal Achieved!
            </p>
            <p className="text-sm text-gray-600">
              +{pendingCelebration.xpReward} XP bonus earned!
            </p>
          </>
        );

      case 'bigXP':
        return (
          <>
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
              }}
              className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black font-comic mb-2">
              Awesome Work! 💪
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-2">
              +{pendingCelebration.xpEarned} XP!
            </p>
            <p className="text-sm text-gray-600">
              {pendingCelebration.reason}
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {pendingCelebration && (
        <>
          {/* Confetti */}
          <ConfettiEffect />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={clearCelebration}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 200,
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full text-center relative"
            >
              {/* Close button */}
              <button
                onClick={clearCelebration}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {renderContent()}

              {/* Continue button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCelebration}
                className="mt-6 px-8 py-3 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Awesome! Let's Continue 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RewardPopup;
```

### 6.6 ConfettiEffect.jsx

**Location:** `src/components/Gamification/ConfettiEffect.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

const ConfettiEffect = ({ duration = 5000 }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after duration
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [duration]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      numberOfPieces={200}
      recycle={false}
      gravity={0.3}
      colors={['#FFD93D', '#4169E1', '#32CD32', '#FF6B9D', '#9B59B6']}
    />
  );
};

export default ConfettiEffect;
```

### 6.7 DailyChallenge.jsx

**Location:** `src/components/Gamification/DailyChallenge.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';

const DailyChallenge = ({ compact = false }) => {
  const { dailyChallenge } = useGamificationContext();

  if (!dailyChallenge) return null;

  const progress = (dailyChallenge.progress / dailyChallenge.challenge.target) * 100;
  const isComplete = dailyChallenge.completed;

  if (compact) {
    return (
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-full border-2 
        ${isComplete 
          ? 'bg-green-50 border-green-500' 
          : 'bg-white border-black'
        }
      `}>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Target className="w-5 h-5 text-nanobanana-blue" />
        )}
        <span className="text-xs font-bold">
          {isComplete ? 'Done!' : `${dailyChallenge.progress}/${dailyChallenge.challenge.target}`}
        </span>
      </div>
    );
  }

  return (
    <div className={`
      bg-white p-4 rounded-2xl border-4 border-black 
      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      ${isComplete && 'bg-green-50 border-green-500'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-comic flex items-center gap-2">
          <Target className="w-5 h-5 text-nanobanana-blue" />
          Daily Challenge
        </h3>
        <div className="flex items-center gap-1 text-xs bg-yellow-50 px-2 py-1 rounded-full border-2 border-yellow-300">
          <Clock className="w-3 h-3 text-yellow-700" />
          <span className="font-bold text-yellow-700">Today</span>
        </div>
      </div>

      {/* Challenge description */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{dailyChallenge.challenge.icon}</span>
          <p className="font-medium text-gray-700">
            {dailyChallenge.challenge.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-bold text-gray-700">
            {dailyChallenge.progress} / {dailyChallenge.challenge.target}
          </span>
          <span className="font-bold text-nanobanana-blue">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${isComplete 
              ? 'bg-gradient-to-r from-green-400 to-green-600' 
              : 'bg-gradient-to-r from-nanobanana-blue to-blue-600'
            }`}
          />
        </div>
      </div>

      {/* Reward info */}
      <div className={`
        p-2 rounded-xl border-2 text-center
        ${isComplete 
          ? 'bg-green-100 border-green-300' 
          : 'bg-yellow-50 border-yellow-200'
        }
      `}>
        {isComplete ? (
          <p className="text-sm font-bold text-green-700">
            ✅ Challenge Complete! +{dailyChallenge.xpReward} XP earned!
          </p>
        ) : (
          <p className="text-sm font-bold text-yellow-700">
            🎁 Reward: {dailyChallenge.xpReward} XP
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
```

### 6.8 ProgressWidget.jsx

**Location:** `src/components/Gamification/ProgressWidget.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import XPBar from './XPBar';
import StreakCounter from './StreakCounter';
import DailyChallenge from './DailyChallenge';

const ProgressWidget = ({ layout = 'horizontal' }) => {
  if (layout === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <XPBar compact />
        <StreakCounter compact />
        <DailyChallenge compact />
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className="space-y-3">
        <XPBar />
        <StreakCounter />
        <DailyChallenge />
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <XPBar />
      <StreakCounter />
      <DailyChallenge />
    </div>
  );
};

export default ProgressWidget;
```

### 6.9 AchievementToast.jsx

**Location:** `src/components/Gamification/AchievementToast.jsx`

```jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const AchievementToast = ({ achievement, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [achievement, duration, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl border-2 border-black flex items-center justify-center text-2xl">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-bold text-gray-500 uppercase">Achievement</span>
              </div>
              <p className="font-bold font-comic">{achievement.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
```

---

## 7. Hook Implementations

### 7.1 useGameProgress.js

**Location:** `src/hooks/useGameProgress.js`

```javascript
import { useCallback } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { XP_VALUES } from '../constants/gamificationConstants';

export function useGameProgress() {
  const { earnXP, updateStatistics } = useGamificationContext();

  const recordLessonComplete = useCallback((subject, duration) => {
    // Award XP
    earnXP(XP_VALUES.LESSON_COMPLETE, 'Completed a lesson!');
    
    // Update statistics
    updateStatistics({
      lessonsCompleted: (prev) => prev + 1,
      totalStudyTime: (prev) => prev + duration,
      subjectProgress: {
        [subject]: {
          lessonsCompleted: (prev) => (prev?.lessonsCompleted || 0) + 1,
        },
      },
    });
  }, [earnXP, updateStatistics]);

  const recordQuestionAnswered = useCallback((correct, difficulty = 'medium') => {
    if (correct) {
      const xpAmount = difficulty === 'hard' ? XP_VALUES.QUESTION_CORRECT_HARD :
                       difficulty === 'easy' ? XP_VALUES.QUESTION_CORRECT_EASY :
                       XP_VALUES.QUESTION_CORRECT;
      earnXP(xpAmount, 'Correct answer!');
    }
    
    updateStatistics({
      questionsAnswered: (prev) => prev + 1,
    });
  }, [earnXP, updateStatistics]);

  const recordFlashcardReviewed = useCallback((count = 1) => {
    earnXP(XP_VALUES.FLASHCARD_REVIEWED * count, `Reviewed ${count} flashcard${count > 1 ? 's' : ''}!`);
    
    updateStatistics({
      flashcardsReviewed: (prev) => prev + count,
    });
  }, [earnXP, updateStatistics]);

  const recordPerfectScore = useCallback(() => {
    earnXP(XP_VALUES.PERFECT_SCORE, 'Perfect score! Amazing! 🌟');
    
    updateStatistics({
      perfectScores: (prev) => prev + 1,
    });
  }, [earnXP, updateStatistics]);

  const recordStudyTime = useCallback((minutes) => {
    // Award XP for every 10 minutes
    const xpAmount = Math.floor(minutes / 10) * XP_VALUES.STUDY_TIME;
    if (xpAmount > 0) {
      earnXP(xpAmount, `${minutes} minutes of learning!`);
    }
    
    updateStatistics({
      totalStudyTime: (prev) => prev + minutes,
    });
  }, [earnXP, updateStatistics]);

  return {
    recordLessonComplete,
    recordQuestionAnswered,
    recordFlashcardReviewed,
    recordPerfectScore,
    recordStudyTime,
  };
}
```

### 7.2 useAchievements.js

**Location:** `src/hooks/useAchievements.js`

```javascript
import { useCallback, useEffect } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { checkAchievements } from '../utils/achievementDefinitions';

export function useAchievements() {
  const { badges, statistics } = useGamificationContext();

  // Check for new achievements whenever statistics change
  useEffect(() => {
    const newBadges = checkAchievements(statistics, badges);
    // Badges are automatically unlocked in GamificationContext
  }, [statistics, badges]);

  const getProgressForBadge = useCallback((badgeId) => {
    // Return progress percentage for progressive badges
    // This will be used to show "80% to next badge" type info
    // Implementation depends on badge criteria
    return 0;
  }, [statistics]);

  const getNextBadgeSuggestion = useCallback(() => {
    // Find the closest achievable badge and suggest what to do
    // Example: "Review 5 more flashcards to unlock 'Flashcard Master'!"
    return null;
  }, [statistics, badges]);

  return {
    badges,
    getProgressForBadge,
    getNextBadgeSuggestion,
  };
}
```

### 7.3 useStreaks.js

**Location:** `src/hooks/useStreaks.js`

```javascript
import { useCallback } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { format, differenceInCalendarDays } from 'date-fns';

export function useStreaks() {
  const { streak, updateStreakOnAppOpen } = useGamificationContext();

  const getStreakStatus = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastDate = streak.lastActivityDate;

    if (!lastDate) {
      return { status: 'none', message: 'Start your streak today!' };
    }

    if (lastDate === today) {
      return { status: 'active', message: `${streak.current} day streak! 🔥` };
    }

    const daysSince = differenceInCalendarDays(new Date(today), new Date(lastDate));

    if (daysSince === 1) {
      return { status: 'pending', message: 'Log in today to continue your streak!' };
    }

    if (daysSince === 2 && streak.freezeAvailable) {
      return { status: 'frozen', message: 'Streak saved by freeze! 🛡️' };
    }

    return { status: 'broken', message: 'Start a new streak today!' };
  }, [streak]);

  const getMotivationalMessage = useCallback(() => {
    if (streak.current >= 30) {
      return "You're a learning legend! 👑";
    }
    if (streak.current >= 14) {
      return "Two weeks strong! Keep it up! 💪";
    }
    if (streak.current >= 7) {
      return "One week streak! You're on fire! 🔥";
    }
    if (streak.current >= 3) {
      return "Great start! Keep going! ⭐";
    }
    return "Every day counts! Start your streak! 🚀";
  }, [streak.current]);

  return {
    streak,
    getStreakStatus,
    getMotivationalMessage,
  };
}
```

### 7.4 useCelebration.js

**Location:** `src/hooks/useCelebration.js`

```javascript
import { useCallback, useEffect } from 'react';
import { useGamificationContext } from '../context/GamificationContext';

export function useCelebration() {
  const { pendingCelebration, clearCelebration } = useGamificationContext();

  const triggerCustomCelebration = useCallback((celebrationData) => {
    // Manually trigger a celebration
    // Useful for special events, milestones, etc.
  }, []);

  // Play sound effect when celebration appears
  useEffect(() => {
    if (pendingCelebration) {
      playCelebrationSound(pendingCelebration.type);
    }
  }, [pendingCelebration]);

  const playCelebrationSound = (type) => {
    // Play appropriate sound based on celebration type
    // Can use Web Audio API or HTML5 Audio
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Audio not available');
    }
  };

  return {
    pendingCelebration,
    clearCelebration,
    triggerCustomCelebration,
  };
}
```

---

## 8. Utility & Constant Files

### 8.1 xpCalculations.js

**Location:** `src/utils/xpCalculations.js`

```javascript
/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP) {
  // Formula: level = floor(sqrt(totalXP / 50))
  // This creates a curve where early levels are fast, later levels slower
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

/**
 * Calculate XP required for a specific level
 */
export function calculateXPForLevel(level) {
  // Inverse of level formula
  // XP needed = 50 * (level - 1)^2
  return 50 * Math.pow(level - 1, 2);
}

/**
 * Calculate XP needed to reach next level
 */
export function calculateXPToNextLevel(currentXP, currentLevel) {
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  return xpForNextLevel - (currentXP - xpForCurrentLevel);
}

/**
 * Get level progress percentage
 */
export function getLevelProgress(currentXP, currentLevel) {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const xpIntoCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  return (xpIntoCurrentLevel / xpNeededForLevel) * 100;
}

/**
 * Example progression table
 * 
 * Level 1: 0 XP
 * Level 2: 50 XP
 * Level 3: 200 XP
 * Level 4: 450 XP
 * Level 5: 800 XP
 * Level 10: 4050 XP
 * Level 20: 18050 XP
 * Level 30: 42050 XP
 */
```

### 8.2 achievementDefinitions.js

**Location:** `src/utils/achievementDefinitions.js`

```javascript
/**
 * All possible badges in the system
 */
export const ALL_BADGES = [
  // Learning Category
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎓',
    category: 'learning',
    rarity: 'common',
    criteria: (stats) => stats.lessonsCompleted >= 1,
  },
  {
    id: 'lesson_master_10',
    name: 'Lesson Explorer',
    description: 'Complete 10 lessons',
    icon: '📚',
    category: 'learning',
    rarity: 'common',
    criteria: (stats) => stats.lessonsCompleted >= 10,
  },
  {
    id: 'lesson_master_50',
    name: 'Study Champion',
    description: 'Complete 50 lessons',
    icon: '🏆',
    category: 'learning',
    rarity: 'rare',
    criteria: (stats) => stats.lessonsCompleted >= 50,
  },
  {
    id: 'lesson_master_100',
    name: 'Learning Legend',
    description: 'Complete 100 lessons',
    icon: '👑',
    category: 'learning',
    rarity: 'epic',
    criteria: (stats) => stats.lessonsCompleted >= 100,
  },

  // Question Mastery
  {
    id: 'first_correct',
    name: 'Getting Started',
    description: 'Answer your first question correctly',
    icon: '✅',
    category: 'mastery',
    rarity: 'common',
    criteria: (stats) => stats.questionsAnswered >= 1,
  },
  {
    id: 'question_master_100',
    name: 'Answer Expert',
    description: 'Answer 100 questions correctly',
    icon: '🎯',
    category: 'mastery',
    rarity: 'rare',
    criteria: (stats) => stats.questionsAnswered >= 100,
  },
  {
    id: 'perfect_score_1',
    name: 'Perfectionist',
    description: 'Get your first perfect score',
    icon: '⭐',
    category: 'mastery',
    rarity: 'common',
    criteria: (stats) => stats.perfectScores >= 1,
  },
  {
    id: 'perfect_score_10',
    name: 'Quiz Wizard',
    description: 'Get 10 perfect scores',
    icon: '🔮',
    category: 'mastery',
    rarity: 'epic',
    criteria: (stats) => stats.perfectScores >= 10,
  },

  // Flashcard Achievements
  {
    id: 'flashcard_starter',
    name: 'Flashcard Friend',
    description: 'Review 10 flashcards',
    icon: '🃏',
    category: 'learning',
    rarity: 'common',
    criteria: (stats) => stats.flashcardsReviewed >= 10,
  },
  {
    id: 'flashcard_pro',
    name: 'Memory Master',
    description: 'Review 100 flashcards',
    icon: '🧠',
    category: 'learning',
    rarity: 'rare',
    criteria: (stats) => stats.flashcardsReviewed >= 100,
  },

  // Time-based Achievements
  {
    id: 'study_time_5h',
    name: 'Time Traveler',
    description: 'Study for 5 hours total',
    icon: '⏰',
    category: 'learning',
    rarity: 'common',
    criteria: (stats) => stats.totalStudyTime >= 300, // 5 hours in minutes
  },
  {
    id: 'study_time_20h',
    name: 'Dedicated Learner',
    description: 'Study for 20 hours total',
    icon: '📖',
    category: 'learning',
    rarity: 'rare',
    criteria: (stats) => stats.totalStudyTime >= 1200,
  },
  {
    id: 'study_time_50h',
    name: 'Scholar',
    description: 'Study for 50 hours total',
    icon: '🎓',
    category: 'learning',
    rarity: 'epic',
    criteria: (stats) => stats.totalStudyTime >= 3000,
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    criteria: (stats, badges, streak) => streak.current >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak',
    rarity: 'rare',
    criteria: (stats, badges, streak) => streak.current >= 7,
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    category: 'streak',
    rarity: 'epic',
    criteria: (stats, badges, streak) => streak.current >= 30,
  },
  {
    id: 'streak_100',
    name: 'Legendary Streak',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    criteria: (stats, badges, streak) => streak.current >= 100,
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 8 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    criteria: () => false, // Manually triggered
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    criteria: () => false, // Manually triggered
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Study on Saturday and Sunday',
    icon: '🏄',
    category: 'special',
    rarity: 'rare',
    criteria: () => false, // Manually triggered
  },
];

/**
 * Check which new badges should be unlocked
 */
export function checkAchievements(statistics, currentBadges, streak = null) {
  const unlockedIds = new Set(currentBadges.map(b => b.id));
  const newBadges = [];

  for (const badge of ALL_BADGES) {
    if (unlockedIds.has(badge.id)) continue;

    const meetsStandard = badge.criteria(statistics, currentBadges, streak);
    if (meetsStandard) {
      newBadges.push({
        ...badge,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return newBadges;
}
```

### 8.3 gamificationConstants.js

**Location:** `src/constants/gamificationConstants.js`

```javascript
/**
 * XP values for different actions
 */
export const XP_VALUES = {
  LESSON_COMPLETE: 50,
  QUESTION_CORRECT: 10,
  QUESTION_CORRECT_EASY: 5,
  QUESTION_CORRECT_HARD: 15,
  FLASHCARD_REVIEWED: 5,
  PERFECT_SCORE: 100,
  STUDY_TIME: 10, // Per 10 minutes
  DAILY_CHALLENGE: 50,
  STREAK_BONUS: 20, // Per week of streak
};

/**
 * Daily challenge definitions
 */
export const DAILY_CHALLENGES = [
  {
    id: 'complete_3_lessons',
    type: 'lessons',
    target: 3,
    description: 'Complete 3 lessons today',
    icon: '📚',
    xpReward: 75,
  },
  {
    id: 'answer_20_questions',
    type: 'questions',
    target: 20,
    description: 'Answer 20 questions correctly',
    icon: '❓',
    xpReward: 50,
  },
  {
    id: 'review_30_flashcards',
    type: 'flashcards',
    target: 30,
    description: 'Review 30 flashcards',
    icon: '🃏',
    xpReward: 60,
  },
  {
    id: 'study_30_minutes',
    type: 'time',
    target: 30,
    description: 'Study for 30 minutes',
    icon: '⏰',
    xpReward: 40,
  },
  {
    id: 'maintain_streak',
    type: 'streak',
    target: 1,
    description: 'Keep your learning streak alive',
    icon: '🔥',
    xpReward: 30,
  },
];

/**
 * Level tier thresholds for UI styling
 */
export const LEVEL_TIERS = {
  BEGINNER: { min: 1, max: 5, color: 'blue' },
  INTERMEDIATE: { min: 6, max: 15, color: 'purple' },
  ADVANCED: { min: 16, max: 30, color: 'orange' },
  EXPERT: { min: 31, max: 50, color: 'red' },
  MASTER: { min: 51, max: 999, color: 'gold' },
};
```

---

## 9. Integration with Existing Components

### 9.1 Update StudyPage.jsx

**Location:** `src/pages/StudyPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';
import UploadButton from '../components/Upload/UploadButton';
import UploadModal from '../components/Upload/UploadModal';
import ProgressWidget from '../components/Gamification/ProgressWidget';
import RewardPopup from '../components/Gamification/RewardPopup';
import { useLessonContext } from '../context/LessonContext';
import { useGamificationContext } from '../context/GamificationContext';
import { useGameProgress } from '../hooks/useGameProgress';

const StudyPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState(null);
  const { currentLesson } = useLessonContext();
  const { recordLessonComplete, recordStudyTime } = useGameProgress();

  // Track study time
  useEffect(() => {
    setStudyStartTime(Date.now());
    
    return () => {
      if (studyStartTime) {
        const studyDuration = Math.floor((Date.now() - studyStartTime) / 60000); // Minutes
        if (studyDuration > 0) {
          recordStudyTime(studyDuration);
        }
      }
    };
  }, [currentLesson?.id]);

  // Award XP when lesson is completed
  const handleLessonComplete = () => {
    if (currentLesson) {
      const duration = studyStartTime 
        ? Math.floor((Date.now() - studyStartTime) / 60000)
        : 0;
      recordLessonComplete(currentLesson.subject || 'general', duration);
    }
  };

  return (
    <>
      <MainLayout>
        {/* Progress Widget - Always visible */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <ProgressWidget layout="compact" />
        </div>

        {currentLesson ? (
          <>
            <LessonView 
              lesson={currentLesson} 
              onComplete={handleLessonComplete}
            />
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

      {/* Reward popup - renders outside MainLayout */}
      <RewardPopup />
    </>
  );
};

export default StudyPage;
```

### 9.2 Create AchievementsPage.jsx

**Location:** `src/pages/AchievementsPage.jsx`

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, TrendingUp } from 'lucide-react';
import XPBar from '../components/Gamification/XPBar';
import LevelIndicator from '../components/Gamification/LevelIndicator';
import StreakCounter from '../components/Gamification/StreakCounter';
import BadgeDisplay from '../components/Gamification/BadgeDisplay';
import DailyChallenge from '../components/Gamification/DailyChallenge';
import { useGamificationContext } from '../context/GamificationContext';

const AchievementsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { statistics, currentLevel, totalXP } = useGamificationContext();

  const categories = [
    { id: 'all', label: 'All Badges', icon: Trophy },
    { id: 'learning', label: 'Learning', icon: Star },
    { id: 'streak', label: 'Streaks', icon: TrendingUp },
    { id: 'mastery', label: 'Mastery', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/study"
            className="inline-flex items-center gap-2 text-nanobanana-blue font-bold hover:underline mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Study
          </Link>
          
          <h1 className="text-4xl font-black font-comic mb-2">
            Your Progress 🏆
          </h1>
          <p className="text-gray-600">
            Keep learning to unlock more achievements!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <XPBar showLabel />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StreakCounter />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DailyChallenge />
          </motion.div>
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <h2 className="font-bold font-comic text-xl mb-4">Learning Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Lessons"
              value={statistics.lessonsCompleted}
              icon="📚"
            />
            <StatCard
              label="Questions"
              value={statistics.questionsAnswered}
              icon="❓"
            />
            <StatCard
              label="Flashcards"
              value={statistics.flashcardsReviewed}
              icon="🃏"
            />
            <StatCard
              label="Study Time"
              value={`${Math.floor(statistics.totalStudyTime / 60)}h ${statistics.totalStudyTime % 60}m`}
              icon="⏰"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
                border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                transition-all whitespace-nowrap
                ${selectedCategory === cat.id
                  ? 'bg-nanobanana-yellow'
                  : 'bg-white hover:bg-gray-100'
                }
              `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <BadgeDisplay 
            category={selectedCategory === 'all' ? null : selectedCategory}
          />
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-black font-comic">{value}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
  </div>
);

export default AchievementsPage;
```

### 9.3 Add Link to HomePage

**Update:** `src/pages/HomePage.jsx`

Add achievements link to navigation:

```jsx
<nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
  <div className="text-2xl font-black font-comic text-nanobanana-blue flex items-center gap-2">
    <div className="w-8 h-8 bg-nanobanana-yellow rounded-full border-2 border-black"></div>
    K-6 AI Tutor
  </div>
  <div className="hidden md:flex gap-6 font-bold">
    <a href="#features" className="hover:text-nanobanana-blue transition-colors">Features</a>
    <Link to="/achievements" className="hover:text-nanobanana-blue transition-colors">Achievements</Link>
    <a href="#about" className="hover:text-nanobanana-blue transition-colors">About</a>
  </div>
  <Link to="/study" className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-nanobanana-blue transition-colors">
    Login
  </Link>
</nav>
```

---

## 10. Progression Formula & Balance

### 10.1 XP Balance Philosophy

**Goals:**
- Early levels feel rewarding (fast progression)
- Later levels require commitment (slower progression)
- Daily play should net ~1-2 levels per week for active users
- Streak bonuses reward consistency

**Typical Session XP:**
```
15-minute lesson        = 50 XP
10 questions (80% acc.) = 80 XP
20 flashcards          = 100 XP
Daily challenge        = 50 XP
Total per session      = 280 XP

Level 5 requires ~800 XP
Level 10 requires ~4050 XP
Level 20 requires ~18050 XP
```

### 10.2 Recommended Tuning

Start conservative, then adjust based on engagement metrics:

```javascript
// If users level too slowly → Increase base XP values
// If users level too quickly → Make level curve steeper
// If streaks aren't valued → Increase streak milestone bonuses
// If badges feel meaningless → Make criteria harder
```

---

## 11. Parent Dashboard Features

### 11.1 ParentProgress.jsx (Bonus Component)

**Location:** `src/components/Parent/ParentProgress.jsx`

```jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGamificationContext } from '../../context/GamificationContext';

const ParentProgress = () => {
  const { statistics, currentLevel, streak } = useGamificationContext();

  // Mock data - replace with actual historical data
  const weeklyData = [
    { day: 'Mon', xp: 120, minutes: 25 },
    { day: 'Tue', xp: 200, minutes: 35 },
    { day: 'Wed', xp: 180, minutes: 30 },
    { day: 'Thu', xp: 250, minutes: 40 },
    { day: 'Fri', xp: 150, minutes: 20 },
    { day: 'Sat', xp: 300, minutes: 45 },
    { day: 'Sun', xp: 220, minutes: 35 },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-bold font-comic text-2xl mb-6">Weekly Progress</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <div className="text-3xl font-black">{currentLevel}</div>
          <div className="text-sm text-gray-600">Current Level</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
          <div className="text-3xl font-black">{streak.current}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="text-3xl font-black">{Math.floor(statistics.totalStudyTime / 60)}h</div>
          <div className="text-sm text-gray-600">Total Time</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">This Week's Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="xp" stroke="#4169E1" strokeWidth={2} />
            <Line type="monotone" dataKey="minutes" stroke="#32CD32" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <h4 className="font-bold mb-2 text-sm">💡 Insights</h4>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Most active on Saturdays</li>
          <li>• Consistent {streak.current}-day learning streak</li>
          <li>• Completed {statistics.lessonsCompleted} lessons this month</li>
        </ul>
      </div>
    </div>
  );
};

export default ParentProgress;
```

---

## 12. Testing Checklist

### Functionality Tests

- [ ] **XP System**
  - [ ] XP awarded for completing lessons
  - [ ] XP awarded for correct answers
  - [ ] XP awarded for flashcard reviews
  - [ ] Level up triggers at correct thresholds
  - [ ] Progress bar animates smoothly
  - [ ] XP persists in localStorage

- [ ] **Streak System**
  - [ ] Streak increments on consecutive days
  - [ ] Streak resets after missing 2+ days
  - [ ] Freeze saves streak for 1 missed day
  - [ ] Streak displays correctly
  - [ ] Motivational messages change with streak length

- [ ] **Badges**
  - [ ] First lesson badge unlocks
  - [ ] Milestone badges unlock at thresholds
  - [ ] Badge display shows locked/unlocked state
  - [ ] Tooltip shows badge details
  - [ ] Progress indicators work for progressive badges

- [ ] **Celebrations**
  - [ ] Level up triggers celebration popup
  - [ ] Badge unlock shows celebration
  - [ ] Streak milestone celebrates
  - [ ] Daily challenge complete shows reward
  - [ ] Confetti animates properly
  - [ ] Auto-dismiss after 5 seconds

- [ ] **Daily Challenge**
  - [ ] New challenge generated each day
  - [ ] Progress updates correctly
  - [ ] Completion awards XP
  - [ ] Challenge resets at midnight

### Integration Tests

- [ ] Gamification context loads on app start
- [ ] Progress saves to localStorage
- [ ] All components access context correctly
- [ ] Reward popup doesn't block critical UI
- [ ] Works with existing lesson/chat system

### Edge Cases

- [ ] Rapid XP earning (spam clicks)
- [ ] Level overflow (very high levels)
- [ ] Date changes while app open
- [ ] localStorage cleared mid-session
- [ ] Negative XP values (shouldn't happen)
- [ ] Badge unlock race conditions

### Performance

- [ ] Confetti doesn't lag on low-end devices
- [ ] Badge grid renders quickly
- [ ] Context updates don't cause re-render storms
- [ ] localStorage writes are not excessive

---

## Summary

This gamification system provides:

1. **XPBar** - Visual progress toward next level
2. **StreakCounter** - Daily learning habit tracker
3. **BadgeDisplay** - Achievement collection
4. **RewardPopup** - Celebration moments
5. **DailyChallenge** - Daily goals
6. **GamificationContext** - Centralized state management
7. **useGameProgress** - Easy reward triggers
8. **AchievementsPage** - Full progress view
9. **Parent dashboard** - Analytics for guardians
10. **Balanced progression** - Engaging but not manipulative

**Estimated implementation time:** 4-6 days for a developer familiar with React and game design principles.

**Next Steps:**
1. Implement core context and components
2. Integrate with existing lesson/quiz flows
3. Test progression balance with real users
4. Add backend sync for cross-device progress
5. Expand badge system based on usage patterns
