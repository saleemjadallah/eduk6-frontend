import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MenuBookCover } from './MenuBookCover';
import { MenuBookPage } from './MenuBookPage';
import { MenuBookControls } from './MenuBookControls';
import { useMenuPagination } from '@/hooks/useMenuPagination';
import type { MenuItem, EstablishmentSettings } from '@/types';

interface MenuBookProps {
  menuItems: MenuItem[];
  settings: EstablishmentSettings;
  onToggleView?: () => void;
  enableAnimations?: boolean;
}

/**
 * MenuBook Component
 *
 * Main container for the interactive menu book experience.
 * Manages state for pagination, page turns, and keyboard navigation.
 */
export function MenuBook({
  menuItems,
  settings,
  onToggleView,
  enableAnimations = true,
}: MenuBookProps) {
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);

  // Paginate menu items
  const { pages, totalPages } = useMenuPagination({
    menuItems,
    itemsPerPage: settings.itemsPerPage,
    maintainCategoryOrder: true,
  });

  // Handle page navigation
  const navigateToPage = useCallback(
    (newPage: number) => {
      if (isAnimating || newPage < 0 || newPage > totalPages) return;

      setIsAnimating(true);
      setDirection(newPage > currentPage ? 'forward' : 'backward');
      setCurrentPage(newPage);

      // Reset animation lock after animation completes
      setTimeout(() => setIsAnimating(false), 600);
    },
    [currentPage, totalPages, isAnimating]
  );

  const handleOpenCover = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      // Automatically go to first page after cover opens
      setTimeout(() => navigateToPage(1), 700);
    }
  }, [isOpen, navigateToPage]);

  const handlePrevious = useCallback(() => {
    if (currentPage === 1) {
      // Go back to cover
      navigateToPage(0);
      setIsOpen(false);
    } else if (currentPage > 0) {
      navigateToPage(currentPage - 1);
    }
  }, [currentPage, navigateToPage]);

  const handleNext = useCallback(() => {
    if (currentPage === 0) {
      handleOpenCover();
    } else if (currentPage < totalPages) {
      navigateToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, navigateToPage, handleOpenCover]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToPage(0);
        setIsOpen(false);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToPage(totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, navigateToPage, totalPages]);

  return (
    <div className="menu-book-container relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4 md:p-8">
      {/* Menu Book */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="menu-book relative w-full max-w-4xl aspect-[3/4] md:aspect-[4/3]"
        style={{
          perspective: '2000px',
        }}
      >
        {/* Book Container with 3D context */}
        <div className="relative w-full h-full shadow-2xl rounded-lg">
          {/* Cover */}
          <MenuBookCover settings={settings} onOpen={handleOpenCover} isOpen={isOpen} />

          {/* Pages */}
          {isOpen &&
            pages.map((page) => (
              <MenuBookPage
                key={page.pageNumber}
                page={page}
                settings={settings}
                isActive={currentPage === page.pageNumber}
                direction={direction}
              />
            ))}
        </div>
      </motion.div>

      {/* Controls */}
      <MenuBookControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToggleView={onToggleView}
        viewMode="book"
        disabled={isAnimating}
      />

      {/* Loading State for Empty Menu */}
      {pages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">No menu items available</p>
            <p className="text-sm text-gray-500">Add some dishes to see your menu book!</p>
          </div>
        </div>
      )}
    </div>
  );
}
