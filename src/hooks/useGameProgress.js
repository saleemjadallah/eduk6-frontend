import { useCallback } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { XP_VALUES } from '../constants/gamificationConstants';

export function useGameProgress() {
    const {
        earnXP,
        updateStatistics,
        updateDailyChallengeProgress,
        recordActivity,
        statistics
    } = useGamificationContext();

    const recordLessonComplete = useCallback((subject = 'general', duration = 0) => {
        // Record activity for streak
        recordActivity();

        // Award XP
        earnXP(XP_VALUES.LESSON_COMPLETE, 'Completed a lesson!');

        // Update statistics with incremented values
        updateStatistics({
            lessonsCompleted: (statistics?.lessonsCompleted || 0) + 1,
            totalStudyTime: (statistics?.totalStudyTime || 0) + duration,
        });

        // Update daily challenge
        updateDailyChallengeProgress('lessonCompleted');
    }, [earnXP, updateStatistics, updateDailyChallengeProgress, recordActivity, statistics]);

    const recordQuestionAnswered = useCallback((correct, difficulty = 'medium') => {
        // Record activity for streak
        recordActivity();

        if (correct) {
            const xpAmount = difficulty === 'hard' ? XP_VALUES.QUESTION_CORRECT_HARD :
                           difficulty === 'easy' ? XP_VALUES.QUESTION_CORRECT_EASY :
                           XP_VALUES.QUESTION_CORRECT;
            earnXP(xpAmount, 'Correct answer!');

            // Update daily challenge
            updateDailyChallengeProgress('questionAnswered');
        }

        updateStatistics({
            questionsAnswered: (statistics?.questionsAnswered || 0) + 1,
        });
    }, [earnXP, updateStatistics, updateDailyChallengeProgress, recordActivity, statistics]);

    const recordFlashcardReviewed = useCallback((count = 1) => {
        // Record activity for streak
        recordActivity();

        earnXP(XP_VALUES.FLASHCARD_REVIEWED * count, `Reviewed ${count} flashcard${count > 1 ? 's' : ''}!`);

        updateStatistics({
            flashcardsReviewed: (statistics?.flashcardsReviewed || 0) + count,
        });

        // Update daily challenge
        updateDailyChallengeProgress('flashcardReviewed', count);
    }, [earnXP, updateStatistics, updateDailyChallengeProgress, recordActivity, statistics]);

    const recordPerfectScore = useCallback(() => {
        earnXP(XP_VALUES.PERFECT_SCORE, 'Perfect score! Amazing!');

        updateStatistics({
            perfectScores: (statistics?.perfectScores || 0) + 1,
        });
    }, [earnXP, updateStatistics, statistics]);

    const recordStudyTime = useCallback((minutes) => {
        // Record activity for streak
        recordActivity();

        // Award XP for every 10 minutes
        const xpAmount = Math.floor(minutes / 10) * XP_VALUES.STUDY_TIME;
        if (xpAmount > 0) {
            earnXP(xpAmount, `${minutes} minutes of learning!`);
        }

        updateStatistics({
            totalStudyTime: (statistics?.totalStudyTime || 0) + minutes,
        });

        // Update daily challenge for time-based challenges
        updateDailyChallengeProgress('studyTime', minutes);
    }, [earnXP, updateStatistics, updateDailyChallengeProgress, recordActivity, statistics]);

    const recordChatInteraction = useCallback(() => {
        // Record activity for streak (no XP for basic chat)
        recordActivity();
    }, [recordActivity]);

    return {
        recordLessonComplete,
        recordQuestionAnswered,
        recordFlashcardReviewed,
        recordPerfectScore,
        recordStudyTime,
        recordChatInteraction,
    };
}

export default useGameProgress;
