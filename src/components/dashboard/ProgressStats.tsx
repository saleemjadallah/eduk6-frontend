import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProgressStatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  total: number;
  className?: string;
}

export const ProgressStat: React.FC<ProgressStatProps> = ({
  icon: Icon,
  label,
  value,
  total,
  className,
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={cn('text-center', className)}>
      <Icon className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
      <p className="text-2xl font-bold text-neutral-900">
        {value}/{total}
      </p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
      <p className="text-xs font-semibold text-indigo-600 mt-1">{percentage}%</p>
    </div>
  );
};
