/**
 * Context menu configuration for PDF text selection
 * Designed for K-6 children with friendly labels and emojis
 */

export const CONTEXT_MENU_ACTIONS = {
    CHAT: {
        id: 'chat',
        emoji: '💬',
        label: 'Ask Ollie',
        description: 'Chat about this text',
        color: 'bg-nanobanana-blue',
        highlightColor: 'blue',
        xpReward: 5,
    },
    FLASHCARD: {
        id: 'flashcard',
        emoji: '🃏',
        label: 'Make Flashcards',
        description: 'Turn into study cards',
        color: 'bg-nanobanana-yellow',
        highlightColor: 'yellow',
        xpReward: 15,
    },
    VIDEO: {
        id: 'video',
        emoji: '🎬',
        label: 'Explainer Video',
        description: 'Watch and learn!',
        color: 'bg-pink-400',
        highlightColor: 'pink',
        xpReward: 20,
        isPremium: true,
    },
    TRANSLATE: {
        id: 'translate',
        emoji: '🌍',
        label: 'Translate',
        description: 'Translate to another language',
        color: 'bg-emerald-500',
        highlightColor: 'green',
        xpReward: 10,
    },
    HIGHLIGHT: {
        id: 'highlight',
        emoji: '✨',
        label: 'Just Highlight',
        description: 'Save for later',
        color: 'bg-orange-400',
        highlightColor: 'orange',
        xpReward: 2,
    },
    COPY: {
        id: 'copy',
        emoji: '📋',
        label: 'Copy Text',
        description: 'Copy to clipboard',
        color: 'bg-gray-400',
        highlightColor: null,
        xpReward: 0,
    },
};

export const HIGHLIGHT_COLORS = {
    yellow: {
        name: 'Sunny Yellow',
        emoji: '☀️',
        bg: 'rgba(255, 235, 59, 0.4)',
        border: 'rgba(255, 235, 59, 0.8)',
    },
    green: {
        name: 'Grass Green',
        emoji: '🌱',
        bg: 'rgba(76, 175, 80, 0.4)',
        border: 'rgba(76, 175, 80, 0.8)',
    },
    blue: {
        name: 'Sky Blue',
        emoji: '🌊',
        bg: 'rgba(33, 150, 243, 0.4)',
        border: 'rgba(33, 150, 243, 0.8)',
    },
    pink: {
        name: 'Bubblegum Pink',
        emoji: '🌸',
        bg: 'rgba(233, 30, 99, 0.4)',
        border: 'rgba(233, 30, 99, 0.8)',
    },
    orange: {
        name: 'Tangerine Orange',
        emoji: '🍊',
        bg: 'rgba(255, 152, 0, 0.4)',
        border: 'rgba(255, 152, 0, 0.8)',
    },
};

// Minimum text length for different actions
export const MIN_TEXT_LENGTH = {
    chat: 5,
    flashcard: 20,
    video: 50,
    translate: 3,
    highlight: 3,
    copy: 1,
};

// Maximum text length for different actions
export const MAX_TEXT_LENGTH = {
    chat: 5000,
    flashcard: 2000,
    video: 3000,
    translate: 2000,
    highlight: 10000,
    copy: Infinity,
};

// UX Constants for Child-Friendly Design
export const CHILD_UX_CONFIG = {
    MIN_TOUCH_TARGET: 44,
    MAX_ANIMATION_DURATION: 500,
    MAX_PREVIEW_LENGTH: 100,
    CONTRAST_RATIO: 4.5,
    FEEDBACK_DELAY: 100,
    CELEBRATION_DURATION: 2000,
    MIN_FONT_SIZE: 14,
    PREFERRED_FONT_SIZE: 16,
    LABELS: {
        K_2: {
            chat: 'Talk to Ollie',
            flashcard: 'Make Cards',
            video: 'Watch Video',
            translate: 'Say It Different',
            highlight: 'Color It',
            copy: 'Save It',
        },
        3_6: {
            chat: 'Ask Ollie',
            flashcard: 'Make Flashcards',
            video: 'Explainer Video',
            translate: 'Translate',
            highlight: 'Highlight',
            copy: 'Copy Text',
        },
    },
};
