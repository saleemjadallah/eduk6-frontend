import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { COVER_COLORS, COVER_PATTERNS, STICKERS } from '../../constants/notebookConstants';

/**
 * CoverCustomizer - UI for customizing notebook cover
 * Allows selection of color, pattern, and stickers
 */
const CoverCustomizer = ({
  color,
  pattern,
  stickers = [],
  onColorChange,
  onPatternChange,
  onStickersChange,
}) => {
  // Toggle sticker selection (max 4)
  const toggleSticker = (stickerId) => {
    if (stickers.includes(stickerId)) {
      onStickersChange(stickers.filter((s) => s !== stickerId));
    } else if (stickers.length < 4) {
      onStickersChange([...stickers, stickerId]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
      {/* Color selection */}
      <div>
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <span>🎨</span> Cover Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((colorOption) => (
            <motion.button
              key={colorOption.value}
              type="button"
              className="relative w-10 h-10 rounded-full border-3 border-black transition-transform"
              style={{ backgroundColor: colorOption.value }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onColorChange(colorOption.value)}
              title={colorOption.label}
            >
              {color === colorOption.value && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check size={20} className="text-black drop-shadow-lg" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pattern selection */}
      <div>
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <span>✨</span> Pattern
        </h4>
        <div className="flex flex-wrap gap-2">
          {COVER_PATTERNS.map((patternOption) => (
            <motion.button
              key={patternOption.value}
              type="button"
              className={`px-3 py-2 rounded-lg border-2 border-black text-sm font-medium transition-colors ${
                pattern === patternOption.value
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              }`}
              style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPatternChange(patternOption.value)}
            >
              {patternOption.icon} {patternOption.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sticker selection */}
      <div>
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <span>🏷️</span> Stickers
          <span className="text-xs font-normal text-gray-500">(Choose up to 4)</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {STICKERS.map((sticker) => {
            const isSelected = stickers.includes(sticker.id);
            const isDisabled = !isSelected && stickers.length >= 4;

            return (
              <motion.button
                key={sticker.id}
                type="button"
                className={`p-2 text-xl rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-black bg-yellow-100'
                    : isDisabled
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-black bg-white'
                }`}
                style={{
                  boxShadow: isSelected ? '2px 2px 0px rgba(0,0,0,1)' : 'none',
                }}
                whileHover={!isDisabled ? { scale: 1.1 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                onClick={() => !isDisabled && toggleSticker(sticker.id)}
                title={sticker.label}
                disabled={isDisabled}
              >
                {sticker.emoji}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoverCustomizer;
