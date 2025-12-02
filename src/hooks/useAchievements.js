import { useCallback, useMemo } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { ALL_BADGES, getBadgeProgress, getBadgesByCategory } from '../utils/achievementDefinitions';

export function useAchievements() {
    const { badges, statistics, streak, currentLevel } = useGamificationContext();

    // Get all badges with their unlock status and progress
    // Note: Backend returns badges with 'code' as the identifier (e.g., 'first_lesson')
    // Frontend uses 'id' in achievementDefinitions which matches the backend 'code'
    const allBadgesWithStatus = useMemo(() => {
        const unlockedCodes = new Set(badges.map(b => b.code || b.id));
        return ALL_BADGES.map(badge => ({
            ...badge,
            unlocked: unlockedCodes.has(badge.id),
            unlockedAt: badges.find(b => (b.code || b.id) === badge.id)?.unlockedAt || badges.find(b => (b.code || b.id) === badge.id)?.earnedAt,
            progress: !unlockedCodes.has(badge.id)
                ? getBadgeProgress(badge.id, statistics, streak, currentLevel)
                : 100,
        }));
    }, [badges, statistics, streak, currentLevel]);

    // Get unlocked badges count
    const unlockedCount = useMemo(() => badges.length, [badges]);

    // Get total badges count
    const totalCount = useMemo(() => ALL_BADGES.length, []);

    // Get progress for a specific badge
    const getProgressForBadge = useCallback((badgeId) => {
        return getBadgeProgress(badgeId, statistics, streak, currentLevel);
    }, [statistics, streak, currentLevel]);

    // Get next achievable badge suggestion
    const getNextBadgeSuggestion = useCallback(() => {
        const unlockedCodes = new Set(badges.map(b => b.code || b.id));

        // Find badges that are close to being unlocked (>50% progress)
        const closeBadges = ALL_BADGES
            .filter(b => !unlockedCodes.has(b.id))
            .map(badge => ({
                ...badge,
                progress: getBadgeProgress(badge.id, statistics, streak, currentLevel),
            }))
            .filter(b => b.progress > 0 && b.progress < 100)
            .sort((a, b) => b.progress - a.progress);

        if (closeBadges.length > 0) {
            const closest = closeBadges[0];
            return {
                badge: closest,
                message: getMotivationalMessage(closest),
            };
        }

        return null;
    }, [badges, statistics, streak, currentLevel]);

    // Get motivational message for a badge
    const getMotivationalMessage = (badge) => {
        const remaining = 100 - badge.progress;

        switch (badge.category) {
            case 'learning':
                if (badge.id.includes('lesson')) {
                    return `Complete a few more lessons to earn "${badge.name}"!`;
                }
                if (badge.id.includes('flashcard')) {
                    return `Review some flashcards to unlock "${badge.name}"!`;
                }
                return `Keep learning to earn "${badge.name}"!`;
            case 'streak':
                return `Keep your streak going to earn "${badge.name}"!`;
            case 'mastery':
                return `Answer more questions correctly to unlock "${badge.name}"!`;
            default:
                return `You're ${Math.round(badge.progress)}% of the way to "${badge.name}"!`;
        }
    };

    // Get badges by category with status
    const getBadgesByCategoryWithStatus = useCallback((category) => {
        const categoryBadges = getBadgesByCategory(category);
        const unlockedCodes = new Set(badges.map(b => b.code || b.id));

        return categoryBadges.map(badge => ({
            ...badge,
            unlocked: unlockedCodes.has(badge.id),
            unlockedAt: badges.find(b => (b.code || b.id) === badge.id)?.unlockedAt || badges.find(b => (b.code || b.id) === badge.id)?.earnedAt,
            progress: !unlockedCodes.has(badge.id)
                ? getBadgeProgress(badge.id, statistics, streak, currentLevel)
                : 100,
        }));
    }, [badges, statistics, streak, currentLevel]);

    // Get recently unlocked badges (within last 24 hours)
    const recentlyUnlocked = useMemo(() => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return badges.filter(b => {
            const earnedDate = b.unlockedAt || b.earnedAt;
            return earnedDate && earnedDate > oneDayAgo;
        });
    }, [badges]);

    return {
        badges,
        allBadgesWithStatus,
        unlockedCount,
        totalCount,
        getProgressForBadge,
        getNextBadgeSuggestion,
        getBadgesByCategoryWithStatus,
        recentlyUnlocked,
    };
}

export default useAchievements;
