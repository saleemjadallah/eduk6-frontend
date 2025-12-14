import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Hook for camera operations using Capacitor Camera plugin
 * Works on native iOS/Android and falls back to file input on web
 */
export const useCamera = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    // Check if running on native platform
    const isNative = Capacitor.isNativePlatform();

    /**
     * Take a photo using the device camera
     */
    const takePhoto = useCallback(async () => {
        setIsCapturing(true);
        setError(null);

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
                correctOrientation: true,
                width: 2048, // Max width for good OCR quality
                height: 2048,
            });

            setIsCapturing(false);

            // Convert base64 to File object for consistent handling
            const file = base64ToFile(image.base64String, `photo_${Date.now()}.${image.format}`);

            return {
                file,
                base64: image.base64String,
                format: image.format,
                webPath: image.webPath,
            };
        } catch (err) {
            setIsCapturing(false);

            // User cancelled - not an error
            if (err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
                return null;
            }

            setError(err.message || 'Failed to capture photo');
            throw err;
        }
    }, []);

    /**
     * Pick a photo from the device gallery
     */
    const pickFromGallery = useCallback(async () => {
        setIsCapturing(true);
        setError(null);

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos,
                correctOrientation: true,
                width: 2048,
                height: 2048,
            });

            setIsCapturing(false);

            // Convert base64 to File object
            const file = base64ToFile(image.base64String, `photo_${Date.now()}.${image.format}`);

            return {
                file,
                base64: image.base64String,
                format: image.format,
                webPath: image.webPath,
            };
        } catch (err) {
            setIsCapturing(false);

            // User cancelled - not an error
            if (err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
                return null;
            }

            setError(err.message || 'Failed to select photo');
            throw err;
        }
    }, []);

    /**
     * Show camera or gallery prompt (lets user choose)
     */
    const captureOrSelect = useCallback(async () => {
        setIsCapturing(true);
        setError(null);

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Prompt, // Shows option to choose camera or gallery
                correctOrientation: true,
                width: 2048,
                height: 2048,
                promptLabelHeader: 'Add Lesson Photo',
                promptLabelCancel: 'Cancel',
                promptLabelPhoto: 'Choose from Photos',
                promptLabelPicture: 'Take Photo',
            });

            setIsCapturing(false);

            // Convert base64 to File object
            const file = base64ToFile(image.base64String, `photo_${Date.now()}.${image.format}`);

            return {
                file,
                base64: image.base64String,
                format: image.format,
                webPath: image.webPath,
            };
        } catch (err) {
            setIsCapturing(false);

            // User cancelled - not an error
            if (err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
                return null;
            }

            setError(err.message || 'Failed to capture photo');
            throw err;
        }
    }, []);

    /**
     * Check camera permissions
     */
    const checkPermissions = useCallback(async () => {
        try {
            const permissions = await Camera.checkPermissions();
            return permissions;
        } catch (err) {
            console.error('Error checking camera permissions:', err);
            return { camera: 'denied', photos: 'denied' };
        }
    }, []);

    /**
     * Request camera permissions
     */
    const requestPermissions = useCallback(async () => {
        try {
            const permissions = await Camera.requestPermissions();
            return permissions;
        } catch (err) {
            console.error('Error requesting camera permissions:', err);
            throw err;
        }
    }, []);

    return {
        takePhoto,
        pickFromGallery,
        captureOrSelect,
        checkPermissions,
        requestPermissions,
        isCapturing,
        error,
        isNative,
        clearError: () => setError(null),
    };
};

/**
 * Convert base64 string to File object
 */
function base64ToFile(base64String, filename) {
    try {
        // Validate input
        if (!base64String || typeof base64String !== 'string') {
            throw new Error('Invalid base64 string provided');
        }

        // Check for data URL prefix and remove if present
        let cleanBase64 = base64String;
        if (base64String.includes(',')) {
            cleanBase64 = base64String.split(',')[1];
        }

        // Validate base64 format (should only contain valid base64 chars)
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(cleanBase64)) {
            // Try to clean it up
            cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');
        }

        // Ensure proper padding
        while (cleanBase64.length % 4 !== 0) {
            cleanBase64 += '=';
        }

        // Determine MIME type from filename
        const extension = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
        };
        const mimeType = mimeTypes[extension] || 'image/jpeg';

        // Convert base64 to binary
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create Blob and File
        const blob = new Blob([bytes], { type: mimeType });
        const file = new File([blob], filename, { type: mimeType });

        return file;
    } catch (error) {
        throw error;
    }
}

export default useCamera;
