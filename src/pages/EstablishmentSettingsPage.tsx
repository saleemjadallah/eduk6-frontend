import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { EstablishmentSettings, CoverStyle, FontFamily } from '@/types';

const coverStyles: { value: CoverStyle; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Traditional leather-bound look' },
  { value: 'modern', label: 'Modern', description: 'Clean minimalist design' },
  { value: 'rustic', label: 'Rustic', description: 'Warm wood texture style' },
];

const fontFamilies: { value: FontFamily; label: string }[] = [
  { value: 'serif', label: 'Serif (Classic)' },
  { value: 'sans-serif', label: 'Sans-Serif (Modern)' },
  { value: 'modern', label: 'Display (Elegant)' },
];

export function EstablishmentSettingsPage() {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch establishment settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['establishmentSettings'],
    queryFn: () => api.getEstablishmentSettings(),
  });

  // Form state
  const [formData, setFormData] = useState<Partial<EstablishmentSettings>>({});

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: (data: Partial<EstablishmentSettings>) => api.updateEstablishmentSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishmentSettings'] });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleChange = (field: keyof EstablishmentSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const currentData = { ...settings, ...formData };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Establishment Settings</h1>
            <p className="text-gray-600">
              Customize how your menu appears to customers
            </p>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            {/* Establishment Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Establishment Information</h2>

              <div className="space-y-6">
                {/* Establishment Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Establishment Name *
                  </label>
                  <input
                    type="text"
                    value={currentData.establishmentName || ''}
                    onChange={(e) => handleChange('establishmentName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-600 focus:border-transparent"
                    placeholder="My Restaurant"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentData.tagline || ''}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-600 focus:border-transparent"
                    placeholder="Authentic Italian Cuisine Since 1995"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Styling Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Menu Book Styling</h2>

              <div className="space-y-6">
                {/* Cover Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cover Style
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {coverStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => handleChange('coverStyle', style.value)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          currentData.coverStyle === style.value
                            ? 'border-saffron-600 bg-saffron-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">{style.label}</div>
                        <div className="text-xs text-gray-600">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={currentData.accentColor || '#C85A54'}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="h-12 w-20 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={currentData.accentColor || '#C85A54'}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-600 focus:border-transparent font-mono"
                      placeholder="#C85A54"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Style
                  </label>
                  <select
                    value={currentData.fontFamily || 'serif'}
                    onChange={(e) => handleChange('fontFamily', e.target.value as FontFamily)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-600 focus:border-transparent"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Layout Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Layout Preferences</h2>

              <div className="space-y-6">
                {/* Items Per Page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items Per Page: {currentData.itemsPerPage || 12}
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="2"
                    value={currentData.itemsPerPage || 12}
                    onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-saffron-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>6 items</span>
                    <span>16 items</span>
                  </div>
                </div>

                {/* Show Page Numbers */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Page Numbers</label>
                    <p className="text-xs text-gray-500 mt-1">Display page numbers at the bottom of each page</p>
                  </div>
                  <button
                    onClick={() => handleChange('showPageNumbers', currentData.showPageNumbers ? 0 : 1)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentData.showPageNumbers ? 'bg-saffron-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentData.showPageNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Establishment on Every Page */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Name on Every Page</label>
                    <p className="text-xs text-gray-500 mt-1">Display establishment name at the top of each page</p>
                  </div>
                  <button
                    onClick={() =>
                      handleChange('showEstablishmentOnEveryPage', currentData.showEstablishmentOnEveryPage ? 0 : 1)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentData.showEstablishmentOnEveryPage ? 'bg-saffron-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentData.showEstablishmentOnEveryPage ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {saveStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings saved successfully!</span>
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Failed to save settings</span>
                  </motion.div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-5 h-5" />
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
