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
 * Following Gemini best practices for conversational educational prompts
 */
export const createChatPrompt = (selection, promptType = 'explain') => {
    const { text } = selection;

    // Prompts designed to be conversational and encourage learning
    // Each prompt gives Jeffrey clear context about what the child needs
    const prompts = {
        explain: `I found this in my lesson and I want to understand it better. Can you explain what this means using simple words and maybe a fun example I can relate to?\n\nHere's the part I'm curious about:\n"${text}"`,

        simplify: `This part of my lesson is a bit confusing for me. Can you break it down into smaller, easier pieces? Maybe explain it step by step so I can follow along?\n\nHere's what I'm struggling with:\n"${text}"`,

        examples: `I'm learning about this topic and I think some examples would help me understand better! Can you give me 2-3 fun, real-world examples that show how this works in everyday life?\n\nHere's what I want examples about:\n"${text}"`,

        quiz: `I've been studying this topic and I want to test myself! Can you ask me a fun question about this to see if I really understand it? Make it feel like a game, not a test!\n\nHere's what to quiz me on:\n"${text}"`,

        story: `I learn best through stories! Can you create a short, fun story that teaches me about this concept? Maybe with characters I can imagine or a situation I might experience?\n\nHere's what the story should teach:\n"${text}"`,

        translate: `I'm learning about languages! Can you show me how to say this in Spanish, French, and Arabic? For each language, please show the translation and tell me something interesting about how that language works.\n\nHere's what I want to learn to say:\n"${text}"`,
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
