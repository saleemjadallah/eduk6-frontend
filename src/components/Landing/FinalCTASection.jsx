import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';

const FinalCTASection = () => {
  const navigate = useNavigate();

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (e) {
      window.location.assign(path);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-nanobanana-blue via-blue-600 to-purple-600 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-0 w-80 h-80 bg-nanobanana-yellow rounded-full blur-3xl"
      />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 left-20 w-16 h-16 bg-nanobanana-yellow rounded-2xl border-4 border-black/20 hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-12 h-12 bg-nanobanana-green rounded-full border-4 border-black/20 hidden lg:block"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm mb-6"
            >
              <Rocket className="w-4 h-4" />
              Start Learning Today
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-comic mb-6 leading-tight">
              Ready for Your Child's{' '}
              <span className="text-nanobanana-yellow">Learning Adventure?</span>
            </h2>

            <p className="text-xl text-white/90 mb-8 max-w-xl">
              Join thousands of families who've transformed homework time into discovery time. Start your free trial today!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => safeNavigate('/onboarding')}
                className="inline-flex items-center justify-center gap-3 bg-nanobanana-yellow text-black text-xl font-bold px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] transition-all"
              >
                <Sparkles className="w-6 h-6" />
                Start Free Trial
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white text-lg font-bold px-6 py-4 rounded-2xl border-4 border-white/30 hover:bg-white/20 transition-all"
              >
                View Pricing
              </motion.button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-nanobanana-green">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-nanobanana-green">✓</span>
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-nanobanana-green">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Celebration Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-[2rem] border-4 border-white/20">
                <img
                  src="/assets/images/landing/celebration.png"
                  alt="Children Celebrating Learning Success"
                  className="w-full max-w-md mx-auto rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
