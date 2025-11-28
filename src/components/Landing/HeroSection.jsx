import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (e) {
      window.location.assign(path);
    }
  };

  const handleGetStarted = () => {
    safeNavigate('/onboarding');
  };

  return (
    <header className="relative pt-8 pb-16 lg:pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-nanobanana-yellow/30 rounded-full blur-2xl" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-nanobanana-blue/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-nanobanana-green/20 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-nanobanana-yellow/20 text-nanobanana-blue px-4 py-2 rounded-full font-bold text-sm border-2 border-nanobanana-yellow">
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning for K-6
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black font-comic mb-6 leading-tight"
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
              className="text-xl md:text-2xl text-gray-600 mb-8 font-medium leading-relaxed"
            >
              Meet Jeffrey, your child's friendly AI tutor. Upload any lesson, and watch as learning transforms into an exciting journey of discovery.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-3 bg-nanobanana-green text-white text-xl font-bold px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none"
              >
                Start Free Trial
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-white text-black text-lg font-bold px-6 py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
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

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:block relative"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="bg-nanobanana-blue p-3 rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/assets/images/landing/hero-jeffrey-teaching.png"
                  alt="Jeffrey teaching kids"
                  className="w-full max-w-lg rounded-xl border-4 border-black"
                />
              </div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 w-24 h-24 bg-nanobanana-yellow rounded-full border-4 border-black z-0"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-400 rounded-full border-4 border-black z-0"
            />
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute top-1/2 -right-4 w-12 h-12 bg-nanobanana-green rounded-full border-4 border-black z-0"
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
