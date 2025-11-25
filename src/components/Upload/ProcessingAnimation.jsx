import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { PROCESSING_STAGES, LOADING_MESSAGES } from '../../constants/lessonConstants';

// Map stages to icons
const stageIcons = {
    idle: Sparkles,
    uploading: BookOpen,
    extracting: BookOpen,
    analyzing: Brain,
    generating: Lightbulb,
    complete: CheckCircle,
    error: AlertCircle,
};

// Map stages to colors
const stageColors = {
    idle: 'bg-gray-400',
    uploading: 'bg-blue-500',
    extracting: 'bg-purple-500',
    analyzing: 'bg-pink-500',
    generating: 'bg-orange-500',
    complete: 'bg-green-500',
    error: 'bg-red-500',
};

const ProcessingAnimation = ({ stage, progress, useChildLabels = true }) => {
    const [funMessage, setFunMessage] = useState('');

    // Rotate through fun messages during processing
    useEffect(() => {
        if (stage === 'idle' || stage === 'complete' || stage === 'error') {
            setFunMessage('');
            return;
        }

        // Set initial message
        setFunMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

        // Rotate messages every 3 seconds
        const interval = setInterval(() => {
            setFunMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
        }, 3000);

        return () => clearInterval(interval);
    }, [stage]);

    const currentStageInfo = PROCESSING_STAGES[stage] || PROCESSING_STAGES.idle;
    const stageKeys = Object.keys(PROCESSING_STAGES).filter(k => k !== 'idle' && k !== 'error');
    const currentStageIndex = stageKeys.indexOf(stage);
    const CurrentIcon = stageIcons[stage] || Sparkles;
    const currentColor = stageColors[stage] || 'bg-nanobanana-yellow';
    const displayLabel = useChildLabels ? currentStageInfo.childLabel : currentStageInfo.label;

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
                {displayLabel || 'Processing...'}
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
                {stageKeys.map((key, index) => (
                    <motion.div
                        key={key}
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
            {funMessage && (
                <motion.div
                    key={funMessage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-500 text-sm italic">
                        {funMessage}
                    </p>
                </motion.div>
            )}

            {/* Error State */}
            {stage === 'error' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                    <p className="text-red-600 font-medium text-center">
                        Don't worry! Let's try again.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ProcessingAnimation;
