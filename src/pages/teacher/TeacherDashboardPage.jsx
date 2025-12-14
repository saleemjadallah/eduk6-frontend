import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  Plus,
  BookOpen,
  FileQuestion,
  Layers,
  FileText,
  GraduationCap,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Coffee,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { SuggestionBox } from '../../components/SuggestionBox';

const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const { teacher, quota } = useTeacherAuth();
  const [contentStats, setContentStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const [statsRes, recentRes] = await Promise.all([
        teacherAPI.getContentStats().catch(() => ({ success: false })),
        teacherAPI.getRecentContent(5).catch(() => ({ success: false })),
      ]);

      if (statsRes.success) {
        setContentStats(statsRes.data);
      }
      if (recentRes.success) {
        setRecentContent(recentRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Format credits
  const formatCredits = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Calculate usage percentage - quota data comes from getQuotaInfo API
  // Structure: { quota: { used, monthlyLimit, percentUsed }, credits: { used, total } }
  const usagePercent = quota?.quota?.percentUsed
    ?? (quota?.credits
      ? Math.min(100, (quota.credits.used / quota.credits.total) * 100)
      : 0);

  // Get credit values for display
  const creditsUsed = quota?.credits?.used ?? 0;
  const creditsTotal = quota?.credits?.total ?? 100;
  const quotaResetDate = quota?.quota?.resetDate;

  // Calculate total content
  const totalContent = contentStats
    ? (contentStats.byType?.LESSON || 0) +
      (contentStats.byType?.QUIZ || 0) +
      (contentStats.byType?.FLASHCARD_DECK || 0) +
      (contentStats.byType?.STUDY_GUIDE || 0)
    : 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick action cards
  const quickActions = [
    {
      title: 'Create Lesson',
      description: 'Build engaging lessons with AI assistance',
      icon: BookOpen,
      color: 'chalk',
      bgGradient: 'from-teacher-chalk to-teacher-chalkLight',
      href: '/teacher/content/create',
    },
    {
      title: 'Generate Quiz',
      description: 'Create quizzes from any content',
      icon: FileQuestion,
      color: 'gold',
      bgGradient: 'from-teacher-gold to-teacher-goldLight',
      href: '/teacher/quiz',
    },
    {
      title: 'Flashcards',
      description: 'Create study flashcards instantly',
      icon: Layers,
      color: 'plum',
      bgGradient: 'from-teacher-plum to-teacher-plumLight',
      href: '/teacher/flashcards',
    },
    // Grading feature hidden until implementation is complete
    // {
    //   title: 'Grade Papers',
    //   description: 'AI-assisted grading with rubrics',
    //   icon: GraduationCap,
    //   color: 'terracotta',
    //   bgGradient: 'from-teacher-terracotta to-teacher-terracottaLight',
    //   href: '/teacher/grading',
    //   comingSoon: true,
    // },
  ];

  // Content type configs
  const contentTypeConfig = {
    LESSON: {
      icon: BookOpen,
      label: 'Lesson',
      colorClass: 'lesson',
    },
    QUIZ: {
      icon: FileQuestion,
      label: 'Quiz',
      colorClass: 'quiz',
    },
    FLASHCARD_DECK: {
      icon: Layers,
      label: 'Flashcards',
      colorClass: 'flashcard',
    },
    STUDY_GUIDE: {
      icon: FileText,
      label: 'Study Guide',
      colorClass: 'guide',
    },
  };

  const getTierIcon = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return Crown;
      case 'BASIC':
        return Zap;
      default:
        return Coffee;
    }
  };

  const TierIcon = getTierIcon(teacher?.subscriptionTier);

  return (
    <TeacherLayout
      title={`${getGreeting()}, ${teacher?.firstName || 'Teacher'}!`}
      subtitle="Here's what's happening with your content today"
      headerActions={
        <Link
          to="/teacher/content/create"
          className="teacher-btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </Link>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Credits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="teacher-stat-card gold"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-teacher-inkLight">AI Credits</p>
              <p className="text-xl sm:text-3xl font-display font-bold text-teacher-ink mt-1">
                {creditsUsed}
                <span className="text-sm sm:text-lg text-teacher-inkLight font-normal">
                  {' '}/ {creditsTotal}
                </span>
              </p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-teacher-gold/10 flex-shrink-0">
              <TierIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-gold" />
            </div>
          </div>
          <div className="teacher-progress mb-2">
            <div
              className={`teacher-progress-bar ${
                usagePercent > 90 ? 'danger' : usagePercent > 70 ? 'warning' : ''
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-teacher-inkLight">
            {quotaResetDate
              ? `Resets ${new Date(quotaResetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'Monthly quota'}
          </p>
        </motion.div>

        {/* Content Created Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link to="/teacher/content" className="block h-full">
            <div className="teacher-stat-card chalk group cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-teacher-inkLight">Total Content</p>
                  <p className="text-xl sm:text-3xl font-display font-bold text-teacher-ink mt-1">
                    {loadingStats ? '...' : totalContent}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-teacher-chalk/10 group-hover:bg-teacher-chalk/20 transition-colors flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-chalk" />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-teacher-inkLight">
                <span>{contentStats?.byType?.LESSON || 0} lessons</span>
                <span>{contentStats?.byType?.QUIZ || 0} quizzes</span>
              </div>
              <div className="mt-2 sm:mt-3 hidden sm:flex items-center gap-1 text-sm text-teacher-chalk opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* This Week Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="teacher-stat-card sage"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-teacher-inkLight">This Week</p>
              <p className="text-xl sm:text-3xl font-display font-bold text-teacher-ink mt-1">
                {loadingStats ? '...' : contentStats?.thisWeek || 0}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-teacher-sage/10 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-sage" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-teacher-sage/10 text-teacher-sage">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              +{contentStats?.weekGrowth || 0}%
            </span>
            <span className="text-teacher-inkLight hidden sm:inline">vs last week</span>
          </div>
        </motion.div>

        {/* Flashcards Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link to="/teacher/content?type=FLASHCARD_DECK" className="block h-full">
            <div className="teacher-stat-card plum group cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-teacher-inkLight">Flashcard Decks</p>
                  <p className="text-xl sm:text-3xl font-display font-bold text-teacher-ink mt-1">
                    {loadingStats ? '...' : contentStats?.byType?.FLASHCARD_DECK || 0}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-teacher-plum/10 group-hover:bg-teacher-plum/20 transition-colors flex-shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-plum" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-teacher-inkLight">Ready for students</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-teacher-ink">
            Quick Actions
          </h2>
          <Link to="/teacher/content/create" className="teacher-link text-xs sm:text-sm">
            View all tools
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <Link
                  to={action.comingSoon ? '#' : action.href}
                  onClick={(e) => action.comingSoon && e.preventDefault()}
                  className={`
                    teacher-depth-card block p-4 sm:p-6 group h-full
                    ${action.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center
                    bg-gradient-to-br ${action.bgGradient}
                    ${action.comingSoon ? 'grayscale' : ''}
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>

                  <div className="flex items-start justify-between gap-1 sm:gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-teacher-ink mb-0.5 sm:mb-1 text-sm sm:text-base">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-teacher-inkLight line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    {!action.comingSoon && (
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-inkLight opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                    )}
                  </div>

                  {action.comingSoon && (
                    <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-teacher-gold">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Coming soon
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Two Column Layout: Recent Content + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-teacher-ink">
              Recent Content
            </h2>
            <Link to="/teacher/content" className="teacher-link text-xs sm:text-sm">
              View all
            </Link>
          </div>

          {recentContent.length > 0 ? (
            <div className="teacher-card overflow-hidden">
              <div className="divide-y divide-teacher-ink/5">
                {recentContent.map((item, index) => {
                  const config = contentTypeConfig[item.contentType] || contentTypeConfig.LESSON;
                  const Icon = config.icon;

                  return (
                    <Link
                      key={item.id}
                      to={`/teacher/content/${item.id}`}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-teacher-paper/50 transition-colors group"
                    >
                      <div className={`teacher-content-icon ${config.colorClass} flex-shrink-0`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-teacher-ink text-sm sm:text-base truncate group-hover:text-teacher-chalk transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-teacher-inkLight mt-0.5">
                          {item.subject && (
                            <span className="inline-flex items-center gap-1 hidden sm:flex">
                              <Target className="w-3 h-3" />
                              {item.subject}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={`
                        px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-lg flex-shrink-0
                        ${item.status === 'PUBLISHED'
                          ? 'bg-teacher-sage/10 text-teacher-sage'
                          : 'bg-teacher-ink/5 text-teacher-inkLight'
                        }
                      `}>
                        {item.status}
                      </span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-teacher-inkLight opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="teacher-card p-6 sm:p-8 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 relative">
                <img
                  src="/assets/images/landing/hero-jeffrey-teaching.png"
                  alt="Jeffrey - Your AI Teaching Assistant"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold text-teacher-ink mb-2">
                Ready to create your first content?
              </h3>
              <p className="text-sm sm:text-base text-teacher-inkLight mb-4 sm:mb-6 max-w-md mx-auto">
                I'm Jeffrey, your AI teaching assistant! Let me help you generate engaging lessons, quizzes, and flashcards for your students in minutes.
              </p>
              <Link
                to="/teacher/content/create"
                className="teacher-btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Content
              </Link>
            </div>
          )}
        </motion.div>

        {/* Activity & Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h2 className="font-display text-lg sm:text-xl font-semibold text-teacher-ink mb-3 sm:mb-4">
            Getting Started
          </h2>

          <div className="teacher-card p-4 sm:p-5 mb-3 sm:mb-4">
            <div className="space-y-3 sm:space-y-4">
              {[
                { text: 'Upload your first lesson PDF', done: totalContent > 0 },
                { text: 'Generate an AI quiz', done: contentStats?.byType?.QUIZ > 0 },
                { text: 'Create flashcard deck', done: contentStats?.byType?.FLASHCARD_DECK > 0 },
                { text: 'Create a study guide', done: contentStats?.byType?.STUDY_GUIDE > 0 },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className={`
                    w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0
                    ${task.done
                      ? 'bg-teacher-sage text-white'
                      : 'border-2 border-teacher-ink/20'
                    }
                  `}>
                    {task.done && <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  </div>
                  <span className={`text-xs sm:text-sm ${task.done ? 'text-teacher-inkLight line-through' : 'text-teacher-ink'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip Card with Jeffrey */}
          <div className="teacher-card teacher-accent-border p-4 sm:p-5 bg-gradient-to-br from-teacher-gold/5 to-transparent">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-gold/20 bg-teacher-paper">
                <img
                  src="/assets/images/jeffrey-avatar.png"
                  alt="Jeffrey"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-teacher-ink text-xs sm:text-sm mb-0.5 sm:mb-1">
                  Jeffrey's Tip
                </h4>
                <p className="text-[11px] sm:text-xs text-teacher-inkLight leading-relaxed">
                  Upload a PDF of your existing lesson materials, and I'll automatically generate a beautifully formatted lesson, complete with quizzes and flashcards!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Link
        to="/teacher/content/create"
        className="teacher-fab lg:hidden fixed bottom-6 right-4 sm:right-6"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>

      {/* Suggestion Box */}
      <SuggestionBox variant="teacher" />
    </TeacherLayout>
  );
};

export default TeacherDashboardPage;
