import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, ExternalLink, Globe, AlertCircle, HelpCircle, Lightbulb, Download, ArrowLeft, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { cn } from '../../utils/cn';
import { onboardingApi, visaDocsApi } from '../../lib/api';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { profileApi, CompleteProfile } from '../../lib/api-profile';
import { validateForm, countryValidationRules } from '../../lib/validation-rules';

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

interface FormSearchCache {
  forms: SuggestedForm[];
  additionalResources: AdditionalResource[];
  processingNotes: string;
  cacheKey: string;
  cachedAt: Date;
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

  // PDF view state
  const [pdfViewExpanded, setPdfViewExpanded] = useState(false); // Collapsible state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]); // Store PDF page images for AI analysis
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);

  // Profile auto-fill state (kept for future use)
  const [, setUserProfile] = useState<CompleteProfile | null>(null);
  const [, setProfileCompleteness] = useState(0);
  const [, setIsLoadingProfile] = useState(false);
  const [, setShowProfilePrompt] = useState(false);
  const [, setValidationErrors] = useState<Array<{ fieldId: string; message: string; severity: 'error' | 'warning' | 'info' }>>([]);

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

  // Run validation when fields change (kept for future use)
  useEffect(() => {
    if (currentForm && travelProfile) {
      const formData: Record<string, string> = {};
      currentForm.fields.forEach(field => {
        formData[field.name] = field.value;
      });

      const validation = validateForm(
        formData,
        travelProfile.destinationCountry,
        travelProfile.visaRequirements?.visaType || ''
      );
      setValidationErrors(validation.errors);
    }
  }, [currentForm?.fields, travelProfile]);

  // Analyze uploaded form with Gemini Vision for validation
  const analyzeFormForValidation = async (pdfImages: string[]) => {
    setIsAnalyzingForm(true);
    try {
      const prompt = `You are a visa application form validator. Analyze this form and provide validation insights.

Please analyze the form and return a JSON object with:
1. overallScore: A score from 0-100 indicating form completeness and correctness
2. completedFields: Number of fields that appear to be filled
3. totalFields: Total number of fields detected
4. issues: Array of validation issues found, each with:
   - id: unique identifier
   - fieldName: name of the problematic field
   - type: "error" | "warning" | "info"
   - message: description of the issue
   - suggestion: how to fix it (optional)
5. recommendations: Array of general recommendations
6. countrySpecificNotes: Notes specific to ${travelProfile?.destinationCountry || 'the destination country'}

Focus on:
- Missing required fields
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
        country: travelProfile?.destinationCountry || ''
      });

      if (response.success && response.data) {
        try {
          // Extract JSON from response
          const jsonMatch = response.data.analysis?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            setValidationAnalysis(analysisData);
          } else if (response.data.validation) {
            // Direct validation object from API
            setValidationAnalysis(response.data.validation);
          } else {
            // If no JSON found, create a basic structure
            setValidationAnalysis({
              overallScore: 0,
              completedFields: 0,
              totalFields: 0,
              issues: [{
                id: 'parse-error',
                fieldName: 'Analysis',
                type: 'warning',
                message: 'Could not fully parse form. Please try uploading again.',
              }],
              recommendations: ['Upload a clearer PDF for better analysis'],
              countrySpecificNotes: []
            });
          }
        } catch (parseError) {
          console.error('Error parsing validation response:', parseError);
          setValidationAnalysis({
            overallScore: 50,
            completedFields: 0,
            totalFields: 0,
            issues: [],
            recommendations: ['Form uploaded successfully. Hover over specific areas for detailed validation.'],
            countrySpecificNotes: []
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing form:', error);
    } finally {
      setIsAnalyzingForm(false);
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

  // Re-capture current PDF state with filled values
  const recapturePDFState = async (): Promise<string[]> => {
    if (!currentForm?.pdfBytes) return pageImages;

    try {
      // Re-render the PDF with current field values filled in
      const pdfDoc = await PDFDocument.load(currentForm.pdfBytes.slice(0));
      const form = pdfDoc.getForm();

      // Fill the PDF with current field values
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
          // Field might not exist
        }
      });

      // Save the filled PDF
      const filledPdfBytes = await pdfDoc.save();

      // Convert to images for Gemini Vision
      const newImages = await convertPDFPagesToImages(filledPdfBytes.buffer as ArrayBuffer);
      return newImages;
    } catch (error) {
      console.error('Error recapturing PDF state:', error);
      return pageImages; // Fall back to original images
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
    const newImages = await recapturePDFState();
    if (newImages.length > 0) {
      setPageImages(newImages);
      await analyzeFormForValidation(newImages);
      setLastValidationTime(new Date());
    }
  };

  // Manual re-analyze with current PDF state
  const handleReanalyze = async () => {
    if (isAnalyzingForm || !currentForm) return;

    console.log('[FormFiller] Manual re-analyze triggered');
    const newImages = await recapturePDFState();
    if (newImages.length > 0) {
      setPageImages(newImages);
      await analyzeFormForValidation(newImages);
      setLastValidationTime(new Date());
      // Reset countdown
      setValidationCountdown(15);
    }
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
  const convertPDFPagesToImages = async (pdfBytes: ArrayBuffer): Promise<string[]> => {
    try {
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

  // Analyze PDF form fields using Gemini Vision AI
  const analyzeFormWithAI = async (pdfBytes: ArrayBuffer, fieldCount: number): Promise<Map<number, { label: string; fieldType: string; confidence: number }>> => {
    setAnalyzingWithAI(true);
    const fieldMap = new Map<number, { label: string; fieldType: string; confidence: number }>();

    try {
      const images = await convertPDFPagesToImages(pdfBytes);
      setPageImages(images);

      if (images.length === 0) {
        console.error('No page images generated');
        return fieldMap;
      }

      console.log(`Sending ${images.length} pages to Gemini Vision for analysis...`);

      const response = await visaDocsApi.analyzePDFForm({
        pageImages: images,
        fieldCount,
        visaType: travelProfile?.visaRequirements?.visaType
      });

      if (response.success && response.data?.fields) {
        response.data.fields.forEach((field: { fieldNumber: number; label: string; fieldType: string; confidence: number }) => {
          fieldMap.set(field.fieldNumber, {
            label: field.label,
            fieldType: field.fieldType,
            confidence: field.confidence
          });
        });
        console.log(`AI identified ${fieldMap.size} fields`);
      }
    } catch (error) {
      console.error('Error analyzing form with AI:', error);
    } finally {
      setAnalyzingWithAI(false);
    }

    return fieldMap;
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
      const aiFieldMap = await analyzeFormWithAI(bytesForAI, pdfFields.length);

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

      // Create PDF URL for viewing
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Convert PDF to images for AI validation analysis
      const pdfImagesForValidation = await convertPDFPagesToImages(arrayBuffer.slice(0));

      const fields = await extractPDFFields(arrayBuffer);

      const uploadedForm: UploadedForm = {
        id: `form-${Date.now()}`,
        fileName: file.name,
        pdfBytes: arrayBuffer,
        fields: fields.length > 0 ? fields : [], // Allow empty fields for non-fillable PDFs
        extractedAt: new Date()
      };

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

  // Field change handler (kept for future use)
  const _handleFieldChange = (_fieldId: string, _value: string) => {
    if (!currentForm) return;

    setCurrentForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map(field =>
          field.id === _fieldId ? { ...field, value: _value } : field
        )
      };
    });
  };
  // Suppress unused warning
  void _handleFieldChange;

  const togglePDFExpanded = () => {
    setPdfViewExpanded(!pdfViewExpanded);
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
                AI identified {currentForm.fields.length} fields. Complete each field with guidance.
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
              <div className="h-[500px]">
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">PDF preview not available in browser</p>
                      <a
                        href={pdfUrl}
                        download
                        className="text-indigo-600 underline text-sm mt-2 inline-block"
                      >
                        Download PDF to view
                      </a>
                    </div>
                  </div>
                </object>
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
                <button
                  onClick={handleReanalyze}
                  disabled={isAnalyzingForm || pageImages.length === 0}
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

        {/* Country Requirements (from validation rules) */}
        {travelProfile && countryValidationRules[travelProfile.destinationCountry.toLowerCase()] && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              {travelProfile.destinationCountry} Visa Requirements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Passport Validity</p>
                <p className="text-gray-900">{countryValidationRules[travelProfile.destinationCountry.toLowerCase()].passportValidityMonths} months</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Date Format</p>
                <p className="text-gray-900">{countryValidationRules[travelProfile.destinationCountry.toLowerCase()].dateFormat}</p>
              </div>
              {countryValidationRules[travelProfile.destinationCountry.toLowerCase()].onwardTicketRequired && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="font-medium text-amber-700">⚠️ Onward Ticket</p>
                  <p className="text-amber-900">Required</p>
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
              <a
                href={pdfUrl}
                download={currentForm.fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" />
                Download Original PDF
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
