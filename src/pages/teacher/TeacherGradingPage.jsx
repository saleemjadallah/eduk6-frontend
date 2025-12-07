import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Sparkles,
  ArrowRight,
  Bell,
  Zap,
  Target,
  Award,
  MessageSquare,
} from 'lucide-react';

const TeacherGradingPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Feature preview cards
  const features = [
    {
      icon: Upload,
      title: 'Batch Upload',
      description: 'Upload 30+ papers at once. Support for PDF, images, and typed submissions.',
      color: 'teacher-chalk',
    },
    {
      icon: Target,
      title: 'Custom Rubrics',
      description: 'Create detailed rubrics with weighted criteria. AI grades consistently against your standards.',
      color: 'teacher-gold',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Grading',
      description: 'Intelligent analysis using Gemini Pro. Understands context, not just keywords.',
      color: 'teacher-plum',
    },
    {
      icon: MessageSquare,
      title: 'Personalized Feedback',
      description: 'Auto-generated constructive feedback for each student, tailored to their work.',
      color: 'teacher-terracotta',
    },
    {
      icon: AlertTriangle,
      title: 'Smart Flagging',
      description: 'Low-confidence submissions flagged for human review. You stay in control.',
      color: 'teacher-coral',
    },
    {
      icon: BarChart3,
      title: 'Class Analytics',
      description: 'See patterns across submissions. Identify common mistakes and knowledge gaps.',
      color: 'teacher-sage',
    },
  ];

  // Workflow steps
  const workflowSteps = [
    {
      step: 1,
      title: 'Create Rubric',
      description: 'Define grading criteria and point values',
      icon: FileText,
    },
    {
      step: 2,
      title: 'Upload Papers',
      description: 'Batch upload student submissions',
      icon: Upload,
    },
    {
      step: 3,
      title: 'AI Grades',
      description: 'Automated analysis against your rubric',
      icon: Sparkles,
    },
    {
      step: 4,
      title: 'Review & Finalize',
      description: 'Approve, adjust, and export grades',
      icon: CheckCircle,
    },
  ];

  return (
    <TeacherLayout
      title="AI Grading Center"
      subtitle="Coming soon - Grade papers 10x faster with AI assistance"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teacher-chalk via-teacher-chalk/90 to-teacher-chalkLight p-8 lg:p-12 mb-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              Coming Q1 2025
            </div>

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
              Grade 30 papers in minutes,
              <br />
              not hours.
            </h1>

            <p className="text-white/80 text-lg mb-6 max-w-xl">
              Our AI grading assistant reads, analyzes, and scores student work against your rubric.
              You review the flagged ones and export when ready.
            </p>

            {/* Notify form */}
            {!submitted ? (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-white text-teacher-chalk font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white"
              >
                <CheckCircle className="w-5 h-5" />
                We'll notify you when it's ready!
              </motion.div>
            )}
          </div>

          {/* Preview mockup */}
          <div className="w-full lg:w-auto">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto"
            >
              {/* Mini grading preview */}
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-teacher-ink/10">
                  <span className="text-sm font-semibold text-teacher-ink">Essay Batch #12</span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teacher-sage/10 text-teacher-sage">
                    28/30 Done
                  </span>
                </div>

                {/* Sample submissions */}
                {[
                  { name: 'Sarah M.', score: 92, status: 'graded' },
                  { name: 'James K.', score: 78, status: 'graded' },
                  { name: 'Emily R.', score: null, status: 'flagged' },
                  { name: 'Michael T.', score: 85, status: 'graded' },
                ].map((student, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-teacher-paper/50">
                    <div className="w-8 h-8 rounded-full bg-teacher-ink/5 flex items-center justify-center text-xs font-medium text-teacher-inkLight">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-teacher-ink">{student.name}</p>
                    </div>
                    {student.status === 'flagged' ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-teacher-gold/10 text-teacher-gold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Review
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-teacher-sage">
                        {student.score}%
                      </span>
                    )}
                  </div>
                ))}

                {/* Progress bar */}
                <div className="pt-3 border-t border-teacher-ink/10">
                  <div className="flex items-center justify-between text-xs text-teacher-inkLight mb-2">
                    <span>Processing...</span>
                    <span>93%</span>
                  </div>
                  <div className="h-2 bg-teacher-ink/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '60%' }}
                      animate={{ width: '93%' }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-teacher-chalk to-teacher-sage rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="font-display text-xl font-semibold text-teacher-ink mb-6 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="relative"
              >
                <div className="teacher-card p-6 text-center h-full">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teacher-chalk/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-teacher-chalk" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-teacher-chalk text-white text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-teacher-ink mb-1">{step.title}</h3>
                  <p className="text-sm text-teacher-inkLight">{step.description}</p>
                </div>

                {/* Connector arrow */}
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-teacher-inkLight" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="font-display text-xl font-semibold text-teacher-ink mb-6 text-center">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="teacher-card p-6 group"
              >
                <div className={`w-12 h-12 mb-4 rounded-xl bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="font-semibold text-teacher-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-teacher-inkLight">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Average Time Saved', value: '85%', icon: Clock },
          { label: 'Grading Accuracy', value: '94%', icon: Target },
          { label: 'Papers/Minute', value: '3-5', icon: Zap },
          { label: 'Teacher Satisfaction', value: '4.8/5', icon: Award },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="teacher-card p-5 text-center">
              <Icon className="w-6 h-6 mx-auto mb-2 text-teacher-inkLight" />
              <p className="font-display text-2xl font-bold text-teacher-ink mb-1">{stat.value}</p>
              <p className="text-xs text-teacher-inkLight">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="teacher-card p-8 text-center bg-gradient-to-br from-teacher-gold/5 to-teacher-chalk/5"
      >
        <div className="w-20 h-20 mx-auto mb-4">
          <img
            src="/assets/images/landing/meet-jeffrey.png"
            alt="Jeffrey - Your AI Teaching Assistant"
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="font-display text-xl font-semibold text-teacher-ink mb-2">
          Be the first to know
        </h3>
        <p className="text-teacher-inkLight mb-6 max-w-md mx-auto">
          Join the waitlist and I'll let you know when AI Grading launches.
          I'll also send you tips for creating effective rubrics!
        </p>

        {!submitted ? (
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-teacher-ink/10 text-teacher-ink placeholder:text-teacher-inkLight/50 focus:outline-none focus:ring-2 focus:ring-teacher-chalk/20 focus:border-teacher-chalk"
            />
            <button type="submit" className="teacher-btn-primary">
              Join Waitlist
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teacher-sage/10 text-teacher-sage font-medium">
            <CheckCircle className="w-5 h-5" />
            You're on the list!
          </div>
        )}
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherGradingPage;
