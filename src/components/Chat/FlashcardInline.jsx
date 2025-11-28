import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

/**
 * FlashcardInline - Displays flashcards inline in the chat
 * Allows flipping, navigation, and marking as learned
 * @param {boolean} expanded - When true, renders larger card for modal view
 */
const FlashcardInline = ({ flashcards = [], onComplete, expanded = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [learned, setLearned] = useState(new Set());

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                No flashcards available
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((learned.size / flashcards.length) * 100).toFixed(0);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleMarkLearned = () => {
        const newLearned = new Set(learned);
        newLearned.add(currentCard.id);
        setLearned(newLearned);

        if (newLearned.size === flashcards.length && onComplete) {
            onComplete();
        } else {
            handleNext();
        }
    };

    const handleMarkNotLearned = () => {
        handleNext();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className={`w-full mx-auto ${expanded ? 'max-w-2xl' : 'max-w-md'}`}>
            {/* Progress bar */}
            <div className={`${expanded ? 'mb-6' : 'mb-3'}`}>
                <div className={`flex justify-between font-bold text-gray-600 mb-1 ${expanded ? 'text-sm' : 'text-xs'}`}>
                    <span>Card {currentIndex + 1} of {flashcards.length}</span>
                    <span>{progress}% learned</span>
                </div>
                <div className={`bg-gray-200 rounded-full overflow-hidden ${expanded ? 'h-3' : 'h-2'}`}>
                    <motion.div
                        className="h-full bg-nanobanana-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div
                className={`relative cursor-pointer perspective-1000 ${expanded ? 'h-72' : 'h-48'}`}
                onClick={handleFlip}
            >
                <motion.div
                    className="w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div
                        className={`absolute inset-0 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center backface-hidden ${isFlipped ? 'invisible' : ''} ${expanded ? 'p-8' : 'p-4'}`}
                    >
                        <div className={`absolute ${expanded ? 'top-4 right-4' : 'top-2 right-2'}`}>
                            <span className={`font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(currentCard.difficulty)} ${expanded ? 'text-xs' : 'text-[10px]'}`}>
                                {currentCard.difficulty || 'medium'}
                            </span>
                        </div>
                        <p className={`text-center font-bold ${expanded ? 'text-2xl px-4' : 'text-lg'}`}>{currentCard.front}</p>
                        {currentCard.hint && (
                            <p className={`text-gray-400 mt-3 italic ${expanded ? 'text-sm' : 'text-xs'}`}>Hint: {currentCard.hint}</p>
                        )}
                        <p className={`text-gray-400 mt-4 ${expanded ? 'text-xs' : 'text-[10px]'}`}>Tap to flip</p>
                    </div>

                    {/* Back */}
                    <div
                        className={`absolute inset-0 bg-nanobanana-yellow border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center backface-hidden ${!isFlipped ? 'invisible' : ''} ${expanded ? 'p-8' : 'p-4'}`}
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <p className={`text-center font-bold ${expanded ? 'text-2xl px-4' : 'text-lg'}`}>{currentCard.back}</p>
                        {learned.has(currentCard.id) && (
                            <div className={`absolute ${expanded ? 'top-4 right-4' : 'top-2 right-2'}`}>
                                <Check className={`text-green-600 ${expanded ? 'w-6 h-6' : 'w-5 h-5'}`} />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className={`flex justify-between items-center ${expanded ? 'mt-6' : 'mt-4'}`}>
                <button
                    onClick={handlePrev}
                    className={`bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition-colors ${expanded ? 'p-3' : 'p-2'}`}
                >
                    <ChevronLeft className={expanded ? 'w-6 h-6' : 'w-5 h-5'} />
                </button>

                <div className={`flex ${expanded ? 'gap-4' : 'gap-2'}`}>
                    <button
                        onClick={handleMarkNotLearned}
                        className={`flex items-center gap-1 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition-colors font-bold ${expanded ? 'px-5 py-3 text-base' : 'px-3 py-2 text-sm'}`}
                    >
                        <X className={expanded ? 'w-5 h-5' : 'w-4 h-4'} />
                        Still learning
                    </button>
                    <button
                        onClick={handleMarkLearned}
                        className={`flex items-center gap-1 bg-green-100 border-2 border-black rounded-lg hover:bg-green-200 transition-colors font-bold ${expanded ? 'px-5 py-3 text-base' : 'px-3 py-2 text-sm'}`}
                    >
                        <Check className={expanded ? 'w-5 h-5' : 'w-4 h-4'} />
                        Got it!
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    className={`bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition-colors ${expanded ? 'p-3' : 'p-2'}`}
                >
                    <ChevronRight className={expanded ? 'w-6 h-6' : 'w-5 h-5'} />
                </button>
            </div>

            {/* Completion message */}
            <AnimatePresence>
                {learned.size === flashcards.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-3 bg-green-100 border-2 border-green-400 rounded-xl text-center"
                    >
                        <p className="font-bold text-green-700">Amazing! You've learned all the cards!</p>
                        <button
                            onClick={() => {
                                setLearned(new Set());
                                setCurrentIndex(0);
                                setIsFlipped(false);
                            }}
                            className="mt-2 flex items-center gap-1 mx-auto px-3 py-1 bg-white border-2 border-black rounded-lg text-sm font-bold hover:bg-gray-100"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Practice again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlashcardInline;
