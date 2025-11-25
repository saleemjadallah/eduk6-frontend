/**
 * Content type detection utilities for LessonView
 * Determines how to render lesson content based on available data
 */

// MIME type to content type mapping
const MIME_TYPE_MAP = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/html': 'text',
};

// File extension to content type mapping
const EXTENSION_MAP = {
  '.pdf': 'pdf',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.webp': 'image',
  '.gif': 'image',
  '.txt': 'text',
  '.md': 'text',
  '.html': 'text',
};

/**
 * Detect content type from a lesson object
 * @param {Object} lesson - The lesson object
 * @returns {'pdf' | 'image' | 'text' | 'youtube' | 'unknown'}
 */
export function detectContentType(lesson) {
  if (!lesson) return 'unknown';

  // 1. Check explicit contentType field
  if (lesson.contentType) {
    return lesson.contentType;
  }

  // 2. Check sourceType (from upload)
  if (lesson.sourceType) {
    return lesson.sourceType;
  }

  // 3. Check source object
  if (lesson.source?.type) {
    return lesson.source.type;
  }

  // 4. Check MIME type from file metadata
  if (lesson.fileMetadata?.mimeType) {
    const contentType = MIME_TYPE_MAP[lesson.fileMetadata.mimeType];
    if (contentType) return contentType;
  }

  if (lesson.source?.mimeType) {
    const contentType = MIME_TYPE_MAP[lesson.source.mimeType];
    if (contentType) return contentType;
  }

  // 5. Check file name extension
  const fileName = lesson.fileMetadata?.originalFileName ||
                   lesson.source?.originalName ||
                   lesson.contentUrl;

  if (fileName) {
    const ext = getFileExtension(fileName);
    if (ext && EXTENSION_MAP[ext]) {
      return EXTENSION_MAP[ext];
    }
  }

  // 6. Check for YouTube indicators
  if (lesson.sourceVideo?.videoId ||
      lesson.youtubeUrl ||
      (lesson.contentUrl && isYouTubeUrl(lesson.contentUrl))) {
    return 'youtube';
  }

  // 7. Check contentUrl pattern
  if (lesson.contentUrl) {
    if (lesson.contentUrl.endsWith('.pdf')) return 'pdf';
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(lesson.contentUrl)) return 'image';
  }

  // 8. Check if there's a blob URL with content data
  if (lesson.contentUrl?.startsWith('blob:')) {
    // Try to infer from any available metadata
    if (lesson.rawText && !lesson.contentUrl) {
      return 'text';
    }
  }

  // 9. Default to text if we have rawText or content
  if (lesson.rawText || lesson.content?.rawText) {
    return 'text';
  }

  return 'unknown';
}

/**
 * Get file extension from a filename or URL
 * @param {string} filename - File name or URL
 * @returns {string|null} - Extension with dot (e.g., '.pdf')
 */
export function getFileExtension(filename) {
  if (!filename) return null;

  // Handle URLs - remove query params
  const cleanPath = filename.split('?')[0];

  const lastDot = cleanPath.lastIndexOf('.');
  if (lastDot === -1) return null;

  return cleanPath.substring(lastDot).toLowerCase();
}

/**
 * Check if a URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  if (!url) return false;

  const youtubePatterns = [
    /youtube\.com\/watch/i,
    /youtube\.com\/embed/i,
    /youtu\.be\//i,
    /youtube\.com\/v\//i,
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Get content type display info (for UI)
 * @param {string} contentType - The content type
 * @returns {Object} - Display info with icon, label, color
 */
export function getContentTypeDisplayInfo(contentType) {
  const displayInfo = {
    pdf: {
      icon: 'FileText',
      label: 'PDF Document',
      emoji: '📄',
      color: '#EF4444',
    },
    image: {
      icon: 'Image',
      label: 'Image',
      emoji: '🖼️',
      color: '#8B5CF6',
    },
    text: {
      icon: 'FileText',
      label: 'Text Content',
      emoji: '📝',
      color: '#3B82F6',
    },
    youtube: {
      icon: 'Youtube',
      label: 'YouTube Video',
      emoji: '🎥',
      color: '#EF4444',
    },
    unknown: {
      icon: 'FileQuestion',
      label: 'Unknown',
      emoji: '❓',
      color: '#6B7280',
    },
  };

  return displayInfo[contentType] || displayInfo.unknown;
}

/**
 * Check if content type supports text selection
 * @param {string} contentType - The content type
 * @returns {boolean}
 */
export function supportsTextSelection(contentType) {
  return ['pdf', 'text'].includes(contentType);
}

/**
 * Check if content type supports highlighting
 * @param {string} contentType - The content type
 * @returns {boolean}
 */
export function supportsHighlighting(contentType) {
  return ['pdf', 'text'].includes(contentType);
}

/**
 * Check if content type supports zoom/pan
 * @param {string} contentType - The content type
 * @returns {boolean}
 */
export function supportsZoomPan(contentType) {
  return ['pdf', 'image'].includes(contentType);
}

export default {
  detectContentType,
  getFileExtension,
  isYouTubeUrl,
  getContentTypeDisplayInfo,
  supportsTextSelection,
  supportsHighlighting,
  supportsZoomPan,
};
