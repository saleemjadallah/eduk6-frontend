/**
 * AI Form Filler - Upload Page
 * Allows users to upload PDF forms for AI extraction and filling
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractFormFields, mapFieldsToProfile } from '../lib/api-formfiller';
import ConfidenceIndicator from '../components/formfiller/ConfidenceIndicator';
import type { ExtractedField } from '../types/formfiller';

export default function FormFillerUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [documentType, setDocumentType] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setExtractedFields([]);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Process uploaded PDF
  const handleExtractFields = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');
    setProcessingStage('Uploading PDF...');

    try {
      // Step 1: Extract fields from PDF
      setProcessingStage('Extracting form fields with AI...');
      const extractionResult = await extractFormFields(selectedFile);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || 'Failed to extract form fields');
      }

      const { extraction, documentType: detectedType } = extractionResult.data;
      setExtractedFields(extraction.fields);
      setDocumentType(detectedType);

      // Step 2: Map fields to user profile
      setProcessingStage('Mapping fields to your profile...');
      const mappingResult = await mapFieldsToProfile(extraction.fields);

      if (!mappingResult.success || !mappingResult.data) {
        throw new Error(mappingResult.error || 'Failed to map fields');
      }

      const populatedFields = mappingResult.data.populatedFields;
      setProcessingStage('');
      setIsProcessing(false);

      // Show success message briefly, then navigate to review page
      setTimeout(() => {
        navigate('/form-filler/review', {
          state: {
            file: selectedFile,
            extractedFields: extraction.fields,
            fieldMappings: populatedFields,
            documentType: detectedType,
          },
        });
      }, 1000);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to process PDF. Please try again.');
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Form Filler</h1>
          <p className="text-gray-600">
            Upload your PDF form and let AI fill it automatically using your profile data
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {selectedFile ? (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Choose different file
                </button>
              </>
            ) : (
              <>
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your PDF here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 mt-4">Maximum file size: 10MB</p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Process Button */}
          {selectedFile && !isProcessing && extractedFields.length === 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleExtractFields}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Extract & Fill Form
              </button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-700">{processingStage}</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  This may take 10-30 seconds depending on form complexity...
                </p>
              </div>
            </div>
          )}

          {/* Success State - Brief preview before navigation */}
          {!isProcessing && extractedFields.length > 0 && (
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-center mb-3">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="ml-3 text-lg font-medium text-green-800">
                    Successfully extracted {extractedFields.length} fields!
                  </span>
                </div>
                <p className="text-sm text-green-700 text-center mb-4">
                  Document Type: <span className="font-medium">{documentType}</span>
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Redirecting to review page...
                </p>
              </div>

              {/* Quick preview of extracted fields */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Extracted Fields Preview:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {extractedFields.slice(0, 5).map((field, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <ConfidenceIndicator
                          confidence={field.confidence}
                          size="sm"
                          showPercentage={false}
                        />
                        <span className="text-gray-500 font-mono text-xs">
                          {field.value || '(empty)'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {extractedFields.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      + {extractedFields.length - 5} more fields...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How it Works Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Upload PDF Form</h3>
              <p className="text-sm text-gray-600">
                Upload any fillable PDF form (visa applications, government forms, etc.)
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">AI Extraction & Mapping</h3>
              <p className="text-sm text-gray-600">
                AI extracts form fields and maps them to your profile data automatically
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Review & Download</h3>
              <p className="text-sm text-gray-600">
                Review auto-filled data, make adjustments if needed, and download completed form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
