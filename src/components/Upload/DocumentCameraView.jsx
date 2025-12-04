import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Zap, ZapOff, SwitchCamera, Check } from 'lucide-react';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';

/**
 * DocumentCameraView - Full-screen camera with document frame guides
 * Uses @capacitor-community/camera-preview for custom overlay support
 */
const DocumentCameraView = ({ isOpen, onCapture, onClose }) => {
    const [isStarted, setIsStarted] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [flashMode, setFlashMode] = useState('off');
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [cameraPosition, setCameraPosition] = useState('rear');
    const containerRef = useRef(null);

    const isNative = Capacitor.isNativePlatform();

    // Start camera when component opens
    useEffect(() => {
        if (isOpen && isNative) {
            startCamera();
        }

        return () => {
            if (isStarted) {
                stopCamera();
            }
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            setError(null);

            await CameraPreview.start({
                position: cameraPosition,
                toBack: true, // Put camera behind the webview
                parent: 'camera-preview-container',
                className: 'camera-preview',
                disableAudio: true,
                enableZoom: true,
                width: window.innerWidth,
                height: window.innerHeight,
                x: 0,
                y: 0,
            });

            setIsStarted(true);
        } catch (err) {
            console.error('Failed to start camera:', err);
            setError(err.message || 'Failed to start camera');
        }
    };

    const stopCamera = async () => {
        try {
            await CameraPreview.stop();
            setIsStarted(false);
        } catch (err) {
            console.error('Failed to stop camera:', err);
        }
    };

    const handleCapture = async () => {
        if (isCapturing) return;

        setIsCapturing(true);
        try {
            const result = await CameraPreview.capture({
                quality: 90,
            });

            if (result.value) {
                const base64 = result.value;
                setCapturedImage(base64);
            }
        } catch (err) {
            console.error('Capture failed:', err);
            setError(err.message || 'Failed to capture photo');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleConfirm = useCallback(() => {
        if (capturedImage) {
            // Convert base64 to File
            const file = base64ToFile(capturedImage, `document_${Date.now()}.jpg`);
            onCapture({
                file,
                base64: capturedImage,
                format: 'jpeg',
            });
            stopCamera();
        }
    }, [capturedImage, onCapture]);

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleClose = () => {
        stopCamera();
        setCapturedImage(null);
        onClose();
    };

    const toggleFlash = async () => {
        const modes = ['off', 'on', 'auto'];
        const currentIndex = modes.indexOf(flashMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];

        try {
            await CameraPreview.setFlashMode({ flashMode: nextMode });
            setFlashMode(nextMode);
        } catch (err) {
            console.error('Failed to set flash mode:', err);
        }
    };

    const flipCamera = async () => {
        try {
            await CameraPreview.flip();
            setCameraPosition(prev => prev === 'rear' ? 'front' : 'rear');
        } catch (err) {
            console.error('Failed to flip camera:', err);
        }
    };

    if (!isOpen) return null;

    // Web fallback - use file input
    if (!isNative) {
        return (
            <WebCameraFallback
                onCapture={onCapture}
                onClose={onClose}
            />
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black"
                ref={containerRef}
            >
                {/* Camera Preview Container - this is where native camera renders */}
                <div
                    id="camera-preview-container"
                    className="absolute inset-0"
                    style={{ backgroundColor: 'transparent' }}
                />

                {/* Overlay Layer */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Document Frame Guide */}
                    {!capturedImage && (
                        <DocumentFrameGuide />
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black"
                        >
                            <img
                                src={`data:image/jpeg;base64,${capturedImage}`}
                                alt="Captured document"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    )}
                </div>

                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
                    <div className="flex items-center justify-between">
                        {/* Close Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClose}
                            className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.button>

                        {/* Flash & Flip Controls */}
                        {!capturedImage && (
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleFlash}
                                    className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                                >
                                    {flashMode === 'off' ? (
                                        <ZapOff className="w-5 h-5 text-white" />
                                    ) : (
                                        <Zap className={`w-5 h-5 ${flashMode === 'auto' ? 'text-yellow-400' : 'text-yellow-300'}`} />
                                    )}
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={flipCamera}
                                    className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                                >
                                    <SwitchCamera className="w-5 h-5 text-white" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instruction Text */}
                {!capturedImage && (
                    <div className="absolute top-20 left-0 right-0 text-center pointer-events-none">
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white text-lg font-bold drop-shadow-lg"
                        >
                            Align document within the frame
                        </motion.p>
                        <p className="text-white/70 text-sm mt-1">
                            Keep steady for best results
                        </p>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 pointer-events-auto">
                    {capturedImage ? (
                        /* Confirm/Retake Controls */
                        <div className="flex items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRetake}
                                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Retake
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleConfirm}
                                className="flex items-center gap-2 px-8 py-4 bg-nanobanana-green rounded-full text-white font-bold border-4 border-white shadow-lg"
                            >
                                <Check className="w-6 h-6" />
                                Use Photo
                            </motion.button>
                        </div>
                    ) : (
                        /* Capture Button */
                        <div className="flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCapture}
                                disabled={isCapturing || !isStarted}
                                className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center disabled:opacity-50"
                            >
                                <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-red-500/90 rounded-xl text-white text-center max-w-xs pointer-events-auto">
                        <p className="font-bold mb-2">Camera Error</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={handleClose}
                            className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm"
                        >
                            Close
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Document Frame Guide Overlay
 */
const DocumentFrameGuide = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-6">
            {/* Semi-transparent overlay with cutout */}
            <div className="relative w-full max-w-md aspect-[3/4]">
                {/* Corner Markers */}
                <div className="absolute inset-0">
                    {/* Top Left */}
                    <div className="absolute top-0 left-0 w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white rounded-full shadow-lg" />
                        <div className="absolute top-0 left-0 w-1 h-full bg-white rounded-full shadow-lg" />
                    </div>

                    {/* Top Right */}
                    <div className="absolute top-0 right-0 w-12 h-12">
                        <div className="absolute top-0 right-0 w-full h-1 bg-white rounded-full shadow-lg" />
                        <div className="absolute top-0 right-0 w-1 h-full bg-white rounded-full shadow-lg" />
                    </div>

                    {/* Bottom Left */}
                    <div className="absolute bottom-0 left-0 w-12 h-12">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full shadow-lg" />
                        <div className="absolute bottom-0 left-0 w-1 h-full bg-white rounded-full shadow-lg" />
                    </div>

                    {/* Bottom Right */}
                    <div className="absolute bottom-0 right-0 w-12 h-12">
                        <div className="absolute bottom-0 right-0 w-full h-1 bg-white rounded-full shadow-lg" />
                        <div className="absolute bottom-0 right-0 w-1 h-full bg-white rounded-full shadow-lg" />
                    </div>
                </div>

                {/* Animated scanning line effect */}
                <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-nanobanana-blue to-transparent opacity-60"
                />

                {/* Edge guides (subtle dashed lines) */}
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg" />
            </div>

            {/* Vignette effect for focus */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                }}
            />
        </div>
    );
};

/**
 * Web Fallback Camera Component
 */
const WebCameraFallback = ({ onCapture, onClose }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = () => {
        if (preview) {
            const base64 = preview.split(',')[1];
            const file = base64ToFile(base64, `document_${Date.now()}.jpg`);
            onCapture({
                file,
                base64,
                format: 'jpeg',
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
                <span className="text-white font-bold">Capture Document</span>
                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                {preview ? (
                    <div className="relative w-full max-w-md">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full rounded-xl border-4 border-white"
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full max-w-md aspect-[3/4] bg-white/10 rounded-xl border-4 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer"
                    >
                        <Camera className="w-16 h-16 text-white/60 mb-4" />
                        <p className="text-white font-bold">Tap to take photo</p>
                        <p className="text-white/60 text-sm mt-1">or select from gallery</p>
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
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pb-10">
                {preview ? (
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setPreview(null)}
                            className="px-6 py-3 bg-white/20 rounded-full text-white font-bold"
                        >
                            Retake
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-8 py-4 bg-nanobanana-green rounded-full text-white font-bold border-4 border-white"
                        >
                            Use Photo
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white rounded-xl font-bold text-lg"
                    >
                        Open Camera
                    </button>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Convert base64 string to File object
 */
function base64ToFile(base64String, filename) {
    const mimeType = 'image/jpeg';
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
}

export default DocumentCameraView;
