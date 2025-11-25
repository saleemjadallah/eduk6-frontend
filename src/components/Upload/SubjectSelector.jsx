import React from 'react';
import { motion } from 'framer-motion';
import { SUBJECTS } from '../../constants/uploadConstants';

const SubjectSelector = ({ value, onChange, disabled = false }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-bold mb-2">
                Subject
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SUBJECTS.map((subject) => {
                    const isSelected = value === subject.value;
                    // Extract emoji and text
                    const [emoji, ...textParts] = subject.label.split(' ');
                    const text = textParts.join(' ');

                    return (
                        <motion.button
                            key={subject.value}
                            type="button"
                            whileHover={!disabled ? { scale: 1.02 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                            onClick={() => !disabled && onChange(subject.value)}
                            disabled={disabled}
                            className={`
                                relative flex flex-col items-center justify-center
                                p-2 rounded-xl border-2 transition-all
                                ${isSelected
                                    ? 'border-black bg-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span className="text-xl mb-1">{emoji}</span>
                            <span className="text-xs font-medium text-center leading-tight">
                                {text}
                            </span>
                            {isSelected && (
                                <motion.div
                                    layoutId="subject-indicator"
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center"
                                >
                                    <span className="text-white text-xs">✓</span>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectSelector;
