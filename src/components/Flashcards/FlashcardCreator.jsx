import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Wand2, Save, Loader2 } from 'lucide-react';
import { DECK_CATEGORIES } from '../../constants/flashcardConstants';
import { useFlashcardContext } from '../../context/FlashcardContext';
import { generateFlashcards } from '../../services/geminiService';

const FlashcardCreator = ({
    isOpen,
    onClose,
    lessonContent = null,
    existingDeck = null,
}) => {
    const { createDeck, addCards, updateDeck } = useFlashcardContext();

    const [deckName, setDeckName] = useState(existingDeck?.name || '');
    const [deckDescription, setDeckDescription] = useState(existingDeck?.description || '');
    const [category, setCategory] = useState(existingDeck?.category || 'custom');
    const [cards, setCards] = useState([{ front: '', back: '' }]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'generate'

    const handleAddCard = () => {
        setCards([...cards, { front: '', back: '' }]);
    };

    const handleRemoveCard = (index) => {
        if (cards.length > 1) {
            setCards(cards.filter((_, i) => i !== index));
        }
    };

    const handleCardChange = (index, field, value) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleGenerateCards = async () => {
        if (!lessonContent) return;

        setIsGenerating(true);
        try {
            const result = await generateFlashcards(
                JSON.stringify(lessonContent),
                10
            );
            if (result.flashcards) {
                setCards(result.flashcards.map(fc => ({
                    front: fc.front,
                    back: fc.back,
                })));
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        // Filter out empty cards
        const validCards = cards.filter(c => c.front.trim() && c.back.trim());

        if (!deckName.trim() || validCards.length === 0) {
            return;
        }

        if (existingDeck) {
            // Update existing deck
            updateDeck(existingDeck.id, {
                name: deckName,
                description: deckDescription,
                category,
            });
            addCards(validCards, existingDeck.id);
        } else {
            // Create new deck
            const newDeck = createDeck({
                name: deckName,
                description: deckDescription,
                category,
            });
            addCards(validCards, newDeck.id);
        }

        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b-4 border-black bg-nanobanana-yellow flex items-center justify-between">
                    <h2 className="text-xl font-black font-comic">
                        {existingDeck ? 'Add Cards' : 'Create Flashcard Deck'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Deck info (only for new decks) */}
                    {!existingDeck && (
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-1">Deck Name</label>
                                <input
                                    type="text"
                                    value={deckName}
                                    onChange={(e) => setDeckName(e.target.value)}
                                    placeholder="e.g., Math Facts, Science Vocab"
                                    className="w-full px-4 py-2 rounded-xl border-4 border-black focus:outline-none focus:ring-2 focus:ring-nanobanana-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Description (optional)</label>
                                <input
                                    type="text"
                                    value={deckDescription}
                                    onChange={(e) => setDeckDescription(e.target.value)}
                                    placeholder="What's this deck about?"
                                    className="w-full px-4 py-2 rounded-xl border-4 border-black focus:outline-none focus:ring-2 focus:ring-nanobanana-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {DECK_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            className={`
                                                px-3 py-2 rounded-xl border-2 font-medium text-sm
                                                flex items-center gap-2 transition-all
                                                ${category === cat.id
                                                    ? 'border-black bg-nanobanana-blue text-white'
                                                    : 'border-gray-300 hover:border-black'
                                                }
                                            `}
                                        >
                                            <span>{cat.icon}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Tab selector */}
                    <div className="flex gap-2 border-b-2 border-gray-200">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`
                                px-4 py-2 font-bold text-sm border-b-4 -mb-[2px] transition-colors
                                ${activeTab === 'manual'
                                    ? 'border-nanobanana-blue text-nanobanana-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            Create Manually
                        </button>
                        {lessonContent && (
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`
                                    px-4 py-2 font-bold text-sm border-b-4 -mb-[2px] transition-colors
                                    flex items-center gap-2
                                    ${activeTab === 'generate'
                                        ? 'border-nanobanana-blue text-nanobanana-blue'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }
                                `}
                            >
                                <Wand2 className="w-4 h-4" />
                                Generate with AI
                            </button>
                        )}
                    </div>

                    {/* Content based on tab */}
                    {activeTab === 'generate' && lessonContent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <Wand2 className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-bold mb-2">Generate Flashcards</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Let AI create flashcards from your lesson content!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGenerateCards}
                                disabled={isGenerating}
                                className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 mx-auto"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Generate 10 Cards
                                    </>
                                )}
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {cards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-500">
                                                Card {index + 1}
                                            </span>
                                            {cards.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveCard(index)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Front (Question)</label>
                                                <textarea
                                                    value={card.front}
                                                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                                    placeholder="Enter question..."
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-nanobanana-blue focus:outline-none text-sm resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Back (Answer)</label>
                                                <textarea
                                                    value={card.back}
                                                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                                    placeholder="Enter answer..."
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-nanobanana-blue focus:outline-none text-sm resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <button
                                onClick={handleAddCard}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-nanobanana-blue hover:text-nanobanana-blue transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Card
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-4 border-black bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border-2 border-gray-300 font-bold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={!deckName.trim() || cards.every(c => !c.front.trim() || !c.back.trim())}
                        className="px-6 py-2 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        Save Deck
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FlashcardCreator;
