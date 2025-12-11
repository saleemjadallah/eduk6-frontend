import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, Clock, Shield, CreditCard } from 'lucide-react';
import AIGeneratedImage from '../../Landing/AIGeneratedImage';

const TeacherFinalCTASection = () => {
  const benefits = [
    { icon: Check, text: 'Free forever tier' },
    { icon: CreditCard, text: 'No credit card required' },
    { icon: Clock, text: 'Setup in 2 minutes' },
    { icon: Shield, text: '30-day money-back guarantee' },
  ];

  const ctaImagePrompt = `A joyful, relieved teacher standing confidently in front of organized, colorful educational materials
spread on a desk - lesson plans, flashcards, quizzes all neatly arranged. The teacher has their arms slightly raised
in a celebratory pose, conveying success and work-life balance. A warm afternoon sun streams through a window,
and a clock on the wall shows 3:30 PM (suggesting they have time to spare). The scene feels accomplished,
peaceful, and optimistic. Style: warm illustration with soft lighting, greens and golds color palette.`;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teacher-chalk via-teacher-chalkLight to-teacher-sage" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative shapes */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-20 h-20 bg-white/10 rounded-3xl border-2 border-white/20"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-32 right-[15%] w-14 h-14 bg-teacher-gold/30 rounded-full border-2 border-teacher-gold/40"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 right-[20%] w-10 h-10 bg-white/15 rounded-2xl hidden lg:block"
      />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold text-sm border border-white/30 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Join 10,000+ Teachers
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display text-white leading-tight mb-4 md:mb-6">
              Ready to Transform{' '}
              <span className="text-teacher-gold">Your Teaching?</span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 max-w-lg">
              Join thousands of teachers who've reclaimed their prep time. Start creating in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
              <Link
                to="/teacher/signup"
                className="group inline-flex items-center justify-center gap-2 md:gap-3 bg-teacher-gold text-teacher-ink text-base md:text-lg font-black px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-3 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] md:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Start Free Today
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-3 md:border-4 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
              >
                View Pricing
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-1.5 md:gap-2"
                >
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white/90">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block"
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Image container */}
              <div className="bg-white p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] border-3 md:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
                <AIGeneratedImage
                  prompt={ctaImagePrompt}
                  style="educational"
                  alt="Happy teacher with organized materials"
                  className="w-full rounded-[1rem] md:rounded-[1.5rem]"
                  aspectRatio="square"
                  fallbackSrc="/assets/images/landing/teacher-success-fallback.png"
                />
              </div>

              {/* Floating stats */}
              <motion.div
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -left-3 md:-top-4 md:-left-4 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border-2 md:border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="text-[10px] md:text-xs font-bold text-teacher-inkLight">Time saved</p>
                <p className="text-lg md:text-xl font-black text-teacher-chalk">80%</p>
              </motion.div>

              <motion.div
                animate={{ rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-teacher-gold px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border-2 md:border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="text-[10px] md:text-xs font-bold text-teacher-ink/70">Created in</p>
                <p className="text-lg md:text-xl font-black text-teacher-ink">47 sec</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeacherFinalCTASection;
