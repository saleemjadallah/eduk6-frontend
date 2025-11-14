import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { batchApi, wardrobeApi } from '@/lib/api';
import { HeadshotBatch } from '@/types';
import { ProfessionalOutfit, OutfitCategory } from '@/types/wardrobe.types';
import { ArrowLeft, Loader2, Sparkles, Crown, AlertCircle } from 'lucide-react';

export default function EditStudioPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const headshotUrl = searchParams.get('headshot');

  const [batch, setBatch] = useState<HeadshotBatch | null>(null);
  const [outfits, setOutfits] = useState<ProfessionalOutfit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<OutfitCategory>('business-formal');
  const [selectedOutfit, setSelectedOutfit] = useState<ProfessionalOutfit | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories: { id: OutfitCategory; label: string; icon: string }[] = [
    { id: 'business-formal', label: 'Business Formal', icon: '👔' },
    { id: 'business-casual', label: 'Business Casual', icon: '👕' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'executive', label: 'Executive', icon: '💼' },
    { id: 'industry-specific', label: 'Industry', icon: '⚕️' },
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [batchId]);

  // Load outfits when category changes
  useEffect(() => {
    loadOutfits();
  }, [selectedCategory]);

  async function loadData() {
    try {
      setLoading(true);
      const [batchRes, creditsRes] = await Promise.all([
        batchApi.getBatch(Number(batchId)),
        wardrobeApi.getEditCredits(),
      ]);

      if (!batchRes.success || !batchRes.data) throw new Error('Failed to load batch');
      setBatch(batchRes.data);
      if (creditsRes.data) {
        setEditCredits(creditsRes.data.remaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadOutfits() {
    try {
      const res = await wardrobeApi.getWardrobe({ category: selectedCategory });
      if (res.success && res.data) {
        setOutfits(res.data.outfits);
      }
    } catch (err) {
      console.error('Failed to load outfits:', err);
    }
  }

  async function handlePreview(outfit: ProfessionalOutfit) {
    if (!headshotUrl) return;

    try {
      setPreviewing(true);
      setSelectedOutfit(outfit);
      setError(null);

      const res = await wardrobeApi.getOutfitPreview(headshotUrl, outfit.id);
      if (res.success && res.data) {
        setPreviewImage(res.data.preview);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleApply() {
    if (!selectedOutfit || !headshotUrl || !batchId) return;

    // Check credits
    if (editCredits < 2) {
      setError('Insufficient edit credits. Outfit changes require 2 credits.');
      return;
    }

    try {
      setApplying(true);
      setError(null);

      const res = await batchApi.requestOutfitChange(
        Number(batchId),
        headshotUrl,
        selectedOutfit.id
      );

      if (res.success && res.data) {
        setSuccess(true);
        setEditCredits(res.data.creditsRemaining);

        // Redirect back to batch view after a delay
        setTimeout(() => {
          navigate(`/dashboard/batches/${batchId}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply outfit');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!headshotUrl || !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Request</h2>
          <p className="text-gray-600 mb-4">Missing headshot or batch information</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/dashboard/batches/${batchId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Virtual Wardrobe Studio
                </h1>
                <p className="text-sm text-gray-600">
                  Try different professional outfits on your headshot
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Edit Credits</p>
                <p className="text-lg font-bold">{editCredits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Outfit change request submitted! Processing will take 10-30 seconds.
            </p>
            <p className="text-sm text-green-600 mt-1">
              Redirecting you back to your batch...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Preview Panel */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>

              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                {previewing ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Generating preview...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
                  </div>
                ) : previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={headshotUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {selectedOutfit && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">{selectedOutfit.name}</h3>
                    <p className="text-sm text-gray-600">{selectedOutfit.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Formality:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${selectedOutfit.formality * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{selectedOutfit.formality}/10</span>
                  </div>

                  <button
                    onClick={handleApply}
                    disabled={applying || !previewImage}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {applying ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Applying Outfit...
                      </span>
                    ) : (
                      `Apply Outfit (2 Credits)`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Outfit Selection */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Choose an Outfit</h2>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`
                      px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors
                      ${selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Outfits Grid */}
              <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    onClick={() => handlePreview(outfit)}
                    className={`
                      relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                      ${selectedOutfit?.id === outfit.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="aspect-[3/4] bg-gray-100" />
                    {outfit.premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1">{outfit.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{outfit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
