import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/profile`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================================
// PROFILE TYPES
// ===================================

export interface UserProfile {
  id?: string;
  userId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  currentAddress: {
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    fromDate: string;
    toDate?: string;
  };
  previousAddresses?: {
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    fromDate: string;
    toDate: string;
  }[];
  nationality: string;
  dualNationality?: string;
  countryOfBirth: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };
}

export interface PassportProfile {
  id?: string;
  userId?: string;
  profileId?: string;
  passportNumber: string;
  passportType: string;
  issuingCountry: string;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  placeOfIssue: string;
  previousPassports?: {
    number: string;
    issuedDate: string;
    expiryDate: string;
    issuingCountry: string;
  }[];
  hasBiometric?: boolean;
  biometricNumber?: string;
  isActive?: boolean;
}

export interface EmploymentProfile {
  id?: string;
  userId?: string;
  profileId?: string;
  isCurrent: boolean;
  employerName: string;
  jobTitle: string;
  department?: string;
  startDate: string;
  endDate?: string;
  employerAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  employerPhone?: string;
  employerEmail?: string;
  employerWebsite?: string;
  employmentType?: string;
  monthlySalary?: string;
  currency?: string;
  responsibilities?: string;
  supervisorName?: string;
  supervisorTitle?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
}

export interface EducationProfile {
  id?: string;
  userId?: string;
  profileId?: string;
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  graduationDate?: string;
  institutionAddress: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  institutionWebsite?: string;
  studentId?: string;
  gpa?: string;
  gradeSystem?: string;
  majorSubjects?: string[];
  achievements?: string;
}

export interface FamilyProfile {
  id?: string;
  userId?: string;
  primaryProfileId?: string;
  relationship: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  gender?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssuingCountry?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  employer?: string;
  isMinor?: boolean;
  schoolName?: string;
  grade?: string;
  hasSeparateAddress?: boolean;
  address?: {
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
}

export interface TravelHistoryRecord {
  id?: string;
  userId?: string;
  profileId?: string;
  country: string;
  purpose: string;
  entryDate: string;
  exitDate: string;
  visaType?: string;
  visaNumber?: string;
  visaIssuedDate?: string;
  visaIssuedBy?: string;
  accommodation?: string;
  sponsorName?: string;
  entryPort?: string;
  exitPort?: string;
  hadIssues?: boolean;
  issueDescription?: string;
}

export interface CompleteProfile {
  profile: UserProfile | null;
  passports: PassportProfile[];
  employment: EmploymentProfile[];
  education: EducationProfile[];
  family: FamilyProfile[];
  travelHistory: TravelHistoryRecord[];
}

export interface AutoFillResponse {
  autoFillData: Record<string, {
    value: string;
    source: string;
    confidence: number;
  }>;
  validationErrors: {
    field: string;
    error: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  completionRate: number;
}

export interface FilledForm {
  id?: string;
  userId?: string;
  formTemplateId?: number;
  country: string;
  visaType: string;
  formName: string;
  filledData: Record<string, {
    value: string;
    source: 'profile' | 'manual' | 'suggested';
    filledAt: string;
    validationStatus: 'valid' | 'warning' | 'error';
    validationMessage?: string;
  }>;
  totalFields: number;
  filledFields: number;
  validFields: number;
  completionPercentage: number;
  originalPdfUrl?: string;
  filledPdfUrl?: string;
  validationErrors?: {
    fieldId: string;
    error: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  status: 'draft' | 'completed' | 'submitted';
  submittedAt?: string;
  applicationNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===================================
// API FUNCTIONS
// ===================================

export const profileApi = {
  // Get complete profile
  getProfile: async (): Promise<{ success: boolean; data?: CompleteProfile; error?: string }> => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: 'Failed to fetch profile' };
    }
  },

  // Save or update main profile
  saveProfile: async (profile: UserProfile): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    try {
      const response = await api.post('/profile', profile);
      return response.data;
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: 'Failed to save profile' };
    }
  },

  // Save passport information
  savePassport: async (passport: PassportProfile): Promise<{ success: boolean; data?: PassportProfile; error?: string }> => {
    try {
      const response = await api.post('/passport', passport);
      return response.data;
    } catch (error) {
      console.error('Error saving passport:', error);
      return { success: false, error: 'Failed to save passport' };
    }
  },

  // Save employment record
  saveEmployment: async (employment: EmploymentProfile): Promise<{ success: boolean; data?: EmploymentProfile; error?: string }> => {
    try {
      const response = await api.post('/employment', employment);
      return response.data;
    } catch (error) {
      console.error('Error saving employment:', error);
      return { success: false, error: 'Failed to save employment' };
    }
  },

  // Save education record
  saveEducation: async (education: EducationProfile): Promise<{ success: boolean; data?: EducationProfile; error?: string }> => {
    try {
      const response = await api.post('/education', education);
      return response.data;
    } catch (error) {
      console.error('Error saving education:', error);
      return { success: false, error: 'Failed to save education' };
    }
  },

  // Add family member
  addFamilyMember: async (family: FamilyProfile): Promise<{ success: boolean; data?: FamilyProfile; error?: string }> => {
    try {
      const response = await api.post('/family', family);
      return response.data;
    } catch (error) {
      console.error('Error adding family member:', error);
      return { success: false, error: 'Failed to add family member' };
    }
  },

  // Add travel record
  addTravelRecord: async (travel: TravelHistoryRecord): Promise<{ success: boolean; data?: TravelHistoryRecord; error?: string }> => {
    try {
      const response = await api.post('/travel', travel);
      return response.data;
    } catch (error) {
      console.error('Error adding travel record:', error);
      return { success: false, error: 'Failed to add travel record' };
    }
  },

  // Get auto-fill suggestions for a form
  getAutoFillData: async (params: {
    country: string;
    visaType: string;
    fields: { id: string; name: string; label: string }[];
  }): Promise<{ success: boolean; data?: AutoFillResponse; error?: string }> => {
    try {
      const response = await api.post('/autofill', params);
      return response.data;
    } catch (error) {
      console.error('Error getting autofill data:', error);
      return { success: false, error: 'Failed to get autofill data' };
    }
  },

  // Save filled form
  saveFilledForm: async (form: FilledForm): Promise<{ success: boolean; data?: FilledForm; error?: string }> => {
    try {
      const response = await api.post('/forms/save', form);
      return response.data;
    } catch (error) {
      console.error('Error saving form:', error);
      return { success: false, error: 'Failed to save form' };
    }
  },

  // Get form history
  getFormHistory: async (): Promise<{ success: boolean; data?: FilledForm[]; error?: string }> => {
    try {
      const response = await api.get('/forms/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching form history:', error);
      return { success: false, error: 'Failed to fetch form history' };
    }
  },
};