import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Button, Card, Badge } from '../components/ui';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Sparkles, Zap, Crown } from 'lucide-react';
import { batchApi } from '@/lib/api';

// Popular platforms users typically need
const AVAILABLE_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking', icon: '💼' },
  { id: 'corporate', name: 'Corporate Website', description: 'Company team pages', icon: '🏢' },
  { id: 'social', name: 'Social Media', description: 'Instagram, Twitter, Facebook', icon: '📱' },
  { id: 'resume', name: 'Resume/CV', description: 'Traditional headshot', icon: '📄' },
  { id: 'creative', name: 'Creative Portfolio', description: 'Personal brand', icon: '🎨' },
  { id: 'executive', name: 'Executive', description: 'Leadership pages', icon: '👔' },
  { id: 'casual', name: 'Casual Professional', description: 'Approachable style', icon: '☕' },
  { id: 'speaker', name: 'Conference Speaker', description: 'Event promotion', icon: '🎤' },
];

interface UploadPageProps {
  user: User;
}

const plans: Array<{
  id: PlanId;
  name: string;
  price: number;
  headshots: number;
  maxTemplates: number;
  icon: typeof Zap;
  color: string;
  popular?: boolean;
}> = [
  {
    id: 'basic',
    name: 'Starter',
    price: 29,
    headshots: 10,
    maxTemplates: 2,
    icon: Zap,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 39,
    headshots: 15,
    maxTemplates: 3,
    icon: Sparkles,
    color: 'from-secondary-400 to-secondary-600',
    popular: true,
  },
  {
    id: 'executive',
    name: 'Premium',
    price: 59,
    headshots: 20,
    maxTemplates: 5,
    icon: Crown,
    color: 'from-amber-400 to-amber-600',
  },
];

type PlanId = 'basic' | 'professional' | 'executive';

