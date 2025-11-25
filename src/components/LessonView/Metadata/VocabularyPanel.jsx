import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  BookOpen,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useSelectionContext } from '../../../context/SelectionContext';

/**
 * VocabularyPanel - Slide-out panel showing lesson vocabulary
 * With search, text-to-speech, and flashcard creation
 */
const VocabularyPanel = ({
  vocabulary = [],
  lessonId,
  onClose,
  isOpen = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerms, setExpandedTerms] = useState(new Set());
  const { handleCreateFlashcard, setSelection } = useSelectionContext() || {};

  // Filter vocabulary by search
  const filteredVocabulary = vocabulary.filter(item => {
    const term = typeof item === 'string' ? item : item.term;
    const definition = typeof item === 'string' ? '' : item.definition || '';
    const query = searchQuery.toLowerCase();
    return term.toLowerCase().includes(query) ||
           definition.toLowerCase().includes(query);
  });

  // Toggle term expansion
  const toggleTerm = useCallback((index) => {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Read term aloud
  const readAloud = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Create flashcard from term
  const createFlashcard = useCallback((term, definition) => {
    if (setSelection) {
      setSelection({
        text: `${term}: ${definition}`,
        lessonId,
      });
    }
    if (handleCreateFlashcard) {
      handleCreateFlashcard();
    }
  }, [setSelection, handleCreateFlashcard, lessonId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-white flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-nanobanana-blue to-blue-500 text-white flex items-center justify-between border-b-4 border-black">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-bold font-comic">Key Words</h3>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                {vocabulary.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl border-2 border-transparent focus:border-nanobanana-blue focus:bg-white outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Vocabulary list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredVocabulary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">
                  {searchQuery ? 'No words found' : 'No vocabulary yet'}
                </p>
              </div>
            ) : (
              filteredVocabulary.map((item, index) => (
                <VocabularyItem
                  key={index}
                  item={item}
                  index={index}
                  isExpanded={expandedTerms.has(index)}
                  onToggle={() => toggleTerm(index)}
                  onReadAloud={readAloud}
                  onCreateFlashcard={createFlashcard}
                />
              ))
            )}
          </div>

          {/* Quick actions footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                // Read all terms aloud
                const text = vocabulary
                  .map(item => typeof item === 'string' ? item : item.term)
                  .join('. ');
                readAloud(text);
              }}
              className="w-full py-2 px-4 bg-nanobanana-blue text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Read All Words
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Individual Vocabulary Item
 */
const VocabularyItem = ({
  item,
  index,
  isExpanded,
  onToggle,
  onReadAloud,
  onCreateFlashcard,
}) => {
  const term = typeof item === 'string' ? item : item.term;
  const definition = typeof item === 'string' ? null : item.definition;
  const example = typeof item === 'string' ? null : item.example;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        rounded-xl border-2 overflow-hidden transition-all
        ${isExpanded
          ? 'border-nanobanana-blue bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* Term header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-nanobanana-blue/10 text-nanobanana-blue rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span className="font-bold text-gray-800">{term}</span>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 pb-3 pt-1 border-t border-blue-100">
              {/* Definition */}
              {definition && (
                <p className="text-gray-600 text-sm mb-2">
                  {definition}
                </p>
              )}

              {/* Example */}
              {example && (
                <p className="text-gray-500 text-xs italic mb-3 bg-white/50 p-2 rounded-lg">
                  Example: {example}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReadAloud(definition ? `${term}. ${definition}` : term)}
                  className="flex-1 py-1.5 px-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-nanobanana-blue transition-colors"
                >
                  <Volume2 className="w-3 h-3" />
                  Listen
                </motion.button>

                {definition && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCreateFlashcard(term, definition)}
                    className="flex-1 py-1.5 px-2 bg-nanobanana-yellow border-2 border-black rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  >
                    <Sparkles className="w-3 h-3" />
                    Flashcard
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VocabularyPanel;
