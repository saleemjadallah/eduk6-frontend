import React from 'react';
import { motion } from 'framer-motion';
import { Play, Layers, Clock, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { DECK_CATEGORIES } from '../../constants/flashcardConstants';

const FlashcardDeck = ({
    deck,
    dueCount = 0,
    onStudy,
    onEdit,
    onDelete,
    compact = false,
}) => {
    const category = DECK_CATEGORIES.find(c => c.id === deck.category) || DECK_CATEGORIES[0];

    const categoryColors = {
        blue: 'from-blue-400 to-blue-600',
        purple: 'from-purple-400 to-purple-600',
        green: 'from-green-400 to-green-600',
        cyan: 'from-cyan-400 to-cyan-600',
        pink: 'from-pink-400 to-pink-600',
    };

    if (compact) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStudy?.(deck.id)}
                className={`
                    relative p-4 rounded-2xl border-4 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    bg-gradient-to-br ${categoryColors[category.color] || categoryColors.blue}
                    cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    transition-shadow
                `}
            >
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold font-comic text-white truncate">
                            {deck.name}
                        </h3>
                        <p className="text-xs text-white/80">
                            {deck.cardCount || 0} cards
                        </p>
                    </div>
                    {dueCount > 0 && (
                        <div className="bg-white text-black px-2 py-1 rounded-full text-xs font-bold">
                            {dueCount} due
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative bg-white rounded-2xl border-4 border-black
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                overflow-hidden
            `}
        >
            {/* Deck header with gradient */}
            <div className={`
                p-4 bg-gradient-to-r ${categoryColors[category.color] || categoryColors.blue}
                border-b-4 border-black
            `}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                            {category.icon}
                        </div>
                        <div>
                            <h3 className="font-bold font-comic text-lg text-white">
                                {deck.name}
                            </h3>
                            <p className="text-xs text-white/80">
                                {category.label}
                            </p>
                        </div>
                    </div>

                    {/* Actions menu */}
                    <div className="flex items-center gap-1">
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(deck.id); }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4 text-white" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Deck body */}
            <div className="p-4">
                {/* Description */}
                {deck.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {deck.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{deck.cardCount || 0} cards</span>
                    </div>
                    {dueCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-orange-600">{dueCount} due today</span>
                        </div>
                    )}
                </div>

                {/* Study button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStudy?.(deck.id)}
                    disabled={!deck.cardCount || deck.cardCount === 0}
                    className={`
                        w-full py-3 px-4 rounded-xl border-4 border-black
                        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                        font-bold font-comic flex items-center justify-center gap-2
                        transition-all
                        ${deck.cardCount > 0
                            ? 'bg-nanobanana-yellow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-200 cursor-not-allowed opacity-50'
                        }
                    `}
                >
                    <Play className="w-5 h-5" />
                    {dueCount > 0 ? `Study ${dueCount} Due Cards` : 'Study Now'}
                </motion.button>
            </div>

            {/* Due indicator badge */}
            {dueCount > 0 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{dueCount > 9 ? '9+' : dueCount}</span>
                </div>
            )}
        </motion.div>
    );
};

export default FlashcardDeck;
