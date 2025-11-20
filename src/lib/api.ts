import axios, { AxiosInstance } from 'axios';
import type { User, HeadshotBatch, ApiResponse, EditRequest, VisaPackage, ChatSession, JeffreyMessage } from '@/types';
import type { ProfessionalOutfit, OutfitFilter, WardrobeApiResponse } from '@/types/wardrobe.types';

const RAW_API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();
const NORMALIZED_API_URL = RAW_API_URL.replace(/\/+$/, '');
const API_BASE_URL = NORMALIZED_API_URL.endsWith('/api') ? NORMALIZED_API_URL : `${NORMALIZED_API_URL}/api`;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  // Register with email/password
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }): Promise<{ message: string; userId: string; email: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Verify registration with OTP code
  verifyRegistration: async (email: string, code: string): Promise<User> => {
    const response = await api.post('/auth/verify-registration', { email, code });
    return response.data;
  },

  // Login with email/password
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Request OTP for passwordless login
  requestOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/request-otp', { email });
    return response.data;
  },

  // Login with OTP code
  loginWithOtp: async (email: string, code: string): Promise<User> => {
    const response = await api.post('/auth/login-otp', { email, code });
    return response.data;
  },

  // Login/register with Google (Firebase ID token)
  googleAuth: async (idToken: string): Promise<User> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// VisaDocs API
