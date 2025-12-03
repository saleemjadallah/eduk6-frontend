import React from 'react';
import { motion } from 'framer-motion';
import { COVER_PATTERNS, STICKERS } from '../../constants/notebookConstants';

/**
 * NotebookCover - Animated decorative notebook cover
 * Features child's name, avatar, patterns, and stickers
 */
const NotebookCover = ({
  isOpen = false,
  childName = 'My',
  avatarUrl,
  coverColor = '#FFD93D',
  coverPattern = 'dots',
  coverStickers = [],
  onClick,
}) => {
  // Generate pattern styles based on pattern type
  const getPatternStyles = (pattern) => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)`,
          backgroundSize: '20px 20px',
        };
      case 'lines':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 12px)`,
        };
      case 'stars':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        };
      case 'hearts':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E")`,
          backgroundSize: '48px 48px',
        };
      case 'waves':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-7.604-2.751C66.892 13.617 60.157 12 50 12c-10.271 0-16.182 1.754-25.871 5.969l-1.778.664C15.68 20.86 8.937 23.26.177 24.548H0c6.68-.61 12.844-2.32 18.958-4.533H21.184z' fill='rgba(255,255,255,0.15)'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 20px',
        };
      case 'confetti':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='5' width='4' height='8' fill='rgba(255,255,255,0.25)' transform='rotate(15 12 9)'/%3E%3Crect x='45' y='15' width='3' height='6' fill='rgba(255,255,255,0.2)' transform='rotate(-20 46.5 18)'/%3E%3Crect x='25' y='40' width='4' height='8' fill='rgba(255,255,255,0.3)' transform='rotate(45 27 44)'/%3E%3Ccircle cx='50' cy='45' r='2' fill='rgba(255,255,255,0.25)'/%3E%3Ccircle cx='15' cy='50' r='2.5' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        };
      default:
        return {};
    }
  };

  // Get sticker emoji by ID
  const getStickerEmoji = (stickerId) => {
    const sticker = STICKERS.find((s) => s.id === stickerId);
    return sticker?.emoji || '';
  };

  // Darken color for shadows
  const getDarkerColor = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
  };

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{
        width: '280px',
        height: '360px',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
      onClick={onClick}
    >
      {/* Notebook spine shadow */}
      <div
        className="absolute left-0 top-2 bottom-2 w-4 rounded-l-lg"
        style={{
          background: getDarkerColor(coverColor),
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2)',
        }}
      />

      {/* Main cover */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          backgroundColor: coverColor,
          border: '4px solid #000',
          boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        animate={isOpen ? { rotateY: -160 } : { rotateY: 0 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 100,
          delay: isOpen ? 0.1 : 0,
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={getPatternStyles(coverPattern)}
        />

        {/* Spiral binding */}
        <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-around">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="relative"
              style={{
                width: '20px',
                height: '14px',
              }}
            >
              <div
                className="absolute"
                style={{
                  width: '16px',
                  height: '14px',
                  border: '3px solid #333',
                  borderRadius: '50%',
                  background: '#f5f5f5',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Cover content */}
        <div className="absolute inset-0 pl-10 pr-4 py-6 flex flex-col items-center justify-center">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full border-4 border-black mb-4 overflow-hidden flex items-center justify-center"
            style={{
              background: avatarUrl ? 'transparent' : 'white',
              boxShadow: '3px 3px 0px rgba(0,0,0,1)',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={childName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">📓</span>
            )}
          </div>

          {/* Child's name */}
          <div className="text-center">
            <span
              className="text-2xl font-bold block"
              style={{
                fontFamily: '"Comic Neue", cursive',
                color: '#000',
                textShadow: '2px 2px 0px rgba(255,255,255,0.5)',
              }}
            >
              {childName}'s
            </span>
            <span
              className="text-3xl font-black block mt-1"
              style={{
                fontFamily: '"Comic Neue", cursive',
                color: '#000',
                textShadow: '2px 2px 0px rgba(255,255,255,0.5)',
              }}
            >
              Notebook
            </span>
          </div>

          {/* Decorative line */}
          <div
            className="w-32 h-1 mt-4 rounded-full"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          />

          {/* Stickers */}
          {coverStickers.length > 0 && (
            <div className="absolute bottom-4 right-4 flex gap-1">
              {coverStickers.slice(0, 4).map((stickerId, index) => (
                <motion.span
                  key={stickerId}
                  className="text-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  {getStickerEmoji(stickerId)}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Cover shine effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />
      </motion.div>

      {/* Back cover (visible when open) */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: getDarkerColor(coverColor),
          border: '4px solid #000',
          zIndex: -1,
        }}
      />

      {/* Tap hint */}
      {!isOpen && (
        <motion.div
          className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Tap to open
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotebookCover;
