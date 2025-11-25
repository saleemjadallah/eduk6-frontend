import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
}

/**
 * Extract text from an image using browser OCR or API
 * For MVP, we'll use a mock - in production, use Google Vision API or Tesseract.js
 */
export async function extractTextFromImage(file) {
    // Mock implementation - replace with actual OCR
    // Options: Google Vision API, Tesseract.js, or Gemini Vision
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`[Extracted text from image: ${file.name}]
            
This is placeholder text that would be extracted from the uploaded image using OCR technology.

In production, this would use:
- Google Cloud Vision API for accurate OCR
- Or Tesseract.js for client-side processing
- Or Gemini Pro Vision for AI-powered extraction

The extracted text would include all readable content from worksheets, textbook pages, or handwritten notes.`);
        }, 1000);
    });
}

/**
 * Validate file before processing
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
        throw new Error('File too large. Maximum size is 10MB.');
    }

    if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, image, or text files.');
    }

    return true;
}
