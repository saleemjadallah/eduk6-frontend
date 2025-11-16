import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  gradient = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-neutral-700">Progress</span>
          <span className="text-sm font-semibold text-neutral-900">{Math.round(percentage)}%</span>
        </div>
      )}

      <div
        className={cn(
          'w-full bg-neutral-100 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            gradient
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
              : 'bg-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
