import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star } from 'lucide-react';

const RARITY_COLORS = {
    common: 'from-gray-300 to-gray-400',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_BORDERS = {
    common: 'border-gray-400',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
};

const BadgeCard = ({ badge }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <motion.div
                whileHover={{ scale: 1.1, rotate: badge.unlocked ? 5 : 0 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                className={`
                    relative aspect-square rounded-2xl border-4 cursor-pointer
                    ${badge.unlocked
                        ? `${RARITY_BORDERS[badge.rarity]} bg-gradient-to-br ${RARITY_COLORS[badge.rarity]}`
                        : 'border-gray-300 bg-gray-100'
                    }
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    flex flex-col items-center justify-center p-2
                    transition-all
                `}
            >
                {/* Badge Icon/Emoji */}
                <div className={`text-3xl ${!badge.unlocked && 'opacity-30 grayscale'}`}>
                    {badge.unlocked ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                </div>

                {/* Rarity indicator for unlocked badges */}
                {badge.unlocked && badge.rarity !== 'common' && (
                    <div className="absolute top-1 right-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-600" />
                    </div>
                )}

                {/* Progress indicator for progressive badges */}
                {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                    <div className="absolute bottom-1 left-1 right-1">
                        <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${badge.progress}%` }}
                                className="h-full bg-nanobanana-blue"
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black text-white rounded-xl text-xs pointer-events-none"
                    >
                        <div className="font-bold mb-1">{badge.name}</div>
                        <div className="text-gray-300">{badge.description}</div>
                        {badge.unlocked && badge.unlockedAt && (
                            <div className="text-gray-400 mt-1 text-[10px]">
                                Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                            </div>
                        )}
                        {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                            <div className="text-yellow-400 mt-1">
                                Progress: {Math.round(badge.progress)}%
                            </div>
                        )}
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                            <div className="w-2 h-2 bg-black transform rotate-45"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BadgeCard;
