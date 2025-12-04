import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextSelection } from '../../hooks/useTextSelection';
import { useSelectionContext } from '../../context/SelectionContext';
import { useAgeAppropriate } from '../../hooks/useAgeAppropriate';
import ContextMenu from './ContextMenu';
import SelectionResultModal from './SelectionResultModal';
import './selection-styles.css';

/**
 * HighlightableContent - Wrapper that enables text selection with context menu
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be highlightable
 * @param {string} props.lessonId - ID of the current lesson
 * @param {string} props.contentType - Type of content ('pdf' | 'html' | 'markdown')
 * @param {Function} props.onSelectionAction - Callback when an action is performed
 */
const HighlightableContent = ({
    children,
    lessonId,
    contentType = 'html',
    onSelectionAction,
    className = '',
}) => {
    const containerRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showDismissPrompt, setShowDismissPrompt] = useState(false);
    const dismissTimerRef = useRef(null);
    const promptTimerRef = useRef(null);

    const { ageGroup, age } = useAgeAppropriate();
    const {
        setSelection,
        clearSelection,
        currentSelection,
        isProcessing,
        result,
        handleAction,
        clearResult,
    } = useSelectionContext();

    // Determine age tier for UI customization
    const ageTier = age <= 7 ? '4-7' : '8-12';

    // Handle text selection
    const handleSelect = useCallback((selectionData) => {
        if (!selectionData || !selectionData.text) {
            setMenuVisible(false);
            return;
        }

        // Get context around the selection
        const windowSelection = window.getSelection();
        let beforeText = '';
        let afterText = '';

        try {
            const range = windowSelection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const fullText = container.textContent || '';
            const startIndex = fullText.indexOf(selectionData.text);

            if (startIndex !== -1) {
                beforeText = fullText.substring(Math.max(0, startIndex - 50), startIndex);
                afterText = fullText.substring(startIndex + selectionData.text.length, startIndex + selectionData.text.length + 50);
            }
        } catch (e) {
            console.warn('Could not extract context:', e);
        }

        // Set selection in context
        setSelection({
            ...selectionData,
            context: { beforeText, afterText },
            lessonId,
            timestamp: new Date(),
        });

        // Calculate menu position (below the selection)
        if (selectionData.rects && selectionData.rects.length > 0) {
            const firstRect = selectionData.rects[0];
            const lastRect = selectionData.rects[selectionData.rects.length - 1];

            // Center horizontally between first and last rect
            const centerX = (firstRect.left + lastRect.right) / 2;
            // Position below the last rect (with some padding)
            const bottomY = lastRect.bottom + 10;

            setMenuPosition({
                x: Math.min(Math.max(centerX, 150), window.innerWidth - 150),
                y: bottomY,
            });
        }

        setMenuVisible(true);
        setShowDismissPrompt(false);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }

        // Clear any existing timers
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
        }

        // Set prompt timer (show "Still there?" after 12 seconds)
        promptTimerRef.current = setTimeout(() => {
            setShowDismissPrompt(true);
        }, 12000);

        // Set dismiss timer (close menu after 15 seconds if no action)
        dismissTimerRef.current = setTimeout(() => {
            handleDismiss();
        }, 15000);
    }, [setSelection, lessonId]);

    // Handle deselection
    const handleDeselect = useCallback(() => {
        // Don't dismiss if processing or showing result
        if (!isProcessing && !result) {
            // Small delay to allow clicking menu items
            setTimeout(() => {
                if (!isProcessing && !result) {
                    // setMenuVisible(false);
                }
            }, 200);
        }
    }, [isProcessing, result]);

    // Use text selection hook
    const { selection, isSelecting } = useTextSelection({
        minLength: ageTier === '4-7' ? 1 : 3, // Single word for younger kids
        onSelect: handleSelect,
        onDeselect: handleDeselect,
        containerRef,
    });

    // Handle menu dismiss
    const handleDismiss = useCallback(() => {
        setMenuVisible(false);
        setShowDismissPrompt(false);
        clearSelection();

        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
        }
    }, [clearSelection]);

    // Handle when user starts typing in the input field (pause auto-dismiss)
    const handleInputModeStart = useCallback(() => {
        // Clear auto-dismiss timers when user is actively typing a question
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
            promptTimerRef.current = null;
        }
        setShowDismissPrompt(false);
    }, []);

    // Handle action from context menu
    const handleMenuAction = useCallback(async (action) => {
        // Clear timers when action is taken
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
        }

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // For young kids, auto-trigger "Read to Me" on selection if action is read
        if (ageTier === '4-7' && action.type === 'read') {
            handleAction(action);
            setTimeout(handleDismiss, 500);
            return;
        }

        // Perform the action
        const result = await handleAction(action);

        if (result) {
            onSelectionAction?.(result);
        }

        // Only dismiss for non-modal actions (save, read)
        if (action.type === 'save' || action.type === 'read') {
            setTimeout(handleDismiss, 500);
        }
    }, [ageTier, handleAction, handleDismiss, onSelectionAction]);

    // Handle result modal close
    const handleResultClose = useCallback(() => {
        clearResult();
        handleDismiss();
    }, [clearResult, handleDismiss]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current);
            }
            if (promptTimerRef.current) {
                clearTimeout(promptTimerRef.current);
            }
        };
    }, []);

    // Reset timers when selection changes
    useEffect(() => {
        if (!currentSelection) {
            setMenuVisible(false);
            setShowDismissPrompt(false);
        }
    }, [currentSelection]);

    return (
        <div
            ref={containerRef}
            className={`highlightable-content ${className} ${isSelecting ? 'is-selecting' : ''}`}
        >
            {children}

            {/* Selection Particles Effect */}
            <AnimatePresence>
                {menuVisible && currentSelection && (
                    <SelectionParticles position={menuPosition} />
                )}
            </AnimatePresence>

            {/* Context Menu */}
            <AnimatePresence>
                {menuVisible && currentSelection && !result && (
                    <ContextMenu
                        position={menuPosition}
                        selectedText={currentSelection.text}
                        ageGroup={ageTier}
                        onAction={handleMenuAction}
                        onDismiss={handleDismiss}
                        isProcessing={isProcessing}
                        showDismissPrompt={showDismissPrompt}
                        onInputModeStart={handleInputModeStart}
                    />
                )}
            </AnimatePresence>

            {/* Result Modal */}
            <AnimatePresence>
                {result && (
                    <SelectionResultModal
                        result={result}
                        onClose={handleResultClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Selection Particles Effect Component
 */
const SelectionParticles = ({ position }) => {
    const particles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delay: i * 0.1,
        offsetX: (Math.random() - 0.5) * 60,
        offsetY: -20 - Math.random() * 40,
    }));

    return (
        <div
            className="selection-particles"
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                pointerEvents: 'none',
                zIndex: 999,
            }}
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="selection-particle"
                    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    animate={{
                        opacity: 0,
                        scale: 0.5,
                        x: particle.offsetX,
                        y: particle.offsetY,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                    style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        backgroundColor: '#FFD93D',
                        borderRadius: '50%',
                        boxShadow: '0 0 4px rgba(255, 217, 61, 0.6)',
                    }}
                />
            ))}
        </div>
    );
};

export default HighlightableContent;
