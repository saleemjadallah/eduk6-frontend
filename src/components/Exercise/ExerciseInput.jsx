import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * ExerciseInput - Adaptive input component for different exercise types
 * Renders text input, number input, or multiple choice based on answerType
 */
const ExerciseInput = ({
  answerType = 'TEXT',
  exerciseType,
  options = [],
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type your answer...',
}) => {
  const inputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled && value?.trim()) {
      onSubmit();
    }
  };

  // Multiple choice input
  if (answerType === 'SELECTION' || exerciseType === 'MULTIPLE_CHOICE' || exerciseType === 'TRUE_FALSE') {
    const displayOptions = exerciseType === 'TRUE_FALSE'
      ? ['True', 'False']
      : options;

    return (
      <div className="space-y-3">
        {displayOptions.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => {
              if (!disabled) {
                setSelectedOption(index);
                onChange(option);
              }
            }}
            disabled={disabled}
            className={`
              w-full p-4 text-left rounded-xl border-2 transition-all
              font-medium text-base
              ${selectedOption === index
                ? 'bg-purple-100 border-purple-500 text-purple-800'
                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
              }
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 mr-3 text-sm font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </motion.button>
        ))}
      </div>
    );
  }

  // Number input
  if (answerType === 'NUMBER' || exerciseType === 'MATH_PROBLEM') {
    return (
      <div className="flex flex-col items-center">
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="?"
          className={`
            w-32 h-16 text-center text-3xl font-bold
            border-2 border-gray-300 rounded-xl
            focus:border-purple-500 focus:ring-2 focus:ring-purple-200
            outline-none transition-all
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          style={{ fontFamily: 'monospace' }}
        />
        <p className="text-sm text-gray-500 mt-2">
          Press Enter to submit
        </p>
      </div>
    );
  }

  // Default text input
  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full p-4 text-lg
          border-2 border-gray-300 rounded-xl
          focus:border-purple-500 focus:ring-2 focus:ring-purple-200
          outline-none transition-all
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
      <p className="text-sm text-gray-500 mt-2 text-center">
        Press Enter to submit
      </p>
    </div>
  );
};

export default ExerciseInput;
