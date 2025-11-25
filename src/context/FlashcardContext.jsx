import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    calculateNextReview,
    getCardsDueForReview,
    sortCardsByPriority,
    calculateSessionStats,
} from '../utils/spacedRepetition';
import { getMasteryLevel } from '../constants/flashcardConstants';

// Initial state
const initialState = {
    decks: [],
    cards: [],
    currentSession: null,
    studyHistory: [],
    isLoading: false,
    error: null,
};

// Action types
const ACTIONS = {
    // Deck actions
    CREATE_DECK: 'CREATE_DECK',
    UPDATE_DECK: 'UPDATE_DECK',
    DELETE_DECK: 'DELETE_DECK',

    // Card actions
    ADD_CARDS: 'ADD_CARDS',
    UPDATE_CARD: 'UPDATE_CARD',
    DELETE_CARD: 'DELETE_CARD',
    RECORD_CARD_REVIEW: 'RECORD_CARD_REVIEW',

    // Session actions
    START_SESSION: 'START_SESSION',
    END_SESSION: 'END_SESSION',
    UPDATE_SESSION_PROGRESS: 'UPDATE_SESSION_PROGRESS',

    // Data management
    LOAD_DATA: 'LOAD_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function flashcardReducer(state, action) {
    switch (action.type) {
        case ACTIONS.CREATE_DECK:
            return {
                ...state,
                decks: [...state.decks, action.payload],
            };

        case ACTIONS.UPDATE_DECK:
            return {
                ...state,
                decks: state.decks.map(deck =>
                    deck.id === action.payload.id ? { ...deck, ...action.payload } : deck
                ),
            };

        case ACTIONS.DELETE_DECK:
            return {
                ...state,
                decks: state.decks.filter(deck => deck.id !== action.payload),
                cards: state.cards.filter(card => card.deckId !== action.payload),
            };

        case ACTIONS.ADD_CARDS:
            return {
                ...state,
                cards: [...state.cards, ...action.payload],
            };

        case ACTIONS.UPDATE_CARD:
            return {
                ...state,
                cards: state.cards.map(card =>
                    card.id === action.payload.id ? { ...card, ...action.payload } : card
                ),
            };

        case ACTIONS.DELETE_CARD:
            return {
                ...state,
                cards: state.cards.filter(card => card.id !== action.payload),
            };

        case ACTIONS.RECORD_CARD_REVIEW: {
            const { cardId, wasCorrect, confidence } = action.payload;
            const card = state.cards.find(c => c.id === cardId);

            if (!card) return state;

            const reviewResult = calculateNextReview(card, wasCorrect);
            const updatedCard = {
                ...card,
                ...reviewResult,
                totalReviews: (card.totalReviews || 0) + 1,
                correctReviews: (card.correctReviews || 0) + (wasCorrect ? 1 : 0),
                lastReviewDate: new Date().toISOString(),
                lastConfidence: confidence,
            };

            return {
                ...state,
                cards: state.cards.map(c => c.id === cardId ? updatedCard : c),
            };
        }

        case ACTIONS.START_SESSION:
            return {
                ...state,
                currentSession: {
                    id: uuidv4(),
                    deckId: action.payload.deckId,
                    startTime: new Date().toISOString(),
                    cardIds: action.payload.cardIds,
                    currentIndex: 0,
                    results: [],
                },
            };

        case ACTIONS.UPDATE_SESSION_PROGRESS:
            return {
                ...state,
                currentSession: state.currentSession ? {
                    ...state.currentSession,
                    currentIndex: action.payload.currentIndex,
                    results: action.payload.results,
                } : null,
            };

        case ACTIONS.END_SESSION: {
            const session = state.currentSession;
            if (!session) return state;

            const completedSession = {
                ...session,
                endTime: new Date().toISOString(),
                stats: calculateSessionStats(session.results),
            };

            return {
                ...state,
                currentSession: null,
                studyHistory: [...state.studyHistory, {
                    id: session.id,
                    deckId: session.deckId,
                    date: new Date().toISOString(),
                    cardsReviewed: session.results.length,
                    accuracy: completedSession.stats.accuracy,
                    xpEarned: completedSession.stats.xpEarned,
                }],
            };
        }

        case ACTIONS.LOAD_DATA:
            return {
                ...state,
                ...action.payload,
                isLoading: false,
            };

        case ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };

        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
}

