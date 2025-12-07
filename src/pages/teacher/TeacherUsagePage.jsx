import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BookOpen,
  FileQuestion,
  Layers,
  FileText,
  GraduationCap,
  Crown,
  Coffee,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

const TeacherUsagePage = () => {
  const { teacher, quota } = useTeacherAuth();
  const [period, setPeriod] = useState('month');
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsageData({
        daily: [
          { date: 'Mon', credits: 2500 },
          { date: 'Tue', credits: 4200 },
          { date: 'Wed', credits: 3100 },
          { date: 'Thu', credits: 5800 },
          { date: 'Fri', credits: 2900 },
          { date: 'Sat', credits: 1200 },
          { date: 'Sun', credits: 800 },
        ],
        byOperation: [
          { name: 'Lesson Generation', credits: 45000, percentage: 45, icon: BookOpen },
          { name: 'Quiz Generation', credits: 25000, percentage: 25, icon: FileQuestion },
          { name: 'Flashcard Creation', credits: 18000, percentage: 18, icon: Layers },
          { name: 'Study Guides', credits: 12000, percentage: 12, icon: FileText },
        ],
        recentActivity: [
          { type: 'LESSON', title: 'Introduction to Photosynthesis', credits: 3200, time: '2 hours ago' },
          { type: 'QUIZ', title: 'Algebra Chapter 5 Quiz', credits: 1800, time: '4 hours ago' },
          { type: 'FLASHCARD_DECK', title: 'Spanish Vocabulary Unit 3', credits: 1200, time: 'Yesterday' },
          { type: 'LESSON', title: 'World War II Timeline', credits: 4100, time: 'Yesterday' },
          { type: 'QUIZ', title: 'Grammar Assessment', credits: 2100, time: '2 days ago' },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [period]);

  // Calculate usage percentage
  const usagePercent = quota
    ? Math.min(100, (Number(quota.tokensUsed || 0) / Number(quota.monthlyQuota || 100000)) * 100)
    : 0;

  const formatCredits = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTierDetails = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return {
          name: 'Professional',
          icon: Crown,
          color: 'teacher-gold',
          bgGradient: 'from-teacher-gold/20 to-teacher-goldLight/20',
          credits: 2000000,
          features: ['Unlimited content types', 'Priority processing', 'Advanced analytics', 'API access'],
        };
      case 'BASIC':
        return {
          name: 'Basic',
          icon: Zap,
          color: 'teacher-sage',
          bgGradient: 'from-teacher-sage/20 to-teacher-sageLight/20',
          credits: 500000,
          features: ['All content types', 'Standard processing', 'Basic analytics'],
        };
      default:
        return {
          name: 'Free',
          icon: Coffee,
          color: 'teacher-inkLight',
          bgGradient: 'from-teacher-ink/5 to-teacher-ink/10',
          credits: 100000,
          features: ['Basic content types', 'Limited generations', 'Community support'],
        };
    }
  };

  const tierDetails = getTierDetails(teacher?.subscriptionTier);
  const TierIcon = tierDetails.icon;

  // Find max value for chart scaling
  const maxDaily = usageData ? Math.max(...usageData.daily.map((d) => d.credits)) : 0;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LESSON': return BookOpen;
      case 'QUIZ': return FileQuestion;
      case 'FLASHCARD_DECK': return Layers;
      case 'STUDY_GUIDE': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'LESSON': return 'teacher-chalk';
      case 'QUIZ': return 'teacher-gold';
      case 'FLASHCARD_DECK': return 'teacher-plum';
      case 'STUDY_GUIDE': return 'teacher-terracotta';
      default: return 'teacher-ink';
    }
  };

  return (
    <TeacherLayout
      title="Usage & Billing"
      subtitle="Monitor your AI credit usage and manage your subscription"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`teacher-card p-6 bg-gradient-to-br ${tierDetails.bgGradient}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-${tierDetails.color}/20`}>
              <TierIcon className={`w-6 h-6 text-${tierDetails.color}`} />
            </div>
            <span className={`teacher-badge ${teacher?.subscriptionTier?.toLowerCase() || 'free'}`}>
              Current Plan
            </span>
          </div>

          <h3 className="font-display text-2xl font-bold text-teacher-ink mb-1">
            {tierDetails.name}
          </h3>
          <p className="text-sm text-teacher-inkLight mb-4">
            {formatCredits(tierDetails.credits)} credits/month
          </p>

          <ul className="space-y-2 mb-6">
            {tierDetails.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-teacher-ink">
                <CheckCircle2 className={`w-4 h-4 text-${tierDetails.color}`} />
                {feature}
              </li>
            ))}
          </ul>

          {teacher?.subscriptionTier !== 'PROFESSIONAL' && (
            <button className="w-full teacher-btn-gold text-sm">
              Upgrade Plan
              <ArrowUpRight className="w-4 h-4 ml-2 inline" />
            </button>
          )}
        </motion.div>

        {/* Credits Usage Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="teacher-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-teacher-ink mb-1">Credits Usage</h3>
              <p className="text-sm text-teacher-inkLight">
                {quota?.quotaResetDate
                  ? `Resets on ${new Date(quota.quotaResetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                  : 'Monthly billing cycle'}
              </p>
            </div>
            <div className="flex gap-2">
              {['week', 'month'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === p
                      ? 'bg-teacher-chalk text-white'
                      : 'bg-teacher-ink/5 text-teacher-inkLight hover:bg-teacher-ink/10'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Big number + progress */}
          <div className="mb-6">
            <div className="flex items-end gap-3 mb-3">
              <span className="font-display text-4xl font-bold text-teacher-ink">
                {formatCredits(quota?.tokensUsed || 0)}
              </span>
              <span className="text-lg text-teacher-inkLight mb-1">
                / {formatCredits(quota?.monthlyQuota || 100000)}
              </span>
              <span className={`
                ml-auto px-2 py-1 rounded-lg text-sm font-medium
                ${usagePercent > 90
                  ? 'bg-teacher-coral/10 text-teacher-coral'
                  : usagePercent > 70
                    ? 'bg-teacher-gold/10 text-teacher-gold'
                    : 'bg-teacher-sage/10 text-teacher-sage'
                }
              `}>
                {Math.round(usagePercent)}% used
              </span>
            </div>

            <div className="h-4 bg-teacher-ink/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  usagePercent > 90
                    ? 'bg-gradient-to-r from-teacher-coral to-red-400'
                    : usagePercent > 70
                      ? 'bg-gradient-to-r from-teacher-gold to-teacher-goldLight'
                      : 'bg-gradient-to-r from-teacher-sage to-teacher-sageLight'
                }`}
              />
            </div>
          </div>

          {/* Mini chart */}
          {usageData && (
            <div className="flex items-end justify-between gap-2 h-24">
              {usageData.daily.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.credits / maxDaily) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full bg-gradient-to-t from-teacher-chalk to-teacher-chalkLight rounded-t-md"
                    style={{ maxHeight: '60px' }}
                  />
                  <span className="text-xs text-teacher-inkLight">{day.date}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Usage by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="teacher-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-teacher-inkLight" />
            <h3 className="font-semibold text-teacher-ink">Usage by Type</h3>
          </div>

          {usageData && (
            <div className="space-y-4">
              {usageData.byOperation.map((op, i) => {
                const Icon = op.icon;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teacher-ink/5 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-teacher-inkLight" />
                        </div>
                        <span className="text-sm font-medium text-teacher-ink">{op.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-teacher-ink">
                          {formatCredits(op.credits)}
                        </span>
                        <span className="text-xs text-teacher-inkLight ml-1">
                          ({op.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-teacher-ink/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${op.percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-teacher-chalk to-teacher-chalkLight rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="teacher-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teacher-inkLight" />
              <h3 className="font-semibold text-teacher-ink">Recent Activity</h3>
            </div>
            <Link to="/teacher/content" className="teacher-link text-sm">
              View all
            </Link>
          </div>

          {usageData && (
            <div className="space-y-3">
              {usageData.recentActivity.map((activity, i) => {
                const Icon = getTypeIcon(activity.type);
                const color = getTypeColor(activity.type);

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-teacher-paper/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-teacher-ink truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-teacher-inkLight">{activity.time}</p>
                    </div>
                    <span className="text-sm font-mono text-teacher-inkLight">
                      -{formatCredits(activity.credits)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upgrade CTA (if not on Professional) */}
      {teacher?.subscriptionTier !== 'PROFESSIONAL' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="teacher-card teacher-accent-border p-8 bg-gradient-to-br from-teacher-gold/5 via-white to-teacher-chalk/5"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teacher-gold to-teacher-goldLight flex items-center justify-center flex-shrink-0">
              <Crown className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-display text-xl font-semibold text-teacher-ink mb-2">
                Unlock more with Professional
              </h3>
              <p className="text-teacher-inkLight mb-4 max-w-xl">
                Get 2M credits per month, priority processing, advanced analytics, and API access.
                Perfect for teachers who create content regularly.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="teacher-btn-gold inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Professional
                </button>
                <button className="teacher-btn-secondary inline-flex items-center gap-2">
                  Compare Plans
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </TeacherLayout>
  );
};

export default TeacherUsagePage;
