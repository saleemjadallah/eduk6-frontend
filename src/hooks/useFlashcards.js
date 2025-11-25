import { useCallback, useMemo } from 'react';
import { useFlashcardContext } from '../context/FlashcardContext';
import { getCardsDueForReview, getStudyStreak, getRecommendedCardCount } from '../utils/spacedRepetition';
import { getMasteryLevel } from '../constants/flashcardConstants';

export function useFlashcards() {
    const {
        decks,
        cards,
        studyHistory,
        currentSession,
        createDeck,
        createDeckFromLesson,
        addCards,
        startSession,
        recordSessionAnswer,
        endSession,
        getCardsForDeck,
        getDueCardsForDeck,
        getDeckStats,
        deleteDeck,
    } = useFlashcardContext();

    // Get total cards due across all decks
    const totalDueCards = useMemo(() => {
        return getCardsDueForReview(cards).length;
    }, [cards]);

    // Get overall flashcard statistics
    const overallStats = useMemo(() => {
        const totalCards = cards.length;
        const dueCards = totalDueCards;
        const masteredCards = cards.filter(c => {
            const level = getMasteryLevel(c.correctReviews || 0);
            return level.level >= 4; // Mastered
        }).length;

        const totalReviews = cards.reduce((sum, c) => sum + (c.totalReviews || 0), 0);
        const correctReviews = cards.reduce((sum, c) => sum + (c.correctReviews || 0), 0);
        const overallAccuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

        return {
            totalCards,
            dueCards,
            masteredCards,
            totalReviews,
            correctReviews,
            overallAccuracy,
            deckCount: decks.length,
        };
    }, [cards, decks, totalDueCards]);

    // Get study streak information
    const studyStreakInfo = useMemo(() => {
        return getStudyStreak(studyHistory);
    }, [studyHistory]);

    // Get recent accuracy for recommendations
    const recentAccuracy = useMemo(() => {
        const recentSessions = studyHistory
            .slice(-10) // Last 10 sessions
            .filter(s => s.accuracy !== undefined);

        if (recentSessions.length === 0) return 80;

        const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
        return Math.round(avgAccuracy);
    }, [studyHistory]);

    // Get decks with their due card counts
    const decksWithDueCounts = useMemo(() => {
        return decks.map(deck => ({
            ...deck,
            dueCount: getDueCardsForDeck(deck.id).length,
            stats: getDeckStats(deck.id),
        }));
    }, [decks, getDueCardsForDeck, getDeckStats]);

    // Start a study session with a specific deck
    const startStudySession = useCallback((deckId, cardCount = null) => {
        const dueCards = getDueCardsForDeck(deckId);
        const recommendedCount = cardCount || getRecommendedCardCount(dueCards, recentAccuracy);
        return startSession(deckId, recommendedCount);
    }, [getDueCardsForDeck, recentAccuracy, startSession]);

    // Get cards that need immediate attention (struggling cards)
    const getStrugglingCards = useCallback((deckId = null) => {
        const relevantCards = deckId ? getCardsForDeck(deckId) : cards;
        return relevantCards.filter(card => {
            // Cards with low ease factor or high review count but still failing
            const isStruggling = (card.easeFactor || 2.5) < 2.0 ||
                ((card.totalReviews || 0) > 5 && (card.correctReviews || 0) / (card.totalReviews || 1) < 0.5);
            return isStruggling;
        });
    }, [cards, getCardsForDeck]);

    // Get recommended deck to study
    const getRecommendedDeck = useCallback(() => {
        if (decksWithDueCounts.length === 0) return null;

        // Prioritize decks with due cards
        const decksWithDue = decksWithDueCounts.filter(d => d.dueCount > 0);
        if (decksWithDue.length > 0) {
            // Return deck with most due cards
            return decksWithDue.sort((a, b) => b.dueCount - a.dueCount)[0];
        }

        // If no cards due, return deck with most cards
        return decksWithDueCounts.sort((a, b) => (b.cardCount || 0) - (a.cardCount || 0))[0];
    }, [decksWithDueCounts]);

    // Quick study: start session with recommended deck and count
    const startQuickStudy = useCallback(() => {
        const recommendedDeck = getRecommendedDeck();
        if (!recommendedDeck) return null;
        return startStudySession(recommendedDeck.id);
    }, [getRecommendedDeck, startStudySession]);

    // Check if there's a lesson that could become a flashcard deck
    const canCreateDeckFromLesson = useCallback((lesson) => {
        if (!lesson) return false;
        // Check if deck already exists for this lesson
        const existingDeck = decks.find(d => d.lessonId === lesson.id);
        return !existingDeck && (
            (lesson.content?.vocabulary?.length > 0) ||
            (lesson.content?.keyPoints?.length > 0)
        );
    }, [decks]);

    // Get deck for a specific lesson
    const getDeckForLesson = useCallback((lessonId) => {
        return decks.find(d => d.lessonId === lessonId);
    }, [decks]);

    return {
        // Data
        decks,
        cards,
        decksWithDueCounts,
        currentSession,
        totalDueCards,
        overallStats,
        studyStreakInfo,
        recentAccuracy,

        // Actions
        createDeck,
        createDeckFromLesson,
        addCards,
        startSession,
        startStudySession,
        startQuickStudy,
        recordSessionAnswer,
        endSession,

        // Helpers
        getCardsForDeck,
        getDueCardsForDeck,
        getDeckStats,
        getStrugglingCards,
        getRecommendedDeck,
        canCreateDeckFromLesson,
        getDeckForLesson,
        deleteDeck,
    };
}

export default useFlashcards;