// Context
const FlashcardContext = createContext(null);

// Provider
export function FlashcardProvider({ children }) {
    const [state, dispatch] = useReducer(flashcardReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('flashcardData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
            } catch (error) {
                console.error('Error loading flashcard data:', error);
            }
        }
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        const dataToSave = {
            decks: state.decks,
            cards: state.cards,
            studyHistory: state.studyHistory,
        };
        localStorage.setItem('flashcardData', JSON.stringify(dataToSave));
    }, [state.decks, state.cards, state.studyHistory]);

    // Deck actions
    const createDeck = useCallback((deckData) => {
        const newDeck = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cardCount: 0,
            ...deckData,
        };
        dispatch({ type: ACTIONS.CREATE_DECK, payload: newDeck });
        return newDeck;
    }, []);

    const updateDeck = useCallback((deckId, updates) => {
        dispatch({
            type: ACTIONS.UPDATE_DECK,
            payload: { id: deckId, ...updates, updatedAt: new Date().toISOString() },
        });
    }, []);

    const deleteDeck = useCallback((deckId) => {
        dispatch({ type: ACTIONS.DELETE_DECK, payload: deckId });
    }, []);

    // Card actions
    const addCards = useCallback((cards, deckId) => {
        const newCards = cards.map(card => ({
            id: uuidv4(),
            deckId,
            createdAt: new Date().toISOString(),
            correctStreak: 0,
            easeFactor: 2.5,
            totalReviews: 0,
            correctReviews: 0,
            nextReviewDate: null,
            ...card,
        }));
        dispatch({ type: ACTIONS.ADD_CARDS, payload: newCards });

        // Update deck card count
        const deck = state.decks.find(d => d.id === deckId);
        if (deck) {
            updateDeck(deckId, { cardCount: (deck.cardCount || 0) + newCards.length });
        }

        return newCards;
    }, [state.decks, updateDeck]);

    const updateCard = useCallback((cardId, updates) => {
        dispatch({ type: ACTIONS.UPDATE_CARD, payload: { id: cardId, ...updates } });
    }, []);

    const deleteCard = useCallback((cardId) => {
        const card = state.cards.find(c => c.id === cardId);
        if (card) {
            const deck = state.decks.find(d => d.id === card.deckId);
            if (deck) {
                updateDeck(card.deckId, { cardCount: Math.max(0, (deck.cardCount || 1) - 1) });
            }
        }
        dispatch({ type: ACTIONS.DELETE_CARD, payload: cardId });
    }, [state.cards, state.decks, updateDeck]);

    const recordCardReview = useCallback((cardId, wasCorrect, confidence) => {
        dispatch({
            type: ACTIONS.RECORD_CARD_REVIEW,
            payload: { cardId, wasCorrect, confidence },
        });
    }, []);

    // Session actions
    const startSession = useCallback((deckId, cardCount = 10) => {
        const deckCards = state.cards.filter(c => c.deckId === deckId);
        const dueCards = getCardsDueForReview(deckCards);
        const sortedCards = sortCardsByPriority(dueCards);
        const sessionCards = sortedCards.slice(0, cardCount);

        if (sessionCards.length === 0) {
            return null;
        }

        dispatch({
            type: ACTIONS.START_SESSION,
            payload: {
                deckId,
                cardIds: sessionCards.map(c => c.id),
            },
        });

        return sessionCards;
    }, [state.cards]);

    const recordSessionAnswer = useCallback((cardId, wasCorrect, confidence) => {
        if (!state.currentSession) return;

        // Record the card review
        recordCardReview(cardId, wasCorrect, confidence);

        // Update session progress
        const newResults = [
            ...state.currentSession.results,
            { cardId, wasCorrect, confidence, timestamp: new Date().toISOString() },
        ];

        dispatch({
            type: ACTIONS.UPDATE_SESSION_PROGRESS,
            payload: {
                currentIndex: state.currentSession.currentIndex + 1,
                results: newResults,
            },
        });

        // Check if session is complete
        if (newResults.length >= state.currentSession.cardIds.length) {
            return endSession();
        }

        return null;
    }, [state.currentSession, recordCardReview]);

    const endSession = useCallback(() => {
        if (!state.currentSession) return null;

        const stats = calculateSessionStats(state.currentSession.results);
        dispatch({ type: ACTIONS.END_SESSION });
        return stats;
    }, [state.currentSession]);

    // Helper functions
    const getCardsForDeck = useCallback((deckId) => {
        return state.cards.filter(c => c.deckId === deckId);
    }, [state.cards]);

    const getDueCardsForDeck = useCallback((deckId) => {
        const deckCards = getCardsForDeck(deckId);
        return getCardsDueForReview(deckCards);
    }, [getCardsForDeck]);

    const getTotalDueCards = useCallback(() => {
        return getCardsDueForReview(state.cards).length;
    }, [state.cards]);

    const getDeckStats = useCallback((deckId) => {
        const cards = getCardsForDeck(deckId);
        const dueCards = getCardsDueForReview(cards);

        const masteryDistribution = cards.reduce((acc, card) => {
            const level = getMasteryLevel(card.correctReviews || 0);
            acc[level.label] = (acc[level.label] || 0) + 1;
            return acc;
        }, {});

        return {
            totalCards: cards.length,
            dueCards: dueCards.length,
            masteryDistribution,
            averageEaseFactor: cards.length > 0
                ? cards.reduce((sum, c) => sum + (c.easeFactor || 2.5), 0) / cards.length
                : 2.5,
        };
    }, [getCardsForDeck]);

    // Create deck from lesson content
    const createDeckFromLesson = useCallback((lesson) => {
        const deck = createDeck({
            name: `${lesson.title} Flashcards`,
            description: `Flashcards generated from: ${lesson.title}`,
            category: 'lesson',
            lessonId: lesson.id,
            color: 'blue',
        });

        // Generate cards from lesson content
        const cards = [];

        // Add vocabulary cards
        if (lesson.content?.vocabulary) {
            lesson.content.vocabulary.forEach(vocab => {
                cards.push({
                    front: `What does "${vocab.term}" mean?`,
                    back: vocab.definition,
                    type: 'vocabulary',
                });
            });
        }

        // Add key points as cards
        if (lesson.content?.keyPoints) {
            lesson.content.keyPoints.forEach((point, index) => {
                cards.push({
                    front: `Key Point ${index + 1}: Fill in the blank or explain this concept:`,
                    back: point,
                    type: 'concept',
                });
            });
        }

        if (cards.length > 0) {
            addCards(cards, deck.id);
        }

        return deck;
    }, [createDeck, addCards]);

    const value = {
        // State
        ...state,

        // Deck actions
        createDeck,
        updateDeck,
        deleteDeck,
        createDeckFromLesson,

        // Card actions
        addCards,
        updateCard,
        deleteCard,
        recordCardReview,

        // Session actions
        startSession,
        recordSessionAnswer,
        endSession,

        // Helpers
        getCardsForDeck,
        getDueCardsForDeck,
        getTotalDueCards,
        getDeckStats,
    };

    return (
        <FlashcardContext.Provider value={value}>
            {children}
        </FlashcardContext.Provider>
    );
}

// Hook
export function useFlashcardContext() {
    const context = useContext(FlashcardContext);
    if (!context) {
        throw new Error('useFlashcardContext must be used within a FlashcardProvider');
    }
    return context;
}

export default FlashcardContext;
