/**
 * TypeScript types for AI Form Filler feature
 */

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  type: 'text' | 'date' | 'number' | 'checkbox' | 'signature';
  boundingBox?: number[];
}

export interface DocumentMetadata {
  pageCount: number;
  hasForm: boolean;
  fieldCount: number;
  title?: string;
  author?: string;
}

export interface ExtractionResult {
  fields: ExtractedField[];
  method: 'azure_layout' | 'azure_prebuilt_id' | 'gemini_flash';
  confidence: number;
  pageCount: number;
  processingTime: number;
}

export interface FieldMapping {
  extractedField: ExtractedField;
  canonicalPath: string | null;
  confidence: number;
  needsTransform: boolean;
  transform?: string;
  suggestion?: string;
  populatedValue?: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  autoFixable?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  overallConfidence: number;
  status: 'auto_approved' | 'needs_review' | 'needs_full_review';
  reviewMessage: string;
  recommendedActions: string[];
  statistics: {
    autoFillRate: number;
    reviewRate: number;
    avgConfidence: number;
    completeness: number;
  };
}

export interface ReviewItem {
  fieldId: string;
  reason: string;
  suggestion?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FilledForm {
  id: string;
  status: string;
  confidence: number | null;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface FormFillerUploadResponse {
  success: boolean;
  data?: {
    documentType: string;
    metadata: DocumentMetadata;
    extraction: ExtractionResult;
  };
  error?: string;
  details?: string;
}

export interface FormFillerMapResponse {
  success: boolean;
  data?: {
    populatedFields: FieldMapping[];
    statistics: {
      totalFields: number;
      matchedFields: number;
      autoPopulatedFields: number;
      matchRate: number;
    };
  };
  error?: string;
  details?: string;
}

export interface FormFillerFillResponse {
  success: boolean;
  data?: {
    formId: string;
    downloadUrl: string;
    statistics: {
      populatedFields: number;
      skippedFields: number;
      processingTime: number;
    };
    errors?: Array<{
      fieldId: string;
      error: string;
    }>;
  };
  error?: string;
  details?: string;
}

export interface FormFillerValidateResponse {
  success: boolean;
  data?: {
    validation: ValidationResult;
    issues: {
      errors: ValidationIssue[];
      warnings: ValidationIssue[];
      infos: ValidationIssue[];
    };
    reviewItems?: ReviewItem[];
    aiValidation: {
      used: boolean;
      confidence?: number;
      suggestions?: string[];
      contradictions?: Array<{
        field1: string;
        field2: string;
        description: string;
      }>;
    };
  };
  error?: string;
  details?: string;
}

export interface FormFillerHistoryResponse {
  success: boolean;
  data?: {
    forms: FilledForm[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  error?: string;
  details?: string;
}

export interface FieldPopulation {
  fieldId: string;
  formFieldLabel: string;
  value: string;
  canonicalPath?: string;
  transform?: string;
  targetFormat?: string;
}