export const visaDocsApi = {
  // Packages
  getPackages: async (): Promise<ApiResponse<VisaPackage[]>> => {
    const response = await api.get('/visadocs/packages');
    return response.data;
  },

  getPackage: async (id: number): Promise<ApiResponse<VisaPackage>> => {
    const response = await api.get(`/visadocs/packages/${id}`);
    return response.data;
  },

  createPackage: async (data: {
    visaType: string;
    destinationCountry: string;
    nationality?: string;
    applicantName?: string;
    plan: 'basic' | 'professional' | 'premium';
  }): Promise<ApiResponse<VisaPackage>> => {
    const response = await api.post('/visadocs/packages', data);
    return response.data;
  },

  updatePackage: async (id: number, data: Partial<VisaPackage>): Promise<ApiResponse<VisaPackage>> => {
    const response = await api.patch(`/visadocs/packages/${id}`, data);
    return response.data;
  },

  deletePackage: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/visadocs/packages/${id}`);
    return response.data;
  },

  // Document Upload
  uploadDocuments: async (
    packageId: number,
    files: File[],
    documentTypes: string[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ package: VisaPackage; uploadedDocuments: any[] }>> => {
    const formData = new FormData();
    formData.append('packageId', packageId.toString());
    formData.append('documentTypes', JSON.stringify(documentTypes));
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await api.post('/visadocs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });
    return response.data;
  },

  // Photo Upload (for visa photo generation)
  uploadPhotos: async (
    packageId: number,
    photos: File[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ uploadedPhotos: string[] }>> => {
    const formData = new FormData();
    formData.append('packageId', packageId.toString());
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const response = await api.post('/visadocs/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });
    return response.data;
  },

  // Jeffrey Chat
  sendChatMessage: async (data: {
    message: string;
    sessionId?: number;
    visaContext?: {
      visaType?: string;
      destinationCountry?: string;
      nationality?: string;
      stage?: string;
      packageId?: number;
    };
    useSearch?: boolean;
  }): Promise<ApiResponse<{
    message: JeffreyMessage;
    sessionId?: number;
    conversationLength: number;
  }>> => {
    const response = await api.post('/visadocs/chat', data);
    return response.data;
  },

  quickQuestion: async (data: {
    question: string;
    visaType?: string;
    destinationCountry?: string;
  }): Promise<ApiResponse<{ response: string }>> => {
    const response = await api.post('/visadocs/chat/quick', data);
    return response.data;
  },

  getSuggestions: async (params: {
    stage?: string;
    visaType?: string;
    destinationCountry?: string;
  }): Promise<ApiResponse<{ suggestions: string[] }>> => {
    const queryParams = new URLSearchParams();
    if (params.stage) queryParams.append('stage', params.stage);
    if (params.visaType) queryParams.append('visaType', params.visaType);
    if (params.destinationCountry) queryParams.append('destinationCountry', params.destinationCountry);

    const response = await api.get(`/visadocs/chat/suggestions?${queryParams.toString()}`);
    return response.data;
  },

  getChatSessions: async (): Promise<ApiResponse<ChatSession[]>> => {
    const response = await api.get('/visadocs/chat/sessions');
    return response.data;
  },

  getChatSession: async (id: number): Promise<ApiResponse<ChatSession>> => {
    const response = await api.get(`/visadocs/chat/sessions/${id}`);
    return response.data;
  },

  deleteChatSession: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/visadocs/chat/sessions/${id}`);
    return response.data;
  },

  clearChatSession: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post(`/visadocs/chat/sessions/${id}/clear`);
    return response.data;
  },

  // Visa Forms - AI-powered form discovery
  searchVisaForms: async (params: {
    country: string;
    visaType?: string;
    purpose?: string;
    nationality?: string;
  }): Promise<ApiResponse<{
    country: string;
    visaType: string;
    forms: Array<{
      name: string;
      description: string;
      officialUrl: string;
      source: string;
      formType: string;
      instructions?: string;
    }>;
    additionalResources?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
    processingNotes?: string;
    searchedAt: string;
  }>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('country', params.country);
    if (params.visaType) queryParams.append('visaType', params.visaType);
    if (params.purpose) queryParams.append('purpose', params.purpose);
    if (params.nationality) queryParams.append('nationality', params.nationality);

    const response = await api.get(`/visadocs/forms/search?${queryParams.toString()}`);
    return response.data;
  },

  // PDF Form Field Extraction - Extracts actual form field definitions from PDF structure
  // This bypasses character box overlays and reads the actual fillable fields
  extractPDFFields: async (data: {
    pdfBuffer: string; // Base64 encoded PDF file
    useAzure?: boolean; // Optional: correlate with Azure DI
  }): Promise<ApiResponse<{
    fields: Array<{
      fieldNumber: number;
      fieldName: string;
      label: string;
      type: string;
      value: string;
      readOnly: boolean;
      required: boolean;
      maxLength?: number;
    }>;
    totalFields: number;
    pageCount: number;
    hasOverlays: boolean;
    correlation?: Array<{
      fieldName: string;
      detectedLabel: string;
      generatedLabel: string;
      type: string;
      confidence: number;
      matched: boolean;
    }>;
    extractedAt: string;
  }>> => {
    const response = await api.post('/visadocs/forms/extract-fields', data);
    return response.data;
  },

  // PDF Form Analysis using Azure Document Intelligence (LEGACY - may not work with overlays)
  analyzePDFForm: async (data: {
    pdfBuffer: string; // Base64 encoded PDF file
    visaType?: string;
  }): Promise<ApiResponse<{
    fields: Array<{
      fieldNumber: number;
      label: string;
      value: string;
      fieldType: string;
      confidence: number;
      pageNumber: number;
    }>;
    queryResults?: Array<{
      field: string;
      value: string;
      confidence: number;
    }>;
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
    totalFields: number;
    pagesAnalyzed: number;
    extractionMethod: 'azure_layout' | 'azure_document' | 'azure_prebuilt_id' | 'gemini_flash';
    overallConfidence: number;
    processingTime: number;
    qualityAssessment?: {
      quality: 'high' | 'medium' | 'low';
      score: number;
      reasons: string[];
    };
    visaType: string;
    analyzedAt: string;
  }>> => {
    const response = await api.post('/visadocs/forms/analyze-pdf', data);
    return response.data;
  },

  reanalyzeField: async (data: {
    pageImage: string; // Base64 encoded PNG image
    fieldIndex: number;
    currentLabel: string;
    visaType?: string;
  }): Promise<ApiResponse<{
    fieldIndex: number;
    previousLabel: string;
    newLabel: string;
    confidence: number;
    fieldType: string;
    analyzedAt: string;
  }>> => {
    const response = await api.post('/visadocs/forms/reanalyze-field', data);
    return response.data;
  },

  // Helper methods for unified dashboard with Jeffrey
  sendMessage: async (
    message: string,
    options?: {
      sessionId?: string;
      visaContext?: {
        visaType?: string;
        destinationCountry?: string;
        nationality?: string;
        stage?: string;
      };
    }
  ): Promise<{
    data?: {
      response: string;
      sessionId?: string;
      sources?: { title: string; url: string }[];
      suggestions?: string[];
    };
  }> => {
    try {
      const response = await api.post('/visadocs/chat', {
        message,
        sessionId: options?.sessionId ? parseInt(options.sessionId, 10) : undefined,
        visaContext: options?.visaContext,
        useSearch: true,
      });

      if (response.data?.success) {
        return {
          data: {
            response: response.data.data.message.content,
            sessionId: response.data.data.sessionId?.toString(),
            sources: response.data.data.message.sources,
            suggestions: [],
          },
        };
      }
      return { data: undefined };
    } catch (error) {
      console.error('Failed to send message to Jeffrey:', error);
      throw error;
    }
  },

  getSuggestedQuestions: async (
    stage?: string,
    visaType?: string,
    destinationCountry?: string
  ): Promise<{ data?: { questions: string[] } }> => {
    try {
      const queryParams = new URLSearchParams();
      if (stage) queryParams.append('stage', stage);
      if (visaType) queryParams.append('visaType', visaType);
      if (destinationCountry) queryParams.append('destinationCountry', destinationCountry);

      const response = await api.get(`/visadocs/chat/suggestions?${queryParams.toString()}`);

      if (response.data?.success) {
        return {
          data: {
            questions: response.data.data.suggestions || [],
          },
        };
      }
      return { data: { questions: [] } };
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return { data: { questions: [] } };
    }
  },

  // Analyze form validation using Gemini Vision
  analyzeFormValidation: async (data: {
    pageImages: string[];
    prompt: string;
    country: string;
    fieldData?: Record<string, string>;
    filledPdfBase64?: string;
  }): Promise<ApiResponse<{
    analysis?: string;
    validation?: {
      overallScore: number;
      completedFields: number;
      totalFields: number;
      issues: Array<{
        id: string;
        fieldName: string;
        type: 'error' | 'warning' | 'info';
        message: string;
        suggestion?: string;
      }>;
      recommendations: string[];
      countrySpecificNotes: string[];
    };
  }>> => {
    const response = await api.post('/visadocs/forms/analyze-validation', data);
    return response.data;
  },

  // Get Jeffrey's guidance for specific fields
  getFieldGuidance: async (data: {
    fields: Array<{ name: string; label?: string }>;
    country: string;
    visaType: string;
  }): Promise<ApiResponse<{
    fieldGuidance: Array<{
      fieldName: string;
      description: string;
      importance: 'required' | 'recommended' | 'optional';
      commonMistakes: string[];
    }>;
  }>> => {
    const response = await api.post('/visadocs/forms/get-field-guidance', data);
    return response.data;
  },
};

