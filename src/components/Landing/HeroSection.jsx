import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <header className="relative pt-24 md:pt-28 lg:pt-32 pb-16 lg:pb-24 overflow-hidden min-h-[90vh] md:min-h-[85vh] flex items-center">
      {/* Background decorations - Enhanced for iPad */}
      <div className="absolute top-32 left-10 w-24 md:w-32 h-24 md:h-32 bg-nanobanana-yellow/40 rounded-full blur-3xl" />
      <div className="absolute top-48 right-10 md:right-20 w-40 md:w-48 h-40 md:h-48 bg-nanobanana-blue/25 rounded-full blur-3xl" />
      <div className="absolute bottom-32 left-1/4 w-32 md:w-40 h-32 md:h-40 bg-nanobanana-green/25 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-pink-300/20 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-nanobanana-yellow/20 text-nanobanana-blue px-4 py-2 rounded-full font-bold text-sm border-2 border-nanobanana-yellow">
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning for K-8
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-comic mb-4 md:mb-6 leading-[1.1]"
            >
              Where Learning{' '}
              <span className="text-nanobanana-blue">Meets</span>{' '}
              <span className="text-nanobanana-green inline-block transform -rotate-2">
                Adventure!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 md:mb-8 font-medium leading-relaxed max-w-xl"
            >
              Meet Jeffrey, your child's friendly AI tutor. Upload any lesson, and watch as learning transforms into an exciting journey of discovery.
            </motion.p>

            {/* CTA Buttons - iPad touch-optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6 md:mb-8"
            >
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center gap-3 bg-nanobanana-green text-white text-lg md:text-xl font-bold px-6 md:px-8 py-4 md:py-5 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none active:scale-[0.98]"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white text-black text-base md:text-lg font-bold px-5 md:px-6 py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border-2 border-green-200">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-bold text-green-700">Safe for Kids</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border-2 border-blue-200">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Parent Approved</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border-2 border-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-bold text-purple-700">AI-Powered</span>
              </div>
            </motion.div>
          </div>

          {/* Right - Hero Image - Visible on iPad (md) and up */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden md:block relative"
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="bg-nanobanana-blue p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/assets/images/landing/hero-jeffrey-teaching.png"
                  alt="Jeffrey teaching kids"
                  className="w-full max-w-sm lg:max-w-lg rounded-xl border-4 border-black"
                />
              </div>
            </motion.div>

            {/* Decorative elements - Scaled for iPad */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 md:-top-8 -right-4 md:-right-8 w-16 md:w-24 h-16 md:h-24 bg-nanobanana-yellow rounded-full border-4 border-black z-0"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 w-14 md:w-20 h-14 md:h-20 bg-pink-400 rounded-full border-4 border-black z-0"
            />
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute top-1/2 -right-2 md:-right-4 w-10 md:w-12 h-10 md:h-12 bg-nanobanana-green rounded-full border-4 border-black z-0"
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
