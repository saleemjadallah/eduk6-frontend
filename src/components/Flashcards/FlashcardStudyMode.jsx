import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, RotateCcw, Trophy, Star } from 'lucide-react';
import FlashcardCard from './FlashcardCard';
import { CONFIDENCE_RATINGS } from '../../constants/flashcardConstants';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { useGameProgress } from '../../hooks/useGameProgress';

const FlashcardStudyMode = ({
    deckId,
    onClose,
    onComplete,
}) => {
    const {
        currentSession,
        cards,
        startSession,
        recordSessionAnswer,
        endSession,
    } = useFlashcardContext();

    const { recordFlashcardReviewed } = useGameProgress();

    const [sessionCards, setSessionCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRatings, setShowRatings] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStats, setSessionStats] = useState(null);

    // Initialize session
    useEffect(() => {
        const cardsToStudy = startSession(deckId);
        if (cardsToStudy && cardsToStudy.length > 0) {
            setSessionCards(cardsToStudy);
        } else {
            // No cards to study
            setSessionComplete(true);
            setSessionStats({ total: 0, correct: 0, accuracy: 0, xpEarned: 0 });
        }
    }, [deckId, startSession]);

    const currentCard = sessionCards[currentIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            // Show ratings after flipping to answer
            setTimeout(() => setShowRatings(true), 300);
        }
    };

    const handleRating = useCallback((rating) => {
        if (!currentCard) return;

        const wasCorrect = rating.id === 'got_it' || rating.id === 'almost';

        // Record the answer
        const stats = recordSessionAnswer(currentCard.id, wasCorrect, rating.id);

        // If session just ended, stats will be returned
        if (stats) {
            setSessionComplete(true);
            setSessionStats(stats);
            // Record XP for flashcards reviewed
            recordFlashcardReviewed(sessionCards.length);
            onComplete?.(stats);
            return;
        }

        // Move to next card
        setIsFlipped(false);
        setShowRatings(false);
        setCurrentIndex(prev => prev + 1);
    }, [currentCard, recordSessionAnswer, sessionCards.length, recordFlashcardReviewed, onComplete]);

    const handleSkip = () => {
        if (currentIndex < sessionCards.length - 1) {
            setIsFlipped(false);
            setShowRatings(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleClose = () => {
        if (currentSession) {
            const stats = endSession();
            if (stats && stats.total > 0) {
                recordFlashcardReviewed(stats.total);
            }
        }
        onClose?.();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!showRatings) {
                    handleFlip();
                }
            }
            if (e.key === 'Escape') {
                handleClose();
            }
            if (showRatings) {
                if (e.key === '1') handleRating(CONFIDENCE_RATINGS[0]);
                if (e.key === '2') handleRating(CONFIDENCE_RATINGS[1]);
                if (e.key === '3') handleRating(CONFIDENCE_RATINGS[2]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showRatings, handleRating]);

    if (sessionComplete) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gradient-to-br from-nanobanana-blue to-purple-600 z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full text-center"
                >
                    {sessionStats && sessionStats.total > 0 ? (
                        <>
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: 2, duration: 0.5 }}
                                className="w-24 h-24 mx-auto mb-4 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                            >
                                <Trophy className="w-12 h-12 text-black" />
                            </motion.div>

                            <h2 className="text-3xl font-black font-comic mb-2">
                                {sessionStats.isPerfect ? 'Amazing!' : 'Great Job!'}
                            </h2>

                            <p className="text-gray-600 mb-6">
                                You reviewed {sessionStats.total} cards!
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-3 bg-green-50 rounded-xl border-2 border-green-200">
                                    <div className="text-2xl font-black text-green-600">
                                        {sessionStats.correct}
                                    </div>
                                    <div className="text-xs text-green-700">Correct</div>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-xl border-2 border-orange-200">
                                    <div className="text-2xl font-black text-orange-600">
                                        {sessionStats.incorrect}
                                    </div>
                                    <div className="text-xs text-orange-700">Learning</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <div className="text-2xl font-black text-blue-600">
                                        {sessionStats.accuracy}%
                                    </div>
                                    <div className="text-xs text-blue-700">Accuracy</div>
                                </div>
                            </div>

                            {/* XP earned */}
                            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                                <Star className="w-5 h-5 fill-yellow-500 text-yellow-600" />
                                <span className="font-bold text-yellow-800">
                                    +{sessionStats.xpEarned} XP earned!
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full border-4 border-black flex items-center justify-center">
                                <span className="text-4xl">📚</span>
                            </div>
                            <h2 className="text-2xl font-black font-comic mb-2">
                                No Cards Due!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Great job! You've reviewed all your cards for now.
                                Come back later for more practice!
                            </p>
                        </>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClose}
                        className="w-full py-3 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Done
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    if (!currentCard) {
        return null;
    }

    const progress = ((currentIndex) / sessionCards.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-nanobanana-blue to-purple-600 z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={handleClose}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                <div className="flex-1 mx-4">
                    <div className="text-white/80 text-sm text-center mb-1">
                        Card {currentIndex + 1} of {sessionCards.length}
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-white rounded-full"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSkip}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Card area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="w-full max-w-md"
                    >
                        <FlashcardCard
                            card={currentCard}
                            isFlipped={isFlipped}
                            onFlip={handleFlip}
                            showMastery={false}
                            size="large"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Flip hint */}
                {!isFlipped && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-white/70 text-sm"
                    >
                        Tap the card or press Space to reveal the answer
                    </motion.p>
                )}
            </div>

            {/* Rating buttons */}
            <AnimatePresence>
                {showRatings && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="p-4 bg-white border-t-4 border-black"
                    >
                        <p className="text-center text-sm text-gray-600 mb-3 font-medium">
                            How well did you know this?
                        </p>
                        <div className="flex gap-3 justify-center">
                            {CONFIDENCE_RATINGS.map((rating, index) => (
                                <motion.button
                                    key={rating.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleRating(rating)}
                                    className={`
                                        flex-1 max-w-[120px] py-3 px-2 rounded-xl border-4 border-black
                                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                                        font-bold text-center
                                        ${rating.color === 'orange' ? 'bg-orange-100 hover:bg-orange-200' :
                                        rating.color === 'yellow' ? 'bg-yellow-100 hover:bg-yellow-200' :
                                        'bg-green-100 hover:bg-green-200'}
                                    `}
                                >
                                    <div className="text-2xl mb-1">{rating.emoji}</div>
                                    <div className="text-xs">{rating.label}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        Press {index + 1}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FlashcardStudyMode;
