import React from 'react';
import { motion } from 'framer-motion';

const Jeffrey = ({ isTyping = false, size = 'default' }) => {
  // Size variants
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32',
  };

  // Bounce animation
  const bounceTransition = {
    y: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  };

  return (
    <div className={`relative ${sizeClasses[size] || sizeClasses.default} flex items-center justify-center`}>
      <motion.div
        className="w-full h-full"
        animate={{ y: [-3, 3] }}
        transition={bounceTransition}
      >
        <img
          src="/assets/images/jeffrey-avatar.png"
          alt="Jeffrey"
          className="w-full h-full object-cover rounded-full border-4 border-black shadow-lg"
        />
      </motion.div>

      {/* Typing indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border-2 border-black shadow-md"
        >
          <div className="flex gap-0.5">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
              className="w-1.5 h-1.5 bg-nanobanana-blue rounded-full"
            />
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
              className="w-1.5 h-1.5 bg-nanobanana-blue rounded-full"
            />
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
              className="w-1.5 h-1.5 bg-nanobanana-blue rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Jeffrey;
