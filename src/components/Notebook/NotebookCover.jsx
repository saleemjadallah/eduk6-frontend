import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Heart, Sparkles } from 'lucide-react';
import { COVER_PATTERNS, STICKERS } from '../../constants/notebookConstants';

/**
 * NotebookCover - Playful animated notebook cover with 3D flip effect
 * Features child's name, avatar, patterns, stickers, and decorative elements
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
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 3px, transparent 3px)`,
          backgroundSize: '24px 24px',
        };
      case 'lines':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.25) 12px, rgba(255,255,255,0.25) 14px)`,
        };
      case 'stars':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z' fill='rgba(255,255,255,0.25)'/%3E%3C/svg%3E")`,
          backgroundSize: '48px 48px',
        };
      case 'hearts':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 24.35l-1.45-1.32C6.4 17.36 3 14.28 3 10.5 3 7.42 5.42 5 8.5 5c1.74 0 3.41.81 4.5 2.09C14.09 5.81 15.76 5 17.5 5 20.58 5 23 7.42 23 10.5c0 3.78-3.4 6.86-8.55 11.54L14 24.35z' fill='rgba(255,255,255,0.25)'/%3E%3C/svg%3E")`,
          backgroundSize: '56px 56px',
        };
      case 'waves':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='24' viewBox='0 0 120 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12c10 0 10-8 20-8s10 8 20 8 10-8 20-8 10 8 20 8 10-8 20-8 10 8 20 8' stroke='rgba(255,255,255,0.2)' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 24px',
        };
      case 'confetti':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='15' y='8' width='6' height='12' fill='rgba(255,255,255,0.3)' transform='rotate(25 18 14)'/%3E%3Crect x='55' y='20' width='5' height='10' fill='rgba(255,255,255,0.25)' transform='rotate(-15 57.5 25)'/%3E%3Crect x='30' y='55' width='6' height='12' fill='rgba(255,255,255,0.35)' transform='rotate(40 33 61)'/%3E%3Ccircle cx='65' cy='60' r='4' fill='rgba(255,255,255,0.3)'/%3E%3Ccircle cx='20' cy='65' r='5' fill='rgba(255,255,255,0.25)'/%3E%3Ccircle cx='70' cy='15' r='3' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
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
    return `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
  };

  // Lighten color for highlights
  const getLighterColor = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
  };

  // Get avatar emoji from URL
  const getAvatarEmoji = () => {
    if (avatarUrl && avatarUrl.startsWith('avatar_')) {
      const avatarMap = {
        avatar_1: '🐱', avatar_2: '🐶', avatar_3: '🦉', avatar_4: '🦁',
        avatar_5: '🐼', avatar_6: '🐰', avatar_7: '🐧', avatar_8: '🐘',
      };
      return avatarMap[avatarUrl] || '📚';
    }
    return null;
  };

  const avatarEmoji = getAvatarEmoji();

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{
        width: '300px',
        height: '400px',
        perspective: '1500px',
        transformStyle: 'preserve-3d',
      }}
      onClick={onClick}
      whileHover={!isOpen ? { scale: 1.02 } : {}}
    >
      {/* Background pages effect (visible behind) */}
      <div
        className="absolute rounded-r-lg"
        style={{
          left: '20px',
          top: '8px',
          right: '-4px',
          bottom: '-4px',
          background: '#f8f5e6',
          border: '3px solid #000',
          zIndex: -2,
        }}
      />
      <div
        className="absolute rounded-r-lg"
        style={{
          left: '20px',
          top: '4px',
          right: '-2px',
          bottom: '-2px',
          background: '#faf7ea',
          border: '3px solid #000',
          zIndex: -1,
        }}
      />

      {/* Notebook spine */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6 rounded-l-xl"
        style={{
          background: `linear-gradient(to right, ${getDarkerColor(coverColor)}, ${coverColor})`,
          borderLeft: '4px solid #000',
          borderTop: '4px solid #000',
          borderBottom: '4px solid #000',
          zIndex: 5,
        }}
      >
        {/* Spine ridges */}
        <div className="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-around">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1 mx-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.15)' }}
            />
          ))}
        </div>
      </div>

      {/* Main cover with 3D flip */}
      <motion.div
        className="absolute rounded-r-2xl overflow-hidden"
        style={{
          left: '20px',
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: coverColor,
          border: '4px solid #000',
          boxShadow: isOpen
            ? '-8px 8px 0px 0px rgba(0,0,0,0.9)'
            : '8px 8px 0px 0px rgba(0,0,0,1)',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        animate={isOpen ? { rotateY: -165 } : { rotateY: 0 }}
        transition={{
          type: 'spring',
          damping: 18,
          stiffness: 80,
          delay: isOpen ? 0.1 : 0,
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={getPatternStyles(coverPattern)}
        />

        {/* Gradient overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${getLighterColor(coverColor)} 0%, transparent 30%, transparent 70%, ${getDarkerColor(coverColor)} 100%)`,
            opacity: 0.4,
          }}
        />

        {/* Spiral binding */}
        <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-around items-center z-10">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300 }}
            >
              <div
                className="relative"
                style={{
                  width: '22px',
                  height: '18px',
                }}
              >
                {/* Ring outer */}
                <div
                  className="absolute"
                  style={{
                    width: '20px',
                    height: '18px',
                    border: '4px solid #2a2a2a',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #e8e8e8 0%, #c0c0c0 50%, #d8d8d8 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ribbon bookmark */}
        <motion.div
          className="absolute top-0 right-8 w-6 z-20"
          style={{
            height: '80px',
            background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        />

        {/* Cover content */}
        <div className="absolute inset-0 pl-12 pr-6 py-8 flex flex-col items-center justify-center">
          {/* Decorative corner flourishes */}
          <div className="absolute top-4 right-4 text-2xl opacity-60">✨</div>
          <div className="absolute bottom-4 left-12 text-2xl opacity-60">⭐</div>

          {/* Avatar with decorative frame */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
          >
            {/* Decorative ring behind avatar */}
            <div
              className="absolute -inset-3 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${getLighterColor(coverColor)}, white, ${coverColor}, white, ${getLighterColor(coverColor)})`,
                opacity: 0.6,
              }}
            />
            <div
              className="relative w-24 h-24 rounded-full border-4 border-black overflow-hidden flex items-center justify-center"
              style={{
                background: avatarEmoji || avatarUrl ? 'white' : `linear-gradient(135deg, ${getLighterColor(coverColor)}, white)`,
                boxShadow: '4px 4px 0px rgba(0,0,0,1), inset 0 -4px 8px rgba(0,0,0,0.1)',
              }}
            >
              {avatarEmoji ? (
                <span className="text-5xl">{avatarEmoji}</span>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={childName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">📓</span>
              )}
            </div>
            {/* Sparkle decorations */}
            <motion.div
              className="absolute -top-2 -right-2 text-xl"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </motion.div>

          {/* Child's name with playful typography */}
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Name banner */}
            <div
              className="relative px-6 py-2 mb-2 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '3px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,1)',
              }}
            >
              <span
                className="text-2xl font-black"
                style={{
                  fontFamily: '"Comic Neue", cursive',
                  color: '#000',
                }}
              >
                {childName}'s
              </span>
            </div>

            {/* "Notebook" text with fun styling */}
            <div className="relative">
              <span
                className="text-4xl font-black block"
                style={{
                  fontFamily: '"Comic Neue", cursive',
                  color: '#000',
                  textShadow: '3px 3px 0px rgba(255,255,255,0.8), 5px 5px 0px rgba(0,0,0,0.2)',
                  letterSpacing: '2px',
                }}
              >
                NOTEBOOK
              </span>
              {/* Underline decoration */}
              <motion.div
                className="h-2 mx-auto mt-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent)',
                  width: '80%',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6 }}
              />
            </div>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            className="flex items-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="w-8 h-0.5 bg-black/20 rounded-full" />
            <Star size={14} className="text-black/40" fill="currentColor" />
            <div className="w-8 h-0.5 bg-black/20 rounded-full" />
          </motion.div>

          {/* Stickers area */}
          {coverStickers.length > 0 && (
            <div className="absolute bottom-6 right-6 flex flex-wrap gap-1 max-w-[100px] justify-end">
              {coverStickers.slice(0, 5).map((stickerId, index) => (
                <motion.span
                  key={stickerId}
                  className="text-3xl drop-shadow-md"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: (index - 2) * 8 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.2, rotate: 0 }}
                >
                  {getStickerEmoji(stickerId)}
                </motion.span>
              ))}
            </div>
          )}

          {/* Default stickers if none selected */}
          {coverStickers.length === 0 && (
            <div className="absolute bottom-6 right-6 flex gap-2">
              <motion.span
                className="text-2xl opacity-40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                📝
              </motion.span>
              <motion.span
                className="text-2xl opacity-40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                ✏️
              </motion.span>
            </div>
          )}
        </div>

        {/* Cover shine effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Edge highlight */}
        <div
          className="absolute top-0 left-8 right-0 h-1 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          }}
        />
      </motion.div>

      {/* Tap hint with animation */}
      {!isOpen && (
        <motion.div
          className="absolute -bottom-10 left-0 right-0 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full text-sm font-bold text-gray-600 border-2 border-black"
            style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <BookOpen size={16} />
            Tap to open
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotebookCover;
