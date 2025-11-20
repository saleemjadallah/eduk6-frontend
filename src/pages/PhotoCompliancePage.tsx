import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Image as ImageIcon, DollarSign, Clock, Sparkles, Download, ArrowLeft } from 'lucide-react';
import Button from '../components/gamma/Button';
import Card from '../components/gamma/Card';
import Badge from '../components/gamma/Badge';
import SectionHeader from '../components/gamma/SectionHeader';

const VISA_PHOTO_SPECS = {
  uae_visa: {
    id: 'uae_visa',
    name: 'UAE Visa Photo',
    flag: '🇦🇪',
    dimensions: '600x600px',
    background: 'White (#FFFFFF)',
    faceSize: '70-80% of frame',
    price: 20,
    processingTime: '2-3 minutes',
    specs: [
      'Dimensions: 600x600 pixels (1:1 ratio)',
      'Background: Pure white',
      'Face size: 70-80% of total area',
      'Recent photo (last 6 months)',
      'No glasses, headwear, or filters',
      'Neutral expression, eyes open',
    ],
  },
  schengen_visa: {
    id: 'schengen_visa',
    name: 'Schengen Visa Photo',
    flag: '🇪🇺',
    dimensions: '35x45mm (826x1063px)',
    background: 'Light grey (#E0E0E0)',
    faceSize: '70-80% of frame',
    price: 25,
    processingTime: '2-3 minutes',
    specs: [
      'Dimensions: 35x45mm (826x1063 pixels)',
      'Background: Light grey',
      'Face size: 70-80% of total area',
      'Photo taken within last 3 months',
      'No head coverings (except religious)',
      'Neutral facial expression',
    ],
  },
  us_visa: {
    id: 'us_visa',
    name: 'US Visa Photo',
    flag: '🇺🇸',
    dimensions: '2x2 inches (600x600px)',
    background: 'White (#FFFFFF)',
    faceSize: '50-69% of frame',
    price: 25,
    processingTime: '2-3 minutes',
    specs: [
      'Dimensions: 2x2 inches (600x600 pixels)',
      'Background: White or off-white',
      'Head size: 50-69% of total area',
      'Photo taken within last 6 months',
      'No glasses allowed',
      'Neutral expression, both eyes open',
    ],
  },
  passport_photo: {
    id: 'passport_photo',
    name: 'Passport Photo (International)',
    flag: '🌍',
    dimensions: '35x45mm',
    background: 'White or light grey',
    faceSize: '70-80% of frame',
    price: 20,
    processingTime: '2-3 minutes',
    specs: [
      'Dimensions: 35x45mm (standard)',
      'Background: White or light grey',
      'Face centered, looking straight',
      'Recent photo (last 6 months)',
      'No shadows on face or background',
      'High resolution (minimum 600 DPI)',
    ],
  },
  saudi_visa: {
    id: 'saudi_visa',
    name: 'Saudi Visa Photo',
    flag: '🇸🇦',
    dimensions: '4x6cm (472x708px)',
    background: 'White (#FFFFFF)',
    faceSize: '70-80% of frame',
    price: 20,
    processingTime: '2-3 minutes',
    specs: [
      'Dimensions: 4x6cm (472x708 pixels)',
      'Background: White',
      'Face clearly visible, no shadows',
      'Photo taken within last 6 months',
      'No head coverings (men)',
      'Professional appearance',
    ],
  },
};