// Form Filler API
export type FormDraftStatus = 'draft' | 'completed' | 'submitted' | 'processing';

export interface FormDraftSummary {
  id: string;
  fileName: string;
  updatedAt: string;
  createdAt: string;
  completionPercentage: number;
  country?: string;
  visaType?: string;
  hasPdf: boolean;
  totalFields: number;
  filledFields: number;
  status: FormDraftStatus;
  versionHistory?: Array<{
    snapshotId: string;
    savedAt: string;
    completionPercentage: number;
  }>;
}

export const formFillerApi = {
  // Save draft (autosave)
  saveDraft: async (data: {
    formId?: string;
    formData: any;
    pdfBytes?: string; // Base64
    fields?: any[];
    fileName?: string;
    country?: string;
    visaType?: string;
    formName?: string;
  }): Promise<ApiResponse<{
    formId: string;
    savedAt: string;
    persisted?: boolean;
    hasPdf?: boolean;
    versionId?: string;
    versions?: Array<{
      snapshotId: string;
      savedAt: string;
      completionPercentage: number;
    }>;
  }>> => {
    const response = await api.post('/form-filler/save-draft', data);
    return response.data;
  },

  getDraft: async (): Promise<ApiResponse<{
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
  } | null>> => {
    const response = await api.get('/form-filler/draft');
    return response.data;
  },

  listDrafts: async (): Promise<ApiResponse<{
    drafts: FormDraftSummary[];
  }>> => {
    const response = await api.get('/form-filler/drafts');
    return response.data;
  },

  getDraftById: async (draftId: string): Promise<ApiResponse<{
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
  }>> => {
    const response = await api.get(`/form-filler/drafts/${draftId}`);
    return response.data;
  },

  updateDraftStatus: async (input: {
    formId: string;
    status: Extract<FormDraftStatus, 'draft' | 'completed'>;
    context?: string;
  }): Promise<ApiResponse<{
    formId: string;
    status: FormDraftStatus;
    completedAt?: string;
  }>> => {
    const response = await api.patch(`/form-filler/${input.formId}/status`, {
      status: input.status,
      context: input.context,
    });
    return response.data;
  },

  deleteDraft: async (formId: string): Promise<ApiResponse<{ formId: string }>> => {
    const response = await api.delete(`/form-filler/drafts/${formId}`);
    return response.data;
  },

  deleteForm: async (formId: string): Promise<ApiResponse<{ formId: string }>> => {
    const response = await api.delete(`/form-filler/${formId}`);
    return response.data;
  },

  restoreDraftVersion: async (data: { formId: string; versionId: string }): Promise<ApiResponse<{
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
  }>> => {
    const response = await api.post(`/form-filler/drafts/${data.formId}/versions/${data.versionId}/restore`);
    return response.data;
  },
};

