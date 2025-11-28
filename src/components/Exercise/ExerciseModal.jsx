import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, HelpCircle } from 'lucide-react';
import ExerciseInput from './ExerciseInput';
import ExerciseFeedback from './ExerciseFeedback';
import { exerciseAPI } from '../../services/api/exerciseAPI';

/**
 * ExerciseModal - Main modal for answering interactive exercises
 * Opens when user clicks on an exercise highlight in the lesson
 */
const ExerciseModal = ({
  exercise,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset state when modal opens with new exercise
  useEffect(() => {
    if (isOpen && exercise) {
      setAnswer('');
      setResult(null);
      setError(null);
    }
  }, [isOpen, exercise?.id]);

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await exerciseAPI.submitAnswer(exercise.id, answer);
      setResult(response.data);

      // Notify parent if complete
      if (response.data.isCorrect) {
        onComplete?.(response.data);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Oops! Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setAnswer('');
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
  };

  if (!exercise) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Practice Question</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Question */}
                <div className="mb-6">
                  {exercise.contextText && (
                    <p className="text-sm text-gray-500 mb-2">{exercise.contextText}</p>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">
                    {exercise.questionText}
                  </h3>
                  {exercise.originalPosition && (
                    <p className="text-xs text-gray-400 mt-1">
                      {exercise.originalPosition}
                    </p>
                  )}
                </div>

                {/* Input or Feedback */}
                {!result ? (
                  <div className="space-y-4">
                    <ExerciseInput
                      answerType={exercise.answerType}
                      exerciseType={exercise.type}
                      options={exercise.options}
                      value={answer}
                      onChange={setAnswer}
                      onSubmit={handleSubmit}
                      disabled={isSubmitting}
                      placeholder={
                        exercise.type === 'MATH_PROBLEM'
                          ? 'Enter your answer...'
                          : 'Type your answer...'
                      }
                    />

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={!answer.trim() || isSubmitting}
                      className={`
                        w-full py-4 rounded-xl font-bold text-lg
                        transition-all flex items-center justify-center gap-2
                        ${!answer.trim() || isSubmitting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <ExerciseFeedback
                    isCorrect={result.isCorrect}
                    feedback={result.feedback}
                    xpAwarded={result.xpAwarded}
                    showHint={result.showHint}
                    hint1={exercise.hint1}
                    hint2={exercise.hint2}
                    correctAnswer={result.correctAnswer}
                    explanation={result.explanation}
                    attemptNumber={result.attemptNumber}
                    onTryAgain={handleTryAgain}
                    onClose={handleClose}
                    autoCloseDelay={result.isCorrect ? 10000 : 0}
                  />
                )}
              </div>

              {/* Difficulty Badge */}
              {exercise.difficulty && (
                <div className="px-6 pb-4">
                  <span
                    className={`
                      inline-block px-3 py-1 rounded-full text-xs font-semibold
                      ${exercise.difficulty === 'EASY'
                        ? 'bg-green-100 text-green-700'
                        : exercise.difficulty === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }
                    `}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExerciseModal;
