import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FlashcardInline from './FlashcardInline';
import SummaryInline from './SummaryInline';
import QuizInline from './QuizInline';

/**
 * ExpandedViewModal - Modal for expanding flashcards, infographics, summaries, and quizzes
 * Displays content in the center of the screen with a close button
 * Optimized for tablet/iPad views
 */
const ExpandedViewModal = ({ isOpen, onClose, type, data }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (type) {
            case 'flashcards':
                return (
                    <div className="w-full max-w-3xl px-2 sm:px-4">
                        <FlashcardInline flashcards={data} expanded />
                    </div>
                );
            case 'infographic':
                return (
                    <div className="w-full max-w-4xl px-2">
                        <img
                            src={`data:${data.mimeType || 'image/png'};base64,${data.imageData}`}
                            alt="Lesson infographic"
                            className="w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        />
                        {data.text && (
                            <p className="mt-4 text-center text-gray-600 font-medium text-sm md:text-base">{data.text}</p>
                        )}
                    </div>
                );
            case 'summary':
                return (
                    <div className="w-full max-w-2xl max-h-[70vh] md:max-h-[75vh] overflow-y-auto no-scrollbar px-1">
                        <SummaryInline summary={data} />
                    </div>
                );
            case 'quiz':
                return (
                    <div className="w-full max-w-2xl max-h-[70vh] md:max-h-[80vh] overflow-y-auto no-scrollbar p-2">
                        <QuizInline quiz={data} />
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full max-w-4xl px-2">
                        <img
                            src={`data:${data.mimeType || 'image/png'};base64,${data.imageData}`}
                            alt="Ollie's drawing"
                            className="w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        />
                        {data.text && (
                            <p className="mt-4 text-center text-gray-700 font-medium text-sm md:text-base">{data.text}</p>
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
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Backdrop - covers everything including toolbars */}
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Content Container - with extra padding to ensure close button is visible */}
                    <motion.div
                        className="relative z-10 bg-white rounded-3xl p-4 md:p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-visible"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Close Button - positioned inside with small negative offset, touch-friendly size */}
                        <button
                            onClick={onClose}
                            className="absolute -top-2 -right-2 md:-top-3 md:-right-3 p-2.5 md:p-2 bg-red-500 text-white border-3 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all z-20 touch-manipulation"
                            aria-label="Close expanded view"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                        </button>

                        {/* Modal Content */}
                        <div className="flex items-center justify-center overflow-y-auto max-h-[calc(85vh-3rem)]">
                            {renderContent()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExpandedViewModal;
