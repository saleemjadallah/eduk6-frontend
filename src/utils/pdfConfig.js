import { pdfjs } from 'react-pdf';

// Configure PDF.js worker - use local worker from node_modules
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Configure text layer options
export const PDF_TEXT_LAYER_OPTIONS = {
    renderTextLayer: true,
    renderAnnotationLayer: false,
};

// Configure rendering options
export const PDF_RENDER_OPTIONS = {
    intent: 'display',
    renderInteractiveForms: false,
};

// Default zoom levels
export const ZOOM_LEVELS = {
    MIN: 0.5,
    MAX: 3.0,
    DEFAULT: 1.0,
    STEP: 0.25,
};

// Page navigation options
export const PAGE_OPTIONS = {
    DEFAULT_PAGE: 1,
    SCROLL_BEHAVIOR: 'smooth',
};
