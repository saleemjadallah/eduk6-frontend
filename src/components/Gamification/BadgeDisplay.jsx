import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';
import BadgeCard from './BadgeCard';
import { ALL_BADGES, getBadgeProgress } from '../../utils/achievementDefinitions';

const BadgeDisplay = ({ limit = null, category = null, showHeader = true }) => {
    const { badges, statistics, streak, currentLevel } = useGamificationContext();

    // Get all possible badges
    const allBadges = ALL_BADGES;

    // Filter by category if specified
    const filteredBadges = category && category !== 'all'
        ? allBadges.filter(b => b.category === category)
        : allBadges;

    // Separate unlocked and locked badges
    const unlockedIds = new Set(badges.map(b => b.id));
    const displayBadges = filteredBadges.map(badge => ({
        ...badge,
        unlocked: unlockedIds.has(badge.id),
        unlockedAt: badges.find(b => b.id === badge.id)?.unlockedAt,
        progress: !unlockedIds.has(badge.id)
            ? getBadgeProgress(badge.id, statistics, streak, currentLevel)
            : undefined,
    }));

    // Sort: unlocked first, then by rarity
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    displayBadges.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    // Apply limit if specified
    const badgesToShow = limit ? displayBadges.slice(0, limit) : displayBadges;

    const unlockedCount = displayBadges.filter(b => b.unlocked).length;
    const totalCount = displayBadges.length;

    return (
        <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold font-comic flex items-center gap-2">
                        <Trophy className="w-5 h-5 fill-nanobanana-yellow text-black" />
                        Achievements
                    </h3>
                    <div className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full border-2 border-black">
                        {unlockedCount}/{totalCount}
                    </div>
                </div>
            )}

            {/* Badges Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                <AnimatePresence>
                    {badgesToShow.map((badge, index) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <BadgeCard badge={badge} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show more hint if limited */}
            {limit && totalCount > limit && (
                <div className="mt-4 text-center">
                    <span className="text-sm text-nanobanana-blue font-bold">
                        +{totalCount - limit} more badges to unlock
                    </span>
                </div>
            )}
        </div>
    );
};

export default BadgeDisplay;
