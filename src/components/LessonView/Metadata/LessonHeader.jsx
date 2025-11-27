import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  BookOpen,
  ChevronLeft,
  MoreVertical,
  FileText,
  Image,
  Youtube,
} from 'lucide-react';
import { getContentTypeDisplayInfo } from '../../../utils/contentDetection';

// Subject emoji mapping (keys match backend Prisma Subject enum)
const SUBJECT_EMOJIS = {
  MATH: '🔢',
  SCIENCE: '🔬',
  ENGLISH: '📚',
  ARABIC: '🌙',
  ISLAMIC_STUDIES: '☪️',
  SOCIAL_STUDIES: '🌍',
  ART: '🎨',
  MUSIC: '🎵',
  OTHER: '📝',
};

/**
 * LessonHeader - Displays lesson title, subject, progress, and actions
 */
const LessonHeader = ({
  lesson,
  onBack,
  onToggleVocabulary,
  showVocabulary,
  onShowMenu,
  formatTimeSpent,
}) => {
  const subjectKey = lesson.subject?.toUpperCase() || '';
  const subjectEmoji = SUBJECT_EMOJIS[subjectKey] || '📝';

  // Get content type info
  const contentType = lesson.contentType || lesson.sourceType || lesson.source?.type || 'text';
  const contentInfo = getContentTypeDisplayInfo(contentType);

  // Progress
  const progressPercent = lesson.progress?.percentComplete || 0;
  const isCompleted = progressPercent === 100;

  // Time spent
  const timeSpentText = formatTimeSpent?.(lesson.progress?.timeSpent || 0) || null;

  return (
    <div className="bg-gradient-to-r from-nanobanana-green to-emerald-500 border-b-4 border-black">
      {/* Top row - Back button and actions */}
      <div className="flex items-center justify-between px-4 py-2">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-1 text-white/90 hover:text-white font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        <div className="flex items-center gap-2">
          {/* Toggle vocabulary panel */}
          {lesson.vocabulary?.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleVocabulary}
              className={`
                px-3 py-1 rounded-full text-xs font-bold border-2 border-white/30 transition-colors
                ${showVocabulary
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              📖 Key Words ({lesson.vocabulary.length})
            </motion.button>
          )}

          {/* Menu button */}
          {onShowMenu && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowMenu}
              className="p-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Main header content */}
      <div className="px-6 pb-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Subject badge */}
          <span className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {subjectEmoji} {lesson.subject || 'Lesson'}
          </span>

          {/* Grade level */}
          {lesson.gradeLevel && (
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
              {lesson.gradeLevel}
            </span>
          )}

          {/* Content type indicator */}
          <span className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
            {contentInfo.emoji} {contentInfo.label}
          </span>

          {/* Time spent */}
          {timeSpentText && (
            <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
              <Clock className="w-3 h-3" />
              {timeSpentText}
            </span>
          )}

          {/* Completed badge */}
          {isCompleted && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold"
            >
              <CheckCircle className="w-3 h-3" />
              Completed
            </motion.span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] line-clamp-2">
          {lesson.title || 'Untitled Lesson'}
        </h1>

        {/* Subtitle / Source info */}
        {lesson.source?.originalName && (
          <p className="text-white/70 text-sm mt-1 truncate">
            Source: {lesson.source.originalName}
          </p>
        )}
      </div>
    </div>
  );
};

export default LessonHeader;
