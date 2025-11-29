import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Flame, BookOpen, Target } from 'lucide-react';
import { XPBar, StreakCounter, BadgeDisplay, DailyChallenge } from '../components/Gamification';
import { useGamificationContext } from '../context/GamificationContext';
import { useAchievements } from '../hooks/useAchievements';

const AchievementsPage = () => {
    // Debug: Log when component mounts/unmounts
    useEffect(() => {
        console.log('[AchievementsPage] MOUNTED');
        return () => console.log('[AchievementsPage] UNMOUNTED');
    }, []);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { statistics, currentLevel, totalXP } = useGamificationContext();
    const { unlockedCount, totalCount, getNextBadgeSuggestion } = useAchievements();

    const categories = [
        { id: 'all', label: 'All', icon: Trophy },
        { id: 'learning', label: 'Learning', icon: BookOpen },
        { id: 'streak', label: 'Streaks', icon: Flame },
        { id: 'mastery', label: 'Mastery', icon: Star },
        { id: 'special', label: 'Special', icon: Target },
    ];

    const nextBadge = getNextBadgeSuggestion();

    return (
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

                    <h1 className="text-4xl font-black font-comic mb-2">
                        Your Progress
                    </h1>
                    <p className="text-gray-600">
                        Keep learning to unlock more achievements!
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
                {/* Progress Overview */}
                <div className="grid md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <XPBar showLabel />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <StreakCounter />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <DailyChallenge />
                    </motion.div>
                </div>

                {/* Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <h2 className="text-xl font-bold font-comic mb-4">Your Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <div className="text-3xl font-black text-nanobanana-blue">{statistics.lessonsCompleted}</div>
                            <div className="text-sm text-gray-600 font-medium">Lessons</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl border-2 border-green-200">
                            <div className="text-3xl font-black text-nanobanana-green">{statistics.questionsAnswered}</div>
                            <div className="text-sm text-gray-600 font-medium">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                            <div className="text-3xl font-black text-purple-600">{statistics.flashcardsReviewed}</div>
                            <div className="text-sm text-gray-600 font-medium">Flashcards</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                            <div className="text-3xl font-black text-yellow-600">{Math.round(statistics.totalStudyTime)}</div>
                            <div className="text-sm text-gray-600 font-medium">Minutes</div>
                        </div>
                    </div>
                </motion.div>

                {/* Next Badge Suggestion */}
                {nextBadge && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-nanobanana-yellow/20 to-orange-100 p-4 rounded-2xl border-4 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">{nextBadge.badge.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-bold font-comic">Next up: {nextBadge.badge.name}</h3>
                                <p className="text-sm text-gray-700">{nextBadge.message}</p>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-nanobanana-yellow"
                                        style={{ width: `${nextBadge.badge.progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-yellow-600">
                                {Math.round(nextBadge.badge.progress)}%
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Badge Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold whitespace-nowrap
                                        transition-all
                                        ${selectedCategory === cat.id
                                            ? 'bg-nanobanana-blue text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Badge Display */}
                    <BadgeDisplay
                        category={selectedCategory}
                        showHeader={false}
                    />
                </motion.div>

                {/* Footer Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center py-4"
                >
                    <p className="text-gray-500 font-medium">
                        You've unlocked <span className="font-bold text-nanobanana-blue">{unlockedCount}</span> of <span className="font-bold">{totalCount}</span> badges
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Total XP: {totalXP.toLocaleString()} | Level {currentLevel}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AchievementsPage;
