import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages, ChevronRight, Sparkles } from 'lucide-react';

// Popular languages for kids learning
const LANGUAGES = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸', popular: true },
    { code: 'fr', name: 'French', flag: '🇫🇷', popular: true },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', popular: true },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', popular: true },
    { code: 'de', name: 'German', flag: '🇩🇪', popular: false },
    { code: 'it', name: 'Italian', flag: '🇮🇹', popular: false },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', popular: false },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', popular: false },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', popular: false },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', popular: false },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', popular: false },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', popular: false },
];

/**
 * LanguageSelector - Modal for selecting target translation language
 */
const LanguageSelector = ({ isOpen, onClose, onSelectLanguage, selectedText, isProcessing }) => {
    const [showAllLanguages, setShowAllLanguages] = useState(false);

    const popularLanguages = LANGUAGES.filter(l => l.popular);
    const allLanguages = LANGUAGES;
    const displayLanguages = showAllLanguages ? allLanguages : popularLanguages;

    const handleSelectLanguage = (language) => {
        onSelectLanguage(language.name);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="language-selector-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    className="language-selector-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        className="close-button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="modal-header">
                        <div className="header-icon">
                            <Languages className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="header-title">Translate to...</h2>
                        <p className="header-subtitle">Pick a language!</p>
                    </div>

                    {/* Selected Text Preview */}
                    {selectedText && (
                        <div className="selected-text-preview">
                            <span className="preview-label">Translating:</span>
                            <span className="preview-text">
                                "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
                            </span>
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <motion.div
                            className="processing-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.div
                                className="processing-spinner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Sparkles className="w-6 h-6 text-emerald-500" />
                            </motion.div>
                            <p className="processing-text">Translating...</p>
                        </motion.div>
                    )}

                    {/* Language Grid */}
                    {!isProcessing && (
                        <>
                            <div className="language-grid">
                                {displayLanguages.map((language, index) => (
                                    <motion.button
                                        key={language.code}
                                        className="language-button"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelectLanguage(language)}
                                    >
                                        <span className="language-flag">{language.flag}</span>
                                        <span className="language-name">{language.name}</span>
                                        <ChevronRight className="language-arrow" />
                                    </motion.button>
                                ))}
                            </div>

                            {/* Show More Button */}
                            {!showAllLanguages && (
                                <button
                                    className="show-more-button"
                                    onClick={() => setShowAllLanguages(true)}
                                >
                                    Show more languages
                                </button>
                            )}
                        </>
                    )}
                </motion.div>

                <style>{`
                    .language-selector-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 20px;
                    }

                    .language-selector-modal {
                        position: relative;
                        background: white;
                        border-radius: 24px;
                        border: 4px solid black;
                        box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
                        max-width: 400px;
                        width: 100%;
                        max-height: 80vh;
                        overflow-y: auto;
                        padding: 24px;
                    }

                    .close-button {
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: #f3f4f6;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: background 0.2s;
                    }

                    .close-button:hover {
                        background: #e5e7eb;
                    }

                    .modal-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .header-icon {
                        width: 56px;
                        height: 56px;
                        background: linear-gradient(135deg, #10B981, #059669);
                        border-radius: 50%;
                        border: 3px solid black;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 12px;
                        box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
                    }

                    .header-title {
                        font-size: 24px;
                        font-weight: 800;
                        color: #1f2937;
                        margin: 0;
                    }

                    .header-subtitle {
                        font-size: 14px;
                        color: #6b7280;
                        margin: 4px 0 0;
                    }

                    .selected-text-preview {
                        background: #f3f4f6;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 12px 16px;
                        margin-bottom: 20px;
                    }

                    .preview-label {
                        display: block;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        color: #9ca3af;
                        margin-bottom: 4px;
                    }

                    .preview-text {
                        font-size: 14px;
                        color: #4b5563;
                        font-style: italic;
                    }

                    .processing-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 40px 20px;
                    }

                    .processing-spinner {
                        margin-bottom: 12px;
                    }

                    .processing-text {
                        font-size: 16px;
                        font-weight: 600;
                        color: #10B981;
                    }

                    .language-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }

                    .language-button {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 16px;
                        background: white;
                        border: 3px solid #e5e7eb;
                        border-radius: 16px;
                        cursor: pointer;
                        transition: all 0.2s;
                        text-align: left;
                    }

                    .language-button:hover {
                        border-color: #10B981;
                        background: #ecfdf5;
                    }

                    .language-flag {
                        font-size: 24px;
                    }

                    .language-name {
                        flex: 1;
                        font-size: 15px;
                        font-weight: 600;
                        color: #374151;
                    }

                    .language-arrow {
                        width: 18px;
                        height: 18px;
                        color: #9ca3af;
                        transition: transform 0.2s, color 0.2s;
                    }

                    .language-button:hover .language-arrow {
                        transform: translateX(4px);
                        color: #10B981;
                    }

                    .show-more-button {
                        width: 100%;
                        margin-top: 16px;
                        padding: 12px;
                        background: transparent;
                        border: 2px dashed #d1d5db;
                        border-radius: 12px;
                        color: #6b7280;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .show-more-button:hover {
                        border-color: #10B981;
                        color: #10B981;
                        background: #ecfdf5;
                    }

                    @media (max-width: 480px) {
                        .language-grid {
                            grid-template-columns: 1fr;
                        }

                        .language-selector-modal {
                            padding: 20px;
                            margin: 10px;
                        }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default LanguageSelector;
