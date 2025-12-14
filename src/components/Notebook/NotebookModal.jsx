import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Palette, PenTool, BookOpen, Star, ChevronDown, ChevronUp } from 'lucide-react';
import NotebookCover from './NotebookCover';
import NoteEditor from './NoteEditor';
import CoverCustomizer from './CoverCustomizer';
import { useNotebookContext } from '../../context/NotebookContext';
import { useAuth } from '../../context/AuthContext';
import { useGamificationContext } from '../../context/GamificationContext';
import { NOTEBOOK_MESSAGES, DEFAULT_COVER, SUBJECT_CONFIG } from '../../constants/notebookConstants';

/**
 * NotebookModal - Main modal for creating/editing notes
 * Features animated notebook cover and rich text editor
 */
const NotebookModal = () => {
  const {
    isNotebookModalOpen,
    pendingNoteData,
    closeNotebookModal,
    createNote,
    isSaving,
  } = useNotebookContext();

  const { currentProfile } = useAuth();
  const { earnXP } = useGamificationContext();

  const [isOpened, setIsOpened] = useState(false);
  const [showCoverCustomizer, setShowCoverCustomizer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverSettings, setCoverSettings] = useState(DEFAULT_COVER);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get child info
  const childName = currentProfile?.displayName || 'My';
  const avatarUrl = currentProfile?.avatarUrl;
  const ageGroup = currentProfile?.ageGroup || 'OLDER';

  // Initialize with pending data when modal opens
  useEffect(() => {
    if (isNotebookModalOpen && pendingNoteData) {
      setContent(pendingNoteData.originalText || '');
      // Auto-generate title from first few words of text
      const words = (pendingNoteData.originalText || '').split(' ').slice(0, 5).join(' ');
      setTitle(words.length > 30 ? words.substring(0, 30) + '...' : words);
    }
  }, [isNotebookModalOpen, pendingNoteData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isNotebookModalOpen) {
      setIsOpened(false);
      setShowCoverCustomizer(false);
      setTitle('');
      setContent('');
      setCoverSettings(DEFAULT_COVER);
      setSaveSuccess(false);
      setErrorMessage('');
    }
  }, [isNotebookModalOpen]);

  // Open cover after delay
  useEffect(() => {
    if (isNotebookModalOpen && !isOpened) {
      const timer = setTimeout(() => setIsOpened(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isNotebookModalOpen]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setErrorMessage('Please add a title to your note');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please add some content to your note');
      return;
    }

    setErrorMessage('');

    const noteData = {
      title: title.trim(),
      content,
      originalText: pendingNoteData?.originalText,
      lessonId: pendingNoteData?.lessonId,
      subject: pendingNoteData?.subject,
      contentFormat: 'RICH_TEXT',
      coverColor: coverSettings.color,
      coverStickers: coverSettings.stickers,
      coverPattern: coverSettings.pattern,
    };

    const result = await createNote(noteData);

    if (result.success) {
      setSaveSuccess(true);
      // Award XP and show celebration
      if (result.xpAwarded && earnXP) {
        earnXP(result.xpAwarded, 'Created a note');
      }
      // Close after celebration
      setTimeout(() => {
        closeNotebookModal();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Failed to save note');
    }
  }, [title, content, coverSettings, pendingNoteData, createNote, earnXP, closeNotebookModal]);

  // Handle cover click to toggle open
  const handleCoverClick = () => {
    if (!isOpened) {
      setIsOpened(true);
    }
  };

  // Get subject badge
  const getSubjectBadge = () => {
    const subject = pendingNoteData?.subject;
    if (!subject) return null;
    const config = SUBJECT_CONFIG[subject];
    if (!config) return null;
    return (
      <motion.span
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border-3 border-black"
        style={{
          backgroundColor: config.color,
          boxShadow: '2px 2px 0px rgba(0,0,0,1)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <span className="text-lg">{config.emoji}</span>
        {config.label}
      </motion.span>
    );
  };

  // Get random success message
  const getSuccessMessage = () => {
    const messages = NOTEBOOK_MESSAGES.created;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (!isNotebookModalOpen) return null;

  return (
    <AnimatePresence>
      {isNotebookModalOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with subtle pattern */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={closeNotebookModal}
          >
            {/* Decorative floating elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl opacity-10"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {['📚', '✏️', '📝', '⭐', '💡', '🎨'][i]}
              </motion.div>
            ))}
          </motion.div>

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-5xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              className="absolute -top-3 -right-3 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-4 border-black flex items-center justify-center text-white"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeNotebookModal}
            >
              <X size={28} strokeWidth={3} />
            </motion.button>

            {/* Main container */}
            <div className="flex gap-8 items-start justify-center">
              {/* Notebook cover (always visible) */}
              <motion.div
                className="flex-shrink-0"
                initial={{ x: -100, opacity: 0, rotateY: 20 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              >
                <NotebookCover
                  isOpen={isOpened}
                  childName={childName}
                  avatarUrl={avatarUrl}
                  coverColor={coverSettings.color}
                  coverPattern={coverSettings.pattern}
                  coverStickers={coverSettings.stickers}
                  onClick={handleCoverClick}
                />
              </motion.div>

              {/* Editor panel (appears when opened) */}
              <AnimatePresence>
                {isOpened && (
                  <motion.div
                    className="flex-1 max-w-xl"
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  >
                    {/* Success state */}
                    {saveSuccess ? (
                      <motion.div
                        className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-4 border-black p-10 text-center"
                        style={{ boxShadow: '8px 8px 0px rgba(0,0,0,1)' }}
                        initial={{ scale: 0.8, rotateZ: -5 }}
                        animate={{ scale: 1, rotateZ: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        {/* Confetti effect */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-2xl"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                            }}
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                              scale: [0, 1, 0],
                              rotate: [0, 360],
                              y: [0, -50, 50],
                            }}
                            transition={{
                              delay: i * 0.1,
                              duration: 1,
                            }}
                          >
                            {['⭐', '✨', '🎉', '💫', '🌟', '💖'][i % 6]}
                          </motion.div>
                        ))}

                        <motion.div
                          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-black flex items-center justify-center"
                          style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                          <Check size={50} className="text-white" strokeWidth={3} />
                        </motion.div>

                        <motion.h3
                          className="text-3xl font-black mb-3"
                          style={{ fontFamily: '"Comic Neue", cursive' }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          Note Saved! 📓
                        </motion.h3>

                        <motion.p
                          className="text-xl text-gray-600 mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {getSuccessMessage()}
                        </motion.p>

                        <motion.div
                          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full border-3 border-black"
                          style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: 'spring' }}
                        >
                          <Sparkles size={24} className="text-amber-700" />
                          <span className="text-xl font-black">+5 XP</span>
                        </motion.div>
                      </motion.div>
                    ) : (
                      /* Editor form */
                      <div
                        className="relative bg-gradient-to-br from-white via-white to-amber-50 rounded-3xl border-4 border-black overflow-hidden max-h-[calc(100vh-120px)] flex flex-col"
                        style={{ boxShadow: '8px 8px 0px rgba(0,0,0,1)' }}
                      >
                        {/* Decorative header bar */}
                        <div
                          className="relative px-6 py-4 border-b-4 border-black flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${coverSettings.color}88 0%, ${coverSettings.color}44 100%)`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="w-10 h-10 rounded-full bg-white border-3 border-black flex items-center justify-center"
                                style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <PenTool size={20} className="text-gray-700" />
                              </motion.div>
                              <h2
                                className="text-2xl font-black"
                                style={{ fontFamily: '"Comic Neue", cursive' }}
                              >
                                Add to Notebook
                              </h2>
                            </div>
                            {getSubjectBadge()}
                          </div>

                          {/* Lesson info */}
                          {pendingNoteData?.lessonTitle && (
                            <motion.div
                              className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-full px-4 py-1.5 w-fit"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                            >
                              <BookOpen size={14} />
                              <span>From:</span>
                              <span className="font-bold">{pendingNoteData.lessonTitle}</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Content area */}
                        <div className="p-6 overflow-y-auto flex-1">
                          {/* Cover customizer toggle */}
                          <motion.button
                            type="button"
                            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-black rounded-full hover:bg-gray-50 transition-colors"
                            style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
                            onClick={() => setShowCoverCustomizer(!showCoverCustomizer)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Palette size={18} className="text-purple-600" />
                            <span className="font-bold text-sm">Customize Cover</span>
                            {showCoverCustomizer ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </motion.button>

                          {/* Cover customizer */}
                          <AnimatePresence>
                            {showCoverCustomizer && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mb-4"
                              >
                                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                                  <CoverCustomizer
                                    color={coverSettings.color}
                                    pattern={coverSettings.pattern}
                                    stickers={coverSettings.stickers}
                                    onColorChange={(color) => setCoverSettings((s) => ({ ...s, color }))}
                                    onPatternChange={(pattern) => setCoverSettings((s) => ({ ...s, pattern }))}
                                    onStickersChange={(stickers) => setCoverSettings((s) => ({ ...s, stickers }))}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Editor */}
                          <div className="bg-white rounded-2xl border-3 border-gray-200 overflow-hidden">
                            <NoteEditor
                              initialTitle={title}
                              initialContent={content}
                              ageGroup={ageGroup}
                              onTitleChange={setTitle}
                              onContentChange={setContent}
                              placeholder="Write your thoughts about this..."
                            />
                          </div>

                          {/* Error message */}
                          <AnimatePresence>
                            {errorMessage && (
                              <motion.div
                                className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <span className="text-red-500 text-lg">⚠️</span>
                                <span className="text-red-600 font-medium">{errorMessage}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Save button */}
                          <motion.button
                            className="w-full mt-5 py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl rounded-2xl border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            style={{ boxShadow: '5px 5px 0px rgba(0,0,0,1)' }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{
                              scale: 0.98,
                              boxShadow: '2px 2px 0px rgba(0,0,0,1)',
                              y: 2,
                            }}
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                  className="text-2xl"
                                >
                                  ⏳
                                </motion.span>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={24} />
                                <span>Save to Notebook</span>
                                <span className="text-green-200">+5 XP</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotebookModal;
