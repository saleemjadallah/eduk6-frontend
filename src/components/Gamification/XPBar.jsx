import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';
import { calculateXPForLevel } from '../../utils/xpCalculations';
import Tooltip from '../UI/Tooltip';

const XPBar = ({ compact = false, showLabel = true }) => {
    const { currentXP, currentLevel } = useGamificationContext();

    // Calculate XP progress within current level
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const xpIntoCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const xpRemaining = xpForNextLevel - currentXP;

    const progress = xpNeededForLevel > 0 ? (xpIntoCurrentLevel / xpNeededForLevel) * 100 : 0;
    const isNearLevel = progress > 80;

    if (compact) {
        return (
            <Tooltip
                title={`Level ${currentLevel}`}
                content={`${xpIntoCurrentLevel}/${xpNeededForLevel} XP (${xpRemaining} to next level)`}
                position="bottom"
            >
                <div className="flex items-center gap-2 cursor-default">
                    <div className="flex items-center gap-1 bg-nanobanana-yellow px-2 py-1 rounded-full border-2 border-black text-xs font-bold">
                        <Star className="w-3 h-3 fill-black" />
                        {currentLevel}
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden min-w-[60px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`h-full ${isNearLevel ? 'bg-gradient-to-r from-nanobanana-yellow to-orange-400' : 'bg-nanobanana-yellow'}`}
                        />
                    </div>
                </div>
            </Tooltip>
        );
    }

    return (
        <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {showLabel && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-nanobanana-yellow text-black" />
                        <span className="font-bold font-comic">Level {currentLevel}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                        {xpIntoCurrentLevel} / {xpNeededForLevel} XP
                    </span>
                </div>
            )}

            <div className="relative h-6 bg-gray-200 rounded-full border-4 border-black overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-nanobanana-yellow via-yellow-400 to-orange-400 relative"
                >
                    {/* Shimmer effect when near level up */}
                    {isNearLevel && (
                        <motion.div
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                    )}
                </motion.div>

                {/* Sparkles at the end of progress bar */}
                {isNearLevel && (
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                        <Sparkles className="w-4 h-4 text-orange-500" />
                    </motion.div>
                )}
            </div>

            {/* Next level preview */}
            {showLabel && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    {xpRemaining} XP to Level {currentLevel + 1}!
                </p>
            )}
        </div>
    );
};

export default XPBar;
