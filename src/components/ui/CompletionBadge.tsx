import React from 'react';
import { cn } from '../../utils/cn';

interface CompletionBadgeProps {
  value: number;
  className?: string;
  showPercentage?: boolean;
}

export const CompletionBadge: React.FC<CompletionBadgeProps> = ({
  value,
  className,
  showPercentage = true,
}) => {
  const getColorClass = () => {
    if (value === 100) return 'bg-green-100 text-green-700';
    if (value >= 75) return 'bg-blue-100 text-blue-700';
    if (value >= 50) return 'bg-yellow-100 text-yellow-700';
    if (value >= 25) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full font-semibold',
        getColorClass(),
        className
      )}
    >
      {showPercentage ? `${value}% Complete` : value}
    </span>
  );
};
