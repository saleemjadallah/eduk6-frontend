import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Lightbulb, CheckCircle } from 'lucide-react';

const stages = [
    { key: 'uploading', label: 'Uploading your lesson...', icon: BookOpen, color: 'bg-blue-500' },
    { key: 'extracting', label: 'Reading the content...', icon: BookOpen, color: 'bg-purple-500' },
    { key: 'analyzing', label: 'Jeffrey is thinking...', icon: Brain, color: 'bg-pink-500' },
    { key: 'generating', label: 'Creating your study guide...', icon: Lightbulb, color: 'bg-orange-500' },
    { key: 'complete', label: 'All done! 🎉', icon: CheckCircle, color: 'bg-green-500' },
];

const ProcessingAnimation = ({ stage, progress }) => {
    const currentStageIndex = stages.findIndex(s => s.key === stage);
    const CurrentIcon = stages[currentStageIndex]?.icon || Sparkles;
    const currentColor = stages[currentStageIndex]?.color || 'bg-nanobanana-yellow';

    return (
        <div className="flex flex-col items-center py-8 px-4">
            {/* Animated Character */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className={`
                    w-24 h-24 ${currentColor} 
                    rounded-full border-4 border-black 
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    flex items-center justify-center
                    text-white mb-6
                `}
            >
                <CurrentIcon className="w-12 h-12" />
            </motion.div>

            {/* Stage Label */}
            <motion.p
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold font-comic mb-6 text-center"
            >
                {stages[currentStageIndex]?.label || 'Processing...'}
            </motion.p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mb-6">
                <div className="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${currentColor}`}
                    />
                </div>
                <p className="text-center text-sm font-bold mt-2 text-gray-600">
                    {Math.round(progress)}%
                </p>
            </div>

            {/* Stage Progress Dots */}
            <div className="flex gap-2">
                {stages.map((s, index) => (
                    <motion.div
                        key={s.key}
                        initial={{ scale: 0 }}
                        animate={{ 
                            scale: 1,
                            backgroundColor: index <= currentStageIndex ? '#22c55e' : '#e5e7eb'
                        }}
                        transition={{ delay: index * 0.1 }}
                        className="w-3 h-3 rounded-full border-2 border-black"
                    />
                ))}
            </div>

            {/* Fun Messages */}
            <motion.div
                key={stage + '-fun'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
            >
                {stage === 'analyzing' && (
                    <p className="text-gray-500 text-sm italic">
                        ✨ Jeffrey is finding the coolest facts for you!
                    </p>
                )}
                {stage === 'generating' && (
                    <p className="text-gray-500 text-sm italic">
                        🎨 Making everything look awesome...
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default ProcessingAnimation;