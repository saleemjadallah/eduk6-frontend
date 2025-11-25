import { useCallback, useEffect } from 'react';
import { useGamificationContext } from '../context/GamificationContext';

export function useCelebration() {
    const { pendingCelebration, clearCelebration, recentAchievements, clearRecentAchievement } = useGamificationContext();

    // Trigger a custom celebration (for special events)
    const triggerCustomCelebration = useCallback((celebrationData) => {
        // This would dispatch a custom celebration
        // For now, celebrations are handled through the context
        console.log('Custom celebration:', celebrationData);
    }, []);

    // Play sound effect when celebration appears
    useEffect(() => {
        if (pendingCelebration) {
            playCelebrationSound(pendingCelebration.type);
        }
    }, [pendingCelebration]);

    // Play appropriate sound based on celebration type
    const playCelebrationSound = (type) => {
        // Only play sounds if user hasn't disabled them
        const soundEnabled = localStorage.getItem('gamificationSounds') !== 'false';
        if (!soundEnabled) return;

        try {
            // Create a simple beep/chime using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different sounds for different celebrations
            switch (type) {
                case 'levelUp':
                    // Ascending notes for level up
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.4);
                    break;

                case 'badge':
                    // Triumphant chord for badge
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;

                case 'streakMilestone':
                    // Fire crackling sound (simple version)
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;

                case 'dailyChallenge':
                case 'bigXP':
                default:
                    // Simple positive chime
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
            }
        } catch (error) {
            console.log('Audio not available:', error);
        }
    };

    // Toggle sound effects
    const toggleSounds = useCallback((enabled) => {
        localStorage.setItem('gamificationSounds', enabled ? 'true' : 'false');
    }, []);

    // Check if sounds are enabled
    const isSoundEnabled = useCallback(() => {
        return localStorage.getItem('gamificationSounds') !== 'false';
    }, []);

    return {
        pendingCelebration,
        clearCelebration,
        triggerCustomCelebration,
        recentAchievements,
        clearRecentAchievement,
        toggleSounds,
        isSoundEnabled,
    };
}

export default useCelebration;
