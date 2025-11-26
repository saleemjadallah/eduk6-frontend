import * as pdfjsLib from 'pdfjs-dist';
import { ERROR_MESSAGES } from '../constants/uploadConstants';

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{ text: string, pageCount: number, metadata: Object }>}
 */
export async function extractTextFromPDF(file, onProgress = () => {}) {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 30);
        onProgress(percent); // First 30% is loading
      }
    };

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (pageText) {
        textParts.push(`[Page ${pageNum}]\n${pageText}`);
      }

      // Update progress (30-100%)
      const progressPercent = 30 + Math.round((pageNum / numPages) * 70);
      onProgress(progressPercent);
    }

    // Get metadata
    const metadata = await pdf.getMetadata().catch(() => ({}));

    return {
      text: textParts.join('\n\n'),
      pageCount: numPages,
      metadata: {
        title: metadata?.info?.Title || '',
        author: metadata?.info?.Author || '',
        subject: metadata?.info?.Subject || '',
        creator: metadata?.info?.Creator || '',
        sourceType: 'pdf',
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(ERROR_MESSAGES.PROCESSING_FAILED);
  }
}

/**
 * Extract text from a plain text file
 * @param {File} file - Text file object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ text: string, metadata: Object }>}
 */
export async function extractTextFromTextFile(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = (event) => {
      onProgress(100);
      resolve({
        text: event.target.result,
        metadata: {
          sourceType: 'text',
        },
      });
    };

    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
    };

    reader.readAsText(file);
  });
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Extract text from an image using backend OCR service (Gemini Vision)
 * @param {File} file - Image file object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ text: string, metadata: Object }>}
 */
export async function extractTextFromImage(file, onProgress = () => {}) {
  const token = localStorage.getItem('auth_token');

  onProgress(10);

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    onProgress(30);

    // Send to backend for OCR processing
    const response = await fetch(`${API_BASE_URL}/api/ocr/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        image: base64,
        filename: file.name,
        mimeType: file.type,
      }),
    });

    onProgress(80);

    if (!response.ok) {
      throw new Error('OCR extraction failed');
    }

    const data = await response.json();
    onProgress(100);

    return {
      text: data.data?.text || '',
      metadata: {
        sourceType: 'image',
        requiresOCR: true,
        originalName: file.name,
        confidence: data.data?.confidence,
      },
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    onProgress(100);
    throw new Error('Failed to extract text from image. Please try again.');
  }
}

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Main extraction function - routes to appropriate extractor
 * @param {File} file - File to extract text from
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ text: string, metadata: Object }>}
 */
export async function extractText(file, onProgress = () => {}) {
  const { type, name } = file;

  // PDF files
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const result = await extractTextFromPDF(file, onProgress);
    return {
      text: result.text,
      metadata: {
        ...result.metadata,
        pageCount: result.pageCount,
        sourceType: 'pdf',
      },
    };
  }

  // Plain text files
  if (type === 'text/plain' || name.endsWith('.txt')) {
    return await extractTextFromTextFile(file, onProgress);
  }

  // Images
  if (type.startsWith('image/')) {
    return await extractTextFromImage(file, onProgress);
  }

  throw new Error(ERROR_MESSAGES.INVALID_TYPE);
}

/**
 * Validate file before processing
 * @param {File} file - File to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export function validateFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'text/plain',
  ];

  if (file.size > maxSize) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(ERROR_MESSAGES.INVALID_TYPE);
  }

  return true;
}

/**
 * Get file type category
 * @param {File} file - File object
 * @returns {string} File type category
 */
export function getFileTypeCategory(file) {
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'text/plain') return 'text';
  return 'unknown';
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
