import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Clock, TrendingUp } from 'lucide-react';

/**
 * ProgressIndicator - Shows lesson progress with animated bar
 */
const ProgressIndicator = ({
  progress = 0,
  timeSpent = 0,
  showTimeSpent = true,
  showMilestones = true,
  variant = 'default', // 'default' | 'compact' | 'minimal'
}) => {
  // Progress milestones
  const milestones = [25, 50, 75, 100];
  const achievedMilestones = milestones.filter(m => progress >= m);

  // Format time spent
  const formatTime = (seconds) => {
    if (!seconds || seconds < 60) return 'Just started';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes} min`;
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-nanobanana-green to-emerald-400 rounded-full"
        />
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-nanobanana-green to-emerald-400 rounded-full"
            />
          </div>
        </div>
        <span className="text-sm font-bold text-gray-600 min-w-[40px]">
          {progress}%
        </span>
        {showTimeSpent && timeSpent > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatTime(timeSpent)}
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-nanobanana-green" />
          <span className="text-sm font-bold text-gray-700">Progress</span>
        </div>

        <div className="flex items-center gap-3">
          {showTimeSpent && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatTime(timeSpent)}
            </span>
          )}

          <span className="text-sm font-bold text-nanobanana-green">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Milestones markers */}
        {showMilestones && milestones.slice(0, -1).map(milestone => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
            style={{ left: `${milestone}%` }}
          />
        ))}

        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-nanobanana-green via-emerald-400 to-green-500 rounded-full relative"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />

          {/* Animated pulse at end */}
          {progress > 0 && progress < 100 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 rounded-full"
            />
          )}
        </motion.div>

        {/* Completion celebration */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
          >
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          </motion.div>
        )}
      </div>

      {/* Milestone indicators */}
      {showMilestones && (
        <div className="flex justify-between mt-2">
          {milestones.map(milestone => {
            const achieved = progress >= milestone;
            return (
              <motion.div
                key={milestone}
                initial={false}
                animate={achieved ? { scale: [1, 1.2, 1] } : {}}
                className="flex flex-col items-center"
              >
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${achieved
                      ? 'bg-nanobanana-green text-white'
                      : 'bg-gray-200 text-gray-400'
                    }
                    transition-colors duration-300
                  `}
                >
                  {achieved ? (
                    milestone === 100 ? (
                      <Star className="w-3 h-3" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )
                  ) : (
                    <span className="text-[10px]">{milestone}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
