import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Youtube, Camera, Sparkles } from 'lucide-react';
import FileDropzone from './FileDropzone';
import YouTubeInput from './YouTubeInput';
import ProcessingAnimation from './ProcessingAnimation';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonProcessor } from '../../hooks/useLessonProcessor';

const tabs = [
    { id: 'file', label: 'Upload File', icon: FileText },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'camera', label: 'Camera', icon: Camera },
];

const UploadModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('file');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [subject, setSubject] = useState('');

    const { isProcessing, processingStage, processingProgress } = useLessonContext();
    const { processFile, processYouTube } = useLessonProcessor();

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file);
        // Auto-fill title from filename
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setLessonTitle(nameWithoutExtension);
    }, []);

    const handleVideoSelect = useCallback((video) => {
        setSelectedVideo(video);
        setLessonTitle(video.title);
    }, []);

    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
        if (!selectedVideo) setLessonTitle('');
    }, [selectedVideo]);

    const handleClearVideo = useCallback(() => {
        setSelectedVideo(null);
        if (!selectedFile) setLessonTitle('');
    }, [selectedFile]);

    const handleSubmit = async () => {
        if (!lessonTitle.trim()) return;

        if (selectedFile) {
            await processFile(selectedFile, lessonTitle, subject);
        } else if (selectedVideo) {
            await processYouTube(selectedVideo, lessonTitle, subject);
        }

        // Reset and close on success
        if (!isProcessing) {
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setSelectedVideo(null);
        setLessonTitle('');
        setSubject('');
        setActiveTab('file');
    };

    const canSubmit = (selectedFile || selectedVideo) && lessonTitle.trim() && !isProcessing;

    // Backdrop click handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-nanobanana-yellow border-b-4 border-black p-4 flex items-center justify-between">
                            <h2 className="text-2xl font-black font-comic flex items-center gap-2">
                                <Sparkles className="w-6 h-6" />
                                Add New Lesson
                            </h2>
                            {!isProcessing && (
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {isProcessing ? (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <ProcessingAnimation 
                                            stage={processingStage} 
                                            progress={processingProgress} 
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Tabs */}
                                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`
                                                        flex-1 flex items-center justify-center gap-2 
                                                        px-4 py-2 rounded-lg font-bold text-sm
                                                        transition-all
                                                        ${activeTab === tab.id
                                                            ? 'bg-white shadow-md border-2 border-black'
                                                            : 'hover:bg-gray-200'
                                                        }
                                                    `}
                                                >
                                                    <tab.icon className="w-4 h-4" />
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content */}
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'file' && (
                                                <motion.div
                                                    key="file-tab"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                >
                                                    <FileDropzone
                                                        onFileSelect={handleFileSelect}
                                                        selectedFile={selectedFile}
                                                        onClear={handleClearFile}
                                                    />
                                                </motion.div>
                                            )}
                                            {activeTab === 'youtube' && (
                                                <motion.div
                                                    key="youtube-tab"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                >
                                                    <YouTubeInput
                                                        onVideoSelect={handleVideoSelect}
                                                        selectedVideo={selectedVideo}
                                                        onClear={handleClearVideo}
                                                    />
                                                </motion.div>
                                            )}
                                            {activeTab === 'camera' && (
                                                <motion.div
                                                    key="camera-tab"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="p-8 text-center bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300"
                                                >
                                                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                    <p className="font-bold text-gray-500">
                                                        Camera capture coming soon!
                                                    </p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Take photos of worksheets and textbook pages
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Lesson Details */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">
                                                    Lesson Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={lessonTitle}
                                                    onChange={(e) => setLessonTitle(e.target.value)}
                                                    placeholder="e.g., The Solar System"
                                                    className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold mb-2">
                                                    Subject
                                                </label>
                                                <select
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow bg-white"
                                                >
                                                    <option value="">Select a subject...</option>
                                                    <option value="math">🔢 Math</option>
                                                    <option value="science">🔬 Science</option>
                                                    <option value="english">📚 English</option>
                                                    <option value="arabic">🌙 Arabic</option>
                                                    <option value="islamic">☪️ Islamic Studies</option>
                                                    <option value="social">🌍 Social Studies</option>
                                                    <option value="other">📝 Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {!isProcessing && (
                            <div className="p-4 border-t-4 border-black bg-gray-50 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 font-bold border-4 border-black rounded-xl bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className={`
                                        flex-1 px-6 py-3 font-bold border-4 border-black rounded-xl
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        active:translate-y-[2px] active:shadow-none
                                        transition-all
                                        ${canSubmit
                                            ? 'bg-nanobanana-green text-white hover:bg-green-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    Start Learning! 🚀
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UploadModal;