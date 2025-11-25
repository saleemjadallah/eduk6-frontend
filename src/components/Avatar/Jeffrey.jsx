import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Jeffrey = ({ isTyping = false, emotion = 'happy' }) => {
    const [isBlinking, setIsBlinking] = useState(false);

    // Blinking logic
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 4000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Bounce animation
    const bounceTransition = {
        y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    };

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xl"
                animate={{ y: [-5, 5] }}
                transition={bounceTransition}
            >
                {/* Banana Body - Curve shape */}
                <path
                    d="M100,20 C60,20 40,60 40,100 C40,150 70,190 120,190 C160,190 180,150 180,100 C180,50 140,20 100,20 Z"
                    fill="#FFE135" // Banana Yellow
                    stroke="black"
                    strokeWidth="4"
                    className="hidden" // Placeholder for simple shape if needed, but using complex path below
                />

                {/* Actual Banana Shape */}
                <path
                    d="M86.6,-13.3C105.6,3.6,110.6,38.6,98.3,63.3C86,88,56.5,102.3,28.6,106.8C0.7,111.3,-25.6,106,-48.6,90.3C-71.6,74.6,-91.3,48.6,-93.3,20.3C-95.3,-8,-79.6,-38.6,-58.3,-56.3C-37,-74,-10,-78.6,6.3,-71.3C22.6,-64,45.3,-44.6,67.6,-26.3"
                    transform="translate(100 100) rotate(-15)"
                    fill="#FFE135"
                    stroke="black"
                    strokeWidth="4"
                    display="none" // Hiding the blob generator path to use a custom drawn banana
                />

                {/* Custom Banana Path */}
                <path
                    d="M120 20 C100 10, 60 40, 50 100 C 45 140, 70 180, 110 185 C 140 190, 160 160, 165 120 C 170 60, 140 30, 120 20 Z"
                    fill="#FFE135"
                    stroke="black"
                    strokeWidth="5"
                />

                {/* Banana Stem */}
                <path
                    d="M115 22 C 110 10, 125 5, 135 15 L 125 25 Z"
                    fill="#8B4513"
                    stroke="black"
                    strokeWidth="3"
                />

                {/* Glasses Frame */}
                <g transform="translate(0, 10)">
                    <circle cx="85" cy="90" r="22" fill="white" stroke="black" strokeWidth="4" />
                    <circle cx="135" cy="90" r="22" fill="white" stroke="black" strokeWidth="4" />
                    <path d="M107 90 L 113 90" stroke="black" strokeWidth="4" /> {/* Bridge */}
                </g>

                {/* Eyes (Pupils) */}
                <g transform="translate(0, 10)">
                    <motion.circle
                        cx="85" cy="90" r="8" fill="black"
                        animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                    />
                    <motion.circle
                        cx="135" cy="90" r="8" fill="black"
                        animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                    />
                </g>

                {/* Mouth */}
                <motion.path
                    d="M90,135 Q110,155 130,135"
                    fill="none"
                    stroke="black"
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{
                        d: isTyping
                            ? ["M90,135 Q110,155 130,135", "M95,140 Q110,130 125,140", "M90,135 Q110,155 130,135"]
                            : "M90,135 Q110,155 130,135"
                    }}
                    transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
                />

                {/* Cheeks */}
                <circle cx="70" cy="115" r="8" fill="#FFB7B2" opacity="0.6" />
                <circle cx="150" cy="115" r="8" fill="#FFB7B2" opacity="0.6" />

            </motion.svg>

            {/* Thought Bubble (optional, for typing) */}
            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-4 -right-4 bg-white p-2 rounded-full border-2 border-black shadow-lg"
                >
                    <div className="flex gap-1">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0 }} className="w-1 h-1 bg-black rounded-full" />
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 h-1 bg-black rounded-full" />
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 h-1 bg-black rounded-full" />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Jeffrey;
