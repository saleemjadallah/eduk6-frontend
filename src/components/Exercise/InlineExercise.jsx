import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, ChevronDown, ChevronUp, Lightbulb, Award } from 'lucide-react';
import { exerciseAPI } from '../../services/api/exerciseAPI';

/**
 * InlineExercise - Clickable inline exercise that expands to show answer input
 * Renders as a highlighted span within lesson content
 */
const InlineExercise = ({
  exerciseId,
  questionText,
  exerciseType,
  expectedAnswer, // Only shown after completion
  exercise, // Full exercise object from database (if available)
  lessonId, // Required for marker ID lookups when exercise is not in database
  onComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleClick = () => {
    if (!isCompleted) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Use the exercise ID from database if available, otherwise use the HTML data-id
      const idToUse = exercise?.id || exerciseId;
      // Pass lessonId for marker ID lookups (when exercise isn't found in database)
      const response = await exerciseAPI.submitAnswer(idToUse, answer, lessonId);
      setResult(response.data);

      if (response.data.isCorrect) {
        setIsCompleted(true);
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

  return (
    <span className="inline">
      {/* Clickable question text */}
      <motion.span
        onClick={handleClick}
        whileHover={{ scale: isCompleted ? 1 : 1.02 }}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer
          transition-all duration-200 mx-1
          ${isCompleted
            ? 'bg-green-100 border-2 border-green-400 text-green-800'
            : 'bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 hover:border-orange-400 text-orange-800 animate-pulse-subtle'
          }
        `}
        title={isCompleted ? 'Completed!' : 'Click to answer this question'}
      >
        <span className="font-semibold">{questionText}</span>
        {isCompleted ? (
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-orange-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-orange-600 flex-shrink-0" />
          )
        )}
      </motion.span>

      {/* Expanded answer area */}
      <AnimatePresence>
        {isExpanded && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="block w-full max-w-md mx-auto my-2"
          >
            <div className="bg-white rounded-xl border-2 border-orange-300 shadow-lg p-4">
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={
                      exerciseType === 'MATH_PROBLEM'
                        ? 'Enter your answer (e.g., 1/6 or 0.167)'
                        : 'Type your answer here...'
                    }
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    autoFocus
                    disabled={isSubmitting}
                  />

                  {error && (
                    <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!answer.trim() || isSubmitting}
                    className={`
                      w-full py-3 rounded-xl font-bold text-white
                      transition-all flex items-center justify-center gap-2
                      ${!answer.trim() || isSubmitting
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600'
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
                </form>
              ) : (
                <div className="space-y-3">
                  {/* Result Banner */}
                  <div
                    className={`
                      p-3 rounded-xl flex items-center gap-3
                      ${result.isCorrect
                        ? 'bg-green-100 border-2 border-green-400'
                        : 'bg-amber-100 border-2 border-amber-400'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${result.isCorrect ? 'bg-green-500' : 'bg-amber-500'}
                      `}
                    >
                      {result.isCorrect ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${result.isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                        {result.feedback}
                      </p>
                      {result.isCorrect && result.xpAwarded > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600 font-bold text-sm">+{result.xpAwarded} XP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hint (if wrong) */}
                  {!result.isCorrect && result.showHint && exercise && (
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700">Hint:</p>
                        <p className="text-sm text-blue-800">
                          {result.showHint === 1 ? exercise.hint1 : exercise.hint2}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Correct answer (if max attempts) */}
                  {!result.isCorrect && result.correctAnswer && (
                    <div className="p-3 bg-gray-100 border-2 border-gray-300 rounded-xl">
                      <p className="text-xs font-semibold text-gray-600">The correct answer is:</p>
                      <p className="text-lg font-bold text-gray-800">{result.correctAnswer}</p>
                      {result.explanation && (
                        <p className="text-sm text-gray-600 mt-1">{result.explanation}</p>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {!result.isCorrect && !result.correctAnswer && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTryAgain}
                        className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        Try Again
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsExpanded(false)}
                      className={`
                        flex-1 py-2 font-bold rounded-xl transition-colors
                        ${result.isCorrect || result.correctAnswer
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      {result.isCorrect ? 'Done!' : result.correctAnswer ? 'Got it' : 'Close'}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default InlineExercise;
