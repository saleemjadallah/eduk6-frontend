import React, { createContext, useContext, useState, useCallback } from 'react';
import { useGamificationContext } from './GamificationContext';
import { useLessonContext } from './LessonContext';
import { useNotebookContext } from './NotebookContext';
import { generateChatResponse, generateFlashcards, generateQuiz, translateText } from '../services/geminiService';

// XP rewards for different actions
const XP_REWARDS = {
    'ask-jeffrey': 5,
    'create-flashcard': 10,
    'generate-quiz': 8,
    'translate': 5,
    'save-selection': 3,
    'read-aloud': 2,
};

/**
 * Selection Context for managing text selection state and actions
 */
const SelectionContext = createContext(null);

/**
 * Selection Provider Component
 */
export function SelectionProvider({ children }) {
    // Current selection state
    const [currentSelection, setCurrentSelection] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [savedSelections, setSavedSelections] = useState([]);

    // Get context hooks
    const { earnXP, updateStatistics, updateDailyChallengeProgress } = useGamificationContext();
    const { currentLesson } = useLessonContext();
    const { openNotebookModal } = useNotebookContext();

    /**
     * Set the current text selection
     */
    const setSelection = useCallback((selection) => {
        setCurrentSelection(selection);
        // Clear previous result when new selection is made
        if (selection) {
            setResult(null);
        }
    }, []);

    /**
     * Clear the current selection and result
     */
    const clearSelection = useCallback(() => {
        setCurrentSelection(null);
        setResult(null);
        window.getSelection()?.removeAllRanges();
    }, []);

    /**
     * Handle "Ask Jeffrey" action
     */
    const handleAskJeffrey = useCallback(async (userQuestion) => {
        if (!currentSelection) return null;

        setIsProcessing(true);
        try {
            const context = {
                selectedText: currentSelection.text,
                lessonTitle: currentLesson?.title,
                lessonSubject: currentLesson?.subject,
                beforeText: currentSelection.context?.beforeText || '',
                afterText: currentSelection.context?.afterText || '',
            };

            const prompt = userQuestion
                ? `The student selected this text: "${currentSelection.text}" and asks: "${userQuestion}"`
                : `The student selected this text and wants to understand it: "${currentSelection.text}"`;

            const response = await generateChatResponse(prompt, context);

            // Handle both text responses (string) and image responses (object)
            const isImageResponse = typeof response === 'object' && response.type === 'image';

            const resultData = {
                type: 'jeffrey-response',
                content: {
                    answer: isImageResponse ? response.content : response,
                    question: userQuestion,
                    selectedText: currentSelection.text,
                    // Include image data if present
                    ...(isImageResponse && {
                        imageData: response.imageData,
                        mimeType: response.mimeType,
                    }),
                },
                xpEarned: XP_REWARDS['ask-jeffrey'],
            };

            setResult(resultData);

            // Award XP
            earnXP(XP_REWARDS['ask-jeffrey'], 'Asked Jeffrey a question');
            updateStatistics({ questionsAnswered: 1 });
            updateDailyChallengeProgress('questionAnswered');

            return resultData;
        } catch (error) {
            console.error('Error asking Jeffrey:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [currentSelection, currentLesson, earnXP, updateStatistics, updateDailyChallengeProgress]);

    /**
     * Handle "Create Flashcard" action
     */
    const handleCreateFlashcard = useCallback(async () => {
        if (!currentSelection) return null;

        setIsProcessing(true);
        try {
            // Generate a flashcard from the selected text
            const response = await generateFlashcards(currentSelection.text, 1);
            const flashcard = response.flashcards[0];

            // Customize based on selection
            const customFlashcard = {
                id: `selection-${Date.now()}`,
                front: `What does this mean: "${currentSelection.text.substring(0, 100)}${currentSelection.text.length > 100 ? '...' : ''}"?`,
                back: flashcard.back,
                sourceText: currentSelection.text,
                lessonId: currentLesson?.id,
                createdAt: new Date().toISOString(),
            };

            const resultData = {
                type: 'flashcard',
                content: customFlashcard,
                xpEarned: XP_REWARDS['create-flashcard'],
            };

            setResult(resultData);

            // Award XP
            earnXP(XP_REWARDS['create-flashcard'], 'Created a flashcard');
            updateStatistics({ flashcardsReviewed: 1 });
            updateDailyChallengeProgress('flashcardReviewed');

            return resultData;
        } catch (error) {
            console.error('Error creating flashcard:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [currentSelection, currentLesson, earnXP, updateStatistics, updateDailyChallengeProgress]);

    /**
     * Handle "Generate Quiz" action
     */
    const handleGenerateQuiz = useCallback(async () => {
        if (!currentSelection) return null;

        setIsProcessing(true);
        try {
            const response = await generateQuiz(currentSelection.text, 1);
            const quiz = response.questions[0];

            // Customize question based on selection
            const customQuiz = {
                ...quiz,
                id: `quiz-${Date.now()}`,
                question: `Based on "${currentSelection.text.substring(0, 50)}${currentSelection.text.length > 50 ? '...' : ''}", which is correct?`,
                sourceText: currentSelection.text,
                lessonId: currentLesson?.id,
            };

            const resultData = {
                type: 'quiz',
                content: customQuiz,
                xpEarned: XP_REWARDS['generate-quiz'],
            };

            setResult(resultData);

            // Award XP
            earnXP(XP_REWARDS['generate-quiz'], 'Generated a quiz');

            return resultData;
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [currentSelection, currentLesson, earnXP]);

    /**
     * Handle "Save Selection" action - Opens the Notebook Modal
     */
    const handleSaveSelection = useCallback(() => {
        if (!currentSelection) return null;

        // Open the notebook modal with the selected text and lesson context
        openNotebookModal({
            originalText: currentSelection.text,
            lessonId: currentLesson?.id,
            lessonTitle: currentLesson?.title,
            subject: currentLesson?.subject,
        });

        // Clear the selection after opening the modal
        clearSelection();

        return {
            type: 'notebook-opened',
        };
    }, [currentSelection, currentLesson, openNotebookModal, clearSelection]);

    /**
     * Handle "Translate" action
     * @param {string} targetLanguage - Target language to translate to
     */
    const handleTranslate = useCallback(async (targetLanguage = 'Spanish') => {
        if (!currentSelection) return null;

        setIsProcessing(true);
        try {
            const response = await translateText(currentSelection.text, targetLanguage);

            const resultData = {
                type: 'translation',
                content: {
                    originalText: response.originalText,
                    translatedText: response.translatedText,
                    targetLanguage: response.targetLanguage,
                    pronunciation: response.pronunciation,
                    simpleExplanation: response.simpleExplanation,
                },
                xpEarned: XP_REWARDS['translate'],
            };

            setResult(resultData);

            // Award XP
            earnXP(XP_REWARDS['translate'], 'Translated text');

            return resultData;
        } catch (error) {
            console.error('Error translating:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [currentSelection, earnXP]);

    /**
     * Handle "Read Aloud" action using Speech Synthesis
     */
    const handleReadAloud = useCallback(() => {
        if (!currentSelection) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(currentSelection.text);
        utterance.rate = 0.9; // Slightly slower for children
        utterance.pitch = 1.1; // Slightly higher pitch, friendlier

        // Try to use a child-friendly voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Victoria')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);

        // Award XP
        earnXP(XP_REWARDS['read-aloud'], 'Used read aloud');

        return {
            type: 'read-aloud',
            xpEarned: XP_REWARDS['read-aloud'],
        };
    }, [currentSelection, earnXP]);

    /**
     * Handle selection action based on type
     */
    const handleAction = useCallback(async (action) => {
        if (!currentSelection) return;

        switch (action.type) {
            case 'ask':
                return handleAskJeffrey(action.userQuestion);
            case 'flashcard':
                return handleCreateFlashcard();
            case 'quiz':
                return handleGenerateQuiz();
            case 'translate':
                return handleTranslate(action.targetLanguage);
            case 'save':
                return handleSaveSelection();
            case 'read':
                return handleReadAloud();
            default:
                console.warn('Unknown action type:', action.type);
                return null;
        }
    }, [currentSelection, handleAskJeffrey, handleCreateFlashcard, handleGenerateQuiz, handleTranslate, handleSaveSelection, handleReadAloud]);

    /**
     * Clear the result modal
     */
    const clearResult = useCallback(() => {
        setResult(null);
    }, []);

    /**
     * Get saved selections for a lesson
     */
    const getSavedSelectionsForLesson = useCallback((lessonId) => {
        return savedSelections.filter(s => s.lessonId === lessonId);
    }, [savedSelections]);

    /**
     * Remove a saved selection
     */
    const removeSavedSelection = useCallback((selectionId) => {
        setSavedSelections(prev => prev.filter(s => s.id !== selectionId));
    }, []);

    const value = {
        // State
        currentSelection,
        isProcessing,
        result,
        savedSelections,

        // Actions
        setSelection,
        clearSelection,
        handleAction,
        handleAskJeffrey,
        handleCreateFlashcard,
        handleGenerateQuiz,
        handleTranslate,
        handleSaveSelection,
        handleReadAloud,
        clearResult,

        // Utilities
        getSavedSelectionsForLesson,
        removeSavedSelection,
    };

    return (
        <SelectionContext.Provider value={value}>
            {children}
        </SelectionContext.Provider>
    );
}

/**
 * Hook to use selection context
 */
export function useSelectionContext() {
    const context = useContext(SelectionContext);
    if (!context) {
        throw new Error('useSelectionContext must be used within a SelectionProvider');
    }
    return context;
}

export default SelectionContext;
