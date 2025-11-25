import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';

const StreakCounter = ({ compact = false }) => {
    const { streak } = useGamificationContext();

    const getStreakColor = (days) => {
        if (days >= 30) return 'from-purple-500 to-pink-500';
        if (days >= 14) return 'from-orange-500 to-red-500';
        if (days >= 7) return 'from-yellow-500 to-orange-500';
        return 'from-blue-500 to-cyan-500';
    };

    const getFlameAnimation = (days) => {
        if (days >= 7) {
            return {
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
            };
        }
        return {
            scale: [1, 1.1, 1],
        };
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-2 border-black">
                <motion.div
                    animate={getFlameAnimation(streak.current)}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
                </motion.div>
                <span className="font-bold text-sm">{streak.current}</span>
                {streak.freezeAvailable && (
                    <Shield className="w-4 h-4 text-blue-500" />
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold font-comic flex items-center gap-2">
                    <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
                    Day Streak
                </h3>
                {streak.freezeAvailable && (
                    <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-full border-2 border-blue-200">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="font-bold text-blue-700">Freeze</span>
                    </div>
                )}
            </div>

            <div className="relative">
                {/* Large streak number */}
                <motion.div
                    animate={getFlameAnimation(streak.current)}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className={`
                        text-5xl font-black font-comic text-center
                        bg-gradient-to-br ${getStreakColor(streak.current)}
                        bg-clip-text text-transparent
                    `}
                >
                    {streak.current}
                </motion.div>

                <p className="text-center text-sm text-gray-600 font-medium mt-1">
                    {streak.current === 1 ? 'day' : 'days'} in a row!
                </p>
            </div>

            {/* Longest streak badge */}
            {streak.longest > streak.current && (
                <div className="mt-3 pt-3 border-t-2 border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        <span className="font-bold">Personal Best:</span> {streak.longest} days
                    </p>
                </div>
            )}

            {/* Motivational message */}
            <div className="mt-3 p-2 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="text-xs text-yellow-800 text-center font-medium">
                    {streak.current >= 30
                        ? "Legendary! You're on fire!"
                        : streak.current >= 7
                        ? "Wow! You're on fire!"
                        : streak.current >= 3
                        ? "Great start! Keep it going!"
                        : "Keep learning daily to build your streak!"}
                </p>
            </div>
        </div>
    );
};

export default StreakCounter;
