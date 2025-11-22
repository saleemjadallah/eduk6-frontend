import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PainPointCardProps {
  icon: ReactNode;
  image?: string;
  stat: string;
  label: string;
  description: string;
  color: 'red' | 'orange' | 'amber' | 'cyan';
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
  cyan: {
    bg: 'from-cyan-50/80 to-sky-100/80',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    shadow: 'shadow-cyan-500/10',
  },
};

export default function PainPointCard({ icon, image, stat, label, description, color }: PainPointCardProps) {
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
      <div className="mb-6">
        {image ? (
          <div className="w-20 h-20 -mt-2 -ml-2">
            <img src={image} alt={label} className="w-full h-full object-contain drop-shadow-lg" />
          </div>
        ) : (
          <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
        )}
      </div>
      <div className={`text-5xl font-extrabold mb-2 ${colors.text}`}>{stat}</div>
      <div className={`text-lg font-semibold mb-3 ${colors.text}`}>{label}</div>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
