import { motion } from 'framer-motion';
import { gradientMesh } from '../../lib/design-system';

interface GradientMeshProps {
  className?: string;
  animate?: boolean;
}

export default function GradientMesh({ className }: GradientMeshProps) {
  return (
    <motion.div
      className={`absolute inset-0 ${className || ''}`}
      style={{ background: gradientMesh.background }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    />
  );
}
