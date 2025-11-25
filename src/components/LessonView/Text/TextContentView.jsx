import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Star,
  Layers,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HighlightableContent, SelectionToolbar } from '../../Selection';

/**
 * TextContentView - Rich text content viewer for lesson text/markdown
 * Supports highlighting, selection, and structured content display
 */
const TextContentView = ({
  lesson,
  viewPreferences = {},
  onSelectionAction,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    keyPoints: true,
    chapters: true,
    vocabulary: false,
    questions: false,
  });

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Get content from lesson
  const content = lesson.content || {};
  const summary = content.summary || lesson.summary;
  const keyPoints = content.keyPoints || lesson.keyConceptsForChat || [];
  const chapters = content.chapters || lesson.chapters || [];
  const vocabulary = content.vocabulary || lesson.vocabulary || [];
  const suggestedQuestions = lesson.suggestedQuestions || [];
  const rawText = content.rawText || lesson.rawText;

  return (
    <div className="flex-1 h-full overflow-auto bg-gradient-to-b from-white to-gray-50">
      <HighlightableContent
        lessonId={lesson.id}
        contentType="html"
        onSelectionAction={onSelectionAction}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="space-y-6">
          {/* Summary Section */}
          {summary && (
            <ContentSection
              title="Summary"
              icon={<BookOpen className="w-5 h-5" />}
              isExpanded={expandedSections.summary}
              onToggle={() => toggleSection('summary')}
              color="blue"
            >
              <p className="text-gray-700 leading-relaxed text-lg">
                {summary}
              </p>
            </ContentSection>
          )}

          {/* Key Points Section */}
          {keyPoints.length > 0 && (
            <ContentSection
              title="Key Points"
              icon={<Star className="w-5 h-5 fill-yellow-400 text-black" />}
              isExpanded={expandedSections.keyPoints}
              onToggle={() => toggleSection('keyPoints')}
              color="yellow"
            >
              <ul className="space-y-3">
                {keyPoints.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex-shrink-0 w-7 h-7 bg-nanobanana-yellow rounded-full border-2 border-black flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </ContentSection>
          )}

          {/* Chapters Section */}
          {chapters.length > 0 && (
            <ContentSection
              title="Chapters"
              icon={<Layers className="w-5 h-5" />}
              isExpanded={expandedSections.chapters}
              onToggle={() => toggleSection('chapters')}
              color="green"
            >
              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id || index}
                    chapter={chapter}
                    index={index}
                  />
                ))}
              </div>
            </ContentSection>
          )}

          {/* Raw Text (if no structured content) */}
          {rawText && !summary && chapters.length === 0 && (
            <ContentSection
              title="Lesson Content"
              icon={<FileText className="w-5 h-5" />}
              isExpanded={true}
              onToggle={() => {}}
              color="blue"
            >
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {rawText}
                </p>
              </div>
            </ContentSection>
          )}

          {/* Vocabulary Section */}
          {vocabulary.length > 0 && (
            <ContentSection
              title="Key Words"
              icon={<FileText className="w-5 h-5" />}
              isExpanded={expandedSections.vocabulary}
              onToggle={() => toggleSection('vocabulary')}
              color="blue"
              badge={`${vocabulary.length} words`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {vocabulary.map((item, index) => (
                  <VocabularyCard key={index} item={item} />
                ))}
              </div>
            </ContentSection>
          )}

          {/* Suggested Questions Section */}
          {suggestedQuestions.length > 0 && (
            <ContentSection
              title="Questions to Think About"
              icon={<Sparkles className="w-5 h-5" />}
              isExpanded={expandedSections.questions}
              onToggle={() => toggleSection('questions')}
              color="purple"
            >
              <ul className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-purple-700"
                  >
                    <span className="text-purple-600 font-bold">?</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </ContentSection>
          )}
        </div>

        {/* Selection Toolbar */}
        <SelectionToolbar />
      </HighlightableContent>
    </div>
  );
};

/**
 * Collapsible Content Section Component
 */
const ContentSection = ({
  title,
  icon,
  isExpanded,
  onToggle,
  color,
  badge,
  children,
}) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-nanobanana-yellow',
    blue: 'bg-blue-50 border-nanobanana-blue',
    green: 'bg-green-50 border-nanobanana-green',
    purple: 'bg-purple-50 border-purple-300',
    pink: 'bg-pink-50 border-pink-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl border-4 ${colorClasses[color] || 'bg-white border-gray-200'}
        overflow-hidden transition-all duration-300
      `}
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-bold text-lg font-comic">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-white/60 rounded-full text-xs font-medium text-gray-600">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      {/* Section Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Chapter Card Component
 */
const ChapterCard = ({ chapter, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-nanobanana-green transition-colors"
  >
    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
      <span className="w-6 h-6 bg-nanobanana-green text-white rounded-full flex items-center justify-center text-sm font-bold">
        {index + 1}
      </span>
      {chapter.title}
    </h4>
    <p className="text-gray-700 leading-relaxed">{chapter.content}</p>
  </motion.div>
);

/**
 * Vocabulary Card Component
 */
const VocabularyCard = ({ item }) => {
  // Handle both object and string formats
  const term = typeof item === 'string' ? item : item.term;
  const definition = typeof item === 'string' ? null : item.definition;
  const example = typeof item === 'string' ? null : item.example;

  return (
    <div className="p-3 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-colors">
      <span className="font-bold text-blue-800">{term}</span>
      {definition && (
        <>
          <span className="text-gray-500">:</span>{' '}
          <span className="text-blue-600">{definition}</span>
        </>
      )}
      {example && (
        <p className="text-sm text-blue-500 mt-1 italic">
          Example: {example}
        </p>
      )}
    </div>
  );
};

export default TextContentView;
