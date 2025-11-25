import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock } from 'lucide-react';
import { useGamificationContext } from '../../context/GamificationContext';

const DailyChallenge = ({ compact = false }) => {
    const { dailyChallenge } = useGamificationContext();

    if (!dailyChallenge) return null;

    const progress = (dailyChallenge.progress / dailyChallenge.challenge.target) * 100;
    const isComplete = dailyChallenge.completed;

    if (compact) {
        return (
            <div className={`
                flex items-center gap-2 px-3 py-2 rounded-full border-2
                ${isComplete
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-black'
                }
            `}>
                {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <Target className="w-5 h-5 text-nanobanana-blue" />
                )}
                <span className="text-xs font-bold">
                    {isComplete ? 'Done!' : `${dailyChallenge.progress}/${dailyChallenge.challenge.target}`}
                </span>
            </div>
        );
    }

    return (
        <div className={`
            bg-white p-4 rounded-2xl border-4 border-black
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            ${isComplete && 'bg-green-50 border-green-500'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold font-comic flex items-center gap-2">
                    <Target className="w-5 h-5 text-nanobanana-blue" />
                    Daily Challenge
                </h3>
                <div className="flex items-center gap-1 text-xs bg-yellow-50 px-2 py-1 rounded-full border-2 border-yellow-300">
                    <Clock className="w-3 h-3 text-yellow-700" />
                    <span className="font-bold text-yellow-700">Today</span>
                </div>
            </div>

            {/* Challenge description */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{dailyChallenge.challenge.icon}</span>
                    <p className="font-medium text-gray-700">
                        {dailyChallenge.challenge.description}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700">
                        {dailyChallenge.progress} / {dailyChallenge.challenge.target}
                    </span>
                    <span className="font-bold text-nanobanana-blue">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${isComplete
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-nanobanana-blue to-blue-600'
                        }`}
                    />
                </div>
            </div>

            {/* Reward info */}
            <div className={`
                p-2 rounded-xl border-2 text-center
                ${isComplete
                    ? 'bg-green-100 border-green-300'
                    : 'bg-yellow-50 border-yellow-200'
                }
            `}>
                {isComplete ? (
                    <p className="text-sm font-bold text-green-700">
                        Challenge Complete! +{dailyChallenge.xpReward} XP earned!
                    </p>
                ) : (
                    <p className="text-sm font-bold text-yellow-700">
                        Reward: {dailyChallenge.xpReward} XP
                    </p>
                )}
            </div>
        </div>
    );
};

export default DailyChallenge;
