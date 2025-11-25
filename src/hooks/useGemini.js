import { useState, useCallback } from 'react';
import { processWithGemini, generateFlashcards, generateQuiz } from '../services/geminiService';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyze = useCallback(async (text) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await processWithGemini(text, 'analyze');
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createFlashcards = useCallback(async (text, count = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateFlashcards(text, count);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createQuiz = useCallback(async (text, count = 5) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateQuiz(text, count);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const askQuestion = useCallback(async (context, question) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await processWithGemini(
                `Context: ${context}\n\nQuestion: ${question}`,
                'question'
            );
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        analyze,
        createFlashcards,
        createQuiz,
        askQuestion,
    };
}
