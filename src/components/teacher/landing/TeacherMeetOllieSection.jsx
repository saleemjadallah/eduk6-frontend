import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Zap, GraduationCap, BookOpen, ClipboardCheck, Layers, Sparkles } from 'lucide-react';
import Ollie from '../../Avatar/Ollie';

const TeacherMeetOllieSection = () => {
  const [typedText, setTypedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const demoMessages = [
    "Create a 5th grade lesson about fractions with visual examples",
    "Generate a 10-question quiz on the American Revolution",
    "Make flashcards for Spanish vocabulary - weather terms",
    "Create an infographic explaining photosynthesis",
  ];

  const features = [
    {
      icon: Clock,
      title: 'Saves Hours',
      description: 'Reduce prep time by up to 80%',
      color: '#2D5A4A', // chalk
    },
    {
      icon: Target,
      title: 'Standards Aligned',
      description: 'Content aligned to curriculum',
      color: '#C75B39', // terracotta
    },
    {
      icon: Zap,
      title: 'Always Ready',
      description: 'Available 24/7 when you need it',
      color: '#D4A853', // gold
    },
    {
      icon: GraduationCap,
      title: 'Grade-Appropriate',
      description: 'Auto-adjusts to student level',
      color: '#7BAE7F', // sage
    },
  ];

  const quickActions = [
    { icon: BookOpen, label: 'Lesson', color: '#2D5A4A' },
    { icon: ClipboardCheck, label: 'Quiz', color: '#7BAE7F' },
    { icon: Layers, label: 'Flashcards', color: '#D4A853' },
  ];

  // Typing animation effect
  useEffect(() => {
    const currentMessage = demoMessages[currentMessageIndex];
    let charIndex = 0;

    setTypedText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setTypedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Move to next message after delay
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % demoMessages.length);
        }, 3000);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-teacher-cream via-white to-teacher-paper relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teacher-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teacher-chalk/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-teacher-gold/15 text-teacher-gold px-4 py-2 rounded-full font-bold text-sm border border-teacher-gold/25 mb-6">
            <Sparkles className="w-4 h-4" />
            Your AI Teaching Assistant
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            <span className="text-teacher-ink">Meet </span>
            <span className="text-teacher-gold">Ollie</span>
            <span className="text-teacher-ink">, Your</span>
            <br className="hidden sm:block" />
            <span className="text-teacher-chalk"> Co-Teacher</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-teacher-inkLight max-w-2xl mx-auto">
            Ollie handles the heavy lifting of content creation, so you can focus on what you love—teaching.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left - Ollie & Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Ollie Image with Speech Bubble */}
            <div className="relative mb-8 md:mb-10">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="bg-teacher-gold p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-[280px] md:max-w-sm mx-auto lg:mx-0">
                  <div className="bg-white rounded-[1rem] md:rounded-[1.5rem] border-4 border-black p-6 md:p-8 flex items-center justify-center">
                    <Ollie size="xlarge" isTyping={isTyping} />
                  </div>
                </div>
              </motion.div>

              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -top-3 md:-top-4 right-4 md:right-0 lg:-right-8 bg-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border-3 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[160px] md:max-w-[200px]"
              >
                <p className="font-comic font-bold text-xs md:text-sm text-teacher-ink">
                  Ready to help you{' '}
                  <span className="text-teacher-chalk">create!</span>
                </p>
                {/* Speech bubble tail */}
                <div className="absolute bottom-0 left-6 md:left-8 translate-y-full">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white border-l-3 md:border-l-4 border-b-3 md:border-b-4 border-black transform rotate-[-45deg] -translate-y-1.5 md:-translate-y-2" />
                </div>
              </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-3 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 md:border-3 border-black flex items-center justify-center mb-2 md:mb-3"
                    style={{ backgroundColor: feature.color }}
                  >
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-bold font-display text-teacher-ink text-sm md:text-base mb-0.5 md:mb-1">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-teacher-inkLight">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-teacher-chalk p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-white rounded-[1rem] md:rounded-[1.5rem] border-4 border-black overflow-hidden">
                {/* Demo Header */}
                <div className="bg-teacher-paper px-4 md:px-6 py-3 md:py-4 border-b-4 border-black flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 md:border-3 border-black flex-shrink-0">
                    <img
                      src="/assets/images/ollie-avatar.png"
                      alt="Ollie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-teacher-ink text-sm md:text-base truncate">Create with Ollie</p>
                    <p className="text-[10px] md:text-xs text-teacher-inkLight">What would you like to create?</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 md:p-6 border-b-4 border-black/10">
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {quickActions.map((action) => (
                      <motion.div
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-4 rounded-lg md:rounded-xl border-2 md:border-3 border-black bg-gray-50 hover:bg-white cursor-pointer transition-colors"
                        style={{ boxShadow: `2px 2px 0px 0px ${action.color}40` }}
                      >
                        <div
                          className="w-8 h-8 md:w-10 md:h-10 rounded-md md:rounded-lg flex items-center justify-center border-2 border-black"
                          style={{ backgroundColor: `${action.color}20` }}
                        >
                          <action.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: action.color }} />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-teacher-ink">{action.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Typing Demo */}
                <div className="p-4 md:p-6">
                  <div className="bg-teacher-cream rounded-lg md:rounded-xl border-2 border-teacher-ink/10 p-3 md:p-4 mb-3 md:mb-4">
                    <p className="text-teacher-ink font-medium text-sm md:text-base min-h-[40px] md:min-h-[48px]">
                      {typedText}
                      {isTyping && (
                        <span className="inline-block w-0.5 h-4 md:h-5 bg-teacher-chalk ml-0.5 animate-pulse" />
                      )}
                    </p>
                  </div>

                  {/* Generated Preview */}
                  <motion.div
                    key={currentMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isTyping ? 0.5 : 1, y: 0 }}
                    className="bg-gradient-to-br from-teacher-chalk/5 to-teacher-gold/5 rounded-lg md:rounded-xl p-3 md:p-4 border-2 border-teacher-chalk/20"
                  >
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-teacher-gold" />
                      <span className="text-[10px] md:text-xs font-bold text-teacher-chalk">
                        {isTyping ? 'Generating...' : 'Ready to create!'}
                      </span>
                    </div>
                    {!isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-xs md:text-sm font-semibold text-teacher-ink mb-0.5 md:mb-1">
                          {currentMessageIndex === 0 && 'Introduction to Fractions'}
                          {currentMessageIndex === 1 && 'American Revolution Quiz'}
                          {currentMessageIndex === 2 && 'Spanish Weather Flashcards'}
                          {currentMessageIndex === 3 && 'Photosynthesis Infographic'}
                        </p>
                        <p className="text-[10px] md:text-xs text-teacher-inkLight line-clamp-2">
                          Complete content ready for classroom use...
                        </p>
                      </motion.div>
                    )}
                    {isTyping && (
                      <div className="flex gap-1 md:gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teacher-chalk"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teacher-chalk"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teacher-chalk"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating label */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-teacher-terracotta text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 md:border-3 border-black font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              Try it out!
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeacherMeetOllieSection;
