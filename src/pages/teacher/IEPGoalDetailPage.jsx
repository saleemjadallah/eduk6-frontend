import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  Target,
  ArrowLeft,
  Loader2,
  Check,
  Copy,
  AlertCircle,
  Settings,
  Clock,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Accessibility,
  Eye,
  MessageSquare,
  Calendar,
  Trash2,
  RefreshCw,
  Download,
  FileText,
  CheckCircle2,
} from 'lucide-react';

// Accommodation category icons
const ACCOMMODATION_ICONS = {
  presentation: Eye,
  response: MessageSquare,
  setting: Settings,
  timing: Clock,
};

// Fallback disability categories
const DISABILITY_LABELS = {
  SPECIFIC_LEARNING_DISABILITY: 'Specific Learning Disability (SLD)',
  SPEECH_LANGUAGE_IMPAIRMENT: 'Speech or Language Impairment',
  OTHER_HEALTH_IMPAIRMENT: 'Other Health Impairment (OHI/ADHD)',
  AUTISM_SPECTRUM: 'Autism Spectrum Disorder',
  INTELLECTUAL_DISABILITY: 'Intellectual Disability',
  EMOTIONAL_DISTURBANCE: 'Emotional Disturbance',
  DEVELOPMENTAL_DELAY: 'Developmental Delay (ages 3-9)',
  MULTIPLE_DISABILITIES: 'Multiple Disabilities',
  HEARING_IMPAIRMENT: 'Hearing Impairment (including Deafness)',
  VISUAL_IMPAIRMENT: 'Visual Impairment (including Blindness)',
  ORTHOPEDIC_IMPAIRMENT: 'Orthopedic Impairment',
  TRAUMATIC_BRAIN_INJURY: 'Traumatic Brain Injury',
  DEAF_BLINDNESS: 'Deaf-Blindness',
};

// Subject area labels
const SUBJECT_LABELS = {
  READING_FLUENCY: 'Reading Fluency',
  READING_COMPREHENSION: 'Reading Comprehension',
  WRITTEN_EXPRESSION: 'Written Expression',
  MATH_CALCULATION: 'Math Calculation',
  MATH_PROBLEM_SOLVING: 'Math Problem Solving',
  SPEECH_ARTICULATION: 'Speech Articulation',
  EXPRESSIVE_LANGUAGE: 'Expressive Language',
  RECEPTIVE_LANGUAGE: 'Receptive Language',
  SOCIAL_SKILLS: 'Social Skills',
  BEHAVIOR_SELF_REGULATION: 'Behavior/Self-Regulation',
  EXECUTIVE_FUNCTIONING: 'Executive Functioning',
  FINE_MOTOR: 'Fine Motor Skills',
  GROSS_MOTOR: 'Gross Motor Skills',
  ADAPTIVE_LIVING_SKILLS: 'Adaptive/Daily Living Skills',
  TRANSITION_VOCATIONAL: 'Transition/Vocational Skills',
};

const IEPGoalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedGoalId, setCopiedGoalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAPI.getIEPSession(id);
      // Handle different response formats
      const sessionData = result.data?.session || result.session || result;
      setSession(sessionData);
    } catch (err) {
      setError(err.message || 'Failed to load IEP session');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyGoal = async (goal) => {
    const text = `${goal.goalStatement}\n\nBaseline: ${goal.baseline}\nTarget: ${goal.target}\nMeasurement: ${goal.measurementMethod}\nTimeline: ${goal.timeframe || 'End of IEP period'}`;
    await navigator.clipboard.writeText(text);
    setCopiedGoalId(goal.id);
    setTimeout(() => setCopiedGoalId(null), 2000);
  };

  const handleCopyAll = async () => {
    if (!session) return;

    let text = `IEP GOALS\n${'='.repeat(50)}\n\n`;
    text += `Student: ${session.studentIdentifier || 'N/A'}\n`;
    text += `Grade Level: ${session.gradeLevel}\n`;
    text += `Disability: ${DISABILITY_LABELS[session.disabilityCategory] || session.disabilityCategory}\n`;
    text += `Subject Area: ${SUBJECT_LABELS[session.subjectArea] || session.subjectArea}\n\n`;

    text += `PRESENT LEVELS\n${'-'.repeat(30)}\n${session.presentLevels}\n\n`;

    text += `SMART GOALS\n${'-'.repeat(30)}\n`;
    (session.generatedGoals || []).forEach((goal, idx) => {
      text += `\nGoal ${idx + 1}:\n${goal.goalStatement}\n`;
      text += `  Baseline: ${goal.baseline}\n`;
      text += `  Target: ${goal.target}\n`;
      text += `  Measurement: ${goal.measurementMethod}\n`;
      text += `  Timeline: ${goal.timeframe || 'End of IEP period'}\n`;
    });

    text += `\nACCOMMODATIONS\n${'-'.repeat(30)}\n`;
    (Array.isArray(session.accommodations) ? session.accommodations : []).forEach(cat => {
      text += `\n${cat.title || cat.category}:\n`;
      (cat.accommodations || []).forEach(item => {
        text += `  - ${item.accommodation}\n`;
      });
    });

    await navigator.clipboard.writeText(text);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this IEP session?')) return;

    try {
      setDeleting(true);
      await teacherAPI.deleteIEPSession(id);
      navigate('/teacher/iep-goals');
    } catch (err) {
      setError(err.message || 'Failed to delete session');
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopyAll}
        className="teacher-btn-secondary flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline">Copy All</span>
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-2 text-teacher-coral hover:bg-teacher-coral/10 rounded-xl transition-colors flex items-center gap-2"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );

  if (loading) {
    return (
      <TeacherLayout title="IEP Goal Session" subtitle="Loading...">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-teacher-plum animate-spin mb-4" />
          <p className="text-teacher-inkLight">Loading IEP session...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !session) {
    return (
      <TeacherLayout title="IEP Goal Session" subtitle="Error">
        <div className="max-w-2xl mx-auto">
          <div className="teacher-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-teacher-coral mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-teacher-ink mb-2">
              {error || 'Session not found'}
            </h2>
            <p className="text-teacher-inkLight mb-6">
              The IEP session you're looking for could not be loaded.
            </p>
            <button
              onClick={() => navigate('/teacher/iep-goals')}
              className="teacher-btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to IEP Goals
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={session.studentIdentifier || 'IEP Goal Session'}
      subtitle={`Created ${formatDate(session.createdAt)}`}
      headerActions={headerActions}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/teacher/iep-goals')}
          className="flex items-center gap-2 text-teacher-inkLight hover:text-teacher-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to IEP Goals
        </button>

        {/* Session Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="teacher-card overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teacher-plum to-teacher-plumLight p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {session.studentIdentifier || 'IEP Goal Session'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Grade {session.gradeLevel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {SUBJECT_LABELS[session.subjectArea] || session.subjectArea}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Accessibility className="w-4 h-4" />
                    {DISABILITY_LABELS[session.disabilityCategory] || session.disabilityCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Present Levels */}
          <div className="p-6 border-b border-teacher-ink/5">
            <h3 className="text-sm font-semibold text-teacher-inkLight uppercase tracking-wider mb-3">
              Present Levels of Performance
            </h3>
            <p className="text-teacher-ink leading-relaxed whitespace-pre-wrap">
              {session.presentLevels}
            </p>
          </div>
        </motion.div>

        {/* SMART Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="teacher-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teacher-plum/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-teacher-plum" />
              </div>
              SMART Goals
            </h3>
            <span className="text-sm text-teacher-inkLight">
              {(session.generatedGoals || []).length} goals generated
            </span>
          </div>

          <div className="space-y-4">
            {(session.generatedGoals || []).map((goal, idx) => (
              <div
                key={goal.id || idx}
                className="p-5 bg-gradient-to-br from-teacher-paper to-teacher-chalk/30 rounded-xl border border-teacher-ink/5"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teacher-plum text-white flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-xs text-teacher-inkLight uppercase tracking-wider">
                      Goal {idx + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyGoal(goal)}
                    className="p-2 text-teacher-inkLight hover:text-teacher-plum hover:bg-teacher-plum/10 rounded-lg transition-all"
                    title="Copy goal"
                  >
                    {copiedGoalId === goal.id ? (
                      <CheckCircle2 className="w-4 h-4 text-teacher-sage" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-teacher-ink font-medium text-lg leading-relaxed mb-4">
                  {goal.goalStatement}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Baseline</span>
                    <span className="text-teacher-ink text-sm">{goal.baseline}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Target</span>
                    <span className="text-teacher-ink text-sm">{goal.target}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Measurement Method</span>
                    <span className="text-teacher-ink text-sm">{goal.measurementMethod}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Timeline</span>
                    <span className="text-teacher-ink text-sm">{goal.timeframe || 'End of IEP period'}</span>
                  </div>
                </div>

                {goal.shortTermObjectives && goal.shortTermObjectives.length > 0 && (
                  <div className="mt-4 p-3 bg-teacher-plum/5 rounded-lg">
                    <span className="text-xs text-teacher-plum uppercase tracking-wider block mb-2">Short-Term Objectives</span>
                    <ul className="space-y-1">
                      {goal.shortTermObjectives.map((obj, objIdx) => (
                        <li key={objIdx} className="text-sm text-teacher-ink flex items-start gap-2">
                          <Check className="w-4 h-4 text-teacher-plum flex-shrink-0 mt-0.5" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accommodations Section */}
        {session.accommodations && (Array.isArray(session.accommodations) ? session.accommodations.length > 0 : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="teacher-card p-6"
          >
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teacher-gold/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-teacher-gold" />
              </div>
              Accommodations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Array.isArray(session.accommodations) ? session.accommodations : []).map((catObj, catIdx) => {
                const IconComponent = ACCOMMODATION_ICONS[catObj.category] || Settings;
                return (
                  <div
                    key={catObj.category || catIdx}
                    className="p-5 bg-gradient-to-br from-teacher-gold/5 to-teacher-paper rounded-xl border border-teacher-gold/20"
                  >
                    <h4 className="font-semibold text-teacher-ink mb-4 flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-teacher-gold" />
                      {catObj.title || catObj.category}
                    </h4>
                    <ul className="space-y-3">
                      {(Array.isArray(catObj.accommodations) ? catObj.accommodations : []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-teacher-sage flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-teacher-ink font-medium block">
                              {typeof item === 'object' ? item.accommodation : item}
                            </span>
                            {item.rationale && (
                              <span className="text-sm text-teacher-inkLight mt-1 block">
                                {item.rationale}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Progress Monitoring Section */}
        {session.progressMonitoring && (Array.isArray(session.progressMonitoring) ? session.progressMonitoring.length > 0 : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="teacher-card p-6"
          >
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teacher-sage/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teacher-sage" />
              </div>
              Progress Monitoring Plan
            </h3>

            <div className="space-y-4">
              {(Array.isArray(session.progressMonitoring) ? session.progressMonitoring : [session.progressMonitoring]).map((plan, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gradient-to-br from-teacher-sage/5 to-teacher-paper rounded-xl border border-teacher-sage/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Assessment Tool</span>
                      <span className="text-teacher-ink font-medium">{plan.tool || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Frequency</span>
                      <span className="text-teacher-ink font-medium">{plan.frequency || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Data Collection Method</span>
                      <span className="text-teacher-ink font-medium">{plan.dataCollection || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Decision Rules</span>
                      <span className="text-teacher-ink font-medium">{plan.decisionRules || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-4"
        >
          <button
            onClick={() => navigate('/teacher/iep-goals')}
            className="text-teacher-inkLight hover:text-teacher-ink transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all sessions
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="teacher-btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy All Content
            </button>
          </div>
        </motion.div>
      </div>
    </TeacherLayout>
  );
};

export default IEPGoalDetailPage;
