import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, ExternalLink, Globe, AlertCircle, HelpCircle, Lightbulb, Download, ArrowLeft, ChevronDown, ChevronUp, Shield, ArrowUpRight } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';
import { onboardingApi, visaDocsApi, formFillerApi, type FormDraftStatus, type FormDraftSummary } from '../../lib/api';
import { getFormHistory, downloadFilledPDF } from '../../lib/api-formfiller';
import type { FilledForm } from '../../types/formfiller';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { profileApi, CompleteProfile } from '../../lib/api-profile';
import { validateForm, smartFieldMapper, countryValidationRules } from '../../lib/validation-rules';

// Set up PDF.js worker - use unpkg which mirrors npm directly
// react-pdf@10.2.0 uses pdfjs-dist@5.4.296
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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

interface FieldAppearance {
  fontSize?: number;
  fontName?: string;
  checkboxOnValue?: string;
}

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'checkbox' | 'select' | 'textarea' | 'radio';
  label: string;
  value: string;
  hint?: string;
  suggestedValue?: string;
  source?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  appearance?: FieldAppearance;
}

interface UploadedForm {
  id: string;
  fileName: string;
  pdfBytes: ArrayBuffer;
  fields: FormField[];
  queryResults?: Array<{ field: string; value: string; confidence: number }>;
  tables?: Array<{
    rowCount: number;
    columnCount: number;
    cells: Array<{
      rowIndex: number;
      columnIndex: number;
      content: string;
      kind: 'content' | 'columnHeader' | 'rowHeader' | 'stubHead';
    }>;
  }>;
  selectionMarks?: Array<{
    state: 'selected' | 'unselected';
    confidence: number;
    boundingBox?: number[];
  }>;
  barcodes?: Array<{
    value: string;
    kind: string;
    confidence: number;
  }>;
  markdownOutput?: string;
  extractedAt: Date;
}

interface FormSearchCache {
  forms: SuggestedForm[];
  additionalResources: AdditionalResource[];
  processingNotes: string;
  cacheKey: string;
  cachedAt: Date;
}

interface FieldGuidance {
  fieldName: string;
  description: string;
  importance: 'required' | 'recommended' | 'optional';
  commonMistakes: string[];
}

type ViewMode = 'browse' | 'fill' | 'preview';

interface PageAnnotation {
  fieldName: string;
  fieldType: FormField['type'];
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  appearance?: FieldAppearance;
  widgetValue?: string;
}

