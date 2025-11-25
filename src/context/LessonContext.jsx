import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  PROCESSING_STAGES,
  DEFAULT_LESSON,
  STORAGE_KEYS
} from '../constants/lessonConstants';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  // Current active lesson (null if none selected)
  currentLesson: null,

  // All lessons in library
  lessons: [],

  // Processing state
  isProcessing: false,
  processingProgress: 0,
  processingStage: 'idle',

  // Error handling
  error: null,

  // UI state
  isLessonDrawerOpen: false,
};

// ============================================
// ACTION TYPES
// ============================================
const ACTIONS = {
  // Processing lifecycle
  START_PROCESSING: 'START_PROCESSING',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_PROCESSING_STAGE: 'SET_PROCESSING_STAGE',
  RESET_PROCESSING: 'RESET_PROCESSING',

  // Lesson CRUD
  ADD_LESSON: 'ADD_LESSON',
  SET_CURRENT_LESSON: 'SET_CURRENT_LESSON',
  UPDATE_LESSON: 'UPDATE_LESSON',
  DELETE_LESSON: 'DELETE_LESSON',
  LOAD_LESSONS: 'LOAD_LESSONS',

  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // UI state
  TOGGLE_LESSON_DRAWER: 'TOGGLE_LESSON_DRAWER',

  // Progress tracking
  UPDATE_LESSON_PROGRESS: 'UPDATE_LESSON_PROGRESS',
  INCREMENT_TIME_SPENT: 'INCREMENT_TIME_SPENT',
};

// ============================================
// REDUCER
// ============================================
function lessonReducer(state, action) {
  switch (action.type) {
    // --- Processing Lifecycle ---
    case ACTIONS.START_PROCESSING:
      return {
        ...state,
        isProcessing: true,
        processingProgress: PROCESSING_STAGES.uploading.progress,
        processingStage: 'uploading',
        error: null,
      };

    case ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        processingProgress: Math.min(100, Math.max(0, action.payload)),
      };

    case ACTIONS.SET_PROCESSING_STAGE:
      const stage = PROCESSING_STAGES[action.payload];
      return {
        ...state,
        processingStage: action.payload,
        processingProgress: stage ? stage.progress : state.processingProgress,
      };

    case ACTIONS.RESET_PROCESSING:
      return {
        ...state,
        isProcessing: false,
        processingProgress: 0,
        processingStage: 'idle',
      };

    // --- Lesson CRUD ---
    case ACTIONS.ADD_LESSON:
      return {
        ...state,
        lessons: [action.payload, ...state.lessons], // Newest first
        currentLesson: action.payload,
        isProcessing: false,
        processingProgress: 100,
        processingStage: 'complete',
      };

    case ACTIONS.LOAD_LESSONS:
      return {
        ...state,
        lessons: action.payload.lessons,
        currentLesson: action.payload.currentLesson,
      };

    case ACTIONS.SET_CURRENT_LESSON:
      const lesson = state.lessons.find(l => l.id === action.payload);
      return {
        ...state,
        currentLesson: lesson || null,
      };

    case ACTIONS.UPDATE_LESSON:
      const updatedLessons = state.lessons.map(l =>
        l.id === action.payload.id
          ? { ...l, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : l
      );
      return {
        ...state,
        lessons: updatedLessons,
        currentLesson: state.currentLesson?.id === action.payload.id
          ? { ...state.currentLesson, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.currentLesson,
      };

    case ACTIONS.DELETE_LESSON:
      const filteredLessons = state.lessons.filter(l => l.id !== action.payload);
      return {
        ...state,
        lessons: filteredLessons,
        currentLesson: state.currentLesson?.id === action.payload
          ? (filteredLessons[0] || null)
          : state.currentLesson,
      };

    // --- Progress Tracking ---
    case ACTIONS.UPDATE_LESSON_PROGRESS:
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id
            ? {
                ...l,
                progress: { ...l.progress, ...action.payload.progress },
                updatedAt: new Date().toISOString(),
              }
            : l
        ),
        currentLesson: state.currentLesson?.id === action.payload.id
          ? {
              ...state.currentLesson,
              progress: { ...state.currentLesson.progress, ...action.payload.progress },
              updatedAt: new Date().toISOString(),
            }
          : state.currentLesson,
      };

    case ACTIONS.INCREMENT_TIME_SPENT:
      if (!state.currentLesson) return state;
      const newTimeSpent = (state.currentLesson.progress?.timeSpent || 0) + action.payload;
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === state.currentLesson.id
            ? {
                ...l,
                progress: {
                  ...l.progress,
                  timeSpent: newTimeSpent,
                  lastAccessedAt: new Date().toISOString(),
                },
              }
            : l
        ),
        currentLesson: {
          ...state.currentLesson,
          progress: {
            ...state.currentLesson.progress,
            timeSpent: newTimeSpent,
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };

    // --- Error Handling ---
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        processingStage: 'error',
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        processingStage: 'idle',
      };

    // --- UI State ---
    case ACTIONS.TOGGLE_LESSON_DRAWER:
      return {
        ...state,
        isLessonDrawerOpen: action.payload ?? !state.isLessonDrawerOpen,
      };

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================
const LessonContext = createContext(null);

