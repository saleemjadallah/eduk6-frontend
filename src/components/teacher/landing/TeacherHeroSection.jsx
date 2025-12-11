import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle, Clock, Shield, Zap } from 'lucide-react';
import AIGeneratedImage from '../../Landing/AIGeneratedImage';

const TeacherHeroSection = () => {
  const trustBadges = [
    { icon: CheckCircle, text: 'Free forever tier', color: 'teacher-sage' },
    { icon: Shield, text: 'No credit card required', color: 'teacher-chalk' },
    { icon: Clock, text: 'Setup in 2 minutes', color: 'teacher-terracotta' },
  ];

  const heroImagePrompt = `A warm, inviting illustration of a friendly professional teacher in a modern, cozy classroom.
The teacher is sitting at a wooden desk with an open laptop showing a cheerful robot mascot assistant on the screen.
The teacher looks happy, inspired, and relieved - as if a weight has been lifted off their shoulders.
Around the desk are neatly organized colorful teaching materials: lesson plans, flashcards, and educational books.
A classic green chalkboard with mathematical equations is visible in the soft-focus background.
The lighting is golden hour warm, streaming through a window. The atmosphere feels productive yet peaceful.
Style: Modern children's book illustration, warm color palette with greens, golds, and cream tones.
The scene conveys: "Teaching just got easier and more joyful."`;

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-teacher-cream">
        {/* Mesh gradient */}
        <div className="absolute inset-0 bg-teacher-mesh opacity-70" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(45,90,74,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(45,90,74,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative shapes */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-40 left-[10%] w-20 h-20 bg-teacher-gold/20 rounded-3xl border-2 border-teacher-gold/30"
        />
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-60 right-[15%] w-16 h-16 bg-teacher-terracotta/15 rounded-full border-2 border-teacher-terracotta/25"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-40 left-[20%] w-12 h-12 bg-teacher-chalk/10 rounded-2xl border-2 border-teacher-chalk/20"
        />
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-60 right-[10%] w-24 h-24 bg-teacher-sage/15 rounded-full border-2 border-teacher-sage/25"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl md:max-w-none">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-teacher-chalk/10 text-teacher-chalk px-4 py-2 rounded-full font-bold text-sm border border-teacher-chalk/20 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Teaching Tools
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black font-display leading-[1.1] mb-6"
            >
              <span className="text-teacher-ink">Transform Your</span>
              <br />
              <span className="text-teacher-chalk">Teaching</span>{' '}
              <span className="text-teacher-ink">with</span>{' '}
              <span className="relative inline-block">
                <span className="text-teacher-terracotta">AI</span>
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 8"
                  fill="none"
                >
                  <motion.path
                    d="M0 4 Q25 0, 50 4 T100 4"
                    stroke="#D4A853"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.svg>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-teacher-inkLight leading-relaxed mb-6 lg:mb-8"
            >
              Create complete lesson plans, quizzes, flashcards, and infographics in minutes.
              Let Jeffrey handle the prep work so you can focus
              on what matters most—<span className="font-bold text-teacher-ink">inspiring your students</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 lg:mb-8"
            >
              <Link
                to="/teacher/signup"
                className="group inline-flex items-center justify-center gap-2 md:gap-3 bg-teacher-chalk text-white text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5" />
                Start Creating Free
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white text-teacher-ink text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {trustBadges.map((badge, index) => (
                <div
                  key={badge.text}
                  className={`flex items-center gap-2 bg-${badge.color}/10 px-4 py-2 rounded-full border-2 border-${badge.color}/20`}
                >
                  <badge.icon className={`w-4 h-4 text-${badge.color}`} />
                  <span className={`text-sm font-bold text-${badge.color}`}>{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden md:block"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Main image container */}
              <div className="bg-teacher-chalk p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <AIGeneratedImage
                  prompt={heroImagePrompt}
                  style="educational"
                  alt="Teacher using AI assistant"
                  className="w-full"
                  aspectRatio="landscape"
                  fallbackSrc="/assets/images/landing/teacher-hero-fallback.png"
                />
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-teacher-gold text-teacher-ink text-xs md:text-sm font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 md:border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="flex items-center gap-1 md:gap-1.5">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                  AI-Powered
                </span>
              </motion.div>

              {/* Stats badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 md:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="text-[10px] md:text-xs font-bold text-teacher-inkLight mb-0.5 md:mb-1">Save up to</p>
                <p className="text-xl md:text-2xl font-black text-teacher-chalk">80%</p>
                <p className="text-[10px] md:text-xs font-bold text-teacher-inkLight">prep time</p>
              </motion.div>
            </motion.div>

            {/* Decorative dots */}
            <div className="absolute -bottom-8 md:-bottom-12 right-8 md:right-12 grid grid-cols-3 gap-1.5 md:gap-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teacher-chalk/30"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-sm font-medium text-teacher-inkLight">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-teacher-ink/20 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-teacher-chalk" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeacherHeroSection;
