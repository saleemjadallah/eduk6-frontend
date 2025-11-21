import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RejectionReasonCardProps {
  icon?: ReactNode;
  image?: string;
  title: string;
  description: string;
  percentage: string;
}

export default function RejectionReasonCard({ icon, image, title, description, percentage }: RejectionReasonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="
        relative overflow-hidden
        bg-white/70 backdrop-blur-md
        border border-white/50
        rounded-3xl p-8
        shadow-lg hover:shadow-xl
        transition-all duration-300
      "
    >
      <div className="flex items-start justify-between mb-6">
        {image ? (
          <div className="w-20 h-20 -mt-2 -ml-2">
            <img src={image} alt={title} className="w-full h-full object-contain drop-shadow-lg" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <div className="text-white">{icon}</div>
          </div>
        )}
        <div className="text-right">
          <div className="text-4xl font-bold text-red-600">{percentage}</div>
          <div className="text-sm text-neutral-500">of rejections</div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
