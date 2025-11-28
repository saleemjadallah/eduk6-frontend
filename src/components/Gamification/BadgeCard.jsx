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

const RARITY_GLOW = {
    common: '',
    rare: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    epic: 'shadow-[0_0_20px_rgba(139,92,246,0.6)]',
    legendary: 'shadow-[0_0_25px_rgba(245,158,11,0.7)]',
};

// Get badge image path
const getBadgeImagePath = (badgeId) => `/assets/badges/${badgeId}.png`;

const BadgeCard = ({ badge }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Check if we should use the generated image
    const badgeImagePath = getBadgeImagePath(badge.id);
    const useGeneratedImage = !imageError;

    return (
        <div className="relative">
            <motion.div
                whileHover={{ scale: 1.1, rotate: badge.unlocked ? 5 : 0 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                className={`
                    relative aspect-square rounded-2xl border-4 cursor-pointer overflow-hidden
                    ${badge.unlocked
                        ? `${RARITY_BORDERS[badge.rarity]} ${RARITY_GLOW[badge.rarity]}`
                        : 'border-gray-300 bg-gray-100'
                    }
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    flex flex-col items-center justify-center
                    transition-all
                `}
            >
                {/* Badge Image or Fallback */}
                {badge.unlocked ? (
                    useGeneratedImage ? (
                        <img
                            src={badgeImagePath}
                            alt={badge.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={`text-3xl bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} w-full h-full flex items-center justify-center`}>
                            {badge.icon}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center p-2 opacity-50 grayscale">
                        {useGeneratedImage ? (
                            <img
                                src={badgeImagePath}
                                alt={badge.name}
                                className="w-full h-full object-cover opacity-30 grayscale"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/60">
                            <Lock className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>
                )}

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
