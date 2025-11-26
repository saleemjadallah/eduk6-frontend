/**
 * useChildStats Hook
 * Fetches real child stats from the backend API
 */

import { useState, useEffect, useCallback } from 'react';
import { childStatsAPI } from '../services/api/childStatsAPI';

export function useChildStats() {
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        percentToNextLevel: 0,
        streak: {
            current: 0,
            longest: 0,
            isActiveToday: false,
            freezeAvailable: false,
        },
        badgesEarned: 0,
        totalBadges: 0,
        lessonsCompleted: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await childStatsAPI.getMyStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch child stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch if we have a child token (child is logged in)
        const childToken = localStorage.getItem('child_token');
        if (childToken) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    };
}

export default useChildStats;
