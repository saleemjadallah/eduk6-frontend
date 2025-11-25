import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HighlightProvider } from '../../../context/HighlightContext';
import { SelectionProvider, useSelectionContext } from '../../../context/SelectionContext';
import PDFViewer from '../../PDF/PDFViewer';
import { HighlightableContent, SelectionToolbar } from '../../Selection';

/**
 * PDFContentView - Container for PDF rendering with toolbar and interactions
 * Wraps the existing PDFViewer with selection/highlight context
 */
const PDFContentView = ({
  lesson,
  viewPreferences = {},
  onZoomChange,
  onPageChange,
  onSelectionAction,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get PDF URL from lesson
  const pdfUrl = lesson.contentUrl ||
                 lesson.source?.url ||
                 lesson.fileUrl;

  // Handle document load
  const handleDocumentLoad = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  // Handle document error
  const handleDocumentError = useCallback((error) => {
    console.error('PDF load error:', error);
    setIsLoading(false);
  }, []);

  // Handle text selection from PDF
  const handleTextSelected = useCallback((selectionData) => {
    console.log('PDF text selected:', selectionData);
  }, []);

  // Handle send to chat
  const handleSendToChat = useCallback((text) => {
    onSelectionAction?.({
      type: 'chat',
      text,
      lessonId: lesson.id,
    });
  }, [lesson.id, onSelectionAction]);

  // Handle create flashcards
  const handleCreateFlashcards = useCallback((text) => {
    onSelectionAction?.({
      type: 'flashcard',
      text,
      lessonId: lesson.id,
    });
  }, [lesson.id, onSelectionAction]);

  // If no PDF URL, show fallback content
  if (!pdfUrl) {
    return (
      <PDFFallbackView lesson={lesson} onSelectionAction={onSelectionAction} />
    );
  }

  return (
    <HighlightProvider lessonId={lesson.id}>
      <div className="flex flex-col h-full">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <PDFViewer
            pdfUrl={pdfUrl}
            lessonId={lesson.id}
            initialPage={viewPreferences.currentPage || 1}
            onTextSelected={handleTextSelected}
            onSendToChat={handleSendToChat}
            onCreateFlashcards={handleCreateFlashcards}
          />
        </div>
      </div>
    </HighlightProvider>
  );
};

/**
 * Fallback view when PDF URL is not available
 * Shows the lesson content as text instead
 */
const PDFFallbackView = ({ lesson, onSelectionAction }) => {
  return (
    <div className="flex-1 overflow-auto p-6 bg-white">
      <HighlightableContent
        lessonId={lesson.id}
        contentType="html"
        onSelectionAction={onSelectionAction}
      >
        <div className="max-w-3xl mx-auto">
          {/* Notice banner */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-xl">📄</span>
              <p className="font-medium text-sm">
                The original PDF isn't available, but here's the lesson content!
              </p>
            </div>
          </div>

          {/* Lesson content */}
          {lesson.rawText && (
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {lesson.rawText}
              </p>
            </div>
          )}

          {/* If no raw text, show structured content */}
          {!lesson.rawText && lesson.content?.summary && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl mb-3">Summary</h3>
                <p className="text-gray-700">{lesson.content.summary}</p>
              </div>

              {lesson.content?.chapters?.map((chapter, index) => (
                <div key={chapter.id || index} className="border-l-4 border-nanobanana-blue pl-4">
                  <h4 className="font-bold text-lg mb-2">{chapter.title}</h4>
                  <p className="text-gray-700">{chapter.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <SelectionToolbar />
      </HighlightableContent>
    </div>
  );
};

export default PDFContentView;
