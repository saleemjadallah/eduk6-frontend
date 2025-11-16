import React, { useEffect, useState } from 'react';
import { Camera, Download, Upload, Eye, MessageCircle, Check } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';

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

  const [hasUploadedPhotos, setHasUploadedPhotos] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('uae');
  const [generatedPhotos] = useState<VisaPhoto[]>([
    { id: '1', format: 'uae', url: '#', specifications: { width: 43, height: 55, dpi: 600, background: 'white' } },
    { id: '2', format: 'uae', url: '#', specifications: { width: 43, height: 55, dpi: 600, background: 'white' } },
    { id: '3', format: 'schengen', url: '#', specifications: { width: 35, height: 45, dpi: 600, background: 'white' } },
  ]);

  useEffect(() => {
    updateWorkflow('photo');
    addRecentAction('Entered Photo Compliance workflow');
  }, [updateWorkflow, addRecentAction]);

  const getPhotosForFormat = (format: string) => generatedPhotos.filter((p) => p.format === format);

  const handlePhotoUpload = (files: FileList) => {
    addRecentAction('Uploaded photos', { count: files.length });
    setHasUploadedPhotos(true);
  };

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
                className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Drag and drop your photos here</p>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)} />
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getPhotosForFormat(selectedFormat).map((photo) => (
                  <div key={photo.id} className="bg-neutral-50 rounded-xl border overflow-hidden group">
                    <div className="aspect-[3/4] bg-neutral-200 relative flex items-center justify-center">
                      <Camera className="w-12 h-12 text-neutral-400" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
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
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">Photo Requirements</h3>
          <div className="space-y-3 mb-6">
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Dimensions</p><p className="text-sm font-medium">{VISA_PHOTO_SPECS[selectedFormat].dimensions}</p></div>
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Background</p><p className="text-sm font-medium">{VISA_PHOTO_SPECS[selectedFormat].background}</p></div>
            <div className="p-3 bg-neutral-50 rounded-lg"><p className="text-xs font-semibold text-neutral-500">Face Size</p><p className="text-sm font-medium">{VISA_PHOTO_SPECS[selectedFormat].faceSize}</p></div>
          </div>
          <button onClick={() => askJeffrey(`Tell me about ${VISA_PHOTO_SPECS[selectedFormat].name} photo requirements`)} className="w-full px-4 py-2 rounded-lg border text-sm font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />Ask Jeffrey
          </button>
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2"><Check className="w-4 h-4" />All Photos Meet Requirements:</p>
            <ul className="space-y-1 text-sm text-green-600">
              <li>• Correct dimensions</li>
              <li>• Proper background color</li>
              <li>• High resolution (600 DPI)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg"><Camera className="w-5 h-5" />Generate More Formats</button>
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50"><Download className="w-5 h-5" />Download All Photos</button>
      </div>
    </div>
  );
};
