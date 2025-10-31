import { ChevronLeft, ChevronRight, List, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuBookControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggleView?: () => void;
  viewMode?: 'book' | 'list';
  disabled?: boolean;
}

/**
 * MenuBookControls Component
 *
 * Provides navigation controls for the menu book.
 * Includes previous/next buttons, page indicator, and optional view toggle.
 */
export function MenuBookControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onToggleView,
  viewMode = 'book',
  disabled = false,
}: MenuBookControlsProps) {
  const hasPrevious = currentPage > 0;
  const hasNext = currentPage < totalPages;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="flex items-center gap-3 px-6 py-3 bg-charcoal/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious || disabled}
          className="p-2 rounded-full text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Indicator */}
        <div className="px-4 py-1 text-sm font-medium text-white">
          {currentPage === 0 ? (
            <span>Cover</span>
          ) : (
            <span>
              Page {currentPage} <span className="text-white/60">of {totalPages}</span>
            </span>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!hasNext || disabled}
          className="p-2 rounded-full text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* View Toggle (Optional) */}
        {onToggleView && (
          <>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <button
              onClick={onToggleView}
              className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
              aria-label={`Switch to ${viewMode === 'book' ? 'list' : 'book'} view`}
              title={`Switch to ${viewMode === 'book' ? 'list' : 'book'} view`}
            >
              {viewMode === 'book' ? <List className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>

      {/* Keyboard Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="mt-3 text-center text-xs text-gray-500"
      >
        <span className="hidden md:inline">Use arrow keys to navigate</span>
      </motion.div>
    </motion.div>
  );
}
