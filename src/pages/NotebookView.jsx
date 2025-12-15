import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Search,
  Pin,
  Trash2,
  Edit3,
  Calendar,
  X,
  Sparkles,
  Star,
  Heart,
  Bookmark,
  PenTool,
  Palette,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { useNotebookContext } from '../context/NotebookContext';
import { useAuth } from '../context/AuthContext';
import { NoteEditor, NotebookCover, CoverCustomizer } from '../components/Notebook';
import { SUBJECT_CONFIG, NOTEBOOK_MESSAGES, DEFAULT_COVER, COVER_COLORS } from '../constants/notebookConstants';

// Decorative stickers for the notebook
const DECORATIVE_STICKERS = ['⭐', '🌟', '💫', '✨', '🎨', '📚', '🔬', '🎵', '🌈', '🚀'];

// Local storage key for cover settings
const COVER_SETTINGS_KEY = 'notebook_cover_settings';

// Get cover settings from localStorage
const getCoverSettings = (childId) => {
  try {
    const stored = localStorage.getItem(`${COVER_SETTINGS_KEY}_${childId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse cover settings:', e);
  }
  return DEFAULT_COVER;
};

// Save cover settings to localStorage
const saveCoverSettings = (childId, settings) => {
  try {
    localStorage.setItem(`${COVER_SETTINGS_KEY}_${childId}`, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save cover settings:', e);
  }
};

// Paper texture pattern
const PaperTexture = () => (
  <div
    className="absolute inset-0 opacity-[0.03] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Spiral binding decoration
const SpiralBinding = () => (
  <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-center gap-4 z-10">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-gray-500 shadow-inner ml-3"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
        style={{
          boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    ))}
  </div>
);

// Subject tab component
const SubjectTab = ({ subject, isActive, onClick, index, totalTabs }) => {
  const config = subject === 'all'
    ? { emoji: '📚', label: 'All Notes', color: '#1a1a1a' }
    : SUBJECT_CONFIG[subject] || { emoji: '📝', label: subject, color: '#94a3b8' };

  const tabColors = [
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-lime-400 to-green-500',
  ];

  const colorClass = subject === 'all' ? 'from-gray-700 to-gray-900' : tabColors[index % tabColors.length];

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-5 py-3 rounded-t-2xl font-bold text-sm transition-all flex items-center gap-2 ${
        isActive
          ? 'text-white z-20 -mb-1'
          : 'text-gray-600 hover:text-gray-900 bg-white/50 hover:bg-white/80 z-10'
      }`}
      style={{
        transformOrigin: 'bottom',
        ...(isActive && {
          background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
        }),
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: isActive ? 0 : -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          className={`absolute inset-0 rounded-t-2xl bg-gradient-to-br ${colorClass}`}
          layoutId="activeTab"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}
        />
      )}
      <span className="relative z-10 text-lg">{config.emoji}</span>
      <span className="relative z-10 hidden sm:inline">{config.label}</span>
    </motion.button>
  );
};

