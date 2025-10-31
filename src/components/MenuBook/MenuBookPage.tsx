import { motion, AnimatePresence } from 'framer-motion';
import { MenuBookItem } from './MenuBookItem';
import { Coffee, Soup, Salad, UtensilsCrossed, Package, Cookie, Apple } from 'lucide-react';
import type { MenuPage, EstablishmentSettings, MenuCategory } from '@/types';

interface MenuBookPageProps {
  page: MenuPage;
  settings: EstablishmentSettings;
  isActive: boolean;
  direction: 'forward' | 'backward';
}

const categoryIcons: Record<MenuCategory, any> = {
  'Appetizers': Apple,
  'Soups': Soup,
  'Salads': Salad,
  'Mains': UtensilsCrossed,
  'Sides': Package,
  'Desserts': Cookie,
  'Beverages': Coffee,
};

const pageVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    rotateY: direction === 'forward' ? 180 : -180,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: (direction: 'forward' | 'backward') => ({
    rotateY: direction === 'forward' ? -180 : 180,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

/**
 * MenuBookPage Component
 *
 * Displays a single page of menu items with page-turn animation.
 * Handles content layout and pagination display.
 */
export function MenuBookPage({ page, settings, isActive, direction }: MenuBookPageProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={page.pageNumber}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 bg-cream"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Page Content */}
          <div className="h-full flex flex-col p-8 md:p-12">
            {/* Optional Header - Establishment Name */}
            {settings.showEstablishmentOnEveryPage && (
              <div className="mb-6 text-center border-b border-gray-300 pb-4">
                <h2
                  className={`text-lg font-semibold text-charcoal ${
                    settings.fontFamily === 'serif'
                      ? 'font-serif'
                      : settings.fontFamily === 'sans-serif'
                      ? 'font-sans'
                      : 'font-display'
                  }`}
                >
                  {settings.establishmentName}
                </h2>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {(() => {
                // Group items by category
                const itemsByCategory: Record<string, typeof page.items> = {};
                page.items.forEach(item => {
                  const category = item.category || 'Mains';
                  if (!itemsByCategory[category]) {
                    itemsByCategory[category] = [];
                  }
                  itemsByCategory[category].push(item);
                });

                return Object.entries(itemsByCategory).map(([category, items], categoryIdx) => {
                  const Icon = categoryIcons[category as MenuCategory] || UtensilsCrossed;
                  return (
                    <div key={category} className={categoryIdx > 0 ? 'pt-4' : ''}>
                      {/* Category Header */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: settings.accentColor }}>
                        <Icon className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h3 className="text-lg font-semibold text-charcoal">{category}</h3>
                      </div>

                      {/* Items in Category */}
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={item.id}>
                            <MenuBookItem item={item} accentColor={settings.accentColor} variant="compact" />
                            {/* Divider between items */}
                            {index < items.length - 1 && (
                              <div className="mt-3 border-b border-dashed border-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Page Number */}
            {settings.showPageNumbers && (
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-500">{page.pageNumber}</span>
              </div>
            )}
          </div>

          {/* Page Shadow/Texture */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle paper texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii45IiBudW1PY3RhdmVzPSI0Ii8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMjAwdjIwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] bg-repeat opacity-30" />
            {/* Spine shadow for left pages */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent" />
            {/* Edge shadow for right pages */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
