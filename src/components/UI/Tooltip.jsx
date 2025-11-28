import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip - A fun, nanobanana-styled tooltip component
 * Displays on hover with smooth animations
 */
const Tooltip = ({
    children,
    content,
    title,
    position = 'bottom',
    delay = 200
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top':
                return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
            case 'bottom':
                return 'top-full left-1/2 -translate-x-1/2 mt-2';
            case 'left':
                return 'right-full top-1/2 -translate-y-1/2 mr-2';
            case 'right':
                return 'left-full top-1/2 -translate-y-1/2 ml-2';
            default:
                return 'top-full left-1/2 -translate-x-1/2 mt-2';
        }
    };

    const getArrowStyles = () => {
        switch (position) {
            case 'top':
                return 'top-full left-1/2 -translate-x-1/2 border-t-black border-x-transparent border-b-transparent';
            case 'bottom':
                return 'bottom-full left-1/2 -translate-x-1/2 border-b-black border-x-transparent border-t-transparent';
            case 'left':
                return 'left-full top-1/2 -translate-y-1/2 border-l-black border-y-transparent border-r-transparent';
            case 'right':
                return 'right-full top-1/2 -translate-y-1/2 border-r-black border-y-transparent border-l-transparent';
            default:
                return 'bottom-full left-1/2 -translate-x-1/2 border-b-black border-x-transparent border-t-transparent';
        }
    };

    const getAnimationProps = () => {
        switch (position) {
            case 'top':
                return { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } };
            case 'bottom':
                return { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } };
            case 'left':
                return { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } };
            case 'right':
                return { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } };
            default:
                return { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } };
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`absolute z-50 ${getPositionStyles()}`}
                        {...getAnimationProps()}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="relative">
                            {/* Arrow */}
                            <div
                                className={`absolute w-0 h-0 border-[6px] ${getArrowStyles()}`}
                            />

                            {/* Content */}
                            <div className="bg-white px-3 py-2 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap min-w-max">
                                {title && (
                                    <p className="font-bold text-sm text-gray-800 mb-0.5">
                                        {title}
                                    </p>
                                )}
                                <p className="text-xs text-gray-600">
                                    {content}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
