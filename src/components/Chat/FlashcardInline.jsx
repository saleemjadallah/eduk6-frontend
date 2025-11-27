import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

/**
 * FlashcardInline - Displays flashcards inline in the chat
 * Allows flipping, navigation, and marking as learned
 */
const FlashcardInline = ({ flashcards = [], onComplete }) => {
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
        <div className="w-full max-w-md mx-auto">
            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>Card {currentIndex + 1} of {flashcards.length}</span>
                    <span>{progress}% learned</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
                className="relative h-48 cursor-pointer perspective-1000"
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
                        className={`absolute inset-0 p-4 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center backface-hidden ${isFlipped ? 'invisible' : ''}`}
                    >
                        <div className="absolute top-2 right-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(currentCard.difficulty)}`}>
                                {currentCard.difficulty || 'medium'}
                            </span>
                        </div>
                        <p className="text-center font-bold text-lg">{currentCard.front}</p>
                        {currentCard.hint && (
                            <p className="text-xs text-gray-400 mt-2 italic">Hint: {currentCard.hint}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-4">Tap to flip</p>
                    </div>

                    {/* Back */}
                    <div
                        className={`absolute inset-0 p-4 bg-nanobanana-yellow border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center backface-hidden ${!isFlipped ? 'invisible' : ''}`}
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <p className="text-center font-bold text-lg">{currentCard.back}</p>
                        {learned.has(currentCard.id) && (
                            <div className="absolute top-2 right-2">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePrev}
                    className="p-2 bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleMarkNotLearned}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                    >
                        <X className="w-4 h-4" />
                        Still learning
                    </button>
                    <button
                        onClick={handleMarkLearned}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 border-2 border-black rounded-lg hover:bg-green-200 transition-colors text-sm font-bold"
                    >
                        <Check className="w-4 h-4" />
                        Got it!
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 bg-gray-100 border-2 border-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
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
