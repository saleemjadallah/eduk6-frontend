import React, { useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import {
  BookOpen,
  FileQuestion,
  Layers,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileUp,
  Type,
  Image,
  Link2,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Target,
  Users,
  Clock,
  Lightbulb,
  PenTool,
  Rocket,
  Star,
  Zap,
} from 'lucide-react';

const TeacherContentCreatePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { quota, refreshQuota } = useTeacherAuth();

  // State
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || null);
  const [inputMethod, setInputMethod] = useState(null);
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [step, setStep] = useState(1);

  // Content types
  const contentTypes = [
    {
      id: 'LESSON',
      title: 'Lesson',
      description: 'Create beautifully formatted lessons from your content',
      icon: BookOpen,
      gradient: 'from-teacher-chalk to-teacher-chalkLight',
      features: ['AI formatting', 'Key concepts', 'Practice exercises'],
      estimatedCredits: '2-5K',
    },
    {
      id: 'QUIZ',
      title: 'Quiz',
      description: 'Generate quizzes with multiple question types',
      icon: FileQuestion,
      gradient: 'from-teacher-gold to-teacher-goldLight',
      features: ['Multiple choice', 'True/false', 'Short answer'],
      estimatedCredits: '1-3K',
    },
    {
      id: 'FLASHCARD_DECK',
      title: 'Flashcards',
      description: 'Create study flashcards for effective memorization',
      icon: Layers,
      gradient: 'from-teacher-plum to-teacher-plumLight',
      features: ['Term & definition', 'Auto-generation', 'Spaced repetition'],
      estimatedCredits: '1-2K',
    },
    {
      id: 'STUDY_GUIDE',
      title: 'Study Guide',
      description: 'Summarize content into comprehensive study guides',
      icon: FileText,
      gradient: 'from-teacher-terracotta to-teacher-terracottaLight',
      features: ['Key takeaways', 'Summary', 'Study tips'],
      estimatedCredits: '2-4K',
    },
  ];

  // Input methods
  const inputMethods = [
    {
      id: 'upload',
      title: 'Upload File',
      description: 'PDF, PPT, Word, or text files',
      icon: FileUp,
    },
    {
      id: 'text',
      title: 'Paste Text',
      description: 'Copy and paste content directly',
      icon: Type,
    },
    {
      id: 'url',
      title: 'From URL',
      description: 'Import from a webpage',
      icon: Link2,
      comingSoon: true,
    },
  ];

  // Grade levels
  const gradeLevels = [
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade',
    'College',
  ];

  // Subjects
  const subjects = [
    'Mathematics',
    'Science',
    'English Language Arts',
    'Social Studies',
    'History',
    'Geography',
    'Biology',
    'Chemistry',
    'Physics',
    'Computer Science',
    'Art',
    'Music',
    'Physical Education',
    'Foreign Language',
    'Other',
  ];

  // File dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Calculate estimated credits
  const getEstimatedCredits = () => {
    const type = contentTypes.find((t) => t.id === selectedType);
    return type?.estimatedCredits || '1-5K';
  };

  // Map frontend subject to backend Subject enum
  const mapSubjectToEnum = (subjectName) => {
    const subjectMap = {
      'Mathematics': 'MATH',
      'Science': 'SCIENCE',
      'English Language Arts': 'ENGLISH',
      'Social Studies': 'SOCIAL_STUDIES',
      'History': 'HISTORY',
      'Geography': 'GEOGRAPHY',
      'Biology': 'SCIENCE',
      'Chemistry': 'SCIENCE',
      'Physics': 'SCIENCE',
      'Computer Science': 'COMPUTER_SCIENCE',
      'Art': 'ART',
      'Music': 'MUSIC',
      'Physical Education': 'PHYSICAL_EDUCATION',
      'Foreign Language': 'FOREIGN_LANGUAGE',
      'Other': 'OTHER',
    };
    return subjectMap[subjectName] || 'OTHER';
  };

  // Handle generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(null);

    try {
      let sourceText = textContent;
      let extractedData = null;

      // Step 1: If file uploaded, analyze it to extract text
      if (file && inputMethod === 'upload') {
        setGenerationProgress({ step: 'analyzing', message: 'Analyzing your document...' });

        try {
          const result = await teacherAPI.analyzeDocument(file);
          if (result.success && result.data) {
            sourceText = result.data.extractedText || '';
            extractedData = result.data;

            // Auto-fill title if not set and we have a suggested title
            if (!title && extractedData.suggestedTitle) {
              setTitle(extractedData.suggestedTitle);
            }
          }
        } catch (analyzeError) {
          throw new Error(`Failed to analyze document: ${analyzeError.message}`);
        }
      }

      // Validate we have content to work with
      if (!sourceText || sourceText.trim().length < 50) {
        throw new Error('Please provide more content (at least 50 characters) for AI generation.');
      }

      // Step 2: Generate based on selected type
      if (selectedType === 'LESSON') {
        // Use generateFullLesson with SSE for progress updates
        setGenerationProgress({ step: 'generating', message: 'Generating lesson content...' });

        await teacherAPI.generateFullLesson(
          {
            topic: title,
            subject: subject ? mapSubjectToEnum(subject) : undefined,
            gradeLevel: gradeLevel || undefined,
            additionalContext: sourceText,
            includeQuiz: true,
            includeFlashcards: true,
            includeInfographic: false,
          },
          (progress) => {
            // Handle SSE progress updates
            setGenerationProgress({
              step: progress.step || 'generating',
              message: progress.message || 'Working on your lesson...',
              percentage: progress.percentage,
            });
          }
        );
      } else {
        // For QUIZ, FLASHCARD_DECK, STUDY_GUIDE
        // First create a content record with the extracted text
        setGenerationProgress({ step: 'creating', message: 'Creating content record...' });

        const contentResult = await teacherAPI.createContent({
          title: title,
          description: extractedData?.summary || '',
          subject: subject ? mapSubjectToEnum(subject) : undefined,
          gradeLevel: gradeLevel || undefined,
          contentType: selectedType,
          sourceType: file ? 'UPLOAD' : 'TEXT',
          originalFileName: file?.name,
          extractedText: sourceText,
          status: 'DRAFT',
        });

        if (!contentResult.success || !contentResult.data?.id) {
          throw new Error('Failed to create content record');
        }

        const contentId = contentResult.data.id;

        // Now generate the specific content type
        setGenerationProgress({
          step: 'generating',
          message: `Generating ${selectedType.toLowerCase().replace('_', ' ')}...`
        });

        if (selectedType === 'QUIZ') {
          await teacherAPI.generateQuiz(
            contentId,
            {
              content: sourceText,
              title: title,
              questionCount: 10,
              difficulty: 'mixed',
              gradeLevel: gradeLevel || undefined,
            },
            true // save=true
          );
        } else if (selectedType === 'FLASHCARD_DECK') {
          await teacherAPI.generateFlashcards(
            contentId,
            {
              content: sourceText,
              title: title,
              cardCount: 15,
              includeHints: true,
              gradeLevel: gradeLevel || undefined,
            },
            true // save=true
          );
        } else if (selectedType === 'STUDY_GUIDE') {
          await teacherAPI.generateStudyGuide(contentId, {
            content: sourceText,
            title: title,
            format: 'detailed',
            includeKeyTerms: true,
            includeReviewQuestions: true,
            gradeLevel: gradeLevel || undefined,
          });
        }
      }

      // Success! Refresh quota and navigate to content list
      setGenerationProgress({ step: 'complete', message: 'Content created successfully!' });

      // Refresh quota to update sidebar credits
      refreshQuota?.();

      // Brief delay to show success message
      setTimeout(() => {
        navigate('/teacher/content');
      }, 1000);
    } catch (error) {
      setGenerationError(error.message || 'Failed to generate content. Please try again.');
      setIsGenerating(false);
    }
  };

  // Check if can proceed to next step
  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return inputMethod !== null && (file !== null || textContent.trim().length > 0);
      case 3:
        return title.trim().length > 0;
      default:
        return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold text-teacher-ink mb-2">
                What would you like to create?
              </h2>
              <p className="text-teacher-inkLight">
                Choose the type of content you want to generate with AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      relative p-6 rounded-2xl text-left transition-all
                      ${isSelected
                        ? 'bg-white ring-2 ring-teacher-chalk shadow-teacher-lg'
                        : 'bg-white/60 hover:bg-white hover:shadow-teacher'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-6 h-6 text-teacher-chalk" />
                      </div>
                    )}

                    <div className={`
                      w-14 h-14 rounded-2xl mb-4 flex items-center justify-center
                      bg-gradient-to-br ${type.gradient}
                    `}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="font-semibold text-teacher-ink text-lg mb-1">
                      {type.title}
                    </h3>
                    <p className="text-sm text-teacher-inkLight mb-4">
                      {type.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {type.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-teacher-ink/5 text-teacher-inkLight"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-teacher-ink/5 flex items-center gap-2 text-xs text-teacher-inkLight">
                      <Zap className="w-3 h-3" />
                      Est. {type.estimatedCredits} credits
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold text-teacher-ink mb-2">
                Add your content
              </h2>
              <p className="text-teacher-inkLight">
                Upload a file or paste text for the AI to transform
              </p>
            </div>

            {/* Input method selector */}
            <div className="flex justify-center gap-3 mb-8">
              {inputMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = inputMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => !method.comingSoon && setInputMethod(method.id)}
                    disabled={method.comingSoon}
                    className={`
                      px-5 py-3 rounded-xl flex items-center gap-2 transition-all
                      ${isSelected
                        ? 'bg-teacher-chalk text-white shadow-teacher'
                        : method.comingSoon
                          ? 'bg-teacher-ink/5 text-teacher-inkLight/50 cursor-not-allowed'
                          : 'bg-white text-teacher-ink hover:bg-teacher-paper'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{method.title}</span>
                    {method.comingSoon && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-teacher-gold/20 text-teacher-gold">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input content area */}
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {inputMethod === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`
                        relative p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer
                        ${isDragActive
                          ? 'border-teacher-chalk bg-teacher-chalk/5'
                          : file
                            ? 'border-teacher-sage bg-teacher-sage/5'
                            : 'border-teacher-ink/20 hover:border-teacher-chalk/50 bg-white'
                        }
                      `}
                    >
                      <input {...getInputProps()} />

                      {file ? (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teacher-sage/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-teacher-sage" />
                          </div>
                          <p className="font-semibold text-teacher-ink mb-1">{file.name}</p>
                          <p className="text-sm text-teacher-inkLight mb-4">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="text-sm text-teacher-coral hover:underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teacher-chalk/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-teacher-chalk" />
                          </div>
                          <p className="font-semibold text-teacher-ink mb-1">
                            {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                          </p>
                          <p className="text-sm text-teacher-inkLight mb-4">
                            or click to browse
                          </p>
                          <p className="text-xs text-teacher-inkLight/70">
                            Supports PDF, PPT, Word, and text files up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {inputMethod === 'text' && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="relative">
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Paste or type your content here..."
                        rows={12}
                        className="w-full p-6 rounded-2xl bg-white border border-teacher-ink/10 text-teacher-ink placeholder:text-teacher-inkLight/50 focus:outline-none focus:ring-2 focus:ring-teacher-chalk/20 focus:border-teacher-chalk resize-none"
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-teacher-inkLight">
                        {textContent.length.toLocaleString()} characters
                      </div>
                    </div>
                  </motion.div>
                )}

                {!inputMethod && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 text-teacher-inkLight"
                  >
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select an input method above to get started</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold text-teacher-ink mb-2">
                Final details
              </h2>
              <p className="text-teacher-inkLight">
                Add some information to help organize your content
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-teacher-ink mb-2">
                  Title <span className="text-teacher-coral">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Fractions"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-teacher-ink/10 text-teacher-ink placeholder:text-teacher-inkLight/50 focus:outline-none focus:ring-2 focus:ring-teacher-chalk/20 focus:border-teacher-chalk"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-teacher-ink mb-2">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-teacher-ink/10 text-teacher-ink focus:outline-none focus:ring-2 focus:ring-teacher-chalk/20 focus:border-teacher-chalk appearance-none"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teacher-inkLight pointer-events-none" />
                </div>
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-sm font-medium text-teacher-ink mb-2">
                  Grade Level
                </label>
                <div className="relative">
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-teacher-ink/10 text-teacher-ink focus:outline-none focus:ring-2 focus:ring-teacher-chalk/20 focus:border-teacher-chalk appearance-none"
                  >
                    <option value="">Select grade level</option>
                    {gradeLevels.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teacher-inkLight pointer-events-none" />
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-teacher-chalk/5 to-teacher-gold/5 border border-teacher-ink/5">
                <h3 className="font-semibold text-teacher-ink mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teacher-gold" />
                  Generation Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-teacher-inkLight">Content Type</span>
                    <span className="font-medium text-teacher-ink">
                      {contentTypes.find((t) => t.id === selectedType)?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-teacher-inkLight">Source</span>
                    <span className="font-medium text-teacher-ink">
                      {file ? file.name : `${textContent.length.toLocaleString()} characters`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-teacher-inkLight">Est. Credits</span>
                    <span className="font-medium text-teacher-gold">
                      ~{getEstimatedCredits()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <TeacherLayout
      title="Create Content"
      subtitle="Use AI to generate engaging educational materials"
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Type' },
            { num: 2, label: 'Content' },
            { num: 3, label: 'Details' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => s.num < step && setStep(s.num)}
                disabled={s.num > step}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all
                  ${step === s.num
                    ? 'bg-teacher-chalk text-white'
                    : s.num < step
                      ? 'bg-teacher-sage/10 text-teacher-sage cursor-pointer hover:bg-teacher-sage/20'
                      : 'bg-teacher-ink/5 text-teacher-inkLight cursor-not-allowed'
                  }
                `}
              >
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                  ${step === s.num
                    ? 'bg-white/20'
                    : s.num < step
                      ? 'bg-teacher-sage text-white'
                      : 'bg-teacher-ink/10'
                  }
                `}>
                  {s.num < step ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </span>
                <span className="font-medium hidden sm:block">{s.label}</span>
              </button>

              {i < 2 && (
                <div className={`
                  w-12 h-0.5 rounded-full
                  ${s.num < step ? 'bg-teacher-sage' : 'bg-teacher-ink/10'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/teacher/dashboard')}
          className="teacher-btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Back' : 'Cancel'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={`
              teacher-btn-primary inline-flex items-center gap-2
              ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className={`
              teacher-btn-gold inline-flex items-center gap-2
              ${!canProceed() || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {generationError && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Generation Failed</p>
                <p className="text-red-600 text-sm mt-1">{generationError}</p>
              </div>
              <button
                onClick={() => setGenerationError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating Modal */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-teacher-ink/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-teacher-lg"
            >
              {generationProgress?.step === 'complete' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teacher-sage to-teacher-sageLight flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-teacher-ink mb-2">
                    Success!
                  </h3>
                  <p className="text-teacher-inkLight mb-6">
                    {generationProgress.message}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teacher-gold to-teacher-goldLight flex items-center justify-center animate-pulse">
                    <Wand2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-teacher-ink mb-2">
                    Creating your {contentTypes.find((t) => t.id === selectedType)?.title.toLowerCase()}...
                  </h3>
                  <p className="text-teacher-inkLight mb-6">
                    {generationProgress?.message || 'Our AI is working its magic. This usually takes 15-30 seconds.'}
                  </p>
                  <div className="h-2 bg-teacher-ink/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: generationProgress?.percentage ? `${generationProgress.percentage}%` : '100%' }}
                      transition={generationProgress?.percentage ? { duration: 0.5 } : { duration: 30, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-teacher-chalk via-teacher-gold to-teacher-sage"
                    />
                  </div>
                  {generationProgress?.step && (
                    <p className="text-xs text-teacher-inkLight/60 mt-3 capitalize">
                      Step: {generationProgress.step.replace('_', ' ')}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TeacherLayout>
  );
};

export default TeacherContentCreatePage;
