/**
 * useChildStats Hook
 * Fetches real child stats from the backend API
 * Falls back to GamificationContext for local stats if API unavailable
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

    // Load local stats from GamificationContext localStorage as fallback
    const loadLocalStats = useCallback(() => {
        try {
            const savedProgress = localStorage.getItem('userGameProgress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                setStats(prev => ({
                    ...prev,
                    xp: progress.totalXP || 0,
                    level: progress.currentLevel || 1,
                    xpToNextLevel: progress.xpToNextLevel || 100,
                    percentToNextLevel: progress.currentXP && progress.xpToNextLevel
                        ? Math.round((progress.currentXP / progress.xpToNextLevel) * 100)
                        : 0,
                    streak: {
                        current: progress.streak?.current || 0,
                        longest: progress.streak?.longest || 0,
                        isActiveToday: progress.streak?.lastActivityDate === new Date().toISOString().split('T')[0],
                        freezeAvailable: progress.streak?.freezeAvailable || false,
                    },
                    badgesEarned: progress.badges?.length || 0,
                    lessonsCompleted: progress.statistics?.lessonsCompleted || 0,
                }));
            }
        } catch (err) {
            console.error('Error loading local stats:', err);
        }
    }, []);

    const fetchStats = useCallback(async (childId = null) => {
        setLoading(true);
        setError(null);

        try {
            // If we have a childId, use parent endpoint; otherwise try child endpoint
            const response = childId
                ? await childStatsAPI.getChildStats(childId)
                : await childStatsAPI.getMyStats();

            if (response.success && response.data) {
                setStats(response.data);
            } else {
                // Fallback to local stats
                loadLocalStats();
            }
        } catch (err) {
            console.error('Failed to fetch child stats from API, using local stats:', err);
            setError(err.message);
            // Fallback to local stats
            loadLocalStats();
        } finally {
            setLoading(false);
        }
    }, [loadLocalStats]);

    useEffect(() => {
        // Check for auth token and child profile
        const authToken = localStorage.getItem('auth_token');
        const childToken = localStorage.getItem('child_token');
        const currentProfileId = localStorage.getItem('current_profile_id');

        if (childToken) {
            // Child session - use /children/me/stats
            fetchStats();
        } else if (authToken && currentProfileId) {
            // Parent session with selected child profile - use /children/:childId/stats
            fetchStats(currentProfileId);
        } else if (authToken) {
            // Parent session but no child selected - fallback to local
            loadLocalStats();
            setLoading(false);
        } else {
            // No auth - use local gamification stats
            loadLocalStats();
            setLoading(false);
        }
    }, [fetchStats, loadLocalStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    };
}

export default useChildStats;
