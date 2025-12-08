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
        console.log('[useCamera] takePhoto called, platform:', Capacitor.getPlatform());
        setIsCapturing(true);
        setError(null);

        try {
            console.log('[useCamera] Calling Camera.getPhoto...');
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
                correctOrientation: true,
                width: 2048, // Max width for good OCR quality
                height: 2048,
            });

            console.log('[useCamera] Camera.getPhoto returned:', {
                hasBase64: !!image.base64String,
                base64Length: image.base64String?.length || 0,
                format: image.format,
                webPath: image.webPath,
            });

            setIsCapturing(false);

            // Convert base64 to File object for consistent handling
            const file = base64ToFile(image.base64String, `photo_${Date.now()}.${image.format}`);

            console.log('[useCamera] takePhoto complete, file size:', file.size);

            return {
                file,
                base64: image.base64String,
                format: image.format,
                webPath: image.webPath,
            };
        } catch (err) {
            setIsCapturing(false);
            console.error('[useCamera] takePhoto error:', {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });

            // User cancelled - not an error
            if (err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
                console.log('[useCamera] User cancelled photo capture');
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
        console.log('[useCamera] pickFromGallery called, platform:', Capacitor.getPlatform());
        setIsCapturing(true);
        setError(null);

        try {
            console.log('[useCamera] Calling Camera.getPhoto for gallery...');
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos,
                correctOrientation: true,
                width: 2048,
                height: 2048,
            });

            console.log('[useCamera] Gallery photo returned:', {
                hasBase64: !!image.base64String,
                base64Length: image.base64String?.length || 0,
                format: image.format,
                webPath: image.webPath,
            });

            setIsCapturing(false);

            // Convert base64 to File object
            const file = base64ToFile(image.base64String, `photo_${Date.now()}.${image.format}`);

            console.log('[useCamera] pickFromGallery complete, file size:', file.size);

            return {
                file,
                base64: image.base64String,
                format: image.format,
                webPath: image.webPath,
            };
        } catch (err) {
            setIsCapturing(false);
            console.error('[useCamera] pickFromGallery error:', {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });

            // User cancelled - not an error
            if (err.message?.includes('User cancelled') || err.message?.includes('cancelled')) {
                console.log('[useCamera] User cancelled gallery selection');
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
 * Enhanced with detailed logging for iPad debugging
 */
function base64ToFile(base64String, filename) {
    console.log('[useCamera] base64ToFile called:', {
        filename,
        base64Length: base64String?.length || 0,
        base64Preview: base64String?.substring(0, 50) + '...',
    });

    try {
        // Validate input
        if (!base64String || typeof base64String !== 'string') {
            console.error('[useCamera] Invalid base64String:', typeof base64String);
            throw new Error('Invalid base64 string provided');
        }

        // Check for data URL prefix and remove if present
        let cleanBase64 = base64String;
        if (base64String.includes(',')) {
            cleanBase64 = base64String.split(',')[1];
            console.log('[useCamera] Stripped data URL prefix, new length:', cleanBase64.length);
        }

        // Validate base64 format (should only contain valid base64 chars)
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(cleanBase64)) {
            console.error('[useCamera] Invalid base64 characters detected');
            // Try to clean it up
            cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');
            console.log('[useCamera] Cleaned base64, new length:', cleanBase64.length);
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
        console.log('[useCamera] Using mimeType:', mimeType);

        // Convert base64 to binary using safer method
        let bytes;
        try {
            const binaryString = atob(cleanBase64);
            console.log('[useCamera] atob successful, binary length:', binaryString.length);

            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        } catch (atobError) {
            console.error('[useCamera] atob failed:', atobError.message);
            // Fallback: try using fetch to decode
            console.log('[useCamera] Attempting fetch-based decode fallback...');
            throw new Error(`Base64 decode failed: ${atobError.message}`);
        }

        // Create Blob and File
        const blob = new Blob([bytes], { type: mimeType });
        console.log('[useCamera] Blob created, size:', blob.size);

        const file = new File([blob], filename, { type: mimeType });
        console.log('[useCamera] File created successfully:', {
            name: file.name,
            size: file.size,
            type: file.type,
        });

        return file;
    } catch (error) {
        console.error('[useCamera] base64ToFile error:', {
            error: error.message,
            stack: error.stack,
            filename,
            base64Length: base64String?.length || 0,
        });
        throw error;
    }
}

export default useCamera;