export default function PhotoCompliancePage() {
  const [selectedVisaType, setSelectedVisaType] = useState<keyof typeof VISA_PHOTO_SPECS | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedPhotoUrl, setProcessedPhotoUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type.startsWith('image/')
      );
      setUploadedPhotos((prev) => [...prev, ...files].slice(0, 1)); // Only one photo
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (file) => file.type.startsWith('image/')
      );
      setUploadedPhotos((prev) => [...prev, ...files].slice(0, 1)); // Only one photo
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessRequest = async () => {
    if (!selectedVisaType || uploadedPhotos.length === 0) return;

    setLoading(true);
    setError(null);

    const photo = uploadedPhotos[0];
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('visaType', selectedVisaType);

    try {
      // TODO: Replace with VITE_API_URL from .env
      const response = await fetch('http://localhost:3000/api/photo/process-compliance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Something went wrong');
      }

      const result = await response.json();
      setProcessedPhotoUrl(result.processedPhotoUrl);

    } catch (err: any) {
      setError(err.message || 'Failed to process photo.');
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setSelectedVisaType(null);
    setUploadedPhotos([]);
    setProcessedPhotoUrl(null);
    setError(null);
  };

  if (processedPhotoUrl) {
    return (
      <div className="min-h-screen bg-white py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Your Compliant Photo is Ready!</h1>
            <p className="text-lg text-neutral-600">Download your AI-corrected photo or start over.</p>
          </SectionHeader>

          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Original Photo</h3>
                <img
                  src={URL.createObjectURL(uploadedPhotos[0])}
                  alt="Original upload"
                  className="rounded-xl w-full aspect-square object-cover border-2"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI-Corrected Photo
                </h3>
                <img
                  src={processedPhotoUrl}
                  alt="Processed compliant"
                  className="rounded-xl w-full aspect-square object-cover border-2 border-purple-500"
                />
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="gradient"
                size="xl"
                onClick={() => {
                  // Trigger download
                  const link = document.createElement('a');
                  link.href = processedPhotoUrl;
                  link.download = 'compliant-photo.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Photo
              </Button>
              <Button variant="outline" size="xl" onClick={resetProcess} className="ml-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Start Over
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4 inline-flex">
              <Camera className="w-4 h-4 mr-2" />
              AI Photo Generator
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              AI-Powered Visa Photos
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Upload a selfie, and we'll generate a compliant photo with the right dimensions, background, and facial sizing for your visa application.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-600 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">~1 minute</strong> processing
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">AED 20-25</strong> per photo
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">Guaranteed Compliance</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Visa Type */}
          <div className="mb-12">
            <SectionHeader className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">Step 1: Choose Document</h2>
              <p className="text-lg text-neutral-600">Select the type of document photo you need.</p>
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(VISA_PHOTO_SPECS).map(([key, visa]) => {
                const isSelected = selectedVisaType === key;

                return (
                  <motion.div
                    key={key}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedVisaType(key as keyof typeof VISA_PHOTO_SPECS)}
                    className={`
                      cursor-pointer rounded-3xl p-6 transition-all duration-300
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl scale-105'
                          : 'bg-white hover:shadow-xl border-2 border-neutral-200 hover:border-purple-300'
                      }
                    `}
                  >
                    <div className="text-5xl mb-4">{visa.flag}</div>

                    <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {visa.name}
                    </h3>

                    <div className={`space-y-1 text-sm mb-4 ${isSelected ? 'text-purple-100' : 'text-neutral-600'}`}>
                      <p>📏 {visa.dimensions}</p>
                      <p>🎨 {visa.background}</p>
                      <p>👤 {visa.faceSize}</p>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        AED {visa.price}
                      </span>
                      <span className={`text-sm ${isSelected ? 'text-purple-200' : 'text-neutral-500'}`}>
                        per photo
                      </span>
                    </div>

                    <div className={`text-sm ${isSelected ? 'text-purple-200' : 'text-neutral-500'}`}>
                      {visa.processingTime}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Upload Your Selfie */}
          {selectedVisaType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <SectionHeader className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Step 2: Upload Your Selfie</h2>
                <p className="text-lg text-neutral-600">
                  Provide a clear, front-facing selfie. We'll handle the rest.
                </p>
              </SectionHeader>

              <Card className="max-w-3xl mx-auto">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : uploadedPhotos.length > 0
                        ? 'border-green-500 bg-green-50'
                        : 'border-neutral-300 hover:border-purple-400 hover:bg-neutral-50'
                    }
                  `}
                >
                  {uploadedPhotos.length > 0 ? (
                    <div className="space-y-6">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 mb-2">
                          Photo Uploaded!
                        </p>
                        <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto mb-4">
                          {uploadedPhotos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Upload ${idx + 1}`}
                                className="w-full aspect-square object-cover rounded-xl border-2 border-neutral-200"
                              />
                              <button
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => inputRef.current?.click()} className="mx-auto">
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-16 h-16 text-neutral-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 mb-2">
                          Drag and drop your selfie here
                        </p>
                        <p className="text-sm text-neutral-600 mb-4">
                          or click to browse (JPG, PNG, HEIC - max 10MB)
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button variant="gradient" className="mx-auto">
                          Browse Photos
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className="mt-8 p-6 bg-purple-50 rounded-2xl">
                  <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    We will generate a photo that meets these requirements:
                  </h4>
                  <ul className="space-y-2">
                    {VISA_PHOTO_SPECS[selectedVisaType].specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Check & Pay */}
          {selectedVisaType && uploadedPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Generate Your Photo?</h3>
                  <p className="text-neutral-600 mb-6">
                    Our AI will generate a fully compliant photo from your selfie.
                  </p>

                  <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-4xl font-bold text-neutral-900">
                      AED {VISA_PHOTO_SPECS[selectedVisaType].price}
                    </span>
                    <span className="text-neutral-600">one-time payment</span>
                  </div>

                  <Button
                    variant="gradient"
                    size="xl"
                    onClick={handleProcessRequest}
                    disabled={loading}
                    className="shadow-2xl shadow-purple-500/50"
                  >
                    {loading ? 'Generating Your Photo...' : 'Generate & Proceed to Payment'}
                  </Button>

                  {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

                  <p className="text-sm text-neutral-500 mt-4">
                    Powered by AI • Secure Payment via Stripe • Money-back Guarantee
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Simple, Fast, and Compliant</h2>
            <p className="text-lg text-neutral-600">From selfie to visa-ready photo in three easy steps.</p>
          </SectionHeader>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload Selfie</h3>
              <p className="text-neutral-600">
                Choose your document type and upload a selfie.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">AI Generation</h3>
              <p className="text-neutral-600">
                Our AI creates a new photo meeting all official requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Download</h3>
              <p className="text-neutral-600">
                Pay and instantly download your compliant photo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
