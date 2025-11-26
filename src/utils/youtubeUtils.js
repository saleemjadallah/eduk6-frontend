import { YOUTUBE_PATTERNS, ERROR_MESSAGES } from '../constants/uploadConstants';

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL or video ID
 * @returns {string|null} Video ID or null if invalid
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmedUrl = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Alias for backward compatibility
export const extractVideoId = extractYouTubeId;

/**
 * Validate a YouTube URL
 * @param {string} url - URL to validate
 * @returns {{ valid: boolean, videoId?: string, error?: string }}
 */
export function validateYouTubeUrl(url) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_YOUTUBE,
    };
  }

  return {
    valid: true,
    videoId,
  };
}

/**
 * Get YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
 * @returns {string} Thumbnail URL
 */
export function getYouTubeThumbnail(videoId, quality = 'medium') {
  const qualities = {
    default: 'default',      // 120x90
    medium: 'mqdefault',     // 320x180
    high: 'hqdefault',       // 480x360
    maxres: 'maxresdefault', // 1280x720
  };

  const qualityKey = qualities[quality] || qualities.medium;
  return `https://img.youtube.com/vi/${videoId}/${qualityKey}.jpg`;
}

/**
 * Get YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} Embed URL
 */
export function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get YouTube watch URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} Watch URL
 */
export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Parse YouTube URL and return full metadata
 * @param {string} url - YouTube URL
 * @returns {Object|null} Video metadata or null
 */
export function parseYouTubeUrl(url) {
  const validation = validateYouTubeUrl(url);

  if (!validation.valid) {
    return null;
  }

  const { videoId } = validation;

  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnail(videoId, 'high'),
    embedUrl: getYouTubeEmbedUrl(videoId),
    watchUrl: getYouTubeWatchUrl(videoId),
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get video metadata from backend API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video metadata
 */
export async function getVideoMetadata(videoId) {
  const token = localStorage.getItem('auth_token');

  try {
    const response = await fetch(`${API_BASE_URL}/api/youtube/metadata/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      // If backend doesn't have YouTube API, fallback to basic info
      return {
        id: videoId,
        title: 'YouTube Video',
        thumbnail: getYouTubeThumbnail(videoId, 'high'),
        duration: null,
        channel: null,
      };
    }

    const data = await response.json();
    return {
      id: videoId,
      title: data.data?.title || 'YouTube Video',
      thumbnail: data.data?.thumbnail || getYouTubeThumbnail(videoId, 'high'),
      duration: data.data?.duration || null,
      channel: data.data?.channel || null,
    };
  } catch (error) {
    console.error('Failed to fetch video metadata:', error);
    // Fallback to basic info from thumbnail
    return {
      id: videoId,
      title: 'YouTube Video',
      thumbnail: getYouTubeThumbnail(videoId, 'high'),
      duration: null,
      channel: null,
    };
  }
}

/**
 * Get video transcript from backend API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} Video transcript
 */
export async function getYouTubeTranscript(videoId) {
  const token = localStorage.getItem('auth_token');

  try {
    const response = await fetch(`${API_BASE_URL}/api/youtube/transcript/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transcript');
    }

    const data = await response.json();
    return data.data?.transcript || '';
  } catch (error) {
    console.error('Failed to fetch video transcript:', error);
    throw new Error('Could not load video transcript. The video may not have captions available.');
  }
}

/**
 * Format duration from seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
