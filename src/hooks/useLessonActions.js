import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';

/**
 * Convenience hook for common lesson action patterns.
 * Simplifies component code by providing pre-composed actions.
 */
export function useLessonActions() {
  const {
    startProcessing,
    updateProgress,
    setProcessingStage,
    addLesson,
    setError,
    resetProcessing,
    currentLesson,
    updateLesson,
  } = useLessonContext();

  /**
   * Process an upload through all stages.
   * Used by UploadModal and related components.
   *
   * @param {Object} options
   * @param {File|string} options.source - File object or YouTube URL
   * @param {string} options.sourceType - 'pdf' | 'image' | 'youtube' | 'text'
   * @param {Function} options.extractText - Function to extract text from source
   * @param {Function} options.analyzeContent - Function to analyze with AI
   * @param {Function} options.onComplete - Callback when complete
   */
  const processUpload = useCallback(async ({
    source,
    sourceType,
    extractText,
    analyzeContent,
    onComplete,
  }) => {
    try {
      // Stage 1: Start
      startProcessing();

      // Stage 2: Upload/Extract
      setProcessingStage('extracting');
      const rawText = await extractText(source);
      updateProgress(40);

      // Stage 3: Analyze
      setProcessingStage('analyzing');
      const analysis = await analyzeContent(rawText);
      updateProgress(70);

      // Stage 4: Generate lesson
      setProcessingStage('generating');
      const lessonData = {
        source: {
          type: sourceType,
          originalName: source.name || 'YouTube Video',
          fileSize: source.size,
          mimeType: source.type,
        },
        rawText,
        ...analysis,
      };
      updateProgress(90);

      // Stage 5: Complete
      const newLesson = addLesson(lessonData);

      if (onComplete) {
        onComplete(newLesson);
      }

      return newLesson;
    } catch (error) {
      setError({
        message: error.message || 'Failed to process upload',
        code: error.code || 'PROCESSING_ERROR',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }, [startProcessing, setProcessingStage, updateProgress, addLesson, setError]);

  /**
   * Get context string for chat (Jeffrey).
   * Returns a formatted object with lesson info for AI context.
   */
  const getChatContext = useCallback(() => {
    if (!currentLesson) return null;

    return {
      title: currentLesson.title,
      subject: currentLesson.subject,
      gradeLevel: currentLesson.gradeLevel,
      summary: currentLesson.summary || currentLesson.content?.summary,
      keyConcepts: currentLesson.keyConceptsForChat || currentLesson.content?.keyPoints || [],
      vocabulary: currentLesson.vocabulary || currentLesson.content?.vocabulary || [],
      currentChapter: currentLesson.chapters?.[0]?.title || currentLesson.content?.chapters?.[0]?.title || null,
      rawText: currentLesson.rawText || currentLesson.content?.rawText || '',
    };
  }, [currentLesson]);

  /**
   * Get formatted context string for AI prompts.
   * Returns a string that can be included in AI system prompts.
   */
  const getChatContextString = useCallback(() => {
    const context = getChatContext();
    if (!context) return '';

    return `
Current Lesson Context:
- Title: ${context.title || 'Untitled'}
- Subject: ${context.subject || 'General'}
- Grade Level: ${context.gradeLevel || 'Not specified'}
- Summary: ${context.summary || 'No summary available'}
- Key Concepts: ${context.keyConcepts?.join(', ') || 'None'}
- Vocabulary Terms: ${context.vocabulary?.map(v => v.term || v).join(', ') || 'None'}

Lesson Content:
${context.rawText?.substring(0, 2000) || 'No content available'}
${context.rawText?.length > 2000 ? '\n[Content truncated...]' : ''}
    `.trim();
  }, [getChatContext]);

  /**
   * Add a message to lesson chat history.
   * For tracking conversation context.
   */
  const addChatMessage = useCallback((message) => {
    if (!currentLesson) return;

    const chatHistory = currentLesson.chatHistory || [];
    updateLesson(currentLesson.id, {
      chatHistory: [...chatHistory, {
        ...message,
        timestamp: new Date().toISOString(),
      }].slice(-50), // Keep last 50 messages
    });
  }, [currentLesson, updateLesson]);

  /**
   * Get suggested questions based on current lesson.
   * Returns lesson-specific questions or defaults.
   */
  const getSuggestedQuestions = useCallback(() => {
    if (!currentLesson) {
      return [
        "What should I learn today?",
        "Can you explain this concept?",
        "Give me a fun fact!",
        "Help me with my homework!",
      ];
    }

    // Return lesson-specific questions if available
    if (currentLesson.suggestedQuestions?.length > 0) {
      return currentLesson.suggestedQuestions;
    }

    // Generate default questions based on lesson content
    const subject = currentLesson.subject || 'this topic';
    const title = currentLesson.title || 'the lesson';

    return [
      `What's the main idea of ${title}?`,
      `Can you explain the key concepts in ${subject}?`,
      `Give me a quiz about ${title}!`,
      `What vocabulary words should I know?`,
    ];
  }, [currentLesson]);

  /**
   * Reset processing state without clearing lessons.
   * Used for retry scenarios.
   */
  const cancelProcessing = useCallback(() => {
    resetProcessing();
  }, [resetProcessing]);

  /**
   * Format time spent for display.
   * Converts seconds to human-readable format.
   */
  const formatTimeSpent = useCallback((seconds) => {
    if (!seconds || seconds < 60) return 'Less than a minute';

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes} minutes`;
  }, []);

  /**
   * Get current lesson time spent formatted.
   */
  const getCurrentLessonTimeSpent = useCallback(() => {
    if (!currentLesson?.progress?.timeSpent) return 'Just started';
    return formatTimeSpent(currentLesson.progress.timeSpent);
  }, [currentLesson, formatTimeSpent]);

  return {
    processUpload,
    getChatContext,
    getChatContextString,
    addChatMessage,
    getSuggestedQuestions,
    cancelProcessing,
    formatTimeSpent,
    getCurrentLessonTimeSpent,
  };
}

export default useLessonActions;
