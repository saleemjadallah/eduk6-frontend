import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Loader2 } from 'lucide-react';
import { detectContentType } from '../../utils/contentDetection';

// Lazy load content viewers for code splitting
const PDFContentView = lazy(() => import('./PDF/PDFContentView'));
const ImageContentView = lazy(() => import('./Image/ImageContentView'));
const TextContentView = lazy(() => import('./Text/TextContentView'));

/**
 * ContentRenderer - Smart component that detects content type
 * and renders the appropriate viewer
 */
const ContentRenderer = ({
  lesson,
  viewPreferences,
  onZoomChange,
  onPageChange,
  onSelectionAction,
}) => {
  const contentType = detectContentType(lesson);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <Loader2 className="w-12 h-12 text-nanobanana-blue" />
      </motion.div>
      <p className="text-gray-600 font-comic text-lg">Loading content...</p>
    </div>
  );

  // Render appropriate content viewer based on type
  const renderContent = () => {
    switch (contentType) {
      case 'pdf':
        return (
          <PDFContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
            onZoomChange={onZoomChange}
            onPageChange={onPageChange}
            onSelectionAction={onSelectionAction}
          />
        );

      case 'image':
        return (
          <ImageContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
            onZoomChange={onZoomChange}
          />
        );

      case 'text':
        return (
          <TextContentView
            lesson={lesson}
            viewPreferences={viewPreferences}
            onSelectionAction={onSelectionAction}
          />
        );

      case 'youtube':
        return (
          <YouTubeContentView
            lesson={lesson}
          />
        );

      default:
        return (
          <UnsupportedContentView
            contentType={contentType}
            lesson={lesson}
          />
        );
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="flex-1 h-full overflow-hidden">
        {renderContent()}
      </div>
    </Suspense>
  );
};

/**
 * YouTube Content View (Placeholder for now)
 */
const YouTubeContentView = ({ lesson }) => {
  const videoId = lesson.sourceVideo?.videoId;
  const thumbnail = lesson.sourceVideo?.thumbnail;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center max-w-md">
        {thumbnail && (
          <div className="relative mb-6 rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg cursor-pointer"
                onClick={() => {
                  if (videoId) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                  }
                }}
              >
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
          </div>
        )}
        <h3 className="text-2xl font-bold font-comic mb-2">
          {lesson.sourceVideo?.title || 'YouTube Video'}
        </h3>
        <p className="text-gray-600 mb-4">
          Click the play button to watch on YouTube
        </p>
        <p className="text-sm text-gray-500">
          Read the lesson summary below while you study!
        </p>
      </div>
    </div>
  );
};

/**
 * Unsupported Content View
 */
const UnsupportedContentView = ({ contentType }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-20 h-20 bg-gray-100 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-4"
      >
        <FileQuestion className="w-10 h-10 text-gray-400" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-600 font-comic mb-2">
        Unsupported Content Type
      </h3>
      <p className="text-gray-500">
        We're working on supporting more file types!
      </p>
      {contentType && (
        <p className="text-sm text-gray-400 mt-2">
          Type: {contentType}
        </p>
      )}
    </div>
  </div>
);

export default ContentRenderer;
