import { useCallback, useMemo } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { format, differenceInCalendarDays } from 'date-fns';

export function useStreaks() {
    const { streak, recordActivity } = useGamificationContext();

    // Get current streak status
    const getStreakStatus = useCallback(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const lastDate = streak.lastActivityDate;

        if (!lastDate) {
            return { status: 'none', message: 'Start your streak today!' };
        }

        if (lastDate === today) {
            return { status: 'active', message: `${streak.current} day streak!` };
        }

        const daysSince = differenceInCalendarDays(new Date(today), new Date(lastDate));

        if (daysSince === 1) {
            return { status: 'pending', message: 'Learn today to continue your streak!' };
        }

        if (daysSince === 2 && streak.freezeAvailable) {
            return { status: 'frozen', message: 'Streak saved by freeze!' };
        }

        return { status: 'broken', message: 'Start a new streak today!' };
    }, [streak]);

    // Get motivational message based on streak
    const getMotivationalMessage = useCallback(() => {
        if (streak.current >= 100) {
            return "You're a learning legend!";
        }
        if (streak.current >= 30) {
            return "A whole month! You're incredible!";
        }
        if (streak.current >= 14) {
            return "Two weeks strong! Keep it up!";
        }
        if (streak.current >= 7) {
            return "One week streak! You're on fire!";
        }
        if (streak.current >= 3) {
            return "Great start! Keep going!";
        }
        return "Every day counts! Start your streak!";
    }, [streak.current]);

    // Get streak milestone info
    const getNextMilestone = useMemo(() => {
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const nextMilestone = milestones.find(m => m > streak.current);

        if (!nextMilestone) {
            return { milestone: null, daysAway: 0, message: "You've reached legendary status!" };
        }

        const daysAway = nextMilestone - streak.current;
        return {
            milestone: nextMilestone,
            daysAway,
            message: `${daysAway} day${daysAway > 1 ? 's' : ''} to ${nextMilestone}-day milestone!`,
        };
    }, [streak.current]);

    // Check if streak is at risk
    const isAtRisk = useMemo(() => {
        const status = getStreakStatus();
        return status.status === 'pending' || status.status === 'frozen';
    }, [getStreakStatus]);

    // Get streak tier (for visual styling)
    const getStreakTier = useCallback(() => {
        if (streak.current >= 100) return 'legendary';
        if (streak.current >= 30) return 'epic';
        if (streak.current >= 14) return 'rare';
        if (streak.current >= 7) return 'uncommon';
        return 'common';
    }, [streak.current]);

    // Mark activity to maintain streak
    const markActivity = useCallback(() => {
        recordActivity();
    }, [recordActivity]);

    return {
        streak,
        getStreakStatus,
        getMotivationalMessage,
        getNextMilestone,
        isAtRisk,
        getStreakTier,
        markActivity,
    };
}

export default useStreaks;