// ============================================
// PROVIDER COMPONENT
// ============================================
export function LessonProvider({ children }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState);

  // --- Persistence: Load from localStorage on mount ---
  useEffect(() => {
    try {
      const storedLessons = localStorage.getItem(STORAGE_KEYS.LESSONS);
      const storedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_LESSON_ID);

      if (storedLessons) {
        const lessons = JSON.parse(storedLessons);
        const currentLesson = storedCurrentId
          ? lessons.find(l => l.id === storedCurrentId)
          : lessons[0] || null;

        dispatch({
          type: ACTIONS.LOAD_LESSONS,
          payload: { lessons, currentLesson }
        });
      }
    } catch (error) {
      console.error('Failed to load lessons from storage:', error);
    }
  }, []);

  // --- Persistence: Save to localStorage on state change ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(state.lessons));
      if (state.currentLesson) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_LESSON_ID, state.currentLesson.id);
      }
    } catch (error) {
      console.error('Failed to save lessons to storage:', error);
    }
  }, [state.lessons, state.currentLesson]);

  // --- Time tracking: Increment every 30 seconds while lesson is active ---
  useEffect(() => {
    if (!state.currentLesson || state.isProcessing) return;

    const interval = setInterval(() => {
      dispatch({ type: ACTIONS.INCREMENT_TIME_SPENT, payload: 30 });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.currentLesson?.id, state.isProcessing]);

  // ============================================
  // ACTION CREATORS
  // ============================================

  // Processing lifecycle
  const startProcessing = useCallback(() => {
    dispatch({ type: ACTIONS.START_PROCESSING });
  }, []);

  const updateProgress = useCallback((progress) => {
    dispatch({ type: ACTIONS.UPDATE_PROGRESS, payload: progress });
  }, []);

  const setProcessingStage = useCallback((stage) => {
    dispatch({ type: ACTIONS.SET_PROCESSING_STAGE, payload: stage });
  }, []);

  const resetProcessing = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_PROCESSING });
  }, []);

  // Lesson CRUD
  const addLesson = useCallback((lessonData) => {
    const now = new Date().toISOString();
    const newLesson = {
      ...DEFAULT_LESSON,
      ...lessonData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      progress: {
        ...DEFAULT_LESSON.progress,
        started: true,
        lastAccessedAt: now,
      },
    };
    dispatch({ type: ACTIONS.ADD_LESSON, payload: newLesson });
    return newLesson;
  }, []);

  const setCurrentLesson = useCallback((lessonId) => {
    dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: lessonId });
  }, []);

  const clearCurrentLesson = useCallback(() => {
    dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: null });
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LESSON_ID);
  }, []);

  const updateLesson = useCallback((lessonId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_LESSON, payload: { id: lessonId, updates } });
  }, []);

  const deleteLesson = useCallback((lessonId) => {
    dispatch({ type: ACTIONS.DELETE_LESSON, payload: lessonId });
  }, []);

  // Progress tracking
  const updateLessonProgress = useCallback((lessonId, progress) => {
    dispatch({ type: ACTIONS.UPDATE_LESSON_PROGRESS, payload: { id: lessonId, progress } });
  }, []);

  const markLessonComplete = useCallback((lessonId) => {
    updateLessonProgress(lessonId, { percentComplete: 100, completedAt: new Date().toISOString() });
  }, [updateLessonProgress]);

  // Error handling
  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // UI state
  const toggleLessonDrawer = useCallback((isOpen) => {
    dispatch({ type: ACTIONS.TOGGLE_LESSON_DRAWER, payload: isOpen });
  }, []);

  // ============================================
  // DERIVED STATE / SELECTORS
  // ============================================
  const derivedState = useMemo(() => ({
    // Check if there's any lesson available
    hasLessons: state.lessons.length > 0,

    // Total lessons count
    lessonCount: state.lessons.length,

    // Get current processing stage info
    currentStageInfo: PROCESSING_STAGES[state.processingStage] || PROCESSING_STAGES.idle,

    // Is ready for interaction (not processing, has lesson)
    isReady: !state.isProcessing && state.currentLesson !== null,

    // Get recent lessons (last 5)
    recentLessons: state.lessons.slice(0, 5),

    // Get lessons by subject (for filtering)
    lessonsBySubject: state.lessons.reduce((acc, lesson) => {
      const subject = lesson.subject || 'Uncategorized';
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(lesson);
      return acc;
    }, {}),

    // Total time spent learning (across all lessons)
    totalTimeSpent: state.lessons.reduce((total, lesson) => {
      return total + (lesson.progress?.timeSpent || 0);
    }, 0),

    // Lessons completed count
    completedLessonsCount: state.lessons.filter(l => l.progress?.percentComplete === 100).length,
  }), [state.lessons, state.currentLesson, state.isProcessing, state.processingStage]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = useMemo(() => ({
    // State
    ...state,
    ...derivedState,

    // Processing actions
    startProcessing,
    updateProgress,
    setProcessingStage,
    resetProcessing,

    // Lesson CRUD
    addLesson,
    setCurrentLesson,
    clearCurrentLesson,
    updateLesson,
    deleteLesson,

    // Progress tracking
    updateLessonProgress,
    markLessonComplete,

    // Error handling
    setError,
    clearError,

    // UI state
    toggleLessonDrawer,
  }), [
    state,
    derivedState,
    startProcessing,
    updateProgress,
    setProcessingStage,
    resetProcessing,
    addLesson,
    setCurrentLesson,
    clearCurrentLesson,
    updateLesson,
    deleteLesson,
    updateLessonProgress,
    markLessonComplete,
    setError,
    clearError,
    toggleLessonDrawer,
  ]);

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================
export function useLessonContext() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
}

// ============================================
// EXPORTS
// ============================================
export { LessonContext, ACTIONS };
export default LessonContext;
