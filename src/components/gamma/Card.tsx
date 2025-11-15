import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/design-system';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className, hover = true, gradient = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-3xl p-8',
        gradient
          ? 'bg-gradient-to-br from-white to-blue-50'
          : 'bg-white',
        'shadow-lg',
        hover && 'hover:shadow-2xl',
        'transition-all duration-500',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
