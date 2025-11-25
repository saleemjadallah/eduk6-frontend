import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Video, FileText, Sparkles, Clock } from 'lucide-react';
import Jeffrey from '../Avatar/Jeffrey';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonActions } from '../../hooks/useLessonActions';

const ChatInterface = ({
    demoMode = false,
    lesson = null,
    onInteraction,
    initialInput = '',
    onInputChange
}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState(initialInput);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Use context for enhanced features
    const { isReady, currentStageInfo, isProcessing } = useLessonContext();
    const {
        getSuggestedQuestions,
        addChatMessage,
        getCurrentLessonTimeSpent,
        getChatContext
    } = useLessonActions();

    // Use prop lesson or get from context
    const activeLesson = lesson;

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

    // Initialize with context-aware greeting
    useEffect(() => {
        if (activeLesson) {
            setMessages([{
                id: 1,
                type: 'bot',
                text: `Hi! I'm Jeffrey! I just read "${activeLesson.title}" and I'm ready to help you learn! What would you like to know?`
            }]);
        } else {
            setMessages([{
                id: 1,
                type: 'bot',
                text: "Hi! I'm Jeffrey. Upload a lesson and I'll help you learn!"
            }]);
        }
    }, [activeLesson?.id]);

    // Demo mode sequence
    useEffect(() => {
        if (demoMode) {
            const demoSequence = [
                { delay: 1000, type: 'user', text: "Tell me about the sun!" },
                { delay: 2500, type: 'bot', text: "The Sun is a giant star at the center of our Solar System!" },
                { delay: 4500, type: 'bot', text: "It gives us light and heat. Without it, Earth would be frozen!" },
                { delay: 6000, type: 'user', text: "Wow, that's hot!" },
                { delay: 7500, type: 'bot', text: "Super hot! It's about 27 million degrees Fahrenheit at the core!" }
            ];

            let timeouts = [];
            demoSequence.forEach(({ delay, type, text }, index) => {
                const timeout = setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + index, type, text }]);
                }, delay);
                timeouts.push(timeout);
            });

            return () => timeouts.forEach(clearTimeout);
        }
    }, [demoMode]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        handleInputChange('');

        // Track chat message in lesson context
        if (activeLesson) {
            addChatMessage({ role: 'user', content: input });
        }

        // Notify parent of interaction (for gamification)
        if (onInteraction) {
            onInteraction();
        }

        // Show typing indicator
        setIsTyping(true);

        // Simulate bot response (replace with actual Gemini API call)
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: generateContextualResponse(input, activeLesson)
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);

            // Track bot response
            if (activeLesson) {
                addChatMessage({ role: 'assistant', content: botResponse.text });
            }
        }, 1000);
    };

    // Generate a contextual response based on the lesson
    const generateContextualResponse = (question, lesson) => {
        if (!lesson) {
            return "Upload a lesson first, and I'll help you learn about it!";
        }

        const lowercaseQuestion = question.toLowerCase();

        // Simple contextual responses (replace with actual AI)
        if (lowercaseQuestion.includes('summary') || lowercaseQuestion.includes('about')) {
            return lesson.content?.summary || "Let me help you understand this lesson better!";
        }
        if (lowercaseQuestion.includes('key') || lowercaseQuestion.includes('important')) {
            const keyPoints = lesson.content?.keyPoints || [];
            if (keyPoints.length > 0) {
                return `Here are the key points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
            }
        }
        if (lowercaseQuestion.includes('vocabulary') || lowercaseQuestion.includes('word')) {
            const vocab = lesson.content?.vocabulary || [];
            if (vocab.length > 0) {
                return `Let me explain some key terms:\n${vocab.slice(0, 3).map(v => `- ${v.term}: ${v.definition}`).join('\n')}`;
            }
        }

        return "That's a great question! Let me help you understand this better.";
    };

    // Get suggested questions
    const suggestedQuestions = getSuggestedQuestions();

    const handleSuggestedQuestion = (question) => {
        handleInputChange(question);
    };

    // Determine if chat should be disabled
    const isChatDisabled = !demoMode && !activeLesson && !isProcessing;

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
                {!demoMode && (
                    <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <Sparkles className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.type === 'user'
                                ? 'bg-nanobanana-blue text-white rounded-br-none'
                                : 'bg-gray-100 text-black rounded-bl-none'
                                }`}
                        >
                            <p className="font-medium text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-gray-100 p-3 rounded-2xl border-2 border-black rounded-bl-none">
                            <div className="flex gap-1">
                                <motion.span
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.span
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.span
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {!demoMode && activeLesson && messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <p className="text-xs font-bold text-gray-500 mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.slice(0, 3).map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                                className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-nanobanana-yellow border-2 border-black rounded-full transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Gemini Tools */}
            {!demoMode && (
                <div className="p-2 bg-gray-50 border-t-4 border-black grid grid-cols-3 gap-2">
                    <button
                        className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChatDisabled}
                    >
                        <FileText className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Flashcards</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-green transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChatDisabled}
                    >
                        <Image className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Infographic</span>
                    </button>
                    <button
                        className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isChatDisabled}
                    >
                        <Video className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Video</span>
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
                            type="text"
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={activeLesson ? "Ask Jeffrey about the lesson..." : "Upload a lesson to start chatting..."}
                            disabled={isChatDisabled}
                            className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isChatDisabled || !input.trim()}
                            className="p-3 bg-nanobanana-blue text-white border-2 border-black rounded-xl hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
