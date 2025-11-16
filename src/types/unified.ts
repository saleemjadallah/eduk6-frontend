// Unified VisaDocs Dashboard Types

export type WorkflowType = 'dashboard' | 'form-filler' | 'validator' | 'photo' | 'travel' | null;

export interface JeffreyMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { title: string; url: string }[];
}

export interface JeffreyContextState {
  workflow: WorkflowType;
  packageId: number | null;
  packageContext: {
    destinationCountry?: string;
    visaType?: string;
    nationality?: string;
  };
  userState: {
    currentStep?: string;
    selectedForm?: string;
    uploadedDocuments?: string[];
    generatedPhotos?: number;
    itineraryGenerated?: boolean;
  };
  recentActions: Array<{
    timestamp: Date;
    action: string;
    details?: Record<string, unknown>;
  }>;
}

export interface UnifiedVisaPackage {
  id: number;
  userId: string;

  // Shared metadata
  destinationCountry: string;
  visaType: string;
  status: 'in_progress' | 'ready' | 'submitted';

  // Service 1: Form Filler
  forms: Array<{
    id: string;
    name: string;
    originalUrl: string;
    filledUrl?: string;
    extractedFields: Record<string, unknown>;
    filledData: Record<string, unknown>;
    completeness: number;
  }>;

  // Service 2: Document Validator
  documents: Array<{
    id: string;
    type: string;
    url: string;
    validated: boolean;
    extractedData?: Record<string, unknown>;
  }>;
  requirements: Array<{
    item: string;
    completed: boolean;
    documentId?: string;
    mandatory?: boolean;
  }>;

  // Service 3: Photo Compliance
  visaPhotos: Array<{
    format: string;
    url: string;
    specifications: Record<string, unknown>;
  }>;

  // Service 4: Travel Planner
  itinerary?: {
    flights: unknown[];
    hotels: unknown[];
    activities: unknown[];
    insurance: unknown[];
  };

  // Overall progress
  overallCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProgress {
  formFiller: {
    total: number;
    completed: number;
    percentage: number;
  };
  documentValidator: {
    total: number;
    validated: number;
    percentage: number;
  };
  photoCompliance: {
    total: number;
    generated: number;
    percentage: number;
  };
  travelPlanner: {
    completed: boolean;
    percentage: number;
  };
}

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'form' | 'document' | 'photo' | 'travel' | 'chat';
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface JeffreyRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}
