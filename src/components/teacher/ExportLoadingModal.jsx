import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Presentation, Clock, Check, Loader2 } from 'lucide-react';

// Subtle rotating messages for export
const EXPORT_MESSAGES = [
  "Formatting your content beautifully...",
  "Creating professional slides...",
  "Adding visual elements...",
  "Polishing the final touches...",
  "Almost ready for download...",
];

const ExportLoadingModal = ({
  isOpen,
  exportType = 'pptx', // 'pdf' | 'pptx' | 'drive'
  contentTitle = 'content',
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Rotate messages every 3 seconds
  useEffect(() => {
    if (!isOpen) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % EXPORT_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Animate dots
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const getExportInfo = () => {
    switch (exportType) {
      case 'pptx':
        return {
          icon: Presentation,
          title: 'Creating PowerPoint',
          time: '30-60 seconds',
          accentClass: 'bg-teacher-coral',
          iconBgClass: 'from-teacher-coral to-teacher-coral/80',
          pulseClass: 'bg-teacher-coral/20',
          progressClass: 'bg-teacher-coral',
          dotClass: 'bg-teacher-coral',
          cardBgClass: 'from-teacher-coral/5 to-teacher-gold/5',
        };
      case 'pdf':
        return {
          icon: FileText,
          title: 'Generating PDF',
          time: '10-20 seconds',
          accentClass: 'bg-teacher-chalk',
          iconBgClass: 'from-teacher-chalk to-teacher-chalk/80',
          pulseClass: 'bg-teacher-chalk/20',
          progressClass: 'bg-teacher-chalk',
          dotClass: 'bg-teacher-chalk',
          cardBgClass: 'from-teacher-chalk/5 to-teacher-sage/5',
        };
      case 'drive':
        return {
          icon: FileText,
          title: 'Saving to Drive',
          time: '15-30 seconds',
          accentClass: 'bg-teacher-sage',
          iconBgClass: 'from-teacher-sage to-teacher-sage/80',
          pulseClass: 'bg-teacher-sage/20',
          progressClass: 'bg-teacher-sage',
          dotClass: 'bg-teacher-sage',
          cardBgClass: 'from-teacher-sage/5 to-teacher-gold/5',
        };
      default:
        return {
          icon: FileText,
          title: 'Exporting',
          time: '30 seconds',
          accentClass: 'bg-teacher-chalk',
          iconBgClass: 'from-teacher-chalk to-teacher-chalk/80',
          pulseClass: 'bg-teacher-chalk/20',
          progressClass: 'bg-teacher-chalk',
          dotClass: 'bg-teacher-chalk',
          cardBgClass: 'from-teacher-chalk/5 to-teacher-sage/5',
        };
    }
  };

  const exportInfo = getExportInfo();
  const ExportIcon = exportInfo.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-teacher-ink/40 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-teacher-ink/5`}
          >
            {/* Top accent line */}
            <div className={`h-1 ${exportInfo.accentClass}`} />

            <div className={`p-6 bg-gradient-to-b ${exportInfo.cardBgClass}`}>
              {/* Icon with subtle animation */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  {/* Subtle pulse ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl ${exportInfo.pulseClass}`}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Icon container */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${exportInfo.iconBgClass} flex items-center justify-center shadow-lg`}>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ExportIcon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Small Ollie badge */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white bg-teacher-paper shadow overflow-hidden"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <img
                      src="/assets/images/ollie-avatar.png"
                      alt="Ollie"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-teacher-ink text-center mb-1">
                {exportInfo.title}{dots}
              </h3>

              {/* Time estimate */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Clock className="w-3.5 h-3.5 text-teacher-inkLight" />
                <span className="text-sm text-teacher-inkLight">
                  Usually takes {exportInfo.time}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="h-1.5 bg-teacher-ink/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${exportInfo.progressClass} rounded-full`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 45, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Rotating message */}
              <div className="h-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-teacher-inkLight text-center"
                  >
                    {EXPORT_MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Active indicator */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-teacher-ink/5">
                <motion.div
                  className={`w-2 h-2 rounded-full ${exportInfo.dotClass}`}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs text-teacher-inkLight">
                  Ollie is preparing your file
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportLoadingModal;
