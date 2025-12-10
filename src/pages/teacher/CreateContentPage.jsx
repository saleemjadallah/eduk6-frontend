import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Zap,
  BookOpen,
  FileText,
  Check,
  Loader2,
  Gamepad2,
  ClipboardCheck,
  Layers,
  Image,
  Info,
  Upload,
  MessageSquare,
  File,
  X,
  AlertCircle,
} from 'lucide-react';

// Jeffrey Avatar using actual asset
const JeffreyAvatar = ({ size = 'md' }) => {
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
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// Teacher Avatar
const TeacherAvatar = ({ teacher, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-teacher-terracotta to-teacher-terracottaLight flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-teacher-ink/10`}>
      {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
    </div>
  );
};

const SUBJECTS = [
  { value: 'MATH', label: 'Mathematics' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'ENGLISH', label: 'English Language Arts' },
  { value: 'SOCIAL_STUDIES', label: 'Social Studies' },
  { value: 'HISTORY', label: 'History' },
  { value: 'GEOGRAPHY', label: 'Geography' },
  { value: 'ART', label: 'Art' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' },
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'FOREIGN_LANGUAGE', label: 'Foreign Language' },
  { value: 'OTHER', label: 'Other' },
];

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

const CURRICULA = [
  { value: '', label: 'No specific curriculum' },
  { value: 'COMMON_CORE', label: 'Common Core (US)' },
  { value: 'NGSS', label: 'Next Generation Science Standards (US)' },
  { value: 'UK_NATIONAL', label: 'UK National Curriculum' },
  { value: 'CAMBRIDGE', label: 'Cambridge International' },
  { value: 'IB_PYP', label: 'IB Primary Years Programme' },
  { value: 'IB_MYP', label: 'IB Middle Years Programme' },
  { value: 'AUSTRALIAN', label: 'Australian Curriculum' },
  { value: 'SINGAPORE', label: 'Singapore Curriculum' },
  { value: 'ONTARIO', label: 'Ontario Curriculum (Canada)' },
  { value: 'CCSS_MATH', label: 'Common Core Math Standards' },
  { value: 'CCSS_ELA', label: 'Common Core ELA Standards' },
  { value: 'STATE_SPECIFIC', label: 'State-Specific Standards' },
  { value: 'OTHER', label: 'Other' },
];

const SUGGESTED_PROMPTS = [
  "Create a lesson about fractions for 4th graders",
  "I need to teach the water cycle to my 3rd grade class",
  "Help me create a lesson on the American Revolution",
];

const LESSON_TYPES = [
  {
    id: 'guide',
    name: 'Lesson Guide',
    description: 'A structured outline with key points, activities, and teaching tips',
    credits: '~2-3K',
    icon: FileText,
    color: 'teacher-chalk',
    features: ['Learning objectives', 'Section outlines', 'Activity ideas', 'Assessment tips'],
  },
  {
    id: 'full',
    name: 'Full Lesson',
    description: 'Comprehensive 5-10 page lesson with detailed content ready for students',
    credits: '~8-12K',
    icon: BookOpen,
    color: 'teacher-gold',
    features: ['Complete explanations', 'Student-ready content', 'Detailed examples', 'Worksheets & exercises', 'PDF export ready'],
  },
];

const CreateContentPage = () => {
  const navigate = useNavigate();
  const { teacher, quota } = useTeacherAuth();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'jeffrey',
      text: "Hi! I'm Jeffrey, your teaching assistant!\n\nTell me what you'd like to create today. You can describe your lesson idea, and I'll help you build something amazing for your students.",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Form state (collected through conversation)
  const [lessonDetails, setLessonDetails] = useState({
    topic: '',
    subject: '',
    gradeLevel: '',
    curriculum: '',
    duration: 45,
    objectives: [],
    lessonType: 'guide',
    includeQuiz: true,
    includeFlashcards: true,
    includeInfographic: false,
    includeActivities: true,
    additionalNotes: '',
  });

  // UI state
  const [showOptions, setShowOptions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [conversationStage, setConversationStage] = useState('initial');

  // PDF Upload state
  const [inputMode, setInputMode] = useState('chat'); // 'chat' or 'pdf'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [pdfAnalysis, setPdfAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const simulateTyping = async (duration = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('teacher', userMessage);

    await simulateTyping(800);

    if (conversationStage === 'initial' || !lessonDetails.topic) {
      setLessonDetails(prev => ({ ...prev, topic: userMessage }));
      setConversationStage('gathering');

      addMessage('jeffrey',
        `Great topic! "${userMessage}" sounds like it will be an engaging lesson!\n\nLet me help you set up the details. Please select the options below, and I'll create a comprehensive lesson plan for you.`
      );
      setShowOptions(true);
    } else if (conversationStage === 'gathering') {
      setLessonDetails(prev => ({
        ...prev,
        additionalNotes: prev.additionalNotes + '\n' + userMessage
      }));
      addMessage('jeffrey',
        `Got it! I've noted that down. Feel free to adjust the options below or add more details. When you're ready, click "Generate Lesson" to create your content!`
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  // PDF Upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('PDF files must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please drop a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('PDF files must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPdfAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzePDF = async () => {
    if (!selectedFile) return;

    setUploadingPDF(true);
    setError(null);

    try {
      const result = await teacherAPI.analyzePDF(selectedFile);

      if (result.success) {
        setPdfAnalysis(result.data);

        // Pre-fill lesson details from PDF analysis
        setLessonDetails(prev => ({
          ...prev,
          topic: result.data.suggestedTitle || prev.topic,
          subject: result.data.detectedSubject || prev.subject,
          gradeLevel: result.data.detectedGradeLevel || prev.gradeLevel,
          additionalNotes: result.data.extractedText?.substring(0, 2000) || '',
        }));

        // Show the options panel
        setShowOptions(true);
        setConversationStage('gathering');

        // Add a message to the chat
        addMessage('jeffrey',
          `I've analyzed your PDF "${selectedFile.name}"!\n\n` +
          `**Topic:** ${result.data.suggestedTitle}\n` +
          `**Subject:** ${result.data.detectedSubject || 'Not detected'}\n` +
          `**Grade Level:** ${result.data.detectedGradeLevel || 'Not detected'}\n` +
          `**Key Topics:** ${result.data.keyTopics?.slice(0, 5).join(', ') || 'N/A'}\n\n` +
          `I've pre-filled the lesson details. Review the options below and click "Generate Lesson" when ready!`
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze PDF');
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonDetails.topic) {
      setError('Please describe what lesson you want to create first.');
      return;
    }

    setGenerating(true);
    setError(null);
    setConversationStage('generating');

    const isFullLesson = lessonDetails.lessonType === 'full';
    addMessage('jeffrey',
      `Perfect! I'm now creating your ${isFullLesson ? 'full lesson' : 'lesson guide'} on "${lessonDetails.topic}"...\n\nBuilding lesson structure\nWriting content sections${isFullLesson ? '\nCreating detailed explanations\nDeveloping student materials' : ''}\n${lessonDetails.includeQuiz ? 'Generating quiz questions\n' : ''}${lessonDetails.includeFlashcards ? 'Creating flashcards\n' : ''}${lessonDetails.includeActivities ? 'Designing activities\n' : ''}${lessonDetails.includeInfographic ? 'Generating infographic\n' : ''}\n${isFullLesson ? 'This will take a bit longer for the comprehensive content...' : 'This may take a moment...'}`
    );

    try {
      const result = await teacherAPI.generateLesson({
        topic: lessonDetails.topic,
        subject: lessonDetails.subject || undefined,
        gradeLevel: lessonDetails.gradeLevel || undefined,
        curriculum: lessonDetails.curriculum || undefined,
        duration: lessonDetails.duration,
        lessonType: lessonDetails.lessonType,
        includeActivities: lessonDetails.includeActivities,
        includeAssessment: lessonDetails.includeQuiz,
        additionalContext: lessonDetails.additionalNotes,
      });

      if (result.success) {
        setGeneratedContent(result.data);

        const saveResponse = await teacherAPI.createContent({
          title: result.data.title || lessonDetails.topic,
          description: result.data.summary || `Lesson about ${lessonDetails.topic}`,
          subject: lessonDetails.subject || undefined,
          gradeLevel: lessonDetails.gradeLevel || undefined,
          contentType: 'LESSON',
          lessonContent: result.data,
        });

        if (saveResponse.success) {
          const contentId = saveResponse.data.id;

          if (lessonDetails.includeFlashcards) {
            try {
              await teacherAPI.generateFlashcards(contentId, {
                content: result.data.sections?.map(s => s.content).join('\n') || lessonDetails.topic,
                title: `${result.data.title} Flashcards`,
                cardCount: 15,
                includeHints: true,
                gradeLevel: lessonDetails.gradeLevel,
              }, true);
            } catch (e) {
              console.warn('Flashcard generation failed:', e);
            }
          }

          // Generate infographic if requested
          let infographicGenerated = false;
          if (lessonDetails.includeInfographic) {
            try {
              // Extract key points from the lesson for the infographic
              const keyPoints = [
                ...(result.data.objectives || []).slice(0, 3),
                ...(result.data.sections || []).slice(0, 4).map(s => s.title),
                ...(result.data.vocabulary || []).slice(0, 3).map(v => `${v.term}: ${v.definition}`),
              ].filter(Boolean).slice(0, 8);

              if (keyPoints.length >= 3) {
                await teacherAPI.generateInfographic(contentId, {
                  topic: result.data.title || lessonDetails.topic,
                  keyPoints,
                  style: 'colorful',
                  gradeLevel: lessonDetails.gradeLevel,
                  subject: lessonDetails.subject,
                });
                infographicGenerated = true;
              }
            } catch (e) {
              console.warn('Infographic generation failed:', e);
            }
          }

          setConversationStage('complete');
          addMessage('jeffrey',
            `Your lesson is ready!\n\nI've created:\n- Complete lesson plan with ${result.data.sections?.length || 0} sections\n${result.data.objectives?.length ? `- ${result.data.objectives.length} learning objectives\n` : ''}${result.data.vocabulary?.length ? `- ${result.data.vocabulary.length} vocabulary terms\n` : ''}${result.data.assessment?.questions?.length ? `- ${result.data.assessment.questions.length} assessment questions\n` : ''}${lessonDetails.includeFlashcards ? '- Study flashcards\n' : ''}${infographicGenerated ? '- Visual infographic\n' : ''}\nClick below to view and edit your lesson!`
          );

          setTimeout(() => {
            navigate(`/teacher/content/${contentId}`);
          }, 2000);
        }
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate lesson');
      addMessage('jeffrey',
        `Oops! Something went wrong: ${err.message}\n\nPlease try again or adjust your request.`
      );
      setConversationStage('gathering');
    } finally {
      setGenerating(false);
    }
  };

  const formatCredits = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Header action - back to content
  const headerActions = (
    <Link
      to="/teacher/content"
      className="teacher-btn-secondary flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Content</span>
    </Link>
  );

  return (
    <TeacherLayout
      title="Create with Jeffrey"
      subtitle="Your AI teaching assistant"
      headerActions={headerActions}
    >
      <div className="max-w-4xl mx-auto">
        {/* Chat Container */}
        <div className="teacher-card overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-teacher-ink/5 bg-gradient-to-r from-teacher-chalk to-teacher-chalkLight">
            <div className="flex items-center gap-3">
              <JeffreyAvatar size="md" />
              <div>
                <h2 className="text-white font-semibold text-base sm:text-lg">Jeffrey</h2>
                <p className="text-white/80 text-xs sm:text-sm">Ready to help you create amazing content</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs">
                <Zap className="w-3 h-3" />
                {formatCredits(quota?.tokensRemaining || 0)} credits
              </div>
            </div>
          </div>

          {/* Input Mode Tabs */}
          <div className="px-4 sm:px-6 py-2 border-b border-teacher-ink/5 bg-teacher-paper/50">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('chat')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'chat'
                    ? 'bg-teacher-chalk text-white'
                    : 'text-teacher-inkLight hover:bg-teacher-ink/5'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Describe Topic
              </button>
              <button
                onClick={() => setInputMode('pdf')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'pdf'
                    ? 'bg-teacher-chalk text-white'
                    : 'text-teacher-inkLight hover:bg-teacher-ink/5'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" style={{ minHeight: '250px', maxHeight: '350px' }}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 sm:gap-3 ${message.sender === 'teacher' ? 'flex-row-reverse' : ''}`}
              >
                {message.sender === 'jeffrey' ? (
                  <JeffreyAvatar size="sm" />
                ) : (
                  <TeacherAvatar teacher={teacher} size="sm" />
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${
                    message.sender === 'jeffrey'
                      ? 'bg-teacher-paper text-teacher-ink'
                      : 'bg-teacher-chalk text-white'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 sm:gap-3"
              >
                <JeffreyAvatar size="sm" />
                <div className="bg-teacher-paper rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-teacher-inkLight rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-teacher-inkLight rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-teacher-inkLight rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 sm:mx-6 mb-4 p-3 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl text-teacher-coral text-sm">
              {error}
            </div>
          )}

          {/* Options Panel */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-teacher-ink/5 bg-teacher-paper/50 px-4 sm:px-6 py-4 overflow-hidden"
              >
                {/* Lesson Type Selector */}
                <div className="mb-5">
                  <h3 className="font-semibold text-teacher-ink mb-3 text-sm sm:text-base">What would you like to create?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {LESSON_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = lessonDetails.lessonType === type.id;

                      return (
                        <button
                          key={type.id}
                          onClick={() => setLessonDetails(prev => ({ ...prev, lessonType: type.id }))}
                          className={`relative text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `border-${type.color} bg-${type.color}/5 shadow-teacher`
                              : 'border-teacher-ink/10 bg-white hover:border-teacher-ink/20'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-${type.color} rounded-full flex items-center justify-center`}>
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-${type.color}/10 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${type.color}`} />
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-teacher-ink text-sm sm:text-base">{type.name}</h4>
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? `bg-${type.color}/20 text-${type.color}`
                                    : 'bg-teacher-ink/5 text-teacher-inkLight'
                                }`}>
                                  {type.credits}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-teacher-inkLight mt-1 line-clamp-2">{type.description}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {type.features.slice(0, 3).map((feature, i) => (
                                  <span
                                    key={i}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      isSelected
                                        ? `bg-${type.color}/10 text-${type.color}`
                                        : 'bg-teacher-ink/5 text-teacher-inkLight'
                                    }`}
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <h3 className="font-semibold text-teacher-ink mb-3 text-sm sm:text-base">Lesson Options</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-teacher-inkLight mb-1">Subject</label>
                    <select
                      value={lessonDetails.subject}
                      onChange={(e) => setLessonDetails(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                    >
                      <option value="">Select subject</option>
                      {SUBJECTS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-teacher-inkLight mb-1">Grade Level</label>
                    <select
                      value={lessonDetails.gradeLevel}
                      onChange={(e) => setLessonDetails(prev => ({ ...prev, gradeLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                    >
                      <option value="">Select grade</option>
                      {GRADE_LEVELS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Curriculum */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-teacher-inkLight mb-1">Curriculum</label>
                    <select
                      value={lessonDetails.curriculum}
                      onChange={(e) => setLessonDetails(prev => ({ ...prev, curriculum: e.target.value }))}
                      className="w-full px-3 py-2 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                    >
                      {CURRICULA.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-teacher-inkLight mb-1">
                    Lesson Duration: <span className="text-teacher-ink font-semibold">{lessonDetails.duration} minutes</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="5"
                    value={lessonDetails.duration}
                    onChange={(e) => setLessonDetails(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-teacher-ink/10 rounded-lg appearance-none cursor-pointer accent-teacher-chalk"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-teacher-inkLight mt-1">
                    <span>15 min</span>
                    <span>90 min</span>
                  </div>
                </div>

                {/* Include Options */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-teacher-inkLight mb-2">Include in lesson:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'includeActivities', label: 'Activities', icon: Gamepad2 },
                      { key: 'includeQuiz', label: 'Quiz', icon: ClipboardCheck },
                      { key: 'includeFlashcards', label: 'Flashcards', icon: Layers },
                      { key: 'includeInfographic', label: 'Infographic', icon: Image },
                    ].map(({ key, label, icon: Icon }) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-all text-xs sm:text-sm ${
                          lessonDetails[key]
                            ? 'border-teacher-chalk bg-teacher-chalk/5 text-teacher-chalk'
                            : 'border-teacher-ink/10 bg-white text-teacher-inkLight hover:border-teacher-ink/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={lessonDetails[key]}
                          onChange={(e) => setLessonDetails(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only"
                        />
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        {lessonDetails[key] && <Check className="w-3 h-3" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateLesson}
                  disabled={generating || !lessonDetails.topic}
                  className="w-full py-3 px-6 bg-gradient-to-r from-teacher-chalk to-teacher-chalkLight text-white font-semibold rounded-xl hover:shadow-teacher-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {lessonDetails.lessonType === 'full' ? 'Creating full lesson...' : 'Creating lesson guide...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate {lessonDetails.lessonType === 'full' ? 'Full Lesson' : 'Lesson Guide'}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Input or PDF Upload */}
          <div className="border-t border-teacher-ink/5 p-3 sm:p-4 bg-white">
            {inputMode === 'chat' ? (
              <>
                {/* Suggested prompts (only show initially) */}
                {conversationStage === 'initial' && (
                  <div className="mb-3">
                    <p className="text-[10px] sm:text-xs text-teacher-inkLight mb-2">Try one of these:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-teacher-chalk/10 text-teacher-chalk rounded-full hover:bg-teacher-chalk/20 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={conversationStage === 'initial'
                      ? "Describe the lesson you want to create..."
                      : "Add more details or requirements..."
                    }
                    disabled={generating || conversationStage === 'complete'}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 disabled:bg-teacher-paper disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || generating || conversationStage === 'complete'}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-teacher-chalk text-white rounded-xl hover:bg-teacher-chalkLight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* PDF Upload Section */
              <div className="space-y-3">
                {!selectedFile ? (
                  /* Dropzone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-teacher-ink/20 rounded-xl p-6 text-center cursor-pointer hover:border-teacher-chalk hover:bg-teacher-chalk/5 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teacher-chalk/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-teacher-chalk" />
                    </div>
                    <p className="text-sm font-medium text-teacher-ink mb-1">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-teacher-inkLight">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                ) : (
                  /* Selected File Display */
                  <div className="flex items-center gap-3 p-3 bg-teacher-paper rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-teacher-coral/10 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-teacher-coral" />
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
                )}

                {/* Analyze Button */}
                {selectedFile && !pdfAnalysis && (
                  <button
                    onClick={handleAnalyzePDF}
                    disabled={uploadingPDF}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teacher-chalk to-teacher-chalkLight text-white font-semibold rounded-xl hover:shadow-teacher disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {uploadingPDF ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing PDF...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze PDF
                      </>
                    )}
                  </button>
                )}

                {/* PDF Analysis Complete */}
                {pdfAnalysis && (
                  <div className="flex items-center gap-2 p-3 bg-teacher-sage/10 rounded-xl text-teacher-sage text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>PDF analyzed! Review the options above and generate your lesson.</span>
                  </div>
                )}

                {/* Info text */}
                {!selectedFile && (
                  <p className="text-xs text-center text-teacher-inkLight">
                    Upload your existing lesson materials, worksheets, or textbook pages and I'll create a beautifully formatted lesson with quizzes and flashcards!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Credits Info */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-teacher-inkLight">
          <Info className="w-4 h-4" />
          <span>
            {lessonDetails.lessonType === 'full'
              ? 'Full lesson uses approximately 8-12K credits'
              : 'Lesson guide uses approximately 2-3K credits'
            }
          </span>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateContentPage;
