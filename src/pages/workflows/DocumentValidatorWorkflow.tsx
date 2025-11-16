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
} from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { CompletionBadge } from '../../components/ui/CompletionBadge';
import { cn } from '../../utils/cn';

interface Requirement {
  id: string;
  item: string;
  description: string;
  mandatory: boolean;
  documentId?: string;
  status: 'pending' | 'uploaded' | 'validated' | 'failed';
}

interface ValidationInsight {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  action?: string;
}

export const DocumentValidatorWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();

  const [mandatoryRequirements] = useState<Requirement[]>([
    {
      id: '1',
      item: 'Valid Passport',
      description: 'Must be valid for at least 6 months from travel date',
      mandatory: true,
      documentId: 'doc-1',
      status: 'validated',
    },
    {
      id: '2',
      item: 'Passport-Size Photos',
      description: '2 recent photos (4.5cm x 3.5cm)',
      mandatory: true,
      documentId: 'doc-2',
      status: 'validated',
    },
    {
      id: '3',
      item: 'Bank Statement',
      description: 'Last 3 months showing sufficient funds',
      mandatory: true,
      status: 'pending',
    },
    {
      id: '4',
      item: 'Employment Letter',
      description: 'Current employment verification',
      mandatory: true,
      documentId: 'doc-4',
      status: 'uploaded',
    },
    {
      id: '5',
      item: 'Flight Reservation',
      description: 'Round-trip flight booking',
      mandatory: true,
      status: 'pending',
    },
    {
      id: '6',
      item: 'Hotel Reservation',
      description: 'Confirmed accommodation booking',
      mandatory: true,
      status: 'pending',
    },
  ]);

  const [optionalRequirements] = useState<Requirement[]>([
    {
      id: '7',
      item: 'Travel Insurance',
      description: 'Recommended for medical coverage',
      mandatory: false,
      status: 'pending',
    },
    {
      id: '8',
      item: 'Cover Letter',
      description: 'Personal statement for visa application',
      mandatory: false,
      documentId: 'doc-8',
      status: 'validated',
    },
  ]);

  const [validationInsights] = useState<ValidationInsight[]>([
    {
      type: 'success',
      title: 'Passport verified',
      description: 'Your passport is valid for 2 more years. No issues found.',
    },
    {
      type: 'warning',
      title: 'Bank statement needed',
      description: 'Upload your bank statement showing minimum balance of $3,000.',
      action: 'Upload Now',
    },
    {
      type: 'error',
      title: 'Missing flight reservation',
      description:
        'Flight booking is mandatory. Consider using our Travel Planner to generate one.',
      action: 'Create Itinerary',
    },
  ]);

  const [jeffreyRecommendation] = useState(
    "You're making good progress! Focus on uploading your bank statement next - it's a critical document for UAE visa approval. Make sure it shows consistent income over the past 3 months."
  );

  // Calculate completeness
  const totalRequirements = mandatoryRequirements.length + optionalRequirements.length;
  const completedRequirements = [...mandatoryRequirements, ...optionalRequirements].filter(
    (r) => r.status === 'validated'
  ).length;
  const documentCompleteness = Math.round((completedRequirements / totalRequirements) * 100);

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('validator');
    addRecentAction('Entered Document Validator workflow');
  }, [updateWorkflow, addRecentAction]);

  const getStatusIcon = (status: Requirement['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
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

  return (
    <div className="max-w-7xl mx-auto">
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

          {/* Mandatory Documents */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Mandatory Documents
            </h4>

            <div className="space-y-3">
              {mandatoryRequirements.map((req) => (
                <div
                  key={req.id}
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
        </div>

        {/* Right: Validation Insights */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">Validation Insights</h3>

          {/* AI Validation Results */}
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                     hover:shadow-lg transition-all"
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
