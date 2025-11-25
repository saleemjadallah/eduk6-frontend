import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Lightbulb } from 'lucide-react';
import { getMasteryLevel } from '../../constants/flashcardConstants';

const FlashcardCard = ({
    card,
    isFlipped: controlledFlipped,
    onFlip,
    showMastery = true,
    size = 'large',
}) => {
    const [internalFlipped, setInternalFlipped] = useState(false);
    const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

    const handleFlip = () => {
        if (onFlip) {
            onFlip();
        } else {
            setInternalFlipped(!internalFlipped);
        }
    };

    const mastery = getMasteryLevel(card.correctReviews || 0);

    const sizeClasses = {
        small: 'w-64 h-40',
        medium: 'w-80 h-52',
        large: 'w-full max-w-md h-64',
    };

    const masteryColors = {
        gray: 'bg-gray-100 border-gray-300',
        orange: 'bg-orange-100 border-orange-300',
        yellow: 'bg-yellow-100 border-yellow-300',
        blue: 'bg-blue-100 border-blue-300',
        green: 'bg-green-100 border-green-300',
    };

    return (
        <div className={`${sizeClasses[size]} perspective-1000`}>
            <motion.div
                className="relative w-full h-full cursor-pointer"
                onClick={handleFlip}
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
                {/* Front of card */}
                <div
                    className={`
                        absolute w-full h-full rounded-3xl border-4 border-black
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                        bg-gradient-to-br from-nanobanana-blue to-blue-600
                        flex flex-col items-center justify-center p-6
                        backface-hidden
                    `}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Mastery indicator */}
                    {showMastery && (
                        <div className={`
                            absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold
                            border-2 ${masteryColors[mastery.color]}
                        `}>
                            {mastery.label}
                        </div>
                    )}

                    {/* Question icon */}
                    <div className="absolute top-3 left-3">
                        <Lightbulb className="w-6 h-6 text-white/70" />
                    </div>

                    {/* Front content */}
                    <div className="text-white text-center">
                        <p className="text-xs uppercase tracking-wide mb-2 text-white/70 font-bold">
                            Question
                        </p>
                        <p className="text-lg md:text-xl font-bold font-comic leading-relaxed">
                            {card.front}
                        </p>
                    </div>

                    {/* Tap to flip hint */}
                    <div className="absolute bottom-3 flex items-center gap-1 text-white/60 text-xs">
                        <RotateCcw className="w-3 h-3" />
                        Tap to flip
                    </div>
                </div>

                {/* Back of card */}
                <div
                    className={`
                        absolute w-full h-full rounded-3xl border-4 border-black
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                        bg-gradient-to-br from-nanobanana-green to-green-600
                        flex flex-col items-center justify-center p-6
                        backface-hidden
                    `}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {/* Answer content */}
                    <div className="text-white text-center">
                        <p className="text-xs uppercase tracking-wide mb-2 text-white/70 font-bold">
                            Answer
                        </p>
                        <p className="text-lg md:text-xl font-bold font-comic leading-relaxed">
                            {card.back}
                        </p>
                    </div>

                    {/* Tap to flip back hint */}
                    <div className="absolute bottom-3 flex items-center gap-1 text-white/60 text-xs">
                        <RotateCcw className="w-3 h-3" />
                        Tap to flip back
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FlashcardCard;
