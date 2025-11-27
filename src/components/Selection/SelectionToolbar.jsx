import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Languages, HelpCircle, Layers, StickyNote, Volume2 } from 'lucide-react';
import { useSelectionContext } from '../../context/SelectionContext';
import { useAgeAppropriate } from '../../hooks/useAgeAppropriate';
import LanguageSelector from './LanguageSelector';

/**
 * SelectionToolbar - Bottom toolbar for quick actions on selected text
 *
 * This toolbar appears at the bottom of the lesson content area
 * and provides quick access to common actions.
 */
const SelectionToolbar = ({ onChatOpen }) => {
    const { currentSelection, handleAction, isProcessing } = useSelectionContext();
    const { age } = useAgeAppropriate();
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    const ageTier = age <= 7 ? '4-7' : '8-12';

    // Define toolbar actions based on age
    const toolbarActions = ageTier === '4-7'
        ? [
            { type: 'read', icon: Volume2, label: 'Read aloud', color: '#FF6B6B' },
            { type: 'ask', icon: HelpCircle, label: 'Explain', color: '#4ECDC4', presetQuestion: 'Can you explain this?' },
            { type: 'save', icon: StickyNote, label: 'Add to notes', color: '#FFD93D' },
        ]
        : [
            { type: 'ask', icon: HelpCircle, label: 'Explain', color: '#4ECDC4', presetQuestion: 'Can you explain this?' },
            { type: 'chat', icon: MessageCircle, label: 'Chat', color: '#5C7CFA', isExternal: true },
            { type: 'translate', icon: Languages, label: 'Translate', color: '#10B981' },
            { type: 'flashcard', icon: Layers, label: 'Flashcards', color: '#A259FF' },
            { type: 'save', icon: StickyNote, label: 'Add to notes', color: '#FFD93D' },
            { type: 'read', icon: Volume2, label: 'Read aloud', color: '#95E1D3' },
        ];

    const handleToolbarAction = (action) => {
        if (action.isExternal) {
            // Open chat interface
            onChatOpen?.();
            return;
        }

        if (!currentSelection) {
            // Show a toast or hint that text needs to be selected
            console.log('Please select some text first');
            return;
        }

        // For translate action, show language selector first
        if (action.type === 'translate') {
            setShowLanguageSelector(true);
            return;
        }

        handleAction({
            type: action.type,
            userQuestion: action.presetQuestion,
        });
    };

    const handleLanguageSelect = (language) => {
        handleAction({
            type: 'translate',
            targetLanguage: language,
        });
        setShowLanguageSelector(false);
    };

    const hasSelection = !!currentSelection;

    return (
        <>
        <motion.div
            className="selection-toolbar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 20 }}
        >
            <div className="toolbar-container">
                {/* Selection indicator */}
                {hasSelection && (
                    <motion.div
                        className="selection-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        <span className="selection-text">
                            "{currentSelection.text.substring(0, 20)}{currentSelection.text.length > 20 ? '...' : ''}"
                        </span>
                    </motion.div>
                )}

                {/* Toolbar actions */}
                <div className="toolbar-actions">
                    {toolbarActions.map((action) => {
                        const Icon = action.icon;
                        const isDisabled = !hasSelection && !action.isExternal;

                        return (
                            <motion.button
                                key={action.type}
                                className={`toolbar-button ${isDisabled ? 'disabled' : ''}`}
                                style={{
                                    '--button-color': action.color,
                                }}
                                whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                onClick={() => handleToolbarAction(action)}
                                disabled={isDisabled || isProcessing}
                                title={isDisabled ? 'Select text first' : action.label}
                            >
                                <Icon className="toolbar-icon" size={20} />
                                <span className="toolbar-label">{action.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .selection-toolbar {
                    position: sticky;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, white 80%, transparent);
                    padding: 16px 0 12px;
                    z-index: 100;
                }

                .toolbar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .selection-indicator {
                    background: #FFF9E6;
                    border: 2px solid #FFD93D;
                    border-radius: 20px;
                    padding: 6px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #666;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .toolbar-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 8px 16px;
                    background: white;
                    border-radius: 24px;
                    border: 3px solid #000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .toolbar-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 64px;
                }

                .toolbar-button:hover:not(.disabled) {
                    background: var(--button-color);
                }

                .toolbar-button:hover:not(.disabled) .toolbar-icon,
                .toolbar-button:hover:not(.disabled) .toolbar-label {
                    color: white;
                }

                .toolbar-button.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .toolbar-icon {
                    color: #333;
                    transition: color 0.2s;
                }

                .toolbar-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #666;
                    transition: color 0.2s;
                }

                @media (max-width: 640px) {
                    .toolbar-actions {
                        gap: 4px;
                        padding: 6px 12px;
                    }

                    .toolbar-button {
                        padding: 8px 10px;
                        min-width: 56px;
                    }

                    .toolbar-label {
                        font-size: 10px;
                    }

                    .toolbar-icon {
                        width: 18px;
                        height: 18px;
                    }
                }
            `}</style>
        </motion.div>

        {/* Language Selector Modal */}
        <LanguageSelector
            isOpen={showLanguageSelector}
            onClose={() => setShowLanguageSelector(false)}
            onSelectLanguage={handleLanguageSelect}
            selectedText={currentSelection?.text}
            isProcessing={isProcessing}
        />
        </>
    );
};

export default SelectionToolbar;
