import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, FileText, Sparkles, Clock, RefreshCw, Trash2, BookOpen, Loader2, HelpCircle, ZoomIn, ChevronDown, ChevronUp } from 'lucide-react';
import Jeffrey from '../Avatar/Jeffrey';
import SafetyIndicator from './SafetyIndicator';
import FlashcardInline from './FlashcardInline';
import SummaryInline from './SummaryInline';
import QuizInline from './QuizInline';
import ExpandedViewModal from './ExpandedViewModal';
import { useLessonContext } from '../../context/LessonContext';
import { useChatContext } from '../../context/ChatContext';
import { useLessonActions } from '../../hooks/useLessonActions';
import { chatAPI } from '../../services/api/chatAPI';

const ChatInterface = ({
    demoMode = false,
    lesson = null,
    onInteraction,
    initialInput = '',
    onInputChange
}) => {
    const [input, setInput] = useState(initialInput);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Use context for enhanced features
    const lessonContext = useLessonContext();
    const { isReady, currentStageInfo, isProcessing } = lessonContext || {};

    // Get chat context - may not be available in demo mode
    let chatContext = null;
    try {
        chatContext = useChatContext();
    } catch (e) {
        // ChatContext not available (demo mode or not wrapped in provider)
    }

    const {
        getCurrentLessonTimeSpent,
    } = useLessonActions();

    // Use prop lesson or get from context
    const activeLesson = lesson || lessonContext?.currentLesson;

    // Demo mode state (local state for demo)
    const [demoMessages, setDemoMessages] = useState([]);
    const [demoTyping, setDemoTyping] = useState(false);

    // Tool loading states
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    // Expanded view modal state
    const [expandedView, setExpandedView] = useState({ isOpen: false, type: null, data: null });

    // Suggested questions collapsed state (collapsed by default)
    const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(false);

    const handleExpandView = (type, data) => {
        setExpandedView({ isOpen: true, type, data });
    };

    const handleCloseExpandedView = () => {
        setExpandedView({ isOpen: false, type: null, data: null });
    };

    // Get messages and state from ChatContext if available
    const messages = chatContext?.messages || demoMessages;
    const isTyping = chatContext?.isLoading && !chatContext?.isStreaming;
    const isStreaming = chatContext?.isStreaming || false;
    const safetyFlags = chatContext?.safetyFlags || [];
    const error = chatContext?.error;
    const suggestedQuestions = chatContext?.suggestedQuestions || [];

    // Sync with external input
    useEffect(() => {
        if (initialInput && initialInput !== input) {
            setInput(initialInput);
        }
    }, [initialInput]);

    // Notify parent of input changes
    const handleInputChange = (value) => {
        setInput(value);
        if (onInputChange) {
            onInputChange(value);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize with context-aware greeting for demo mode
    useEffect(() => {
        if (demoMode) {
            if (activeLesson) {
                setDemoMessages([{
                    id: 1,
                    role: 'assistant',
                    content: `Hi! I'm Jeffrey! I just read "${activeLesson.title}" and I'm ready to help you learn! What would you like to know?`,
                    timestamp: new Date(),
                }]);
            } else {
                setDemoMessages([{
                    id: 1,
                    role: 'assistant',
                    content: "Hi! I'm Jeffrey. Upload a lesson and I'll help you learn!",
                    timestamp: new Date(),
                }]);
            }
        }
    }, [demoMode, activeLesson?.id]);

    // Demo mode sequence
    useEffect(() => {
        if (demoMode) {
            const demoSequence = [
                { delay: 1000, role: 'user', content: "Tell me about the sun!" },
                { delay: 2500, role: 'assistant', content: "The Sun is a giant star at the center of our Solar System!" },
                { delay: 4500, role: 'assistant', content: "It gives us light and heat. Without it, Earth would be frozen!" },
                { delay: 6000, role: 'user', content: "Wow, that's hot!" },
                { delay: 7500, role: 'assistant', content: "Super hot! It's about 27 million degrees Fahrenheit at the core!" }
            ];

            let timeouts = [];
            demoSequence.forEach(({ delay, role, content }, index) => {
                const timeout = setTimeout(() => {
                    setDemoMessages(prev => [...prev, {
                        id: Date.now() + index,
                        role,
                        content,
                        timestamp: new Date(),
                    }]);
                }, delay);
                timeouts.push(timeout);
            });

            return () => timeouts.forEach(clearTimeout);
        }
    }, [demoMode]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const messageContent = input;
        handleInputChange('');

        // Use ChatContext if available
        if (chatContext?.sendMessage) {
            await chatContext.sendMessage(messageContent);
        } else if (demoMode) {
            // Demo mode - add user message locally
            setDemoMessages(prev => [...prev, {
                id: Date.now(),
                role: 'user',
                content: messageContent,
                timestamp: new Date(),
            }]);

            // Simulate bot response for demo
            setDemoTyping(true);
            setTimeout(() => {
                setDemoMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: generateDemoResponse(messageContent, activeLesson),
                    timestamp: new Date(),
                }]);
                setDemoTyping(false);
            }, 1000);
        }

        // Notify parent of interaction (for gamification)
        if (onInteraction) {
            onInteraction();
        }

        // Refocus input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    // Generate a demo response (fallback for demo mode)
    const generateDemoResponse = (question, lesson) => {
        if (!lesson) {
            return "Upload a lesson first, and I'll help you learn about it!";
        }

        const lowercaseQuestion = question.toLowerCase();

        if (lowercaseQuestion.includes('summary') || lowercaseQuestion.includes('about')) {
            return lesson.content?.summary || "Let me help you understand this lesson better!";
        }
        if (lowercaseQuestion.includes('key') || lowercaseQuestion.includes('important')) {
            const keyPoints = lesson.content?.keyPoints || [];
            if (keyPoints.length > 0) {
                return `Here are the key points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
            }
        }

        return "That's a great question! Let me help you understand this better.";
    };

    const handleSuggestedQuestion = (question) => {
        handleInputChange(question);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        if (chatContext?.clearChat) {
            chatContext.clearChat();
        } else if (demoMode) {
            setDemoMessages([{
                id: Date.now(),
                role: 'assistant',
                content: "Hi! I'm Jeffrey. What would you like to learn about?",
                timestamp: new Date(),
            }]);
        }
    };

    const handleRetry = () => {
        if (chatContext?.retryLastMessage) {
            chatContext.retryLastMessage();
        }
    };

    // Get child context for API calls
    const getChildContext = () => {
        const currentProfileId = localStorage.getItem('current_profile_id');
        const storedChildren = localStorage.getItem('demo_children');

        if (currentProfileId && storedChildren) {
            try {
                const children = JSON.parse(storedChildren);
                const child = children.find(c => c.id === currentProfileId);
                if (child) {
                    return {
                        childId: child.id,
                        ageGroup: child.age <= 7 ? 'YOUNG' : 'OLDER',
                    };
                }
            } catch (e) {
                console.error('Error parsing child context:', e);
            }
        }
        return { childId: null, ageGroup: 'OLDER' };
    };

    // Handle Flashcards generation
    const handleGenerateFlashcards = async () => {
        if (!activeLesson || isGeneratingFlashcards) return;

        setIsGeneratingFlashcards(true);
        const { childId, ageGroup } = getChildContext();

        try {
            const content = activeLesson.rawText || activeLesson.content?.rawText || activeLesson.summary || '';
            const response = await chatAPI.generateFlashcards({
                content,
                count: 5,
                childId,
                ageGroup,
            });

            const flashcards = response.data || [];

            // Add user action message
            const userMsg = {
                id: Date.now(),
                role: 'user',
                content: '📚 Generate flashcards for this lesson',
                timestamp: new Date(),
            };

            // Add flashcard response
            const flashcardMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                type: 'flashcards',
                flashcards: flashcards,
            };

            if (demoMode) {
                setDemoMessages(prev => [...prev, userMsg, flashcardMsg]);
            } else if (chatContext?.addMessages) {
                chatContext.addMessages([userMsg, flashcardMsg]);
            }
        } catch (error) {
            console.error('Flashcard generation error:', error);
            const errorMsg = {
                id: Date.now(),
                role: 'assistant',
                content: "Oops! I couldn't create flashcards right now. Try asking me to explain the lesson instead!",
                timestamp: new Date(),
                isError: true,
            };
            if (demoMode) {
                setDemoMessages(prev => [...prev, errorMsg]);
            } else if (chatContext?.addMessage) {
                chatContext.addMessage(errorMsg);
            }
        } finally {
            setIsGeneratingFlashcards(false);
        }
    };

    // Handle Infographic generation
    const handleGenerateInfographic = async () => {
        if (!activeLesson || isGeneratingInfographic) return;

        setIsGeneratingInfographic(true);
        const { childId, ageGroup } = getChildContext();

        try {
            const content = activeLesson.rawText || activeLesson.content?.rawText || activeLesson.summary || '';
            const response = await chatAPI.generateInfographic({
                content,
                title: activeLesson.title,
                keyConcepts: activeLesson.keyConceptsForChat || activeLesson.chapters?.map(c => c.title),
                childId,
                ageGroup,
            });

            const infographic = response.data;

            // Add user action message
            const userMsg = {
                id: Date.now(),
                role: 'user',
                content: '🎨 Create an infographic for this lesson',
                timestamp: new Date(),
            };

            // Add infographic response
            const infographicMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: infographic.description || 'Here\'s your infographic!',
                timestamp: new Date(),
                type: 'infographic',
                imageData: infographic.imageData,
                mimeType: infographic.mimeType,
            };

            if (demoMode) {
                setDemoMessages(prev => [...prev, userMsg, infographicMsg]);
            } else if (chatContext?.addMessages) {
                chatContext.addMessages([userMsg, infographicMsg]);
            }
        } catch (error) {
            console.error('Infographic generation error:', error);
            const errorMsg = {
                id: Date.now(),
                role: 'assistant',
                content: "Oops! I couldn't create the infographic right now. Image generation might not be available. Try the Summary instead!",
                timestamp: new Date(),
                isError: true,
            };
            if (demoMode) {
                setDemoMessages(prev => [...prev, errorMsg]);
            } else if (chatContext?.addMessage) {
                chatContext.addMessage(errorMsg);
            }
        } finally {
            setIsGeneratingInfographic(false);
        }
    };

    // Handle Summary generation
    const handleGenerateSummary = async () => {
        if (!activeLesson || isGeneratingSummary) return;

        setIsGeneratingSummary(true);
        const { childId, ageGroup } = getChildContext();

        try {
            const content = activeLesson.rawText || activeLesson.content?.rawText || activeLesson.summary || '';
            const response = await chatAPI.generateSummary({
                content,
                title: activeLesson.title,
                childId,
                ageGroup,
            });

            const summary = response.data;

            // Add user action message
            const userMsg = {
                id: Date.now(),
                role: 'user',
                content: '📖 Summarize this lesson for me',
                timestamp: new Date(),
            };

            // Add summary response
            const summaryMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                type: 'summary',
                summary: summary,
            };

            if (demoMode) {
                setDemoMessages(prev => [...prev, userMsg, summaryMsg]);
            } else if (chatContext?.addMessages) {
                chatContext.addMessages([userMsg, summaryMsg]);
            }
        } catch (error) {
            console.error('Summary generation error:', error);
            const errorMsg = {
                id: Date.now(),
                role: 'assistant',
                content: "Oops! I couldn't create the summary right now. Try asking me about specific parts of the lesson!",
                timestamp: new Date(),
                isError: true,
            };
            if (demoMode) {
                setDemoMessages(prev => [...prev, errorMsg]);
            } else if (chatContext?.addMessage) {
                chatContext.addMessage(errorMsg);
            }
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Handle Quiz generation
    const handleGenerateQuiz = async () => {
        if (!activeLesson || isGeneratingQuiz) return;

        setIsGeneratingQuiz(true);
        const { childId, ageGroup } = getChildContext();

        try {
            const content = activeLesson.rawText || activeLesson.content?.rawText || activeLesson.summary || '';
            console.log('[Quiz] Generating quiz for content length:', content.length);

            const response = await chatAPI.generateQuiz({
                content,
                title: activeLesson.title,
                count: 5,
                childId,
                ageGroup,
            });

            console.log('[Quiz] API Response:', response);
            const quiz = response.data;
            console.log('[Quiz] Quiz data:', quiz);

            if (!quiz || !quiz.questions || quiz.questions.length === 0) {
                throw new Error('Invalid quiz data received');
            }

            // Add user action message
            const userMsg = {
                id: Date.now(),
                role: 'user',
                content: '🎯 Quiz me on this lesson!',
                timestamp: new Date(),
            };

            // Add quiz response
            const quizMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                type: 'quiz',
                quiz: quiz,
            };

            console.log('[Quiz] Adding messages, demoMode:', demoMode, 'chatContext:', !!chatContext);

            if (demoMode) {
                setDemoMessages(prev => [...prev, userMsg, quizMsg]);
            } else if (chatContext?.addMessages) {
                chatContext.addMessages([userMsg, quizMsg]);
            } else {
                // Fallback: use local state if chatContext not available
                console.warn('[Quiz] No chatContext, using fallback');
                setDemoMessages(prev => [...prev, userMsg, quizMsg]);
            }
        } catch (error) {
            console.error('Quiz generation error:', error);
            const errorMsg = {
                id: Date.now(),
                role: 'assistant',
                content: "Oops! I couldn't create a quiz right now. Try asking me questions about the lesson instead!",
                timestamp: new Date(),
                isError: true,
            };
            if (demoMode) {
                setDemoMessages(prev => [...prev, errorMsg]);
            } else if (chatContext?.addMessage) {
                chatContext.addMessage(errorMsg);
            } else {
                setDemoMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    // Check if any tool is loading
    const isToolLoading = isGeneratingFlashcards || isGeneratingInfographic || isGeneratingSummary || isGeneratingQuiz;

    // Determine if chat should be disabled
    const isChatDisabled = !demoMode && !activeLesson && !isProcessing;
    const isInputDisabled = isChatDisabled || chatContext?.isLoading;

    // Get display messages with proper format
    const displayMessages = messages.map(msg => ({
        id: msg.id || msg.timestamp?.getTime() || Date.now(),
        type: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content,
        isStreaming: msg.isStreaming,
        isError: msg.isError,
        safetyFlags: msg.metadata?.safetyFlags,
        // Special content types
        messageType: msg.type || 'text',
        flashcards: msg.flashcards,
        summary: msg.summary,
        quiz: msg.quiz,
        imageData: msg.imageData,
        mimeType: msg.mimeType,
    }));

    return (
        <div className={`flex-1 flex flex-col bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden ${demoMode ? 'h-full' : ''}`}>
            {/* Header */}
            <div className="bg-nanobanana-yellow border-b-4 border-black p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={demoMode ? "scale-75 origin-left" : ""}>
                        <Jeffrey />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl font-comic">Chat with Jeffrey</h2>
                        <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </span>
                            {activeLesson && (
                                <span className="flex items-center gap-1 ml-2">
                                    <Clock className="w-3 h-3" />
                                    {getCurrentLessonTimeSpent()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Safety Indicator */}
                    {!demoMode && (
                        <SafetyIndicator flags={safetyFlags} showDetails={true} />
                    )}

                    {/* Clear Chat Button */}
                    {!demoMode && messages.length > 1 && (
                        <button
                            onClick={handleClearChat}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    {!demoMode && (
                        <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                            <Sparkles className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-50 border-b-2 border-amber-200 px-4 py-2 flex items-center justify-between"
                    >
                        <span className="text-sm text-amber-800">{error}</span>
                        <button
                            onClick={handleRetry}
                            className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {/* Welcome message if no messages */}
                {displayMessages.length === 0 && chatContext?.welcomeMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="max-w-[80%] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 text-black rounded-bl-none">
                            <p className="font-medium text-sm whitespace-pre-wrap">
                                {chatContext.welcomeMessage}
                            </p>
                        </div>
                    </motion.div>
                )}

                {displayMessages.map((msg, index) => (
                    <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* Regular text message */}
                        {msg.messageType === 'text' && (
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                    msg.type === 'user'
                                        ? 'bg-nanobanana-blue text-white rounded-br-none'
                                        : msg.isError
                                            ? 'bg-red-50 text-red-800 rounded-bl-none border-red-300'
                                            : 'bg-gray-100 text-black rounded-bl-none'
                                }`}
                            >
                                <p className="font-medium text-sm whitespace-pre-wrap">
                                    {msg.text}
                                    {msg.isStreaming && (
                                        <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
                                    )}
                                </p>
                                {msg.safetyFlags && msg.safetyFlags.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-300 flex items-center gap-1 text-xs text-gray-500">
                                        <span>Content reviewed for safety</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Flashcards message */}
                        {msg.messageType === 'flashcards' && msg.flashcards && (
                            <div className="w-full max-w-md p-3 bg-gray-100 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-none">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <FileText className="w-4 h-4" />
                                        <span>Flashcards for you!</span>
                                    </div>
                                    <button
                                        onClick={() => handleExpandView('flashcards', msg.flashcards)}
                                        className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                                        title="Expand view"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <FlashcardInline flashcards={msg.flashcards} />
                            </div>
                        )}

                        {/* Summary message */}
                        {msg.messageType === 'summary' && msg.summary && (
                            <div className="w-full max-w-lg p-3 bg-gray-100 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-none">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <BookOpen className="w-4 h-4" />
                                        <span>Here's your lesson summary!</span>
                                    </div>
                                    <button
                                        onClick={() => handleExpandView('summary', msg.summary)}
                                        className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                                        title="Expand view"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <SummaryInline summary={msg.summary} />
                            </div>
                        )}

                        {/* Infographic message */}
                        {msg.messageType === 'infographic' && msg.imageData && (
                            <div className="w-full max-w-md p-3 bg-gray-100 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-none">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <Image className="w-4 h-4" />
                                        <span>Here's your infographic!</span>
                                    </div>
                                    <button
                                        onClick={() => handleExpandView('infographic', { imageData: msg.imageData, mimeType: msg.mimeType, text: msg.text })}
                                        className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                                        title="Expand view"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <img
                                    src={`data:${msg.mimeType || 'image/png'};base64,${msg.imageData}`}
                                    alt="Lesson infographic"
                                    className="w-full rounded-xl border-2 border-black"
                                />
                                {msg.text && (
                                    <p className="mt-2 text-sm text-gray-600">{msg.text}</p>
                                )}
                            </div>
                        )}

                        {/* Image message (from chat drawing requests) */}
                        {msg.messageType === 'image' && msg.imageData && (
                            <div className="w-full max-w-md p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-none">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Jeffrey drew this for you!</span>
                                    </div>
                                    <button
                                        onClick={() => handleExpandView('image', { imageData: msg.imageData, mimeType: msg.mimeType, text: msg.text })}
                                        className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                                        title="Expand view"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <img
                                    src={`data:${msg.mimeType || 'image/png'};base64,${msg.imageData}`}
                                    alt="Jeffrey's drawing"
                                    className="w-full rounded-xl border-2 border-black"
                                />
                                {msg.text && (
                                    <p className="mt-3 text-sm text-gray-700 font-medium">{msg.text}</p>
                                )}
                            </div>
                        )}

                        {/* Quiz message */}
                        {msg.messageType === 'quiz' && msg.quiz && (
                            <div className="w-full max-w-lg p-3 bg-gray-100 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-none">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <HelpCircle className="w-4 h-4" />
                                        <span>Let's test your knowledge!</span>
                                    </div>
                                    <button
                                        onClick={() => handleExpandView('quiz', msg.quiz)}
                                        className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                                        title="Expand view"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <QuizInline quiz={msg.quiz} />
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Typing indicator with Jeffrey */}
                {(isTyping || demoTyping || isToolLoading) && !isStreaming && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-start items-end gap-2"
                    >
                        <div className="scale-50 origin-bottom-left -ml-4 -mb-4">
                            <Jeffrey isTyping={true} />
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl border-2 border-black rounded-bl-none mb-2">
                            <p className="text-sm text-gray-600 font-medium">
                                {isGeneratingFlashcards && "Creating flashcards..."}
                                {isGeneratingInfographic && "Drawing infographic..."}
                                {isGeneratingSummary && "Writing summary..."}
                                {isGeneratingQuiz && "Making a quiz..."}
                                {!isToolLoading && "Thinking..."}
                            </p>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions - Collapsible */}
            {!demoMode && activeLesson && displayMessages.length <= 2 && suggestedQuestions.length > 0 && (
                <div className="px-4 pb-2">
                    <button
                        onClick={() => setShowSuggestedQuestions(!showSuggestedQuestions)}
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {showSuggestedQuestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Try asking ({suggestedQuestions.length})
                    </button>
                    <AnimatePresence>
                        {showSuggestedQuestions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-nanobanana-yellow border-2 border-black rounded-full transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Gemini Tools */}
            {!demoMode && (
                <div className="p-2 bg-gray-50 border-t-4 border-black space-y-2">
                    {/* Top row - 3 buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={handleGenerateFlashcards}
                            className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingFlashcards ? (
                                <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                            ) : (
                                <FileText className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-xs font-bold">Flashcards</span>
                        </button>
                        <button
                            onClick={handleGenerateInfographic}
                            className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-green transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingInfographic ? (
                                <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                            ) : (
                                <Image className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-xs font-bold">Infographic</span>
                        </button>
                        <button
                            onClick={handleGenerateSummary}
                            className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingSummary ? (
                                <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                            ) : (
                                <BookOpen className="w-5 h-5 mb-1" />
                            )}
                            <span className="text-xs font-bold">Summarize</span>
                        </button>
                    </div>
                    {/* Quiz button - full width */}
                    <button
                        onClick={handleGenerateQuiz}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500 text-white border-2 border-black rounded-xl hover:bg-purple-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChatDisabled || isToolLoading}
                    >
                        {isGeneratingQuiz ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <HelpCircle className="w-5 h-5" />
                        )}
                        <span className="font-bold">Take a Quiz</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t-2 border-gray-200">
                {demoMode ? (
                    <div className="h-12 bg-gray-100 rounded-xl border-2 border-gray-300 flex items-center px-4 text-gray-400 italic text-sm">
                        Ask Jeffrey anything...
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={activeLesson ? "Ask Jeffrey about the lesson..." : "Upload a lesson to start chatting..."}
                            disabled={isInputDisabled}
                            className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isInputDisabled || !input.trim()}
                            className="p-3 bg-nanobanana-blue text-white border-2 border-black rounded-xl hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Input hints */}
                {!demoMode && !isChatDisabled && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 px-1">
                        <span>Press Enter to send</span>
                        {safetyFlags.length > 0 && (
                            <span className="flex items-center gap-1">
                                Safety filters active
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded View Modal */}
            <ExpandedViewModal
                isOpen={expandedView.isOpen}
                onClose={handleCloseExpandedView}
                type={expandedView.type}
                data={expandedView.data}
            />
        </div>
    );
};

export default ChatInterface;
