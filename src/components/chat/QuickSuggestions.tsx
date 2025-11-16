import React from 'react';
import { cn } from '../../utils/cn';
import { SuggestionChip } from '../ui/SuggestionChip';

interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
  disabled?: boolean;
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  className,
  disabled = false,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('p-3 border-t border-neutral-200 bg-neutral-50', className)}>
      <p className="text-xs font-semibold text-neutral-500 mb-2">Quick Asks:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <SuggestionChip
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
          >
            {suggestion.length > 30 ? `${suggestion.substring(0, 30)}...` : suggestion}
          </SuggestionChip>
        ))}
      </div>
    </div>
  );
};
