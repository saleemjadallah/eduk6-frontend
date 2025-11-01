import { motion } from 'framer-motion';
import type { EstablishmentSettings } from '@/types';

interface MenuBookCoverProps {
  settings: EstablishmentSettings;
  onOpen: () => void;
  isOpen: boolean;
}

const coverVariants = {
  closed: {
    rotateY: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },
  open: {
    rotateY: -160,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

/**
 * MenuBookCover Component
 *
 * Displays the cover page of the menu book with establishment branding.
 * Animates with 3D rotation when opened.
 */
export function MenuBookCover({ settings, onOpen, isOpen }: MenuBookCoverProps) {
  // Convert hex color to RGB for gradient generation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 200, g: 90, b: 84 }; // Default to saffron if parse fails
  };

  const rgb = hexToRgb(settings.accentColor);

  // Create gradient background based on accent color
  const coverGradient = `linear-gradient(135deg,
    rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1) 0%,
    rgba(${rgb.r * 0.8}, ${rgb.g * 0.8}, ${rgb.b * 0.8}, 1) 50%,
    rgba(${rgb.r * 0.6}, ${rgb.g * 0.6}, ${rgb.b * 0.6}, 1) 100%)`;

  return (
    <motion.div
      className="menu-book-cover absolute inset-0 z-20"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        backfaceVisibility: 'hidden',
      }}
      variants={coverVariants}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
    >
      <button
        onClick={onOpen}
        disabled={isOpen}
        className="relative w-full h-full cursor-pointer disabled:cursor-default overflow-hidden shadow-2xl rounded-r-lg group"
        style={{ background: coverGradient }}
        aria-label="Open menu"
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0YzAgMi0yIDQtMiA0cy0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-cream">
          {/* Logo */}
          {settings.logoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <img
                src={settings.logoUrl}
                alt={settings.establishmentName}
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </motion.div>
          )}

          {/* Establishment Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-5xl font-bold text-center mb-4 ${
              settings.fontFamily === 'serif'
                ? 'font-serif'
                : settings.fontFamily === 'sans-serif'
                ? 'font-sans'
                : 'font-display'
            }`}
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
          >
            {settings.establishmentName}
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cream to-transparent mb-4"
            style={{ originX: 0.5 }}
          />

          {/* Tagline */}
          {settings.tagline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={`text-lg italic text-center max-w-md ${
                settings.fontFamily === 'serif'
                  ? 'font-serif'
                  : settings.fontFamily === 'sans-serif'
                  ? 'font-sans'
                  : 'font-display'
              }`}
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.3)' }}
            >
              {settings.tagline}
            </motion.p>
          )}

          {/* Open Hint */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-8 text-sm text-cream/80 group-hover:text-cream transition-colors"
            >
              <span className="block text-center">Tap to Open</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-2 text-center"
              >
                ↓
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Spine Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />
      </button>
    </motion.div>
  );
}
