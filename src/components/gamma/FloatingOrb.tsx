import { motion } from 'framer-motion';
import { cn } from '../../lib/design-system';

interface FloatingOrbProps {
  color?: 'primary' | 'secondary' | 'accent';
  size?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  blur?: string;
  opacity?: number;
  animate?: boolean;
  delay?: number;
  className?: string;
}

const colorMap = {
  primary: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  secondary: 'bg-gradient-to-br from-blue-500 to-blue-600',
  accent: 'bg-gradient-to-br from-emerald-500 to-green-600',
};

const positionMap = {
  'top-left': '-top-32 -left-32',
  'top-right': '-top-32 -right-32',
  'bottom-left': '-bottom-32 -left-32',
  'bottom-right': '-bottom-32 -right-32',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export default function FloatingOrb({
  color = 'primary',
  size = '600px',
  position = 'top-left',
  blur = '120px',
  opacity = 0.4,
  animate = true,
  delay = 0,
  className,
}: FloatingOrbProps) {
  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? {
        scale: [0.8, 1.2, 0.8],
        opacity: [opacity * 0.5, opacity, opacity * 0.5],
      } : undefined}
      transition={animate ? {
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      } : undefined}
      className={cn(
        'absolute rounded-full pointer-events-none',
        colorMap[color],
        positionMap[position],
        className
      )}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur})`,
        opacity: animate ? undefined : opacity,
      }}
    />
  );
}
