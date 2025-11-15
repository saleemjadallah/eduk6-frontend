// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  /**
   * Convenience display name synthesized from first/last name when not provided by the API.
   */
  name: string;
  uploads_used: number;
  batches_created: number;
  totalHeadshots?: number;
  profileImageUrl?: string | null;
  isFreeUser?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// VISADOCS TYPES
// ============================================================================

// Uploaded document metadata
export interface UploadedDocument {
  type: string; // passport, photo, bank_statement, etc.
  originalName: string;
  r2Url: string;
  uploadedAt: Date;
  status: 'pending' | 'validated' | 'rejected';
  validationErrors?: string[];
}

// Generated visa photo
export interface VisaPhoto {
  country: string; // uae, schengen, usa, etc.
  r2Url: string;
  thumbnailUrl?: string;
  specifications: {
    dimensions: string;
    background: string;
    dpi: number;
  };
  generatedAt: Date;
}

// Translated document
export interface TranslatedDocument {
  originalUrl: string;
  translatedUrl: string;
  fromLanguage: string;
  toLanguage: string;
  translatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Filled form
export interface FilledForm {
  formType: string; // ds160, schengen_application, etc.
  formUrl: string;
  filledAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Visa requirement item
export interface VisaRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'missing' | 'pending' | 'completed';
  documentType?: string;
}

// Package status
export type VisaPackageStatus =
  | 'in_progress'
  | 'documents_uploaded'
  | 'photos_generated'
  | 'forms_filled'
  | 'ready_for_submission'
  | 'submitted'
  | 'approved'
  | 'rejected';

// Visa package (main entity)
export interface VisaPackage {
  id: number;
  userId: string;

  // Visa details
  visaType: string; // work_visa, tourist_visa, etc.
  destinationCountry: string; // uae, schengen, usa, etc.
  nationality?: string;
  applicantName?: string;

  // Uploaded content
  uploadedDocuments: UploadedDocument[];
  visaPhotos: VisaPhoto[];
  translatedDocuments: TranslatedDocument[];
  filledForms: FilledForm[];

  // Requirements tracking
  requirements: VisaRequirement[];
  missingItems: string[];
  completenessScore?: number; // 0-100

  // Plan and pricing
  plan: 'basic' | 'professional' | 'premium';
  amountPaid: number; // In cents
  stripePaymentId?: string;

  // Status
  status: VisaPackageStatus;

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  completedAt?: Date;
}

// VisaDocs plan configuration
export interface VisaDocsPlanConfig {
  id: 'basic' | 'professional' | 'premium';
  name: string;
  price: number; // In cents
  stripePriceId?: string;
  popular?: boolean;
  features: {
    documentValidation: boolean;
    formAutoFill: number; // Number of forms
    photoGeneration: boolean;
    translation: boolean | number; // true/false or number of docs
    expertReview: boolean;
    prioritySupport: boolean;
    iterationSupport: boolean;
    dedicatedManager?: boolean;
  };
  limits: {
    maxDocuments?: number;
    maxForms?: number;
    maxTranslations?: number;
  };
}

// Jeffrey chat message
export interface JeffreyMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    title: string;
    url: string;
  }[];
}

// Chat session
export interface ChatSession {
  id: number;
  userId: string;
  packageId?: number;
  visaContext?: {
    country: string;
    visaType: string;
  };
  messages: JeffreyMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Platform specifications for each template
export interface PlatformSpecs {
  aspectRatio: string; // "1:1", "4:5", "16:9", etc.
  dimensions: string; // "1024x1024", "1080x1350", etc.
  optimizedFor: string; // "LinkedIn profile photo", "Resume", etc.
  fileFormat: string; // "JPG", "PNG"
  colorProfile: string; // "sRGB", "Adobe RGB"
}

// Style template definition
export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
  icon: string; // Lucide icon name

  // Generation parameters
  background: string;
  outfit: string;
  lighting: string;
  expression: string;
  pose: string;

  // Platform specifications
  platformSpecs: PlatformSpecs;

  // Gemini prompt
  geminiPrompt: string;
}

// Headshot types
export interface GeneratedHeadshot {
  url: string;
  template: string; // Template ID
  background: string;
  outfit: string;
  thumbnail: string;
  platformSpecs: PlatformSpecs;
}

// Batch status
export type BatchStatus = 'processing' | 'completed' | 'failed';

// Headshot batch
export interface HeadshotBatch {
  id: number;
  userId: string;
  status: BatchStatus;

  // Input photos
  uploadedPhotos: string[]; // R2 URLs
  photoCount: number;

  // Generation settings
  plan: 'basic' | 'professional' | 'executive';
  styleTemplates: string[]; // Template IDs
  backgrounds?: string[];
  outfits?: string[];

  // Results
  generatedHeadshots: GeneratedHeadshot[];
  headshotCount: number;
  headshotsByTemplate: { [templateId: string]: number };

  // Metadata
  createdAt: Date;
  completedAt?: Date;
  processingTimeMinutes?: number;

  // Pricing
  amountPaid: number; // In cents
  stripePaymentId?: string;
}

// Plan configuration
export interface PlanConfig {
  id: 'basic' | 'professional' | 'executive';
  name: string;
  price: number; // In cents
  headshots: number;
  backgrounds: number;
  outfits: number;
  editCredits: number;
  turnaroundHours: number;
  stripePriceId: string;
  popular?: boolean;
  features: string[];
  // Virtual wardrobe features
  canChangeOutfits: boolean;
  virtualOutfits: number;
  premiumOutfits: number;
}

// Edit request
export interface EditRequest {
  id: number;
  batchId: number;
  userId: string;
  headshotId: string; // URL of original headshot
  editType: 'background_change' | 'outfit_change' | 'regenerate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  // Outfit change details
  outfitId?: string;
  colorVariant?: string;
  costInCredits: number;
  // Results
  resultUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
  processingTimeSeconds?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
