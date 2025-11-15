import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CountryCardProps {
  flag: string;
  name: string;
  visaTypes: string[];
}

export default function CountryCard({ flag, name, visaTypes }: CountryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="
        bg-white
        border-2 border-neutral-200
        rounded-3xl p-6
        shadow-lg hover:shadow-xl
        hover:border-primary-300
        transition-all duration-300
        text-center
      "
    >
      <div className="text-6xl mb-4">{flag}</div>
      <h3 className="text-xl font-bold text-neutral-900 mb-4">{name}</h3>
      <div className="space-y-2">
        {visaTypes.map((type) => (
          <div key={type} className="flex items-center justify-start gap-2 text-neutral-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">{type}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
