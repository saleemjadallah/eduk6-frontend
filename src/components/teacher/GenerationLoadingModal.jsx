import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  HelpCircle,
  Layers,
  Image,
  Check,
  Sparkles,
  Lightbulb,
  Clock,
  Pencil,
  Star,
  Heart,
  Zap
} from 'lucide-react';

// Encouraging messages that rotate during generation
const ENCOURAGING_MESSAGES = [
  { text: "Ollie is building your lesson with care...", emoji: "🦉" },
  { text: "Great teachers are worth the wait!", emoji: "⭐" },
  { text: "Crafting engaging content just for you...", emoji: "✨" },
  { text: "Adding a sprinkle of learning magic...", emoji: "🪄" },
  { text: "Polishing every detail to perfection...", emoji: "💎" },
  { text: "Your students are going to love this!", emoji: "❤️" },
  { text: "Almost there, hang tight...", emoji: "🎯" },
  { text: "Quality takes time, and you deserve the best!", emoji: "🌟" },
];

// Fun teaching tips that rotate
const TEACHING_TIPS = [
  { tip: "Students retain 90% of what they teach others. Consider adding peer teaching moments!", icon: Lightbulb },
  { tip: "Brain breaks every 20 minutes boost focus by 40%. Your lesson includes natural pause points.", icon: Zap },
  { tip: "Visual learners make up 65% of the population. That's why Ollie adds engaging visuals!", icon: Star },
  { tip: "Questions at the start of a lesson increase engagement by 78%.", icon: HelpCircle },
  { tip: "Color-coding information helps students organize and remember content better.", icon: Pencil },
  { tip: "The average attention span is 10-15 minutes. Ollie structures lessons with this in mind!", icon: Clock },
  { tip: "Storytelling increases information retention by up to 22 times!", icon: BookOpen },
  { tip: "Positive reinforcement leads to 3x better learning outcomes.", icon: Heart },
];

// Step configuration
const STEPS_CONFIG = {
  generating_lesson: { label: 'Lesson', icon: BookOpen, color: 'teacher-chalk' },
  generating_quiz: { label: 'Quiz', icon: HelpCircle, color: 'teacher-gold' },
  generating_flashcards: { label: 'Flashcards', icon: Layers, color: 'teacher-sage' },
  generating_infographic: { label: 'Infographic', icon: Image, color: 'teacher-coral' },
};

