import { CONTEXT_MENU_ACTIONS, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from '../constants/contextMenuConfig';

/**
 * Validate if action can be performed on selection
 */
export const canPerformAction = (actionId, selection, userTier = 'free') => {
    const action = CONTEXT_MENU_ACTIONS[actionId.toUpperCase()];
    if (!action) return false;

    const textLength = selection.text.length;

    if (textLength < MIN_TEXT_LENGTH[actionId]) return false;
    if (textLength > MAX_TEXT_LENGTH[actionId]) return false;

    if (action.isPremium && userTier === 'free') return false;

    return true;
};

/**
 * Get action unavailability reason for UI feedback
 */
export const getActionUnavailableReason = (actionId, selection, userTier = 'free') => {
    const action = CONTEXT_MENU_ACTIONS[actionId.toUpperCase()];
    if (!action) return 'Unknown action';

    const textLength = selection.text.length;

    if (textLength < MIN_TEXT_LENGTH[actionId]) {
        return `Select more text! (at least ${MIN_TEXT_LENGTH[actionId]} characters)`;
    }

    if (textLength > MAX_TEXT_LENGTH[actionId]) {
        return `Text is too long! (max ${MAX_TEXT_LENGTH[actionId]} characters)`;
    }

    if (action.isPremium && userTier === 'free') {
        return 'Upgrade to Family Plus for this feature!';
    }

    return null;
};

/**
 * Create chat prompt from selection
 */
export const createChatPrompt = (selection, promptType = 'explain') => {
    const { text } = selection;

    const prompts = {
        explain: `Can you explain this to me in a simple way? Here's what I'm trying to understand:\n\n"${text}"`,
        simplify: `Can you make this easier to understand? I'm having trouble with:\n\n"${text}"`,
        examples: `Can you give me some fun examples about this?\n\n"${text}"`,
        quiz: `Can you ask me a question about this to see if I understand?\n\n"${text}"`,
        story: `Can you tell me a story that helps explain this?\n\n"${text}"`,
    };

    return prompts[promptType] || prompts.explain;
};

/**
 * Create flashcard generation request
 */
export const createFlashcardRequest = (selection, numCards = 3) => {
    return {
        sourceText: selection.text,
        pageNumber: selection.pageNumber,
        numCards,
        cardTypes: ['definition', 'question', 'fill-blank'],
        difficulty: 'age-appropriate',
    };
};

/**
 * Create quiz generation request
 */
export const createQuizRequest = (selection, numQuestions = 5) => {
    return {
        sourceText: selection.text,
        pageNumber: selection.pageNumber,
        numQuestions,
        questionTypes: ['multiple-choice', 'true-false', 'fill-blank'],
        difficulty: 'adaptive',
    };
};

/**
 * Create video generation request
 */
export const createVideoRequest = (selection) => {
    return {
        sourceText: selection.text,
        pageNumber: selection.pageNumber,
        style: 'educational',
        duration: 'short',
        voiceStyle: 'friendly',
        visualStyle: 'animated',
    };
};

/**
 * Sanitize selection for AI processing (child safety)
 */
export const sanitizeSelectionForAI = (text) => {
    const sanitized = text
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
        .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[ID]');

    return sanitized;
};

/**
 * Check if selection is appropriate for processing
 */
export const isSelectionSafe = (text) => {
    // Basic safety - can be expanded
    return text && text.trim().length > 0;
};

/**
 * Truncate text for preview display
 */
export const truncateForPreview = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};
