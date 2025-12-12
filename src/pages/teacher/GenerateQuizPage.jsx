import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  ArrowLeft,
  FileQuestion,
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
  Copy,
  Download,
  Save,
  RefreshCw,
  BookOpen,
  ClipboardList,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';

// Jeffrey Avatar
const JeffreyAvatar = ({ size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-gold/20 bg-teacher-paper`}>
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

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: ClipboardList },
  { value: 'true_false', label: 'True/False', icon: CheckCircle2 },
  { value: 'fill_blank', label: 'Fill in the Blank', icon: FileText },
  { value: 'short_answer', label: 'Short Answer', icon: HelpCircle },
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', description: 'Basic recall and understanding' },
  { value: 'medium', label: 'Medium', description: 'Application and analysis' },
  { value: 'hard', label: 'Hard', description: 'Synthesis and evaluation' },
  { value: 'mixed', label: 'Mixed', description: 'Variety of difficulty levels' },
];

const GenerateQuizPage = () => {
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

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    questionCount: 10,
    questionTypes: ['multiple_choice', 'true_false'],
    difficulty: 'mixed',
    gradeLevel: '',
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        setQuizConfig(prev => ({
          ...prev,
          title: `Quiz: ${result.data.suggestedTitle || selectedFile.name}`,
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
    }
    setContent(lessonContent || lesson.description || '');
    setQuizConfig(prev => ({
      ...prev,
      title: `Quiz: ${lesson.title}`,
      gradeLevel: lesson.gradeLevel || prev.gradeLevel,
    }));
  };

  // Question type toggle
  const toggleQuestionType = (type) => {
    setQuizConfig(prev => {
      const types = prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type];
      return { ...prev, questionTypes: types.length > 0 ? types : [type] };
    });
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!content || content.length < 50) {
      setError('Please provide at least 50 characters of content to generate a quiz from.');
      return;
    }

    if (quizConfig.questionTypes.length === 0) {
      setError('Please select at least one question type.');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedQuiz(null);

    try {
      // Create a temporary content item to generate quiz from
      const createResult = await teacherAPI.createContent({
        title: quizConfig.title || 'Quiz Source Content',
        description: 'Content for quiz generation',
        contentType: 'LESSON',
        lessonContent: { rawContent: content },
        gradeLevel: quizConfig.gradeLevel || undefined,
      });

      if (!createResult.success) {
        throw new Error('Failed to create content for quiz generation');
      }

      const contentId = createResult.data.id;

      // Generate quiz
      const quizResult = await teacherAPI.generateQuiz(contentId, {
        content: content,
        title: quizConfig.title || 'Generated Quiz',
        questionCount: quizConfig.questionCount,
        questionTypes: quizConfig.questionTypes,
        difficulty: quizConfig.difficulty,
        gradeLevel: quizConfig.gradeLevel || undefined,
      }, true);

      if (quizResult.success) {
        setGeneratedQuiz(quizResult.data);
        setSavedContentId(contentId);
        refreshQuota?.();
      } else {
        throw new Error(quizResult.error || 'Quiz generation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  // Save quiz as standalone content
  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return;

    setSaving(true);
    try {
      const result = await teacherAPI.createContent({
        title: generatedQuiz.title || quizConfig.title || 'Generated Quiz',
        description: `Quiz with ${generatedQuiz.questions?.length || 0} questions`,
        contentType: 'QUIZ',
        quizContent: generatedQuiz,
        gradeLevel: quizConfig.gradeLevel || undefined,
      });

      if (result.success) {
        navigate(`/teacher/content/${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to save quiz');
      }
    } catch (err) {
      setError(err.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  // Regenerate quiz
  const handleRegenerateQuiz = () => {
    setGeneratedQuiz(null);
    handleGenerateQuiz();
  };

  // Get question type icon
  const getQuestionIcon = (type) => {
    const config = QUESTION_TYPES.find(t => t.value === type);
    return config?.icon || HelpCircle;
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
      title="Generate Quiz"
      subtitle="Create AI-powered quizzes from any content"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-gold to-teacher-goldLight flex items-center justify-center">
                  <FileQuestion className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-teacher-ink">Source Content</h2>
                  <p className="text-sm text-teacher-inkLight">What should the quiz be based on?</p>
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
                    placeholder="Paste your lesson content, notes, or any text you want to create a quiz from..."
                    className="w-full h-48 px-4 py-3 border border-teacher-ink/10 rounded-xl text-sm resize-none focus:outline-none focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all"
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
                          ? 'border-teacher-gold bg-teacher-gold/10 scale-[1.02]'
                          : 'border-teacher-ink/20 hover:border-teacher-gold hover:bg-teacher-gold/5'
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
                        isDragging ? 'bg-teacher-gold/20 scale-110' : 'bg-teacher-gold/10'
                      }`}>
                        <Upload className={`w-6 h-6 text-teacher-gold transition-transform ${isDragging ? 'scale-110' : ''}`} />
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
                        className="w-full py-2.5 px-4 bg-teacher-gold text-white font-medium rounded-xl hover:bg-teacher-goldLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
                      <Loader2 className="w-6 h-6 text-teacher-gold animate-spin" />
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
                              ? 'border-teacher-gold bg-teacher-gold/5'
                              : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedLesson?.id === lesson.id
                                ? 'bg-teacher-gold text-white'
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
                              <Check className="w-5 h-5 text-teacher-gold flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quiz Configuration */}
            <div className="teacher-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teacher-ink">Quiz Settings</h3>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-teacher-gold/10 text-teacher-gold text-xs">
                  <Zap className="w-3 h-3" />
                  ~{formatCredits(quizConfig.questionCount * 150)} credits
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizConfig.title}
                  onChange={(e) => setQuizConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title..."
                  className="w-full px-3 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all"
                />
              </div>

              {/* Question Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                  Number of Questions: <span className="text-teacher-ink font-semibold">{quizConfig.questionCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={quizConfig.questionCount}
                  onChange={(e) => setQuizConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-teacher-ink/10 rounded-lg appearance-none cursor-pointer accent-teacher-gold"
                />
                <div className="flex justify-between text-xs text-teacher-inkLight mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-teacher-inkLight mb-2">
                  Question Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => toggleQuestionType(value)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm transition-all ${
                        quizConfig.questionTypes.includes(value)
                          ? 'border-teacher-gold bg-teacher-gold/5 text-teacher-gold'
                          : 'border-teacher-ink/10 text-teacher-inkLight hover:border-teacher-ink/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{label}</span>
                      {quizConfig.questionTypes.includes(value) && (
                        <Check className="w-3 h-3 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
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
                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-2">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {DIFFICULTY_LEVELS.map(({ value, label, description }) => (
                          <button
                            key={value}
                            onClick={() => setQuizConfig(prev => ({ ...prev, difficulty: value }))}
                            className={`text-left p-3 border rounded-xl transition-all ${
                              quizConfig.difficulty === value
                                ? 'border-teacher-gold bg-teacher-gold/5'
                                : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                            }`}
                          >
                            <p className={`font-medium text-sm ${
                              quizConfig.difficulty === value ? 'text-teacher-gold' : 'text-teacher-ink'
                            }`}>
                              {label}
                            </p>
                            <p className="text-xs text-teacher-inkLight mt-0.5">{description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grade Level */}
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        Grade Level
                      </label>
                      <select
                        value={quizConfig.gradeLevel}
                        onChange={(e) => setQuizConfig(prev => ({ ...prev, gradeLevel: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all"
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
                onClick={handleGenerateQuiz}
                disabled={generating || content.length < 50}
                className="w-full mt-4 py-3 px-6 bg-gradient-to-r from-teacher-gold to-teacher-goldLight text-white font-semibold rounded-xl hover:shadow-teacher-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div>
            <div className="teacher-card p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teacher-ink">Quiz Preview</h3>
                {generatedQuiz && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerateQuiz}
                      disabled={generating}
                      className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                )}
              </div>

              {!generatedQuiz && !generating ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <JeffreyAvatar size="lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teacher-gold flex items-center justify-center">
                      <FileQuestion className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-medium text-teacher-ink mb-2">Ready to Create Your Quiz!</h4>
                  <p className="text-sm text-teacher-inkLight max-w-xs mx-auto">
                    Add your content on the left, configure your quiz settings, and I'll generate engaging questions for your students.
                  </p>
                </div>
              ) : generating ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <JeffreyAvatar size="lg" animate />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teacher-gold flex items-center justify-center animate-pulse">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-medium text-teacher-ink mb-2">Crafting Your Quiz...</h4>
                  <p className="text-sm text-teacher-inkLight">
                    Creating {quizConfig.questionCount} questions with varying difficulty
                  </p>
                  <div className="mt-4 w-48 h-2 mx-auto bg-teacher-ink/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teacher-gold to-teacher-goldLight animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {/* Quiz Header */}
                  <div className="p-4 bg-gradient-to-r from-teacher-gold/10 to-teacher-goldLight/10 rounded-xl">
                    <h4 className="font-semibold text-teacher-ink">{generatedQuiz.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-teacher-inkLight">
                      <span>{generatedQuiz.questions?.length || 0} questions</span>
                      <span>•</span>
                      <span>{generatedQuiz.totalPoints || 0} points</span>
                      <span>•</span>
                      <span>~{generatedQuiz.estimatedTime || 10} min</span>
                    </div>
                  </div>

                  {/* Questions */}
                  {generatedQuiz.questions?.map((question, index) => {
                    const Icon = getQuestionIcon(question.type);
                    return (
                      <div key={question.id || index} className="p-4 border border-teacher-ink/10 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teacher-chalk/10 flex items-center justify-center flex-shrink-0 text-teacher-chalk font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teacher-ink/5 rounded text-xs text-teacher-inkLight">
                                <Icon className="w-3 h-3" />
                                {QUESTION_TYPES.find(t => t.value === question.type)?.label || question.type}
                              </span>
                              <span className="text-xs text-teacher-inkLight">
                                {question.points || 1} pt{(question.points || 1) > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-sm text-teacher-ink font-medium mb-3">
                              {question.question}
                            </p>

                            {/* Options for multiple choice */}
                            {question.options && (
                              <div className="space-y-2 mb-3">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                      option === question.correctAnswer
                                        ? 'bg-teacher-sage/10 border border-teacher-sage/30 text-teacher-sage'
                                        : 'bg-teacher-paper text-teacher-inkLight'
                                    }`}
                                  >
                                    {option === question.correctAnswer ? (
                                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
                                    )}
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Answer for non-multiple choice */}
                            {!question.options && question.correctAnswer && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-teacher-sage/10 border border-teacher-sage/30 rounded-lg text-sm text-teacher-sage mb-3">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>{question.correctAnswer}</span>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="flex items-start gap-2 px-3 py-2 bg-teacher-gold/5 rounded-lg text-xs text-teacher-inkLight">
                                <Lightbulb className="w-3 h-3 mt-0.5 text-teacher-gold flex-shrink-0" />
                                <span>{question.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-teacher-ink/10">
                    <button
                      onClick={handleSaveQuiz}
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
                          Save Quiz
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
              )}
            </div>
          </div>
        </div>

        {/* Credits Info */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-teacher-inkLight">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teacher-gold" />
            <span>Available: {formatCredits(quota?.tokensRemaining || 0)} credits</span>
          </div>
          <span>•</span>
          <span>Quiz generation uses approximately 1.5-2K credits</span>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default GenerateQuizPage;
