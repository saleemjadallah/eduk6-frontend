import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Info,
  CheckCircle,
  Upload,
  Eye,
  MessageCircle,
  FileText,
  XCircle,
  Clock,
  CheckSquare,
  ChevronUp,
  List,
} from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { CompletionBadge } from '../../components/ui/CompletionBadge';
import { cn } from '../../utils/cn';

import { onboardingApi } from '../../lib/api';

const DOCUMENT_GUIDELINES: Record<string, string[]> = {
  'Bank Statement': [
    'Must be on official bank letterhead',
    'Recent (last 3-6 months)',
    'Account holder name must match applicant',
    'Bank stamp/seal required on every page',
    'Clear transaction history'
  ],
  'Employment Letter': [
    'Company letterhead required',
    'Stated job title and salary',
    'Employment start date',
    'Authorized signature and company stamp',
    'Dated within last 30 days'
  ],
  'Marriage Certificate': [
    'Official government issued certificate',
    'Attested/Apostilled if from outside country',
    'Legal translation if not in English/Arabic',
    'Both names clearly visible'
  ],
  'Flight Reservation': [
    'Confirmed booking reference (PNR)',
    'Passenger names matching passport',
    'Arrival and departure dates matching travel plan',
    'Airline logo and contact details'
  ],
  'Hotel Booking': [
    'Confirmed reservation number',
    'Guest names matching passport',
    'Check-in/out dates matching travel plan',
    'Hotel address and contact info'
  ]
};

const UPLOAD_REQUIRED_DOCUMENTS = ['Passport', 'Photo', 'Visa Application Form'];

interface Requirement {
  id: string;
  item: string;
  description: string;
  mandatory: boolean;
  documentId?: string;
  status: 'pending' | 'uploaded' | 'validated' | 'failed' | 'self_verified';
  verificationType: 'upload' | 'self_check';
}

interface ValidationInsight {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  action?: string;
}

