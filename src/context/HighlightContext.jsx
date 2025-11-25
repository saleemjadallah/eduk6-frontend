import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
    currentSelection: null,
    highlights: [],
    activeHighlightId: null,
    isContextMenuOpen: false,
    contextMenuPosition: { x: 0, y: 0 },
    pendingAction: null,
    selectionHistory: [],
};

// Action types
const ACTIONS = {
    SET_SELECTION: 'SET_SELECTION',
    CLEAR_SELECTION: 'CLEAR_SELECTION',
    ADD_HIGHLIGHT: 'ADD_HIGHLIGHT',
    REMOVE_HIGHLIGHT: 'REMOVE_HIGHLIGHT',
    UPDATE_HIGHLIGHT: 'UPDATE_HIGHLIGHT',
    SET_ACTIVE_HIGHLIGHT: 'SET_ACTIVE_HIGHLIGHT',
    OPEN_CONTEXT_MENU: 'OPEN_CONTEXT_MENU',
    CLOSE_CONTEXT_MENU: 'CLOSE_CONTEXT_MENU',
    SET_PENDING_ACTION: 'SET_PENDING_ACTION',
    CLEAR_PENDING_ACTION: 'CLEAR_PENDING_ACTION',
    LOAD_HIGHLIGHTS: 'LOAD_HIGHLIGHTS',
    ADD_TO_HISTORY: 'ADD_TO_HISTORY',
};

// Reducer
function highlightReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_SELECTION:
            return {
                ...state,
                currentSelection: action.payload,
            };

        case ACTIONS.CLEAR_SELECTION:
            return {
                ...state,
                currentSelection: null,
                isContextMenuOpen: false,
            };

        case ACTIONS.ADD_HIGHLIGHT:
            return {
                ...state,
                highlights: [...state.highlights, action.payload],
                currentSelection: null,
                isContextMenuOpen: false,
            };

        case ACTIONS.REMOVE_HIGHLIGHT:
            return {
                ...state,
                highlights: state.highlights.filter(h => h.id !== action.payload),
                activeHighlightId: state.activeHighlightId === action.payload ? null : state.activeHighlightId,
            };

        case ACTIONS.UPDATE_HIGHLIGHT:
            return {
                ...state,
                highlights: state.highlights.map(h =>
                    h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
                ),
            };

        case ACTIONS.SET_ACTIVE_HIGHLIGHT:
            return {
                ...state,
                activeHighlightId: action.payload,
            };

        case ACTIONS.OPEN_CONTEXT_MENU:
            return {
                ...state,
                isContextMenuOpen: true,
                contextMenuPosition: action.payload,
            };

        case ACTIONS.CLOSE_CONTEXT_MENU:
            return {
                ...state,
                isContextMenuOpen: false,
            };

        case ACTIONS.SET_PENDING_ACTION:
            return {
                ...state,
                pendingAction: action.payload,
            };

        case ACTIONS.CLEAR_PENDING_ACTION:
            return {
                ...state,
                pendingAction: null,
            };

        case ACTIONS.LOAD_HIGHLIGHTS:
            return {
                ...state,
                highlights: action.payload,
            };

        case ACTIONS.ADD_TO_HISTORY: {
            const newHistory = [action.payload, ...state.selectionHistory].slice(0, 10);
            return {
                ...state,
                selectionHistory: newHistory,
            };
        }

        default:
            return state;
    }
}

// Context
const HighlightContext = createContext(null);

// Provider
export const HighlightProvider = ({ children, lessonId }) => {
    const [state, dispatch] = useReducer(highlightReducer, initialState);

    // Load highlights from localStorage on mount
    useEffect(() => {
        if (lessonId) {
            const stored = localStorage.getItem(`highlights_${lessonId}`);
            if (stored) {
                try {
                    const highlights = JSON.parse(stored);
                    dispatch({ type: ACTIONS.LOAD_HIGHLIGHTS, payload: highlights });
                } catch (e) {
                    console.error('Failed to load highlights:', e);
                }
            }
        }
    }, [lessonId]);

    // Save highlights to localStorage when they change
    useEffect(() => {
        if (lessonId && state.highlights.length > 0) {
            localStorage.setItem(`highlights_${lessonId}`, JSON.stringify(state.highlights));
        }
    }, [state.highlights, lessonId]);

    // Action creators
    const setSelection = useCallback((selection) => {
        dispatch({
            type: ACTIONS.SET_SELECTION,
            payload: {
                id: uuidv4(),
                ...selection,
                timestamp: new Date().toISOString(),
                lessonId,
            },
        });
    }, [lessonId]);

    const clearSelection = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_SELECTION });
    }, []);

    const addHighlight = useCallback((selection, color = 'yellow') => {
        const highlight = {
            id: uuidv4(),
            selectionId: selection.id,
            text: selection.text,
            pageNumber: selection.pageNumber,
            boundingRects: selection.boundingRects,
            color,
            createdAt: new Date().toISOString(),
            lessonId,
            actions: [],
        };
        dispatch({ type: ACTIONS.ADD_HIGHLIGHT, payload: highlight });
        dispatch({ type: ACTIONS.ADD_TO_HISTORY, payload: selection });
        return highlight;
    }, [lessonId]);

    const removeHighlight = useCallback((highlightId) => {
        dispatch({ type: ACTIONS.REMOVE_HIGHLIGHT, payload: highlightId });
    }, []);

    const updateHighlight = useCallback((highlightId, updates) => {
        dispatch({
            type: ACTIONS.UPDATE_HIGHLIGHT,
            payload: { id: highlightId, updates },
        });
    }, []);

    const recordAction = useCallback((highlightId, actionType, resultId) => {
        const highlight = state.highlights.find(h => h.id === highlightId);
        if (highlight) {
            updateHighlight(highlightId, {
                actions: [
                    ...highlight.actions,
                    { type: actionType, timestamp: new Date().toISOString(), resultId },
                ],
            });
        }
    }, [state.highlights, updateHighlight]);

    const setActiveHighlight = useCallback((highlightId) => {
        dispatch({ type: ACTIONS.SET_ACTIVE_HIGHLIGHT, payload: highlightId });
    }, []);

    const openContextMenu = useCallback((position) => {
        dispatch({ type: ACTIONS.OPEN_CONTEXT_MENU, payload: position });
    }, []);

    const closeContextMenu = useCallback(() => {
        dispatch({ type: ACTIONS.CLOSE_CONTEXT_MENU });
    }, []);

    const setPendingAction = useCallback((action) => {
        dispatch({ type: ACTIONS.SET_PENDING_ACTION, payload: action });
    }, []);

    const clearPendingAction = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_PENDING_ACTION });
    }, []);

    const value = {
        ...state,
        setSelection,
        clearSelection,
        addHighlight,
        removeHighlight,
        updateHighlight,
        recordAction,
        setActiveHighlight,
        openContextMenu,
        closeContextMenu,
        setPendingAction,
        clearPendingAction,
    };

    return (
        <HighlightContext.Provider value={value}>
            {children}
        </HighlightContext.Provider>
    );
};

// Custom hook
export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export default HighlightContext;
