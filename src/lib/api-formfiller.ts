/**
 * API client for AI Form Filler feature
 */

import axios from 'axios';
import type {
  FormFillerUploadResponse,
  FormFillerMapResponse,
  FormFillerFillResponse,
  FormFillerValidateResponse,
  FormFillerHistoryResponse,
  ExtractedField,
  FieldPopulation,
} from '../types/formfiller';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extract form fields from uploaded PDF
 */
export async function extractFormFields(pdfFile: File): Promise<FormFillerUploadResponse> {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const response = await api.post<FormFillerUploadResponse>(
    '/api/form-filler/extract',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Map extracted fields to user profile data
 */
export async function mapFieldsToProfile(
  extractedFields: ExtractedField[],
  profileId?: string
): Promise<FormFillerMapResponse> {
  const response = await api.post<FormFillerMapResponse>('/api/form-filler/map', {
    extractedFields,
    profileId,
  });

  return response.data;
}

/**
 * Fill PDF form with user data
 */
export async function fillPDFForm(
  pdfFile: File,
  fieldPopulations: FieldPopulation[],
  destinationCountry?: string,
  flatten: boolean = true
): Promise<FormFillerFillResponse> {
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('fieldPopulations', JSON.stringify(fieldPopulations));

  if (destinationCountry) {
    formData.append('destinationCountry', destinationCountry);
  }

  formData.append('flatten', flatten.toString());

  const response = await api.post<FormFillerFillResponse>(
    '/api/form-filler/fill',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Validate form data with 3-tier validation
 */
export async function validateFormData(
  formId: string,
  formData: any,
  extractedFields: ExtractedField[],
  destinationCountry?: string,
  travelDate?: string
): Promise<FormFillerValidateResponse> {
  const response = await api.post<FormFillerValidateResponse>(
    `/api/form-filler/${formId}/validate`,
    {
      formData,
      extractedFields,
      destinationCountry,
      travelDate,
    }
  );

  return response.data;
}

/**
 * Get filled form details
 */
export async function getFilledForm(formId: string) {
  const response = await api.get(`/api/form-filler/${formId}`);
  return response.data;
}

/**
 * Get download URL for filled PDF
 */
export async function getDownloadUrl(formId: string): Promise<{ downloadUrl: string; expiresIn: number }> {
  const response = await api.get(`/api/form-filler/${formId}/download`);
  return response.data.data;
}

/**
 * Get user's form filling history
 */
export async function getFormHistory(
  limit: number = 20,
  offset: number = 0
): Promise<FormFillerHistoryResponse> {
  const response = await api.get<FormFillerHistoryResponse>('/api/form-filler/history', {
    params: { limit, offset },
  });

  return response.data;
}

/**
 * Update specific fields in a filled form
 */
export async function updateFormFields(
  formId: string,
  fieldUpdates: Array<{ fieldId: string; value: string }>
) {
  const response = await api.put(`/api/form-filler/${formId}/fields`, {
    fieldUpdates,
  });

  return response.data;
}

/**
 * Extract field names from PDF (for debugging)
 */
export async function extractPDFFieldNames(pdfFile: File) {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const response = await api.post('/api/form-filler/pdf/fields', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Download filled PDF
 */
export async function downloadFilledPDF(formId: string, filename: string = 'filled-form.pdf') {
  try {
    const { downloadUrl } = await getDownloadUrl(formId);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
