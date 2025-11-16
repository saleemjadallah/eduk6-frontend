import React, { useEffect, useState } from 'react';
import { FileText, Download, Sparkles, MessageCircle, Check } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { CompletionBadge } from '../../components/ui/CompletionBadge';
import { cn } from '../../utils/cn';

interface FormItem {
  id: string;
  name: string;
  originalUrl: string;
  completeness: number;
  extractedFields: Record<string, unknown>;
  filledData: Record<string, string>;
}

interface ExtractedField {
  label: string;
  value: string;
  source: string;
  confidence: number;
}

export const FormFillerWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();

  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);
  const [availableForms, setAvailableForms] = useState<FormItem[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [dataSources, setDataSources] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('form-filler');
    addRecentAction('Entered Form Filler workflow');
    loadFormData();
  }, [updateWorkflow, addRecentAction]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      // TODO: Fetch real forms from API when backend is ready
      // For now, start with empty state
      setAvailableForms([]);
      setExtractedData([]);
      setDataSources([]);
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectForm = (form: FormItem) => {
    setSelectedForm(form);
    addRecentAction('Selected form', { formName: form.name });
  };

  const handleAutoFillAll = () => {
    if (!selectedForm) return;
    addRecentAction('Auto-filled form', { formName: selectedForm.name });
    // Simulate auto-fill
    setSelectedForm((prev) =>
      prev
        ? {
            ...prev,
            completeness: Math.min(prev.completeness + 20, 100),
          }
        : null
    );
  };

  const handleDownloadForm = () => {
    if (!selectedForm) return;
    addRecentAction('Downloaded form', { formName: selectedForm.name });
    // Trigger download
    alert('Form download would start here');
  };

  const handleAskJeffreyAboutField = (fieldName: string) => {
    askJeffrey(`How do I fill the "${fieldName}" field correctly?`);
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
        <BreadcrumbItem active>AI Form Filler</BreadcrumbItem>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Form Filler</h1>
        <p className="text-xl text-neutral-600">
          Let AI auto-fill your visa application forms using your uploaded documents
        </p>
      </div>

      {/* Step-by-step Form Filling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form Selection & Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200">
          {/* Form Selection */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4">Select Form to Fill</h3>

            {availableForms.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-neutral-700 mb-2">No Forms Available Yet</h4>
                <p className="text-neutral-500 mb-4">
                  Upload your documents first, and we'll help you fill out visa application forms.
                </p>
                <button
                  onClick={() => askJeffrey('How do I start filling visa application forms?')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Jeffrey for Help
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => handleSelectForm(form)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    'hover:shadow-md',
                    selectedForm?.id === form.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-neutral-900">{form.name}</span>
                    </div>
                    <CompletionBadge value={form.completeness} className="text-xs px-2 py-1" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                        style={{ width: `${form.completeness}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
              </div>
            )}
          </div>

          {/* Form Preview & Editing */}
          {selectedForm && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{selectedForm.name}</h3>
                <CompletionBadge value={selectedForm.completeness} className="px-4 py-2" />
              </div>

              {/* Simulated Form Fields */}
              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                <p className="text-sm text-neutral-500 mb-4">
                  Form preview with editable fields:
                </p>

                <div className="space-y-4">
                  {Object.entries(selectedForm.filledData).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-neutral-500 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          value={value}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleAskJeffreyAboutField(key)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ask Jeffrey"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  ))}

                  {/* Empty fields indicator */}
                  {selectedForm.completeness < 100 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        {Math.round(((100 - selectedForm.completeness) / 100) * 10)} fields still
                        need to be filled
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Extracted Data Preview */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">Auto-Extracted Data</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Jeffrey extracted this data from your uploaded documents:
          </p>

          {extractedData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">No data extracted yet</p>
              <p className="text-xs text-neutral-400 mt-1">Upload documents to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {extractedData.map((field, index) => (
                  <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-500">{field.label}</span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          field.confidence >= 95
                            ? 'bg-green-100 text-green-700'
                            : field.confidence >= 80
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        )}
                      >
                        {field.confidence}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">{field.value}</p>
                    <p className="text-xs text-neutral-400 mt-1">Source: {field.source}</p>
                  </div>
                ))}
              </div>

              {/* Data Sources */}
              <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Data extracted from:</p>
                <div className="space-y-2">
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-neutral-700">{source.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleAutoFillAll}
          disabled={!selectedForm || selectedForm.completeness === 100}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                     hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          Auto-Fill All Fields
        </button>

        <button
          onClick={handleDownloadForm}
          disabled={!selectedForm}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     border border-neutral-300 text-neutral-700 hover:bg-neutral-50
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Download Form
        </button>

        <button
          onClick={() => askJeffrey('What fields am I still missing?')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     border border-neutral-300 text-neutral-700 hover:bg-neutral-50
                     transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Ask Jeffrey
        </button>
      </div>
    </div>
  );
};
