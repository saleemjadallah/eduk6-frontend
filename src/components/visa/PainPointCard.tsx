import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PainPointCardProps {
  icon: ReactNode;
  stat: string;
  label: string;
  description: string;
  color: 'red' | 'orange' | 'amber' | 'purple';
}

const colorClasses = {
  red: {
    bg: 'from-red-50/80 to-red-100/80',
    border: 'border-red-200/50',
    text: 'text-red-900',
    shadow: 'shadow-red-500/10',
  },
  orange: {
    bg: 'from-orange-50/80 to-orange-100/80',
    border: 'border-orange-200/50',
    text: 'text-orange-900',
    shadow: 'shadow-orange-500/10',
  },
  amber: {
    bg: 'from-amber-50/80 to-amber-100/80',
    border: 'border-amber-200/50',
    text: 'text-amber-900',
    shadow: 'shadow-amber-500/10',
  },
  purple: {
    bg: 'from-purple-50/80 to-purple-100/80',
    border: 'border-purple-200/50',
    text: 'text-purple-900',
    shadow: 'shadow-purple-500/10',
  },
};

export default function PainPointCard({ icon, stat, label, description, color }: PainPointCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors.bg}
        backdrop-blur-md
        border ${colors.border}
        rounded-3xl p-8
        shadow-lg ${colors.shadow}
        hover:shadow-xl
        transition-all duration-300
      `}
    >
      <div className="mb-4">{icon}</div>
      <div className={`text-5xl font-extrabold mb-2 ${colors.text}`}>{stat}</div>
      <div className={`text-lg font-semibold mb-3 ${colors.text}`}>{label}</div>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
