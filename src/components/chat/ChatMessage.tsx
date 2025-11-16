import React from 'react';
import { cn } from '../../utils/cn';
import { JeffreyMessage } from '../../types/unified';
import { ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: JeffreyMessage;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, className }) => {
  const isJeffrey = message.role === 'assistant';

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    // Bold text **text**
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic text *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    // Bullet points
    formatted = formatted.replace(/^- (.*?)$/gm, '• $1');

    return formatted;
  };

  return (
    <div
      className={cn(
        'flex flex-col max-w-[90%]',
        isJeffrey ? 'self-start' : 'self-end',
        className
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm',
          isJeffrey
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-neutral-800'
            : 'bg-white border border-neutral-200 text-neutral-900'
        )}
      >
        <div
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          className="leading-relaxed"
        />

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-100">
            <p className="text-xs font-medium text-neutral-500 mb-1">Sources:</p>
            <div className="space-y-1">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <span
        className={cn(
          'text-xs text-neutral-400 mt-1',
          isJeffrey ? 'ml-2' : 'mr-2 text-right'
        )}
      >
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};
