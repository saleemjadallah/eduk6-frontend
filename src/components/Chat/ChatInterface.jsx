import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Video, FileText, Sparkles } from 'lucide-react';
import Jeffrey from '../Avatar/Jeffrey';

const ChatInterface = ({ demoMode = false, lesson = null }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize with context-aware greeting
    useEffect(() => {
        if (lesson) {
            setMessages([{
                id: 1,
                type: 'bot',
                text: `Hi! I'm Jeffrey! 🎉 I just read "${lesson.title}" and I'm ready to help you learn! What would you like to know?`
            }]);
        } else {
            setMessages([{
                id: 1,
                type: 'bot',
                text: "Hi! I'm Jeffrey. Upload a lesson and I'll help you learn! 📚"
            }]);
        }
    }, [lesson?.id]);

    useEffect(() => {
        if (demoMode) {
            const demoSequence = [
                { delay: 1000, type: 'user', text: "Tell me about the sun!" },
                { delay: 2500, type: 'bot', text: "The Sun is a giant star at the center of our Solar System! ☀️" },
                { delay: 4500, type: 'bot', text: "It gives us light and heat. Without it, Earth would be frozen!" },
                { delay: 6000, type: 'user', text: "Wow, that's hot!" },
                { delay: 7500, type: 'bot', text: "Super hot! It's about 27 million degrees Fahrenheit at the core! 🔥" }
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

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), type: 'user', text: input }]);
        setInput('');
        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "That sounds fun! Let's explore that." }]);
        }, 1000);
    };

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
                        <div className="flex items-center gap-1 text-xs font-bold opacity-70">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
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
                            <p className="font-medium text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Gemini3 Tools */}
            {!demoMode && (
                <div className="p-2 bg-gray-50 border-t-4 border-black grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                        <FileText className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Flashcards</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-nanobanana-green transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                        <Image className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Infographic</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-white border-2 border-black rounded-xl hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
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
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Jeffrey anything..."
                            className="flex-1 p-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-nanobanana-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-nanobanana-blue text-white border-2 border-black rounded-xl hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
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
