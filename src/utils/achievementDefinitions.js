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
        id: 'question_master_50',
        name: 'Question Whiz',
        description: 'Answer 50 questions correctly',
        icon: '🎯',
        category: 'mastery',
        rarity: 'common',
        criteria: (stats) => stats.questionsAnswered >= 50,
    },
    {
        id: 'question_master_100',
        name: 'Answer Expert',
        description: 'Answer 100 questions correctly',
        icon: '💡',
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
    {
        id: 'flashcard_legend',
        name: 'Flashcard Legend',
        description: 'Review 500 flashcards',
        icon: '🌟',
        category: 'learning',
        rarity: 'epic',
        criteria: (stats) => stats.flashcardsReviewed >= 500,
    },

    // Time-based Achievements
    {
        id: 'study_time_1h',
        name: 'Getting Started',
        description: 'Study for 1 hour total',
        icon: '⏰',
        category: 'learning',
        rarity: 'common',
        criteria: (stats) => stats.totalStudyTime >= 60, // 1 hour in minutes
    },
    {
        id: 'study_time_5h',
        name: 'Time Traveler',
        description: 'Study for 5 hours total',
        icon: '🕐',
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
        criteria: (stats, badges, streak) => streak?.current >= 3,
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'rare',
        criteria: (stats, badges, streak) => streak?.current >= 7,
    },
    {
        id: 'streak_14',
        name: 'Fortnight Fighter',
        description: 'Maintain a 14-day streak',
        icon: '💪',
        category: 'streak',
        rarity: 'rare',
        criteria: (stats, badges, streak) => streak?.current >= 14,
    },
    {
        id: 'streak_30',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '💎',
        category: 'streak',
        rarity: 'epic',
        criteria: (stats, badges, streak) => streak?.current >= 30,
    },
    {
        id: 'streak_100',
        name: 'Legendary Streak',
        description: 'Maintain a 100-day streak',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
        criteria: (stats, badges, streak) => streak?.current >= 100,
    },

    // Level Achievements
    {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: '⭐',
        category: 'special',
        rarity: 'common',
        criteria: (stats, badges, streak, level) => level >= 5,
    },
    {
        id: 'level_10',
        name: 'Shining Bright',
        description: 'Reach Level 10',
        icon: '🌟',
        category: 'special',
        rarity: 'rare',
        criteria: (stats, badges, streak, level) => level >= 10,
    },
    {
        id: 'level_25',
        name: 'Master Learner',
        description: 'Reach Level 25',
        icon: '🏅',
        category: 'special',
        rarity: 'epic',
        criteria: (stats, badges, streak, level) => level >= 25,
    },
    {
        id: 'level_50',
        name: 'Grand Master',
        description: 'Reach Level 50',
        icon: '🎖️',
        category: 'special',
        rarity: 'legendary',
        criteria: (stats, badges, streak, level) => level >= 50,
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
export function checkAchievements(statistics, currentBadges, streak = null, level = 1) {
    const unlockedIds = new Set(currentBadges.map(b => b.id));
    const newBadges = [];

    for (const badge of ALL_BADGES) {
        if (unlockedIds.has(badge.id)) continue;

        const meetsCriteria = badge.criteria(statistics, currentBadges, streak, level);
        if (meetsCriteria) {
            newBadges.push({
                ...badge,
                unlockedAt: new Date().toISOString(),
            });
        }
    }

    return newBadges;
}

/**
 * Get progress towards a specific badge (0-100)
 */
export function getBadgeProgress(badgeId, statistics, streak, level) {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return 0;

    // Calculate progress based on badge type
    switch (badgeId) {
        case 'first_lesson':
        case 'lesson_master_10':
        case 'lesson_master_50':
        case 'lesson_master_100': {
            const targets = { first_lesson: 1, lesson_master_10: 10, lesson_master_50: 50, lesson_master_100: 100 };
            return Math.min(100, (statistics.lessonsCompleted / targets[badgeId]) * 100);
        }
        case 'flashcard_starter':
        case 'flashcard_pro':
        case 'flashcard_legend': {
            const targets = { flashcard_starter: 10, flashcard_pro: 100, flashcard_legend: 500 };
            return Math.min(100, (statistics.flashcardsReviewed / targets[badgeId]) * 100);
        }
        case 'streak_3':
        case 'streak_7':
        case 'streak_14':
        case 'streak_30':
        case 'streak_100': {
            const targets = { streak_3: 3, streak_7: 7, streak_14: 14, streak_30: 30, streak_100: 100 };
            return Math.min(100, ((streak?.current || 0) / targets[badgeId]) * 100);
        }
        default:
            return 0;
    }
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category) {
    if (category === 'all') return ALL_BADGES;
    return ALL_BADGES.filter(b => b.category === category);
}
