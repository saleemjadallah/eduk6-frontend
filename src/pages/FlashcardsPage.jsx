import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Plus,
    Layers,
    Clock,
    Target,
    TrendingUp,
    Play,
    Zap,
} from 'lucide-react';
import { FlashcardDeck, FlashcardStudyMode, FlashcardCreator } from '../components/Flashcards';
import { useFlashcards } from '../hooks/useFlashcards';
import { DECK_CATEGORIES } from '../constants/flashcardConstants';

const FlashcardsPage = () => {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [studyingDeckId, setStudyingDeckId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const {
        decksWithDueCounts,
        totalDueCards,
        overallStats,
        studyStreakInfo,
        getRecommendedDeck,
        startQuickStudy,
        deleteDeck,
    } = useFlashcards();

    const handleStartStudy = (deckId) => {
        setStudyingDeckId(deckId);
    };

    const handleQuickStudy = () => {
        const recommendedDeck = getRecommendedDeck();
        if (recommendedDeck) {
            setStudyingDeckId(recommendedDeck.id);
        }
    };

    const handleDeleteDeck = (deckId) => {
        if (window.confirm('Are you sure you want to delete this deck? All cards will be lost.')) {
            deleteDeck(deckId);
        }
    };

    const filteredDecks = selectedCategory === 'all'
        ? decksWithDueCounts
        : decksWithDueCounts.filter(d => d.category === selectedCategory);

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-8">
                {/* Header */}
                <div className="bg-white border-b-4 border-black p-4">
                    <div className="max-w-5xl mx-auto">
                        <Link
                            to="/study"
                            className="inline-flex items-center gap-2 text-nanobanana-blue font-bold hover:underline mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Study
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black font-comic mb-2">
                                    Flashcards
                                </h1>
                                <p className="text-gray-600">
                                    Master your lessons with spaced repetition!
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsCreatorOpen(true)}
                                className="px-4 py-2 bg-nanobanana-yellow font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Deck
                            </motion.button>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{overallStats.totalCards}</div>
                                    <div className="text-xs text-gray-500">Total Cards</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{totalDueCards}</div>
                                    <div className="text-xs text-gray-500">Due Today</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{overallStats.overallAccuracy}%</div>
                                    <div className="text-xs text-gray-500">Accuracy</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{overallStats.masteredCards}</div>
                                    <div className="text-xs text-gray-500">Mastered</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Study Button */}
                    {totalDueCards > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-nanobanana-blue to-purple-600 p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <h3 className="font-bold font-comic text-xl mb-1">
                                        Ready to Study?
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        You have {totalDueCards} cards waiting for review!
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleQuickStudy}
                                    className="px-6 py-3 bg-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                                >
                                    <Zap className="w-5 h-5 text-nanobanana-yellow" />
                                    Quick Study
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`
                                px-4 py-2 rounded-full border-2 font-bold whitespace-nowrap
                                transition-all
                                ${selectedCategory === 'all'
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                }
                            `}
                        >
                            All Decks
                        </button>
                        {DECK_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    px-4 py-2 rounded-full border-2 font-bold whitespace-nowrap
                                    flex items-center gap-2 transition-all
                                    ${selectedCategory === cat.id
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                    }
                                `}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Decks Grid */}
                    {filteredDecks.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredDecks.map((deck, index) => (
                                    <motion.div
                                        key={deck.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <FlashcardDeck
                                            deck={deck}
                                            dueCount={deck.dueCount}
                                            onStudy={handleStartStudy}
                                            onDelete={handleDeleteDeck}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Layers className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="font-bold font-comic text-xl mb-2 text-gray-700">
                                No Flashcard Decks Yet
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Create your first deck or generate cards from a lesson!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsCreatorOpen(true)}
                                className="px-6 py-3 bg-nanobanana-yellow font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Deck
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Study Mode Overlay */}
            <AnimatePresence>
                {studyingDeckId && (
                    <FlashcardStudyMode
                        deckId={studyingDeckId}
                        onClose={() => setStudyingDeckId(null)}
                        onComplete={(stats) => {
                            console.log('Session complete:', stats);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Creator Modal */}
            <AnimatePresence>
                {isCreatorOpen && (
                    <FlashcardCreator
                        isOpen={isCreatorOpen}
                        onClose={() => setIsCreatorOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default FlashcardsPage;
