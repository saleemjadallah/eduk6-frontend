import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    title: string;
    url: string;
  }[];
}

interface JeffreyChatProps {
  visaContext?: {
    visaType?: string;
    destinationCountry?: string;
    nationality?: string;
    stage?: 'initial' | 'document_upload' | 'photo_generation' | 'form_filling' | 'review' | 'submitted';
    packageId?: number;
  };
  minimized?: boolean;
  onMinimize?: () => void;
  className?: string;
}

export function JeffreyChat({
  visaContext,
  minimized = false,
  onMinimize,
  className = '',
}: JeffreyChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load suggested questions
  useEffect(() => {
    loadSuggestedQuestions();
  }, [visaContext?.stage, visaContext?.visaType, visaContext?.destinationCountry]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `👋 Hi! I'm **Jeffrey**, your AI visa assistant. I'm here to help you navigate your visa application journey!

I can help you with:
✓ Document requirements
✓ Photo specifications
✓ Processing times and fees
✓ Form filling guidance
✓ Common mistakes to avoid

What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const loadSuggestedQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (visaContext?.stage) params.append('stage', visaContext.stage);
      if (visaContext?.visaType) params.append('visaType', visaContext.visaType);
      if (visaContext?.destinationCountry) params.append('destinationCountry', visaContext.destinationCountry);

      const response = await axios.get(`${API_URL}/api/visadocs/chat/suggestions?${params}`);
      if (response.data.success) {
        setSuggestedQuestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/visadocs/chat`,
        {
          message: messageToSend,
          sessionId,
          visaContext,
          useSearch: true,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const assistantMessage: Message = response.data.data.message;
        setMessages((prev) => [...prev, assistantMessage]);
        setSessionId(response.data.data.sessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment. 🙏",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Chat cleared! What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setSessionId(null);
  };

  if (minimized) {
    return (
      <button
        onClick={onMinimize}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
        aria-label="Open Jeffrey Chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          ✓
        </span>
      </button>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="/assets/new-jeffrey-removebg-preview.png"
              alt="Jeffrey"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">Jeffrey</h3>
            <p className="text-xs text-blue-100">AI Visa Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
            title="Clear chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
              title="Minimize chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 max-h-[500px] min-h-[400px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
                }`}
            >
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />')
                  .replace(/✓/g, '<span class="text-green-600">✓</span>')
                  .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
              }} />
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <p className="font-semibold mb-2">Sources:</p>
                  {message.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline mb-1"
                    >
                      [{idx + 1}] {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && suggestedQuestions.length > 0 && (
        <div className="px-6 py-3 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-semibold">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors"
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Jeffrey anything..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-full transition-colors font-semibold disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Jeffrey is an AI assistant. For legal advice, consult a licensed immigration lawyer.
        </p>
      </div>
    </div>
  );
}
