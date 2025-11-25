import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
    currentLesson: null,
    lessons: [],
    isProcessing: false,
    processingProgress: 0,
    processingStage: '', // 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete'
    error: null,
};

// Action types
const ACTIONS = {
    START_PROCESSING: 'START_PROCESSING',
    UPDATE_PROGRESS: 'UPDATE_PROGRESS',
    SET_PROCESSING_STAGE: 'SET_PROCESSING_STAGE',
    ADD_LESSON: 'ADD_LESSON',
    SET_CURRENT_LESSON: 'SET_CURRENT_LESSON',
    UPDATE_LESSON: 'UPDATE_LESSON',
    DELETE_LESSON: 'DELETE_LESSON',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    RESET_PROCESSING: 'RESET_PROCESSING',
};

// Reducer
function lessonReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_PROCESSING:
            return {
                ...state,
                isProcessing: true,
                processingProgress: 0,
                processingStage: 'uploading',
                error: null,
            };
        case ACTIONS.UPDATE_PROGRESS:
            return {
                ...state,
                processingProgress: action.payload,
            };
        case ACTIONS.SET_PROCESSING_STAGE:
            return {
                ...state,
                processingStage: action.payload,
            };
        case ACTIONS.ADD_LESSON:
            return {
                ...state,
                lessons: [...state.lessons, action.payload],
                currentLesson: action.payload,
                isProcessing: false,
                processingProgress: 100,
                processingStage: 'complete',
            };
        case ACTIONS.SET_CURRENT_LESSON:
            return {
                ...state,
                currentLesson: state.lessons.find(l => l.id === action.payload) || null,
            };
        case ACTIONS.UPDATE_LESSON:
            return {
                ...state,
                lessons: state.lessons.map(l => 
                    l.id === action.payload.id ? { ...l, ...action.payload } : l
                ),
                currentLesson: state.currentLesson?.id === action.payload.id 
                    ? { ...state.currentLesson, ...action.payload }
                    : state.currentLesson,
            };
        case ACTIONS.DELETE_LESSON:
            return {
                ...state,
                lessons: state.lessons.filter(l => l.id !== action.payload),
                currentLesson: state.currentLesson?.id === action.payload 
                    ? null 
                    : state.currentLesson,
            };
        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isProcessing: false,
            };
        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case ACTIONS.RESET_PROCESSING:
            return {
                ...state,
                isProcessing: false,
                processingProgress: 0,
                processingStage: '',
            };
        default:
            return state;
    }
}

// Context
const LessonContext = createContext(null);

// Provider component
export function LessonProvider({ children }) {
    const [state, dispatch] = useReducer(lessonReducer, initialState);

    // Action creators
    const startProcessing = useCallback(() => {
        dispatch({ type: ACTIONS.START_PROCESSING });
    }, []);

    const updateProgress = useCallback((progress) => {
        dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress });
    }, []);

    const setProcessingStage = useCallback((stage) => {
        dispatch({ type: ACTIONS.SET_PROCESSING_STAGE, payload: stage });
    }, []);

    const addLesson = useCallback((lesson) => {
        const newLesson = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            ...lesson,
        };
        dispatch({ type: ACTIONS.ADD_LESSON, payload: newLesson });
        return newLesson;
    }, []);

    const setCurrentLesson = useCallback((lessonId) => {
        dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: lessonId });
    }, []);

    const updateLesson = useCallback((lessonUpdate) => {
        dispatch({ type: ACTIONS.UPDATE_LESSON, payload: lessonUpdate });
    }, []);

    const deleteLesson = useCallback((lessonId) => {
        dispatch({ type: ACTIONS.DELETE_LESSON, payload: lessonId });
    }, []);

    const setError = useCallback((error) => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []);

    const resetProcessing = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_PROCESSING });
    }, []);

    const value = {
        // State
        ...state,
        // Actions
        startProcessing,
        updateProgress,
        setProcessingStage,
        addLesson,
        setCurrentLesson,
        updateLesson,
        deleteLesson,
        setError,
        clearError,
        resetProcessing,
    };

    return (
        <LessonContext.Provider value={value}>
            {children}
        </LessonContext.Provider>
    );
}

// Hook
export function useLessonContext() {
    const context = useContext(LessonContext);
    if (!context) {
        throw new Error('useLessonContext must be used within a LessonProvider');
    }
    return context;
}

export default LessonContext;
