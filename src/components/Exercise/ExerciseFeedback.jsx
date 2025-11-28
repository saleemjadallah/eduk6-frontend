import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, Award } from 'lucide-react';
import Confetti from 'react-confetti';

/**
 * ExerciseFeedback - Shows feedback after answer submission
 * Displays correct/incorrect state, XP gained, hints, and explanations
 */
const ExerciseFeedback = ({
  isCorrect,
  feedback,
  xpAwarded = 0,
  showHint,
  hint1,
  hint2,
  correctAnswer,
  explanation,
  attemptNumber,
  onTryAgain,
  onClose,
  autoCloseDelay = 10000, // 10 seconds
}) => {
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on correct answer
  useEffect(() => {
    if (isCorrect && xpAwarded > 0) {
      setShowConfetti(true);
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, xpAwarded]);

  // Auto-close countdown for correct answers
  useEffect(() => {
    if (isCorrect && autoCloseDelay > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCorrect, autoCloseDelay, onClose]);

  // Show hint based on showHint prop
  const currentHint = showHint === 1 ? hint1 : showHint === 2 ? hint2 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full relative"
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
        />
      )}
      {/* Result Banner */}
      <div
        className={`
          p-4 rounded-xl mb-4
          ${isCorrect
            ? 'bg-green-100 border-2 border-green-400'
            : 'bg-amber-100 border-2 border-amber-400'
          }
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${isCorrect ? 'bg-green-500' : 'bg-amber-500'}
            `}
          >
            {isCorrect ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Feedback Text */}
          <div className="flex-1">
            <p className={`font-semibold text-lg ${isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
              {feedback}
            </p>

            {/* XP Award */}
            {isCorrect && xpAwarded > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="flex items-center gap-2 mt-2"
              >
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 font-bold">+{xpAwarded} XP</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hint Display */}
      {currentHint && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">
                Hint {showHint}:
              </p>
              <p className="text-blue-800">{currentHint}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Correct Answer (shown when max attempts reached) */}
      {correctAnswer && !isCorrect && (
        <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-xl mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">
            The correct answer is:
          </p>
          <p className="text-xl font-bold text-gray-800">{correctAnswer}</p>
          {explanation && (
            <p className="text-gray-600 mt-2">{explanation}</p>
          )}
        </div>
      )}

      {/* Explanation (shown on correct answer) */}
      {isCorrect && explanation && (
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl mb-4">
          <p className="text-purple-800">{explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-4">
        {!isCorrect && !correctAnswer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTryAgain}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Try Again
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={`
            px-6 py-3 font-semibold rounded-xl transition-colors
            ${isCorrect || correctAnswer
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {isCorrect ? (
            <span className="flex items-center gap-2">
              Continue
              {autoCloseDelay > 0 && <span className="text-green-200">({countdown}s)</span>}
            </span>
          ) : correctAnswer ? (
            'Got it'
          ) : (
            'Close'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExerciseFeedback;
