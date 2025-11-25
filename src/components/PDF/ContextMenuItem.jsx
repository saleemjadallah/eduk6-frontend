import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContextMenuItem = ({
    id,
    emoji,
    label,
    description,
    color,
    handler,
    delay = 0,
    disabled = false,
    disabledReason = null,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (disabled) return;
        setIsLoading(true);
        try {
            await handler();
        } catch (error) {
            console.error(`Error executing ${id} action:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={!disabled ? { scale: 1.02, x: 4 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`
                w-full flex items-center gap-3 p-3 rounded-xl
                border-2 border-black ${color}
                ${!disabled ? 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-50 cursor-not-allowed'}
                active:shadow-none active:translate-x-1 active:translate-y-1
                transition-all duration-200
                disabled:cursor-wait
                mb-2 last:mb-0
                context-menu-item
            `}
            title={disabledReason || ''}
        >
            {/* Emoji for visual appeal */}
            <span className="text-2xl">{emoji}</span>

            {/* Text content */}
            <div className="flex-1 text-left">
                <span className="block font-bold text-sm">{label}</span>
                <span className="block text-xs text-gray-700 opacity-80">
                    {disabledReason || description}
                </span>
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="text-lg"
                >
                    ⏳
                </motion.span>
            )}
        </motion.button>
    );
};

export default ContextMenuItem;
