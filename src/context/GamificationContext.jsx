import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { gamificationAPI } from '../services/api/gamificationAPI';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  // XP and Level
  currentXP: 0,
  totalXP: 0,
  currentLevel: 1,
  xpToNextLevel: 100,
  percentToNextLevel: 0,

  // Streak
  streak: {
    current: 0,
    longest: 0,
    isActiveToday: false,
    freezeAvailable: false,
  },

  // Badges
  badges: [],
  badgesEarned: 0,
  totalBadges: 0,

  // Statistics
  statistics: {
    lessonsCompleted: 0,
    questionsAnswered: 0,
    flashcardsReviewed: 0,
    totalStudyTime: 0,
    perfectScores: 0,
  },

  // UI State
  recentAchievements: [],
  pendingCelebration: null,

  // Loading state
  isLoading: true,
  isInitialized: false,
  loadedChildId: null,
  error: null,
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOAD_STATS: 'LOAD_STATS',
  LOAD_BADGES: 'LOAD_BADGES',
  UPDATE_XP: 'UPDATE_XP',
  UPDATE_STREAK: 'UPDATE_STREAK',
  ADD_BADGE: 'ADD_BADGE',
  SET_PENDING_CELEBRATION: 'SET_PENDING_CELEBRATION',
  CLEAR_PENDING_CELEBRATION: 'CLEAR_PENDING_CELEBRATION',
  ADD_RECENT_ACHIEVEMENT: 'ADD_RECENT_ACHIEVEMENT',
  CLEAR_RECENT_ACHIEVEMENT: 'CLEAR_RECENT_ACHIEVEMENT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_STATE: 'CLEAR_STATE',
  UPDATE_STATISTICS: 'UPDATE_STATISTICS',
};

// Reducer
function gamificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.LOAD_STATS:
      return {
        ...state,
        currentXP: action.payload.xp || 0,
        totalXP: action.payload.xp || 0,
        currentLevel: action.payload.level || 1,
        xpToNextLevel: action.payload.xpToNextLevel || 100,
        percentToNextLevel: action.payload.percentToNextLevel || 0,
        streak: {
          current: action.payload.streak?.current || 0,
          longest: action.payload.streak?.longest || 0,
          isActiveToday: action.payload.streak?.isActiveToday || false,
          freezeAvailable: action.payload.streak?.freezeAvailable || false,
        },
        badgesEarned: action.payload.badgesEarned || 0,
        totalBadges: action.payload.totalBadges || 0,
        statistics: {
          ...state.statistics,
          lessonsCompleted: action.payload.lessonsCompleted || 0,
        },
        isLoading: false,
        isInitialized: true,
        loadedChildId: action.payload.childId,
        error: null,
      };

    case ACTIONS.LOAD_BADGES:
      return {
        ...state,
        badges: action.payload.earned || [],
        badgesEarned: action.payload.earned?.length || 0,
        totalBadges: (action.payload.earned?.length || 0) + (action.payload.available?.length || 0),
      };

    case ACTIONS.UPDATE_XP:
      const newState = {
        ...state,
        currentXP: action.payload.currentXP,
        totalXP: action.payload.totalXP,
        currentLevel: action.payload.level,
      };

      // Check for level up celebration
      if (action.payload.leveledUp) {
        newState.pendingCelebration = {
          type: 'levelUp',
          level: action.payload.level,
          xpEarned: action.payload.xpAwarded,
        };
      } else if (action.payload.xpAwarded >= 50) {
        newState.pendingCelebration = {
          type: 'bigXP',
          xpEarned: action.payload.xpAwarded,
        };
      }

      // Check for new badges
      if (action.payload.newBadges?.length > 0) {
        newState.badges = [...state.badges, ...action.payload.newBadges];
        newState.badgesEarned = state.badgesEarned + action.payload.newBadges.length;
        newState.recentAchievements = [
          ...state.recentAchievements,
          ...action.payload.newBadges,
        ];
        if (!newState.pendingCelebration) {
          newState.pendingCelebration = {
            type: 'badge',
            badge: action.payload.newBadges[0],
          };
        }
      }

      return newState;

    case ACTIONS.UPDATE_STREAK:
      return {
        ...state,
        streak: action.payload,
      };

    case ACTIONS.ADD_BADGE:
      return {
        ...state,
        badges: [...state.badges, action.payload],
        badgesEarned: state.badgesEarned + 1,
        recentAchievements: [...state.recentAchievements, action.payload],
        pendingCelebration: {
          type: 'badge',
          badge: action.payload,
        },
      };

    case ACTIONS.SET_PENDING_CELEBRATION:
      return { ...state, pendingCelebration: action.payload };

    case ACTIONS.CLEAR_PENDING_CELEBRATION:
      return { ...state, pendingCelebration: null };

    case ACTIONS.ADD_RECENT_ACHIEVEMENT:
      return {
        ...state,
        recentAchievements: [...state.recentAchievements, action.payload],
      };

    case ACTIONS.CLEAR_RECENT_ACHIEVEMENT:
      return {
        ...state,
        recentAchievements: state.recentAchievements.filter(a => a.id !== action.payload),
      };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ACTIONS.CLEAR_STATE:
      return { ...initialState, isLoading: false, isInitialized: false };

    case ACTIONS.UPDATE_STATISTICS:
      return {
        ...state,
        statistics: { ...state.statistics, ...action.payload },
      };

    default:
      return state;
  }
}

// Context
const GamificationContext = createContext(null);

