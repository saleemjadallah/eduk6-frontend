import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    CreditCard,
    Video,
    Languages,
    Copy,
    Highlighter,
    X
} from 'lucide-react';
import ContextMenuItem from './ContextMenuItem';
import { useHighlightContext } from '../../context/HighlightContext';
import { useSelectionContext } from '../../context/SelectionContext';
import { canPerformAction, getActionUnavailableReason, createChatPrompt } from '../../utils/contextMenuHandlers';
import LanguageSelector from '../Selection/LanguageSelector';

const ContextMenu = ({ position, selection, onClose, onSendToChat, onCreateFlashcards }) => {
    const menuRef = useRef(null);
    const { addHighlight, recordAction } = useHighlightContext();
    const { setSelection, handleTranslate, isProcessing } = useSelectionContext();
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    // Adjust position to stay within viewport
    useEffect(() => {
        if (menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = position.x;
            let adjustedY = position.y;

            if (rect.right > viewportWidth) {
                adjustedX = viewportWidth - rect.width - 20;
            }
            if (rect.bottom > viewportHeight) {
                adjustedY = viewportHeight - rect.height - 20;
            }

            menu.style.left = `${Math.max(10, adjustedX)}px`;
            menu.style.top = `${Math.max(10, adjustedY)}px`;
        }
    }, [position]);

    // Menu items configuration
    const menuItems = [
        {
            id: 'chat',
            icon: <MessageCircle className="w-5 h-5" />,
            emoji: '💬',
            label: 'Ask Ollie',
            description: 'Chat about this text',
            color: 'bg-nanobanana-blue',
            handler: async () => {
                const highlight = addHighlight(selection, 'blue');
                const prompt = createChatPrompt(selection, 'explain');
                onSendToChat?.(prompt);
                recordAction(highlight.id, 'chat');
                onClose();
            },
        },
        {
            id: 'flashcard',
            icon: <CreditCard className="w-5 h-5" />,
            emoji: '🃏',
            label: 'Make Flashcards',
            description: 'Turn into study cards',
            color: 'bg-nanobanana-yellow',
            handler: async () => {
                const highlight = addHighlight(selection, 'yellow');
                onCreateFlashcards?.(selection.text);
                recordAction(highlight.id, 'flashcard');
                onClose();
            },
        },
        {
            id: 'video',
            icon: <Video className="w-5 h-5" />,
            emoji: '🎬',
            label: 'Explainer Video',
            description: 'Watch and learn!',
            color: 'bg-pink-400',
            handler: async () => {
                const highlight = addHighlight(selection, 'pink');
                // Video generation would be triggered here
                recordAction(highlight.id, 'video');
                onClose();
            },
        },
        {
            id: 'translate',
            icon: <Languages className="w-5 h-5" />,
            emoji: '🌍',
            label: 'Translate',
            description: 'Translate to another language',
            color: 'bg-emerald-500',
            handler: async () => {
                // Set the selection in context and show language selector
                setSelection({
                    text: selection.text,
                    context: selection,
                });
                setShowLanguageSelector(true);
            },
        },
        {
            id: 'highlight',
            icon: <Highlighter className="w-5 h-5" />,
            emoji: '✨',
            label: 'Just Highlight',
            description: 'Save for later',
            color: 'bg-orange-400',
            handler: () => {
                addHighlight(selection, 'orange');
                onClose();
            },
        },
        {
            id: 'copy',
            icon: <Copy className="w-5 h-5" />,
            emoji: '📋',
            label: 'Copy Text',
            description: 'Copy to clipboard',
            color: 'bg-gray-400',
            handler: async () => {
                await navigator.clipboard.writeText(selection.text);
                onClose();
            },
        },
    ];

    const handleLanguageSelect = async (language) => {
        const highlight = addHighlight(selection, 'green');
        await handleTranslate(language);
        recordAction(highlight.id, 'translate');
        setShowLanguageSelector(false);
        onClose();
    };

    return (
        <>
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-50 min-w-[240px] bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            style={{ left: position.x, top: position.y }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header with selected text preview */}
            <div className="p-3 bg-gray-100 border-b-4 border-black">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Selected Text</span>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    "{selection.text.length > 100 ? selection.text.substring(0, 100) + '...' : selection.text}"
                </p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
                {menuItems.map((item, index) => {
                    const canPerform = canPerformAction(item.id, selection);
                    const reason = getActionUnavailableReason(item.id, selection);

                    return (
                        <ContextMenuItem
                            key={item.id}
                            {...item}
                            delay={index * 0.05}
                            disabled={!canPerform}
                            disabledReason={reason}
                        />
                    );
                })}
            </div>

            {/* Footer hint for kids */}
            <div className="px-3 pb-3 pt-1">
                <p className="text-xs text-gray-400 text-center italic">
                    Pick what you want to do!
                </p>
            </div>
        </motion.div>

        {/* Language Selector Modal */}
        <LanguageSelector
            isOpen={showLanguageSelector}
            onClose={() => {
                setShowLanguageSelector(false);
                onClose();
            }}
            onSelectLanguage={handleLanguageSelect}
            selectedText={selection?.text}
            isProcessing={isProcessing}
        />
        </>
    );
};

export default ContextMenu;
