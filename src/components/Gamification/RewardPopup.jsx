import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Flame, Gift } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';
import ConfettiEffect from './ConfettiEffect';

const RewardPopup = () => {
    const { pendingCelebration, clearCelebration } = useGamificationContext();

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (pendingCelebration) {
            const timer = setTimeout(() => {
                clearCelebration();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [pendingCelebration, clearCelebration]);

    if (!pendingCelebration) return null;

    const renderContent = () => {
        switch (pendingCelebration.type) {
            case 'levelUp':
                return (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 1,
                                times: [0, 0.5, 1],
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-nanobanana-yellow to-orange-400 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
                        >
                            <Star className="w-12 h-12 fill-white text-black" />
                        </motion.div>
                        <h2 className="text-4xl font-black font-comic mb-2">
                            Level Up!
                        </h2>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            You're now Level {pendingCelebration.level}!
                        </p>
                        <p className="text-sm text-gray-600">
                            +{pendingCelebration.xpEarned} XP earned
                        </p>
                    </>
                );

            case 'badge':
                return (
                    <>
                        <motion.div
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 0.8,
                            }}
                            className={`
                                w-24 h-24 rounded-full border-4
                                ${pendingCelebration.badge.rarity === 'legendary' ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-orange-500' :
                                    pendingCelebration.badge.rarity === 'epic' ? 'border-purple-500 bg-gradient-to-br from-purple-400 to-purple-600' :
                                    pendingCelebration.badge.rarity === 'rare' ? 'border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600' :
                                    'border-gray-500 bg-gradient-to-br from-gray-300 to-gray-400'}
                                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                flex items-center justify-center mb-4 text-5xl
                            `}
                        >
                            {pendingCelebration.badge.icon}
                        </motion.div>
                        <h2 className="text-4xl font-black font-comic mb-2">
                            New Badge!
                        </h2>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            {pendingCelebration.badge.name}
                        </p>
                        <p className="text-sm text-gray-600">
                            {pendingCelebration.badge.description}
                        </p>
                    </>
                );

            case 'streakMilestone':
                return (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 1,
                                repeat: 2,
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
                        >
                            <Flame className="w-12 h-12 fill-white text-orange-600" />
                        </motion.div>
                        <h2 className="text-4xl font-black font-comic mb-2">
                            Amazing Streak!
                        </h2>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            {pendingCelebration.streak} days in a row!
                        </p>
                        <p className="text-sm text-gray-600">
                            You're unstoppable! Keep it up!
                        </p>
                    </>
                );

            case 'dailyChallenge':
                return (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: 3,
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-nanobanana-green to-green-600 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
                        >
                            <Gift className="w-12 h-12 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-black font-comic mb-2">
                            Challenge Complete!
                        </h2>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            Daily Goal Achieved!
                        </p>
                        <p className="text-sm text-gray-600">
                            +{pendingCelebration.xpReward} XP bonus earned!
                        </p>
                    </>
                );

            case 'bigXP':
                return (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: 2,
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4"
                        >
                            <Trophy className="w-12 h-12 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-black font-comic mb-2">
                            Awesome Work!
                        </h2>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            +{pendingCelebration.xpEarned} XP!
                        </p>
                        <p className="text-sm text-gray-600">
                            {pendingCelebration.reason}
                        </p>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {pendingCelebration && (
                <>
                    {/* Confetti */}
                    <ConfettiEffect />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={clearCelebration}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 200,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full text-center relative"
                        >
                            {/* Close button */}
                            <button
                                onClick={clearCelebration}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {renderContent()}

                            {/* Continue button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearCelebration}
                                className="mt-6 px-8 py-3 bg-nanobanana-green text-white font-bold rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                Awesome! Let's Continue
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RewardPopup;
