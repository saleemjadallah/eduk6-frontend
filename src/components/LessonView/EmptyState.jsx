import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Sparkles, ArrowRight } from 'lucide-react';

/**
 * EmptyState - Friendly empty state shown when no lesson is selected
 * Encourages users to upload content or select a lesson
 */
const EmptyState = ({
  onUploadClick,
  hasLessons = false,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50">
      {/* Animated mascot/icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="relative mb-8"
      >
        {/* Background glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-nanobanana-yellow rounded-full blur-2xl"
        />

        {/* Icon container */}
        <div className="relative w-32 h-32 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BookOpen className="w-16 h-16 text-black" />
          </motion.div>
        </div>

        {/* Sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-8 h-8 text-nanobanana-pink" />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-md"
      >
        <h2 className="text-3xl font-black font-comic mb-4 text-gray-800">
          {hasLessons ? 'Choose a Lesson!' : 'Ready to Learn?'}
        </h2>

        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          {hasLessons ? (
            <>
              Pick a lesson from your library, or upload something new!
              Ollie is ready to help you learn.
            </>
          ) : (
            <>
              Upload a PDF, image, or YouTube video to start learning!
              Ollie will help you understand everything.
            </>
          )}
        </p>

        {/* Upload CTA */}
        {onUploadClick && (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUploadClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-nanobanana-green text-white font-bold font-comic text-lg rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          >
            <Upload className="w-6 h-6" />
            Upload Your First Lesson
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>

      {/* Feature hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-wrap justify-center gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200 text-sm text-gray-600"
          >
            <span>{feature.emoji}</span>
            <span>{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Feature hints shown at bottom
const features = [
  { emoji: '📄', label: 'PDFs' },
  { emoji: '🖼️', label: 'Images' },
  { emoji: '🎥', label: 'YouTube' },
  { emoji: '💬', label: 'Chat with Ollie' },
  { emoji: '🃏', label: 'Flashcards' },
  { emoji: '❓', label: 'Quizzes' },
];

export default EmptyState;
