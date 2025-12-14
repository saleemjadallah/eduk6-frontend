import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, FileText, Sparkles, Clock, RefreshCw, Trash2, BookOpen, Loader2, HelpCircle, ZoomIn, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// Maximum messages allowed in demo mode before prompting sign-up
const DEMO_MESSAGE_LIMIT = 3;
const DEMO_STORAGE_KEY = 'orbit_demo_chat_count';

// Helper to get/set demo count from localStorage
const getDemoCountFromStorage = () => {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Reset if older than 24 hours
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                return data.count;
            }
        }
    } catch (e) {
        // Ignore storage errors
    }
    return 0;
};

const setDemoCountInStorage = (count) => {
    try {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
            count,
            timestamp: Date.now(),
        }));
    } catch (e) {
        // Ignore storage errors
    }
};

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
    const navigate = useNavigate();

    // Demo mode - track user message count from localStorage
    const [demoUserMessageCount, setDemoUserMessageCount] = useState(() => getDemoCountFromStorage());
    const [demoLimitReached, setDemoLimitReached] = useState(() => getDemoCountFromStorage() >= DEMO_MESSAGE_LIMIT);

    // Always call hooks (React rules), but ignore values in demo mode
    const lessonContextRaw = useLessonContext();
    const lessonActionsRaw = useLessonActions();

    // Get chat context - may not be available
    let chatContextRaw = null;
    try {
        chatContextRaw = useChatContext();
    } catch (e) {
        // ChatContext not available
    }

    // In demo mode, null out all context values to avoid any auth-related side effects
    const lessonContext = demoMode ? null : lessonContextRaw;
    const { isReady, currentStageInfo, isProcessing } = lessonContext || {};
    const chatContext = demoMode ? null : chatContextRaw;
    const { getCurrentLessonTimeSpent } = demoMode ? {} : lessonActionsRaw;

    // Use prop lesson or get from context (skip in demo mode)
    const activeLesson = demoMode ? null : (lesson || lessonContext?.currentLesson);

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
    // In demo mode, use local state and ignore all context values
    const messages = demoMode ? demoMessages : (chatContext?.messages || []);
    const isTyping = demoMode ? false : (chatContext?.isLoading && !chatContext?.isStreaming);
    const isStreaming = demoMode ? false : (chatContext?.isStreaming || false);
    const safetyFlags = demoMode ? [] : (chatContext?.safetyFlags || []);
    const error = demoMode ? null : chatContext?.error;
    const suggestedQuestions = demoMode ? [] : (chatContext?.suggestedQuestions || []);

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
    // Skip scrolling entirely in demo mode to prevent page scroll on landing page
    useEffect(() => {
        if (!demoMode) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages, demoMode]);

    // Initialize with interactive greeting for demo mode
    useEffect(() => {
        if (demoMode) {
            setDemoMessages([{
                id: 1,
                role: 'assistant',
                content: "Hi there! I'm Jeffrey, your learning buddy! Ask me anything you'd like to learn about - try questions like \"What are black holes?\" or \"How do plants grow?\" 🌟",
                timestamp: new Date(),
            }]);
        }
    }, [demoMode]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Check demo mode limit
        if (demoMode && demoLimitReached) {
            return;
        }

        const messageContent = input;
        handleInputChange('');

        // Use ChatContext if available
        if (chatContext?.sendMessage) {
            await chatContext.sendMessage(messageContent);
        } else if (demoMode) {
            // Demo mode - fully client-side, no API dependency
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: messageContent,
                timestamp: new Date(),
            };
            setDemoMessages(prev => [...prev, userMessage]);

            // Increment user message count and persist to localStorage
            const newCount = demoUserMessageCount + 1;
            setDemoUserMessageCount(newCount);
            setDemoCountInStorage(newCount);

            // Check if limit reached after this message
            if (newCount >= DEMO_MESSAGE_LIMIT) {
                setDemoLimitReached(true);
                // Add limit reached message
                setDemoTyping(true);
                setTimeout(() => {
                    setDemoMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        role: 'assistant',
                        content: "I'm having so much fun chatting with you! 🎉 To keep learning together, sign up for free - it only takes a minute!",
                        timestamp: new Date(),
                        isLimitMessage: true,
                    }]);
                    setDemoTyping(false);
                }, 800);
                return;
            }

            // Use client-side responses for reliable demo experience
            setDemoTyping(true);

            // Simulate natural typing delay (500-1500ms based on response length)
            const response = getDemoResponse(messageContent);
            const typingDelay = Math.min(500 + response.length * 5, 1500);

            setTimeout(() => {
                setDemoMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response,
                    timestamp: new Date(),
                }]);
                setDemoTyping(false);
            }, typingDelay);
        }

        // Notify parent of interaction (for gamification)
        if (onInteraction) {
            onInteraction();
        }

        // Refocus input (skip in demo mode to not trigger page scroll)
        if (!demoMode) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // Client-side demo responses - comprehensive educational responses
    const getDemoResponse = (question) => {
        const q = question.toLowerCase().trim();

        // Greetings
        if (/^(hi|hello|hey|howdy|hiya|greetings)/i.test(q) || q === 'hi' || q === 'hello') {
            return "Hello! 👋 I'm so happy to meet you! What would you like to learn about today? I can help with math, science, history, or anything you're curious about!";
        }

        // Plants and growth
        if (q.includes('plant') && (q.includes('grow') || q.includes('how'))) {
            return "Plants are amazing! They grow by using sunlight, water, and air. Their leaves catch sunshine and turn it into food through a process called photosynthesis. The roots drink up water from the soil. It's like magic happening right in your backyard! 🌱";
        }
        if (q.includes('flower') || q.includes('tree')) {
            return "Trees and flowers are incredible! They start as tiny seeds, then use sunlight and water to grow bigger and bigger. Some trees can live for hundreds of years! Flowers make seeds so new plants can grow. 🌸🌳";
        }

        // Space and astronomy
        if (q.includes('black hole')) {
            return "Black holes are super fascinating! They're places in space where gravity is so strong that nothing can escape - not even light! That's why they look black. Scientists think there might be millions of them in our galaxy. 🌌";
        }
        if (q.includes('sun') || q.includes('star')) {
            return "The Sun is amazing! It's a giant ball of hot, glowing gas that gives us light and warmth. Did you know it's so big that about 1.3 million Earths could fit inside it? And it's actually a star - the closest one to us! ☀️";
        }
        if (q.includes('moon')) {
            return "The Moon is Earth's best friend in space! It's about 238,900 miles away and takes about 27 days to go around Earth. That's why we see different shapes - full moon, half moon, and crescent! 🌙";
        }
        if (q.includes('space') || q.includes('planet') || q.includes('solar system')) {
            return "Space is incredible! Our solar system has 8 planets orbiting the Sun. Earth is the third planet and the only one we know has life. Jupiter is the biggest - you could fit 1,300 Earths inside it! 🚀";
        }
        if (q.includes('mars')) {
            return "Mars is called the Red Planet because of the rusty iron in its soil! It has the biggest volcano in our solar system - Olympus Mons. Scientists are exploring it with robots called rovers. 🔴";
        }

        // Dinosaurs
        if (q.includes('dinosaur') || q.includes('t-rex') || q.includes('trex')) {
            return "Dinosaurs are so cool! They ruled Earth for over 160 million years! T-Rex was one of the biggest meat-eaters, but some dinosaurs were gentle plant-eaters. Scientists learn about them by studying fossils! 🦕";
        }

        // Animals
        if (q.includes('whale') || q.includes('ocean') || q.includes('shark')) {
            return "Ocean animals are amazing! Blue whales are the biggest animals EVER - even bigger than dinosaurs! Sharks have been around for over 400 million years, and there are so many colorful fish in coral reefs! 🐋";
        }
        if (q.includes('lion') || q.includes('tiger') || q.includes('elephant')) {
            return "These are some of the most incredible animals! Lions are called the 'King of the Jungle' and live in family groups. Elephants are the largest land animals and are super smart! 🦁🐘";
        }
        if (q.includes('dog') || q.includes('cat') || q.includes('pet')) {
            return "Dogs and cats make wonderful friends! Dogs are known for their loyalty and have been human companions for over 15,000 years. Cats are curious and playful. Both can learn tricks! 🐕🐱";
        }
        if (q.includes('bird') || q.includes('fly')) {
            return "Birds are the only animals with feathers! Some can fly thousands of miles during migration. The peregrine falcon is the fastest animal on Earth - it can dive at over 200 mph! 🦅";
        }
        if (q.includes('insect') || q.includes('bug') || q.includes('butterfly') || q.includes('bee')) {
            return "Insects are everywhere! Butterflies start as caterpillars, bees make honey and help flowers grow, and ants can carry 50 times their own weight! There are more insects on Earth than any other animal! 🦋🐝";
        }
        if (q.includes('animal')) {
            return "Animals are fascinating! There are millions of different species - from tiny ants to enormous elephants. Each one has special features that help it survive. What's your favorite animal? 🐾";
        }

        // Math
        if (q.includes('math') || q.includes('add') || q.includes('subtract') || q.includes('multiply') || q.includes('divide')) {
            return "Math is like a superpower! Addition puts numbers together, subtraction takes them apart. Multiplication is super-fast adding, and division is sharing equally. You use math every day without even knowing it! ➕✖️";
        }
        if (q.includes('fraction')) {
            return "Fractions show parts of a whole! Like when you share a pizza 🍕 - if you cut it into 4 slices and eat 1, you ate 1/4 (one-fourth). The top number counts pieces you have, the bottom shows total pieces!";
        }

        // Science
        if (q.includes('water') || q.includes('rain') || q.includes('cloud')) {
            return "The water cycle is amazing! Water from oceans and lakes turns into vapor (that's evaporation), rises up to form clouds, then falls back down as rain or snow. The same water has been cycling for millions of years! 💧☁️";
        }
        if (q.includes('volcano')) {
            return "Volcanoes are like Earth's pressure release valves! Deep underground, it's so hot that rocks melt into lava. When pressure builds up, the volcano erupts! Some volcanoes are quiet, others are super explosive! 🌋";
        }
        if (q.includes('rainbow')) {
            return "Rainbows happen when sunlight shines through raindrops! The water splits white light into all its colors - red, orange, yellow, green, blue, indigo, and violet. Remember: ROY G BIV! 🌈";
        }
        if (q.includes('electric') || q.includes('lightning')) {
            return "Electricity is the flow of tiny particles called electrons! Lightning is natural electricity - clouds build up electrical charge until ZAP! It releases in a giant spark that's hotter than the sun's surface! ⚡";
        }

        // History
        if (q.includes('egypt') || q.includes('pyramid')) {
            return "Ancient Egypt is fascinating! The pyramids were built over 4,500 years ago as tombs for pharaohs. The Great Pyramid was the tallest building in the world for almost 4,000 years! They also invented paper! 🏛️";
        }
        if (q.includes('history') || q.includes('ancient')) {
            return "History is like a time machine! We learn about people who lived long ago - how they built amazing things, made discoveries, and solved problems. Every day, we're making history too! 📚";
        }

        // Body and health
        if (q.includes('body') || q.includes('heart') || q.includes('brain')) {
            return "Your body is incredible! Your heart beats about 100,000 times a day, pumping blood everywhere. Your brain has 86 billion neurons and controls everything you do - even while you're sleeping! 🧠❤️";
        }

        // Weather
        if (q.includes('weather') || q.includes('tornado') || q.includes('hurricane')) {
            return "Weather is the condition of the air around us! Tornadoes are spinning columns of air, hurricanes are giant storms that form over warm ocean water. Meteorologists study weather to help keep us safe! 🌪️";
        }

        // Generic educational response with encouragement
        return "That's a great question! I'd love to help you learn about that. Sign up to chat with me more! 🌟";
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

            const response = await chatAPI.generateQuiz({
                content,
                title: activeLesson.title,
                count: 5,
                childId,
                ageGroup,
            });

            const quiz = response.data;

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

            if (demoMode) {
                setDemoMessages(prev => [...prev, userMsg, quizMsg]);
            } else if (chatContext?.addMessages) {
                chatContext.addMessages([userMsg, quizMsg]);
            } else {
                // Fallback: use local state if chatContext not available
                setDemoMessages(prev => [...prev, userMsg, quizMsg]);
            }
        } catch (error) {
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
        <div className={`flex-1 flex flex-col bg-white rounded-2xl md:rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-3 md:border-4 border-black overflow-hidden ${demoMode ? 'h-full' : ''}`}>
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
                        <div className="flex items-end gap-2">
                            <img
                                src="/assets/images/jeffrey-avatar.png"
                                alt="Jeffrey"
                                className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                            />
                            <div className="max-w-[80%] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 text-black rounded-bl-none">
                                <p className="font-medium text-sm whitespace-pre-wrap">
                                    {chatContext.welcomeMessage}
                                </p>
                            </div>
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
                            <div className={`flex items-end gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Jeffrey avatar for bot messages */}
                                {msg.type === 'bot' && (
                                    <img
                                        src="/assets/images/jeffrey-avatar.png"
                                        alt="Jeffrey"
                                        className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                    />
                                )}
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
                            </div>
                        )}

                        {/* Flashcards message */}
                        {msg.messageType === 'flashcards' && msg.flashcards && (
                            <div className="flex items-start gap-2">
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey"
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                />
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
                            </div>
                        )}

                        {/* Summary message */}
                        {msg.messageType === 'summary' && msg.summary && (
                            <div className="flex items-start gap-2">
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey"
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                />
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
                            </div>
                        )}

                        {/* Infographic message */}
                        {msg.messageType === 'infographic' && msg.imageData && (
                            <div className="flex items-start gap-2">
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey"
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                />
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
                            </div>
                        )}

                        {/* Image message (from chat drawing requests) */}
                        {msg.messageType === 'image' && msg.imageData && (
                            <div className="flex items-start gap-2">
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey"
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                />
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
                            </div>
                        )}

                        {/* Quiz message */}
                        {msg.messageType === 'quiz' && msg.quiz && (
                            <div className="flex items-start gap-2">
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey"
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                                />
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
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Typing indicator - Jeffrey avatar with animated dots */}
                {(isTyping || demoTyping || isToolLoading) && !isStreaming && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-start"
                    >
                        <div className="relative">
                            {/* Jeffrey circular avatar */}
                            <motion.div
                                className="w-12 h-12"
                                animate={{ y: [-2, 2] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                    ease: 'easeInOut',
                                }}
                            >
                                <img
                                    src="/assets/images/jeffrey-avatar.png"
                                    alt="Jeffrey thinking"
                                    className="w-full h-full object-cover rounded-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </motion.div>
                            {/* Animated typing dots */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-1 -right-1 bg-white px-2 py-1.5 rounded-full border-2 border-black shadow-md"
                            >
                                <div className="flex gap-1">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                        className="w-2 h-2 bg-nanobanana-blue rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                                        className="w-2 h-2 bg-nanobanana-blue rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                                        className="w-2 h-2 bg-nanobanana-blue rounded-full"
                                    />
                                </div>
                            </motion.div>
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

            {/* Gemini Tools - iPad touch optimized */}
            {!demoMode && (
                <div className="p-1.5 md:p-2 bg-gray-50 border-t-2 md:border-t-4 border-black space-y-1.5 md:space-y-2">
                    {/* Top row - 3 buttons */}
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                        <button
                            onClick={handleGenerateFlashcards}
                            className="flex flex-col items-center justify-center p-2 md:p-3 min-h-[52px] md:min-h-[60px] bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingFlashcards ? (
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 mb-1 animate-spin" />
                            ) : (
                                <FileText className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                            )}
                            <span className="text-[10px] md:text-xs font-bold">Flashcards</span>
                        </button>
                        <button
                            onClick={handleGenerateInfographic}
                            className="flex flex-col items-center justify-center p-2 md:p-3 min-h-[52px] md:min-h-[60px] bg-white border-2 border-black rounded-xl hover:bg-nanobanana-green transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingInfographic ? (
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 mb-1 animate-spin" />
                            ) : (
                                <Image className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                            )}
                            <span className="text-[10px] md:text-xs font-bold">Infographic</span>
                        </button>
                        <button
                            onClick={handleGenerateSummary}
                            className="flex flex-col items-center justify-center p-2 md:p-3 min-h-[52px] md:min-h-[60px] bg-white border-2 border-black rounded-xl hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isChatDisabled || isToolLoading}
                        >
                            {isGeneratingSummary ? (
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 mb-1 animate-spin" />
                            ) : (
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                            )}
                            <span className="text-[10px] md:text-xs font-bold">Summarize</span>
                        </button>
                    </div>
                    {/* Quiz button - full width */}
                    <button
                        onClick={handleGenerateQuiz}
                        className="w-full flex items-center justify-center gap-2 p-2.5 md:p-3 min-h-[48px] md:min-h-[52px] bg-purple-500 text-white border-2 border-black rounded-xl hover:bg-purple-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChatDisabled || isToolLoading}
                    >
                        {isGeneratingQuiz ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <HelpCircle className="w-5 h-5" />
                        )}
                        <span className="font-bold text-sm md:text-base">Take a Quiz</span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t-2 border-gray-200">
                {demoMode ? (
                    demoLimitReached ? (
                        // Show sign-up CTA when limit reached
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate('/onboarding')}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-nanobanana-green text-white border-2 border-black rounded-xl hover:bg-green-600 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none font-bold"
                        >
                            <Sparkles className="w-5 h-5" />
                            Sign Up Free to Keep Learning!
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        // Interactive demo input
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything! Try: What are dinosaurs?"
                                disabled={demoTyping}
                                className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={demoTyping || !input.trim()}
                                className="p-3 bg-nanobanana-blue text-white border-2 border-black rounded-xl hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    )
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

                {/* Demo mode message counter */}
                {demoMode && !demoLimitReached && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 px-1">
                        <span>Press Enter to send</span>
                        <span>{DEMO_MESSAGE_LIMIT - demoUserMessageCount} free messages left</span>
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
