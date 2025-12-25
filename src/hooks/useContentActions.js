import { useCallback } from 'react';
import { useSelectionContext } from '../context/SelectionContext';
import { useGamificationContext } from '../context/GamificationContext';
import { useLessonContext } from '../context/LessonContext';
import { useChatContext } from '../context/ChatContext';
import { generateChatResponse, generateFlashcards, generateQuiz } from '../services/geminiService';

/**
 * useContentActions - Hook for handling selection-based actions
 *
 * Provides handlers for:
 * - Asking Ollie about selected text
 * - Creating flashcards from selection
 * - Generating quizzes from selection
 * - Copying text
 * - Creating highlights
 * - Text-to-speech
 */
export function useContentActions() {
  const { currentLesson } = useLessonContext();
  const { earnXP, updateStatistics, updateDailyChallengeProgress } = useGamificationContext();
  const chatContext = useChatContext?.();

  // XP rewards for actions
  const XP_REWARDS = {
    ask_ollie: 5,
    create_flashcard: 10,
    generate_quiz: 8,
    highlight: 2,
    copy_text: 0,
    read_aloud: 2,
    explain_more: 5,
    create_video: 20,
  };

  /**
   * Send selected text to chat with Ollie
   */
  const askOllie = useCallback(async (selectedText, question) => {
    try {
      const context = {
        lessonTitle: currentLesson?.title,
        lessonSubject: currentLesson?.subject,
        selectedText,
      };

      const prompt = question
        ? `The student selected this text: "${selectedText}" and asks: "${question}"`
        : `Explain this to a child: "${selectedText}"`;

      const response = await generateChatResponse(prompt, context);

      // Award XP
      earnXP?.(XP_REWARDS.ask_ollie, 'Asked Ollie a question');
      updateStatistics?.({ questionsAnswered: 1 });
      updateDailyChallengeProgress?.('questionAnswered');

      // Add to chat context if available
      if (chatContext?.addMessage) {
        chatContext.addMessage({
          role: 'user',
          content: `Tell me about: "${selectedText.substring(0, 100)}..."`,
        });
        chatContext.addMessage({
          role: 'assistant',
          content: response,
        });
      }

      return {
        success: true,
        response,
        xpEarned: XP_REWARDS.ask_ollie,
      };
    } catch (error) {
      console.error('Error asking Ollie:', error);
      return { success: false, error };
    }
  }, [currentLesson, earnXP, updateStatistics, updateDailyChallengeProgress, chatContext]);

  /**
   * Create flashcards from selected text
   */
  const createFlashcardsFromSelection = useCallback(async (selectedText) => {
    try {
      const response = await generateFlashcards(selectedText, 3);

      // Award XP
      earnXP?.(XP_REWARDS.create_flashcard, 'Created flashcards');
      updateStatistics?.({ flashcardsReviewed: response.flashcards?.length || 1 });
      updateDailyChallengeProgress?.('flashcardReviewed');

      return {
        success: true,
        flashcards: response.flashcards,
        xpEarned: XP_REWARDS.create_flashcard,
      };
    } catch (error) {
      console.error('Error creating flashcards:', error);
      return { success: false, error };
    }
  }, [earnXP, updateStatistics, updateDailyChallengeProgress]);

  /**
   * Generate quiz from selected text
   */
  const generateQuizFromSelection = useCallback(async (selectedText) => {
    try {
      const response = await generateQuiz(selectedText, 3);

      // Award XP
      earnXP?.(XP_REWARDS.generate_quiz, 'Generated a quiz');

      return {
        success: true,
        questions: response.questions,
        xpEarned: XP_REWARDS.generate_quiz,
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      return { success: false, error };
    }
  }, [earnXP]);

  /**
   * Copy text to clipboard
   */
  const copyText = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error('Error copying text:', error);
      return { success: false, error };
    }
  }, []);

  /**
   * Read text aloud using Speech Synthesis
   */
  const readAloud = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      return { success: false, error: 'Speech synthesis not supported' };
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      // Try to use a child-friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Victoria') ||
        v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);

      // Award XP
      earnXP?.(XP_REWARDS.read_aloud, 'Used read aloud');

      return { success: true, xpEarned: XP_REWARDS.read_aloud };
    } catch (error) {
      console.error('Error reading aloud:', error);
      return { success: false, error };
    }
  }, [earnXP]);

  /**
   * Get a simpler explanation of selected text
   */
  const explainMore = useCallback(async (selectedText) => {
    try {
      const context = {
        lessonTitle: currentLesson?.title,
        lessonSubject: currentLesson?.subject,
        gradeLevel: currentLesson?.gradeLevel,
      };

      const prompt = `Explain this in simpler terms for a ${currentLesson?.gradeLevel || 'young'} student: "${selectedText}"`;

      const response = await generateChatResponse(prompt, context);

      // Award XP
      earnXP?.(XP_REWARDS.explain_more, 'Asked for explanation');
      updateDailyChallengeProgress?.('questionAnswered');

      return {
        success: true,
        explanation: response,
        xpEarned: XP_REWARDS.explain_more,
      };
    } catch (error) {
      console.error('Error explaining:', error);
      return { success: false, error };
    }
  }, [currentLesson, earnXP, updateDailyChallengeProgress]);

  /**
   * Main action handler - routes to specific handler based on action type
   */
  const handleAction = useCallback(async (actionId, selection) => {
    const text = selection?.text || '';

    switch (actionId) {
      case 'ask_ollie':
        return askOllie(text);

      case 'create_flashcard':
        return createFlashcardsFromSelection(text);

      case 'generate_quiz':
        return generateQuizFromSelection(text);

      case 'explain_more':
        return explainMore(text);

      case 'copy_text':
        return copyText(text);

      case 'highlight':
        // Highlighting is handled by HighlightContext
        earnXP?.(XP_REWARDS.highlight, 'Created highlight');
        return { success: true, xpEarned: XP_REWARDS.highlight };

      case 'read':
      case 'read_aloud':
        return readAloud(text);

      case 'create_video':
        // Video creation is premium/future feature
        return {
          success: false,
          error: 'Video creation coming soon!',
          isPremium: true,
        };

      default:
        console.warn('Unknown action:', actionId);
        return { success: false, error: `Unknown action: ${actionId}` };
    }
  }, [
    askOllie,
    createFlashcardsFromSelection,
    generateQuizFromSelection,
    explainMore,
    copyText,
    readAloud,
    earnXP,
  ]);

  return {
    handleAction,
    askOllie,
    createFlashcardsFromSelection,
    generateQuizFromSelection,
    copyText,
    readAloud,
    explainMore,
    XP_REWARDS,
  };
}

export default useContentActions;