export default function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']); // Default to LinkedIn
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isTestUser = user?.email === 'test@headshotsaas.com';
  const allowSingleUpload =
    isTestUser || import.meta.env.VITE_ENABLE_SINGLE_UPLOAD === 'true';
  const minUploadCount = allowSingleUpload ? 1 : 12;
  const uploadRequirementText = isTestUser
    ? 'Upload 1 selfie to generate your test headshot'
    : allowSingleUpload
      ? 'Upload at least 1 selfie to get started (testing mode)'
      : 'Upload 12-20 selfies from different angles to get started';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    setSelectedFiles(prev => [...prev, ...files].slice(0, 20));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith('image/')
    );
    setSelectedFiles(prev => [...prev, ...files].slice(0, 20));
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const togglePlatform = useCallback((platformId: string) => {
    const currentPlan = plans.find(p => p.id === selectedPlan);
    const maxTemplates = currentPlan?.maxTemplates || 2;

    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        // Always allow deselection unless it's the last one
        return prev.length > 1 ? prev.filter(id => id !== platformId) : prev;
      } else {
        // Only allow selection if under the plan limit
        if (prev.length < maxTemplates) {
          return [...prev, platformId];
        }
        return prev;
      }
    });
  }, [selectedPlan]);

  const handleSubmit = async () => {
    if (selectedFiles.length < minUploadCount) {
      alert(`Please upload at least ${minUploadCount} photo${minUploadCount !== 1 ? 's' : ''}`);
      return;
    }

    if (!selectedPlan) {
      alert('Please select a plan to continue');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    try {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);

      const uploadResponse = await batchApi.uploadPhotos(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to upload photos');
      }

      const createResponse = await batchApi.createBatch({
        uploadedPhotos: uploadResponse.data,
        plan: selectedPlan,
        styleTemplates: selectedPlatforms,
        stripeSessionId: 'testing-mode',
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.error || 'Failed to start headshot generation');
      }

      const batchId = createResponse.data.id;
      setSelectedFiles([]);
      navigate(`/processing?batchId=${batchId}`, { state: { batchId } });
    } catch (error) {
      console.error('Upload failed', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to start generation');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upload Your Photos
            </h1>
            <p className="text-xl text-gray-600">
              {uploadRequirementText}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="font-semibold text-gray-900">Upload Photos</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${isTestUser ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center font-bold`}>
                  2
                </div>
                <span className={isTestUser ? 'font-semibold text-gray-900' : 'text-gray-500'}>
                  {isTestUser ? 'Plan Activated' : 'Select Plan'}
                </span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-gray-500">Process</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Zone */}
              <Card variant="default" className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Upload Your Selfies
                </h2>

                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                >
                  <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drop your photos here
                  </h3>
                  <p className="text-gray-600 mb-6">
                    or click to browse from your computer
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="primary" size="md" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                      <ImageIcon className="w-5 h-5" />
                      Choose Photos
                    </Button>
                  </label>
                </div>

                {/* File Requirements */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-2">Photo Requirements:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>{isTestUser ? 'Upload 1 selfie (test account)' : allowSingleUpload ? 'Upload at least 1 selfie while testing' : 'Upload 12-20 selfies for best results'}</li>
                        <li>Vary angles, expressions, and lighting</li>
                        <li>Clear face visibility (no sunglasses or hats)</li>
                        <li>High quality images (min 500x500px)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Selected Files Grid */}
                {selectedFiles.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Selected Photos ({selectedFiles.length}/20)
                      </h3>
                      {selectedFiles.length >= minUploadCount && (
                        <Badge variant="success">
                          <Check className="w-4 h-4" />
                          Ready to process
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedFiles.length < minUploadCount && (
                      <p className="mt-4 text-sm text-amber-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Upload at least {minUploadCount - selectedFiles.length} more photo{minUploadCount - selectedFiles.length !== 1 ? 's' : ''} to continue
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Plan Selection / Test Access - 1 column */}
            <div className="space-y-6">
              <Card variant="default" className="p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {isTestUser ? 'Test Account Access' : 'Select Your Plan'}
                </h2>

                {isTestUser ? (
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-xl mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Professional plan unlocked</h3>
                    <p className="text-sm text-gray-600">
                      This demo account already has the Professional plan activated. No payment is required—just upload a selfie to try the workflow end to end.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => {
                      const Icon = plan.icon;
                      const isSelected = selectedPlan === plan.id;

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 shadow-lg'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                {plan.popular && (
                                  <Badge variant="popular" size="sm">Popular</Badge>
                                )}
                              </div>
                              <p className="text-2xl font-bold text-gray-900 mb-1">
                                ${plan.price}
                              </p>
                              <p className="text-sm text-gray-600">
                                {plan.headshots} headshots • Up to {plan.maxTemplates} platforms
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-6 h-6 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Platform Selection */}
                {!isTestUser && selectedPlanData && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Select Platforms
                      </h3>
                      <p className="text-sm text-gray-600">
                        Choose up to {selectedPlanData.maxTemplates} platform{selectedPlanData.maxTemplates !== 1 ? 's' : ''}
                        {' '}({selectedPlatforms.length}/{selectedPlanData.maxTemplates} selected)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PLATFORMS.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform.id);
                        const canSelect = selectedPlatforms.length < selectedPlanData.maxTemplates;
                        const isDisabled = !isSelected && !canSelect;

                        return (
                          <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            disabled={isDisabled}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : isDisabled
                                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{platform.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-gray-900 truncate">
                                    {platform.name}
                                  </p>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-1">
                                  {platform.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedPlatforms.length === 0 && (
                      <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Please select at least one platform
                      </p>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                {selectedPlanData && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Plan</span>
                        <span className="font-semibold">
                          {selectedPlanData.name}
                          {isTestUser ? ' (Test Access)' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Headshots</span>
                        <span className="font-semibold">{selectedPlanData.headshots}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Platforms</span>
                        <span className="font-semibold">{selectedPlatforms.length} selected</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span>
                          {isTestUser ? '$0 (included in test account)' : `$${selectedPlanData.price}`}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleSubmit}
                      isLoading={isUploading}
                      disabled={selectedFiles.length < minUploadCount || selectedPlatforms.length === 0 || isUploading}
                    >
                      {!isUploading && (
                        <>
                          <>
                            Start Generation
                            <Check className="w-5 h-5" />
                          </>
                        </>
                      )}
                    </Button>

                    {isUploading && (
                      <p className="text-sm text-center text-gray-600 mt-3">
                        Uploading photos… {uploadProgress}%
                      </p>
                    )}

                    {uploadError && (
                      <p className="text-sm text-center text-red-600 mt-3">
                        {uploadError}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 text-center mt-4">
                      {isTestUser
                        ? 'Demo access active • No payment required'
                        : 'Uploads are encrypted and processed securely'}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
