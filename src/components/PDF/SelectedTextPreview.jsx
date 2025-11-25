import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Highlighter } from 'lucide-react';
import { useHighlightContext } from '../../context/HighlightContext';

const SelectedTextPreview = ({ onSendToChat }) => {
    const { currentSelection, clearSelection, addHighlight } = useHighlightContext();

    if (!currentSelection) return null;

    const handleSendToJeffrey = () => {
        addHighlight(currentSelection, 'blue');
        onSendToChat(currentSelection.text);
        clearSelection();
    };

    const handleHighlightOnly = () => {
        addHighlight(currentSelection, 'yellow');
        clearSelection();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                className="mx-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <span className="font-bold text-sm">You selected:</span>
                    </div>
                    <button
                        onClick={clearSelection}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Selected Text */}
                <div className="p-3 bg-white rounded-xl border-2 border-gray-200 mb-3 max-h-24 overflow-y-auto">
                    <p className="text-sm text-gray-800 italic">
                        "{currentSelection.text.length > 200
                            ? currentSelection.text.substring(0, 200) + '...'
                            : currentSelection.text}"
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendToJeffrey}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-nanobanana-blue text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                    >
                        <Send className="w-4 h-4" />
                        Send to Jeffrey
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleHighlightOnly}
                        className="p-3 bg-nanobanana-yellow font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                        title="Just highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Hint for kids */}
                <p className="text-xs text-center text-gray-500 mt-2 italic">
                    Right-click for more options!
                </p>
            </motion.div>
        </AnimatePresence>
    );
};

export default SelectedTextPreview;
