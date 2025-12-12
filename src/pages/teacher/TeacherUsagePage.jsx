import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
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
  CreditCard,
} from 'lucide-react';

const TeacherUsagePage = () => {
  const navigate = useNavigate();
  const { teacher, quota } = useTeacherAuth();
  const [period, setPeriod] = useState('month');
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch usage data from API
  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);
      try {
        const response = await teacherAPI.getUsageStats(period);
        if (response.success && response.data) {
          // Map the icons to operation types
          const operationIcons = {
            LESSON: BookOpen,
            QUIZ: FileQuestion,
            FLASHCARD_DECK: Layers,
            STUDY_GUIDE: FileText,
          };

          // Transform byOperation data to include icons
          const byOperation = response.data.byOperation?.map(op => ({
            ...op,
            icon: operationIcons[op.type] || FileText,
          })) || [];

          setUsageData({
            daily: response.data.daily || [],
            byOperation,
            recentActivity: response.data.recentActivity || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch usage stats:', err);
        // Set empty data on error
        setUsageData({
          daily: [],
          byOperation: [],
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [period]);

  // Get credit info from quota response (uses new credit system)
  const credits = quota?.credits || { subscription: 100, total: 100, used: 0, remaining: 100 };

  // Calculate usage percentage based on subscription credits
  const usagePercent = credits.subscription > 0
    ? Math.min(100, (credits.used / credits.subscription) * 100)
    : 0;

  // Format credits for display (credits are already human-readable: 100, 500, 2000)
  const formatCredits = (num) => {
    if (!num && num !== 0) return '0';
    // For large token values (legacy), convert to credits
    if (num >= 10000) {
      const creditValue = Math.round(num / 1000);
      return creditValue.toLocaleString();
    }
    return num.toLocaleString();
  };

  const getTierDetails = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return {
          name: 'Professional',
          icon: Crown,
          color: 'teacher-gold',
          bgGradient: 'from-teacher-gold/20 to-teacher-goldLight/20',
          credits: 2000,
          rolloverCap: 4000,
          price: '$24.99/mo',
          features: ['2,000 credits/month', 'All content types', 'Priority processing', 'AI-powered grading', 'Rollover up to 4,000'],
        };
      case 'BASIC':
        return {
          name: 'Basic',
          icon: Zap,
          color: 'teacher-sage',
          bgGradient: 'from-teacher-sage/20 to-teacher-sageLight/20',
          credits: 500,
          rolloverCap: 1000,
          price: '$9.99/mo',
          features: ['500 credits/month', 'All content types', 'Standard processing', 'Rollover up to 1,000'],
        };
      default:
        return {
          name: 'Free',
          icon: Coffee,
          color: 'teacher-inkLight',
          bgGradient: 'from-teacher-ink/5 to-teacher-ink/10',
          credits: 100,
          rolloverCap: 200,
          price: 'Free',
          features: ['100 credits/month', 'Basic content generation', 'Quiz & flashcard creation', 'Rollover up to 200'],
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
            <button
              onClick={() => navigate('/teacher/billing')}
              className="w-full teacher-btn-gold text-sm"
            >
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
                {formatCredits(credits.used)}
              </span>
              <span className="text-lg text-teacher-inkLight mb-1">
                / {formatCredits(credits.subscription)} credits
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

            {/* Show rollover/bonus if any */}
            {(credits.rollover > 0 || credits.bonus > 0) && (
              <div className="text-sm text-teacher-inkLight mb-2">
                {credits.rollover > 0 && <span className="mr-3">+{credits.rollover} rollover</span>}
                {credits.bonus > 0 && <span>+{credits.bonus} bonus</span>}
                <span className="ml-2 text-teacher-ink font-medium">= {formatCredits(credits.total)} total available</span>
              </div>
            )}

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
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teacher-chalk" />
            </div>
          ) : usageData && usageData.daily.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-24 text-teacher-inkLight text-sm">
              No usage data for this period
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teacher-chalk" />
            </div>
          ) : usageData && usageData.byOperation.length > 0 ? (
            <div className="space-y-4">
              {usageData.byOperation.map((op, i) => {
                const Icon = op.icon || FileText;
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
          ) : (
            <div className="text-center py-8 text-teacher-inkLight text-sm">
              No content generated yet. Create your first lesson to see usage breakdown.
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teacher-chalk" />
            </div>
          ) : usageData && usageData.recentActivity.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-teacher-inkLight text-sm">
              No recent activity yet
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
                Get 2,000 credits per month, priority processing, AI-powered grading, and rollover up to 4,000 credits.
                Perfect for teachers who create content regularly.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate('/teacher/billing')}
                  className="teacher-btn-gold inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Professional - $24.99/mo
                </button>
                <button
                  onClick={() => navigate('/teacher/billing')}
                  className="teacher-btn-secondary inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  View Plans & Billing
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
