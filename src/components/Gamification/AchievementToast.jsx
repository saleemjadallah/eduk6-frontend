import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const AchievementToast = ({ achievement, onClose, duration = 4000 }) => {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [achievement, duration, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: -100, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -100, x: '-50%' }}
                    className="fixed top-4 left-1/2 z-50 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 max-w-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl border-2 border-black flex items-center justify-center text-2xl">
                            {achievement.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Achievement</span>
                            </div>
                            <p className="font-bold font-comic">{achievement.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
