import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Flame, Package, Image as ImageIcon, Coffee, Soup, Salad, UtensilsCrossed, Cookie, Apple } from 'lucide-react';
import { api } from '@/lib/api';
import type { DietaryOption, MenuCategory } from '@/types';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  dietaryInfo: DietaryOption[] | null;
  allergens: string[] | null;
  generatedImages: string[] | null;
  displayOrder: number;
  isAvailable: boolean;
}

export function PublicMenuPage() {
  const { userId } = useParams<{ userId: string }>();
  const [menuByCategory, setMenuByCategory] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userId) {
        setError('Invalid menu link');
        setLoading(false);
        return;
      }

      try {
        const data = await api.getPublicMenu(userId);
        setMenuByCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [userId]);

  const categoryIcons: Record<MenuCategory, any> = {
    'Appetizers': Apple,
    'Soups': Soup,
    'Salads': Salad,
    'Mains': UtensilsCrossed,
    'Sides': Package,
    'Desserts': Cookie,
    'Beverages': Coffee,
  };

  const dietaryIcons: Record<DietaryOption, any> = {
    'Vegetarian': Leaf,
    'Vegan': Leaf,
    'Gluten-Free': Package,
    'Dairy-Free': Package,
    'Nut-Free': Package,
    'Spicy': Flame,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const hasItems = Object.values(menuByCategory).some((items) => items.length > 0);

  if (!hasItems) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Menu Items</h1>
          <p className="text-gray-600">This menu is currently empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-charcoal mb-4">Menu</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-saffron-600 to-saffron-400 mx-auto rounded-full" />
        </motion.div>

        {/* Categories */}
        <div className="space-y-16">
          {Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {(() => {
                    const Icon = categoryIcons[category as MenuCategory] || UtensilsCrossed;
                    return <Icon className="w-8 h-8 text-saffron-600" />;
                  })()}
                  <h2 className="text-3xl font-serif font-bold text-charcoal">{category}</h2>
                </div>
                <div className="w-16 h-0.5 bg-saffron-600 mx-auto" />
              </div>

              {/* Menu Items */}
              <div className="space-y-8">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      {item.generatedImages && item.generatedImages.length > 0 && (
                        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                          <img
                            src={item.generatedImages[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Price */}
                        <div className="flex items-baseline justify-between gap-4 mb-2">
                          <h3 className="text-xl font-semibold flex-1 text-charcoal">
                            {item.name}
                          </h3>
                          {item.price && (
                            <span className="text-lg font-bold whitespace-nowrap text-saffron-700">
                              AED {parseFloat(item.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-gray-600 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        )}

                        {/* Dietary Info */}
                        {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.dietaryInfo.map((dietary) => {
                              const Icon = dietaryIcons[dietary] || Package;
                              return (
                                <span
                                  key={dietary}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
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

                    {/* Divider */}
                    {index < items.length - 1 && (
                      <div className="mt-6 border-b border-dashed border-gray-300" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 text-center text-sm text-gray-500"
        >
          <p>Menu powered by AI food photography</p>
        </motion.div>
      </div>
    </div>
  );
}