// Provider component
export function GamificationProvider({ children }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);

  // Get current profile from AuthContext
  const { currentProfile, isInitialized: authInitialized } = useAuth();
  const childId = currentProfile?.id;

  // Track fetch in progress
  const fetchInProgress = useRef(false);

  // Fetch stats from database
  const fetchStats = useCallback(async (profileId) => {
    if (!profileId) {
      dispatch({ type: ACTIONS.CLEAR_STATE });
      return;
    }

    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      // Fetch stats and badges in parallel
      const [statsResponse, badgesResponse] = await Promise.all([
        gamificationAPI.getMyStats(),
        gamificationAPI.getMyBadges(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        dispatch({
          type: ACTIONS.LOAD_STATS,
          payload: {
            ...statsResponse.data,
            childId: profileId,
          },
        });
      } else {
        // API didn't return data - use defaults
        dispatch({
          type: ACTIONS.LOAD_STATS,
          payload: { childId: profileId },
        });
      }

      // Load badges
      if (badgesResponse.success && badgesResponse.data) {
        dispatch({
          type: ACTIONS.LOAD_BADGES,
          payload: badgesResponse.data,
        });
      }
    } catch (error) {
      console.error('Failed to fetch gamification stats:', error);
      // Still initialize with defaults to prevent infinite loading
      dispatch({
        type: ACTIONS.LOAD_STATS,
        payload: { childId: profileId },
      });
    } finally {
      fetchInProgress.current = false;
    }
  }, []);

  // Fetch stats when childId changes
  useEffect(() => {
    if (!authInitialized) return;

    if (childId && childId !== state.loadedChildId) {
      fetchStats(childId);
    } else if (!childId && state.loadedChildId) {
      dispatch({ type: ACTIONS.CLEAR_STATE });
    }
  }, [childId, authInitialized, state.loadedChildId, fetchStats]);

  // Record activity on app open (for streak)
  useEffect(() => {
    if (!childId || !state.isInitialized) return;

    // Record activity to update streak
    gamificationAPI.recordActivity().then(response => {
      if (response.success && response.data?.streak) {
        dispatch({
          type: ACTIONS.UPDATE_STREAK,
          payload: response.data.streak,
        });

        // Handle any new badges awarded from streak milestone
        if (response.data.newBadges?.length > 0) {
          dispatch({
            type: ACTIONS.UPDATE_XP,
            payload: {
              currentXP: state.currentXP,
              totalXP: state.totalXP,
              level: state.currentLevel,
              leveledUp: false,
              xpAwarded: 0,
              newBadges: response.data.newBadges,
            },
          });
        }
      }
    }).catch(err => {
      console.error('Failed to record activity:', err);
    });
  }, [childId, state.isInitialized]);

  // Award XP via API
  const earnXP = useCallback(async (amount, reason = 'CHAT_QUESTION') => {
    if (!childId || amount <= 0) return null;

    try {
      // Map common reasons to backend XPReason enum values
      const reasonMap = {
        // Chat interactions
        'Chat interaction': 'CHAT_QUESTION',
        'Asked Jeffrey a question': 'CHAT_QUESTION',
        'Chat question': 'CHAT_QUESTION',

        // Lesson activities
        'Lesson complete': 'LESSON_COMPLETE',
        'Lesson progress': 'LESSON_PROGRESS',

        // Flashcard activities
        'Flashcard review': 'FLASHCARD_REVIEW',
        'Flashcard correct': 'FLASHCARD_CORRECT',
        'Created a flashcard': 'FLASHCARD_REVIEW',

        // Quiz activities
        'Quiz complete': 'QUIZ_COMPLETE',
        'Quiz perfect': 'QUIZ_PERFECT',
        'Generated a quiz': 'QUIZ_COMPLETE',

        // Other activities
        'Daily challenge': 'DAILY_CHALLENGE',
        'Text selection': 'TEXT_SELECTION',
        'Translated text': 'TEXT_SELECTION',
        'Saved a selection': 'TEXT_SELECTION',
        'Used read aloud': 'TEXT_SELECTION',

        // Exercise activities
        'Exercise correct': 'EXERCISE_CORRECT',
        'Exercise perfect': 'EXERCISE_PERFECT',
      };

      // Map to backend enum, fallback to CHAT_QUESTION for unknown reasons
      const xpReason = reasonMap[reason] || (reason.includes('_') ? reason : 'CHAT_QUESTION');

      const response = await gamificationAPI.awardXP(amount, xpReason);

      if (response.success && response.data) {
        dispatch({
          type: ACTIONS.UPDATE_XP,
          payload: response.data,
        });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }

    return null;
  }, [childId]);

  // Record activity (for streak)
  const recordActivity = useCallback(async () => {
    if (!childId) return;

    try {
      const response = await gamificationAPI.recordActivity();
      if (response.success && response.data?.streak) {
        dispatch({
          type: ACTIONS.UPDATE_STREAK,
          payload: response.data.streak,
        });
      }
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  }, [childId]);

  // Refresh stats from server
  const refreshStats = useCallback(() => {
    if (childId) {
      fetchInProgress.current = false;
      fetchStats(childId);
    }
  }, [childId, fetchStats]);

  // Update local statistics (for UI only - doesn't persist)
  const updateStatistics = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_STATISTICS, payload: updates });
  }, []);

  // Clear celebration
  const clearCelebration = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_PENDING_CELEBRATION });
  }, []);

  // Clear recent achievement
  const clearRecentAchievement = useCallback((achievementId) => {
    dispatch({ type: ACTIONS.CLEAR_RECENT_ACHIEVEMENT, payload: achievementId });
  }, []);

  // Daily challenge progress (simplified - just track locally for UI)
  const updateDailyChallengeProgress = useCallback((action) => {
    // For now, daily challenges are UI-only
    // A proper implementation would need backend support
  }, []);

  const value = {
    // State
    ...state,

    // Actions
    earnXP,
    recordActivity,
    refreshStats,
    updateStatistics,
    updateDailyChallengeProgress,
    clearCelebration,
    clearRecentAchievement,
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
