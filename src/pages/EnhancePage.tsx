import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Sparkles,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heic2any from 'heic2any';

interface EnhancedImage {
  id: string;
  originalUrl: string;
  enhancedUrl: string;
  name: string;
  status: 'processing' | 'completed' | 'error';
}

export function EnhancePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EnhancedImage | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [enhancementType, setEnhancementType] = useState<'vibrant' | 'natural' | 'dramatic'>('vibrant');

  // Check if file is actually HEIC/HEIF by reading magic bytes
  const isActuallyHeic = async (file: File): Promise<boolean> => {
    try {
      const buffer = await file.slice(0, 12).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const header = Array.from(bytes.slice(4, 12))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Check for HEIF/HEIC magic bytes
      return header.includes('667479706865') ||    // 'ftyphe' for HEIF
             header.includes('6674797068656963') || // 'ftypheic' for HEIC
             header.includes('6674797068656978');   // 'ftypheix' for HEIC variants
    } catch (error) {
      console.error('Error reading file header:', error);
      return false;
    }
  };

  // Convert HEIC/HEIF to JPEG using heic2any library
  const convertToJpeg = async (file: File): Promise<File> => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.95,
      });

      // heic2any can return a Blob or Blob[] - handle both cases
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const newFile = new File([blob], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      return newFile;
    } catch (error) {
      console.error('HEIC conversion error:', error);
      throw new Error('Failed to convert HEIC/HEIF image');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const rawFiles = Array.from(e.dataTransfer.files);
    const processedFiles: File[] = [];

    for (const file of rawFiles) {
      // Check if it's a HEIC/HEIF file by extension, MIME type, or magic bytes
      const isHeicByName = file.name.toLowerCase().endsWith('.heic') ||
                           file.name.toLowerCase().endsWith('.heif');
      const isHeicByMime = file.type === 'image/heic' ||
                           file.type === 'image/heif';
      const isHeicByContent = await isActuallyHeic(file);

      const isHeic = isHeicByName || isHeicByMime || isHeicByContent;

      if (isHeic) {
        try {
          toast({
            title: "Converting HEIC image",
            description: `Converting ${file.name} to JPEG...`,
          });
          const convertedFile = await convertToJpeg(file);
          processedFiles.push(convertedFile);
          toast({
            title: "Conversion successful",
            description: `${file.name} has been converted to JPEG`,
          });
        } catch (error) {
          console.error('Failed to convert HEIC:', error);
          // Fallback: upload original so backend conversion can handle it
          processedFiles.push(file);
          toast({
            title: "Using original HEIC image",
            description: `Browser conversion failed for ${file.name}. We'll upload it as-is and convert it on the server.`,
            duration: 8000,
          });
        }
      } else if (file.type.startsWith('image/')) {
        processedFiles.push(file);
      }
    }

    if (processedFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please upload valid image files",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...processedFiles]);
  }, [toast]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    const processedFiles: File[] = [];

    for (const file of rawFiles) {
      // Check if it's a HEIC/HEIF file by extension, MIME type, or magic bytes
      const isHeicByName = file.name.toLowerCase().endsWith('.heic') ||
                           file.name.toLowerCase().endsWith('.heif');
      const isHeicByMime = file.type === 'image/heic' ||
                           file.type === 'image/heif';
      const isHeicByContent = await isActuallyHeic(file);

      const isHeic = isHeicByName || isHeicByMime || isHeicByContent;

      if (isHeic) {
        try {
          toast({
            title: "Converting HEIC image",
            description: `Converting ${file.name} to JPEG...`,
          });
          const convertedFile = await convertToJpeg(file);
          processedFiles.push(convertedFile);
          toast({
            title: "Conversion successful",
            description: `${file.name} has been converted to JPEG`,
          });
        } catch (error) {
          console.error('Failed to convert HEIC:', error);
          // Fallback: upload original so backend conversion can handle it
          processedFiles.push(file);
          toast({
            title: "Using original HEIC image",
            description: `Browser conversion failed for ${file.name}. We'll upload it as-is and convert it on the server.`,
            duration: 8000,
          });
        }
      } else if (file.type.startsWith('image/')) {
        processedFiles.push(file);
      } else {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
      }
    }

    if (processedFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...processedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateEnhancement = async (file: File): Promise<string> => {
    // This simulates AI enhancement by applying CSS filters
    // In production, this would call your AI API
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // For demo, we'll return the same image with a note that it's "enhanced"
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEnhance = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one image to enhance",
        variant: "destructive",
      });
      return;
    }

    const totalFiles = selectedFiles.length;
    let successCount = 0;
    let errorCount = 0;

    // Show starting toast
    toast({
      title: "Starting enhancement",
      description: `Processing ${totalFiles} image(s)...`,
    });

    // Process each file
    for (const file of selectedFiles) {
      const imageId = Math.random().toString(36).substr(2, 9);

      // Add to UI in processing state
      const processingImage: EnhancedImage = {
        id: imageId,
        originalUrl: URL.createObjectURL(file),
        enhancedUrl: '',
        name: file.name,
        status: 'processing'
      };

      setEnhancedImages(prev => [...prev, processingImage]);

      try {
        // Create FormData for upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('enhancementType', enhancementType);

        // Call backend API with session cookie authentication
        const response = await fetch('https://api.mydscvr.ai/api/enhance-image', {
          method: 'POST',
          credentials: 'include', // Include session cookies
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = 'Enhancement failed';
          let errorDetails = '';

          try {
            const errorData = await response.json();
            console.error('API Error:', errorData);

            // Parse specific error types and provide helpful messages
            if (errorData.error?.includes('HEIF') || errorData.error?.includes('HEIC')) {
              errorMessage = 'HEIC/HEIF format detected';
              errorDetails = 'This image appears to be in HEIC format. It should have been converted automatically. Please try again or use an online converter.';
            } else if (errorData.error?.includes('format') || errorData.details?.includes('format')) {
              errorMessage = 'Unsupported image format';
              errorDetails = errorData.details || 'Please use JPEG, PNG, or WebP format. If you have a HEIC file, our app will convert it automatically.';
            } else if (response.status === 401 || response.status === 403) {
              errorMessage = 'Authentication required';
              errorDetails = 'Please log in again to continue enhancing images.';
            } else if (response.status === 413) {
              errorMessage = 'File too large';
              errorDetails = 'Please use an image smaller than 10MB.';
            } else if (response.status === 429) {
              errorMessage = 'Too many requests';
              errorDetails = 'Please wait a moment before trying again.';
            } else if (response.status >= 500) {
              errorMessage = 'Server error';
              errorDetails = 'Our servers are experiencing issues. Please try again in a few moments.';
            } else {
              errorMessage = errorData.error || 'Enhancement failed';
              errorDetails = errorData.details || `Status: ${response.status}`;
            }
          } catch (parseError) {
            // If we can't parse JSON, use generic error
            const errorText = await response.text();
            console.error('API Error (text):', errorText);
            errorMessage = 'Enhancement failed';
            errorDetails = `Server returned status ${response.status}. Please try again.`;
          }

          throw new Error(JSON.stringify({ message: errorMessage, details: errorDetails }));
        }

        const result = await response.json();

        // Update image with enhanced URL from R2
        setEnhancedImages(prev => prev.map(img =>
          img.id === imageId
            ? {
                ...img,
                originalUrl: result.originalUrl,
                enhancedUrl: result.enhancedUrl,
                status: 'completed'
              }
            : img
        ));

        successCount++;
      } catch (error) {
        console.error('Enhancement error for', file.name, ':', error);
        errorCount++;

        setEnhancedImages(prev => prev.map(img =>
          img.id === imageId
            ? { ...img, status: 'error' }
            : img
        ));

        // Parse error message
        let errorTitle = 'Enhancement failed';
        let errorDescription = `Failed to enhance ${file.name}`;

        if (error instanceof Error) {
          try {
            // Try to parse structured error
            const errorData = JSON.parse(error.message);
            errorTitle = errorData.message || errorTitle;
            errorDescription = `${file.name}: ${errorData.details || 'Unknown error'}`;
          } catch {
            // If not JSON, use the error message directly
            errorTitle = 'Enhancement failed';
            errorDescription = `${file.name}: ${error.message}`;
          }
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
          duration: 7000, // Show for 7 seconds so user can read it
        });
      }
    }

    // Clear selected files
    setSelectedFiles([]);

    // Show final result
    if (successCount > 0) {
      toast({
        title: "Enhancement complete",
        description: `Successfully enhanced ${successCount} of ${totalFiles} image(s)`,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Enhancement failed",
        description: `Failed to enhance all images. Please check your connection and try again.`,
        variant: "destructive",
      });
    }
  };

  const handleCompareMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-saffron flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AI Photo Enhance</h1>
                <p className="text-gray-600">Upload your dish photos and let AI enhance them to professional quality</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-saffron-600" />
                Upload Images
              </h2>

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-saffron-500 bg-saffron-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Drop your images here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WEBP, GIF, HEIC/HEIF up to 10MB each
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ✓ HEIC files will be automatically converted to JPG
                </p>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhancement Style Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enhancement Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnhancementType('vibrant')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      enhancementType === 'vibrant'
                        ? 'border-saffron-600 bg-saffron-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">🌈 Vibrant</span>
                      {enhancementType === 'vibrant' && <Check className="w-4 h-4 text-saffron-600" />}
                    </div>
                    <p className="text-xs text-gray-600">Rich colors, social media ready</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnhancementType('natural')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      enhancementType === 'natural'
                        ? 'border-saffron-600 bg-saffron-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">🍃 Natural</span>
                      {enhancementType === 'natural' && <Check className="w-4 h-4 text-saffron-600" />}
                    </div>
                    <p className="text-xs text-gray-600">Authentic, true-to-life tones</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnhancementType('dramatic')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      enhancementType === 'dramatic'
                        ? 'border-saffron-600 bg-saffron-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">🎬 Dramatic</span>
                      {enhancementType === 'dramatic' && <Check className="w-4 h-4 text-saffron-600" />}
                    </div>
                    <p className="text-xs text-gray-600">Bold contrast, cinematic</p>
                  </button>
                </div>
              </div>

              {/* Enhance Button */}
              <button
                onClick={handleEnhance}
                disabled={selectedFiles.length === 0}
                className="mt-4 w-full py-3 px-4 rounded-lg gradient-saffron text-white font-semibold
                         disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all
                         flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Enhance {selectedFiles.length > 0 && `(${selectedFiles.length})`} Images
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tips for Best Results
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use well-lit photos with the dish clearly visible</li>
                <li>• Avoid blurry or heavily filtered images</li>
                <li>• Center the dish in the frame</li>
                <li>• Upload images at least 800x800 pixels</li>
              </ul>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-saffron-600" />
                Enhanced Results
              </h2>

              {enhancedImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No enhanced images yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload and enhance images to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enhancedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="aspect-video relative bg-gray-100">
                        {image.status === 'processing' ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 text-saffron-600 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Enhancing image...</p>
                            </div>
                          </div>
                        ) : image.status === 'completed' ? (
                          <>
                            <img
                              src={image.enhancedUrl}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Enhanced
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Enhancement failed</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-700 truncate">{image.name}</p>

                        {image.status === 'completed' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setSelectedImage(image);
                                setIsComparing(true);
                              }}
                              className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                              Compare
                            </button>
                            <a
                              href={image.enhancedUrl}
                              download={`enhanced-${image.name}`}
                              className="flex-1 py-1.5 px-3 bg-saffron-100 hover:bg-saffron-200 text-saffron-700 rounded-lg text-sm font-medium transition-colors text-center"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Comparison Modal */}
        <AnimatePresence>
          {isComparing && selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setIsComparing(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Before & After Comparison</h3>
                  <button
                    onClick={() => setIsComparing(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  <div
                    className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-ew-resize"
                    onMouseMove={handleCompareMove}
                  >
                    {/* Original Image */}
                    <img
                      src={selectedImage.originalUrl}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-contain"
                    />

                    {/* Enhanced Image with Clip */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                    >
                      <img
                        src={selectedImage.enhancedUrl}
                        alt="Enhanced"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>

                    {/* Slider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${comparePosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <ChevronLeft className="w-3 h-3 text-gray-600 absolute -left-0.5" />
                        <ChevronRight className="w-3 h-3 text-gray-600 absolute -right-0.5" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      Original
                    </div>
                    <div className="absolute top-4 right-4 bg-saffron-600/90 text-white px-2 py-1 rounded text-sm">
                      Enhanced
                    </div>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Drag the slider to compare original and enhanced versions
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