export const DocumentValidatorWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();

  const [mandatoryRequirements, setMandatoryRequirements] = useState<Requirement[]>([]);
  const [optionalRequirements, setOptionalRequirements] = useState<Requirement[]>([]);
  const [validationInsights, setValidationInsights] = useState<ValidationInsight[]>([]);
  const [jeffreyRecommendation, setJeffreyRecommendation] = useState('');
  const [expandedGuidelines, setExpandedGuidelines] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Calculate completeness
  const totalRequirements = mandatoryRequirements.length + optionalRequirements.length;
  const completedRequirements = [...mandatoryRequirements, ...optionalRequirements].filter(
    (r) => r.status === 'validated' || r.status === 'self_verified'
  ).length;
  const documentCompleteness = totalRequirements > 0
    ? Math.round((completedRequirements / totalRequirements) * 100)
    : 0;

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('validator');
    addRecentAction('Entered Document Validator workflow');
    loadValidatorData();
  }, [updateWorkflow, addRecentAction]);

  const loadValidatorData = async () => {
    setIsLoading(true);
    try {
      // Fetch onboarding status to get visa requirements
      const response = await onboardingApi.getStatus();

      if (response.success && response.data?.travelProfile?.visaRequirements) {
        const { visaRequirements, destinationCountry, travelPurpose } = response.data.travelProfile;
        const { requiredDocuments } = visaRequirements;

        // Map required documents to mandatory requirements
        const mandatoryReqs: Requirement[] = requiredDocuments.map((doc, index) => {
          const isUploadRequired = UPLOAD_REQUIRED_DOCUMENTS.some(reqDoc =>
            doc.toLowerCase().includes(reqDoc.toLowerCase()) || reqDoc.toLowerCase().includes(doc.toLowerCase())
          );

          return {
            id: `mandatory-${index}`,
            item: doc,
            description: `Required for ${destinationCountry} ${travelPurpose} visa`,
            mandatory: true,
            status: 'pending' as const,
            verificationType: isUploadRequired ? 'upload' : 'self_check',
          };
        });

        setMandatoryRequirements(mandatoryReqs);
        setOptionalRequirements([]);
        setValidationInsights([]);
        setJeffreyRecommendation(
          `I've loaded your document requirements for ${destinationCountry}. You need ${mandatoryReqs.length} mandatory documents for your ${travelPurpose} visa. Start by uploading each document, and I'll validate them for you.`
        );
      } else {
        // No onboarding data
        setMandatoryRequirements([]);
        setOptionalRequirements([]);
        setValidationInsights([]);
        setJeffreyRecommendation(
          'Complete your travel profile first to see which documents you need. I\'ll help you understand exactly what\'s required for your destination.'
        );
      }
    } catch (error) {
      console.error('Failed to load validator data:', error);
      setLoadError('Unable to load document requirements. Please refresh the page or complete your travel profile first.');
      setMandatoryRequirements([]);
      setOptionalRequirements([]);
      setValidationInsights([]);
      setJeffreyRecommendation(
        'Start by selecting your destination country and visa type. I\'ll help you understand exactly which documents you need to upload.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Requirement['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'self_verified':
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'uploaded':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusLabel = (status: Requirement['status']) => {
    switch (status) {
      case 'validated':
        return 'Validated';
      case 'self_verified':
        return 'Self Verified';
      case 'uploaded':
        return 'Pending Review';
      case 'failed':
        return 'Failed';
      default:
        return 'Not Uploaded';
    }
  };

  const getInsightIcon = (type: ValidationInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const handleUpload = (requirement: Requirement) => {
    addRecentAction('Uploading document', { item: requirement.item });
    // Simulate upload
    alert(`Upload modal would open for: ${requirement.item}`);
  };

  const handleViewDocument = (documentId: string) => {
    addRecentAction('Viewed document', { documentId });
    alert(`Document viewer would open for: ${documentId}`);
  };

  const handleValidateAll = () => {
    addRecentAction('Triggered validation for all documents');
    alert('Validation process started for all uploaded documents');
  };

  const handleSelfVerify = (requirement: Requirement) => {
    addRecentAction('Self-verified document', { item: requirement.item });

    const updateRequirements = (reqs: Requirement[]) =>
      reqs.map(r => r.id === requirement.id ? { ...r, status: 'self_verified' as const } : r);

    setMandatoryRequirements(prev => updateRequirements(prev));
    setOptionalRequirements(prev => updateRequirements(prev));
  };

  const toggleGuidelines = (id: string) => {
    setExpandedGuidelines(prev => prev === id ? null : id);
    if (expandedGuidelines !== id) {
      addRecentAction('Checked guidelines', { documentId: id });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading document requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {loadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Error Loading Requirements</p>
              <p className="text-sm text-red-700 mt-1">{loadError}</p>
              <button
                onClick={loadValidatorData}
                className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      <Breadcrumb>
        <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
        <BreadcrumbItem active>Document Validator</BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Document Validator</h1>
        <p className="text-xl text-neutral-600">
          AI-powered validation to ensure all your documents meet visa requirements
        </p>
      </div>

      {/* Validation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Document Checklist */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Requirements Checklist</h3>
            <CompletionBadge value={documentCompleteness} className="text-lg px-4 py-2" />
          </div>

          {mandatoryRequirements.length === 0 && optionalRequirements.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
              <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-neutral-700 mb-2">No Requirements Set Yet</h4>
              <p className="text-neutral-500 mb-4">
                Select your destination country and visa type to see required documents.
              </p>
              <button
                onClick={() => askJeffrey('What documents do I need for a tourist visa?')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Ask Jeffrey What I Need
              </button>
            </div>
          ) : (
            <>
              {/* Mandatory Documents */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Mandatory Documents
                </h4>

                <div className="space-y-3">
                  {mandatoryRequirements.map((req) => (
                    <div key={req.id}>
                      <div
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(req.status)}
                          <div>
                            <p className="font-semibold text-neutral-900">{req.item}</p>
                            <p className="text-sm text-neutral-500">{req.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded-full',
                              req.status === 'validated' && 'bg-green-100 text-green-700',
                              req.status === 'self_verified' && 'bg-green-100 text-green-700',
                              req.status === 'uploaded' && 'bg-blue-100 text-blue-700',
                              req.status === 'failed' && 'bg-red-100 text-red-700',
                              req.status === 'pending' && 'bg-neutral-100 text-neutral-600'
                            )}
                          >
                            {getStatusLabel(req.status)}
                          </span>

                          {req.documentId ? (
                            <button
                              onClick={() => handleViewDocument(req.documentId!)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : req.verificationType === 'self_check' && req.status !== 'self_verified' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleGuidelines(req.id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Show Requirements"
                              >
                                {expandedGuidelines === req.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <List className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleSelfVerify(req)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                                title="I have this document"
                              >
                                <CheckSquare className="w-4 h-4" />
                                I have this
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpload(req)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Upload"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => askJeffrey(`Tell me about ${req.item}`)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ask Jeffrey"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Guidelines Panel */}
                      {expandedGuidelines === req.id && (
                        <div className="mt-2 ml-12 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="p-1 bg-indigo-100 rounded-md">
                              <List className="w-3 h-3 text-indigo-600" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-900">
                              What to check for:
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {(DOCUMENT_GUIDELINES[Object.keys(DOCUMENT_GUIDELINES).find(k => req.item.includes(k)) || ''] || [
                              'Ensure document is clear and legible',
                              'Check for official stamps or signatures',
                              'Verify dates are current',
                              'Ensure names match your passport'
                            ]).map((guide, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                                {guide}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-indigo-200 flex justify-between items-center">
                            <span className="text-xs text-indigo-600">
                              AI-generated checklist
                            </span>
                            <button
                              onClick={() => handleSelfVerify(req)}
                              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                            >
                              Confirm I have this →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Documents */}
              <div>
                <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Optional Documents (Recommended)
                </h4>

                <div className="space-y-3">
                  {optionalRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 opacity-90"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(req.status)}
                        <div>
                          <p className="font-semibold text-neutral-900">{req.item}</p>
                          <p className="text-sm text-neutral-500">{req.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            req.status === 'validated' && 'bg-green-100 text-green-700',
                            req.status === 'uploaded' && 'bg-blue-100 text-blue-700',
                            req.status === 'pending' && 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {getStatusLabel(req.status)}
                        </span>

                        {req.documentId ? (
                          <button
                            onClick={() => handleViewDocument(req.documentId!)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpload(req)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => askJeffrey(`Is ${req.item} important?`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Validation Insights */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">Validation Insights</h3>

          {/* AI Validation Results */}
          {validationInsights.length === 0 ? (
            <div className="text-center py-8 mb-6">
              <Info className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">No validation insights yet</p>
              <p className="text-xs text-neutral-400 mt-1">Upload documents to see AI analysis</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {validationInsights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border',
                    insight.type === 'success' && 'bg-green-50 border-green-200',
                    insight.type === 'warning' && 'bg-yellow-50 border-yellow-200',
                    insight.type === 'error' && 'bg-red-50 border-red-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">{insight.title}</p>
                      <p className="text-xs text-neutral-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-2">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Jeffrey's Recommendations */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                           flex items-center justify-center text-white text-sm font-bold"
              >
                J
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500">Jeffrey's Advice</p>
                <p className="text-sm text-neutral-700 mt-1">{jeffreyRecommendation}</p>
              </div>
            </div>

            <button
              onClick={() => askJeffrey('What should I do next?')}
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 bg-white
                         text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Ask for More Help
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleValidateAll}
          disabled={mandatoryRequirements.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                     hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Validate All Documents
        </button>

        <button
          onClick={() => alert('Upload modal would open')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     border border-neutral-300 text-neutral-700 hover:bg-neutral-50
                     transition-all"
        >
          <Upload className="w-5 h-5" />
          Upload More Documents
        </button>
      </div>
    </div>
  );
};
