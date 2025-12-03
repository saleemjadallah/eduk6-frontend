import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FlashcardInline from './FlashcardInline';
import SummaryInline from './SummaryInline';
import QuizInline from './QuizInline';

/**
 * ExpandedViewModal - Modal for expanding flashcards, infographics, summaries, and quizzes
 * Displays content in the center of the screen with a close button
 */
const ExpandedViewModal = ({ isOpen, onClose, type, data }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (type) {
            case 'flashcards':
                return (
                    <div className="w-full max-w-3xl min-w-[500px] px-4">
                        <FlashcardInline flashcards={data} expanded />
                    </div>
                );
            case 'infographic':
                return (
                    <div className="w-full max-w-4xl">
                        <img
                            src={`data:${data.mimeType || 'image/png'};base64,${data.imageData}`}
                            alt="Lesson infographic"
                            className="w-full max-h-[80vh] object-contain rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        />
                        {data.text && (
                            <p className="mt-4 text-center text-gray-600 font-medium">{data.text}</p>
                        )}
                    </div>
                );
            case 'summary':
                return (
                    <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
                        <SummaryInline summary={data} />
                    </div>
                );
            case 'quiz':
                return (
                    <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar p-2">
                        <QuizInline quiz={data} />
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full max-w-4xl">
                        <img
                            src={`data:${data.mimeType || 'image/png'};base64,${data.imageData}`}
                            alt="Jeffrey's drawing"
                            className="w-full max-h-[80vh] object-contain rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        />
                        {data.text && (
                            <p className="mt-4 text-center text-gray-700 font-medium">{data.text}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Content Container */}
                    <motion.div
                        className="relative z-10 bg-white rounded-3xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-3 -right-3 p-2 bg-red-500 text-white border-3 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-colors z-20"
                            aria-label="Close expanded view"
                        >
                            <X className="w-6 h-6" strokeWidth={3} />
                        </button>

                        {/* Modal Content */}
                        <div className="flex items-center justify-center">
                            {renderContent()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExpandedViewModal;
