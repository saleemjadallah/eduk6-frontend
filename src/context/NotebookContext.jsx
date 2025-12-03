import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { noteAPI } from '../services/api/noteAPI';
import { useAuth } from './AuthContext';

// Helper function to group notes by subject
function groupNotesBySubject(notes) {
  const grouped = {};
  for (const note of notes) {
    const key = note.subject || 'OTHER';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(note);
  }
  return grouped;
}

// Initial state
const initialState = {
  // Notes data
  notes: [],
  notesBySubject: {},
  noteStats: null,

  // UI State
  isNotebookModalOpen: false,
  pendingNoteData: null, // Data passed when opening modal from highlight
  selectedNote: null, // Currently selected note for viewing/editing
  activeSubject: 'all', // Filter state

  // Loading states
  isLoading: false,
  isSaving: false,
  isInitialized: false,
  loadedChildId: null,
  error: null,
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  LOAD_NOTES: 'LOAD_NOTES',
  LOAD_STATS: 'LOAD_STATS',
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  OPEN_NOTEBOOK_MODAL: 'OPEN_NOTEBOOK_MODAL',
  CLOSE_NOTEBOOK_MODAL: 'CLOSE_NOTEBOOK_MODAL',
  SET_SELECTED_NOTE: 'SET_SELECTED_NOTE',
  CLEAR_SELECTED_NOTE: 'CLEAR_SELECTED_NOTE',
  SET_ACTIVE_SUBJECT: 'SET_ACTIVE_SUBJECT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_STATE: 'CLEAR_STATE',
};

// Reducer
function notebookReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_SAVING:
      return { ...state, isSaving: action.payload };

    case ACTIONS.LOAD_NOTES:
      return {
        ...state,
        notes: action.payload.notes,
        notesBySubject: groupNotesBySubject(action.payload.notes),
        isLoading: false,
        isInitialized: true,
        loadedChildId: action.payload.childId,
        error: null,
      };

    case ACTIONS.LOAD_STATS:
      return {
        ...state,
        noteStats: action.payload,
      };

    case ACTIONS.ADD_NOTE:
      const newNotes = [action.payload, ...state.notes];
      return {
        ...state,
        notes: newNotes,
        notesBySubject: groupNotesBySubject(newNotes),
        isSaving: false,
      };

    case ACTIONS.UPDATE_NOTE:
      const updatedNotes = state.notes.map((note) =>
        note.id === action.payload.id ? action.payload : note
      );
      return {
        ...state,
        notes: updatedNotes,
        notesBySubject: groupNotesBySubject(updatedNotes),
        selectedNote: state.selectedNote?.id === action.payload.id ? action.payload : state.selectedNote,
        isSaving: false,
      };

    case ACTIONS.DELETE_NOTE:
      const filteredNotes = state.notes.filter((note) => note.id !== action.payload);
      return {
        ...state,
        notes: filteredNotes,
        notesBySubject: groupNotesBySubject(filteredNotes),
        selectedNote: state.selectedNote?.id === action.payload ? null : state.selectedNote,
      };

    case ACTIONS.OPEN_NOTEBOOK_MODAL:
      return {
        ...state,
        isNotebookModalOpen: true,
        pendingNoteData: action.payload,
      };

    case ACTIONS.CLOSE_NOTEBOOK_MODAL:
      return {
        ...state,
        isNotebookModalOpen: false,
        pendingNoteData: null,
      };

    case ACTIONS.SET_SELECTED_NOTE:
      return {
        ...state,
        selectedNote: action.payload,
      };

    case ACTIONS.CLEAR_SELECTED_NOTE:
      return {
        ...state,
        selectedNote: null,
      };

    case ACTIONS.SET_ACTIVE_SUBJECT:
      return {
        ...state,
        activeSubject: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSaving: false,
      };

    case ACTIONS.CLEAR_STATE:
      return initialState;

    default:
      return state;
  }
}

// Context
const NotebookContext = createContext(null);

