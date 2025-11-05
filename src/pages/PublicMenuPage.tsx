import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Flame, Package, Image as ImageIcon, Coffee, Soup, Salad, UtensilsCrossed, Cookie, Apple, BookOpen, List } from 'lucide-react';
import { api } from '@/lib/api';
import { MenuBook } from '@/components/MenuBook';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { DietaryOption, MenuCategory, MenuItem, EstablishmentSettings } from '@/types';

const CATEGORY_ORDER: MenuCategory[] = ['Appetizers', 'Soups', 'Salads', 'Mains', 'Sides', 'Desserts', 'Beverages'];
const DEFAULT_CATEGORY: MenuCategory = 'Mains';
const isValidCategory = (value: unknown): value is MenuCategory =>
  typeof value === 'string' && CATEGORY_ORDER.includes(value as MenuCategory);

export function PublicMenuPage() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuByCategory, setMenuByCategory] = useState<Record<MenuCategory, MenuItem[]>>(() =>
    CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<MenuCategory, MenuItem[]>)
  );
  const [establishmentSettings, setEstablishmentSettings] = useState<Partial<EstablishmentSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get view mode from URL params, default to 'book'
  const viewMode = (searchParams.get('view') as 'book' | 'list') || 'book';

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userId) {
        setError('Invalid menu link');
        setLoading(false);
        return;
      }

      try {
        // Fetch both menu items and establishment settings
        const [menuData, settings] = await Promise.all([
          api.getPublicMenu(userId),
          api.getPublicEstablishmentSettings(userId),
        ]);

        const sanitizedMenu = CATEGORY_ORDER.reduce((acc, category) => {
          acc[category] = [];
          return acc;
        }, {} as Record<MenuCategory, MenuItem[]>);

        (Object.entries(menuData) as Array<[string, MenuItem[]]>).forEach(([categoryKey, items]) => {
          const categoryKeyNormalized = isValidCategory(categoryKey) ? (categoryKey as MenuCategory) : DEFAULT_CATEGORY;

          items.forEach((item) => {
            const normalizedCategory = isValidCategory(item.category)
              ? item.category
              : isValidCategory(categoryKey)
              ? (categoryKey as MenuCategory)
              : categoryKeyNormalized;

            sanitizedMenu[normalizedCategory].push({
              ...item,
              category: normalizedCategory,
            } as MenuItem);
          });
        });

        setMenuByCategory(sanitizedMenu);
        setEstablishmentSettings(settings);

        // Flatten menu items for MenuBook component
        const allItems: MenuItem[] = [];
        Object.values(sanitizedMenu).forEach((items) => {
          allItems.push(...items);
        });
        setMenuItems(allItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [userId]);

  const handleToggleView = () => {
    const newView = viewMode === 'book' ? 'list' : 'book';
    setSearchParams({ view: newView });
  };

  const handleClose = () => {
    // If there's history, go back. Otherwise go to dashboard
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

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

  // Default establishment settings if none provided
  const defaultSettings: EstablishmentSettings = {
    id: '',
    userId: userId || '',
    establishmentName: 'Menu',
    tagline: null,
    logoUrl: null,
    coverStyle: 'classic',
    accentColor: '#C85A54',
    fontFamily: 'serif',
    itemsPerPage: 8,
    showPageNumbers: 1,
    showEstablishmentOnEveryPage: 0,
    createdAt: null,
    updatedAt: null,
  };

  const settings = { ...defaultSettings, ...establishmentSettings };

  // Show MenuBook view
  if (viewMode === 'book') {
    return (
      <>
        {/* View Toggle Button (Floating) */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleToggleView}
          className="fixed top-6 right-6 z-40 p-3 bg-charcoal text-white rounded-full shadow-2xl hover:bg-charcoal/90 transition-all"
          title="Switch to list view"
        >
          <List className="w-5 h-5" />
        </motion.button>

        <MenuBook
          menuItems={menuItems}
          settings={settings}
          onToggleView={handleToggleView}
          onClose={handleClose}
        />
      </>
    );
  }

  // Show traditional list view
  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      {/* View Toggle Button (Floating) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleToggleView}
        className="fixed top-6 right-6 z-40 p-3 bg-charcoal text-white rounded-full shadow-2xl hover:bg-charcoal/90 transition-all"
        title="Switch to book view"
      >
        <BookOpen className="w-5 h-5" />
      </motion.button>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-charcoal mb-4">
            {settings.establishmentName}
          </h1>
          {settings.tagline && (
            <p className="text-lg text-gray-600 italic mt-2">{settings.tagline}</p>
          )}
          <div className="w-24 h-1 bg-gradient-to-r from-saffron-600 to-saffron-400 mx-auto rounded-full mt-4" />
        </motion.div>

        {/* Categories */}
        <div className="space-y-16">
          {CATEGORY_ORDER.filter((category) => menuByCategory[category].length > 0).map((category, categoryIndex) => {
            const items = menuByCategory[category];
            return (
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
                                {formatPrice(parseFloat(item.price))}
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
            );
          })}
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
