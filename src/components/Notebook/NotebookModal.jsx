import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Palette } from 'lucide-react';
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
      <span
        className="px-3 py-1 rounded-full text-sm font-bold border-2 border-black"
        style={{ backgroundColor: config.color }}
      >
        {config.emoji} {config.label}
      </span>
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeNotebookModal}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              className="absolute -top-4 -right-4 z-20 w-12 h-12 rounded-full bg-red-500 border-4 border-black flex items-center justify-center text-white"
              style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeNotebookModal}
            >
              <X size={24} />
            </motion.button>

            {/* Main container */}
            <div className="flex gap-6 items-start justify-center">
              {/* Notebook cover (always visible) */}
              <motion.div
                className="flex-shrink-0"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
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
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Success state */}
                    {saveSuccess ? (
                      <motion.div
                        className="bg-white rounded-2xl border-4 border-black p-8 text-center"
                        style={{ boxShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <motion.div
                          className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 border-4 border-black flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <Check size={40} className="text-white" />
                        </motion.div>
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ fontFamily: '"Comic Neue", cursive' }}
                        >
                          Note Saved!
                        </h3>
                        <p className="text-lg text-gray-600">{getSuccessMessage()}</p>
                        <motion.div
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 rounded-full border-2 border-black"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Sparkles size={18} />
                          <span className="font-bold">+5 XP</span>
                        </motion.div>
                      </motion.div>
                    ) : (
                      /* Editor form */
                      <div
                        className="bg-white rounded-2xl border-4 border-black p-6"
                        style={{ boxShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h2
                            className="text-xl font-bold"
                            style={{ fontFamily: '"Comic Neue", cursive' }}
                          >
                            Add to Your Notebook
                          </h2>
                          {getSubjectBadge()}
                        </div>

                        {/* Lesson info */}
                        {pendingNoteData?.lessonTitle && (
                          <p className="text-sm text-gray-500 mb-4">
                            From: <span className="font-medium">{pendingNoteData.lessonTitle}</span>
                          </p>
                        )}

                        {/* Cover customizer toggle */}
                        <button
                          type="button"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
                          onClick={() => setShowCoverCustomizer(!showCoverCustomizer)}
                        >
                          <Palette size={16} />
                          <span>{showCoverCustomizer ? 'Hide' : 'Customize'} cover</span>
                        </button>

                        {/* Cover customizer */}
                        <AnimatePresence>
                          {showCoverCustomizer && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-4"
                            >
                              <CoverCustomizer
                                color={coverSettings.color}
                                pattern={coverSettings.pattern}
                                stickers={coverSettings.stickers}
                                onColorChange={(color) => setCoverSettings((s) => ({ ...s, color }))}
                                onPatternChange={(pattern) => setCoverSettings((s) => ({ ...s, pattern }))}
                                onStickersChange={(stickers) => setCoverSettings((s) => ({ ...s, stickers }))}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Editor */}
                        <NoteEditor
                          initialTitle={title}
                          initialContent={content}
                          ageGroup={ageGroup}
                          onTitleChange={setTitle}
                          onContentChange={setContent}
                          placeholder="Write your thoughts about this..."
                        />

                        {/* Error message */}
                        {errorMessage && (
                          <motion.p
                            className="text-red-500 text-sm mt-3"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errorMessage}
                          </motion.p>
                        )}

                        {/* Save button */}
                        <motion.button
                          className="w-full mt-4 py-3 px-6 bg-green-500 text-white font-bold text-lg rounded-xl border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98, boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              >
                                ⏳
                              </motion.span>
                              Saving...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Sparkles size={20} />
                              Save to Notebook
                            </span>
                          )}
                        </motion.button>
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