// Provider
export function NotebookProvider({ children }) {
  const [state, dispatch] = useReducer(notebookReducer, initialState);
  const { currentProfile } = useAuth();
  const fetchingRef = useRef(false);

  // Fetch notes when child profile changes
  useEffect(() => {
    if (currentProfile?.id && currentProfile.id !== state.loadedChildId) {
      fetchNotes();
    }
  }, [currentProfile?.id]);

  // Clear state when logging out
  useEffect(() => {
    if (!currentProfile) {
      dispatch({ type: ACTIONS.CLEAR_STATE });
    }
  }, [currentProfile]);

  /**
   * Fetch all notes for the current child
   */
  const fetchNotes = useCallback(async () => {
    if (!currentProfile?.id || fetchingRef.current) return;

    fetchingRef.current = true;
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await noteAPI.getMyNotes();
      if (response.success) {
        dispatch({
          type: ACTIONS.LOAD_NOTES,
          payload: {
            notes: response.data.notes || [],
            childId: currentProfile.id,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to fetch notes',
      });
    } finally {
      fetchingRef.current = false;
    }
  }, [currentProfile?.id]);

  /**
   * Fetch note statistics
   */
  const fetchNoteStats = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      const response = await noteAPI.getMyNoteStats();
      if (response.success) {
        dispatch({
          type: ACTIONS.LOAD_STATS,
          payload: response.data,
        });
      }
    } catch (error) {
      console.error('Failed to fetch note stats:', error);
    }
  }, [currentProfile?.id]);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (noteData) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      const response = await noteAPI.createNote(noteData);
      if (response.success) {
        dispatch({
          type: ACTIONS.ADD_NOTE,
          payload: response.data.note,
        });

        // Close modal after successful save
        dispatch({ type: ACTIONS.CLOSE_NOTEBOOK_MODAL });

        return {
          success: true,
          note: response.data.note,
          xpAwarded: response.data.xpAwarded,
          leveledUp: response.data.leveledUp,
          newBadges: response.data.newBadges,
        };
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to create note',
      });
      return { success: false, error: error.message };
    }

    return { success: false };
  }, []);

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (noteId, updateData) => {
    dispatch({ type: ACTIONS.SET_SAVING, payload: true });

    try {
      const response = await noteAPI.updateNote(noteId, updateData);
      if (response.success) {
        dispatch({
          type: ACTIONS.UPDATE_NOTE,
          payload: response.data.note,
        });
        return {
          success: true,
          note: response.data.note,
          xpAwarded: response.data.xpAwarded,
        };
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update note',
      });
      return { success: false, error: error.message };
    }

    return { success: false };
  }, []);

  /**
   * Update note cover personalization
   */
  const updateNoteCover = useCallback(async (noteId, coverData) => {
    try {
      const response = await noteAPI.updateNoteCover(noteId, coverData);
      if (response.success) {
        dispatch({
          type: ACTIONS.UPDATE_NOTE,
          payload: response.data.note,
        });
        return { success: true, note: response.data.note };
      }
    } catch (error) {
      console.error('Failed to update note cover:', error);
      return { success: false, error: error.message };
    }

    return { success: false };
  }, []);

  /**
   * Toggle pin status for a note
   */
  const toggleNotePin = useCallback(async (noteId) => {
    try {
      const response = await noteAPI.toggleNotePin(noteId);
      if (response.success) {
        dispatch({
          type: ACTIONS.UPDATE_NOTE,
          payload: response.data.note,
        });
        return { success: true, note: response.data.note };
      }
    } catch (error) {
      console.error('Failed to toggle note pin:', error);
      return { success: false, error: error.message };
    }

    return { success: false };
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (noteId) => {
    try {
      const response = await noteAPI.deleteNote(noteId);
      if (response.success) {
        dispatch({
          type: ACTIONS.DELETE_NOTE,
          payload: noteId,
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      return { success: false, error: error.message };
    }

    return { success: false };
  }, []);

  /**
   * Open notebook modal with optional pre-populated data
   * Called when "Add to notes" is clicked from highlight popup
   */
  const openNotebookModal = useCallback((noteData = null) => {
    dispatch({
      type: ACTIONS.OPEN_NOTEBOOK_MODAL,
      payload: noteData,
    });
  }, []);

  /**
   * Close notebook modal
   */
  const closeNotebookModal = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_NOTEBOOK_MODAL });
  }, []);

  /**
   * Set selected note for viewing/editing
   */
  const setSelectedNote = useCallback((note) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_NOTE,
      payload: note,
    });
  }, []);

  /**
   * Clear selected note
   */
  const clearSelectedNote = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTED_NOTE });
  }, []);

  /**
   * Set active subject filter
   */
  const setActiveSubject = useCallback((subject) => {
    dispatch({
      type: ACTIONS.SET_ACTIVE_SUBJECT,
      payload: subject,
    });
  }, []);

  /**
   * Get notes filtered by active subject
   */
  const getFilteredNotes = useCallback(() => {
    if (state.activeSubject === 'all') {
      return state.notes;
    }
    return state.notesBySubject[state.activeSubject] || [];
  }, [state.notes, state.notesBySubject, state.activeSubject]);

  /**
   * Get available subjects (subjects that have notes)
   */
  const getAvailableSubjects = useCallback(() => {
    return Object.keys(state.notesBySubject);
  }, [state.notesBySubject]);

  const value = {
    // State
    ...state,

    // Actions
    fetchNotes,
    fetchNoteStats,
    createNote,
    updateNote,
    updateNoteCover,
    toggleNotePin,
    deleteNote,
    openNotebookModal,
    closeNotebookModal,
    setSelectedNote,
    clearSelectedNote,
    setActiveSubject,

    // Computed values
    getFilteredNotes,
    getAvailableSubjects,
  };

  return (
    <NotebookContext.Provider value={value}>
      {children}
    </NotebookContext.Provider>
  );
}

/**
 * Hook to use notebook context
 */
export function useNotebookContext() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebookContext must be used within a NotebookProvider');
  }
  return context;
}

export default NotebookContext;
