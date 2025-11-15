import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion } from 'framer-motion';
import { cn } from '../../lib/design-system';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  label?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  label,
  className,
}: BeforeAfterSliderProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-white shadow-xl hover:shadow-2xl',
        'transition-all duration-500',
        className
      )}
    >
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={beforeImage} alt="Before" />}
        itemTwo={<ReactCompareSliderImage src={afterImage} alt="After" />}
        style={{ height: '100%', width: '100%' }}
      />

      {label && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <span className="text-sm font-semibold text-gray-900">{label}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
