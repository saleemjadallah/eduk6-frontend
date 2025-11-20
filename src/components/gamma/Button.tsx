import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/design-system';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'gradient' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  asChild?: boolean;
}

const variants = {
  gradient: `bg-gradient-to-r from-blue-600 to-cyan-500 text-white
             shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70`,
  outline: `bg-white/80 backdrop-blur-sm text-gray-900 border-2 border-gray-200
            hover:bg-white hover:border-gray-300`,
  ghost: `bg-transparent text-gray-700 hover:bg-gray-100`,
  white: `bg-white text-blue-600 shadow-xl hover:bg-gray-50`,
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-2xl',
};

export default function Button({
  children,
  variant = 'gradient',
  size = 'md',
  className,
  asChild,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'font-semibold transition-all duration-300 ease-out',
        'inline-flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
