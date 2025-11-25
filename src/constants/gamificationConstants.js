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
    BEGINNER: { min: 1, max: 5, color: 'blue', label: 'Beginner' },
    INTERMEDIATE: { min: 6, max: 15, color: 'purple', label: 'Intermediate' },
    ADVANCED: { min: 16, max: 30, color: 'orange', label: 'Advanced' },
    EXPERT: { min: 31, max: 50, color: 'red', label: 'Expert' },
    MASTER: { min: 51, max: 999, color: 'gold', label: 'Master' },
};

/**
 * Get tier for a given level
 */
export const getLevelTier = (level) => {
    for (const [key, tier] of Object.entries(LEVEL_TIERS)) {
        if (level >= tier.min && level <= tier.max) {
            return { key, ...tier };
        }
    }
    return { key: 'BEGINNER', ...LEVEL_TIERS.BEGINNER };
};