type DraftDetail = {
  formId: string;
  filledData: any;
  pdfUrl: string | null;
  fileName: string;
  updatedAt: string;
  hasPdf?: boolean;
  status?: FormDraftStatus;
  versionHistory?: Array<{
    snapshotId: string;
    savedAt: string;
    completionPercentage: number;
  }>;
};

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

  // PDF view state
  const [pdfViewExpanded, setPdfViewExpanded] = useState(false); // Collapsible state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]); // Store PDF page images for AI analysis
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, PageAnnotation[]>>({});
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const [isDownloadingFilledPdf, setIsDownloadingFilledPdf] = useState(false);

  // Profile auto-fill state (kept for future use)
  const [, setUserProfile] = useState<CompleteProfile | null>(null);
  const [, setProfileCompleteness] = useState(0);
  const [, setIsLoadingProfile] = useState(false);
  const [, setShowProfilePrompt] = useState(false);

  // Gemini Vision validation state
  const [validationAnalysis, setValidationAnalysis] = useState<ValidationResult | null>(null);
  const [visualQaResult, setVisualQaResult] = useState<ValidationResult | null>(null);
  const [visualQaError, setVisualQaError] = useState<string | null>(null);
  const [validationTab, setValidationTab] = useState<'fields' | 'visual'>('fields');
  const [isAnalyzingForm, setIsAnalyzingForm] = useState(false);
  const [visualValidationEnabled, setVisualValidationEnabled] = useState(true);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [fieldExplanation, setFieldExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);
  const [autoValidationEnabled, setAutoValidationEnabled] = useState(true);
  const [validationCountdown, setValidationCountdown] = useState(0);
  const pdfObjectRef = useRef<HTMLObjectElement>(null);
  const autoValidationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Suppress unused ref warning
  void pdfObjectRef;

  // Jeffrey Guidance State
  const [fieldGuidance, setFieldGuidance] = useState<FieldGuidance[]>([]);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);

  // Autosave State
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error' | 'local_only'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [lastVersionId, setLastVersionId] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<Array<{ snapshotId: string; savedAt: string; completionPercentage: number }>>([]);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalPdfUploadedRef = useRef(false);
  const draftLoadedRef = useRef(false);
  const [savedDraft, setSavedDraft] = useState<DraftDetail | null>(null);
  const [isRestoringDraft, setIsRestoringDraft] = useState(false);
  const [draftSummaries, setDraftSummaries] = useState<FormDraftSummary[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [previewingDraftId, setPreviewingDraftId] = useState<string | null>(null);
  const [resumingDraftId, setResumingDraftId] = useState<string | null>(null);
  const [discardingDraftId, setDiscardingDraftId] = useState<string | null>(null);
  const fieldInputRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const savedDraftsPanelRef = useRef<HTMLDivElement | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [recentForms, setRecentForms] = useState<FilledForm[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [showUploadChoice, setShowUploadChoice] = useState(false);
  const [isReplacingDrafts, setIsReplacingDrafts] = useState(false);

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('form-filler');
    addRecentAction('Entered Form Filler workflow');
    loadFormData();
    loadUserProfile();
    loadRecentHistory();
  }, [updateWorkflow, addRecentAction]);

  // Load user profile for auto-fill
  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setUserProfile(response.data);
        calculateProfileCompleteness(response.data);

        // Check if profile is incomplete
        if (!response.data.profile || !response.data.passports?.length) {
          setShowProfilePrompt(true);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const calculateProfileCompleteness = (profileData: CompleteProfile) => {
    let score = 0;
    let total = 4;

    if (profileData.profile) score++;
    if (profileData.passports?.length > 0) score++;
    if (profileData.employment?.length > 0) score++;
    if (profileData.education?.length > 0) score++;

    setProfileCompleteness(Math.round((score / total) * 100));
  };

  // Helper function to group fields by base name
  const groupFormFields = (fields: FormField[]) => {
    const fieldGroups = new Map<string, FormField[]>();

    fields.forEach(field => {
      // Remove numeric suffixes and common separators to group fields
      const baseFieldName = field.name
        .replace(/[_\-\s]*\d+$/, '') // Remove trailing numbers
        .replace(/\[\d+\]$/, '');     // Remove [0], [1], etc.

      if (!fieldGroups.has(baseFieldName)) {
        fieldGroups.set(baseFieldName, []);
      }
      fieldGroups.get(baseFieldName)!.push(field);
    });

    return fieldGroups;
  };

  const getFormCompletionStats = () => {
    if (!currentForm) {
      return { total: 0, filled: 0 };
    }
    const fieldGroups = groupFormFields(currentForm.fields);
    const filledGroups = Array.from(fieldGroups.values())
      .filter(group => group.some((f: FormField) => f.value.trim() !== '')).length;
    return { total: fieldGroups.size, filled: filledGroups };
  };

  const buildStructuredFormData = (): Record<string, string> => {
    if (!currentForm) return {};
    const data: Record<string, string> = {};
    let combinedName: string | undefined;

    const assignIfEmpty = (key: string, value: string) => {
      if (value && !data[key]) {
        data[key] = value;
      }
    };

    currentForm.fields.forEach(field => {
      const trimmedValue = typeof field.value === 'string' ? field.value.trim() : '';
      if (!trimmedValue) return;

      data[field.name] = trimmedValue;

      const mappedFromName = smartFieldMapper.findBestMatch(field.name);
      const mappedFromLabel = smartFieldMapper.findBestMatch(field.label || '');

      [mappedFromName, mappedFromLabel].forEach(mapped => {
        if (mapped && !data[mapped]) {
          data[mapped] = trimmedValue;
        }
      });

      const normalizedName = field.name.toLowerCase();
      const normalizedLabel = (field.label || '').toLowerCase();
      const combinedText = `${normalizedName} ${normalizedLabel}`.trim();
      const includes = (phrase: string) => combinedText.includes(phrase);
      const containsAll = (...tokens: string[]) => tokens.every(token => includes(token));
      const containsAny = (...tokens: string[]) => tokens.some(token => includes(token));

      if (!data.dateOfBirth && (containsAll('date', 'birth') || containsAny('dob', 'birth date'))) {
        data.dateOfBirth = trimmedValue;
      }

      if (!data.nationality && containsAny('nationality', 'citizenship', 'citizen of')) {
        data.nationality = trimmedValue;
      }

      if (
        !data.passportNumber &&
        (
          containsAll('passport', 'number') ||
          containsAny('passport no', 'passport#') ||
          (containsAll('travel', 'document') && containsAny('number', 'no', 'doc'))
        )
      ) {
        data.passportNumber = trimmedValue;
      }

      if (!data.firstName && containsAny('first name', 'given name', 'givenname', 'firstname')) {
        data.firstName = trimmedValue;
      }

      if (!data.lastName && containsAny('last name', 'family name', 'surname', 'lastname')) {
        data.lastName = trimmedValue;
      }

      if (!data.countryOfBirth && containsAny('country of birth', 'place of birth')) {
        data.countryOfBirth = trimmedValue;
      }

      if (!data.travelPurpose && containsAny('purpose of travel', 'reason for travel', 'travel purpose')) {
        data.travelPurpose = trimmedValue;
      }

      const mentionsName = containsAny('name');
      const mentionsSpecificName =
        containsAny('first', 'given', 'family', 'surname', 'last', 'middle', 'maiden');

      if (!combinedName && mentionsName && !mentionsSpecificName) {
        combinedName = trimmedValue;
      }
    });

    const finalCombinedName = combinedName;
    if (typeof finalCombinedName === 'string' && finalCombinedName.trim()) {
      const parts = finalCombinedName.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        assignIfEmpty('firstName', parts[0]);
        assignIfEmpty('lastName', parts[0]);
        assignIfEmpty('fullName', finalCombinedName);
      } else {
        assignIfEmpty('firstName', parts[0]);
        assignIfEmpty('lastName', parts.slice(1).join(' '));
        assignIfEmpty('fullName', finalCombinedName);
      }
    }

    const fullNameValue = typeof data.fullName === 'string' ? data.fullName : '';
    if (!data.firstName && fullNameValue) {
      const parts = fullNameValue.split(/\s+/).filter(Boolean);
      if (parts.length > 0) {
        assignIfEmpty('firstName', parts[0]);
        assignIfEmpty('lastName', parts.slice(1).join(' ') || parts[0]);
      }
    }

    const groupedFields = groupFormFields(currentForm.fields);
    const matchesText = (text: string, ...keywords: string[]) => {
      const normalized = text.toLowerCase();
      return keywords.some(keyword => normalized.includes(keyword.toLowerCase()));
    };

    groupedFields.forEach((fields, baseKey) => {
      const sortedFields = [...fields].sort((a, b) => a.name.localeCompare(b.name));
      const values = sortedFields.map(field => (field.value || '').trim()).filter(Boolean);
      if (!values.length) return;

      const joinedWithSlash = values.join('/');
      const joinedDigits = values.join('');
      const combinedText = `${baseKey} ${sortedFields.map(f => f.label || '').join(' ')}`;

      if (
        !data.dateOfBirth &&
        matchesText(combinedText, 'date of birth', 'dob', 'birth date', 'birth')
      ) {
        data.dateOfBirth = joinedWithSlash;
      }

      if (
        !data.passportNumber &&
        matchesText(combinedText, 'passport number', 'passport no', 'travel document', 'travel doc')
      ) {
        data.passportNumber = joinedDigits || joinedWithSlash;
      }
    });

    return data;
  };

  const findFieldByNameInsensitive = (candidate?: string | null): FormField | undefined => {
    if (!candidate || !currentForm) return undefined;
    const normalized = candidate.toLowerCase();
    return currentForm.fields.find((field) => field.name.toLowerCase() === normalized);
  };

  const findFieldByCanonicalKey = (canonicalKey?: string | null): FormField | undefined => {
    if (!canonicalKey || !currentForm) return undefined;
    return currentForm.fields.find((field) => {
      const matchFromName = smartFieldMapper.findBestMatch(field.name);
      const matchFromLabel = smartFieldMapper.findBestMatch(field.label || '');
      return matchFromName === canonicalKey || matchFromLabel === canonicalKey;
    });
  };

  const resolveFieldContext = (fieldId?: string | null, fieldLabel?: string | null) => {
    const fallbackLabel = fieldLabel || fieldId || 'Field';

    if (!currentForm) {
      return {
        displayName: formatFieldLabel(fallbackLabel),
        fieldKey: null,
        value: undefined,
      };
    }

    let matchedField: FormField | undefined;

    matchedField = findFieldByNameInsensitive(fieldId);

    if (!matchedField && fieldId) {
      const canonicalFromId = smartFieldMapper.findBestMatch(fieldId);
      matchedField = findFieldByCanonicalKey(canonicalFromId);
    }

    if (!matchedField && fieldLabel) {
      const normalizedLabel = fieldLabel.toLowerCase();
      matchedField = currentForm.fields.find(
        (field) => (field.label || '').toLowerCase() === normalizedLabel
      );
    }

    if (!matchedField && fieldLabel) {
      const canonicalFromLabel = smartFieldMapper.findBestMatch(fieldLabel);
      matchedField = findFieldByCanonicalKey(canonicalFromLabel);
    }

    if (!matchedField && fieldLabel) {
      matchedField = currentForm.fields.find((field) =>
        (field.label || '').toLowerCase().includes(fieldLabel.toLowerCase())
      );
    }

    const displayName =
      matchedField?.label ||
      (matchedField ? formatFieldLabel(matchedField.name) : formatFieldLabel(fallbackLabel));

    return {
      displayName,
      fieldKey: matchedField?.name ?? null,
      value: matchedField?.value,
    };
  };

  const getFieldTooltipText = (canonicalKey?: string | null, value?: string) => {
    const countryKey = travelProfile?.destinationCountry?.toLowerCase() || '';
    const countryRules = countryKey ? countryValidationRules[countryKey] : undefined;
    const safeValue = value && value.trim() ? value : 'Not provided';

    switch (canonicalKey) {
      case 'dateOfBirth':
        return `Expected format: ${countryRules?.dateFormat || 'DD/MM/YYYY'}. Current: ${safeValue}`;
      case 'passportNumber':
        return `Passport number must match your travel document. Current entry: ${safeValue}`;
      case 'nationality':
        return `Use the nationality shown on your passport. Current entry: ${safeValue}`;
      case 'firstName':
      case 'lastName':
        return `Match exactly as in your passport. Current entry: ${safeValue}`;
      case 'phone':
        return `Use international format (e.g., +971 5...). Current entry: ${safeValue}`;
      default:
        return value ? `Current entry: ${safeValue}` : 'No value entered yet. Click to fill this field.';
    }
  };

  const fieldBadgeVariants: Record<string, string> = {
    dateOfBirth: 'bg-indigo-600 text-white',
    passportNumber: 'bg-emerald-600 text-white',
    nationality: 'bg-sky-600 text-white',
    firstName: 'bg-purple-600 text-white',
    lastName: 'bg-purple-600 text-white',
    phone: 'bg-amber-600 text-white',
    email: 'bg-rose-600 text-white',
    address: 'bg-teal-600 text-white',
    default: 'bg-gray-700 text-white',
  };

  interface NormalizedValidationAnalysis {
    overallScore: number;
    completedFields: number;
    totalFields: number;
    issues: ValidationIssue[];
    recommendations: string[];
    countrySpecificNotes: string[];
  }

  type ValidationIssue = {
    id: string;
    fieldName: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
    fieldKey?: string | null;
    actualValue?: string;
    source: 'structured' | 'vision';
  };

  const createLocalValidationAnalysis = (structuredData: Record<string, string>) => {
    const stats = getFormCompletionStats();
    const localResult = validateForm(
      structuredData,
      travelProfile?.destinationCountry || 'Unknown',
      travelProfile?.visaRequirements?.visaType || ''
    );

    const localIssues = localResult.errors.map((error, index) => {
      const context = resolveFieldContext(error.fieldId, error.fieldId);
      return {
        id: `local-${error.fieldId}-${index}`,
        fieldName: context.displayName,
        type: error.severity,
        message: error.message,
        fieldKey: context.fieldKey,
        actualValue: context.value,
        fieldId: error.fieldId,
      };
    });

    const recommendations = localIssues
      .filter(issue => issue.type === 'error')
      .map(issue => `Fix ${issue.fieldName}: ${issue.message}`);

    const notes = localIssues
      .filter(issue => issue.type === 'warning')
      .map(issue => `${issue.fieldName}: ${issue.message}`);

    return sanitizeValidationResult({
      overallScore: stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0,
      completedFields: stats.filled,
      totalFields: stats.total,
      issues: localIssues,
      recommendations,
      countrySpecificNotes: notes
    }, 'structured');
  };

  // Sanitize validation result to ensure all fields are in correct format
  const sanitizeValidationResult = (data: any, source: 'structured' | 'vision' = 'vision'): NormalizedValidationAnalysis => {
    const normalizeTextValue = (value: any) => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        if (typeof value.message === 'string') return value.message;
        return JSON.stringify(value);
      }
      return String(value ?? '');
    };

    const normalizeIssue = (issue: any): ValidationIssue => {
      const enrichedContext = resolveFieldContext(
        typeof issue.fieldId === 'string' ? issue.fieldId : undefined,
        typeof issue.fieldName === 'string' ? issue.fieldName : undefined
      );

      return {
        id: String(issue.id || `${source}-${issue.fieldId || issue.fieldName || Date.now()}`),
        fieldName: enrichedContext.displayName,
        type: ['error', 'warning', 'info'].includes(issue.type) ? issue.type : 'info',
        message: String(issue.message || 'No details provided'),
        suggestion: issue.suggestion ? String(issue.suggestion) : undefined,
        fieldKey: issue.fieldKey ?? enrichedContext.fieldKey ?? undefined,
        actualValue: issue.actualValue ?? enrichedContext.value,
        source,
      };
    };

    return {
      overallScore: typeof data.overallScore === 'number' ? data.overallScore : 0,
      completedFields: typeof data.completedFields === 'number' ? data.completedFields : 0,
      totalFields: typeof data.totalFields === 'number' ? data.totalFields : 0,
      issues: Array.isArray(data.issues) ? data.issues.map((issue: any) => normalizeIssue(issue)) : [],
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.map((r: any) => normalizeTextValue(r)).filter((text: string) => text.length > 0)
        : [],
      countrySpecificNotes: Array.isArray(data.countrySpecificNotes)
        ? data.countrySpecificNotes.map((n: any) => normalizeTextValue(n)).filter((text: string) => text.length > 0)
        : []
    };
  };

  type ValidationResult = NormalizedValidationAnalysis;

  // Analyze uploaded form with Gemini Vision for validation
  const analyzeFormForValidation = async (
    pdfImages: string[],
    options?: {
      structuredData?: Record<string, string>;
      filledPdfBase64?: string;
      mergeWithExisting?: boolean;
      skipSpinner?: boolean;
    }
  ): Promise<{ result: ValidationResult | null; error?: string }> => {
    let finalResult: ValidationResult | null = null;
    let errorMessage: string | null = null;
    if (!options?.skipSpinner) {
      setIsAnalyzingForm(true);
    }
    try {
      // Calculate local field statistics for context
      const fieldGroups = currentForm ? groupFormFields(currentForm.fields) : new Map();
      const totalFieldGroups = fieldGroups.size;
      const filledFieldGroups = Array.from(fieldGroups.values())
        .filter(group => group.some((f: FormField) => f.value.trim() !== '')).length;

      const prompt = `You are a visa application form validator. Analyze this form and provide validation insights.

IMPORTANT: Many fields in government forms have character boxes where each letter goes in a separate box.
Treat these character-box fields as SINGLE LOGICAL FIELDS, not multiple separate fields.
For example, a "Name" field with 20 character boxes should count as 1 field, not 20 fields.

Context from form structure:
- This form has ${totalFieldGroups} logical field sections
- Currently ${filledFieldGroups} sections have data entered

Please analyze the form VISUALLY and return a JSON object with:
1. overallScore: A score from 0-100 indicating form completeness and correctness
   - Base this on logical sections filled, not individual character boxes
   - Consider both completeness and correctness of entries
2. completedFields: Number of LOGICAL FIELD SECTIONS that appear to be filled
3. totalFields: Total number of LOGICAL FIELD SECTIONS detected (not character boxes)
4. issues: Array of validation issues found, each with:
   - id: unique identifier
   - fieldName: name of the problematic field
   - type: "error" | "warning" | "info"
   - message: description of the issue
   - suggestion: how to fix it (optional)
5. recommendations: Array of general recommendations
6. countrySpecificNotes: Notes specific to ${travelProfile?.destinationCountry || 'the destination country'}

Focus on:
- Missing required fields (sections, not individual boxes)
- Date format issues
- Passport validity concerns
- Photo compliance
- Supporting document requirements
- Common rejection reasons

Return ONLY valid JSON, no other text.`;

      // Use the backend API for vision analysis instead of askJeffrey
      const response = await visaDocsApi.analyzeFormValidation({
        pageImages: pdfImages,
        prompt,
        country: travelProfile?.destinationCountry || '',
        fieldData: options?.structuredData,
        filledPdfBase64: options?.filledPdfBase64
      });

      if (response.success && response.data) {
        try {
          // Extract JSON from response
          const jsonMatch = response.data.analysis?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);

            // Adjust the analysis to use our local field group counts if AI's counts seem off
            // This handles cases where AI still counts character boxes individually
            const adjustedAnalysis = {
              ...analysisData,
              totalFields: totalFieldGroups || analysisData.totalFields,
              completedFields: filledFieldGroups || analysisData.completedFields,
              // Recalculate score based on our field groups if needed
              overallScore: analysisData.overallScore || (totalFieldGroups > 0
                ? Math.round((filledFieldGroups / totalFieldGroups) * 100)
                : 0)
            };
            const sanitized = sanitizeValidationResult(adjustedAnalysis);
            finalResult = sanitized;
          } else if (response.data.validation) {
            // Direct validation object from API - adjust it too
            const adjustedValidation = {
              ...response.data.validation,
              totalFields: totalFieldGroups || response.data.validation.totalFields,
              completedFields: filledFieldGroups || response.data.validation.completedFields,
              overallScore: response.data.validation.overallScore || (totalFieldGroups > 0
                ? Math.round((filledFieldGroups / totalFieldGroups) * 100)
                : 0)
            };
            const sanitized = sanitizeValidationResult(adjustedValidation);
            finalResult = sanitized;
          } else {
            errorMessage = 'Visual QA unavailable right now. Please try again after uploading a clearer PDF.';
          }
        } catch (parseError) {
          console.error('Error parsing validation response:', parseError);
          errorMessage = 'Visual QA unavailable. Please try again later.';
        }
      } else {
        errorMessage = 'Visual QA unavailable. Please try again later.';
      }
    } catch (error) {
      console.error('Error analyzing form:', error);
      errorMessage = 'Visual QA unavailable. Please try again later.';
    } finally {
      if (!options?.skipSpinner) {
        setIsAnalyzingForm(false);
      }
    }

    return { result: finalResult, error: errorMessage || undefined };
  };

  // Get field-specific explanation on hover
  const getFieldExplanation = async (fieldName: string, area: string) => {
    if (isLoadingExplanation) return;

    setIsLoadingExplanation(true);
    setHoveredArea(area);

    try {
      const prompt = `For a ${travelProfile?.destinationCountry || ''} visa application, explain the "${fieldName}" field:
1. What information is required
2. Correct format (if applicable)
3. Common mistakes to avoid
4. Why this field is important for visa approval

Be concise but helpful. Format as a brief paragraph.`;

      // Ask Jeffrey for text explanation
      askJeffrey(prompt);
      setFieldExplanation(`Loading explanation for ${fieldName}...`);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setFieldExplanation('Unable to load explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const generateFilledPdfBytes = async (): Promise<Uint8Array | null> => {
    if (!currentForm?.pdfBytes) return null;

    try {
      const pdfBytesCopy = currentForm.pdfBytes.slice(0);
      const pdfDoc = await PDFDocument.load(pdfBytesCopy);
      const form = pdfDoc.getForm();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      currentForm.fields.forEach(field => {
        try {
          const pdfField = form.getField(field.name);
          const fieldApi = pdfField as Record<string, any>;

          if (
            (field.type === 'text' || field.type === 'textarea' || field.type === 'date') &&
            field.appearance?.fontSize &&
            typeof fieldApi.setFontSize === 'function'
          ) {
            try {
              fieldApi.setFontSize(field.appearance.fontSize);
            } catch {
              // Ignore font size errors and continue
            }
          }

          if ((field.type === 'text' || field.type === 'textarea' || field.type === 'date') && typeof fieldApi.setText === 'function') {
            fieldApi.setText(field.value || '');
          } else if (field.type === 'checkbox') {
            if (field.value === 'true' && typeof fieldApi.check === 'function') {
              fieldApi.check();
            } else if (field.value !== 'true' && typeof fieldApi.uncheck === 'function') {
              fieldApi.uncheck();
            }
          } else if (field.type === 'select' && typeof fieldApi.select === 'function') {
            fieldApi.select(field.value);
          } else if (field.type === 'radio') {
            if (field.value && typeof fieldApi.select === 'function') {
              fieldApi.select(field.value);
            } else if (!field.value && typeof fieldApi.clear === 'function') {
              fieldApi.clear();
            }
          }
        } catch {
          // Field might not exist or cannot be set
        }
      });

      try {
        form.updateFieldAppearances(helveticaFont);
      } catch (e) {
        console.warn('Could not update field appearances:', e);
      }

      const filledPdfBytes = await pdfDoc.save();
      console.log(`[FormFiller] Generated filled PDF bytes (${filledPdfBytes.length})`);
      return filledPdfBytes;
    } catch (error) {
      console.error('Error generating filled PDF bytes:', error);
      return null;
    }
  };

  // Auto-validation timer effect
  useEffect(() => {
    if (!autoValidationEnabled || viewMode !== 'fill' || !currentForm || isAnalyzingForm) {
      if (autoValidationIntervalRef.current) {
        clearInterval(autoValidationIntervalRef.current);
        autoValidationIntervalRef.current = null;
      }
      setValidationCountdown(0);
      return;
    }

    // Set countdown to 15 seconds
    const AUTO_VALIDATION_INTERVAL = 15;
    setValidationCountdown(AUTO_VALIDATION_INTERVAL);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setValidationCountdown(prev => {
        if (prev <= 1) {
          // Trigger validation
          handleAutoValidation();
          return AUTO_VALIDATION_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    autoValidationIntervalRef.current = countdownInterval;

    return () => {
      if (autoValidationIntervalRef.current) {
        clearInterval(autoValidationIntervalRef.current);
        autoValidationIntervalRef.current = null;
      }
    };
  }, [autoValidationEnabled, viewMode, currentForm, isAnalyzingForm]);

  // Handle auto-validation
  const handleAutoValidation = async () => {
    if (isAnalyzingForm || !currentForm) return;

    console.log('[FormFiller] Auto-validation triggered');
    const structuredData = buildStructuredFormData();
    const localAnalysis = createLocalValidationAnalysis(structuredData);
    setValidationAnalysis(localAnalysis);
    setLastValidationTime(new Date());
  };

  // Unified validation handler used by both buttons
  const handleReanalyze = async () => {
    // Just call handleValidateForm - they do the same thing
    await handleValidateForm();
    // Reset countdown for auto-validation
    setValidationCountdown(15);
  };

  const getCacheKey = (profile: TravelProfile): string => {
    return `${profile.destinationCountry}-${profile.visaRequirements?.visaType || 'default'}-${profile.nationality}`;
  };

  const FORM_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  const loadFormsFromStorage = (cacheKey: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`formSearchCache:${cacheKey}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.cachedAt || Date.now() - parsed.cachedAt > FORM_CACHE_TTL_MS) {
        localStorage.removeItem(`formSearchCache:${cacheKey}`);
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn('Failed to load cached forms from storage', error);
      return null;
    }
  };

  const persistFormsToStorage = (cacheKey: string, cache: FormSearchCache) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `formSearchCache:${cacheKey}`,
        JSON.stringify({
          ...cache,
          cachedAt: cache.cachedAt.getTime(),
        })
      );
    } catch (error) {
      console.warn('Failed to persist form cache', error);
    }
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

        // Try restoring cached forms from localStorage first (persists across tabs/refresh)
        const storedCache = loadFormsFromStorage(cacheKey);
        if (storedCache) {
          setSuggestedForms(storedCache.forms);
          setAdditionalResources(storedCache.additionalResources);
          setProcessingNotes(storedCache.processingNotes);
          setFormSearchCache({
            ...storedCache,
            cachedAt: new Date(storedCache.cachedAt),
          });
          setIsSearchingForms(false);
          return;
        }

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

              persistFormsToStorage(cacheKey, {
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
      await loadDraftFromServer(true);
      setIsLoading(false);
    }
  };

  // Extract text content from PDF to help identify field labels
  const extractPDFText = async (pdfBytes: ArrayBuffer): Promise<string[]> => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const textLines: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => (item as { str: string }).str)
          .filter((text: string) => text.trim().length > 0);
        textLines.push(...pageText);
      }

      return textLines;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return [];
    }
  };

  // Convert PDF pages to base64 images for Gemini Vision AI analysis
  const convertPDFPagesToImages = async (pdfBytes: ArrayBuffer | Uint8Array): Promise<string[]> => {
    try {
      // pdfjs-dist handles both ArrayBuffer and Uint8Array in the data property
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const images: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5; // Good quality without being too large
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Use type assertion to handle different pdfjs-dist versions
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        } as Parameters<typeof page.render>[0]).promise;

        // Convert to base64 PNG (remove the data:image/png;base64, prefix)
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        images.push(base64);
      }

      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      return [];
    }
  };

  const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  };

  // Extract PDF form fields directly from PDF structure (bypasses character box overlays)
  const analyzeFormWithAI = async (pdfBytes: ArrayBuffer, _fieldCount: number): Promise<{
    fieldMap: Map<number, { label: string; fieldType: string; confidence: number }>;
    queryResults?: Array<{ field: string; value: string; confidence: number }>;
    tables?: any[];
    selectionMarks?: any[];
    barcodes?: any[];
    markdownOutput?: string;
  }> => {
    setAnalyzingWithAI(true);
    const fieldMap = new Map<number, { label: string; fieldType: string; confidence: number }>();
    let queryResults: any[] = [];
    let tables: any[] = [];
    let selectionMarks: any[] = [];
    let barcodes: any[] = [];
    let markdownOutput = '';

    try {
      // Convert PDF ArrayBuffer to base64 string
      const base64Pdf = btoa(
        new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      console.log(`Extracting PDF form field definitions (bypassing overlays)...`);

      // Use the new analyzePDFForm endpoint which uses Azure DI
      const response = await visaDocsApi.analyzePDFForm({
        pdfBuffer: base64Pdf,
        visaType: travelProfile?.visaRequirements?.visaType || 'unknown'
      });

      if (response.success && response.data) {
        console.log(`Azure analysis complete. Found ${response.data.fields.length} fields.`);

        // Map fields
        response.data.fields.forEach((field, index) => {
          fieldMap.set(index + 1, { // Azure doesn't give field numbers easily, so we use index
            label: field.label,
            fieldType: field.fieldType,
            confidence: field.confidence
          });
        });

        queryResults = response.data.queryResults || [];
        tables = response.data.tables || [];
        selectionMarks = response.data.selectionMarks || [];
        barcodes = response.data.barcodes || [];
        markdownOutput = response.data.markdownOutput || '';

        console.log(`Extracted ${fieldMap.size} fields, ${tables.length} tables, ${queryResults.length} query results.`);

        // Still convert PDF to images for display purposes
        const images = await convertPDFPagesToImages(pdfBytes);
        setPageImages(images);
      }
    } catch (error) {
      console.error('Error extracting form fields:', error);
    } finally {
      setAnalyzingWithAI(false);
    }

    return { fieldMap, queryResults, tables, selectionMarks, barcodes, markdownOutput };
  };

  // Try to match field position with nearby text labels
  const findLabelForField = (_fieldIndex: number, _totalFields: number, textLines: string[]): string | null => {
    // Common visa form field patterns
    const fieldPatterns = [
      /surname|family\s*name|last\s*name/i,
      /given\s*name|first\s*name|forename/i,
      /date\s*of\s*birth|birth\s*date|dob/i,
      /place\s*of\s*birth|birth\s*place/i,
      /nationality|citizenship/i,
      /passport\s*number|passport\s*no/i,
      /issue\s*date|date\s*of\s*issue/i,
      /expir|valid\s*until/i,
      /address|residence/i,
      /email|e-mail/i,
      /phone|telephone|mobile/i,
      /occupation|profession|job/i,
      /employer|company/i,
      /purpose|reason/i,
      /arrival|entry/i,
      /departure|exit|leaving/i,
    ];

    // Search for matching patterns in text
    for (const pattern of fieldPatterns) {
      const matchIndex = textLines.findIndex(line => pattern.test(line));
      if (matchIndex !== -1) {
        return textLines[matchIndex];
      }
    }

    return null;
  };

  // Extract fields from PDF using pdf-lib and enhance with AI Vision
  const extractPDFFields = async (pdfBytes: ArrayBuffer): Promise<FormField[]> => {
    try {
      // Create copies of ArrayBuffer to avoid detachment issues
      // Each PDF library operation can detach the original ArrayBuffer
      const bytesForText = pdfBytes.slice(0);
      const bytesForPdfLib = pdfBytes.slice(0);
      const bytesForAI = pdfBytes.slice(0);

      // First extract text content to help identify fields
      const textLines = await extractPDFText(bytesForText);

      const pdfDoc = await PDFDocument.load(bytesForPdfLib);
      const form = pdfDoc.getForm();
      const pdfFields = form.getFields();

      // Analyze form with Gemini Vision AI to get accurate field labels
      const aiAnalysis = await analyzeFormWithAI(bytesForAI, pdfFields.length);
      const aiFieldMap = aiAnalysis.fieldMap;

      const extractedFields: FormField[] = pdfFields.map((field, index) => {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;
        const fieldAny = field as Record<string, any>;
        const acroField = fieldAny?.acroField;
        const defaultAppearance = acroField?.getDefaultAppearance?.() as string | undefined;

        let type: FormField['type'] = 'text';
        let value = '';
        let options: string[] | undefined;
        const appearance: FieldAppearance = { ...parseDefaultAppearanceString(defaultAppearance) };

        if (fieldType === 'PDFTextField') {
          type = 'text';
          // @ts-expect-error: pdf-lib types
          value = field.getText() || '';
        } else if (fieldType === 'PDFCheckBox') {
          type = 'checkbox';
          // @ts-expect-error: pdf-lib types
          value = field.isChecked() ? 'true' : 'false';
          const onValue = acroField?.getOnValue?.();
          if (onValue?.asString) {
            appearance.checkboxOnValue = onValue.asString().replace(/^\//, '');
          }
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
        } else if (fieldType === 'PDFRadioGroup') {
          type = 'radio';
          const radioOptions: string[] = fieldAny?.getOptions?.() || [];
          options = radioOptions;
          value = fieldAny?.getSelected?.() || '';
        }

        // Get AI-identified label if available (field numbers are 1-based in AI response)
        const aiField = aiFieldMap.get(index + 1);
        let label = '';

        if (aiField && aiField.confidence > 0.5) {
          // Use AI-identified label with high confidence
          label = aiField.label;
        } else {
          // Fallback to parsing field name
          label = fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          // If field name is generic/undefined, try to find label from text
          if (label.toLowerCase().includes('undefined') || label.length <= 2) {
            const foundLabel = findLabelForField(index, pdfFields.length, textLines);
            if (foundLabel) {
              label = foundLabel;
            }
          }
        }

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
          options,
          appearance: Object.keys(appearance).length > 0 ? appearance : undefined
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

  const fetchDraftDetail = async (draftId: string): Promise<DraftDetail | null> => {
    try {
      const response = await formFillerApi.getDraftById(draftId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching draft detail:', error);
    }
    return null;
  };

  const restoreDraft = async (draft: DraftDetail) => {
    if (!draft.pdfUrl) {
      alert('Saved draft does not include the original PDF. Please upload the form again.');
      return;
    }

    setIsRestoringDraft(true);
    try {
      const response = await fetch(draft.pdfUrl);
      const pdfArrayBuffer = await response.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer.slice(0) }).promise;
      setPdfDocument(pdfDoc);

      const draftBlobUrl = URL.createObjectURL(new Blob([pdfArrayBuffer], { type: 'application/pdf' }));
      setPdfUrl(draftBlobUrl);

      const hydratedFields = hydrateFieldsFromDraftData(draft.filledData, currentForm?.fields || []);

      const restoredForm: UploadedForm = {
        id: draft.formId,
        fileName: draft.filledData?.metadata?.fileName || draft.fileName || 'Saved Draft.pdf',
        pdfBytes: pdfArrayBuffer,
        fields: hydratedFields,
        queryResults: [],
        extractedAt: new Date(draft.filledData?.metadata?.savedAt || draft.updatedAt || Date.now()),
      };

      setCurrentForm(restoredForm);
      setFormId(draft.formId);
      setViewMode('fill');
      setSavedDraft(null);
      originalPdfUploadedRef.current = true;
      setVersionHistory(draft.versionHistory || []);
      setLastVersionId(draft.versionHistory?.[0]?.snapshotId ?? null);
      setValidationAnalysis(null);
      setVisualQaResult(null);
      setVisualQaError(null);
      setValidationTab('fields');

      const images = await convertPDFPagesToImages(pdfArrayBuffer);
      setPageImages(images);
    } catch (error) {
      console.error('Error restoring draft:', error);
      alert('Unable to load the saved draft. Please upload the form again.');
    } finally {
      setIsRestoringDraft(false);
    }
  };

  const loadDraftFromServer = async (autoRestore = true, force = false) => {
    if (draftLoadedRef.current && !force) return;
    setIsLoadingDrafts(true);
    try {
      const response = await formFillerApi.listDrafts();
      if (response.success && response.data) {
        const { drafts } = response.data;
        setDraftSummaries(drafts);

        if (!drafts.length) {
          setSavedDraft(null);
          setVersionHistory([]);
          setLastVersionId(null);
          return;
        }

        const latestDraft = drafts[0];
        let detailedDraft: DraftDetail | null = null;

        if (autoRestore && !currentForm && latestDraft.hasPdf) {
          detailedDraft = await fetchDraftDetail(latestDraft.id);
          if (detailedDraft) {
            await restoreDraft(detailedDraft);
            return;
          }
        }

        if (!detailedDraft) {
          detailedDraft = await fetchDraftDetail(latestDraft.id);
        }

        if (detailedDraft) {
          setSavedDraft(detailedDraft);
          setVersionHistory(detailedDraft.versionHistory || []);
          setLastVersionId(detailedDraft.versionHistory?.[0]?.snapshotId ?? null);
        } else {
          setSavedDraft(null);
          setVersionHistory([]);
          setLastVersionId(null);
        }
      } else {
        setDraftSummaries([]);
        setSavedDraft(null);
        setVersionHistory([]);
        setLastVersionId(null);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoadingDrafts(false);
      draftLoadedRef.current = true;
    }
  };

  const loadRecentHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await getFormHistory(6, 0);
      if (response.success && response.data?.forms) {
        setRecentForms(response.data.forms);
      } else {
        setRecentForms([]);
        setHistoryError(response.error || 'Unable to load history.');
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryError('Unable to load history.');
      setRecentForms([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatFieldLabel = (fieldName: string): string => {
    const cleaned = fieldName
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      return 'Field';
    }

    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const hydrateFieldsFromDraftData = (
    draftData: DraftDetail['filledData'],
    fallbackFields: FormField[] = []
  ): FormField[] => {
    const metadata = draftData?.metadata || {};
    const valueRecord = draftData?.values ?? draftData ?? {};
    const fieldSnapshot: FormField[] = metadata.fields || [];

    if (fieldSnapshot.length === 0) {
      return fallbackFields.map((field) => {
        const storedEntry = valueRecord?.[field.name];
        return {
          ...field,
          value: storedEntry?.value ?? field.value ?? '',
        };
      });
    }

    return fieldSnapshot.map((field) => {
      const storedEntry = valueRecord?.[field.name];
      return {
        ...field,
        value: storedEntry?.value ?? field.value ?? '',
      };
    });
  };

  const handlePreviewDraft = async (draftId: string) => {
    setPreviewingDraftId(draftId);
    try {
      const detail = await fetchDraftDetail(draftId);
      if (detail) {
        setSavedDraft(detail);
      } else {
        alert('Unable to load draft preview. Please try again.');
      }
    } catch (error) {
      console.error('Error previewing draft:', error);
      alert('Unable to load draft preview. Please try again.');
    } finally {
      setPreviewingDraftId(null);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!formId || !currentForm) return;
    setRestoringVersionId(versionId);
    try {
      const response = await formFillerApi.restoreDraftVersion({ formId, versionId });
      if (response.success && response.data) {
        const detail = response.data;
        const hydratedFields = hydrateFieldsFromDraftData(detail.filledData, currentForm.fields);
        setCurrentForm((prev) =>
          prev
            ? {
                ...prev,
                fields: hydratedFields,
              }
            : prev
        );
        setVersionHistory(detail.versionHistory || []);
        setLastVersionId(versionId);
        setSaveToast('Rolled back to previous version.');
        setShowVersionHistory(false);
      } else {
        alert(response.error || 'Unable to restore version.');
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Unable to restore this version. Please try again.');
    } finally {
      setRestoringVersionId(null);
    }
  };

  const scrollToSavedDrafts = () => {
    savedDraftsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToField = (fieldKey?: string | null, fallbackName?: string) => {
    if (!fieldKey && fallbackName) {
      const context = resolveFieldContext(fallbackName, fallbackName);
      fieldKey = context.fieldKey;
    }

    if (!fieldKey) return;

    setPdfViewExpanded(true);

    setTimeout(() => {
      const target = fieldInputRefs.current.get(fieldKey!);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedField(fieldKey!);
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    }, 100);
  };

  const handleResumeDraft = async (draftId: string, detailOverride?: DraftDetail) => {
    setResumingDraftId(draftId);
    try {
      const detail = detailOverride || (await fetchDraftDetail(draftId));
      if (!detail) {
        alert('Unable to load this draft. Please try again.');
        return;
      }

      if (!detail.pdfUrl) {
        alert('This draft no longer has a saved PDF. Please upload the original file again to continue.');
        return;
      }

      await restoreDraft(detail);
    } catch (error) {
      console.error('Error resuming draft:', error);
      alert('Unable to resume the draft. Please try again.');
    } finally {
      setResumingDraftId(null);
    }
  };

  const handleDiscardDraft = async (draftId: string) => {
    const confirmDiscard = window.confirm('Discard this saved draft? This action cannot be undone.');
    if (!confirmDiscard) return;

    setDiscardingDraftId(draftId);
    try {
      const response = await formFillerApi.deleteDraft(draftId);
      if (response.success) {
        if (savedDraft?.formId === draftId) {
          setSavedDraft(null);
        }
        await loadDraftFromServer(false, true);
      } else {
        alert('Unable to discard draft. Please try again.');
      }
    } catch (error) {
      console.error('Error discarding draft:', error);
      alert('Unable to discard draft. Please try again.');
    } finally {
      setDiscardingDraftId(null);
    }
  };

  const handleDeleteHistoryForm = async (formId: string, status: string) => {
    const confirmDelete = window.confirm('Delete this form? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeletingHistoryId(formId);
    try {
      if (status === 'draft') {
        await formFillerApi.deleteDraft(formId);
        await loadDraftFromServer(false, true);
      } else {
        await formFillerApi.deleteForm(formId);
      }
      await loadRecentHistory();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Unable to delete this form. Please try again.');
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const handleDownloadHistoryForm = async (formId: string, fileName?: string) => {
    try {
      await downloadFilledPDF(formId, fileName || 'filled-form.pdf');
    } catch (error) {
      alert('Unable to download the filled PDF. Please try again.');
    }
  };

  const confirmStartNewForm = async () => {
    if (!pendingUploadFile) return;
    setIsReplacingDrafts(true);
    try {
      await Promise.all(draftSummaries.map(async (draft) => {
        await formFillerApi.deleteDraft(draft.id);
      }));
      setDraftSummaries([]);
      setSavedDraft(null);
      setVersionHistory([]);
      setLastVersionId(null);
      await processUploadedFile(pendingUploadFile);
      await loadDraftFromServer(false, true);
      await loadRecentHistory();
    } catch (error) {
      console.error('Error replacing draft:', error);
      alert('Unable to start a new form right now. Please try again.');
    } finally {
      setIsReplacingDrafts(false);
      setPendingUploadFile(null);
      setShowUploadChoice(false);
    }
  };

  const dismissUploadPrompt = () => {
    setPendingUploadFile(null);
    setShowUploadChoice(false);
  };

  const handleOpenDraftPdf = async (draftId: string) => {
    try {
      const detail = savedDraft?.formId === draftId ? savedDraft : await fetchDraftDetail(draftId);
      if (!detail?.pdfUrl) {
        alert('Saved draft does not include a PDF. Please upload the form again.');
        return;
      }
      window.open(detail.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening draft PDF:', error);
      alert('Unable to open the saved PDF. Please try again.');
    }
  };

  const processUploadedFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setPendingUploadFile(null);
    setShowUploadChoice(false);
    setIsProcessingPDF(true);
    setFormId(null);
    originalPdfUploadedRef.current = false;
    setVersionHistory([]);
    setLastVersionId(null);
    addRecentAction('Uploaded form', { fileName: file.name });
    setSavedDraft(null);
    setValidationAnalysis(null);
    setVisualQaResult(null);
    setVisualQaError(null);
    setValidationTab('fields');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Load PDF document for interactive rendering (use a copy)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      setPdfDocument(pdf);
      setPageAnnotations({});

      // Create PDF URL for fallback viewing
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Convert PDF to images for AI validation analysis (use a copy)
      const pdfImagesForValidation = await convertPDFPagesToImages(arrayBuffer.slice(0));

      // Extract fields (use a copy)
      const fields = await extractPDFFields(arrayBuffer.slice(0));

      // Store a fresh copy of the ArrayBuffer to prevent detachment
      const pdfBytesCopy = arrayBuffer.slice(0);

      const uploadedForm: UploadedForm = {
        id: `form-${Date.now()}`,
        fileName: file.name,
        pdfBytes: pdfBytesCopy,
        fields: fields.length > 0 ? fields : [], // Allow empty fields for non-fillable PDFs
        // We need to get these from the analysis result, but extractPDFFields only returns fields
        // We might need to refactor how we call this or store the extra data in state temporarily
        // For now, let's assume analyzeFormWithAI is called within extractPDFFields or we call it separately
        // Actually, extractPDFFields calls analyzeFormWithAI internally but returns only fields.
        // We should update extractPDFFields to return the full analysis.
        // But for this quick fix, let's just initialize them as empty and update them if we can.
        // Wait, extractPDFFields returns FormField[].
        // Let's modify extractPDFFields to return the full analysis object.
        extractedAt: new Date()
      };

      // Re-run analysis to get the rich data (this is a bit inefficient but safe for now)
      // Ideally we'd refactor extractPDFFields to return everything
      const base64Pdf = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const analysisResponse = await visaDocsApi.analyzePDFForm({
        pdfBuffer: base64Pdf,
        visaType: travelProfile?.visaRequirements?.visaType || 'unknown'
      });

      if (analysisResponse.success && analysisResponse.data) {
        uploadedForm.queryResults = analysisResponse.data.queryResults;
        uploadedForm.tables = analysisResponse.data.tables;
        uploadedForm.selectionMarks = analysisResponse.data.selectionMarks;
        uploadedForm.barcodes = analysisResponse.data.barcodes;
        uploadedForm.markdownOutput = analysisResponse.data.markdownOutput;
      }

      setCurrentForm(uploadedForm);
      setViewMode('fill');

      // Auto-fill fields from user profile
      if (uploadedForm.fields.length > 0 && travelProfile) {
        try {
          const autoFillResponse = await profileApi.getAutoFillData({
            country: travelProfile.destinationCountry,
            visaType: travelProfile.visaRequirements?.visaType || 'tourist',
            fields: uploadedForm.fields.map(f => ({
              id: f.id,
              name: f.name,
              label: f.label
            }))
          });

          if (autoFillResponse.success && autoFillResponse.data) {
            const { autoFillData } = autoFillResponse.data;

            // Apply autofill data to fields
            const autoFilledFields = uploadedForm.fields.map(field => {
              const autoFillValue = autoFillData[field.id];
              if (autoFillValue && autoFillValue.value) {
                return {
                  ...field,
                  value: autoFillValue.value,
                  suggestedValue: autoFillValue.value,
                  source: autoFillValue.source
                };
              }
              return field;
            });

            setCurrentForm(prev => prev ? { ...prev, fields: autoFilledFields } : prev);
            addRecentAction('Auto-filled form from profile', {
              filledCount: Object.keys(autoFillData).length,
              totalFields: uploadedForm.fields.length
            });
          }
        } catch (error) {
          console.error('Error auto-filling form:', error);
          // Don't fail the whole upload if autofill fails
        }
      }

      // Trigger Gemini Vision validation analysis
      if (pdfImagesForValidation.length > 0) {
        setPageImages(pdfImagesForValidation);
        analyzeFormForValidation(pdfImagesForValidation);
      }

      addRecentAction('AI analyzing form for validation', { fileName: file.name });
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error processing PDF. Please try again.';
      alert(errorMessage);
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (draftSummaries.length > 0) {
      setPendingUploadFile(file);
      setShowUploadChoice(true);
      return;
    }

    await processUploadedFile(file);
  };

  // Field change handler - now actually used!
  const handleFieldChange = (
    fieldName: string,
    value: string,
    fieldType: FormField['type'] = 'text',
    appearance?: FieldAppearance
  ) => {
    if (!currentForm) return;

    console.log('[FormFiller] Field changed:', fieldName, value);

    setCurrentForm(prev => {
      if (!prev) return prev;
      const fieldIndex = prev.fields.findIndex(field => field.name === fieldName);

      // Update existing field
      if (fieldIndex !== -1) {
        const updatedFields = [...prev.fields];
        updatedFields[fieldIndex] = {
          ...updatedFields[fieldIndex],
          value,
          appearance: updatedFields[fieldIndex].appearance ?? appearance
        };
        return {
          ...prev,
          fields: updatedFields
        };
      }

      // Create fallback field definition if the annotation exists but wasn't parsed originally
      const label = formatFieldLabel(fieldName);
      const newField: FormField = {
        id: fieldName,
        name: fieldName,
        type: fieldType,
        label,
        value,
        hint: generateFieldHint(fieldName, label),
        suggestedValue: generateSuggestedValue(fieldName, travelProfile),
        source: undefined,
        required: false,
        placeholder: `Enter ${label.toLowerCase()}`,
        appearance
      };

      return {
        ...prev,
        fields: [...prev.fields, newField]
      };
    });
  };

  // Extract filled values from PDF
  const extractFilledPDFValues = async (): Promise<Record<string, string> | null> => {
    if (!currentForm?.pdfBytes) {
      console.error('[FormFiller] No PDF bytes available');
      return null;
    }

    try {
      console.log('[FormFiller] Extracting filled PDF values...');

      // Load the PDF
      const pdfDoc = await PDFDocument.load(currentForm.pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      const formData: Record<string, string> = {};

      // Extract values from all fields
      fields.forEach(field => {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;

        try {
          if (fieldType === 'PDFTextField') {
            // @ts-expect-error: pdf-lib types
            formData[fieldName] = field.getText() || '';
          } else if (fieldType === 'PDFCheckBox') {
            // @ts-expect-error: pdf-lib types
            formData[fieldName] = field.isChecked() ? 'true' : 'false';
          } else if (fieldType === 'PDFDropdown' || fieldType === 'PDFOptionList') {
            // @ts-expect-error: pdf-lib types
            const selected = field.getSelected();
            formData[fieldName] = selected?.[0] || '';
          }
        } catch (err) {
          console.warn(`[FormFiller] Could not read field ${fieldName}:`, err);
        }
      });

      console.log(`[FormFiller] Extracted ${Object.keys(formData).length} field values`);
      return formData;
    } catch (error) {
      console.error('[FormFiller] Error extracting PDF values:', error);
      return null;
    }
  };

  // Validate filled form
  const handleValidateForm = async () => {
    if (!currentForm) return;

    const structuredData = buildStructuredFormData();
    const localAnalysis = createLocalValidationAnalysis(structuredData);
    setValidationAnalysis(localAnalysis);
    setLastValidationTime(new Date());
    setValidationTab('fields');

    if (!visualValidationEnabled) {
      return;
    }

    setIsAnalyzingForm(true);
    try {
      console.log('[FormFiller] Running visual QA...');

      await extractFilledPDFValues();

      let imagesToAnalyze: string[] = pageImages;
      let filledPdfBytes: Uint8Array | null = null;

      try {
        filledPdfBytes = await generateFilledPdfBytes();
      } catch (error) {
        console.warn('Unable to regenerate filled PDF before validation:', error);
      }

      if (filledPdfBytes) {
        imagesToAnalyze = await convertPDFPagesToImages(filledPdfBytes);
        if (imagesToAnalyze.length > 0) {
          setPageImages(imagesToAnalyze);
        }
      } else if (imagesToAnalyze.length === 0 && currentForm.pdfBytes) {
        imagesToAnalyze = await convertPDFPagesToImages(currentForm.pdfBytes);
      }

      if (imagesToAnalyze.length === 0) {
        alert('Could not generate images for validation. Please try again.');
        return;
      }

      const filledPdfBase64 = filledPdfBytes ? uint8ToBase64(filledPdfBytes) : undefined;

      const { result: validationResult, error: visualError } = await analyzeFormForValidation(imagesToAnalyze, {
        structuredData,
        filledPdfBase64,
        mergeWithExisting: true,
        skipSpinner: true
      });

      setLastValidationTime(new Date());

      if (visualError) {
        setVisualQaError(visualError);
        setVisualQaResult(null);
      } else if (validationResult) {
        setVisualQaResult(validationResult);
        setVisualQaError(null);

        const hasBlockingErrors = validationResult.issues.some((issue: ValidationIssue) => issue.type === 'error');
        if (!hasBlockingErrors) {
          await markDraftCompleted('validation');
        }
      }
    } catch (error) {
      console.error('[FormFiller] Validation error:', error);
      alert('Validation failed. Please try again.');
    } finally {
      setIsAnalyzingForm(false);
    }
  };

  const handleDownloadFilledForm = async () => {
    if (!currentForm) return;

    setIsDownloadingFilledPdf(true);
    try {
      const filledBytes = await generateFilledPdfBytes();
      if (!filledBytes) {
        alert('Unable to generate filled PDF. Please try again.');
        return;
      }

      const arrayBuffer = new ArrayBuffer(filledBytes.byteLength);
      new Uint8Array(arrayBuffer).set(filledBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentForm.fileName.replace(/\.pdf$/i, '')}-filled.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await markDraftCompleted('download');
    } catch (error) {
      console.error('Error downloading filled PDF:', error);
      alert('Failed to download the filled PDF. Please try again.');
    } finally {
      setIsDownloadingFilledPdf(false);
    }
  };

  // Fetch Jeffrey's guidance for fields
  const fetchFieldGuidance = async () => {
    if (!currentForm?.fields || currentForm.fields.length === 0) return;

    setIsLoadingGuidance(true);
    try {
      // Only get guidance for the first 20 fields to avoid overwhelming the API/User initially
      // In a real app, we might paginate this or fetch on demand
      const fieldsToAnalyze = currentForm.fields.slice(0, 20).map(f => ({
        name: f.name,
        label: f.label
      }));

      const response = await visaDocsApi.getFieldGuidance({
        fields: fieldsToAnalyze,
        country: travelProfile?.destinationCountry || 'Unknown',
        visaType: travelProfile?.visaRequirements?.visaType || 'Visa'
      });

      if (response.success && response.data?.fieldGuidance) {
        setFieldGuidance(response.data.fieldGuidance);
      }
    } catch (error) {
      console.error('Error fetching field guidance:', error);
    } finally {
      setIsLoadingGuidance(false);
    }
  };

  // Autosave draft
  const saveFormDraft = async (options?: { showToast?: boolean }): Promise<string | null> => {
    if (!currentForm) return formId;

    setAutosaveStatus('saving');
    try {
      // Extract current values
      const timestamp = new Date().toISOString();
      const formData: Record<string, { value: string; source: 'manual'; filledAt: string; validationStatus: 'valid' }> = {};
      currentForm.fields.forEach(field => {
        formData[field.name] = {
          value: field.value || '',
          source: 'manual',
          filledAt: timestamp,
          validationStatus: 'valid'
        };
      });

      if (Object.keys(formData).length === 0) {
        setAutosaveStatus('saved');
        return formId;
      }

      const shouldIncludePdf = !originalPdfUploadedRef.current && currentForm.pdfBytes;

      const response = await formFillerApi.saveDraft({
        formId: formId || undefined,
        formData,
        fields: currentForm.fields,
        fileName: currentForm.fileName,
        pdfBytes: shouldIncludePdf ? uint8ToBase64(new Uint8Array(currentForm.pdfBytes)) : undefined,
        country: travelProfile?.destinationCountry,
        visaType: travelProfile?.visaRequirements?.visaType,
        formName: currentForm.fileName
      });

      if (response.success && response.data) {
        if (response.data.formId) {
          setFormId(response.data.formId);
        }
        const resolvedId = response.data.formId || formId || null;
        setLastSavedAt(new Date(response.data.savedAt));

        if (response.data.versionId) {
          setLastVersionId(response.data.versionId);
        }
        if (response.data.versions) {
          setVersionHistory(response.data.versions);
        }

        if (response.data.persisted === false) {
          setAutosaveStatus('local_only');
        } else {
          setAutosaveStatus('saved');
        }
        if (shouldIncludePdf) {
          originalPdfUploadedRef.current = true;
        }
        if (options?.showToast) {
          if (response.data.persisted === false) {
            setSaveToast('Draft saved locally. Please reconnect before leaving.');
          } else {
            setSaveToast('Draft saved, safe to leave.');
          }
        }
        return resolvedId;
      } else {
        setAutosaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setAutosaveStatus('error');
    }

    return formId;
  };

  const ensureDraftPersisted = async (): Promise<string | null> => {
    if (formId) return formId;
    return await saveFormDraft();
  };

  const markDraftCompleted = async (context: 'validation' | 'download') => {
    const resolvedFormId = await ensureDraftPersisted();
    if (!resolvedFormId) return;

    try {
      await formFillerApi.updateDraftStatus({
        formId: resolvedFormId,
        status: 'completed',
        context,
      });
      setSavedDraft(null);
      await loadDraftFromServer(false, true);
    } catch (error) {
      console.error('Error updating draft status:', error);
    }
  };

  // Trigger autosave when fields change
  useEffect(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    if (currentForm && viewMode === 'fill') {
      autosaveTimeoutRef.current = setTimeout(() => {
        saveFormDraft();
      }, 3000); // Autosave after 3 seconds of inactivity
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [currentForm?.fields]);

  // Fetch guidance when form is loaded
  useEffect(() => {
    if (currentForm && viewMode === 'fill' && fieldGuidance.length === 0) {
      fetchFieldGuidance();
    }
  }, [currentForm, viewMode]);

  useEffect(() => {
    if (!highlightedField) return;
    const timeout = setTimeout(() => setHighlightedField(null), 2000);
    return () => clearTimeout(timeout);
  }, [highlightedField]);

  useEffect(() => {
    fieldInputRefs.current.clear();
  }, [currentForm]);

  useEffect(() => {
    if (!saveToast) return;
    const timeout = setTimeout(() => setSaveToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [saveToast]);

  const togglePDFExpanded = () => {
    setPdfViewExpanded(!pdfViewExpanded);
  };

  const mapPdfFieldType = (fieldType?: string): FormField['type'] => {
    if (!fieldType) return 'text';
    const normalized = fieldType.toLowerCase();

    if (normalized === 'tx' || normalized.includes('text')) {
      return 'text';
    }
    if (normalized === 'btn' || normalized.includes('checkbox') || normalized.includes('check')) {
      return 'checkbox';
    }
    if (normalized === 'ch' || normalized.includes('choice') || normalized.includes('select') || normalized.includes('combo')) {
      return 'select';
    }
    if (normalized.includes('textarea')) {
      return 'textarea';
    }

    return 'text';
  };

  const parseDefaultAppearanceString = (appearance?: string): Pick<FieldAppearance, 'fontSize' | 'fontName'> => {
    if (!appearance) return {};
    const tfRegex = /\/([^\s]+)\s+(\d*\.?\d+)\s+Tf/;
    const match = tfRegex.exec(appearance);

    if (!match) {
      return {};
    }

    const [, fontNameRaw, fontSizeRaw] = match;
    const fontSize = parseFloat(fontSizeRaw);
    const fontName = fontNameRaw?.replace(/^\//, '');

    return {
      fontSize: Number.isFinite(fontSize) ? fontSize : undefined,
      fontName: fontName || undefined
    };
  };

  // Render PDF pages with interactive annotations
  const renderPDFPage = async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDocument) return;

    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      } as Parameters<typeof page.render>[0]).promise;

      // Get annotations (form fields)
      const annotations = await page.getAnnotations();

      const annotationData: PageAnnotation[] = [];

      annotations.forEach((annotation: any) => {
        if (!annotation.fieldType || !annotation.rect) return;

        const [x1, y1, x2, y2] = annotation.rect;
        const fieldName = annotation.fieldName || `field_${pageNum}_${x1}_${y1}`;
        const rect = viewport.convertToViewportRectangle([x1, y1, x2, y2]);
        const left = Math.min(rect[0], rect[2]);
        const top = Math.min(rect[1], rect[3]);
        const width = Math.abs(rect[2] - rect[0]);
        const height = Math.abs(rect[3] - rect[1]);
        const baseFieldType = mapPdfFieldType(annotation.fieldType);
        const isRadioButton = annotation.radioButton === true;
        const isCheckboxButton = annotation.checkBox === true;
        const resolvedFieldType: FormField['type'] = isRadioButton ? 'radio' : isCheckboxButton ? 'checkbox' : baseFieldType;
        const widgetValue = annotation.exportValue || annotation.buttonValue || undefined;
        const annotationAppearance = parseDefaultAppearanceString(annotation.defaultAppearance);

        annotationData.push({
          fieldName,
          fieldType: resolvedFieldType,
          rect: {
            left,
            top,
            width,
            height
          },
          appearance: Object.keys(annotationAppearance).length > 0 ? annotationAppearance : undefined,
          widgetValue: typeof widgetValue === 'string' ? widgetValue : undefined
        });
      });

      setPageAnnotations(prev => ({
        ...prev,
        [pageNum]: annotationData
      }));
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  // Effect to render PDF when document is loaded and expanded
  useEffect(() => {
    if (pdfDocument && pdfViewExpanded) {
      (async () => {
        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const canvas = canvasRefs.current.get(i);
          if (canvas) {
            await renderPDFPage(i, canvas);
          }
        }
      })();
    }
  }, [pdfDocument, pdfViewExpanded]);

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

    const fieldGroups = groupFormFields(currentForm.fields);

    // Count groups where at least one field has a value
    const filledGroups = Array.from(fieldGroups.values())
      .filter(group => group.some((f: FormField) => f.value.trim() !== '')).length;

    return Math.round((filledGroups / fieldGroups.size) * 100);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
    setCurrentForm(null);
    setFormId(null);
    originalPdfUploadedRef.current = false;
    setVersionHistory([]);
    setLastVersionId(null);
    setShowVersionHistory(false);
    setSaveToast(null);
    setValidationAnalysis(null);
    setVisualQaResult(null);
    setVisualQaError(null);
    setValidationTab('fields');
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
    const hasAnyDrafts = draftSummaries.length > 0;
    return (
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
          <BreadcrumbItem active>AI Form Filler</BreadcrumbItem>
        </Breadcrumb>

        {savedDraft && (
          <div
            className={cn(
              'mt-4 mb-6 rounded-2xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4',
              savedDraft.hasPdf ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  savedDraft.hasPdf ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-700'
                )}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Resume saved draft</p>
                <p className="text-xs text-gray-600">
                  {savedDraft.fileName} • Last saved {new Date(savedDraft.updatedAt).toLocaleString()}
                </p>
                {!savedDraft.hasPdf && (
                  <p className="text-xs text-amber-700 mt-1">
                    We can&apos;t find the original PDF for this draft. Re-upload the form to keep editing.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleResumeDraft(savedDraft.formId, savedDraft)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={resumingDraftId === savedDraft.formId || isRestoringDraft || !savedDraft.hasPdf}
              >
                {resumingDraftId === savedDraft.formId ? 'Resuming...' : 'Resume'}
              </button>
              <button
                onClick={() => handleOpenDraftPdf(savedDraft.formId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                disabled={!savedDraft.pdfUrl}
              >
                Open saved PDF
              </button>
              <button
                onClick={() => handleDiscardDraft(savedDraft.formId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                disabled={discardingDraftId === savedDraft.formId}
              >
                {discardingDraftId === savedDraft.formId ? 'Discarding...' : 'Discard'}
              </button>
              {!savedDraft.hasPdf && (
                <button
                  onClick={handleUploadClick}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Re-upload PDF
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={savedDraftsPanelRef} className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Saved Drafts</p>
                  <p className="text-xs text-gray-500">Resume where you left off or clean up old copies</p>
                </div>
                <button
                  onClick={() => loadDraftFromServer(false, true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Refresh
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                {isLoadingDrafts && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    Loading drafts...
                  </div>
                )}
                {!isLoadingDrafts && draftSummaries.length === 0 && (
                  <div className="text-sm text-gray-500">
                    You don&apos;t have any saved drafts yet. Upload a PDF to start filling forms.
                  </div>
                )}
                {draftSummaries.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{draft.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Updated {new Date(draft.updatedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {draft.country || 'Unknown'} • {draft.visaType || 'Visa type TBD'}
                        </p>
                        {draft.versionHistory && draft.versionHistory.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] uppercase tracking-wide text-gray-500">Recent Saves</p>
                            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-600">
                              {draft.versionHistory.slice(0, 3).map((version) => (
                                <span
                                  key={`${draft.id}-${version.snapshotId}`}
                                  className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50"
                                >
                                  {new Date(version.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {' • '}
                                  {version.completionPercentage}%
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-indigo-700">
                          {draft.completionPercentage}%
                        </p>
                        <p className="text-xs text-gray-500">Complete</p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full mt-1',
                            draft.hasPdf
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {draft.hasPdf ? 'PDF saved' : 'PDF missing'}
                        </span>
                      </div>
                    </div>
                    {!draft.hasPdf && (
                      <p className="mt-2 text-xs text-amber-700">
                        Saved data is intact, but the PDF is missing. Re-upload the original file to continue.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleResumeDraft(draft.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        disabled={resumingDraftId === draft.id || isRestoringDraft || !draft.hasPdf}
                      >
                        {resumingDraftId === draft.id ? 'Resuming...' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handlePreviewDraft(draft.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        disabled={previewingDraftId === draft.id}
                      >
                        {previewingDraftId === draft.id ? 'Loading...' : 'Preview'}
                      </button>
                      <button
                        onClick={() => handleOpenDraftPdf(draft.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        disabled={!draft.hasPdf}
                      >
                        Open PDF
                      </button>
                      <button
                        onClick={() => handleDiscardDraft(draft.id)}
                        className="px-3 py-1.5 text-xs font-semibold border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                        disabled={discardingDraftId === draft.id}
                      >
                        {discardingDraftId === draft.id ? 'Discarding...' : 'Discard'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 flex flex-col">
              <div className="border-b border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Last Saved PDF
                </p>
                <p className="text-xs text-gray-500">Keep an eye on the most recent autosave</p>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                {savedDraft ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{savedDraft.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Updated {new Date(savedDraft.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full',
                          savedDraft.hasPdf ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        )}
                      >
                        {savedDraft.hasPdf ? 'Cloud backup' : 'Needs PDF'}
                      </span>
                    </div>
                    {savedDraft.pdfUrl ? (
                      <object
                        data={savedDraft.pdfUrl}
                        type="application/pdf"
                        className="mt-4 w-full h-64 border border-gray-200 rounded-xl"
                      >
                        <p className="p-4 text-xs text-gray-500">
                          Preview unavailable.{' '}
                          <button
                            onClick={() => handleOpenDraftPdf(savedDraft.formId)}
                            className="text-indigo-600 hover:underline"
                          >
                            Open the saved PDF
                          </button>
                          .
                        </p>
                      </object>
                    ) : (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                        <p>
                          This draft doesn&apos;t include a saved PDF yet. Upload the form again to keep a copy in the
                          cloud.
                        </p>
                        <button
                          onClick={handleUploadClick}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100"
                        >
                          Re-upload PDF
                        </button>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleResumeDraft(savedDraft.formId, savedDraft)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        disabled={resumingDraftId === savedDraft.formId || isRestoringDraft || !savedDraft.hasPdf}
                      >
                        {resumingDraftId === savedDraft.formId ? 'Resuming...' : 'Resume'}
                      </button>
                      {savedDraft.pdfUrl && (
                        <a
                          href={savedDraft.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Open saved PDF
                        </a>
                      )}
                      <button
                        onClick={() => handleDiscardDraft(savedDraft.formId)}
                        className="px-3 py-1.5 text-xs font-semibold border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                        disabled={discardingDraftId === savedDraft.formId}
                      >
                        {discardingDraftId === savedDraft.formId ? 'Discarding...' : 'Discard'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-gray-500 px-4">
                    <p>No draft selected. Choose “Preview” on any draft to pin it here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                            <span className={`text-xs px-2 py-0.5 rounded-full ${form.formType === 'online' ? 'bg-green-100 text-green-700' :
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {hasAnyDrafts ? 'Resume your saved draft' : 'Upload Your PDF Form'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              {hasAnyDrafts
                ? 'You already have a saved draft. Resume or discard it above before uploading something new.'
                : 'Download an official visa form from the links above, then upload it here. Jeffrey will extract the fields and help you fill them out correctly with smart suggestions.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleUploadClick}
                disabled={isProcessingPDF || analyzingWithAI || hasAnyDrafts}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isProcessingPDF || analyzingWithAI ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {analyzingWithAI ? 'AI Analyzing Form Fields...' : 'Processing PDF...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {hasAnyDrafts ? 'Draft in progress' : 'Choose PDF File'}
                  </>
                )}
              </button>
              {hasAnyDrafts && (
                <button
                  type="button"
                  onClick={scrollToSavedDrafts}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View saved drafts
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Supported: PDF files with fillable form fields
            </p>
            {hasAnyDrafts ? (
              <p className="text-xs text-amber-700 mt-1">
                Resume or discard drafts first to avoid overwriting your progress.
              </p>
            ) : (
              <p className="text-xs text-indigo-600 mt-1">
                AI Vision will automatically identify each field for accurate completion
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Recent Forms</p>
              <p className="text-xs text-gray-500">Completed and draft forms shown here</p>
            </div>
            <button
              type="button"
              onClick={loadRecentHistory}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Refresh
            </button>
          </div>
          <div className="p-4 space-y-3">
            {isLoadingHistory && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                Loading recent forms...
              </div>
            )}
            {!isLoadingHistory && historyError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {historyError}
              </div>
            )}
            {!isLoadingHistory && !historyError && recentForms.length === 0 && (
              <div className="text-sm text-gray-500">
                Completed forms will appear here once you finish filling them.
              </div>
            )}
            {recentForms.map((form) => {
              const isDraft = form.status === 'draft';
              const statusClasses = isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
              const lastUpdated = form.completedAt || form.updatedAt || form.createdAt;
              const lastUpdatedDate = lastUpdated ? new Date(lastUpdated as any) : null;
              return (
                <div key={form.id} className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{form.formName || 'Untitled Form'}</p>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', statusClasses)}>
                          {isDraft ? 'Draft' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last updated {lastUpdatedDate ? lastUpdatedDate.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isDraft && (
                        <button
                          onClick={() => handleResumeDraft(form.id)}
                          disabled={resumingDraftId === form.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {resumingDraftId === form.id ? 'Resuming...' : 'Resume'}
                        </button>
                      )}
                      {!isDraft && (
                        <button
                          onClick={() => handleDownloadHistoryForm(form.id, form.formName)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteHistoryForm(form.id, form.status)}
                        disabled={deletingHistoryId === form.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {deletingHistoryId === form.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showUploadChoice && pendingUploadFile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Start new form?</h3>
              <p className="text-sm text-gray-600">
                You already have saved drafts. Starting a new form will replace them with <strong>{pendingUploadFile.name}</strong>.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>What would you like to do?</p>
                <ul className="list-disc list-inside text-gray-500">
                  <li>Start a new form: discard existing drafts and upload this PDF.</li>
                  <li>Resume current draft: keep working on the saved form.</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={confirmStartNewForm}
                  disabled={isReplacingDrafts}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isReplacingDrafts ? 'Replacing...' : 'Start New Form'}
                </button>
                <button
                  onClick={() => {
                    dismissUploadPrompt();
                    if (savedDraft) {
                      handleResumeDraft(savedDraft.formId, savedDraft);
                    } else {
                      scrollToSavedDrafts();
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Resume Saved Draft
                </button>
                <button
                  onClick={dismissUploadPrompt}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // FILL MODE - Show extracted fields with Jeffrey's guidance
  if (viewMode === 'fill' && currentForm) {
    const completionPercent = getCompletionPercentage();

    // Calculate logical field groups for display
    const fieldGroups = groupFormFields(currentForm.fields);
    const filledCount = Array.from(fieldGroups.values())
      .filter(group => group.some((f: FormField) => f.value.trim() !== '')).length;
    const totalFieldGroups = fieldGroups.size;

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

        {saveToast && (
          <div className="mt-4 mb-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {saveToast}
          </div>
        )}

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
                AI identified {totalFieldGroups} form sections. Complete each field with guidance.
              </p>
            </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-3 mb-1">
                {/* Autosave Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {autosaveStatus === 'saving' && (
                    <>
                      <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-indigo-600">Saving...</span>
                    </>
                  )}
                  {autosaveStatus === 'saved' && lastSavedAt && (
                    <>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                        Saved to cloud
                      </span>
                      <span className="text-gray-500">
                        {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                  {autosaveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">Save failed</span>
                    </>
                  )}
                  {autosaveStatus === 'local_only' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-amber-600">Local only - reconnect to sync</span>
                      <button
                        type="button"
                        onClick={() => saveFormDraft()}
                        className="ml-2 text-[10px] font-semibold text-amber-700 underline"
                      >
                        Retry now
                      </button>
                    </>
                  )}
                </div>
                    <div className="flex items-center gap-2">
                      {versionHistory.length > 0 && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowVersionHistory((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <FileText className="w-3 h-3" />
                            Versions
                          </button>
                          {showVersionHistory && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 text-left">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Recent Saves</p>
                              <div className="max-h-48 overflow-y-auto space-y-2">
                                {versionHistory.map((version) => (
                                  <div
                                    key={version.snapshotId}
                                    className={cn(
                                      'text-xs rounded-md border px-2 py-1 bg-white',
                                      version.snapshotId === lastVersionId ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {new Date(version.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-gray-600">{version.completionPercentage}% complete</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreVersion(version.snapshotId)}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                        disabled={restoringVersionId === version.snapshotId}
                                      >
                                        {restoringVersionId === version.snapshotId ? 'Restoring...' : 'Restore'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => saveFormDraft()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        disabled={autosaveStatus === 'saving'}
                      >
                        {autosaveStatus === 'saving' ? (
                          <>
                            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            Save Draft
                          </>
                        )}
                      </button>
                      <button
                        onClick={async () => {
                          const savedId = await saveFormDraft({ showToast: true });
                          if (savedId) {
                            handleBackToBrowse();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Shield className="w-3 h-3" />
                        Save & Close
                      </button>
                    </div>
                <div className="text-2xl font-bold text-indigo-600">{completionPercent}%</div>
              </div>
              <div className="text-sm text-gray-500">{filledCount}/{totalFieldGroups} sections</div>
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

        {/* PDF Viewer - Always visible but collapsible */}
        {pdfUrl && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={togglePDFExpanded}
              className="w-full p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Original PDF Form</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Click to {pdfViewExpanded ? 'collapse' : 'expand'} - Reference the original form</p>
                </div>
              </div>
              {pdfViewExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {pdfViewExpanded && (
              <div className="h-[600px] overflow-auto bg-gray-100">
                {pdfDocument ? (
                  <div className="space-y-6 p-4">
                    {Array.from({ length: pdfDocument.numPages }, (_, index) => {
                      const pageNum = index + 1;
                      const annotationsForPage = pageAnnotations[pageNum] || [];

                      return (
                        <div
                          key={`pdf-page-${pageNum}`}
                          className="relative w-fit mx-auto bg-white rounded-xl shadow border border-gray-200"
                        >
                          <canvas
                            ref={(canvas) => {
                              if (canvas) {
                                canvasRefs.current.set(pageNum, canvas);
                              } else {
                                canvasRefs.current.delete(pageNum);
                              }
                            }}
                            className="block"
                          />
                          <div className="absolute top-0 left-0 w-full h-full">
                            {annotationsForPage.map(annotation => {
                              const fieldState = currentForm.fields.find(f => f.name === annotation.fieldName);
                              const fieldValue = fieldState?.value || '';
                              const isCheckbox = annotation.fieldType === 'checkbox';
                              const isRadio = annotation.fieldType === 'radio';
                              const isTextarea = annotation.fieldType === 'textarea';
                              const fontSize = annotation.appearance?.fontSize
                                ? `${annotation.appearance.fontSize}px`
                                : '12px';
                              const canonicalKey =
                                smartFieldMapper.findBestMatch(annotation.fieldName) ||
                                smartFieldMapper.findBestMatch(fieldState?.label || '');
                              const badgeClass = canonicalKey
                                ? fieldBadgeVariants[canonicalKey] || fieldBadgeVariants.default
                                : fieldBadgeVariants.default;
                              const badgeLabel =
                                canonicalKey
                                  ? formatFieldLabel(canonicalKey)
                                  : fieldState?.label || formatFieldLabel(annotation.fieldName);
                              const tooltipText = getFieldTooltipText(canonicalKey, fieldValue);
                              const baseStyle: React.CSSProperties = {
                                position: 'absolute',
                                left: `${annotation.rect.left}px`,
                                top: `${annotation.rect.top}px`,
                                width: `${annotation.rect.width}px`,
                                height: `${annotation.rect.height}px`,
                              };
                              const inputStyle: React.CSSProperties = {
                                width: '100%',
                                height: '100%',
                                border: '1px solid rgba(99, 102, 241, 0.35)',
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                fontSize,
                                padding: isCheckbox || isRadio ? '0' : '2px',
                                borderRadius: 4,
                              };
                              const isHighlighted = highlightedField === annotation.fieldName;
                              const overlayKey = `${pageNum}-${annotation.fieldName}-${annotation.rect.left}-${annotation.rect.top}`;

                              const registerRef = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
                                if (!element) {
                                  fieldInputRefs.current.delete(annotation.fieldName);
                                  return;
                                }
                                if (!fieldInputRefs.current.has(annotation.fieldName)) {
                                  fieldInputRefs.current.set(annotation.fieldName, element);
                                }
                              };

                              const badgeNode = (
                                <span
                                  className={cn(
                                    'absolute -top-5 left-0 text-[10px] px-2 py-0.5 rounded-full shadow',
                                    badgeClass
                                  )}
                                  title={tooltipText}
                                >
                                  {badgeLabel}
                                </span>
                              );

                              if (isCheckbox) {
                                return (
                                  <div
                                    key={overlayKey}
                                    style={baseStyle}
                                    className={cn(
                                      'absolute pointer-events-auto flex items-center justify-center',
                                      isHighlighted && 'ring-2 ring-yellow-300 rounded-md ring-offset-1'
                                    )}
                                  >
                                    {badgeNode}
                                    <input
                                      type="checkbox"
                                      name={annotation.fieldName}
                                      checked={fieldValue === 'true'}
                                      onChange={(event) =>
                                        handleFieldChange(
                                          annotation.fieldName,
                                          event.currentTarget.checked ? 'true' : 'false',
                                          annotation.fieldType,
                                          annotation.appearance
                                        )
                                      }
                                      ref={registerRef}
                                      className="rounded-sm accent-indigo-600"
                                      style={{ width: '60%', height: '60%' }}
                                      title={tooltipText}
                                    />
                                  </div>
                                );
                              }

                              if (isRadio) {
                                const optionValue = annotation.widgetValue || '';
                                return (
                                  <div
                                    key={overlayKey}
                                    style={baseStyle}
                                    className={cn(
                                      'absolute pointer-events-auto flex items-center justify-center',
                                      isHighlighted && 'ring-2 ring-yellow-300 rounded-md ring-offset-1'
                                    )}
                                  >
                                    {badgeNode}
                                    <input
                                      type="radio"
                                      name={annotation.fieldName}
                                      value={optionValue}
                                      checked={optionValue !== '' && fieldValue === optionValue}
                                      onChange={(event) =>
                                        handleFieldChange(
                                          annotation.fieldName,
                                          event.currentTarget.checked ? optionValue : '',
                                          'radio',
                                          annotation.appearance
                                        )
                                      }
                                      ref={registerRef}
                                      className="accent-indigo-600"
                                      style={{ width: '60%', height: '60%' }}
                                      title={tooltipText}
                                    />
                                  </div>
                                );
                              }

                              if (isTextarea) {
                                return (
                                  <div
                                    key={overlayKey}
                                    style={baseStyle}
                                    className={cn(
                                      'absolute pointer-events-auto',
                                      isHighlighted && 'ring-2 ring-yellow-300 rounded-md ring-offset-1'
                                    )}
                                  >
                                    {badgeNode}
                                    <textarea
                                      name={annotation.fieldName}
                                      value={fieldValue}
                                      onChange={(event) =>
                                        handleFieldChange(annotation.fieldName, event.currentTarget.value, annotation.fieldType, annotation.appearance)
                                      }
                                      style={{ ...inputStyle, resize: 'none' }}
                                      className="rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      ref={registerRef}
                                      title={tooltipText}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={overlayKey}
                                  style={baseStyle}
                                  className={cn(
                                    'absolute pointer-events-auto',
                                    isHighlighted && 'ring-2 ring-yellow-300 rounded-md ring-offset-1'
                                  )}
                                >
                                  {badgeNode}
                                  <input
                                    type="text"
                                    name={annotation.fieldName}
                                    value={fieldValue}
                                    onChange={(event) =>
                                      handleFieldChange(annotation.fieldName, event.currentTarget.value, annotation.fieldType, annotation.appearance)
                                    }
                                    style={inputStyle}
                                    className="rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    ref={registerRef}
                                    title={tooltipText}
                                  />
                                </div>
                              );
                            })}
                            {annotationsForPage.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-white/60">
                                No fillable fields detected on this page
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Loading PDF pages...</p>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Type directly into the highlighted fields. Your entries sync with validation automatically.
                  </p>
                  <button
                    onClick={handleValidateForm}
                    disabled={isAnalyzingForm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                        {isAnalyzingForm ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Validate & QA
                          </>
                        )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation / Visual QA */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                    validationTab === 'visual'
                      ? isAnalyzingForm
                        ? "bg-gray-200 text-gray-600 animate-pulse"
                        : visualQaResult?.overallScore && visualQaResult.overallScore >= 80
                          ? "bg-green-100 text-green-700"
                          : visualQaResult?.overallScore && visualQaResult.overallScore >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      : validationAnalysis?.overallScore && validationAnalysis.overallScore >= 80
                        ? "bg-green-100 text-green-700"
                        : validationAnalysis?.overallScore && validationAnalysis.overallScore >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                  )}
                >
                  {validationTab === 'visual'
                    ? isAnalyzingForm
                      ? '...'
                      : visualQaResult?.overallScore ?? '--'
                    : validationAnalysis?.overallScore ?? 0}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {validationTab === 'visual' ? 'Visual QA Score (optional)' : 'Field Validation Score'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {validationTab === 'visual'
                      ? visualQaError
                        ? visualQaError
                        : visualQaResult
                          ? `${visualQaResult.completedFields}/${visualQaResult.totalFields} sections checked visually`
                          : 'Run Visual QA to get AI cross-checks'
                      : validationAnalysis
                        ? `${validationAnalysis.completedFields}/${validationAnalysis.totalFields} fields analyzed`
                        : 'Run validation to get structured field checks'}
                  </p>
                  {lastValidationTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last validated: {lastValidationTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              {validationTab === 'fields' ? (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoValidationEnabled}
                      onChange={(e) => setAutoValidationEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Auto-validate</span>
                  </label>
                  {autoValidationEnabled && validationCountdown > 0 && !isAnalyzingForm && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      Next in {validationCountdown}s
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualValidationEnabled}
                      onChange={(e) => setVisualValidationEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Visual QA</span>
                  </label>
                  <button
                    onClick={handleReanalyze}
                    disabled={isAnalyzingForm || !currentForm || !visualValidationEnabled}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAnalyzingForm ? 'Analyzing...' : 'Run Visual QA'}
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValidationTab('fields')}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-full border",
                  validationTab === 'fields'
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                )}
              >
                Field Validation
              </button>
              <button
                type="button"
                onClick={() => setValidationTab('visual')}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-full border",
                  validationTab === 'visual'
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                )}
              >
                Visual QA (optional)
              </button>
            </div>
          </div>

          {validationTab === 'fields' ? (
            <>
              {validationAnalysis && validationAnalysis.issues.length > 0 ? (
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Issues Found ({validationAnalysis.issues.length})
                  </h3>
                  <div className="space-y-3">
                    {validationAnalysis.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={cn(
                          "p-3 rounded-lg border transition-shadow",
                          issue.type === 'error' ? "bg-red-50 border-red-200" :
                            issue.type === 'warning' ? "bg-amber-50 border-amber-200" :
                              "bg-blue-50 border-blue-200"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{issue.fieldName}</p>
                            <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                            {issue.actualValue && (
                              <p className="text-xs text-gray-500 mt-1">
                                Current entry: <span className="font-medium">{issue.actualValue}</span>
                              </p>
                            )}
                            {issue.suggestion && (
                              <p className="text-sm text-indigo-600 mt-1">
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => getFieldExplanation(issue.fieldName, issue.id)}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => jumpToField(issue.fieldKey, issue.fieldName)}
                            disabled={!issue.fieldKey && !currentForm}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Jump to field
                          </button>
                        </div>
                        {hoveredArea === issue.id && fieldExplanation && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                            {isLoadingExplanation ? 'Loading explanation...' : fieldExplanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200 text-sm text-gray-600">
                  Run validation to see field-level issues.
                </div>
              )}

              {validationAnalysis && validationAnalysis.recommendations.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {validationAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationAnalysis && validationAnalysis.countrySpecificNotes.length > 0 && (
                <div className="p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {travelProfile?.destinationCountry} Specific Notes
                  </h3>
                  <ul className="space-y-2">
                    {validationAnalysis.countrySpecificNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                        <span>ℹ️</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Field Help</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Click on any common field below to get validation guidance:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Full Name', 'Date of Birth', 'Passport Number', 'Passport Expiry', 'Nationality', 'Travel Purpose', 'Accommodation', 'Financial Proof'].map((field) => (
                    <button
                      key={field}
                      onClick={() => getFieldExplanation(field, field)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                        hoveredArea === field ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-indigo-50"
                      )}
                    >
                      {field}
                    </button>
                  ))}
                </div>
                {hoveredArea && !validationAnalysis?.issues.find(i => i.id === hoveredArea) && fieldExplanation && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-gray-700">
                    {isLoadingExplanation ? 'Loading explanation...' : fieldExplanation}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4">
              {visualQaError && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
                  {visualQaError}
                </div>
              )}
              {!visualQaError && !visualQaResult && (
                <div className="text-sm text-gray-600">
                  Run Visual QA to get an AI-generated review of your PDF. This step is optional, but helpful for spotting formatting issues.
                </div>
              )}
              {visualQaResult && (
                <>
                  {visualQaResult.issues.length > 0 ? (
                    <div className="space-y-3">
                      {visualQaResult.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={cn(
                            "p-3 rounded-lg border transition-shadow",
                            issue.type === 'error' ? "bg-red-50 border-red-200" :
                              issue.type === 'warning' ? "bg-amber-50 border-amber-200" :
                                "bg-blue-50 border-blue-200"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{issue.fieldName}</p>
                              <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-sm text-indigo-600 mt-1">
                                  <strong>Suggestion:</strong> {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      Visual QA did not find any issues.
                    </div>
                  )}

                  {visualQaResult.recommendations.length > 0 && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">AI Recommendations</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {visualQaResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Jeffrey's Field Guidance */}
        {currentForm && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-indigo-600" />
                </div>
                Jeffrey's Field Guidance
              </h3>
              {isLoadingGuidance && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Loading guidance...
                </span>
              )}
            </div>

            <div className="p-6">
              {fieldGuidance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGuidance.map((guidance, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{guidance.fieldName}</h4>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          guidance.importance === 'required' ? "bg-red-100 text-red-700" :
                            guidance.importance === 'recommended' ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-700"
                        )}>
                          {guidance.importance.charAt(0).toUpperCase() + guidance.importance.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{guidance.description}</p>

                      {guidance.commonMistakes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-amber-700 mb-1">Common Mistakes:</p>
                          <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                            {guidance.commonMistakes.map((mistake, i) => (
                              <li key={i}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => askJeffrey(`I need help with the "${guidance.fieldName}" field on the ${travelProfile?.destinationCountry} visa form. ${guidance.description}`)}
                        className="w-full mt-2 py-2 px-3 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Need More Help?
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Jeffrey is analyzing the form fields to provide guidance...</p>
                  {!isLoadingGuidance && (
                    <button
                      onClick={fetchFieldGuidance}
                      className="mt-2 text-indigo-600 hover:underline"
                    >
                      Retry fetching guidance
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Bottom action - now for downloading original or getting more help */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {validationAnalysis && validationAnalysis.overallScore >= 80 ? (
              <span className="text-green-600 font-medium">Form looks good! Review any remaining issues above.</span>
            ) : validationAnalysis && validationAnalysis.overallScore >= 50 ? (
              <span className="text-amber-600 font-medium">Some issues found. Address the recommendations above.</span>
            ) : (
              <span>Upload your form to see validation results</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBackToBrowse}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Upload Different Form
            </button>
            {pdfUrl && (
              <>
                <button
                  onClick={handleValidateForm}
                  disabled={isAnalyzingForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzingForm ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Validate & QA
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadFilledForm}
                  disabled={isDownloadingFilledPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isDownloadingFilledPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Filled PDF
                    </>
                  )}
                </button>
                <a
                  href={pdfUrl}
                  download={currentForm.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Original PDF
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
