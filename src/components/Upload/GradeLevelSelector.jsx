import React from 'react';
import { motion } from 'framer-motion';
import { GRADE_LEVELS } from '../../constants/uploadConstants';

const GradeLevelSelector = ({ value, onChange, disabled = false }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-bold mb-2">
                Grade Level
            </label>
            <div className="flex flex-wrap gap-2">
                {GRADE_LEVELS.map((grade) => {
                    const isSelected = value === grade.value;

                    return (
                        <motion.button
                            key={grade.value}
                            type="button"
                            whileHover={!disabled ? { scale: 1.05 } : {}}
                            whileTap={!disabled ? { scale: 0.95 } : {}}
                            onClick={() => !disabled && onChange(grade.value)}
                            disabled={disabled}
                            className={`
                                px-3 py-2 rounded-lg border-2 font-medium text-sm
                                transition-all
                                ${isSelected
                                    ? 'border-black bg-nanobanana-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {grade.label}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default GradeLevelSelector;
