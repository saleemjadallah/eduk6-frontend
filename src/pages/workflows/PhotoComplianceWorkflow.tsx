import React, { useEffect, useState } from 'react';
import { Camera, Download, Upload, Eye, MessageCircle, Check } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';
import { onboardingApi } from '../../lib/api';

interface VisaPhoto {
  id: string;
  format: string;
  url: string;
  specifications: {
    width: number;
    height: number;
    dpi: number;
    background: string;
  };
}

interface PhotoSpecs {
  name: string;
  dimensions: string;
  background: string;
  faceSize: string;
  dpi: number;
}

const VISA_PHOTO_SPECS: Record<string, PhotoSpecs> = {
  uae: {
    name: 'UAE Visa',
    dimensions: '4.3cm x 5.5cm',
    background: 'White',
    faceSize: '70-80% of frame',
    dpi: 600,
  },
  schengen: {
    name: 'Schengen',
    dimensions: '3.5cm x 4.5cm',
    background: 'Light gray or white',
    faceSize: '70-80% of frame',
    dpi: 600,
  },
  us: {
    name: 'US Visa',
    dimensions: '2" x 2" (51mm x 51mm)',
    background: 'White',
    faceSize: '50-69% of frame',
    dpi: 600,
  },
  passport: {
    name: 'Passport Photo',
    dimensions: '35mm x 45mm',
    background: 'White',
    faceSize: '70-80% of frame',
    dpi: 600,
  },
};

export const PhotoComplianceWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();

  const [hasUploadedPhotos, setHasUploadedPhotos] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('uae');
  const [generatedPhotos, setGeneratedPhotos] = useState<VisaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [visaPhotoSpecs, setVisaPhotoSpecs] = useState<PhotoSpecs | null>(null);

  useEffect(() => {
    updateWorkflow('photo');
    addRecentAction('Entered Photo Compliance workflow');
    loadPhotoData();
  }, [updateWorkflow, addRecentAction]);

  const loadPhotoData = async () => {
    setIsLoading(true);
    try {
      // Fetch onboarding status to get photo requirements
      const response = await onboardingApi.getStatus();

      if (response.success && response.data?.travelProfile?.visaRequirements?.photoRequirements) {
        const { destinationCountry: dest, visaRequirements } = response.data.travelProfile;
        const { photoRequirements } = visaRequirements;

        setDestinationCountry(dest);

        // Set the visa-specific photo specs from onboarding
        const countrySpecs: PhotoSpecs = {
          name: `${dest} Visa Photo`,
          dimensions: photoRequirements.dimensions,
          background: photoRequirements.background,
          faceSize: '70-80% of frame', // Default, can be enriched from backend
          dpi: 600,
        };

        setVisaPhotoSpecs(countrySpecs);

        // Determine default format based on destination
        const formatKey = dest.toLowerCase().includes('uae') ? 'uae' :
                         dest.toLowerCase().includes('us') ? 'us' :
                         dest.toLowerCase().includes('schengen') || dest.toLowerCase().includes('europe') ? 'schengen' :
                         'passport';
        setSelectedFormat(formatKey);
      }

      // TODO: Fetch user's generated photos from API
      setGeneratedPhotos([]);
      setHasUploadedPhotos(false);
    } catch (error) {
      console.error('Failed to load photo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhotosForFormat = (format: string) => generatedPhotos.filter((p) => p.format === format);

  const handlePhotoUpload = (files: FileList) => {
    addRecentAction('Uploaded photos', { count: files.length });
    setHasUploadedPhotos(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading photo data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb>
        <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
        <BreadcrumbItem active>AI Photo Compliance</BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Photo Compliance</h1>
        <p className="text-xl text-neutral-600">Generate perfect visa photos that meet every country's requirements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200">
          {!hasUploadedPhotos ? (
            <div>
              <h3 className="text-2xl font-bold mb-4">Upload Your Photos</h3>
              <div
                className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Drag and drop your photos here</p>
                <p className="text-sm text-neutral-500 mb-4">or click to browse files</p>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    askJeffrey('What type of photos should I upload for visa compliance?');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Jeffrey for Tips
                </button>
              </div>
            </div>
          ) : generatedPhotos.length === 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Visa Photos</h3>
                <span className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full font-semibold">No photos generated</span>
              </div>

              <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
                <Camera className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-neutral-700 mb-2">No Generated Photos Yet</h4>
                <p className="text-neutral-500 mb-4">
                  Your uploaded photos are being processed. Click below to generate visa-compliant photos.
                </p>
                <button
                  onClick={() => askJeffrey('How do I generate visa-compliant photos from my uploads?')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Jeffrey How to Generate
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Visa Photos</h3>
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">{generatedPhotos.length} photos ready</span>
              </div>

              <div className="flex border-b border-neutral-200 mb-6">
                {Object.entries(VISA_PHOTO_SPECS).map(([key, specs]) => (
                  <button key={key} onClick={() => setSelectedFormat(key)} className={cn('px-4 py-3 font-semibold text-sm border-b-2', selectedFormat === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-600')}>
                    {specs.name}
                  </button>
                ))}
              </div>

              {getPhotosForFormat(selectedFormat).length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No photos for {VISA_PHOTO_SPECS[selectedFormat].name} format</p>
                  <p className="text-xs text-neutral-400 mt-1">Generate photos for this format</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getPhotosForFormat(selectedFormat).map((photo) => (
                    <div key={photo.id} className="bg-neutral-50 rounded-xl border overflow-hidden group">
                      <div className="aspect-[3/4] bg-neutral-200 relative flex items-center justify-center">
                        <Camera className="w-12 h-12 text-neutral-400" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button className="p-2 bg-white rounded-lg"><Eye className="w-5 h-5" /></button>
                          <button className="p-2 bg-white rounded-lg"><Download className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold">{VISA_PHOTO_SPECS[selectedFormat].dimensions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">
            Photo Requirements
            {destinationCountry && <span className="text-sm font-normal text-gray-600 ml-2">for {destinationCountry}</span>}
          </h3>
          <div className="space-y-3 mb-6">
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Dimensions</p><p className="text-sm font-medium">{visaPhotoSpecs?.dimensions || VISA_PHOTO_SPECS[selectedFormat].dimensions}</p></div>
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Background</p><p className="text-sm font-medium">{visaPhotoSpecs?.background || VISA_PHOTO_SPECS[selectedFormat].background}</p></div>
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Face Size</p><p className="text-sm font-medium">{visaPhotoSpecs?.faceSize || VISA_PHOTO_SPECS[selectedFormat].faceSize}</p></div>
          </div>
          {destinationCountry && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-700">
                <strong>Note:</strong> These specifications are specifically for your {destinationCountry} visa application based on your onboarding profile.
              </p>
            </div>
          )}
          <button onClick={() => askJeffrey(`Tell me about ${visaPhotoSpecs?.name || VISA_PHOTO_SPECS[selectedFormat].name} photo requirements`)} className="w-full px-4 py-2 rounded-lg border text-sm font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />Ask Jeffrey
          </button>
          {generatedPhotos.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2"><Check className="w-4 h-4" />All Photos Meet Requirements:</p>
              <ul className="space-y-1 text-sm text-green-600">
                <li>• Correct dimensions</li>
                <li>• Proper background color</li>
                <li>• High resolution (600 DPI)</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          disabled={!hasUploadedPhotos}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Camera className="w-5 h-5" />Generate More Formats
        </button>
        <button
          disabled={generatedPhotos.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-5 h-5" />Download All Photos
        </button>
      </div>
    </div>
  );
};
