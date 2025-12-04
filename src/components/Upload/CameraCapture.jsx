import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { Capacitor } from '@capacitor/core';
import DocumentCameraView from './DocumentCameraView';

/**
 * CameraCapture component for capturing lesson photos
 * Works on native iOS/Android with camera, falls back to file input on web
 */
const CameraCapture = ({ onImageCapture, capturedImage, onClear }) => {
    const { pickFromGallery, isCapturing, error, clearError, isNative } = useCamera();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showDocumentCamera, setShowDocumentCamera] = useState(false);
    const fileInputRef = useRef(null);

    // Open document camera view (native)
    const handleCameraCapture = useCallback(() => {
        clearError();
        setShowDocumentCamera(true);
    }, [clearError]);

    // Handle capture from document camera view
    const handleDocumentCapture = useCallback((result) => {
        setShowDocumentCamera(false);
        if (result) {
            const url = `data:image/${result.format};base64,${result.base64}`;
            setPreviewUrl(url);
            onImageCapture(result.file, url);
        }
    }, [onImageCapture]);

    // Close document camera view
    const handleCloseDocumentCamera = useCallback(() => {
        setShowDocumentCamera(false);
    }, []);

    // Handle gallery selection (native)
    const handleGallerySelect = useCallback(async () => {
        clearError();
        try {
            const result = await pickFromGallery();
            if (result) {
                const url = `data:image/${result.format};base64,${result.base64}`;
                setPreviewUrl(url);
                onImageCapture(result.file, url);
            }
        } catch (err) {
            console.error('Gallery selection failed:', err);
        }
    }, [pickFromGallery, onImageCapture, clearError]);

    // Handle file input change (web fallback)
    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result);
                onImageCapture(file, reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, [onImageCapture]);

    // Handle clear/retake
    const handleClear = useCallback(() => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClear();
    }, [onClear]);

    // Show preview if image is captured
    if (capturedImage || previewUrl) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl border-4 border-black overflow-hidden bg-gray-100"
            >
                <img
                    src={previewUrl || capturedImage}
                    alt="Captured lesson"
                    className="w-full h-48 object-contain bg-gray-900"
                />

                {/* Overlay controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="font-bold text-sm">Photo captured!</span>
                        </div>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-bold transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Retake
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Show capture options
    return (
        <div className="space-y-4">
            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Native camera UI */}
            {isNative ? (
                <div className="grid grid-cols-2 gap-3">
                    {/* Take Photo Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCameraCapture}
                        disabled={isCapturing}
                        className="flex flex-col items-center justify-center p-6 bg-nanobanana-blue text-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                    >
                        {isCapturing ? (
                            <Loader2 className="w-10 h-10 mb-2 animate-spin" />
                        ) : (
                            <Camera className="w-10 h-10 mb-2" />
                        )}
                        <span className="font-bold">Take Photo</span>
                        <span className="text-xs opacity-80 mt-1">Use camera</span>
                    </motion.button>

                    {/* Choose from Gallery Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGallerySelect}
                        disabled={isCapturing}
                        className="flex flex-col items-center justify-center p-6 bg-nanobanana-green text-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                    >
                        {isCapturing ? (
                            <Loader2 className="w-10 h-10 mb-2 animate-spin" />
                        ) : (
                            <ImagePlus className="w-10 h-10 mb-2" />
                        )}
                        <span className="font-bold">Photo Library</span>
                        <span className="text-xs opacity-80 mt-1">Choose existing</span>
                    </motion.button>
                </div>
            ) : (
                /* Web fallback - file input styled as dropzone */
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-4 border-dashed border-gray-300 hover:border-nanobanana-blue cursor-pointer transition-colors text-center"
                >
                    <Camera className="w-12 h-12 mx-auto mb-4 text-nanobanana-blue" />
                    <p className="font-bold text-gray-700">
                        Click to take or select a photo
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Capture worksheets, textbook pages, or notes
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            )}

            {/* Tips */}
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <p className="font-bold text-yellow-800 text-sm mb-2">Tips for best results:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Make sure text is clear and readable</li>
                    <li>• Good lighting helps Jeffrey read better</li>
                    <li>• Hold the camera steady to avoid blur</li>
                    <li>• Include the full page in the frame</li>
                </ul>
            </div>

            {/* Document Camera View (full-screen with guides) */}
            <DocumentCameraView
                isOpen={showDocumentCamera}
                onCapture={handleDocumentCapture}
                onClose={handleCloseDocumentCamera}
            />
        </div>
    );
};

export default CameraCapture;
