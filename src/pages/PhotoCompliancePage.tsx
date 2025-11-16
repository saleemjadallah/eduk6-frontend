import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, Image as ImageIcon, DollarSign, Clock, Sparkles } from 'lucide-react';
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
      setUploadedPhotos((prev) => [...prev, ...files].slice(0, 5)); // Max 5 photos
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (file) => file.type.startsWith('image/')
      );
      setUploadedPhotos((prev) => [...prev, ...files].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheck = async () => {
    if (!selectedVisaType || uploadedPhotos.length === 0) return;

    setLoading(true);
    // TODO: Implement API call to check photo compliance
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4 inline-flex">
              <Camera className="w-4 h-4 mr-2" />
              AI Photo Analysis
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              AI Photo Compliance
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Ensures uploaded photos meet exact size, background, and facial requirements for specific GCC visa types.
              Auto-corrects if needed.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-600 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">2-3 minutes</strong> processing
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">AED 20-25</strong> per photo set
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">Auto-correction</strong> included
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Visa Type */}
          <div className="mb-12">
            <SectionHeader className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">Step 1: Select Visa Type</h2>
              <p className="text-lg text-neutral-600">Choose the visa type you need photos for</p>
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
                        per set
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

          {/* Step 2: Upload Photos */}
          {selectedVisaType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <SectionHeader className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Step 2: Upload Photos</h2>
                <p className="text-lg text-neutral-600">
                  Upload 1-5 photos for {VISA_PHOTO_SPECS[selectedVisaType].name} compliance check
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
                          {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'photo' : 'photos'} uploaded
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4">
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
                      {uploadedPhotos.length < 5 && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button variant="outline" className="mx-auto">
                            Add More Photos ({5 - uploadedPhotos.length} remaining)
                          </Button>
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-16 h-16 text-neutral-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 mb-2">
                          Drag and drop your photos here
                        </p>
                        <p className="text-sm text-neutral-600 mb-4">
                          or click to browse (JPG, PNG - Max 5 photos, 5MB each)
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
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
                    {VISA_PHOTO_SPECS[selectedVisaType].name} Requirements:
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
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Check Compliance?</h3>
                  <p className="text-neutral-600 mb-6">
                    We'll analyze your photos for compliance and auto-correct them if needed
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
                    onClick={handleCheck}
                    disabled={loading}
                    className="shadow-2xl shadow-purple-500/50"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <p className="text-sm text-neutral-500 mt-4">
                    Powered by AI • Secure Payment via Stripe • Instant Results + Corrected Photos
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
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-600">Automated photo compliance checking and correction</p>
          </SectionHeader>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload Photos</h3>
              <p className="text-neutral-600">
                Select visa type and upload 1-5 photos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">AI Analysis</h3>
              <p className="text-neutral-600">
                Checks dimensions, background, face size, and quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Get Results</h3>
              <p className="text-neutral-600">
                Download compliant photos with auto-corrections applied
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
