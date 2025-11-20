import React, { useRef, useEffect, useState } from 'react';
import { Send, FileText, CheckCircle, Camera, Plane } from 'lucide-react';
import { cn } from '../utils/cn';
import { useJeffrey } from '../contexts/JeffreyContext';
import { ContextBadge } from './ui/ContextBadge';
import { ChatMessage } from './chat/ChatMessage';
import { TypingIndicator } from './chat/TypingIndicator';
import { QuickSuggestions } from './chat/QuickSuggestions';

interface JeffreySidebarProps {
  className?: string;
}

export const JeffreySidebar: React.FC<JeffreySidebarProps> = ({ className }) => {
  const {
    context,
    messages,
    isTyping,
    suggestions,
    sendMessage,
  } = useJeffrey();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-[300px]',
        'bg-white/80 backdrop-blur-xl border-r border-white/50',
        'flex flex-col',
        'shadow-lg z-40',
        className
      )}
    >
      {/* Jeffrey Header */}
      <div className="p-4 border-b border-white/50">
        <div className="flex items-center gap-3 mb-3">
          {/* Jeffrey Avatar with AI indicator */}
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full
                         flex items-center justify-center
                         shadow-lg overflow-hidden"
            >
              <img
                src="/assets/new-jeffrey-removebg-preview.png"
                alt="Jeffrey AI Assistant"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Pulsing "online" indicator */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full
                         border-2 border-white animate-pulse"
            />
          </div>

          <div>
            <h3 className="font-bold text-neutral-900">Jeffrey</h3>
            <p className="text-xs text-neutral-500">Your AI Visa Guide</p>
          </div>
        </div>

        {/* Context Badge - Shows what Jeffrey is currently helping with */}
        <ContextBadge workflow={context.workflow} />
      </div>

      {/* Chat Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* System Message - Jeffrey introduces himself */}
        {messages.length === 0 && (
          <div
            className="bg-gradient-to-br from-blue-50 to-cyan-50
                       rounded-2xl p-4 border border-blue-100"
          >
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
              Powered by AI
            </span>
            <p className="text-sm text-neutral-700 mb-3">
              Hi! I'm Jeffrey, your AI visa assistant. I'm here to guide you through:
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Auto-filling visa application forms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Validating your documents</span>
              </li>
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Generating visa-compliant photos</span>
              </li>
              <li className="flex items-start gap-2">
                <Plane className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Planning your travel itinerary</span>
              </li>
            </ul>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Jeffrey is typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestions - Context-aware */}
      <QuickSuggestions
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        disabled={isTyping}
      />

      {/* Chat Input */}
      <div className="p-4 border-t border-white/50">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jeffrey anything..."
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 pr-12
                       resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm placeholder-neutral-400"
            rows={2}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg
                       bg-gradient-to-r from-blue-500 to-cyan-600
                       text-white flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-lg hover:scale-105 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
