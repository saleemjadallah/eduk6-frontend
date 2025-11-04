import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Mail, CreditCard, LogOut, Loader2, BookOpen, Wrench, CheckCircle, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MenuCategory } from '@/types';

const CATEGORY_ORDER: MenuCategory[] = [
  'Appetizers',
  'Soups',
  'Salads',
  'Mains',
  'Sides',
  'Desserts',
  'Beverages',
];

const CATEGORY_ORDER_MAP: Record<MenuCategory, number> = CATEGORY_ORDER.reduce(
  (acc, category, index) => {
    acc[category] = index;
    return acc;
  },
  {} as Record<MenuCategory, number>
);

export function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getSubscription(),
  });

  const { data: imageLibrary, isLoading: imagesLoading } = useQuery({
    queryKey: ['userImageLibrary'],
    queryFn: () => api.getUserImageLibrary(),
    enabled: !!user,
    retry: 1,
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to load your image library.',
        variant: 'destructive',
      });
    },
  });

  const menuImages = imageLibrary?.menuImages ?? [];
  const enhancedImages = imageLibrary?.enhancedImages ?? [];

  const sortedMenuImages = useMemo(() => {
    return [...menuImages].sort((a, b) => {
      const categoryDiff =
        (CATEGORY_ORDER_MAP[a.category] ?? 99) -
        (CATEGORY_ORDER_MAP[b.category] ?? 99);
      if (categoryDiff !== 0) {
        return categoryDiff;
      }
      const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      const nameDiff = a.menuItemName.localeCompare(b.menuItemName);
      if (nameDiff !== 0) {
        return nameDiff;
      }
      return a.imageIndex - b.imageIndex;
    });
  }, [menuImages]);

  const sortedEnhancedImages = useMemo(() => {
    return [...enhancedImages].sort((a, b) => {
      const aTime = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const bTime = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return bTime - aTime;
    });
  }, [enhancedImages]);

  const formatDate = (value: string | null) => {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const getFileName = (key: string) => {
    const parts = key.split('/');
    return parts[parts.length - 1] || key;
  };

  // Set initial values when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) =>
      api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const fixCategoriesMutation = useMutation({
    mutationFn: () => api.fixMenuCategories(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: 'Categories Fixed',
        description: data.message || 'Menu item categories have been fixed successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to fix categories. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleLogout = async () => {
    await api.logout();
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    navigate('/');
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const handleCancelEdit = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(false);
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await api.createPortalSession();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open billing portal',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-charcoal mb-2">Account Settings</h1>
          <p className="text-slate mb-8">Manage your account settings and preferences</p>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-saffron" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate" />
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-cream-100"
                    />
                  </div>
                  <p className="text-xs text-slate">
                    Email cannot be changed at this time
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={updateProfileMutation.isPending}
                        className="bg-saffron hover:bg-saffron-600"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-saffron" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-charcoal capitalize">
                          {subscription.tier} Plan
                        </p>
                        <p className="text-sm text-slate">
                          Status: <span className="capitalize">{subscription.status}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleManageSubscription}
                      >
                        Manage Subscription
                      </Button>
                    </div>
                    <p className="text-xs text-slate">
                      Update payment methods, change plans, or cancel your subscription through our secure billing portal.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate mb-4">No active subscription</p>
                    <Button
                      onClick={() => navigate('/pricing')}
                      className="bg-saffron hover:bg-saffron-600"
                    >
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Establishment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-saffron" />
                  Establishment Settings
                </CardTitle>
                <CardDescription>
                  Customize your menu book appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate mb-4">
                  Configure your restaurant name, tagline, menu book style, and layout preferences.
                </p>
                <Button
                  onClick={() => navigate('/settings/establishment')}
                  className="bg-saffron hover:bg-saffron-600"
                >
                  Manage Establishment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="w-5 h-5 text-saffron" />
                  Generated &amp; Enhanced Images
                </CardTitle>
                <CardDescription>
                  View and download the images you've saved through MyDscvr AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-saffron" />
                  </div>
                ) : imageLibrary ? (
                  <Tabs defaultValue="menu" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:w-auto">
                      <TabsTrigger value="menu">
                        Menu Images ({sortedMenuImages.length})
                      </TabsTrigger>
                      <TabsTrigger value="enhanced">
                        Enhanced Images ({sortedEnhancedImages.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="menu" className="mt-6">
                      {sortedMenuImages.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {sortedMenuImages.map((image) => (
                            <div
                              key={`${image.menuItemId}-${image.imageIndex}`}
                              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                            >
                              <div className="aspect-square bg-cream">
                                <img
                                  src={image.url}
                                  alt={`${image.menuItemName} image ${image.imageIndex + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {image.menuItemName}
                                    </p>
                                    <p className="text-xs text-slate">
                                      Category: {image.category}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-xs font-medium text-saffron-700">
                                    #{image.imageIndex + 1}
                                  </span>
                                </div>
                                {image.createdAt && (
                                  <p className="text-xs text-slate">
                                    Saved {formatDate(image.createdAt)}
                                  </p>
                                )}
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <a
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-saffron-600 hover:text-saffron-600"
                                  >
                                    View
                                  </a>
                                  <Link
                                    to={`/generate?id=${image.menuItemId}`}
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-saffron px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-saffron-600"
                                  >
                                    Edit Dish
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-slate">
                          No saved menu images yet. Generate and save dishes to see them here.
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="enhanced" className="mt-6">
                      {sortedEnhancedImages.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {sortedEnhancedImages.map((image) => {
                            const fileName = getFileName(image.key);
                            return (
                              <div
                                key={image.key}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                              >
                                <div className="aspect-square bg-cream">
                                  <img
                                    src={image.url}
                                    alt={fileName}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="space-y-3 p-4">
                                  <p
                                    className="truncate text-sm font-semibold text-gray-900"
                                    title={fileName}
                                  >
                                    {fileName}
                                  </p>
                                  <div className="space-y-1 text-xs text-slate">
                                    <p>Size: {formatFileSize(image.size)}</p>
                                    {image.lastModified && (
                                      <p>Saved {formatDate(image.lastModified)}</p>
                                    )}
                                  </div>
                                  <a
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={fileName}
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-saffron-600 hover:text-saffron-600"
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-slate">
                          No enhanced images yet. Enhance photos to see them here.
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-slate">
                    Unable to load your image library right now.
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Maintenance Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-saffron" />
                  Maintenance Tools
                </CardTitle>
                <CardDescription>
                  Fix data issues and maintain your menu items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Fix Menu Categories</h3>
                  <p className="text-sm text-slate">
                    Some of your menu items may not have categories assigned. Click the button below to automatically assign default categories to these items.
                  </p>
                  <Button
                    onClick={() => fixCategoriesMutation.mutate()}
                    disabled={fixCategoriesMutation.isPending}
                    className="mt-2"
                  >
                    {fixCategoriesMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fixing Categories...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Fix Categories
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Account Actions */}
            <Card className="border-berry/20">
              <CardHeader>
                <CardTitle className="text-berry">Account Actions</CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-berry hover:bg-berry/10 hover:text-berry border-berry/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
