import React from 'react';
import { motion } from 'framer-motion';

const Jeffrey = () => {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div
                className="w-24 h-24 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden"
                animate={{
                    y: [0, -5, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Face */}
                <div className="relative w-full h-full">
                    {/* Eyes */}
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-black rounded-full animate-blink"></div>
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-black rounded-full animate-blink"></div>

                    {/* Smile */}
                    <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-4 border-black rounded-full"></div>

                    {/* Cheeks */}
                    <div className="absolute top-1/2 left-2 w-2 h-2 bg-pink-400 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 right-2 w-2 h-2 bg-pink-400 rounded-full opacity-50"></div>
                </div>
            </motion.div>

            {/* Name Tag */}
            <div className="absolute -bottom-2 bg-white px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-comic font-bold text-xs transform -rotate-3">
                Jeffrey
            </div>
        </div>
    );
};

export default Jeffrey;