// Note card component with sticky note aesthetic
const NoteCard = ({ note, isSelected, onClick, index }) => {
  const subjectConfig = SUBJECT_CONFIG[note.subject] || SUBJECT_CONFIG.OTHER;

  // Slight random rotation for organic feel
  const rotation = ((index % 5) - 2) * 0.5;

  // Color variations for sticky notes
  const stickyColors = [
    { bg: 'from-yellow-100 to-amber-50', border: 'border-amber-200' },
    { bg: 'from-pink-100 to-rose-50', border: 'border-rose-200' },
    { bg: 'from-blue-100 to-sky-50', border: 'border-sky-200' },
    { bg: 'from-green-100 to-emerald-50', border: 'border-emerald-200' },
    { bg: 'from-purple-100 to-violet-50', border: 'border-violet-200' },
  ];

  const stickyStyle = stickyColors[index % stickyColors.length];

  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer group`}
      initial={{ opacity: 0, y: 30, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.8, rotate: rotation * 2 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{
        y: -8,
        rotate: 0,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300 }
      }}
      style={{ transformOrigin: 'center top' }}
    >
      {/* Tape decoration */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-gradient-to-b from-amber-200/80 to-amber-300/60 rotate-[-2deg] z-10"
        style={{
          clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />

      {/* Pin indicator */}
      {note.isPinned && (
        <motion.div
          className="absolute -top-2 -right-2 z-20"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg border-2 border-red-300">
            <Pin size={14} className="text-white" />
          </div>
        </motion.div>
      )}

      {/* Card content */}
      <div
        className={`relative p-5 rounded-lg bg-gradient-to-br ${stickyStyle.bg} ${stickyStyle.border} border-2 overflow-hidden ${
          isSelected ? 'ring-4 ring-amber-400 ring-offset-2' : ''
        }`}
        style={{
          boxShadow: isSelected
            ? '8px 8px 0px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.1)'
            : '4px 4px 0px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.05)',
          minHeight: '180px',
        }}
      >
        {/* Paper lines decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-px bg-blue-300 w-full" style={{ marginTop: `${24 + i * 24}px` }} />
          ))}
        </div>

        {/* Subject badge */}
        <motion.div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm"
          style={{ backgroundColor: subjectConfig.color }}
          whileHover={{ scale: 1.05 }}
        >
          <span>{subjectConfig.emoji}</span>
          <span className="text-gray-800">{subjectConfig.label}</span>
        </motion.div>

        {/* Title */}
        <h3
          className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 relative z-10"
          style={{ fontFamily: '"Comic Neue", cursive' }}
        >
          {note.title}
        </h3>

        {/* Content preview */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 relative z-10">
          {note.content.replace(/<[^>]*>/g, '')}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto relative z-10">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {note.lesson && (
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <Book size={12} />
              {note.lesson.title}
            </span>
          )}
        </div>

        {/* Hover decorations */}
        <motion.div
          className="absolute top-2 right-2 text-2xl opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          {DECORATIVE_STICKERS[index % DECORATIVE_STICKERS.length]}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Empty state component
const EmptyState = ({ searchQuery, activeSubject }) => (
  <motion.div
    className="text-center py-16 px-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <motion.div
      className="relative w-32 h-32 mx-auto mb-6"
      animate={{
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl rotate-3 border-4 border-black" />
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-2xl -rotate-2 border-4 border-black flex items-center justify-center">
        <span className="text-5xl">📓</span>
      </div>
      <motion.div
        className="absolute -top-4 -right-4 text-3xl"
        animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✨
      </motion.div>
    </motion.div>

    <h3
      className="text-2xl font-bold mb-3 text-gray-800"
      style={{ fontFamily: '"Comic Neue", cursive' }}
    >
      {searchQuery
        ? 'No matching notes found!'
        : activeSubject !== 'all'
          ? `No ${SUBJECT_CONFIG[activeSubject]?.label || activeSubject} notes yet!`
          : 'Your notebook is empty!'}
    </h3>

    <p className="text-gray-600 max-w-md mx-auto mb-6">
      {searchQuery
        ? 'Try a different search term'
        : 'Start taking notes while studying your lessons. Highlight any text and click "Add to Notes" to save it here!'}
    </p>

    <div className="flex justify-center gap-3">
      {['📝', '🎨', '💡', '🌟', '📚'].map((emoji, i) => (
        <motion.span
          key={i}
          className="text-2xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ delay: i * 0.1, duration: 1, repeat: Infinity }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  </motion.div>
);

// Main NotebookView component
const NotebookView = () => {
  const navigate = useNavigate();
  const { currentProfile } = useAuth();
  const {
    notes,
    notesBySubject,
    isLoading,
    isInitialized,
    activeSubject,
    setActiveSubject,
    getFilteredNotes,
    getAvailableSubjects,
    deleteNote,
    updateNote,
    toggleNotePin,
    fetchNotes,
  } = useNotebookContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Notebook cover state
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [showCoverCustomizer, setShowCoverCustomizer] = useState(false);
  const [coverSettings, setCoverSettings] = useState(DEFAULT_COVER);

  const childName = currentProfile?.displayName || 'My';
  const ageGroup = currentProfile?.ageGroup || 'OLDER';
  const avatarUrl = currentProfile?.avatarUrl;
  const childId = currentProfile?.id;

  // Load cover settings from localStorage
  useEffect(() => {
    if (childId) {
      const saved = getCoverSettings(childId);
      setCoverSettings(saved);
    }
  }, [childId]);

  // Fetch notes on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchNotes();
    }
  }, [isInitialized, fetchNotes]);

  // Get filtered and searched notes
  const filteredNotes = getFilteredNotes().filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // Get available subjects
  const subjects = ['all', ...getAvailableSubjects()];

  // Handle note click
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  // Handle edit mode
  const handleStartEdit = () => {
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    await updateNote(selectedNote.id, {
      title: editTitle.trim(),
      content: editContent,
    });

    setIsEditing(false);
    const updatedNote = notes.find((n) => n.id === selectedNote.id);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  // Handle delete
  const handleDelete = async (noteId) => {
    await deleteNote(noteId);
    setDeleteConfirm(null);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  // Handle pin toggle
  const handleTogglePin = async (noteId) => {
    await toggleNotePin(noteId);
  };

  // Handle cover click
  const handleCoverClick = () => {
    if (!isNotebookOpen) {
      setIsNotebookOpen(true);
    }
  };

  // Handle cover settings change
  const handleCoverSettingsChange = useCallback((newSettings) => {
    setCoverSettings(newSettings);
    if (childId) {
      saveCoverSettings(childId, newSettings);
    }
  }, [childId]);

  // Get avatar emoji
  const getAvatarEmoji = () => {
    if (avatarUrl && avatarUrl.startsWith('avatar_')) {
      const avatarMap = {
        avatar_1: '🐱', avatar_2: '🐶', avatar_3: '🦉', avatar_4: '🦁',
        avatar_5: '🐼', avatar_6: '🐰', avatar_7: '🐧', avatar_8: '🐘',
      };
      return avatarMap[avatarUrl] || '📚';
    }
    return '📚';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100" />

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${5 + (i * 12)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {DECORATIVE_STICKERS[i]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header - always visible */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="p-3 rounded-2xl bg-white/80 backdrop-blur border-3 border-black hover:bg-white transition-colors"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/learn')}
            >
              <ArrowLeft size={24} />
            </motion.button>

            <div className="flex items-center gap-3">
              {/* Avatar */}
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 border-3 border-black flex items-center justify-center text-2xl"
                style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                {getAvatarEmoji()}
              </motion.div>

              <div>
                <motion.h1
                  className="text-3xl md:text-4xl font-black text-gray-900"
                  style={{ fontFamily: '"Comic Neue", cursive' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {childName}'s Notebook
                </motion.h1>
                <motion.p
                  className="text-gray-600 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles size={16} className="text-amber-500" />
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
                </motion.p>
              </div>
            </div>
          </div>

          {/* Search - only show when notebook is open */}
          {isNotebookOpen && (
            <motion.div
              className="relative hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search your notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-5 py-3 w-72 rounded-2xl border-3 border-black bg-white/90 backdrop-blur focus:outline-none focus:ring-4 focus:ring-amber-300 transition-shadow"
                style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Notebook Cover & Content */}
        <AnimatePresence mode="wait">
          {!isNotebookOpen ? (
            /* Closed Notebook Cover View */
            <motion.div
              key="closed-cover"
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Cover Customizer Toggle */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-3 border-black rounded-full hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                  onClick={() => setShowCoverCustomizer(!showCoverCustomizer)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Palette size={20} className="text-purple-600" />
                  <span className="font-bold">Customize Cover</span>
                  {showCoverCustomizer ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </motion.button>
              </motion.div>

              {/* Cover Customizer Panel */}
              <AnimatePresence>
                {showCoverCustomizer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-8 w-full max-w-md"
                  >
                    <div className="p-4 bg-white rounded-2xl border-3 border-black" style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
                      <CoverCustomizer
                        color={coverSettings.color}
                        pattern={coverSettings.pattern}
                        stickers={coverSettings.stickers}
                        onColorChange={(color) => handleCoverSettingsChange({ ...coverSettings, color })}
                        onPatternChange={(pattern) => handleCoverSettingsChange({ ...coverSettings, pattern })}
                        onStickersChange={(stickers) => handleCoverSettingsChange({ ...coverSettings, stickers })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Notebook Cover */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <NotebookCover
                  isOpen={false}
                  childName={childName}
                  avatarUrl={avatarUrl}
                  coverColor={coverSettings.color}
                  coverPattern={coverSettings.pattern}
                  coverStickers={coverSettings.stickers}
                  onClick={handleCoverClick}
                />
              </motion.div>

              {/* Hint text */}
              <motion.p
                className="mt-8 text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Click on the notebook to open it and see your notes! 📖
              </motion.p>
            </motion.div>
          ) : (
            /* Open Notebook - Notes View */
            <motion.div
              key="open-notebook"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              {/* Close button to return to cover */}
              <motion.button
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
                onClick={() => setIsNotebookOpen(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen size={18} />
                <span className="font-medium text-sm">Close Notebook</span>
              </motion.button>

              {/* Main notebook container */}
              <motion.div
                className="relative bg-white/95 backdrop-blur rounded-3xl border-4 border-black overflow-hidden"
                style={{
                  boxShadow: '8px 8px 0px rgba(0,0,0,1), 0 20px 60px rgba(0,0,0,0.15)',
                  minHeight: '70vh',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              >
                <PaperTexture />
                <SpiralBinding />

                {/* Subject tabs */}
                <div className="relative ml-12 pl-4 pt-4 flex gap-1 overflow-x-auto pb-0 border-b-4 border-black bg-gradient-to-b from-gray-100 to-transparent">
                  {subjects.map((subject, index) => (
                    <SubjectTab
                      key={subject}
                      subject={subject}
                      isActive={activeSubject === subject}
                      onClick={() => setActiveSubject(subject)}
                      index={index}
                      totalTabs={subjects.length}
                    />
                  ))}
                </div>

                {/* Content area */}
                <div className="ml-12 p-6 md:p-8">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        📓
                      </motion.div>
                      <p className="text-gray-600 font-medium">Loading your notes...</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <EmptyState searchQuery={searchQuery} activeSubject={activeSubject} />
                  ) : (
                    <div className="flex gap-8">
                      {/* Notes grid */}
                      <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          <AnimatePresence mode="popLayout">
                            {filteredNotes.map((note, index) => (
                              <NoteCard
                                key={note.id}
                                note={note}
                                isSelected={selectedNote?.id === note.id}
                                onClick={() => handleNoteClick(note)}
                                index={index}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Detail panel */}
                      <AnimatePresence>
                        {selectedNote && (
                          <motion.div
                            className="hidden xl:block w-96 flex-shrink-0"
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.95 }}
                          >
                            <div
                              className="sticky top-6 bg-gradient-to-br from-white to-amber-50 rounded-2xl border-4 border-black overflow-hidden"
                              style={{ boxShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                            >
                              {/* Header */}
                              <div className="p-4 border-b-3 border-black bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <PenTool size={20} className="text-amber-600" />
                                  <h3 className="font-bold text-gray-800">Note Details</h3>
                                </div>
                                <button
                                  className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                                  onClick={() => setSelectedNote(null)}
                                >
                                  <X size={18} />
                                </button>
                              </div>

                              {/* Content */}
                              <div className="p-5 max-h-[60vh] overflow-y-auto">
                                {isEditing ? (
                                  <div className="space-y-4">
                                    <NoteEditor
                                      initialTitle={editTitle}
                                      initialContent={editContent}
                                      ageGroup={ageGroup}
                                      onTitleChange={setEditTitle}
                                      onContentChange={setEditContent}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <motion.button
                                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold rounded-xl border-3 border-black"
                                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveEdit}
                                      >
                                        Save Changes
                                      </motion.button>
                                      <motion.button
                                        className="py-2.5 px-4 bg-gray-100 font-bold rounded-xl border-3 border-black"
                                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsEditing(false)}
                                      >
                                        Cancel
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Subject badge */}
                                    <div
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-4"
                                      style={{ backgroundColor: (SUBJECT_CONFIG[selectedNote.subject] || SUBJECT_CONFIG.OTHER).color }}
                                    >
                                      <span>{(SUBJECT_CONFIG[selectedNote.subject] || SUBJECT_CONFIG.OTHER).emoji}</span>
                                      <span>{(SUBJECT_CONFIG[selectedNote.subject] || SUBJECT_CONFIG.OTHER).label}</span>
                                    </div>

                                    {/* Title */}
                                    <h2
                                      className="text-xl font-bold mb-4 text-gray-800"
                                      style={{ fontFamily: '"Comic Neue", cursive' }}
                                    >
                                      {selectedNote.title}
                                    </h2>

                                    {/* Content */}
                                    <div
                                      className="prose prose-sm max-w-none mb-5 p-4 bg-yellow-50/50 rounded-xl border-2 border-amber-200"
                                      style={{ fontFamily: '"Comic Neue", cursive' }}
                                      dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                                    />

                                    {/* Original text */}
                                    {selectedNote.originalText && (
                                      <div className="mb-5 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                          <Bookmark size={12} />
                                          Original highlight:
                                        </p>
                                        <p className="text-sm italic text-gray-600">"{selectedNote.originalText}"</p>
                                      </div>
                                    )}

                                    {/* Lesson info */}
                                    {selectedNote.lesson && (
                                      <div className="mb-5 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                                        <p className="text-xs text-gray-500 mb-1">From lesson:</p>
                                        <p className="font-medium flex items-center gap-2 text-gray-700">
                                          <Book size={16} className="text-purple-500" />
                                          {selectedNote.lesson.title}
                                        </p>
                                      </div>
                                    )}

                                    {/* Date */}
                                    <p className="text-sm text-gray-500 mb-5 flex items-center gap-2">
                                      <Calendar size={14} />
                                      {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                      <motion.button
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold rounded-xl border-2 border-black text-sm"
                                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartEdit}
                                      >
                                        <Edit3 size={16} />
                                        Edit
                                      </motion.button>
                                      <motion.button
                                        className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl border-2 border-black text-sm ${
                                          selectedNote.isPinned
                                            ? 'bg-gradient-to-r from-amber-300 to-yellow-400'
                                            : 'bg-white'
                                        }`}
                                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTogglePin(selectedNote.id)}
                                      >
                                        <Pin size={16} />
                                        {selectedNote.isPinned ? 'Pinned!' : 'Pin'}
                                      </motion.button>
                                      <motion.button
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-400 to-rose-500 text-white font-bold rounded-xl border-2 border-black text-sm"
                                        style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setDeleteConfirm(selectedNote.id)}
                                      >
                                        <Trash2 size={16} />
                                        Delete
                                      </motion.button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-3xl border-4 border-black max-w-sm w-full"
              style={{ boxShadow: '8px 8px 0px rgba(0,0,0,1)' }}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center border-4 border-black"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Trash2 size={32} className="text-red-500" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Comic Neue", cursive' }}>
                  Delete this note?
                </h3>
                <p className="text-gray-600">
                  This cannot be undone. Your note will be gone forever!
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-3 px-4 bg-gray-100 font-bold rounded-xl border-3 border-black"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Keep it!
                </motion.button>
                <motion.button
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-400 to-rose-500 text-white font-bold rounded-xl border-3 border-black"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotebookView;
