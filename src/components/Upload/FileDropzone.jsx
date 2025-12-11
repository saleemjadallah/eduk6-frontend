import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Upload, X, CheckCircle } from 'lucide-react';

const FileDropzone = ({ onFileSelect, selectedFile, onClear, disabled }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled,
    });

    const getFileIcon = (file) => {
        if (!file) return null;
        if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
        return <FileText className="w-8 h-8" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {selectedFile ? (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-green-50 border-4 border-green-500 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl border-2 border-green-500 flex items-center justify-center text-green-600">
                                {getFileIcon(selectedFile)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-green-800 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-green-600">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <button
                                    onClick={onClear}
                                    className="p-2 hover:bg-green-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-green-700" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        {...getRootProps()}
                        className={`
                            p-8 border-4 border-dashed rounded-2xl cursor-pointer
                            transition-all duration-200
                            ${isDragActive && !isDragReject 
                                ? 'border-nanobanana-green bg-green-50 scale-[1.02]' 
                                : isDragReject
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-nanobanana-blue hover:bg-blue-50'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center text-center">
                            <motion.div
                                animate={isDragActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className={`
                                    w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4
                                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    ${isDragActive ? 'bg-nanobanana-green text-white' : 'bg-nanobanana-yellow'}
                                `}
                            >
                                <Upload className="w-8 h-8" />
                            </motion.div>
                            <p className="font-bold text-lg font-comic mb-2">
                                {isDragActive 
                                    ? isDragReject 
                                        ? "Oops! Can't use this file 😅" 
                                        : "Drop it like it's hot! 🔥"
                                    : "Drag & drop your lesson here"
                                }
                            </p>
                            <p className="text-gray-500 text-sm">
                                or click to browse • PDF, PPT, Images up to 10MB
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileDropzone;