import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/**
 * ImageContentView - Image viewer with zoom, pan, and rotate capabilities
 * Designed for viewing uploaded lesson images with child-friendly controls
 */
const ImageContentView = ({
  lesson,
  viewPreferences = {},
  onZoomChange,
}) => {
  const [scale, setScale] = useState(viewPreferences.zoom || 1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Get image URL from lesson
  const imageUrl = lesson.contentUrl ||
                   lesson.source?.url ||
                   lesson.fileUrl ||
                   lesson.imageUrl;

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.25, 3);
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const zoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 0.5);
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    onZoomChange?.(1);
  }, [onZoomChange]);

  // Rotation control
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Pan/drag handlers
  const handleMouseDown = useCallback((e) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    }
  }, [isDragging]);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => {
      const newScale = Math.max(0.5, Math.min(3, prev + delta));
      onZoomChange?.(newScale);
      return newScale;
    });
  }, [onZoomChange]);

  // Image load handlers
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Download image
  const handleDownload = useCallback(() => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = lesson.title || 'lesson-image';
      link.click();
    }
  }, [imageUrl, lesson.title]);

  // Error state
  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-700 mb-2 font-comic">
            Oops! Image couldn't load
          </h3>
          <p className="text-gray-500 mb-4">
            The image might be missing or broken.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-nanobanana-blue text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-gray-100"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b-4 border-black">
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <ToolbarButton
            onClick={zoomOut}
            disabled={scale <= 0.5}
            icon={<ZoomOut className="w-5 h-5" />}
            label="Zoom Out"
          />

          <div className="px-3 py-1 bg-gray-100 rounded-full font-bold text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </div>

          <ToolbarButton
            onClick={zoomIn}
            disabled={scale >= 3}
            icon={<ZoomIn className="w-5 h-5" />}
            label="Zoom In"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Rotate */}
          <ToolbarButton
            onClick={rotate}
            icon={<RotateCw className="w-5 h-5" />}
            label="Rotate"
          />

          {/* Fullscreen */}
          <ToolbarButton
            onClick={toggleFullscreen}
            icon={isFullscreen
              ? <Minimize2 className="w-5 h-5" />
              : <Maximize2 className="w-5 h-5" />
            }
            label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          />

          {/* Reset */}
          <button
            onClick={resetZoom}
            className="px-3 py-2 bg-nanobanana-yellow text-black font-bold text-sm rounded-xl border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
      >
        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-nanobanana-blue mx-auto mb-4" />
                <p className="text-gray-600 font-comic">Loading image...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The image */}
        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt={lesson.title || 'Lesson image'}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        )}
      </div>

      {/* Image info bar */}
      <div className="px-4 py-2 bg-white border-t-2 border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <span className="font-medium truncate max-w-[200px]">
          {lesson.fileMetadata?.originalFileName ||
           lesson.source?.originalName ||
           lesson.title ||
           'Image'}
        </span>

        {lesson.fileMetadata?.dimensions && (
          <span>
            {lesson.fileMetadata.dimensions.width} x {lesson.fileMetadata.dimensions.height}
          </span>
        )}

        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-nanobanana-blue hover:underline"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};

/**
 * Toolbar Button Component
 */
const ToolbarButton = ({ onClick, disabled, icon, label }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      p-2 rounded-xl border-2 border-black
      ${disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }
      transition-all
    `}
    title={label}
  >
    {icon}
  </motion.button>
);

export default ImageContentView;
