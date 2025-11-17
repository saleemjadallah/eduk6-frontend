import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, ExternalLink, Globe, AlertCircle, HelpCircle, CheckCircle2, Lightbulb, Eye, Download, ChevronRight, ArrowLeft, Sparkles, Edit3, LayoutList, FileImage } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';
import { onboardingApi, visaDocsApi } from '../../lib/api';
import { PDFDocument } from 'pdf-lib';

interface SuggestedForm {
  name: string;
  description: string;
  officialUrl: string;
  source: string;
  formType: string;
  instructions?: string;
}

interface AdditionalResource {
  title: string;
  url: string;
  description: string;
}

interface TravelProfile {
  destinationCountry: string;
  travelPurpose: string;
  nationality: string;
  visaRequirements?: {
    visaType: string;
  };
}

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'checkbox' | 'select' | 'textarea';
  label: string;
  value: string;
  hint?: string;
  suggestedValue?: string;
  source?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface UploadedForm {
  id: string;
  fileName: string;
  pdfBytes: ArrayBuffer;
  fields: FormField[];
  extractedAt: Date;
}

type ViewMode = 'browse' | 'fill' | 'preview';

export const FormFillerWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey, formSearchCache, setFormSearchCache } = useJeffrey();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [currentForm, setCurrentForm] = useState<UploadedForm | null>(null);

  // Data state
  const [suggestedForms, setSuggestedForms] = useState<SuggestedForm[]>([]);
  const [additionalResources, setAdditionalResources] = useState<AdditionalResource[]>([]);
  const [processingNotes, setProcessingNotes] = useState<string>('');
  const [travelProfile, setTravelProfile] = useState<TravelProfile | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingForms, setIsSearchingForms] = useState(false);
  const [formSearchError, setFormSearchError] = useState<string | null>(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [activeFieldHelp, setActiveFieldHelp] = useState<string | null>(null);

  // PDF view state
  const [showPDFView, setShowPDFView] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('form-filler');
    addRecentAction('Entered Form Filler workflow');
    loadFormData();
  }, [updateWorkflow, addRecentAction]);

  const getCacheKey = (profile: TravelProfile): string => {
    return `${profile.destinationCountry}-${profile.visaRequirements?.visaType || 'default'}-${profile.nationality}`;
  };

  const loadFormData = async () => {
    setIsLoading(true);
    setFormSearchError(null);
    try {
      const onboardingResponse = await onboardingApi.getStatus();

      if (onboardingResponse.success && onboardingResponse.data?.travelProfile) {
        const profile = onboardingResponse.data.travelProfile;
        setTravelProfile(profile);

        const cacheKey = getCacheKey(profile);

        if (formSearchCache && formSearchCache.cacheKey === cacheKey) {
          setSuggestedForms(formSearchCache.forms);
          setAdditionalResources(formSearchCache.additionalResources);
          setProcessingNotes(formSearchCache.processingNotes);
          setIsSearchingForms(false);
        } else {
          setIsSearchingForms(true);
          try {
            const formsResponse = await visaDocsApi.searchVisaForms({
              country: profile.destinationCountry,
              visaType: profile.visaRequirements?.visaType,
              purpose: profile.travelPurpose,
              nationality: profile.nationality
            });

            if (formsResponse.success && formsResponse.data) {
              const responseData = formsResponse.data;
              const forms = responseData.forms || [];
              const resources = responseData.additionalResources || [];
              const notes = responseData.processingNotes || '';

              setSuggestedForms(forms);
              setAdditionalResources(resources);
              setProcessingNotes(notes);

              setFormSearchCache({
                forms,
                additionalResources: resources,
                processingNotes: notes,
                cacheKey,
                cachedAt: new Date()
              });
            } else {
              setFormSearchError('Unable to find forms. Please try again later.');
            }
          } catch (searchError) {
            console.error('Failed to search visa forms:', searchError);
            setFormSearchError('Failed to search for visa forms. Please try again.');
          } finally {
            setIsSearchingForms(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract fields from PDF using pdf-lib
  const extractPDFFields = async (pdfBytes: ArrayBuffer): Promise<FormField[]> => {
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const pdfFields = form.getFields();

      const extractedFields: FormField[] = pdfFields.map((field, index) => {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;

        let type: FormField['type'] = 'text';
        let value = '';
        let options: string[] | undefined;

        if (fieldType === 'PDFTextField') {
          type = 'text';
          // @ts-expect-error: pdf-lib types
          value = field.getText() || '';
        } else if (fieldType === 'PDFCheckBox') {
          type = 'checkbox';
          // @ts-expect-error: pdf-lib types
          value = field.isChecked() ? 'true' : 'false';
        } else if (fieldType === 'PDFDropdown') {
          type = 'select';
          // @ts-expect-error: pdf-lib types
          options = field.getOptions();
          // @ts-expect-error: pdf-lib types
          value = field.getSelected()?.[0] || '';
        } else if (fieldType === 'PDFOptionList') {
          type = 'select';
          // @ts-expect-error: pdf-lib types
          options = field.getOptions();
          // @ts-expect-error: pdf-lib types
          value = field.getSelected()?.[0] || '';
        }

        // Generate a human-readable label from field name
        const label = fieldName
          .replace(/([A-Z])/g, ' $1')
          .replace(/[_-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        // Generate contextual hints based on field name patterns
        const hint = generateFieldHint(fieldName, label);
        const suggestedValue = generateSuggestedValue(fieldName, travelProfile);

        return {
          id: `field-${index}`,
          name: fieldName,
          type,
          label,
          value,
          hint,
          suggestedValue,
          source: suggestedValue ? 'Your Profile' : undefined,
          required: fieldName.toLowerCase().includes('required') || !fieldName.toLowerCase().includes('optional'),
          placeholder: `Enter ${label.toLowerCase()}`,
          options
        };
      });

      return extractedFields;
    } catch (error) {
      console.error('Error extracting PDF fields:', error);
      // No fallback - throw error to show user the PDF couldn't be processed
      throw new Error('Unable to extract form fields from this PDF. Please ensure you upload a fillable PDF form.');
    }
  };

  const generateFieldHint = (fieldName: string, label: string): string => {
    const lowerName = fieldName.toLowerCase();
    const lowerLabel = label.toLowerCase();

    if (lowerName.includes('surname') || lowerName.includes('family') || lowerName.includes('lastname')) {
      return 'Enter your family name exactly as it appears on your passport';
    }
    if (lowerName.includes('given') || lowerName.includes('firstname') || lowerName.includes('first_name')) {
      return 'Enter your given names as they appear on your passport';
    }
    if (lowerName.includes('passport') && lowerName.includes('number')) {
      return 'Your passport number is on the top right of your passport data page';
    }
    if (lowerName.includes('birth') && lowerName.includes('date')) {
      return 'Format: DD/MM/YYYY - Check your passport for exact date';
    }
    if (lowerName.includes('birth') && lowerName.includes('place')) {
      return 'City and country where you were born';
    }
    if (lowerName.includes('nationality')) {
      return 'Your current nationality as shown on passport';
    }
    if (lowerName.includes('address') || lowerLabel.includes('address')) {
      return 'Your current residential address';
    }
    if (lowerName.includes('phone') || lowerName.includes('tel')) {
      return 'Include country code (e.g., +1 for USA)';
    }
    if (lowerName.includes('email')) {
      return 'Use an email you check regularly for visa updates';
    }
    if (lowerName.includes('employer') || lowerName.includes('occupation')) {
      return 'Current job title or "Student" if studying';
    }
    if (lowerName.includes('purpose') || lowerName.includes('reason')) {
      return 'Brief description of why you are traveling';
    }
    if (lowerName.includes('duration') || lowerName.includes('stay')) {
      return 'Number of days you plan to stay';
    }
    if (lowerName.includes('arrival') || lowerName.includes('entry')) {
      return 'Planned date of arrival in destination country';
    }
    if (lowerName.includes('departure') || lowerName.includes('exit')) {
      return 'Planned date of leaving destination country';
    }
    return 'Fill in this field based on your current information';
  };

  const generateSuggestedValue = (fieldName: string, profile: TravelProfile | null): string | undefined => {
    if (!profile) return undefined;

    const lowerName = fieldName.toLowerCase();

    if (lowerName.includes('nationality') || lowerName.includes('citizen')) {
      return profile.nationality;
    }
    if (lowerName.includes('destination') || lowerName.includes('country') && lowerName.includes('visit')) {
      return profile.destinationCountry;
    }
    if (lowerName.includes('purpose') || lowerName.includes('reason')) {
      return profile.travelPurpose;
    }
    if (lowerName.includes('visa') && lowerName.includes('type')) {
      return profile.visaRequirements?.visaType;
    }
    return undefined;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsProcessingPDF(true);
    addRecentAction('Uploaded form', { fileName: file.name });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fields = await extractPDFFields(arrayBuffer);

      if (fields.length === 0) {
        alert('This PDF does not contain fillable form fields. Please upload a PDF with fillable fields, or download the official fillable version from the links above.');
        setIsProcessingPDF(false);
        return;
      }

      const uploadedForm: UploadedForm = {
        id: `form-${Date.now()}`,
        fileName: file.name,
        pdfBytes: arrayBuffer,
        fields,
        extractedAt: new Date()
      };

      setCurrentForm(uploadedForm);
      setViewMode('fill');
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error processing PDF. Please ensure you upload a fillable PDF form.';
      alert(errorMessage);
    } finally {
      setIsProcessingPDF(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    if (!currentForm) return;

    setCurrentForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(field =>
          field.id === fieldId ? { ...field, value } : field
        )
      };
    });
  };

  const handleApplySuggestion = (fieldId: string) => {
    if (!currentForm) return;

    const field = currentForm.fields.find(f => f.id === fieldId);
    if (field?.suggestedValue) {
      handleFieldChange(fieldId, field.suggestedValue);
      addRecentAction('Applied suggested value', { field: field.label });
    }
  };

  const handleAskJeffreyAboutField = (field: FormField) => {
    setActiveFieldHelp(field.id);
    askJeffrey(`How do I correctly fill the "${field.label}" field on my visa application form? I'm applying for a ${travelProfile?.visaRequirements?.visaType || 'visa'} to ${travelProfile?.destinationCountry || 'my destination country'}.`);
  };

  const handleStartEditLabel = (field: FormField) => {
    setEditingLabelId(field.id);
    setTempLabel(field.label);
  };

  const handleSaveLabel = (fieldId: string) => {
    if (!currentForm || !tempLabel.trim()) return;

    setCurrentForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(field =>
          field.id === fieldId ? {
            ...field,
            label: tempLabel.trim(),
            placeholder: `Enter ${tempLabel.trim().toLowerCase()}`,
            hint: generateFieldHint(field.name, tempLabel.trim())
          } : field
        )
      };
    });
    setEditingLabelId(null);
    setTempLabel('');
    addRecentAction('Renamed field label', { newLabel: tempLabel.trim() });
  };

  const handleCancelEditLabel = () => {
    setEditingLabelId(null);
    setTempLabel('');
  };

  const togglePDFView = () => {
    if (!showPDFView && currentForm && !pdfUrl) {
      // Create blob URL for PDF
      const blob = new Blob([currentForm.pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    }
    setShowPDFView(!showPDFView);
  };

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const getCompletionPercentage = (): number => {
    if (!currentForm) return 0;
    const filledFields = currentForm.fields.filter(f => f.value.trim() !== '').length;
    return Math.round((filledFields / currentForm.fields.length) * 100);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePreviewForm = () => {
    setViewMode('preview');
    addRecentAction('Previewing completed form');
  };

  const handleBackToFill = () => {
    setViewMode('fill');
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
    setCurrentForm(null);
  };

  const handleDownloadFilledForm = async () => {
    if (!currentForm) return;

    try {
      const pdfDoc = await PDFDocument.load(currentForm.pdfBytes);
      const form = pdfDoc.getForm();

      // Fill in the PDF fields with user values
      currentForm.fields.forEach(field => {
        try {
          const pdfField = form.getField(field.name);
          if (field.type === 'text' || field.type === 'textarea' || field.type === 'date') {
            // @ts-expect-error: pdf-lib types
            pdfField.setText(field.value);
          } else if (field.type === 'checkbox' && field.value === 'true') {
            // @ts-expect-error: pdf-lib types
            pdfField.check();
          } else if (field.type === 'select') {
            // @ts-expect-error: pdf-lib types
            pdfField.select(field.value);
          }
        } catch {
          // Field might not exist in PDF, skip
        }
      });

      const filledPdfBytes = await pdfDoc.save();
      const blob = new Blob([filledPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filled_${currentForm.fileName}`;
      a.click();
      URL.revokeObjectURL(url);

      addRecentAction('Downloaded filled form', { fileName: currentForm.fileName });
    } catch (error) {
      console.error('Error downloading filled form:', error);
      alert('Error generating filled PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  // BROWSE MODE - Show suggested forms and upload option
  if (viewMode === 'browse') {
    return (
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
          <BreadcrumbItem active>AI Form Filler</BreadcrumbItem>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Form Filler</h1>
          <p className="text-xl text-neutral-600">
            Download official visa forms and let Jeffrey help you fill them out correctly
          </p>
        </div>

        {/* Suggested Forms Section */}
        {travelProfile && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Official Visa Forms for {travelProfile.destinationCountry}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered search for {travelProfile.visaRequirements?.visaType || travelProfile.travelPurpose} visa application forms
            </p>

            {isSearchingForms ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Searching for official forms...</p>
                <p className="text-sm text-gray-500 mt-1">Using AI to find the latest official government forms</p>
              </div>
            ) : formSearchError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{formSearchError}</p>
                <button
                  onClick={loadFormData}
                  className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            ) : suggestedForms.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedForms.map((form, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{form.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              form.formType === 'online' ? 'bg-green-100 text-green-700' :
                              form.formType === 'pdf' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {form.formType}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{form.description}</p>
                          {form.instructions && (
                            <p className="text-xs text-gray-600 mb-2 italic">{form.instructions}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Source: {form.source}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={form.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors w-full justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {form.formType === 'online' ? 'Access Online Portal' : 'Get Official Form'}
                      </a>
                    </div>
                  ))}
                </div>

                {processingNotes && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> {processingNotes}
                    </p>
                  </div>
                )}

                {additionalResources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Resources</h4>
                    <div className="space-y-2">
                      {additionalResources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-900">{resource.title}</span>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No forms found for this destination.</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your PDF Form</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Download an official visa form from the links above, then upload it here. Jeffrey will extract the fields and help you fill them out correctly with smart suggestions.
            </p>

            <button
              onClick={handleUploadClick}
              disabled={isProcessingPDF}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isProcessingPDF ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing PDF...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Choose PDF File
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Supported: PDF files with fillable form fields
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FILL MODE - Show extracted fields with Jeffrey's guidance
  if (viewMode === 'fill' && currentForm) {
    const completionPercent = getCompletionPercentage();
    const filledCount = currentForm.fields.filter(f => f.value.trim() !== '').length;

    return (
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
          <BreadcrumbItem>
            <button onClick={handleBackToBrowse} className="hover:text-indigo-600">
              AI Form Filler
            </button>
          </BreadcrumbItem>
          <BreadcrumbItem active>Fill Form</BreadcrumbItem>
        </Breadcrumb>

        {/* Header with progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={handleBackToBrowse}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to forms
              </button>
              <h1 className="text-3xl font-bold">Fill: {currentForm.fileName}</h1>
              <p className="text-gray-600">
                Jeffrey found {currentForm.fields.length} fields to fill. Complete each field with guidance.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{completionPercent}%</div>
              <div className="text-sm text-gray-500">{filledCount}/{currentForm.fields.length} fields</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* View Toggle and Form fields */}
        <div className={cn(
          "grid gap-6",
          showPDFView ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        )}>
          {/* PDF Viewer (when toggled on) */}
          {showPDFView && pdfUrl && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Original PDF Form</h2>
                <p className="text-xs text-gray-500 mt-1">Reference the original form to identify field names</p>
              </div>
              <div className="h-[600px]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Form Preview"
                />
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Form Fields</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePDFView}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      showPDFView
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {showPDFView ? (
                      <>
                        <LayoutList className="w-4 h-4" />
                        Fields Only
                      </>
                    ) : (
                      <>
                        <FileImage className="w-4 h-4" />
                        Show PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePreviewForm}
                    disabled={completionPercent < 50}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    Preview & Download
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {currentForm.fields.map((field, index) => (
                <div key={field.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Field number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-700">
                      {index + 1}
                    </div>

                    {/* Field content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {editingLabelId === field.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempLabel}
                              onChange={(e) => setTempLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLabel(field.id);
                                if (e.key === 'Escape') handleCancelEditLabel();
                              }}
                              className="px-2 py-1 border border-indigo-300 rounded text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveLabel(field.id)}
                              className="text-green-600 hover:text-green-800 text-xs font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditLabel}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <label className="font-semibold text-gray-900">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <button
                              onClick={() => handleStartEditLabel(field)}
                              className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                              title="Rename this field"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {field.value.trim() !== '' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {(field.label.toLowerCase().includes('undefined') || field.label.length <= 2) && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                Click pencil to rename
                              </span>
                            )}
                          </>
                        )}
                      </div>

                    {/* Input field based on type */}
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    ) : field.type === 'select' && field.options ? (
                      <select
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value === 'true'}
                          onChange={(e) => handleFieldChange(field.id, e.target.checked ? 'true' : 'false')}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">Check if applicable</span>
                      </label>
                    ) : (
                      <input
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    )}

                    {/* Hint and suggestion */}
                    <div className="mt-2 flex items-start gap-4">
                      {field.hint && (
                        <div className="flex items-start gap-1 text-xs text-gray-500">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                          <span>{field.hint}</span>
                        </div>
                      )}

                      {field.suggestedValue && field.value !== field.suggestedValue && (
                        <button
                          onClick={() => handleApplySuggestion(field.id)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          Use: {field.suggestedValue}
                          <span className="text-gray-400">({field.source})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Help button */}
                  <button
                    onClick={() => handleAskJeffreyAboutField(field)}
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg transition-colors",
                      activeFieldHelp === field.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                    )}
                    title="Ask Jeffrey for help"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {completionPercent === 100 ? (
              <span className="text-green-600 font-medium">All fields completed! Ready to preview and download.</span>
            ) : (
              <span>Complete all required fields before downloading</span>
            )}
          </div>
          <button
            onClick={handlePreviewForm}
            disabled={completionPercent < 50}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Eye className="w-5 h-5" />
            Preview & Download
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW MODE - Review completed form before download
  if (viewMode === 'preview' && currentForm) {
    const completionPercent = getCompletionPercentage();

    return (
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
          <BreadcrumbItem>
            <button onClick={handleBackToBrowse} className="hover:text-indigo-600">
              AI Form Filler
            </button>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <button onClick={handleBackToFill} className="hover:text-indigo-600">
              Fill Form
            </button>
          </BreadcrumbItem>
          <BreadcrumbItem active>Preview</BreadcrumbItem>
        </Breadcrumb>

        <div className="mb-6">
          <button
            onClick={handleBackToFill}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to editing
          </button>
          <h1 className="text-3xl font-bold mb-2">Review Your Completed Form</h1>
          <p className="text-gray-600">
            Check all fields before downloading. Click "Back to editing" to make changes.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Form Ready for Download</h3>
              <p className="text-sm text-gray-600">{completionPercent}% complete - {currentForm.fields.filter(f => f.value.trim() !== '').length} of {currentForm.fields.length} fields filled</p>
            </div>
          </div>

          <button
            onClick={handleDownloadFilledForm}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Filled PDF
          </button>
        </div>

        {/* Preview of filled fields */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Field Summary</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {currentForm.fields.map((field) => (
              <div key={field.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{field.label}</div>
                  <div className="text-sm text-gray-600">
                    {field.value.trim() || <span className="text-red-500 italic">Not filled</span>}
                  </div>
                </div>
                {field.value.trim() !== '' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warning for incomplete fields */}
        {completionPercent < 100 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Some fields are incomplete</p>
                <p className="text-sm text-amber-700 mt-1">
                  You have {currentForm.fields.filter(f => f.value.trim() === '').length} empty fields.
                  Make sure all required fields are filled before submitting your visa application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
