/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Get video metadata (mock - replace with YouTube Data API)
 */
export async function getVideoMetadata(videoId) {
    // Mock implementation - in production, use YouTube Data API
    return {
        id: videoId,
        title: `Educational Video`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: '5:00',
        channel: 'Learning Channel',
    };
}

/**
 * Get video transcript (mock - replace with YouTube Transcript API or your backend)
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
 */
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
