import { motion } from 'framer-motion';
import { Leaf, Flame, Package } from 'lucide-react';
import type { MenuItem, DietaryOption } from '@/types';

interface MenuBookItemProps {
  item: MenuItem;
  accentColor?: string;
  variant?: 'standard' | 'compact' | 'featured';
}

const dietaryIcons: Record<DietaryOption, typeof Leaf> = {
  'Vegetarian': Leaf,
  'Vegan': Leaf,
  'Gluten-Free': Package,
  'Dairy-Free': Package,
  'Nut-Free': Package,
  'Spicy': Flame,
};

/**
 * MenuBookItem Component
 *
 * Displays a single menu item with image, description, price, and dietary info.
 * Supports different variants for layout flexibility.
 */
export function MenuBookItem({
  item,
  accentColor = '#C85A54',
  variant = 'standard',
}: MenuBookItemProps) {
  const imageSize = variant === 'featured' ? 'w-40 h-40' : variant === 'compact' ? 'w-20 h-20' : 'w-28 h-28';
  const spacing = variant === 'featured' ? 'gap-6' : variant === 'compact' ? 'gap-3' : 'gap-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div className={`flex ${spacing}`}>
        {/* Image */}
        {item.generatedImages && item.generatedImages.length > 0 && (
          <div className={`${imageSize} flex-shrink-0 rounded-lg overflow-hidden shadow-md`}>
            <img
              src={item.generatedImages[0]}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Price */}
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h4
              className={`font-semibold flex-1 text-charcoal ${
                variant === 'featured' ? 'text-xl' : variant === 'compact' ? 'text-sm' : 'text-base'
              }`}
            >
              {item.name}
            </h4>
            {item.price && (
              <span
                className={`font-bold whitespace-nowrap ${
                  variant === 'featured' ? 'text-lg' : 'text-base'
                }`}
                style={{ color: accentColor }}
              >
                AED {parseFloat(item.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && variant !== 'compact' && (
            <p
              className={`text-gray-600 leading-relaxed mb-2 ${
                variant === 'featured' ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
              }`}
            >
              {item.description}
            </p>
          )}

          {/* Dietary Info */}
          {item.dietaryInfo && item.dietaryInfo.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.dietaryInfo.map((dietary) => {
                const Icon = dietaryIcons[dietary] || Package;
                return (
                  <span
                    key={dietary}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                    title={dietary}
                  >
                    <Icon className="w-3 h-3" />
                    {dietary}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
