import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, TrendingUp, Package, Trash2, Leaf, Flame, Coffee, Soup, Salad, UtensilsCrossed, Cookie, Apple, GripVertical, QrCode, X, Download, FileText, BookOpen, Wand2, Copy } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { MenuItem, MenuCategory, DietaryOption, User } from '@/types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORY_ORDER: MenuCategory[] = [
  'Appetizers',
  'Soups',
  'Salads',
  'Mains',
  'Sides',
  'Desserts',
  'Beverages',
];

// Sortable Menu Item Component
function SortableMenuItem({
  item,
  deleteId,
  handleDelete,
  dietaryIcons,
}: {
  item: MenuItem;
  deleteId: string | null;
  handleDelete: (id: string) => void;
  dietaryIcons: Record<DietaryOption, any>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="flex gap-4 p-4">
        {/* Image - Smaller */}
        {item.generatedImages && item.generatedImages.length > 0 ? (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={item.generatedImages[0]}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="absolute top-1 left-1 p-1.5 rounded-md bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
              aria-label="Drag to reorder"
              role="button"
              tabIndex={0}
            >
              <GripVertical className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="absolute top-1 left-1 p-1.5 rounded-md bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
              aria-label="Drag to reorder"
              role="button"
              tabIndex={0}
            >
              <GripVertical className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Price/Availability Row */}
          <div className="flex items-center justify-between mb-2">
            {item.price && (
              <span className="text-lg font-bold text-saffron-700">
                AED {parseFloat(item.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Name */}
          <h4 className="font-semibold text-gray-900 mb-1 text-base">
            {item.name}
          </h4>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}

          {/* Dietary Info */}
          {item.dietaryInfo && item.dietaryInfo.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-3">
              {item.dietaryInfo.map((dietary) => {
                const Icon = dietaryIcons[dietary] || Package;
                return (
                  <span
                    key={dietary}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                    title={dietary}
                  >
                    <Icon className="w-3 h-3" />
                    {dietary}
                  </span>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={`/generate?id=${item.id}`}
              className="px-3 py-1.5 rounded-lg bg-saffron-600 text-white text-xs font-medium hover:bg-saffron-700 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deleteId === item.id}
              className="p-1.5 rounded-lg border border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [menuLink, setMenuLink] = useState('');
  const queryClient = useQueryClient();
  const cachedUser = queryClient.getQueryData<User | null>(['user']);
  const publicMenuPath = cachedUser?.id ? `/menu/${cachedUser.id}` : '/menu';

  const { data: menuItems, isLoading: itemsLoading, refetch } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => api.getMenuItems(),
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: () => api.getCurrentUsage(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getCurrentSubscription(),
  });

  // Auto-sync subscription on mount to ensure Pro tier users get correct limits
  useEffect(() => {
    const syncSubscription = async () => {
      try {
        const result = await api.syncSubscription();
        if (result.synced) {
          // Refetch usage and subscription after sync
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          queryClient.invalidateQueries({ queryKey: ['usage'] });
        }
      } catch (error) {
        // Silently fail - user might not have a Stripe subscription yet
        console.debug('Subscription sync skipped:', error);
      }
    };

    syncSubscription();
  }, [queryClient]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    setDeleteId(id);
    try {
      await api.deleteMenuItem(id);
      refetch();
    } finally {
      setDeleteId(null);
    }
  };



  const handleDragEnd = async (event: DragEndEvent, category: MenuCategory) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const items = menuByCategory[category];
    if (!items) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder items
    const reorderedItems = arrayMove(items, oldIndex, newIndex);

    // Update displayOrder for all affected items
    try {
      await Promise.all(
        reorderedItems.map((item, index) =>
          api.updateMenuItem(item.id, { displayOrder: index })
        )
      );
      refetch();
    } catch (error) {
      console.error('Failed to reorder items:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerateQRCode = async () => {
    try {
      const user = await queryClient.ensureQueryData({
        queryKey: ['user'],
        queryFn: () => api.getCurrentUser(),
      });

      if (!user) {
        alert('Please log in to generate QR code');
        return;
      }

      const menuUrl = `${window.location.origin}/menu/${user.id}`;
      setMenuLink(menuUrl);
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#1F2937', // Charcoal
          light: '#FEFCF8', // Cream
        },
      });

      setQrCodeUrl(qrDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'menu-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!menuItems || menuItems.length === 0) {
      alert('No menu items to export');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Menu', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Iterate through categories in defined order
    CATEGORY_ORDER.forEach((category) => {
      const items = menuByCategory[category];
      if (!items.length) {
        return;
      }
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Category Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(200, 90, 84); // Saffron color
      pdf.text(category, margin, yPosition);
      yPosition += 8;

      // Category line
      pdf.setDrawColor(200, 90, 84);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Items
      items.forEach((item) => {
        // Check if we need a new page for the item
        if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        // Item name and price
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);

        const itemName = item.name;
        const priceText = item.price ? `AED ${parseFloat(item.price).toFixed(2)}` : '';

        pdf.text(itemName, margin, yPosition);
        if (priceText) {
          pdf.text(priceText, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 6;

        // Description
        if (item.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);

          const descLines = pdf.splitTextToSize(item.description, pageWidth - 2 * margin);
          pdf.text(descLines, margin, yPosition);
          yPosition += descLines.length * 5;
        }

        // Dietary info
        if (item.dietaryInfo && item.dietaryInfo.length > 0) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(40, 167, 69); // Green color
          pdf.text(item.dietaryInfo.join(', '), margin, yPosition);
          yPosition += 5;
        }

        yPosition += 8; // Space between items
      });

      yPosition += 5; // Space between categories
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    pdf.save('menu.pdf');
  };

  // Group menu items by category
  const menuByCategory = useMemo<Record<MenuCategory, MenuItem[]>>(() => {
    const categories = CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<MenuCategory, MenuItem[]>);

    if (!menuItems) return categories;

    // Only show items that have been finalized (have images)
    const finalizedItems = menuItems.filter(
      (item) => item.generatedImages && item.generatedImages.length > 0
    );

    finalizedItems.forEach((item) => {
      const category = (item.category || 'Mains') as MenuCategory;
      categories[category].push(item);
    });

    CATEGORY_ORDER.forEach((category) => {
      categories[category].sort((a, b) => a.displayOrder - b.displayOrder);
    });

    return categories;
  }, [menuItems]);

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

  const stats = [
    {
      label: 'Dishes Generated',
      value: usage?.dishesUsed || 0,
      max: usage?.limits.dishesPerMonth || 30,
      icon: Package,
      gradient: 'from-saffron-500 to-saffron-600',
    },
    {
      label: 'Images Created',
      value: usage?.imagesUsed || 0,
      icon: ImageIcon,
      gradient: 'from-[#C85A54] to-[#B54A44]',
    },
    {
      label: 'Remaining This Month',
      value: usage?.dishesRemaining || 0,
      icon: TrendingUp,
      gradient: 'from-[#86A873] to-[#76986B]',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Manage your dishes and track your usage
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/generate"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generate
              </Link>
              <Link
                to="/enhance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Wand2 className="w-5 h-5" />
                Enhance
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-white border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.max && (
                    <span className="text-lg text-gray-500">/ {stat.max}</span>
                  )}
                </div>
                {stat.max && (
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                      style={{ width: `${(stat.value / stat.max) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Status */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-cream to-saffron-50 border border-saffron-200 mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  Your subscription is {subscription.status}
                </p>
              </div>
              <Link
                to="/pricing"
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 font-medium hover:border-saffron-600 hover:text-saffron-600 transition-all"
              >
                Manage Plan
              </Link>
            </div>
          </motion.div>
        )}

        {/* Menu by Category */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Menu</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to={publicMenuPath}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-saffron-600 text-white text-sm sm:text-base font-semibold hover:shadow-lg hover:bg-saffron-700 transition-all whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">View Menu Book</span>
                <span className="sm:hidden">Menu Book</span>
              </Link>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-charcoal text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all whitespace-nowrap"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                onClick={handleGenerateQRCode}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg gradient-saffron text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all whitespace-nowrap"
              >
                <QrCode className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Get QR Code</span>
                <span className="sm:hidden">QR Code</span>
              </button>
            </div>
          </div>

          {itemsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : menuItems && menuItems.length > 0 ? (
            <div className="space-y-12">
              {CATEGORY_ORDER.filter((category) => menuByCategory[category].length > 0).map((category) => {
                const items = menuByCategory[category];
                return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-saffron-600">
                    {(() => {
                      const Icon = categoryIcons[category] || UtensilsCrossed;
                      return <Icon className="w-6 h-6 text-saffron-600" />;
                    })()}
                    <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-500 ml-auto">
                      Drag to reorder
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, category)}
                  >
                    <SortableContext
                      items={items.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {items.map((item) => (
                          <SortableMenuItem
                            key={item.id}
                            item={item}
                            deleteId={deleteId}
                            handleDelete={handleDelete}

                            dietaryIcons={dietaryIcons}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </motion.div>
              );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300"
            >
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No dishes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first dish to get started with AI food photography
              </p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Dish
              </Link>
            </motion.div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Menu QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="text-center space-y-6">
                {qrCodeUrl && (
                  <>
                    <div className="bg-cream rounded-xl p-6 inline-block">
                      <img src={qrCodeUrl} alt="Menu QR Code" className="w-64 h-64" />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Customers can scan this QR code to view your menu
                      </p>
                      {menuLink && (
                        <div className="flex flex-col items-center gap-2">
                          <a
                            href={menuLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-saffron-700 font-medium underline break-all"
                          >
                            {menuLink}
                          </a>
                          <button
                            onClick={handleCopyMenuLink}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-saffron-600 hover:text-saffron-600 transition-all"
                          >
                            <Copy className="w-4 h-4" />
                            Copy link
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleDownloadQR}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download QR Code
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
  const handleCopyMenuLink = () => {
    if (!menuLink) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(menuLink).then(
        () => {
          alert('Menu link copied to clipboard');
        },
        () => alert('Failed to copy link')
      );
    } else {
      alert('Copying is not supported in this browser');
    }
  };
