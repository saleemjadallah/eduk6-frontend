/**
 * Flashcard difficulty levels
 */
export const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};

/**
 * Spaced repetition intervals (in days)
 * Based on SM-2 algorithm principles, simplified for kids
 */
export const SPACED_REPETITION_INTERVALS = {
    // When card is marked as "Got it!"
    CORRECT: {
        1: 1,    // First correct: review in 1 day
        2: 3,    // Second correct: review in 3 days
        3: 7,    // Third correct: review in 7 days
        4: 14,   // Fourth correct: review in 2 weeks
        5: 30,   // Fifth correct: review in 1 month
        6: 60,   // Sixth+: review in 2 months
    },
    // When card is marked as "Still learning"
    INCORRECT: 0, // Review immediately (same session)
};

/**
 * Confidence ratings kids can use
 */
export const CONFIDENCE_RATINGS = [
    {
        id: 'learning',
        label: 'Still Learning',
        emoji: '🤔',
        description: "I need more practice",
        color: 'orange',
        multiplier: 0, // Resets progress
    },
    {
        id: 'almost',
        label: 'Almost Got It',
        emoji: '😊',
        description: "I'm getting there!",
        color: 'yellow',
        multiplier: 0.5, // Partial progress
    },
    {
        id: 'got_it',
        label: 'Got It!',
        emoji: '🎉',
        description: "I know this one!",
        color: 'green',
        multiplier: 1, // Full progress
    },
];

/**
 * Flashcard deck categories
 */
export const DECK_CATEGORIES = [
    { id: 'lesson', label: 'From Lessons', icon: '📚', color: 'blue' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📝', color: 'purple' },
    { id: 'math', label: 'Math Facts', icon: '🔢', color: 'green' },
    { id: 'science', label: 'Science', icon: '🔬', color: 'cyan' },
    { id: 'custom', label: 'My Cards', icon: '✨', color: 'pink' },
];

/**
 * Study session settings
 */
export const STUDY_SESSION_SETTINGS = {
    DEFAULT_CARDS_PER_SESSION: 10,
    MIN_CARDS_PER_SESSION: 5,
    MAX_CARDS_PER_SESSION: 30,
    AUTO_FLIP_DELAY: 3000, // ms before auto-flip hint appears
    CELEBRATION_THRESHOLD: 0.8, // 80% correct triggers celebration
};

/**
 * XP rewards for flashcard activities
 */
export const FLASHCARD_XP_REWARDS = {
    CARD_REVIEWED: 2,
    CARD_MASTERED: 10,
    PERFECT_SESSION: 25,
    DECK_COMPLETED: 50,
    CREATE_CARD: 5,
};

/**
 * Mastery levels for flashcards
 */
export const MASTERY_LEVELS = [
    { level: 0, label: 'New', color: 'gray', minCorrect: 0 },
    { level: 1, label: 'Learning', color: 'orange', minCorrect: 1 },
    { level: 2, label: 'Familiar', color: 'yellow', minCorrect: 3 },
    { level: 3, label: 'Confident', color: 'blue', minCorrect: 5 },
    { level: 4, label: 'Mastered', color: 'green', minCorrect: 7 },
];

/**
 * Get mastery level for a card based on correct answers
 */
export const getMasteryLevel = (correctCount) => {
    for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
        if (correctCount >= MASTERY_LEVELS[i].minCorrect) {
            return MASTERY_LEVELS[i];
        }
    }
    return MASTERY_LEVELS[0];
};
