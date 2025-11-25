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

/**
 * Get video metadata (mock - replace with YouTube Data API)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video metadata
 */
export async function getVideoMetadata(videoId) {
  // Mock implementation - in production, use YouTube Data API
  return {
    id: videoId,
    title: `Educational Video`,
    thumbnail: getYouTubeThumbnail(videoId, 'high'),
    duration: '5:00',
    channel: 'Learning Channel',
  };
}

/**
 * Get video transcript (mock - replace with YouTube Transcript API or your backend)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} Video transcript
 */
export async function getYouTubeTranscript(videoId) {
  // Mock implementation
  // In production, use:
  // - youtube-transcript npm package
  // - Your backend with yt-dlp
  // - Third-party API like youtubetranscript.com

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[Transcript for video: ${videoId}]

Welcome to today's lesson! We're going to learn about something really exciting.

First, let's start with the basics. This topic is important because it helps us understand the world around us.

Here are some key points to remember:
1. The first important concept is foundational to everything else.
2. Building on that, we can explore more complex ideas.
3. Finally, we'll see how this applies to real life.

Let's dive deeper into each of these points...

[This is mock transcript content. In production, this would be the actual video transcript extracted via API.]`);
    }, 1500);
  });
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
