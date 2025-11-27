import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cache for generated images
const imageCache = new Map();

// Simple hash function for cache keys
const hashPrompt = (prompt, style) => {
  const str = `${prompt}-${style}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `ai-img-${Math.abs(hash)}`;
};

const AIGeneratedImage = ({
  prompt,
  style = 'playful',
  alt = 'AI Generated Image',
  className = '',
  fallbackSrc = null,
  onLoad = () => {},
  onError = () => {},
  showLoadingAnimation = true,
  aspectRatio = 'square', // 'square', 'landscape', 'portrait'
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  useEffect(() => {
    const cacheKey = hashPrompt(prompt, style);

    // Check memory cache first
    if (imageCache.has(cacheKey)) {
      setImageSrc(imageCache.get(cacheKey));
      setIsLoading(false);
      onLoad();
      return;
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { dataUrl, timestamp } = JSON.parse(cached);
        // Cache valid for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          imageCache.set(cacheKey, dataUrl);
          setImageSrc(dataUrl);
          setIsLoading(false);
          onLoad();
          return;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Generate new image
    const generateImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch(`${API_URL}/api/ai/generate-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            style,
            cacheKey,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const data = await response.json();

        if (data.success && data.data?.dataUrl) {
          const dataUrl = data.data.dataUrl;

          // Store in memory cache
          imageCache.set(cacheKey, dataUrl);

          // Store in localStorage (with error handling for quota)
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                dataUrl,
                timestamp: Date.now(),
              })
            );
          } catch (e) {
            // Clear old cached images if storage is full
            clearOldCachedImages();
          }

          setImageSrc(dataUrl);
          onLoad();
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        console.error('AI Image generation failed:', error);
        setHasError(true);
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [prompt, style]);

  // Clear old cached images from localStorage
  const clearOldCachedImages = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('ai-img-')) {
          keysToRemove.push(key);
        }
      }
      // Remove half of the cached images
      keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      // Ignore errors
    }
  };

  // Loading skeleton
  if (isLoading && showLoadingAnimation) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-100 rounded-3xl border-4 border-black ${aspectClasses[aspectRatio]} ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
          animate={{
            x: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 border-4 border-nanobanana-blue border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (hasError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={`rounded-3xl border-4 border-black object-cover ${aspectClasses[aspectRatio]} ${className}`}
        />
      );
    }

    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-nanobanana-yellow/20 to-nanobanana-blue/20 rounded-3xl border-4 border-black ${aspectClasses[aspectRatio]} ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-gray-500 text-sm font-medium">Image coming soon!</p>
        </div>
      </div>
    );
  }

  // Loaded image
  return (
    <motion.img
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      src={imageSrc}
      alt={alt}
      className={`rounded-3xl border-4 border-black object-cover ${aspectClasses[aspectRatio]} ${className}`}
    />
  );
};

export default AIGeneratedImage;
