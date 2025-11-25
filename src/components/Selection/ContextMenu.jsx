import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';

// Jeffrey avatar images (placeholders - replace with actual paths)
const JEFFREY_AVATARS = {
    curious: '/assets/jeffrey-curious.png',
    thinking: '/assets/jeffrey-thinking.png',
    happy: '/assets/jeffrey-happy.png',
};

/**
 * Get age-appropriate actions for the context menu
 */
const getAgeAppropriateActions = (ageGroup) => {
    if (ageGroup === '4-7') {
        return [
            {
                type: 'read',
                icon: '\ud83d\udd0a',
                label: 'Read to Me',
                color: '#FF6B6B',
                autoTrigger: true,
            },
            {
                type: 'ask',
                icon: '\ud83e\udd14',
                label: 'What is this?',
                color: '#4ECDC4',
                presetQuestion: 'Can you explain this in simple words?',
            },
            {
                type: 'save',
                icon: '\u2b50',
                label: 'Save',
                color: '#FFD93D',
            },
        ];
    }

    // Ages 8-12 - full feature set
    return [
        { type: 'ask', icon: '\ud83e\udd14', label: 'Ask Jeffrey', color: '#4ECDC4' },
        { type: 'flashcard', icon: '\ud83c\udff4', label: 'Make Flashcard', color: '#A259FF' },
        { type: 'quiz', icon: '\ud83c\udfae', label: 'Practice Quiz', color: '#FF6B6B' },
        { type: 'save', icon: '\u2b50', label: 'Save This', color: '#FFD93D' },
        { type: 'read', icon: '\ud83d\udd0a', label: 'Read to Me', color: '#95E1D3' },
    ];
};

/**
 * ContextMenu - The floating menu that appears on text selection
 */
const ContextMenu = ({
    position,
    selectedText,
    ageGroup,
    onAction,
    onDismiss,
    isProcessing,
    showDismissPrompt,
}) => {
    const [showQuestionInput, setShowQuestionInput] = useState(false);
    const [customQuestion, setCustomQuestion] = useState('');
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    const actions = getAgeAppropriateActions(ageGroup);

    // Focus input when it appears
    useEffect(() => {
        if (showQuestionInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showQuestionInput]);

    // Adjust menu position to stay within viewport
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            // Adjust if menu goes off screen
            if (rect.right > viewport.width - 20) {
                menuRef.current.style.left = `${viewport.width - rect.width - 20}px`;
            }
            if (rect.left < 20) {
                menuRef.current.style.left = '20px';
            }
            if (rect.top < 20) {
                menuRef.current.style.top = `${position.y + 150}px`; // Position below selection instead
            }
        }
    }, [position]);

    const handleActionClick = (action) => {
        if (isProcessing) return;

        // For "Ask Jeffrey" with custom question option (ages 8-12)
        if (action.type === 'ask' && ageGroup === '8-12' && !action.presetQuestion) {
            setShowQuestionInput(true);
            return;
        }

        // For preset questions or other actions
        onAction({
            type: action.type,
            userQuestion: action.presetQuestion || null,
        });
    };

    const handleSubmitQuestion = () => {
        if (customQuestion.trim()) {
            onAction({
                type: 'ask',
                userQuestion: customQuestion.trim(),
            });
            setCustomQuestion('');
            setShowQuestionInput(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmitQuestion();
        } else if (e.key === 'Escape') {
            setShowQuestionInput(false);
            setCustomQuestion('');
        }
    };

    // Truncate selected text for display
    const displayText = selectedText.length > 30
        ? selectedText.substring(0, 30) + '...'
        : selectedText;

    return (
        <motion.div
            ref={menuRef}
            className="context-menu"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y - 140,
                transform: 'translateX(-50%)',
                zIndex: 1000,
            }}
        >
            {/* Jeffrey Avatar and Speech Bubble */}
            <div className="jeffrey-avatar">
                <div className="jeffrey-image">
                    <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-3 border-[#4ECDC4] flex items-center justify-center text-2xl"
                        animate={{ rotate: isProcessing ? 360 : 0 }}
                        transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }}
                    >
                        {isProcessing ? '\ud83e\udde0' : '\ud83e\udd13'}
                    </motion.div>
                </div>
                <motion.div
                    className="speech-bubble"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    {isProcessing
                        ? 'Jeffrey is thinking...'
                        : showDismissPrompt
                            ? 'Still there?'
                            : 'What do you want to do?'}
                </motion.div>
            </div>

            {/* Selected Text Preview */}
            <div className="selected-text-preview">
                <span className="text-xs font-semibold text-gray-500">Selected:</span>
                <span className="text-sm font-medium text-gray-700 ml-1">"{displayText}"</span>
            </div>

            {/* Menu Actions */}
            <div className="menu-actions">
                {actions.map((action) => (
                    <MenuButton
                        key={action.type}
                        icon={action.icon}
                        label={action.label}
                        color={action.color}
                        onClick={() => handleActionClick(action)}
                        disabled={isProcessing}
                        loading={isProcessing}
                    />
                ))}
            </div>

            {/* Question Input (Ages 8-12 only) */}
            {showQuestionInput && ageGroup === '8-12' && (
                <motion.div
                    className="question-input"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask Jeffrey anything..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={200}
                        disabled={isProcessing}
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            className="flex-1 py-2 bg-gray-200 rounded-lg font-bold text-sm"
                            onClick={() => {
                                setShowQuestionInput(false);
                                setCustomQuestion('');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 py-2 bg-[#4ECDC4] text-white rounded-lg font-bold text-sm"
                            onClick={handleSubmitQuestion}
                            disabled={!customQuestion.trim() || isProcessing}
                        >
                            Ask
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Dismiss button */}
            <button
                className="dismiss-button"
                onClick={onDismiss}
                aria-label="Close menu"
            >
                \u2715
            </button>
        </motion.div>
    );
};

export default ContextMenu;
