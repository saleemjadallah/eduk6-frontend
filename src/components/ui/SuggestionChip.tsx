import React from 'react';
import { cn } from '../../utils/cn';

interface SuggestionChipProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  onClick,
  children,
  className,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center px-3 py-1.5 text-xs font-medium',
        'bg-white border border-neutral-200 rounded-full',
        'text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300',
        'transition-all duration-150 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-sm hover:shadow',
        className
      )}
    >
      {children}
    </button>
  );
};
