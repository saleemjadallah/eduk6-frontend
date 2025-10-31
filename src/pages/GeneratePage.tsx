import { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Download,
  Check,
  Gift,
  ArrowUpRight,
  Maximize,
  Minus,
  Plus,
  X,
  Wand2,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { StyleOption, MenuCategory, DietaryOption } from '@/types';

const styles: { value: StyleOption; label: string; description: string; downloadOnly?: boolean }[] = [
  {
    value: 'Rustic/Dark',
    label: 'Rustic Dark',
    description: 'Moody lighting, warm tones',
  },
  {
    value: 'Bright/Modern',
    label: 'Bright Modern',
    description: 'Clean, minimalist aesthetic',
  },
  {
    value: 'Social Media',
    label: 'Social Media',
    description: 'Instagram-ready flat lay',
    downloadOnly: true,
  },
  {
    value: 'Delivery App',
    label: 'Delivery App',
    description: 'Optimized for mobile apps',
    downloadOnly: true,
  },
];

const variationLabels = ['Centered plating', 'Angled view', 'Close-up detail'];

export function GeneratePage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: usageInfo } = useQuery({
    queryKey: ['usage'],
    queryFn: () => api.getCurrentUsage(),
  });

  const { data: menuItem } = useQuery({
    queryKey: ['menuItem', editId],
    queryFn: () => editId ? api.getMenuItem(editId) : null,
    enabled: !!editId,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    style: 'Bright/Modern' as StyleOption,
    category: 'Mains' as MenuCategory,
    price: '',
    dietaryInfo: [] as DietaryOption[],
    allergens: [] as string[],
  });
  const [aiDescriptionLoading, setAiDescriptionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<boolean[]>([]);
  const [highResIndices, setHighResIndices] = useState<number[]>([]);
  const [highResLoading, setHighResLoading] = useState(false);
  const [highResMessage, setHighResMessage] = useState<string | null>(null);
  const [generatedStyle, setGeneratedStyle] = useState<StyleOption>('Bright/Modern');
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isDownloadOnly, setIsDownloadOnly] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [downloadTracked, setDownloadTracked] = useState(false);

  // Load existing menu item data when editing
  useEffect(() => {
    if (menuItem) {
      // Check if the selected style is download-only, if so default to 'Bright/Modern'
      const selectedStyle = (menuItem.selectedStyle as StyleOption) || 'Bright/Modern';
      const isDownloadOnly = selectedStyle === 'Social Media' || selectedStyle === 'Delivery App';

      setFormData({
        name: menuItem.name || '',
        description: menuItem.description || '',
        ingredients: menuItem.ingredients?.join(', ') || '',
        style: (isDownloadOnly ? 'Bright/Modern' : selectedStyle) as StyleOption,
        category: menuItem.category || 'Mains',
        price: menuItem.price || '',
        dietaryInfo: menuItem.dietaryInfo || [],
        allergens: menuItem.allergens || [],
      });
      if (menuItem.generatedImages?.length) {
        setImages(menuItem.generatedImages);
        setMenuItemId(menuItem.id);
      }
    }
  }, [menuItem]);

  const isTrial = usageInfo?.limitType === 'trial';
  const trialLimit = usageInfo?.trialLimit ?? 0;
  const trialRemaining = isTrial ? Math.max(usageInfo?.dishesRemaining ?? 0, 0) : 0;
  const trialUsed = isTrial ? Math.min(usageInfo?.dishesUsed ?? 0, trialLimit) : 0;
  const trialProgress = trialLimit > 0 ? Math.min((trialUsed / trialLimit) * 100, 100) : 0;
  const showTrialBanner = isTrial && usageInfo && trialLimit > 0;

  // Edit count tracking (max 2 edits)
  const MAX_EDITS = 2;
  const currentEditCount = menuItem?.editCount ?? 0;
  const editsRemaining = Math.max(0, MAX_EDITS - currentEditCount);
  const hasReachedEditLimit = currentEditCount >= MAX_EDITS;

  const toggleImageSelection = (index: number) => {
    setSelectedPreview((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const selectedIndicesForHighRes = useMemo(
    () => selectedPreview.flatMap((selected, idx) => (selected ? [idx] : [])),
    [selectedPreview]
  );

  const openZoomModal = (index: number) => {
    setZoomedIndex(index);
    setZoomScale(highResIndices.includes(index) ? 1.2 : 1);
  };

  const closeZoomModal = () => {
    setZoomedIndex(null);
    setZoomScale(1);
  };

  const adjustZoom = (delta: number) => {
    setZoomScale((prev) => {
      const next = Math.min(4, Math.max(1, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setError('Please enter a dish name first');
      return;
    }

    setAiDescriptionLoading(true);
    setError('');

    try {
      const result = await api.generateDescription({
        name: formData.name,
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((i) => i.trim())
          : undefined,
        description: formData.description || undefined,
      });

      setFormData({ ...formData, description: result.description });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate description');
    } finally {
      setAiDescriptionLoading(false);
    }
  };

  const toggleDietaryOption = (option: DietaryOption) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo.includes(option)
        ? prev.dietaryInfo.filter((o) => o !== option)
        : [...prev.dietaryInfo, option],
    }));
  };

  const handleSaveDescriptionOnly = async () => {
    if (!editId) {
      setError('Can only save description for existing items');
      return;
    }

    setSaveOnlyLoading(true);
    setError('');
    setSaveSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((i) => i.trim())
          : null,
        category: formData.category,
        price: formData.price || null,
        dietaryInfo: formData.dietaryInfo.length > 0 ? formData.dietaryInfo : null,
        allergens: formData.allergens.length > 0 ? formData.allergens : null,
        selectedStyle: formData.style,
      };

      await api.updateMenuItem(editId, updateData);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaveOnlyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHighResMessage(null);
    setLoading(true);
    setImages([]);
    setSelectedPreview([]);
    setHighResIndices([]);
    setMenuItemId(null);

    try {
      let menuItemToUse;
      
      if (editId) {
        // Update existing item
        const updateData = {
          name: formData.name,
          description: formData.description || null,
          ingredients: formData.ingredients
            ? formData.ingredients.split(',').map((i) => i.trim())
            : null,
          category: formData.category,
          price: formData.price || null,
          dietaryInfo: formData.dietaryInfo.length > 0 ? formData.dietaryInfo : null,
          allergens: formData.allergens.length > 0 ? formData.allergens : null,
          selectedStyle: formData.style,
        };
        console.log('Updating menu item with data:', updateData);
        menuItemToUse = await api.updateMenuItem(editId, updateData);
      } else {
        // Create new item
        menuItemToUse = await api.createMenuItem({
          name: formData.name,
          description: formData.description || null,
          ingredients: formData.ingredients
            ? formData.ingredients.split(',').map((i) => i.trim())
            : null,
          category: formData.category,
          price: formData.price || null,
          dietaryInfo: formData.dietaryInfo.length > 0 ? formData.dietaryInfo : null,
          allergens: formData.allergens.length > 0 ? formData.allergens : null,
          displayOrder: 0,
          isAvailable: true,
          generatedImages: null,
          selectedStyle: null,
        });
      }
      
      const menuItem = menuItemToUse;

      const result = await api.generateImages({
        menuItemId: menuItem.id,
        style: formData.style,
        dishName: formData.name,
        description: formData.description,
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((i) => i.trim())
          : undefined,
      });

      setImages(result.images);
      setSelectedImage(0);
      setMenuItemId(result.menuItem.id);
      setGeneratedStyle(formData.style);
      setIsDownloadOnly(result.downloadOnly || false);
      setSelectedPreview(new Array(result.images.length).fill(true));
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        setError(err.message);
      } else {
        setError('Failed to generate images');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHighRes = async () => {
    if (!menuItemId) return;
    if (!selectedIndicesForHighRes.length) {
      setError('Select at least one image to upscale.');
      return;
    }

    setHighResLoading(true);
    setHighResMessage(null);
    setError('');

    try {
      const result = await api.generateHighResImages({
        menuItemId,
        style: generatedStyle,
        dishName: formData.name,
        description: formData.description,
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((i) => i.trim())
          : undefined,
        indices: selectedIndicesForHighRes,
      });

      setImages(result.images);
      setHighResIndices((prev) => Array.from(new Set([...prev, ...result.updatedIndices])));
      setHighResMessage('Selected previews are now available in high resolution.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate high-resolution images');
    } finally {
      setHighResLoading(false);
    }
  };

  const handleSaveToMenu = async () => {
    if (!menuItemId || !images.length) return;

    setSaveLoading(true);
    setError('');

    try {
      await api.finalizeDish(menuItemId, {
        images,
        selectedStyle: generatedStyle,
        action: 'save',
        // Include all form data to ensure everything is saved
        name: formData.name,
        description: formData.description || null,
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((i) => i.trim())
          : null,
        category: formData.category,
        price: formData.price || null,
        dietaryInfo: formData.dietaryInfo.length > 0 ? formData.dietaryInfo : null,
        allergens: formData.allergens.length > 0 ? formData.allergens : null,
      });

      setIsSaved(true);
      setHighResMessage('Dish saved to your menu!');

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await queryClient.invalidateQueries({ queryKey: ['usage'] });

      // Navigate to dashboard with a small delay for UX
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to menu');
    } finally {
      setSaveLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${formData.name.replace(/\s+/g, '-')}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track download usage only once per session
    if (!downloadTracked && menuItemId) {
      try {
        await api.finalizeDish(menuItemId, {
          images,
          selectedStyle: generatedStyle,
          action: 'download',
          // Include form data for potential future use
          name: formData.name,
          description: formData.description || null,
          ingredients: formData.ingredients
            ? formData.ingredients.split(',').map((i) => i.trim())
            : null,
          category: formData.category,
          price: formData.price || null,
          dietaryInfo: formData.dietaryInfo.length > 0 ? formData.dietaryInfo : null,
          allergens: formData.allergens.length > 0 ? formData.allergens : null,
        });
        setDownloadTracked(true);
      } catch (err) {
        console.error('Failed to track download:', err);
      }
    }
  };

  const canRequestHighRes = Boolean(menuItemId && images.length);

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {editId ? 'Edit Dish' : 'Generate Food Photos'}
          </h1>
          <p className="text-gray-600">
            {editId ? 'Update your dish details and generate new images' : 'Create stunning AI-generated photography for your dishes.'}
          </p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> Generate and regenerate as many times as you want! Images only count against your plan when you click "Save to Menu" or download them.
            </p>
          </div>
        </motion.div>

        {showTrialBanner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 rounded-2xl border border-saffron-200 bg-gradient-to-br from-cream to-saffron-50 px-6 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-saffron-100 p-3 text-saffron-600">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-saffron-800 uppercase tracking-wide">
                    Free trial
                  </h2>
                  <p className="text-sm text-charcoal">
                    You have{' '}
                    <span className="font-semibold">
                      {trialRemaining} of {trialLimit}
                    </span>{' '}
                    complimentary dishes remaining.
                  </p>
                  <Link
                    to="/pricing"
                    className="mt-2 inline-flex items-center text-sm font-medium text-saffron-700 hover:text-saffron-800"
                  >
                    Upgrade to unlock unlimited creations →
                  </Link>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="mb-2 flex items-center justify-between text-xs text-saffron-700">
                  <span>Progress</span>
                  <span>
                    {trialUsed}/{trialLimit}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-saffron-100">
                  <div
                    className="h-2 rounded-full gradient-saffron transition-all"
                    style={{ width: `${trialProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {editId && menuItem && !['Social Media', 'Delivery App'].includes(formData.style) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mb-8 rounded-2xl border px-6 py-4 shadow-sm ${
              hasReachedEditLimit
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
                : editsRemaining === 1
                ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100'
                : 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${
                hasReachedEditLimit
                  ? 'bg-red-100 text-red-600'
                  : editsRemaining === 1
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h2 className={`text-sm font-semibold uppercase tracking-wide ${
                  hasReachedEditLimit
                    ? 'text-red-800'
                    : editsRemaining === 1
                    ? 'text-amber-800'
                    : 'text-blue-800'
                }`}>
                  {hasReachedEditLimit ? 'Edit limit reached' : 'Image regenerations'}
                </h2>
                <p className={`text-sm ${
                  hasReachedEditLimit
                    ? 'text-red-700'
                    : editsRemaining === 1
                    ? 'text-amber-700'
                    : 'text-blue-700'
                }`}>
                  {hasReachedEditLimit
                    ? `You've regenerated images ${MAX_EDITS} times for this dish. No more regenerations are allowed.`
                    : `You can regenerate images ${editsRemaining} more ${editsRemaining === 1 ? 'time' : 'times'} for this dish (${currentEditCount}/${MAX_EDITS} used).`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Margherita Pizza"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiDescriptionLoading || !formData.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-saffron-700 bg-saffron-50 rounded-md hover:bg-saffron-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiDescriptionLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3" />
                        Fill with AI
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fresh mozzarella, tomato sauce, basil..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all resize-none"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                >
                  <option value="Appetizers">Appetizers</option>
                  <option value="Soups">Soups</option>
                  <option value="Salads">Salads</option>
                  <option value="Mains">Mains</option>
                  <option value="Sides">Sides</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">AED</span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Info (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Spicy'] as DietaryOption[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleDietaryOption(option)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        formData.dietaryInfo.includes(option)
                          ? 'bg-saffron-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Ingredients (optional)
                </label>
                <input
                  id="ingredients"
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="tomatoes, mozzarella, basil (comma separated)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photography Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, style: style.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.style === style.value
                          ? 'border-saffron-600 bg-saffron-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{style.label}</span>
                        {formData.style === style.value && <Check className="w-4 h-4 text-saffron-600" />}
                        {style.downloadOnly && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <Download className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Download className="h-3 w-3" />
                    Download only:
                  </span>
                  {' '}Social Media and Delivery App styles can be downloaded but won't be saved to your menu items.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 space-y-3">
                  <p className="text-sm">{error}</p>
                  {error.toLowerCase().includes('free dishes') && (
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700 transition-colors"
                    >
                      Review Plans
                    </Link>
                  )}
                </div>
              )}

              {saveSuccess && (
                <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
                  <p className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Changes saved successfully!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || saveOnlyLoading || (hasReachedEditLimit && !['Social Media', 'Delivery App'].includes(formData.style))}
                  className="w-full py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editId ? 'Updating...' : 'Generating previews...'}
                    </>
                  ) : (hasReachedEditLimit && !['Social Media', 'Delivery App'].includes(formData.style)) ? (
                    <>
                      <X className="w-5 h-5" />
                      Edit Limit Reached
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {['Social Media', 'Delivery App'].includes(formData.style) ? 'Generate for Download' : editId ? 'Update Dish & Generate Images' : 'Generate Preview Images'}
                    </>
                  )}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={handleSaveDescriptionOnly}
                    disabled={loading || saveOnlyLoading}
                    className="w-full py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {saveOnlyLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Description Only
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-saffron-100 to-[#FFE4CC] flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-saffron-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600">Creating your images...</p>
                  </div>
                </motion.div>
              ) : images.length > 0 ? (
                <motion.div
                  key="images"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-6">
                    <img
                      src={images[selectedImage]}
                      alt={`Generated preview ${selectedImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {highResIndices.includes(selectedImage) && (
                      <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#86A873] shadow">
                        High-res
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => openZoomModal(selectedImage)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white transition"
                    >
                      <Maximize className="h-3 w-3" />
                      Expand
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, idx) => (
                      <div key={`${image}-${idx}`} className="relative">
                        <button
                          onClick={() => setSelectedImage(idx)}
                          className={`group relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === idx
                              ? 'border-saffron-600 shadow-lg'
                              : 'border-transparent hover:border-saffron-200'
                          }`}
                        >
                          <img src={image} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/30 flex items-center justify-center text-white text-sm font-medium transition-opacity">
                            Preview
                          </div>
                        </button>
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedPreview[idx] ?? false}
                            onChange={() => toggleImageSelection(idx)}
                            className="h-4 w-4 rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
                          />
                          <span>
                            Keep {variationLabels[idx] ?? `Option ${idx + 1}`}
                            {highResIndices.includes(idx) && (
                              <span className="ml-1 inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <ArrowUpRight className="h-3 w-3" /> High-res
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {isDownloadOnly && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <div className="flex items-start gap-2">
                          <Download className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Download-only style</p>
                            <p className="text-xs mt-1">
                              These images are for downloads only and will not be saved to your menu items.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {highResMessage && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {highResMessage}
                      </div>
                    )}
                    {!isSaved && !isDownloadOnly && (
                      <button
                        type="button"
                        onClick={handleSaveToMenu}
                        disabled={saveLoading || !canRequestHighRes}
                        className="w-full py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                      >
                        {saveLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving to menu...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            Save to Menu
                          </>
                        )}
                      </button>
                    )}
                    {isSaved && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">Saved to menu! Redirecting to dashboard...</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateHighRes}
                      disabled={!canRequestHighRes || highResLoading}
                      className="w-full py-3 rounded-lg border border-saffron-200 text-saffron-700 font-semibold hover:bg-saffron-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {highResLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating high-resolution images ({selectedIndicesForHighRes.length})
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4" />
                          Generate selected in high resolution
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500">
                      Preview images render quickly at a lower resolution. Upscaling the selected options can take up to
                      about 40 seconds per image while we process them through Gemini.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center text-center text-gray-500"
                >
                  <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-sm">
                    Start by entering your dish details and generate previews. We’ll reserve high-resolution
                    renders until you confirm your favorites.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-5"
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Download</h4>
            {selectedIndicesForHighRes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedIndicesForHighRes.map((index) => (
                  <button
                    key={`download-${index}`}
                    onClick={() => downloadImage(images[index], index)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-saffron-300 hover:text-saffron-700 transition"
                  >
                    <Download className="h-4 w-4" /> Download {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Select the previews you want to keep to enable high-resolution generation and downloads.
              </p>
            )}
          </motion.div>
        )}
      </div>
      </div>
      {zoomedIndex !== null && images[zoomedIndex] && (
        <AnimatePresence>
          <motion.div
            key="zoom-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onWheel={(event) => {
              event.preventDefault();
              adjustZoom(event.deltaY < 0 ? 0.1 : -0.1);
            }}
          >
            <div className="absolute inset-0" onClick={closeZoomModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{variationLabels[zoomedIndex] ?? `Image ${zoomedIndex + 1}`}</span>
                  {highResIndices.includes(zoomedIndex) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ArrowUpRight className="h-3 w-3" /> High-res
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustZoom(-0.1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustZoom(0.1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeZoomModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="relative max-h-[calc(90vh-4rem)] w-[min(80vw,900px)] overflow-auto bg-gray-900">
                <img
                  src={images[zoomedIndex]}
                  alt="Expanded preview"
                  className="mx-auto select-none"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 120ms ease',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
