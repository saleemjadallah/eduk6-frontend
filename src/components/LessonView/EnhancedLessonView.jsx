import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, Sparkles } from 'lucide-react';

import { useLessonContext } from '../../context/LessonContext';
import { SelectionProvider } from '../../context/SelectionContext';
import { useLessonActions } from '../../hooks/useLessonActions';
import { useFlashcards } from '../../hooks/useFlashcards';
import { detectContentType } from '../../utils/contentDetection';

import ContentRenderer from './ContentRenderer';
import EmptyState from './EmptyState';
import { LessonHeader, ProgressIndicator, VocabularyPanel } from './Metadata';
import ProcessingAnimation from '../Upload/ProcessingAnimation';
import { FlashcardCreator } from '../Flashcards';

/**
 * EnhancedLessonView - Full-featured lesson viewer with content rendering
 *
 * Features:
 * - Multi-format content support (PDF, Image, Text, YouTube)
 * - Text selection and highlighting
 * - Context menus with AI actions
 * - Progress tracking
 * - Vocabulary sidebar
 * - Flashcard integration
 */
const EnhancedLessonView = ({
  lesson: propLesson,
  onComplete,
  onUploadClick,
  showHeader = true,
  showProgress = true,
  compactMode = false,
}) => {
  // Get lesson from props or context
  const {
    currentLesson: contextLesson,
    isProcessing,
    processingStage,
    processingProgress,
    currentStageInfo,
    hasLessons,
    updateLessonProgress,
  } = useLessonContext();

  const lesson = propLesson || contextLesson;

  // State
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [isFlashcardCreatorOpen, setIsFlashcardCreatorOpen] = useState(false);
  const [viewPreferences, setViewPreferences] = useState({
    zoom: 1.0,
    currentPage: 1,
    scrollPosition: 0,
  });

  // Hooks
  const { formatTimeSpent, getChatContextString } = useLessonActions();
  const { canCreateDeckFromLesson, getDeckForLesson, createDeckFromLesson } = useFlashcards();

  // Derived values
  const contentType = useMemo(() =>
    lesson ? detectContentType(lesson) : 'unknown',
  [lesson]);

  const existingDeck = lesson ? getDeckForLesson(lesson.id) : null;
  const canCreateDeck = lesson ? canCreateDeckFromLesson(lesson) : false;
  const progressPercent = lesson?.progress?.percentComplete || 0;

  // Load saved view preferences
  useEffect(() => {
    if (lesson?.viewPreferences) {
      setViewPreferences(prev => ({
        ...prev,
        ...lesson.viewPreferences,
      }));
    }
  }, [lesson?.id]);

  // Save view preferences with debounce
  useEffect(() => {
    if (!lesson) return;

    const saveTimer = setTimeout(() => {
      updateLessonProgress(lesson.id, { viewPreferences });
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [viewPreferences, lesson?.id, updateLessonProgress]);

  // Handlers
  const handleZoomChange = useCallback((newZoom) => {
    setViewPreferences(prev => ({ ...prev, zoom: newZoom }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setViewPreferences(prev => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleSelectionAction = useCallback((action) => {
    console.log('Selection action:', action);
    // Actions are handled by SelectionContext
  }, []);

  const handleCreateFlashcards = useCallback(() => {
    if (canCreateDeck) {
      createDeckFromLesson(lesson);
    } else {
      setIsFlashcardCreatorOpen(true);
    }
  }, [canCreateDeck, createDeckFromLesson, lesson]);

  const toggleVocabulary = useCallback(() => {
    setShowVocabulary(prev => !prev);
  }, []);

  // === RENDER STATES ===

  // 1. Processing state
  if (isProcessing) {
    return (
      <div className={`
        ${compactMode ? 'flex-1' : 'flex-[1.5]'}
        bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col
      `}>
        {showHeader && (
          <div className="bg-nanobanana-green border-b-4 border-black p-6">
            <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {currentStageInfo.childLabel || 'Processing...'}
            </h1>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
          <ProcessingAnimation
            stage={processingStage}
            progress={processingProgress}
            useChildLabels={true}
          />
        </div>
      </div>
    );
  }

  // 2. Empty state
  if (!lesson) {
    return (
      <div className={`
        ${compactMode ? 'flex-1' : 'flex-[1.5]'}
        bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col
      `}>
        {showHeader && (
          <div className="bg-nanobanana-green border-b-4 border-black p-6">
            <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Hi there!
            </h1>
          </div>
        )}
        <EmptyState
          onUploadClick={onUploadClick}
          hasLessons={hasLessons}
        />
      </div>
    );
  }

  // 3. Main lesson view
  return (
    <SelectionProvider>
      <div className={`
        ${compactMode ? 'flex-1' : 'flex-[1.5]'}
        bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col
      `}>
        {/* Header */}
        {showHeader && (
          <LessonHeader
            lesson={lesson}
            onToggleVocabulary={toggleVocabulary}
            showVocabulary={showVocabulary}
            formatTimeSpent={formatTimeSpent}
          />
        )}

        {/* Progress indicator */}
        {showProgress && progressPercent > 0 && progressPercent < 100 && (
          <ProgressIndicator
            progress={progressPercent}
            timeSpent={lesson.progress?.timeSpent || 0}
            variant="compact"
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Content renderer */}
          <div className={`
            flex-1 overflow-hidden transition-all duration-300
            ${showVocabulary ? 'lg:pr-0' : ''}
          `}>
            <ContentRenderer
              lesson={lesson}
              viewPreferences={viewPreferences}
              onZoomChange={handleZoomChange}
              onPageChange={handlePageChange}
              onSelectionAction={handleSelectionAction}
            />
          </div>

          {/* Vocabulary sidebar */}
          <AnimatePresence>
            {showVocabulary && lesson.vocabulary?.length > 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block border-l-4 border-black overflow-hidden"
              >
                <VocabularyPanel
                  vocabulary={lesson.vocabulary || lesson.content?.vocabulary || []}
                  lessonId={lesson.id}
                  onClose={() => setShowVocabulary(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom action bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-t-4 border-gray-100">
          <div className="flex items-center justify-between gap-4">
            {/* Flashcard action */}
            <div className="flex items-center gap-2">
              {existingDeck ? (
                <Link
                  to="/flashcards"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Study ({existingDeck.cardCount || 0} cards)
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateFlashcards}
                  className="flex items-center gap-2 px-4 py-2 bg-nanobanana-yellow text-black font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                >
                  <Sparkles className="w-4 h-4" />
                  Make Flashcards
                </motion.button>
              )}
            </div>

            {/* Complete button */}
            {onComplete && progressPercent < 100 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="px-6 py-2 bg-nanobanana-green text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              >
                I'm Done! ✓
              </motion.button>
            )}

            {/* Completed indicator */}
            {progressPercent === 100 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl">
                ✓ Completed
              </div>
            )}
          </div>
        </div>

        {/* Flashcard creator modal */}
        <FlashcardCreator
          isOpen={isFlashcardCreatorOpen}
          onClose={() => setIsFlashcardCreatorOpen(false)}
          lessonContent={lesson.content || {
            summary: lesson.summary,
            keyPoints: lesson.keyConceptsForChat,
            vocabulary: lesson.vocabulary,
          }}
        />
      </div>
    </SelectionProvider>
  );
};

export default EnhancedLessonView;
