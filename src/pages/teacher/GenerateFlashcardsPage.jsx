import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  ArrowLeft,
  Layers,
  Sparkles,
  Zap,
  Check,
  Loader2,
  Upload,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Save,
  RefreshCw,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Tag,
} from 'lucide-react';

// Jeffrey Avatar
const JeffreyAvatar = ({ size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-plum/20 bg-teacher-paper`}>
      <img
        src="/assets/images/jeffrey-avatar.png"
        alt="Jeffrey"
        className={`w-full h-full object-cover ${animate ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

const GRADE_LEVELS = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
];

const CARD_COUNT_OPTIONS = [
  { value: 10, label: '10 cards', description: 'Quick review' },
  { value: 15, label: '15 cards', description: 'Standard deck' },
  { value: 20, label: '20 cards', description: 'Comprehensive' },
  { value: 30, label: '30 cards', description: 'Deep dive' },
];

// Flashcard Preview Component
const FlashcardPreview = ({ card, index, showBack, onFlip }) => {
  return (
    <motion.div
      className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
      onClick={onFlip}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-teacher-plum to-teacher-plumLight p-6 flex flex-col justify-center items-center text-white backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="absolute top-3 left-3 text-xs font-medium text-white/60">
            #{index + 1}
          </span>
          <p className="text-center font-medium text-lg leading-relaxed">
            {card.front}
          </p>
          {card.category && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
              <Tag className="w-3 h-3" />
              {card.category}
            </span>
          )}
          <span className="absolute bottom-3 right-3 text-xs text-white/50">
            Tap to flip
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl bg-white border-2 border-teacher-plum/20 p-6 flex flex-col justify-center items-center backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="absolute top-3 left-3 text-xs font-medium text-teacher-plum/60">
            Answer
          </span>
          <p className="text-center text-teacher-ink font-medium text-lg leading-relaxed">
            {card.back}
          </p>
          {card.hint && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-teacher-gold/10 rounded-lg text-xs text-teacher-inkLight">
              <Lightbulb className="w-3 h-3 text-teacher-gold flex-shrink-0" />
              <span className="truncate">{card.hint}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const GenerateFlashcardsPage = () => {
  const navigate = useNavigate();
  const { teacher, quota, refreshQuota } = useTeacherAuth();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Input state
  const [inputMode, setInputMode] = useState('text'); // 'text', 'file', 'lesson'
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [existingLessons, setExistingLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Flashcard configuration
  const [flashcardConfig, setFlashcardConfig] = useState({
    title: '',
    cardCount: 15,
    includeHints: true,
    gradeLevel: '',
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Preview state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'grid'

  // Save state
  const [saving, setSaving] = useState(false);
  const [savedContentId, setSavedContentId] = useState(null);

  // Load existing lessons on mount
  useEffect(() => {
    loadExistingLessons();
  }, []);

  const loadExistingLessons = async () => {
    try {
      setLoadingLessons(true);
      const result = await teacherAPI.listContent({
        contentType: 'LESSON',
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      if (result.success) {
        setExistingLessons(result.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const formatCredits = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' &&
          file.type !== 'application/vnd.ms-powerpoint' &&
          file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        setError('Please select a PDF or PowerPoint file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Files must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone entirely
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf' &&
          file.type !== 'application/vnd.ms-powerpoint' &&
          file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        setError('Please drop a PDF or PowerPoint file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Files must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;

    setUploadingFile(true);
    setError(null);

    try {
      const result = await teacherAPI.analyzeDocument(selectedFile);
      if (result.success) {
        setContent(result.data.extractedText || '');
        setFlashcardConfig(prev => ({
          ...prev,
          title: `${result.data.suggestedTitle || selectedFile.name} Flashcards`,
          gradeLevel: result.data.detectedGradeLevel || prev.gradeLevel,
        }));
        setInputMode('text');
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze document');
    } finally {
      setUploadingFile(false);
    }
  };

  // Lesson selection
  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    // Extract content from lesson
    let lessonContent = '';
    if (lesson.lessonContent) {
      const lc = lesson.lessonContent;
      if (lc.sections) {
        lessonContent = lc.sections.map(s => `${s.title}\n${s.content}`).join('\n\n');
      }
      if (lc.summary) {
        lessonContent = lc.summary + '\n\n' + lessonContent;
      }
      if (lc.vocabulary) {
        lessonContent += '\n\nVocabulary:\n' + lc.vocabulary.map(v => `${v.term}: ${v.definition}`).join('\n');
      }
    }
    setContent(lessonContent || lesson.description || '');
    setFlashcardConfig(prev => ({
      ...prev,
      title: `${lesson.title} Flashcards`,
      gradeLevel: lesson.gradeLevel || prev.gradeLevel,
    }));
  };

  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!content || content.length < 50) {
      setError('Please provide at least 50 characters of content to generate flashcards from.');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedFlashcards(null);
    setCurrentCardIndex(0);
    setShowBack(false);

    try {
      // Create a temporary content item to generate flashcards from
      const createResult = await teacherAPI.createContent({
        title: flashcardConfig.title || 'Flashcard Source Content',
        description: 'Content for flashcard generation',
        contentType: 'LESSON',
        lessonContent: { rawContent: content },
        gradeLevel: flashcardConfig.gradeLevel || undefined,
      });

      if (!createResult.success) {
        throw new Error('Failed to create content for flashcard generation');
      }

      const contentId = createResult.data.id;

      // Generate flashcards
      const flashcardResult = await teacherAPI.generateFlashcards(contentId, {
        content: content,
        title: flashcardConfig.title || 'Generated Flashcards',
        cardCount: flashcardConfig.cardCount,
        includeHints: flashcardConfig.includeHints,
        gradeLevel: flashcardConfig.gradeLevel || undefined,
      }, true);

      if (flashcardResult.success) {
        setGeneratedFlashcards(flashcardResult.data);
        setSavedContentId(contentId);
        refreshQuota?.();
      } else {
        throw new Error(flashcardResult.error || 'Flashcard generation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  // Save flashcards as standalone content
  const handleSaveFlashcards = async () => {
    if (!generatedFlashcards) return;

    setSaving(true);
    try {
      const result = await teacherAPI.createContent({
        title: generatedFlashcards.title || flashcardConfig.title || 'Generated Flashcards',
        description: `Flashcard deck with ${generatedFlashcards.cards?.length || 0} cards`,
        contentType: 'FLASHCARD_DECK',
        flashcardContent: generatedFlashcards,
        gradeLevel: flashcardConfig.gradeLevel || undefined,
        status: 'PUBLISHED', // Mark as PUBLISHED since the flashcards are complete and ready to use
      });

      if (result.success) {
        navigate(`/teacher/content/${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to save flashcards');
      }
    } catch (err) {
      setError(err.message || 'Failed to save flashcards');
    } finally {
      setSaving(false);
    }
  };

  // Regenerate flashcards
  const handleRegenerateFlashcards = () => {
    setGeneratedFlashcards(null);
    handleGenerateFlashcards();
  };

  // Navigation
  const goToNextCard = () => {
    if (generatedFlashcards && currentCardIndex < generatedFlashcards.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowBack(false);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowBack(false);
    }
  };

  const shuffleCards = () => {
    if (generatedFlashcards) {
      const shuffled = [...generatedFlashcards.cards].sort(() => Math.random() - 0.5);
      setGeneratedFlashcards({ ...generatedFlashcards, cards: shuffled });
      setCurrentCardIndex(0);
      setShowBack(false);
    }
  };

  const headerActions = (
    <Link
      to="/teacher/dashboard"
      className="teacher-btn-secondary flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Dashboard</span>
    </Link>
  );

  return (
    <TeacherLayout
      title="Generate Flashcards"
      subtitle="Create AI-powered study cards from any content"
      headerActions={headerActions}
    >
      <div className="max-w-5xl mx-auto">
        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input & Configuration */}
          <div className="space-y-6">
            {/* Input Section */}
            <div className="teacher-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-plum to-teacher-plumLight flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-teacher-ink">Source Content</h2>
                  <p className="text-sm text-teacher-inkLight">What should the flashcards cover?</p>
                </div>
              </div>

              {/* Input Mode Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-teacher-paper rounded-xl">
                {[
                  { id: 'text', label: 'Paste Text', icon: FileText },
                  { id: 'file', label: 'Upload File', icon: Upload },
                  { id: 'lesson', label: 'From Lesson', icon: BookOpen },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setInputMode(id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === id
                        ? 'bg-white text-teacher-ink shadow-sm'
                        : 'text-teacher-inkLight hover:text-teacher-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Text Input */}
              {inputMode === 'text' && (
                <div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your lesson content, notes, vocabulary lists, or any text you want to create flashcards from..."
                    className="w-full h-48 px-4 py-3 border border-teacher-ink/10 rounded-xl text-sm resize-none focus:outline-none focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-teacher-inkLight">
                    <span>{content.length} characters</span>
                    <span className={content.length >= 50 ? 'text-teacher-sage' : 'text-teacher-coral'}>
                      {content.length >= 50 ? 'Ready to generate' : 'Minimum 50 characters'}
                    </span>
                  </div>
                </div>
              )}

              {/* File Upload */}
              {inputMode === 'file' && (
                <div>
                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-teacher-plum bg-teacher-plum/10 scale-[1.02]'
                          : 'border-teacher-ink/20 hover:border-teacher-plum hover:bg-teacher-plum/5'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf,.ppt,.pptx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all ${
                        isDragging ? 'bg-teacher-plum/20 scale-110' : 'bg-teacher-plum/10'
                      }`}>
                        <Upload className={`w-6 h-6 text-teacher-plum transition-transform ${isDragging ? 'scale-110' : ''}`} />
                      </div>
                      <p className="text-sm font-medium text-teacher-ink mb-1">
                        {isDragging ? 'Drop your file here!' : 'Drop your file here or click to browse'}
                      </p>
                      <p className="text-xs text-teacher-inkLight">
                        Supports PDF and PowerPoint (up to 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-teacher-paper rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-teacher-coral/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teacher-coral" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-teacher-ink truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-teacher-inkLight">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1.5 text-teacher-inkLight hover:text-teacher-coral hover:bg-teacher-coral/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleAnalyzeFile}
                        disabled={uploadingFile}
                        className="w-full py-2.5 px-4 bg-teacher-plum text-white font-medium rounded-xl hover:bg-teacher-plumLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                      >
                        {uploadingFile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Extract Content
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Selection */}
              {inputMode === 'lesson' && (
                <div>
                  {loadingLessons ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-teacher-plum animate-spin" />
                    </div>
                  ) : existingLessons.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-teacher-inkLight/50" />
                      <p className="text-sm text-teacher-inkLight mb-3">No lessons found</p>
                      <Link
                        to="/teacher/content/create"
                        className="text-sm text-teacher-chalk hover:underline"
                      >
                        Create your first lesson
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {existingLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                            selectedLesson?.id === lesson.id
                              ? 'border-teacher-plum bg-teacher-plum/5'
                              : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedLesson?.id === lesson.id
                                ? 'bg-teacher-plum text-white'
                                : 'bg-teacher-chalk/10 text-teacher-chalk'
                            }`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-teacher-ink text-sm truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-teacher-inkLight mt-0.5">
                                {lesson.subject && `${lesson.subject} • `}
                                {lesson.gradeLevel && `Grade ${lesson.gradeLevel} • `}
                                {new Date(lesson.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedLesson?.id === lesson.id && (
                              <Check className="w-5 h-5 text-teacher-plum flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flashcard Configuration */}
            <div className="teacher-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teacher-ink">Flashcard Settings</h3>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-teacher-plum/10 text-teacher-plum text-xs">
                  <Zap className="w-3 h-3" />
                  ~{formatCredits(flashcardConfig.cardCount * 100)} credits
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                  Deck Title
                </label>
                <input
                  type="text"
                  value={flashcardConfig.title}
                  onChange={(e) => setFlashcardConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter flashcard deck title..."
                  className="w-full px-3 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all"
                />
              </div>

              {/* Card Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-teacher-inkLight mb-2">
                  Number of Cards
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CARD_COUNT_OPTIONS.map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => setFlashcardConfig(prev => ({ ...prev, cardCount: value }))}
                      className={`text-center p-3 border rounded-xl transition-all ${
                        flashcardConfig.cardCount === value
                          ? 'border-teacher-plum bg-teacher-plum/5'
                          : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${
                        flashcardConfig.cardCount === value ? 'text-teacher-plum' : 'text-teacher-ink'
                      }`}>
                        {label}
                      </p>
                      <p className="text-xs text-teacher-inkLight mt-0.5">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Hints Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={flashcardConfig.includeHints}
                      onChange={(e) => setFlashcardConfig(prev => ({ ...prev, includeHints: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-teacher-ink/10 rounded-full peer peer-checked:bg-teacher-plum transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                  </div>
                  <div>
                    <p className="font-medium text-teacher-ink text-sm">Include Hints</p>
                    <p className="text-xs text-teacher-inkLight">Add helpful hints to each card</p>
                  </div>
                </label>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-teacher-inkLight hover:text-teacher-ink transition-colors mb-4"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Grade Level */}
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        Grade Level
                      </label>
                      <select
                        value={flashcardConfig.gradeLevel}
                        onChange={(e) => setFlashcardConfig(prev => ({ ...prev, gradeLevel: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all"
                      >
                        <option value="">Select grade level (optional)</option>
                        {GRADE_LEVELS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-start gap-2 text-teacher-coral text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateFlashcards}
                disabled={generating || content.length < 50}
                className="w-full mt-4 py-3 px-6 bg-gradient-to-r from-teacher-plum to-teacher-plumLight text-white font-semibold rounded-xl hover:shadow-teacher-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Flashcards
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div>
            <div className="teacher-card p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teacher-ink">Flashcard Preview</h3>
                {generatedFlashcards && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                      title={viewMode === 'carousel' ? 'Grid view' : 'Carousel view'}
                    >
                      {viewMode === 'carousel' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={shuffleCards}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                      title="Shuffle cards"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRegenerateFlashcards}
                      disabled={generating}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                )}
              </div>

              {!generatedFlashcards && !generating ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <JeffreyAvatar size="lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teacher-plum flex items-center justify-center">
                      <Layers className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-medium text-teacher-ink mb-2">Ready to Create Flashcards!</h4>
                  <p className="text-sm text-teacher-inkLight max-w-xs mx-auto">
                    Add your content on the left, configure your deck settings, and I'll generate study flashcards for your students.
                  </p>
                </div>
              ) : generating ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <JeffreyAvatar size="lg" animate />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teacher-plum flex items-center justify-center animate-pulse">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-medium text-teacher-ink mb-2">Creating Your Flashcards...</h4>
                  <p className="text-sm text-teacher-inkLight">
                    Generating {flashcardConfig.cardCount} cards{flashcardConfig.includeHints ? ' with hints' : ''}
                  </p>
                  <div className="mt-4 w-48 h-2 mx-auto bg-teacher-ink/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teacher-plum to-teacher-plumLight animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ) : viewMode === 'carousel' ? (
                <div className="space-y-4">
                  {/* Deck Header */}
                  <div className="p-4 bg-gradient-to-r from-teacher-plum/10 to-teacher-plumLight/10 rounded-xl">
                    <h4 className="font-semibold text-teacher-ink">{generatedFlashcards.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-teacher-inkLight">
                      <span>{generatedFlashcards.cards?.length || 0} cards</span>
                      {flashcardConfig.includeHints && (
                        <>
                          <span>•</span>
                          <span>With hints</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Carousel */}
                  <div className="relative">
                    {generatedFlashcards.cards && generatedFlashcards.cards.length > 0 && (
                      <FlashcardPreview
                        card={generatedFlashcards.cards[currentCardIndex]}
                        index={currentCardIndex}
                        showBack={showBack}
                        onFlip={() => setShowBack(!showBack)}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPrevCard}
                      disabled={currentCardIndex === 0}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-teacher-ink">
                        {currentCardIndex + 1} / {generatedFlashcards.cards?.length || 0}
                      </span>
                      <button
                        onClick={() => setShowBack(!showBack)}
                        className="px-3 py-1 text-xs font-medium text-teacher-plum bg-teacher-plum/10 rounded-full hover:bg-teacher-plum/20 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        Flip
                      </button>
                    </div>

                    <button
                      onClick={goToNextCard}
                      disabled={currentCardIndex >= (generatedFlashcards.cards?.length || 0) - 1}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-teacher-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teacher-plum to-teacher-plumLight transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / (generatedFlashcards.cards?.length || 1)) * 100}%` }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-teacher-ink/10">
                    <button
                      onClick={handleSaveFlashcards}
                      disabled={saving}
                      className="flex-1 py-2.5 px-4 bg-teacher-chalk text-white font-medium rounded-xl hover:bg-teacher-chalkLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Deck
                        </>
                      )}
                    </button>
                    {savedContentId && (
                      <Link
                        to={`/teacher/content/${savedContentId}`}
                        className="py-2.5 px-4 border border-teacher-ink/10 text-teacher-ink font-medium rounded-xl hover:bg-teacher-paper flex items-center justify-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                /* Grid View */
                <div className="space-y-4">
                  {/* Deck Header */}
                  <div className="p-4 bg-gradient-to-r from-teacher-plum/10 to-teacher-plumLight/10 rounded-xl">
                    <h4 className="font-semibold text-teacher-ink">{generatedFlashcards.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-teacher-inkLight">
                      <span>{generatedFlashcards.cards?.length || 0} cards</span>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                    {generatedFlashcards.cards?.map((card, index) => (
                      <div
                        key={card.id || index}
                        className="p-4 border border-teacher-ink/10 rounded-xl hover:border-teacher-plum/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teacher-plum/10 flex items-center justify-center flex-shrink-0 text-teacher-plum font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-teacher-ink mb-2">
                              {card.front}
                            </p>
                            <p className="text-sm text-teacher-inkLight bg-teacher-paper p-2 rounded-lg">
                              {card.back}
                            </p>
                            {card.hint && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-teacher-gold">
                                <Lightbulb className="w-3 h-3" />
                                <span>{card.hint}</span>
                              </div>
                            )}
                            {card.category && (
                              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-teacher-ink/5 rounded text-xs text-teacher-inkLight">
                                <Tag className="w-3 h-3" />
                                {card.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-teacher-ink/10">
                    <button
                      onClick={handleSaveFlashcards}
                      disabled={saving}
                      className="flex-1 py-2.5 px-4 bg-teacher-chalk text-white font-medium rounded-xl hover:bg-teacher-chalkLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Deck
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Credits Info */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-teacher-inkLight">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teacher-plum" />
            <span>Available: {formatCredits(quota?.tokensRemaining || 0)} credits</span>
          </div>
          <span>•</span>
          <span>Flashcard generation uses approximately 1-1.5K credits</span>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default GenerateFlashcardsPage;
