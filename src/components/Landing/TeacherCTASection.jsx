import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Layers,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';

const TeacherCTASection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Lesson Creator',
      description: 'Generate complete lesson plans in minutes',
    },
    {
      icon: ClipboardCheck,
      title: 'Quiz Generator',
      description: 'Create assessments aligned to your content',
    },
    {
      icon: Layers,
      title: 'Flashcard Maker',
      description: 'Build study materials automatically',
    },
    {
      icon: Clock,
      title: 'Save Hours',
      description: 'Reduce prep time by up to 80%',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(45,90,74,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(45,90,74,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Decorative elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 right-20 w-16 h-16 bg-[#2D5A4A]/10 rounded-2xl hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-20 left-20 w-12 h-12 bg-[#D4A853]/20 rounded-full hidden lg:block"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-[#2D5A4A]/10 text-[#2D5A4A] px-4 py-2 rounded-full font-bold text-sm mb-6 border border-[#2D5A4A]/20"
            >
              <BookOpen className="w-4 h-4" />
              For Educators
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-comic mb-4 leading-tight text-gray-900">
              Are You a{' '}
              <span className="text-[#2D5A4A]">Teacher?</span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
              Create lessons, quizzes, and study materials in minutes with our AI-powered Teacher Portal.
              Let Ollie help you spend less time on prep and more time inspiring students.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-gray-200/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#2D5A4A]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#2D5A4A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/teacher/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#2D5A4A] text-white text-base font-bold px-6 py-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Zap className="w-5 h-5" />
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/teacher/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 text-base font-bold px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:border-[#2D5A4A] hover:text-[#2D5A4A] transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Trust note */}
            <p className="mt-6 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-[#2D5A4A]">✓</span>
              Free tier available • No credit card required
            </p>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Card showing teacher portal preview */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 relative">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500 text-center">
                      orbitlearn.com/teacher
                    </div>
                  </div>
                </div>

                {/* Mock dashboard content */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A853]/30">
                      <img
                        src="/assets/images/ollie-avatar.png"
                        alt="Ollie"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Create with Ollie</p>
                      <p className="text-xs text-gray-500">What would you like to create?</p>
                    </div>
                  </div>

                  {/* Quick action cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: BookOpen, label: 'Lesson', color: '#2D5A4A' },
                      { icon: ClipboardCheck, label: 'Quiz', color: '#7BAE7F' },
                      { icon: Layers, label: 'Flashcards', color: '#D4A853' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sample generated content preview */}
                  <div className="bg-gradient-to-br from-[#2D5A4A]/5 to-[#D4A853]/5 rounded-xl p-4 border border-[#2D5A4A]/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#D4A853]" />
                      <span className="text-xs font-bold text-gray-700">AI Generated</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Introduction to Fractions</p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      A comprehensive 45-minute lesson covering fraction basics, visual representations, and hands-on activities...
                    </p>
                  </div>
                </div>

                {/* Decorative badge */}
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-[#D4A853] text-white text-xs font-bold px-3 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  AI-Powered
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeacherCTASection;