// Batch API
export const batchApi = {
  // Upload photos to R2 - Using direct upload endpoint
  uploadPhotos: async (files: File[], onProgress?: (progress: number) => void): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });
    return response.data;
  },

  // Create new batch (after payment)
  createBatch: async (data: {
    uploadedPhotos: string[];
    plan: string;
    styleTemplates: string[];
    backgrounds?: string[];
    outfits?: string[];
    stripeSessionId?: string;
    amountPaid?: number;
  }): Promise<ApiResponse<HeadshotBatch>> => {
    const response = await api.post('/batches/create', data);
    return response.data;
  },

  // Get user's batches
  getBatches: async (): Promise<ApiResponse<HeadshotBatch[]>> => {
    const response = await api.get('/batches');
    return response.data;
  },

  // Get specific batch
  getBatch: async (id: number): Promise<ApiResponse<HeadshotBatch>> => {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },

  // Delete batch
  deleteBatch: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  },

  // Get batch status
  getBatchStatus: async (id: number): Promise<ApiResponse<{ status: string; progress?: number }>> => {
    const response = await api.get(`/batches/${id}/status`);
    return response.data;
  },

  // Request outfit change edit (costs 2 credits)
  requestOutfitChange: async (
    batchId: number,
    headshotId: string,
    outfitId: string,
    colorVariant?: string
  ): Promise<ApiResponse<{ editRequest: EditRequest; creditsRemaining: number }>> => {
    const response = await api.post(`/batches/${batchId}/edit`, {
      headshotId,
      outfitId,
      colorVariant,
    });
    return response.data;
  },

  // Get edit history
  getEdits: async (batchId: number): Promise<ApiResponse<EditRequest[]>> => {
    const response = await api.get(`/batches/${batchId}/edits`);
    return response.data;
  },

  // Get single edit request
  getEdit: async (batchId: number, editId: number): Promise<ApiResponse<EditRequest>> => {
    const response = await api.get(`/batches/${batchId}/edits/${editId}`);
    return response.data;
  },

  // Download single headshot
  downloadHeadshot: async (batchId: number, headshotId: string): Promise<Blob> => {
    const response = await api.get(`/batches/${batchId}/download/${headshotId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download all as ZIP
  downloadAll: async (batchId: number): Promise<Blob> => {
    const response = await api.get(`/batches/${batchId}/download-all`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Checkout API
export const checkoutApi = {
  // Create Stripe checkout session
  createSession: async (data: {
    plan: string;
    uploadedPhotos: string[];
    styleTemplates: string[];
    preferences?: any;
  }): Promise<ApiResponse<{ sessionId: string; url: string }>> => {
    const response = await api.post('/checkout/create-session', data);
    return response.data;
  },

  // Verify payment success
  verifySession: async (sessionId: string): Promise<ApiResponse<{ paid: boolean; batchId?: number }>> => {
    const response = await api.get(`/checkout/verify/${sessionId}`);
    return response.data;
  },
};

// Onboarding API
export const onboardingApi = {
  // Check onboarding status
  getStatus: async (): Promise<ApiResponse<{
    onboardingCompleted: boolean;
    travelProfile: {
      destinationCountry: string;
      travelPurpose: string;
      nationality: string;
      travelDates: { start: string; end: string };
      specialConcerns: string[];
      visaRequirements?: {
        visaType: string;
        processingTime: string;
        requiredDocuments: string[];
        photoRequirements: {
          dimensions: string;
          background: string;
          specifications: string[];
        };
        fees: string;
        validity: string;
        additionalNotes: string[];
      };
      lastUpdated: string;
    } | null;
  }>> => {
    const response = await api.get('/onboarding/status');
    return response.data;
  },

  // Complete onboarding with travel profile
  complete: async (travelProfile: {
    destinationCountry: string;
    travelPurpose: string;
    nationality: string;
    travelDates: { start: string; end: string };
    specialConcerns: string[];
  }): Promise<ApiResponse<{
    travelProfile: any;
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: { label: string; href: string };
    }[];
    message: string;
  }>> => {
    const response = await api.post('/onboarding/complete', travelProfile);
    return response.data;
  },

  // Update travel profile
  updateProfile: async (travelProfile: {
    destinationCountry: string;
    travelPurpose: string;
    nationality: string;
    travelDates: { start: string; end: string };
    specialConcerns: string[];
  }): Promise<ApiResponse<{
    travelProfile: any;
    recommendations: any[];
  }>> => {
    const response = await api.put('/onboarding/profile', travelProfile);
    return response.data;
  },

  // Skip onboarding
  skip: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/onboarding/skip');
    return response.data;
  },

  // Get personalized recommendations
  getRecommendations: async (): Promise<ApiResponse<{
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: { label: string; href: string };
    }[];
  }>> => {
    const response = await api.get('/onboarding/recommendations');
    return response.data;
  },
};

// Wardrobe API
export const wardrobeApi = {
  // Get available professional outfits
  getWardrobe: async (filters?: OutfitFilter): Promise<ApiResponse<WardrobeApiResponse>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.minFormality) params.append('minFormality', filters.minFormality.toString());
    if (filters?.premiumOnly) params.append('premiumOnly', 'true');

    const response = await api.get(`/batches/wardrobe?${params.toString()}`);
    return response.data;
  },

  // Get single outfit by ID
  getOutfit: async (outfitId: string): Promise<ApiResponse<ProfessionalOutfit>> => {
    const response = await api.get(`/batches/wardrobe/${outfitId}`);
    return response.data;
  },

  // Get preview of outfit on headshot (non-destructive, no credits consumed)
  getOutfitPreview: async (
    headshotUrl: string,
    outfitId: string,
    options?: {
      templateId?: string;
      colorVariant?: string;
    }
  ): Promise<ApiResponse<{ preview: string; outfit: ProfessionalOutfit }>> => {
    const response = await api.post('/batches/wardrobe/preview', {
      headshotUrl,
      outfitId,
      ...options,
    });
    return response.data;
  },

  // Get user's edit credits
  getEditCredits: async (): Promise<ApiResponse<{ remaining: number; total: number }>> => {
    const response = await api.get('/batches/edit-credits');
    return response.data;
  },
};

// Photo Compliance API
export const photoComplianceApi = {
  // Process a single photo for compliance
  processCompliance: async (file: File): Promise<ApiResponse<{
    success: boolean;
    message: string;
    originalFileName: string;
    requirements: {
      dimensions: string;
      background: string;
      specifications: string[];
    };
    processedPhotoUrl: string;
  }>> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/photo/process-compliance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export main axios instance
export { api };
export default api;
