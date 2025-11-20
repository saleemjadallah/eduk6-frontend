import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, ExternalLink, Globe, AlertCircle, HelpCircle, Lightbulb, Download, ArrowLeft, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';
import { onboardingApi, visaDocsApi, formFillerApi } from '../../lib/api';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { profileApi, CompleteProfile } from '../../lib/api-profile';
import { validateForm, smartFieldMapper } from '../../lib/validation-rules';

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
  const [validationAnalysis, setValidationAnalysis] = useState<{
    overallScore: number;
    completedFields: number;
    totalFields: number;
    issues: Array<{
      id: string;
      fieldName: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
      location?: { page: number; area: string };
    }>;
    recommendations: string[];
    countrySpecificNotes: string[];
  } | null>(null);
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
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update Jeffrey's context when entering this workflow
  useEffect(() => {
    updateWorkflow('form-filler');
    addRecentAction('Entered Form Filler workflow');
    loadFormData();
    loadUserProfile();
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

  const getFieldDisplayName = (fieldId: string) => {
    if (!currentForm) return formatFieldLabel(fieldId);
    const direct = currentForm.fields.find(field => field.name === fieldId);
    if (direct) return direct.label;
    const looseMatch = currentForm.fields.find(field =>
      field.name.toLowerCase().includes(fieldId.toLowerCase())
    );
    return looseMatch?.label || formatFieldLabel(fieldId);
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

      if (!data.passportNumber && (containsAll('passport', 'number') || containsAny('passport no', 'passport#'))) {
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

    return data;
  };

  const mergeUniqueStrings = (existing: string[], incoming: string[]): string[] => {
    const existingSet = new Set(existing);
    const filtered = incoming.filter(item => {
      if (existingSet.has(item)) return false;
      existingSet.add(item);
      return true;
    });
    return [...existing, ...filtered];
  };

  const mergeValidationAnalyses = (
    baseAnalysis: ReturnType<typeof sanitizeValidationResult> | null,
    incomingAnalysis: ReturnType<typeof sanitizeValidationResult>
  ) => {
    if (!baseAnalysis) return incomingAnalysis;

    const existingIssueIds = new Set(
      (baseAnalysis.issues as ValidationIssue[]).map(issue => issue.id)
    );
    const uniqueIncomingIssues = (incomingAnalysis.issues as ValidationIssue[]).filter(
      issue => !existingIssueIds.has(issue.id)
    );

    return {
      overallScore: incomingAnalysis.overallScore || baseAnalysis.overallScore,
      completedFields: incomingAnalysis.completedFields || baseAnalysis.completedFields,
      totalFields: incomingAnalysis.totalFields || baseAnalysis.totalFields,
      issues: [...baseAnalysis.issues, ...uniqueIncomingIssues],
      recommendations: mergeUniqueStrings(baseAnalysis.recommendations, incomingAnalysis.recommendations),
      countrySpecificNotes: mergeUniqueStrings(baseAnalysis.countrySpecificNotes, incomingAnalysis.countrySpecificNotes)
    };
  };

  const createLocalValidationAnalysis = (structuredData: Record<string, string>) => {
    const stats = getFormCompletionStats();
    const localResult = validateForm(
      structuredData,
      travelProfile?.destinationCountry || 'Unknown',
      travelProfile?.visaRequirements?.visaType || ''
    );

    const localIssues = localResult.errors.map((error, index) => ({
      id: `local-${error.fieldId}-${index}`,
      fieldName: getFieldDisplayName(error.fieldId),
      type: error.severity,
      message: error.message
    }));

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
    });
  };

  // Sanitize validation result to ensure all fields are in correct format
  const sanitizeValidationResult = (data: any) => {
    const normalizeTextValue = (value: any) => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        if (typeof value.message === 'string') return value.message;
        return JSON.stringify(value);
      }
      return String(value ?? '');
    };

    return {
      overallScore: typeof data.overallScore === 'number' ? data.overallScore : 0,
      completedFields: typeof data.completedFields === 'number' ? data.completedFields : 0,
      totalFields: typeof data.totalFields === 'number' ? data.totalFields : 0,
      issues: Array.isArray(data.issues) ? data.issues.map((issue: any) => ({
        id: String(issue.id || 'unknown'),
        fieldName: String(issue.fieldName || 'Unknown Field'),
        type: ['error', 'warning', 'info'].includes(issue.type) ? issue.type : 'info',
        message: String(issue.message || 'No details provided'),
        suggestion: issue.suggestion ? String(issue.suggestion) : undefined
      })) : [],
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.map((r: any) => normalizeTextValue(r)).filter((text: string) => text.length > 0)
        : [],
      countrySpecificNotes: Array.isArray(data.countrySpecificNotes)
        ? data.countrySpecificNotes.map((n: any) => normalizeTextValue(n)).filter((text: string) => text.length > 0)
        : []
    };
  };

  type ValidationIssue = ReturnType<typeof sanitizeValidationResult>['issues'][number];

  // Analyze uploaded form with Gemini Vision for validation
  const analyzeFormForValidation = async (
    pdfImages: string[],
    options?: {
      structuredData?: Record<string, string>;
      filledPdfBase64?: string;
      mergeWithExisting?: boolean;
      skipSpinner?: boolean;
    }
  ) => {
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
            setValidationAnalysis(prev => options?.mergeWithExisting
              ? mergeValidationAnalyses(prev, sanitized)
              : sanitized
            );
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
            setValidationAnalysis(prev => options?.mergeWithExisting
              ? mergeValidationAnalyses(prev, sanitized)
              : sanitized
            );
          } else {
            // If no JSON found, create a basic structure with our local counts
            const fallback = sanitizeValidationResult({
              overallScore: totalFieldGroups > 0
                ? Math.round((filledFieldGroups / totalFieldGroups) * 100)
                : 0,
              completedFields: filledFieldGroups,
              totalFields: totalFieldGroups,
              issues: [{
                id: 'parse-error',
                fieldName: 'Analysis',
                type: 'warning',
                message: 'Could not fully parse form. Please try uploading again.',
              }],
              recommendations: ['Upload a clearer PDF for better analysis'],
              countrySpecificNotes: []
            });
            setValidationAnalysis(prev => options?.mergeWithExisting
              ? mergeValidationAnalyses(prev, fallback)
              : fallback
            );
          }
        } catch (parseError) {
          console.error('Error parsing validation response:', parseError);
          const fallback = sanitizeValidationResult({
            overallScore: totalFieldGroups > 0
              ? Math.round((filledFieldGroups / totalFieldGroups) * 100)
              : 50,
            completedFields: filledFieldGroups,
            totalFields: totalFieldGroups,
            issues: [],
            recommendations: ['Form uploaded successfully. Hover over specific areas for detailed validation.'],
            countrySpecificNotes: []
          });
          setValidationAnalysis(prev => options?.mergeWithExisting
            ? mergeValidationAnalyses(prev, fallback)
            : fallback
          );
        }
      }
    } catch (error) {
      console.error('Error analyzing form:', error);
    } finally {
      if (!options?.skipSpinner) {
        setIsAnalyzingForm(false);
      }
    }
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
    setValidationAnalysis(prev => mergeValidationAnalyses(prev, localAnalysis));
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

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    setValidationAnalysis(prev => mergeValidationAnalyses(prev, localAnalysis));
    setLastValidationTime(new Date());

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

      await analyzeFormForValidation(imagesToAnalyze, {
        structuredData,
        filledPdfBase64,
        mergeWithExisting: true,
        skipSpinner: true
      });

      setLastValidationTime(new Date());
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
  const saveFormDraft = async () => {
    if (!currentForm) return;

    setAutosaveStatus('saving');
    try {
      // Extract current values
      const formData: Record<string, { value: string; source: 'manual' }> = {};
      currentForm.fields.forEach(field => {
        if (field.value) {
          formData[field.name] = {
            value: field.value,
            source: 'manual'
          };
        }
      });

      if (Object.keys(formData).length === 0) {
        setAutosaveStatus('saved');
        return;
      }

      const response = await formFillerApi.saveDraft({
        formId: formId || undefined,
        formData
      });

      if (response.success && response.data) {
        setFormId(response.data.formId);
        setLastSavedAt(new Date(response.data.savedAt));
        setAutosaveStatus('saved');
      } else {
        setAutosaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setAutosaveStatus('error');
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your PDF Form</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Download an official visa form from the links above, then upload it here. Jeffrey will extract the fields and help you fill them out correctly with smart suggestions.
            </p>

            <button
              onClick={handleUploadClick}
              disabled={isProcessingPDF || analyzingWithAI}
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
                  Choose PDF File
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Supported: PDF files with fillable form fields
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              AI Vision will automatically identify each field for accurate completion
            </p>
          </div>
        </div>
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
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-500">Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                  {autosaveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">Save failed</span>
                    </>
                  )}
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

                              const commonStyle: React.CSSProperties = {
                                position: 'absolute',
                                left: `${annotation.rect.left}px`,
                                top: `${annotation.rect.top}px`,
                                width: `${annotation.rect.width}px`,
                                height: `${annotation.rect.height}px`,
                                border: '1px solid rgba(99, 102, 241, 0.35)',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                fontSize,
                                padding: isCheckbox || isRadio ? '0' : '2px',
                                pointerEvents: 'auto'
                              };

                              if (isCheckbox) {
                                return (
                                  <input
                                    key={`${pageNum}-${annotation.fieldName}-${annotation.rect.left}-${annotation.rect.top}`}
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
                                    style={commonStyle}
                                    className="rounded-sm accent-indigo-600"
                                  />
                                );
                              }

                              if (isRadio) {
                                const optionValue = annotation.widgetValue || '';
                                return (
                                  <input
                                    key={`${pageNum}-${annotation.fieldName}-${annotation.rect.left}-${annotation.rect.top}`}
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
                                    style={commonStyle}
                                    className="accent-indigo-600"
                                  />
                                );
                              }

                              if (isTextarea) {
                                return (
                                  <textarea
                                    key={`${pageNum}-${annotation.fieldName}-${annotation.rect.left}-${annotation.rect.top}`}
                                    name={annotation.fieldName}
                                    value={fieldValue}
                                    onChange={(event) =>
                                      handleFieldChange(annotation.fieldName, event.currentTarget.value, annotation.fieldType, annotation.appearance)
                                    }
                                    style={{ ...commonStyle, resize: 'none' }}
                                    className="rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                );
                              }

                              return (
                                <input
                                  key={`${pageNum}-${annotation.fieldName}-${annotation.rect.left}-${annotation.rect.top}`}
                                  type="text"
                                  name={annotation.fieldName}
                                  value={fieldValue}
                                  onChange={(event) =>
                                    handleFieldChange(annotation.fieldName, event.currentTarget.value, annotation.fieldType, annotation.appearance)
                                  }
                                  style={commonStyle}
                                  className="rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
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

        {/* Validation Analysis Dashboard */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                  isAnalyzingForm ? "bg-gray-200 text-gray-600 animate-pulse" :
                    validationAnalysis?.overallScore && validationAnalysis.overallScore >= 80 ? "bg-green-100 text-green-700" :
                      validationAnalysis?.overallScore && validationAnalysis.overallScore >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                )}>
                  {isAnalyzingForm ? '...' : validationAnalysis?.overallScore || 0}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {isAnalyzingForm ? 'Analyzing Form...' : 'Form Validation Score'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAnalyzingForm ? 'AI is analyzing your form for potential issues' :
                      validationAnalysis ? `${validationAnalysis.completedFields}/${validationAnalysis.totalFields} fields analyzed` :
                        'Upload a form to get validation insights'}
                  </p>
                  {lastValidationTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last validated: {lastValidationTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Auto-validation toggle and countdown */}
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
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualValidationEnabled}
                      onChange={(e) => setVisualValidationEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Include visual QA</span>
                  </label>
                </div>
                <button
                  onClick={handleReanalyze}
                  disabled={isAnalyzingForm || !currentForm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzingForm ? 'Analyzing...' : 'Re-analyze Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Issues */}
          {validationAnalysis && validationAnalysis.issues.length > 0 && (
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
                      "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow",
                      issue.type === 'error' ? "bg-red-50 border-red-200" :
                        issue.type === 'warning' ? "bg-amber-50 border-amber-200" :
                          "bg-blue-50 border-blue-200"
                    )}
                    onClick={() => getFieldExplanation(issue.fieldName, issue.id)}
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
                      <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
          )}

          {/* Recommendations */}
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

          {/* Country-Specific Notes */}
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

          {/* Quick Field Lookup */}
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
