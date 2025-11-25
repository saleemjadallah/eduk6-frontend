import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Link, X, CheckCircle, AlertCircle } from 'lucide-react';

const YouTubeInput = ({ onVideoSelect, selectedVideo, onClear, disabled }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    // Extract video ID from various YouTube URL formats
    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    // Validate and fetch video info (mock for now)
    const validateVideo = async (videoId) => {
        setIsValidating(true);
        setError('');
        
        // Simulate API call - in production, call YouTube Data API or your backend
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock video data - replace with actual API call
        const mockVideoData = {
            id: videoId,
            title: 'Educational Video: ' + videoId.substring(0, 8),
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            duration: '5:32',
            channel: 'Learning Channel',
        };
        
        setIsValidating(false);
        return mockVideoData;
    };

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        setError('');
    };

    const handleSubmit = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            setError('Invalid YouTube URL. Please check and try again.');
            return;
        }

        try {
            const videoData = await validateVideo(videoId);
            onVideoSelect(videoData);
            setUrl('');
        } catch (err) {
            setError('Could not load video. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {selectedVideo ? (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-red-50 border-4 border-red-500 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-red-500 flex-shrink-0">
                                <img 
                                    src={selectedVideo.thumbnail} 
                                    alt={selectedVideo.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-red-800 truncate">
                                    {selectedVideo.title}
                                </p>
                                <p className="text-sm text-red-600">
                                    {selectedVideo.channel} • {selectedVideo.duration}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-red-500" />
                                <button
                                    onClick={onClear}
                                    className="p-2 hover:bg-red-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-red-700" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={handleUrlChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Paste YouTube link here..."
                                    disabled={disabled || isValidating}
                                    className={`
                                        w-full pl-12 pr-4 py-3 
                                        border-4 border-black rounded-xl
                                        font-medium
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow
                                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                                        ${error ? 'border-red-500' : ''}
                                    `}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={disabled || isValidating || !url.trim()}
                                className={`
                                    px-5 py-3 font-bold
                                    border-4 border-black rounded-xl
                                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-colors
                                    ${disabled || isValidating || !url.trim()
                                        ? 'bg-gray-200 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }
                                `}
                            >
                                {isValidating ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Link className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <Link className="w-5 h-5" />
                                )}
                            </motion.button>
                        </div>
                        
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 text-red-600 text-sm font-medium"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default YouTubeInput;
