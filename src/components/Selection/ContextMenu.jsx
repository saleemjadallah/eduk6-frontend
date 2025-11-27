import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MenuButton from './MenuButton';
import './selection-styles.css';

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
        { type: 'translate', icon: '\ud83c\udf0d', label: 'Translate', color: '#10B981' },
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
            className="context-menu context-menu-compact"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translateX(-50%)',
                zIndex: 1000,
            }}
        >
            {/* Compact header with Jeffrey and selected text */}
            <div className="compact-header">
                <motion.div
                    className="jeffrey-mini"
                    animate={{ rotate: isProcessing ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }}
                >
                    {isProcessing ? '🧠' : '🤓'}
                </motion.div>
                <span className="selected-text-mini" title={selectedText}>
                    "{displayText}"
                </span>
                <button
                    className="dismiss-button-mini"
                    onClick={onDismiss}
                    aria-label="Close menu"
                >
                    ✕
                </button>
            </div>

            {/* Horizontal Menu Actions */}
            <div className="menu-actions-horizontal">
                {actions.map((action) => (
                    <button
                        key={action.type}
                        className="menu-button-compact"
                        style={{ backgroundColor: action.color }}
                        onClick={() => handleActionClick(action)}
                        disabled={isProcessing}
                        title={action.label}
                    >
                        <span className="menu-icon-compact">{action.icon}</span>
                        <span className="menu-label-compact">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Question Input (Ages 8-12 only) */}
            {showQuestionInput && ageGroup === '8-12' && (
                <motion.div
                    className="question-input-compact"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                >
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask Jeffrey..."
                            value={customQuestion}
                            onChange={(e) => setCustomQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            maxLength={200}
                            disabled={isProcessing}
                            className="flex-1"
                        />
                        <button
                            className="ask-button-compact"
                            onClick={handleSubmitQuestion}
                            disabled={!customQuestion.trim() || isProcessing}
                        >
                            Ask
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ContextMenu;
