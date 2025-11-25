import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Play a sound effect (if available)
 */
const playSound = (soundType) => {
    // Sound effects can be added here
    // For now, just console log
    console.log(`Playing sound: ${soundType}`);
};

/**
 * MenuButton - A child-friendly button for the context menu
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji icon
 * @param {string} props.label - Button label
 * @param {string} props.color - Background color
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 */
const MenuButton = ({
    icon,
    label,
    color,
    onClick,
    disabled = false,
    loading = false,
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = useCallback(() => {
        if (disabled || loading) return;

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Visual feedback
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);

        // Play sound effect
        playSound('button-tap');

        onClick?.();
    }, [disabled, loading, onClick]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    return (
        <motion.button
            className={`menu-button ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
            style={{
                backgroundColor: color,
                opacity: disabled ? 0.6 : 1,
            }}
            whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-disabled={disabled}
        >
            <span className="menu-button-icon" aria-hidden="true">
                {loading ? (
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block' }}
                    >
                        \u23f3
                    </motion.span>
                ) : (
                    icon
                )}
            </span>
            <span className="menu-button-label">{label}</span>

            {/* Ripple effect */}
            {isPressed && (
                <motion.span
                    className="ripple"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: 'inherit',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </motion.button>
    );
};

export default MenuButton;
