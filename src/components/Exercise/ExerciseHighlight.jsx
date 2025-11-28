import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, HelpCircle } from 'lucide-react';

/**
 * ExerciseHighlight - Clickable highlight wrapper for exercises in lesson content
 * Shows a subtle indicator that this is an interactive exercise
 */
const ExerciseHighlight = ({
  exercise,
  isCompleted = false,
  onClick,
  children,
}) => {
  return (
    <motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(exercise)}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer
        transition-all duration-200
        ${isCompleted
          ? 'bg-green-100 hover:bg-green-200 border border-green-300'
          : 'bg-purple-100 hover:bg-purple-200 border border-purple-300 animate-pulse-subtle'
        }
      `}
      title={isCompleted ? 'Completed!' : 'Click to answer this question'}
    >
      <span className={isCompleted ? 'text-green-800' : 'text-purple-800'}>
        {children || exercise.questionText}
      </span>
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <HelpCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
      )}
    </motion.span>
  );
};

/**
 * ExerciseCard - Card display for exercises (used in a list view)
 */
export const ExerciseCard = ({
  exercise,
  isCompleted = false,
  attemptCount = 0,
  onClick,
}) => {
  const difficultyColors = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700',
  };

  const typeIcons = {
    FILL_IN_BLANK: 'Fill in the blank',
    MATH_PROBLEM: 'Math Problem',
    SHORT_ANSWER: 'Short Answer',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TRUE_FALSE: 'True or False',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(exercise)}
      className={`
        p-4 rounded-xl cursor-pointer transition-all
        border-2
        ${isCompleted
          ? 'bg-green-50 border-green-300 hover:border-green-400'
          : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Type badge */}
          <span className="text-xs text-gray-500 font-medium">
            {typeIcons[exercise.type] || exercise.type}
          </span>

          {/* Question preview */}
          <p className={`mt-1 font-medium ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
            {exercise.questionText}
          </p>

          {/* Original position */}
          {exercise.originalPosition && (
            <p className="text-xs text-gray-400 mt-1">
              {exercise.originalPosition}
            </p>
          )}
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${difficultyColors[exercise.difficulty] || difficultyColors.MEDIUM}`}>
          {exercise.difficulty || 'MEDIUM'}
        </span>
        {attemptCount > 0 && (
          <span className="text-xs text-gray-500">
            {attemptCount} attempt{attemptCount > 1 ? 's' : ''}
          </span>
        )}
        <span className="text-xs text-gray-500">
          +{exercise.xpReward || 10} XP
        </span>
      </div>
    </motion.div>
  );
};

/**
 * ExerciseList - Container for displaying exercises as a list
 */
export const ExerciseList = ({
  exercises = [],
  onExerciseClick,
}) => {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  const completedCount = exercises.filter(e => e.isCompleted).length;
  const totalCount = exercises.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          Practice Questions
        </h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-green-500"
        />
      </div>

      {/* Exercise cards */}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={exercise.isCompleted}
            attemptCount={exercise.attemptCount}
            onClick={onExerciseClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseHighlight;
