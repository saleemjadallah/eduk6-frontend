import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clipboard } from 'lucide-react';

const TextInput = ({ onTextChange, pastedText, onClear, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                onTextChange(text);
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const formatCharCount = (count) => {
        if (count < 1000) return count;
        return (count / 1000).toFixed(1) + 'k';
    };

    const hasText = pastedText && pastedText.trim().length > 0;
    const charCount = pastedText?.length || 0;
    const wordCount = pastedText?.trim().split(/\s+/).filter(w => w).length || 0;

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {hasText ? (
                    <motion.div
                        key="has-text"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-3"
                    >
                        <div className="p-4 bg-green-50 border-4 border-green-500 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-xl border-2 border-green-500 flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Type className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-green-800">
                                        Text Ready!
                                    </p>
                                    <p className="text-sm text-green-600">
                                        {formatCharCount(charCount)} characters • {wordCount} words
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
                        </div>

                        {/* Text Preview */}
                        <div className="relative">
                            <textarea
                                value={pastedText}
                                onChange={(e) => onTextChange(e.target.value)}
                                disabled={disabled}
                                placeholder="Paste or type your lesson content here..."
                                className={`
                                    w-full h-32 p-4 border-4 border-gray-300 rounded-2xl
                                    font-medium text-sm resize-none
                                    focus:outline-none focus:border-nanobanana-blue
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {/* Paste from clipboard button */}
                        <button
                            onClick={handlePaste}
                            disabled={disabled}
                            className={`
                                w-full p-8 border-4 border-dashed border-gray-300 rounded-2xl
                                bg-gray-50 hover:border-nanobanana-blue hover:bg-blue-50
                                transition-all duration-200
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-400"
                                >
                                    <Clipboard className="w-8 h-8" />
                                </motion.div>
                                <p className="font-bold text-lg font-comic mb-2">
                                    Paste from Clipboard
                                </p>
                                <p className="text-gray-500 text-sm">
                                    or type directly in the box below
                                </p>
                            </div>
                        </button>

                        {/* Or type directly */}
                        <div className="relative">
                            <textarea
                                value={pastedText || ''}
                                onChange={(e) => onTextChange(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                disabled={disabled}
                                placeholder="Or type/paste your lesson content here..."
                                className={`
                                    w-full h-40 p-4 border-4 rounded-2xl
                                    font-medium text-sm resize-none
                                    transition-all duration-200
                                    focus:outline-none
                                    ${isFocused
                                        ? 'border-nanobanana-blue bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            />
                            <p className="absolute bottom-3 right-3 text-xs text-gray-400">
                                Min. 10 characters
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TextInput;
