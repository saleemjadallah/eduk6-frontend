import { SPACED_REPETITION_INTERVALS, getMasteryLevel } from '../constants/flashcardConstants';

/**
 * Calculate the next review date for a flashcard
 * Simplified SM-2 algorithm for kids
 */
export function calculateNextReview(card, wasCorrect) {
    const now = new Date();
    const correctStreak = wasCorrect ? (card.correctStreak || 0) + 1 : 0;

    if (!wasCorrect) {
        // Reset to review immediately
        return {
            nextReviewDate: now.toISOString(),
            correctStreak: 0,
            easeFactor: Math.max(1.3, (card.easeFactor || 2.5) - 0.2),
        };
    }

    // Get interval based on streak
    const intervalKey = Math.min(correctStreak, 6);
    const baseDays = SPACED_REPETITION_INTERVALS.CORRECT[intervalKey] || 60;

    // Apply ease factor (how easy the card is for this student)
    const easeFactor = card.easeFactor || 2.5;
    const adjustedDays = Math.round(baseDays * (easeFactor / 2.5));

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + adjustedDays);

    return {
        nextReviewDate: nextDate.toISOString(),
        correctStreak,
        easeFactor: Math.min(3.0, easeFactor + 0.1), // Increase ease slightly
    };
}

/**
 * Get cards due for review today
 */
export function getCardsDueForReview(cards) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return cards.filter(card => {
        if (!card.nextReviewDate) return true; // New cards are always due
        const reviewDate = new Date(card.nextReviewDate);
        return reviewDate <= today;
    });
}

/**
 * Sort cards by priority for study session
 * Priority: overdue > new > due today
 */
export function sortCardsByPriority(cards) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [...cards].sort((a, b) => {
        // New cards (no review date) get medium priority
        if (!a.nextReviewDate && !b.nextReviewDate) return 0;
        if (!a.nextReviewDate) return 0;
        if (!b.nextReviewDate) return 0;

        const aDate = new Date(a.nextReviewDate);
        const bDate = new Date(b.nextReviewDate);

        // Overdue cards first (oldest overdue first)
        const aOverdue = aDate < today;
        const bOverdue = bDate < today;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Both overdue: most overdue first
        if (aOverdue && bOverdue) {
            return aDate.getTime() - bDate.getTime();
        }

        // Neither overdue: by correct streak (lower streak = more practice needed)
        return (a.correctStreak || 0) - (b.correctStreak || 0);
    });
}

/**
 * Calculate study session statistics
 */
export function calculateSessionStats(sessionResults) {
    const total = sessionResults.length;
    const correct = sessionResults.filter(r => r.wasCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Calculate XP earned
    const baseXP = total * 2; // 2 XP per card reviewed
    const bonusXP = accuracy >= 80 ? 25 : 0; // Perfect session bonus

    return {
        total,
        correct,
        incorrect,
        accuracy: Math.round(accuracy),
        xpEarned: baseXP + bonusXP,
        isPerfect: accuracy >= 80,
    };
}

/**
 * Get study streak information
 */
export function getStudyStreak(studyHistory) {
    if (!studyHistory || studyHistory.length === 0) {
        return { current: 0, longest: 0, lastStudyDate: null };
    }

    // Sort by date descending
    const sorted = [...studyHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    let checkDate = new Date(today);

    for (const session of sorted) {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((checkDate - sessionDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (diffDays === 1) {
            current++;
            checkDate = sessionDate;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Calculate longest streak
    let longest = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const session of sorted) {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        if (!prevDate) {
            tempStreak = 1;
        } else {
            const diff = Math.floor((prevDate - sessionDate) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                tempStreak++;
            } else {
                longest = Math.max(longest, tempStreak);
                tempStreak = 1;
            }
        }
        prevDate = sessionDate;
    }
    longest = Math.max(longest, tempStreak);

    return {
        current,
        longest,
        lastStudyDate: sorted[0]?.date || null,
    };
}

/**
 * Get recommended number of cards for a session
 * Based on cards due and student's recent performance
 */
export function getRecommendedCardCount(dueCards, recentAccuracy = 80) {
    const baseDue = dueCards.length;

    if (baseDue === 0) return 0;

    // If struggling (low accuracy), suggest fewer cards
    if (recentAccuracy < 60) {
        return Math.min(5, baseDue);
    }

    // Normal performance
    if (recentAccuracy < 80) {
        return Math.min(10, baseDue);
    }

    // High performance - can handle more
    return Math.min(15, baseDue);
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleCards(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
