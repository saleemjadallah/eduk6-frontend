import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { calculateXPForLevel } from '../utils/xpCalculations';
import { checkAchievements } from '../utils/achievementDefinitions';
import { DAILY_CHALLENGES } from '../constants/gamificationConstants';

// Initial state
const initialState = {
    currentXP: 0,
    currentLevel: 1,
    totalXP: 0,
    xpToNextLevel: 50,
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
    ADD_RECENT_ACHIEVEMENT: 'ADD_RECENT_ACHIEVEMENT',
    CLEAR_RECENT_ACHIEVEMENT: 'CLEAR_RECENT_ACHIEVEMENT',
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
                    xpToNextLevel: calculateXPForLevel(state.currentLevel + 2) - calculateXPForLevel(state.currentLevel + 1),
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
                pendingCelebration: action.payload.amount >= 50 ? {
                    type: 'bigXP',
                    xpEarned: action.payload.amount,
                    reason: action.payload.reason,
                } : state.pendingCelebration,
            };
        }

        case ACTIONS.LEVEL_UP:
            return {
                ...state,
                currentLevel: action.payload.level,
                currentXP: 0,
                xpToNextLevel: calculateXPForLevel(action.payload.level + 1) - calculateXPForLevel(action.payload.level),
            };

        case ACTIONS.UPDATE_STREAK:
            return {
                ...state,
                streak: action.payload,
                pendingCelebration: action.payload.current > state.streak.current &&
                    action.payload.current % 7 === 0 ? {
                    type: 'streakMilestone',
                    streak: action.payload.current,
                } : state.pendingCelebration,
            };

        case ACTIONS.UNLOCK_BADGE:
            return {
                ...state,
                badges: [...state.badges, action.payload],
                recentAchievements: [...state.recentAchievements, action.payload],
                pendingCelebration: {
                    type: 'badge',
                    badge: action.payload,
                },
            };

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
                if (progress.streak) {
                    updateStreakOnAppOpen(progress.streak);
                }
            } catch (error) {
                console.error('Error loading progress:', error);
            }
        }

        // Initialize daily challenge if needed
        initializeDailyChallenge();
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        const stateToSave = {
            ...state,
            pendingCelebration: null, // Don't persist celebrations
            recentAchievements: [], // Don't persist recent achievements
        };
        localStorage.setItem('userGameProgress', JSON.stringify(stateToSave));
    }, [state]);

    // Update streak logic on app open
    const updateStreakOnAppOpen = useCallback((currentStreak) => {
        if (!currentStreak.lastActivityDate) {
            // First time - start streak
            const today = format(new Date(), 'yyyy-MM-dd');
            dispatch({
                type: ACTIONS.UPDATE_STREAK,
                payload: {
                    current: 1,
                    longest: 1,
                    lastActivityDate: today,
                    freezeAvailable: true,
                },
            });
            return;
        }

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
        const savedProgress = localStorage.getItem('userGameProgress');
        let currentChallenge = null;

        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                currentChallenge = progress.dailyChallenge;
            } catch (error) {
                console.error('Error parsing daily challenge:', error);
            }
        }

        if (!currentChallenge || currentChallenge.date !== today) {
            // Generate new challenge
            const randomChallenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];

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
    }, []);

    // Action creators
    const earnXP = useCallback((amount, reason) => {
        dispatch({
            type: ACTIONS.EARN_XP,
            payload: { amount, reason },
        });
    }, []);

    const checkForNewBadges = useCallback(() => {
        const newBadges = checkAchievements(
            state.statistics,
            state.badges,
            state.streak,
            state.currentLevel
        );
        newBadges.forEach(badge => {
            dispatch({ type: ACTIONS.UNLOCK_BADGE, payload: badge });
        });
    }, [state.statistics, state.badges, state.streak, state.currentLevel]);

    // Check for badges when stats change
    useEffect(() => {
        checkForNewBadges();
    }, [state.statistics, state.streak, state.currentLevel]);

    const updateDailyChallengeProgress = useCallback((action, value = 1) => {
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
                if (action === 'flashcardReviewed') newProgress += value;
                break;
            case 'time':
                if (action === 'studyTime') newProgress += value;
                break;
            case 'streak':
                if (action === 'streakMaintained') newProgress = 1;
                break;
            default:
                break;
        }

        if (newProgress >= challenge.target) {
            dispatch({
                type: ACTIONS.COMPLETE_DAILY_CHALLENGE,
                payload: { xpReward: state.dailyChallenge.xpReward },
            });
            // Award XP for daily challenge
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

    const clearRecentAchievement = useCallback((achievementId) => {
        dispatch({ type: ACTIONS.CLEAR_RECENT_ACHIEVEMENT, payload: achievementId });
    }, []);

    const resetProgress = useCallback(() => {
        localStorage.removeItem('userGameProgress');
        dispatch({ type: ACTIONS.RESET_PROGRESS });
    }, []);

    // Mark activity for streak
    const recordActivity = useCallback(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        if (state.streak.lastActivityDate !== today) {
            updateStreakOnAppOpen(state.streak);
            updateDailyChallengeProgress('streakMaintained');
        }
    }, [state.streak, updateStreakOnAppOpen, updateDailyChallengeProgress]);

    const value = {
        // State
        ...state,
        // Actions
        earnXP,
        updateStatistics,
        updateDailyChallengeProgress,
        clearCelebration,
        clearRecentAchievement,
        resetProgress,
        recordActivity,
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