// Floating particle component
const FloatingParticle = ({ delay, duration, icon: Icon, color }) => (
  <motion.div
    className={`absolute ${color}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.7, 0.7, 0],
      scale: [0.5, 1, 1, 0.5],
      y: [-20, -80],
      x: [0, Math.random() * 40 - 20],
      rotate: [0, Math.random() * 360],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Icon className="w-4 h-4" />
  </motion.div>
);

// Orbiting element component
const OrbitingElement = ({ delay, radius, duration, children }) => (
  <motion.div
    className="absolute"
    style={{ width: radius * 2, height: radius * 2, left: `calc(50% - ${radius}px)`, top: `calc(50% - ${radius}px)` }}
    animate={{ rotate: 360 }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  >
    <div className="absolute" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}>
      {children}
    </div>
  </motion.div>
);

// Pulse ring effect
const PulseRing = ({ delay }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2 border-teacher-gold/30"
    initial={{ scale: 1, opacity: 0.5 }}
    animate={{ scale: 1.8, opacity: 0 }}
    transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
  />
);

const GenerationLoadingModal = ({
  isOpen,
  progress = 0,
  currentStep = 'starting',
  message = '',
  completedSteps = [],
  contentType = 'full_lesson',
  includeQuiz = false,
  includeFlashcards = false,
  includeInfographic = false,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate time estimate based on content type and options
  const timeEstimate = useMemo(() => {
    let baseTime = contentType === 'full_lesson' ? 90 : 45; // seconds
    if (includeQuiz) baseTime += 20;
    if (includeFlashcards) baseTime += 15;
    if (includeInfographic) baseTime += 30;

    const minMinutes = Math.ceil(baseTime / 60);
    const maxMinutes = Math.ceil((baseTime * 1.5) / 60);

    return { min: minMinutes, max: maxMinutes, baseSeconds: baseTime };
  }, [contentType, includeQuiz, includeFlashcards, includeInfographic]);

  // Build active steps list
  const activeSteps = useMemo(() => {
    const steps = ['generating_lesson'];
    if (includeQuiz) steps.push('generating_quiz');
    if (includeFlashcards) steps.push('generating_flashcards');
    if (includeInfographic) steps.push('generating_infographic');
    return steps;
  }, [includeQuiz, includeFlashcards, includeInfographic]);

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotate tips every 12 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TEACHING_TIPS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Track elapsed time
  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Calculate estimated remaining time
  const estimatedRemaining = useMemo(() => {
    if (progress === 0) return timeEstimate.baseSeconds;
    const progressRate = progress / elapsedTime; // % per second
    if (progressRate <= 0) return null;
    const remaining = (100 - progress) / progressRate;
    return Math.round(remaining);
  }, [progress, elapsedTime, timeEstimate.baseSeconds]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return null;
    if (seconds < 60) return `~${seconds}s remaining`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${mins}m ${secs}s remaining`;
  };

  const currentTip = TEACHING_TIPS[tipIndex];
  const TipIcon = currentTip.icon;

  // Determine Ollie's "mood" based on step
  const ollieState = useMemo(() => {
    if (currentStep === 'completed') return 'celebrating';
    if (currentStep === 'failed') return 'worried';
    if (progress < 20) return 'thinking';
    if (progress < 60) return 'working';
    return 'excited';
  }, [currentStep, progress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with blur and gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-teacher-ink/80 via-teacher-ink/70 to-teacher-chalk/30 backdrop-blur-md"
          />

          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-teacher-gold/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Main modal card */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-white to-teacher-paper rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teacher-chalk via-teacher-gold to-teacher-sage" />

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Time estimate banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-teacher-gold/10 rounded-full mx-auto w-fit"
              >
                <Clock className="w-4 h-4 text-teacher-gold" />
                <span className="text-sm font-medium text-teacher-ink">
                  Usually takes {timeEstimate.min}-{timeEstimate.max} minute{timeEstimate.max > 1 ? 's' : ''}
                </span>
              </motion.div>

              {/* Ollie section with animations */}
              <div className="relative flex justify-center mb-8">
                {/* Orbiting elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <OrbitingElement radius={70} duration={8} delay={0}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-teacher-gold" />
                    </motion.div>
                  </OrbitingElement>
                  <OrbitingElement radius={85} duration={12} delay={2}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-4 h-4 text-teacher-chalk" />
                    </motion.div>
                  </OrbitingElement>
                  <OrbitingElement radius={60} duration={10} delay={4}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Pencil className="w-4 h-4 text-teacher-sage" />
                    </motion.div>
                  </OrbitingElement>
                </div>

                {/* Ollie avatar container */}
                <div className="relative">
                  {/* Pulse rings */}
                  <div className="absolute inset-0">
                    <PulseRing delay={0} />
                    <PulseRing delay={0.5} />
                    <PulseRing delay={1} />
                  </div>

                  {/* Floating particles around Ollie */}
                  <div className="absolute inset-0 overflow-visible">
                    <FloatingParticle delay={0} duration={2} icon={Sparkles} color="text-teacher-gold" />
                    <FloatingParticle delay={0.5} duration={2.5} icon={Star} color="text-teacher-chalk" />
                    <FloatingParticle delay={1} duration={2} icon={Pencil} color="text-teacher-sage" />
                    <FloatingParticle delay={1.5} duration={2.2} icon={BookOpen} color="text-teacher-gold" />
                  </div>

                  {/* Ollie avatar with glow */}
                  <motion.div
                    className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teacher-gold/30 bg-gradient-to-br from-teacher-paper to-white shadow-xl"
                    animate={
                      ollieState === 'celebrating'
                        ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                        : ollieState === 'thinking'
                        ? { scale: [1, 1.02, 1] }
                        : ollieState === 'working'
                        ? { rotate: [0, 2, -2, 0] }
                        : { y: [0, -5, 0] }
                    }
                    transition={{
                      duration: ollieState === 'celebrating' ? 0.5 : 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teacher-gold/20 to-transparent" />
                    <img
                      src="/assets/images/ollie-avatar.png"
                      alt="Ollie"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Activity indicator */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-teacher-gold to-teacher-chalk shadow-lg flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {currentStep === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Encouraging message */}
              <div className="text-center mb-6 h-16">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-2xl mb-1">{ENCOURAGING_MESSAGES[messageIndex].emoji}</p>
                    <p className="text-lg font-medium text-teacher-ink">
                      {ENCOURAGING_MESSAGES[messageIndex].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress section */}
              <div className="mb-6">
                {/* Progress bar */}
                <div className="relative mb-2">
                  <div className="h-4 bg-teacher-ink/5 rounded-full overflow-hidden border border-teacher-ink/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teacher-chalk via-teacher-gold to-teacher-sage rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </div>

                  {/* Percentage */}
                  <motion.div
                    className="absolute right-0 -top-6 text-sm font-bold text-teacher-chalk"
                    key={progress}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {progress}%
                  </motion.div>
                </div>

                {/* Time remaining */}
                {estimatedRemaining && estimatedRemaining > 0 && currentStep !== 'completed' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-teacher-inkLight text-center"
                  >
                    {formatTime(estimatedRemaining)}
                  </motion.p>
                )}
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                {activeSteps.map((step, index) => {
                  const config = STEPS_CONFIG[step];
                  const Icon = config.icon;
                  const isCompleted = completedSteps.includes(step.replace('generating_', ''));
                  const isCurrent = currentStep === step;

                  return (
                    <React.Fragment key={step}>
                      {index > 0 && (
                        <div
                          className={`w-6 h-0.5 ${
                            isCompleted ? 'bg-teacher-sage' : 'bg-teacher-ink/10'
                          }`}
                        />
                      )}
                      <motion.div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isCompleted
                            ? 'bg-teacher-sage/10 text-teacher-sage'
                            : isCurrent
                            ? `bg-${config.color}/10 text-${config.color} ring-2 ring-${config.color}/30`
                            : 'bg-teacher-ink/5 text-teacher-inkLight'
                        }`}
                        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        <span>{config.label}</span>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Teaching tip card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-teacher-gold/5 to-teacher-chalk/5 rounded-2xl p-4 border border-teacher-gold/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-teacher-gold/10 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-teacher-gold" />
                  </div>
                  <span className="text-xs font-semibold text-teacher-gold uppercase tracking-wide">
                    Did You Know?
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <TipIcon className="w-5 h-5 text-teacher-inkLight flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-teacher-ink leading-relaxed">
                      {currentTip.tip}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* "Not stuck" indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-teacher-inkLight">
                <motion.div
                  className="w-2 h-2 rounded-full bg-teacher-sage"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span>Ollie is actively working on your content</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationLoadingModal;
