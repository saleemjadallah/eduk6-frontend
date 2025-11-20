import { ReactNode } from 'react';
import { cn } from '../../lib/design-system';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gradient' | 'outline' | 'white' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variants = {
  gradient: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
  outline: 'bg-white border border-gray-200 text-gray-700',
  white: 'bg-white/10 backdrop-blur-lg border border-white/20 text-white',
  secondary: 'bg-blue-100 text-blue-700',
};

const sizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Badge({ children, variant = 'outline', size = 'md', className }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold',
        'transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
