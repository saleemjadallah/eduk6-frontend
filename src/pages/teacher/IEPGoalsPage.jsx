import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  Target,
  Plus,
  Loader2,
  Check,
  X,
  RefreshCw,
  Trash2,
  Copy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Zap,
  Sparkles,
  Eye,
  CheckCircle2,
  Brain,
  GraduationCap,
  ClipboardCheck,
  Settings,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Accessibility,
} from 'lucide-react';

// Jeffrey Avatar Component
const JeffreyAvatar = ({ size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-gold/20 bg-teacher-paper`}>
      <img
        src="/assets/images/jeffrey-avatar.png"
        alt="Jeffrey"
        className={`w-full h-full object-cover ${animate ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

// Grade level options
const GRADE_LEVELS = [
  { value: 'Pre-K', label: 'Pre-K' },
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
];

// Fallback disability categories (IDEA 13 categories)
const FALLBACK_DISABILITY_CATEGORIES = [
  { value: 'SPECIFIC_LEARNING_DISABILITY', label: 'Specific Learning Disability (SLD)' },
  { value: 'SPEECH_LANGUAGE_IMPAIRMENT', label: 'Speech or Language Impairment' },
  { value: 'OTHER_HEALTH_IMPAIRMENT', label: 'Other Health Impairment (OHI/ADHD)' },
  { value: 'AUTISM_SPECTRUM', label: 'Autism Spectrum Disorder' },
  { value: 'INTELLECTUAL_DISABILITY', label: 'Intellectual Disability' },
  { value: 'EMOTIONAL_DISTURBANCE', label: 'Emotional Disturbance' },
  { value: 'DEVELOPMENTAL_DELAY', label: 'Developmental Delay (ages 3-9)' },
  { value: 'MULTIPLE_DISABILITIES', label: 'Multiple Disabilities' },
  { value: 'HEARING_IMPAIRMENT', label: 'Hearing Impairment (including Deafness)' },
  { value: 'VISUAL_IMPAIRMENT', label: 'Visual Impairment (including Blindness)' },
  { value: 'ORTHOPEDIC_IMPAIRMENT', label: 'Orthopedic Impairment' },
  { value: 'TRAUMATIC_BRAIN_INJURY', label: 'Traumatic Brain Injury' },
  { value: 'DEAF_BLINDNESS', label: 'Deaf-Blindness' },
];

// Fallback IEP subject areas
const FALLBACK_SUBJECT_AREAS = [
  { value: 'READING_FLUENCY', label: 'Reading Fluency' },
  { value: 'READING_COMPREHENSION', label: 'Reading Comprehension' },
  { value: 'WRITTEN_EXPRESSION', label: 'Written Expression' },
  { value: 'MATH_CALCULATION', label: 'Math Calculation' },
  { value: 'MATH_PROBLEM_SOLVING', label: 'Math Problem Solving' },
  { value: 'SPEECH_ARTICULATION', label: 'Speech Articulation' },
  { value: 'EXPRESSIVE_LANGUAGE', label: 'Expressive Language' },
  { value: 'RECEPTIVE_LANGUAGE', label: 'Receptive Language' },
  { value: 'SOCIAL_SKILLS', label: 'Social Skills' },
  { value: 'BEHAVIOR_SELF_REGULATION', label: 'Behavior/Self-Regulation' },
  { value: 'EXECUTIVE_FUNCTIONING', label: 'Executive Functioning' },
  { value: 'FINE_MOTOR', label: 'Fine Motor Skills' },
  { value: 'GROSS_MOTOR', label: 'Gross Motor Skills' },
  { value: 'ADAPTIVE_LIVING_SKILLS', label: 'Adaptive/Daily Living Skills' },
  { value: 'TRANSITION_VOCATIONAL', label: 'Transition/Vocational Skills' },
];

// Accommodation category icons
const ACCOMMODATION_ICONS = {
  presentation: Eye,
  response: MessageSquare,
  setting: Settings,
  timing: Clock,
};

const IEPGoalsPage = () => {
  const { teacher, quota, refreshQuota } = useTeacherAuth();
  const navigate = useNavigate();

  // Reference data
  const [disabilityCategories, setDisabilityCategories] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loadingReferenceData, setLoadingReferenceData] = useState(true);

  // List state
  const [iepSessions, setIEPSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    gradeLevel: '',
    disabilityCategory: '',
    subjectArea: '',
    presentLevels: '',
    studentName: '',
    additionalContext: '',
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  // Selection state (for saving selected goals)
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [expandedSession, setExpandedSession] = useState(null);

  // Load reference data and sessions on mount
  useEffect(() => {
    loadReferenceData();
    loadIEPSessions();
  }, []);

  const loadReferenceData = async () => {
    try {
      setLoadingReferenceData(true);
      const [categoriesResult, areasResult] = await Promise.all([
        teacherAPI.getDisabilityCategories(),
        teacherAPI.getIEPSubjectAreas(),
      ]);

      // Handle both { success, data: { categories } } and { categories } response formats
      const categories = categoriesResult.data?.categories || categoriesResult.categories || [];
      const areas = areasResult.data?.subjectAreas || areasResult.subjectAreas || [];

      setDisabilityCategories(categories);
      setSubjectAreas(areas);
    } catch (err) {
      console.error('Failed to load reference data:', err);
      // Set fallback data if API fails
      setDisabilityCategories(FALLBACK_DISABILITY_CATEGORIES);
      setSubjectAreas(FALLBACK_SUBJECT_AREAS);
    } finally {
      setLoadingReferenceData(false);
    }
  };

  const loadIEPSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAPI.listIEPSessions({ limit: 50 });
      if (result.success) {
        setIEPSessions(result.data?.sessions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load IEP sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      gradeLevel: '',
      disabilityCategory: '',
      subjectArea: '',
      presentLevels: '',
      studentName: '',
      additionalContext: '',
    });
    setGeneratedData(null);
    setSelectedGoals([]);
    setSelectedAccommodations([]);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setGeneratedData(null);
  };

  const handleGenerateGoals = async () => {
    if (!formData.gradeLevel || !formData.disabilityCategory || !formData.subjectArea || !formData.presentLevels) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const result = await teacherAPI.createIEPSession({
        gradeLevel: formData.gradeLevel,
        disabilityCategory: formData.disabilityCategory,
        subjectArea: formData.subjectArea,
        presentLevels: formData.presentLevels,
        studentName: formData.studentName,
        additionalContext: formData.additionalContext,
      });

      console.log('IEP Create Session Response:', result);
      console.log('Result success:', result.success);
      console.log('Result data:', result.data);
      console.log('Session:', result.data?.session);

      if (result.success) {
        const session = result.data?.session;
        console.log('Setting generatedData to:', session);
        console.log('Generated goals:', session?.generatedGoals);
        setGeneratedData(session);
        setSelectedGoals([]);
        setSelectedAccommodations([]);
        refreshQuota?.();
        loadIEPSessions();
      } else {
        console.log('Result.success was falsy:', result.success);
        setError('Generation completed but no data returned');
      }
    } catch (err) {
      console.error('IEP generation error:', err);
      setError(err.message || 'Failed to generate IEP goals');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generatedData?.id) return;

    try {
      setGenerating(true);
      setError(null);

      const result = await teacherAPI.regenerateIEPGoals(generatedData.id, formData.additionalContext);
      if (result.success) {
        setGeneratedData(result.data?.session);
        setSelectedGoals([]);
        setSelectedAccommodations([]);
        refreshQuota?.();
        loadIEPSessions();
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate goals');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewSession = (session) => {
    navigate(`/teacher/iep-goals/${session.id}`);
  };

  const toggleGoalSelection = (goal) => {
    setSelectedGoals(prev => {
      const exists = prev.find(g => g.id === goal.id);
      if (exists) {
        return prev.filter(g => g.id !== goal.id);
      }
      return [...prev, goal];
    });
  };

  const toggleAccommodationSelection = (accommodation) => {
    setSelectedAccommodations(prev => {
      const key = `${accommodation.category}-${accommodation.accommodation}`;
      const exists = prev.find(a => `${a.category}-${a.accommodation}` === key);
      if (exists) {
        return prev.filter(a => `${a.category}-${a.accommodation}` !== key);
      }
      return [...prev, accommodation];
    });
  };

  const handleSaveSelections = async () => {
    if (!generatedData?.id) return;

    try {
      setActionLoading(prev => ({ ...prev, save: true }));

      const result = await teacherAPI.updateIEPSession(generatedData.id, {
        selectedGoals,
        selectedAccommodations,
      });

      if (result.success) {
        setGeneratedData(result.data?.session);
        loadIEPSessions();
        handleCloseModal();
      }
    } catch (err) {
      setError(err.message || 'Failed to save selections');
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this IEP session?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [sessionId]: 'delete' }));

      await teacherAPI.deleteIEPSession(sessionId);
      loadIEPSessions();
    } catch (err) {
      setError(err.message || 'Failed to delete session');
    } finally {
      setActionLoading(prev => ({ ...prev, [sessionId]: null }));
    }
  };

  const handleCopyGoal = async (goalText) => {
    await navigator.clipboard.writeText(goalText);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDisabilityLabel = (value) => {
    return disabilityCategories.find(c => c.value === value)?.label || value;
  };

  const getSubjectAreaLabel = (value) => {
    return subjectAreas.find(a => a.value === value)?.label || value;
  };

  const headerActions = (
    <button
      onClick={handleCreateNew}
      className="teacher-btn-primary flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create IEP Goals</span>
    </button>
  );

  return (
    <TeacherLayout
      title="IEP Goal Writer"
      subtitle="Generate SMART goals and accommodations for IEP students"
      headerActions={headerActions}
    >
      <div className="max-w-6xl mx-auto">
        {/* Credit Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-teacher-plum/10 to-teacher-gold/10 rounded-xl border border-teacher-plum/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teacher-plum/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-teacher-plum" />
            </div>
            <div>
              <p className="font-medium text-teacher-ink">SMART IEP Goals Generator</p>
              <p className="text-sm text-teacher-inkLight">
                Create legally-compliant IEP goals with accommodations and progress monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teacher-plum/20 text-teacher-plum text-sm font-medium">
            <Zap className="w-4 h-4" />
            ~50 credits per session
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-center gap-3 text-teacher-coral"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="p-1 hover:bg-teacher-coral/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-teacher-plum animate-spin mb-4" />
            <p className="text-teacher-inkLight">Loading your IEP sessions...</p>
          </div>
        ) : iepSessions.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-card p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <JeffreyAvatar size="xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teacher-plum flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-teacher-ink mb-2">
              No IEP Sessions Yet
            </h3>
            <p className="text-teacher-inkLight max-w-md mx-auto mb-6">
              Generate SMART IEP goals that are Specific, Measurable, Achievable, Relevant, and Time-bound.
              I'll also suggest accommodations and progress monitoring strategies tailored to each student's needs.
            </p>
            <button
              onClick={handleCreateNew}
              className="teacher-btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Your First IEP Goals
            </button>
          </motion.div>
        ) : (
          /* IEP Sessions List */
          <div className="space-y-4">
            {iepSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="teacher-card overflow-hidden"
              >
                {/* Session Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-teacher-paper/50 transition-colors"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teacher-plum to-teacher-plumLight flex items-center justify-center text-white">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-teacher-ink">
                          {session.studentIdentifier || 'IEP Goal Session'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-teacher-inkLight">
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" />
                            Grade {session.gradeLevel}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {getSubjectAreaLabel(session.subjectArea)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Accessibility className="w-4 h-4" />
                            {getDisabilityLabel(session.disabilityCategory)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-teacher-inkLight">
                        {formatDate(session.createdAt)}
                      </span>
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-5 h-5 text-teacher-inkLight" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-teacher-inkLight" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedSession === session.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-teacher-ink/5"
                    >
                      <div className="p-5 space-y-4">
                        {/* Goals Preview */}
                        {session.generatedGoals && (
                          <div>
                            <h4 className="text-sm font-medium text-teacher-ink mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-teacher-plum" />
                              Generated Goals ({session.generatedGoals.length})
                            </h4>
                            <div className="space-y-2">
                              {session.generatedGoals.slice(0, 3).map((goal, idx) => (
                                <div
                                  key={goal.id || idx}
                                  className="p-3 bg-teacher-paper rounded-lg border-l-4 border-teacher-plum"
                                >
                                  <p className="text-sm text-teacher-ink line-clamp-2">
                                    {goal.goalStatement}
                                  </p>
                                </div>
                              ))}
                              {session.generatedGoals.length > 3 && (
                                <p className="text-xs text-teacher-inkLight pl-4">
                                  +{session.generatedGoals.length - 3} more goals
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Accommodations Preview */}
                        {session.accommodations && (
                          <div>
                            <h4 className="text-sm font-medium text-teacher-ink mb-3 flex items-center gap-2">
                              <Settings className="w-4 h-4 text-teacher-gold" />
                              Suggested Accommodations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(session.accommodations) ? session.accommodations : []).slice(0, 4).map((catObj, idx) => (
                                <span
                                  key={catObj.category || idx}
                                  className="px-2 py-1 bg-teacher-gold/10 text-teacher-gold rounded-full text-xs font-medium"
                                >
                                  {catObj.title || catObj.category}: {Array.isArray(catObj.accommodations) ? catObj.accommodations.length : 0}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-teacher-ink/5">
                          <button
                            onClick={() => handleViewSession(session)}
                            className="flex-1 py-2.5 px-4 bg-teacher-plum text-white font-medium rounded-lg hover:bg-teacher-plumLight transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Details
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={actionLoading[session.id]}
                            className="py-2.5 px-4 text-teacher-coral hover:bg-teacher-coral/10 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading[session.id] === 'delete' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-teacher-cream rounded-2xl shadow-2xl"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-teacher-cream border-b border-teacher-ink/5 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-plum to-teacher-gold flex items-center justify-center text-white">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-teacher-ink">
                        {generatedData ? 'Review Generated Goals' : 'Generate IEP Goals'}
                      </h2>
                      <p className="text-sm text-teacher-inkLight">
                        {generatedData ? 'Select goals and accommodations to save' : 'Enter student information to generate SMART goals'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {!generatedData ? (
                    /* Form Section */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-teacher-ink mb-2">
                            Grade Level *
                          </label>
                          <select
                            value={formData.gradeLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink bg-white"
                          >
                            <option value="">Select grade</option>
                            {GRADE_LEVELS.map(g => (
                              <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-teacher-ink mb-2">
                            Disability Category *
                          </label>
                          <select
                            value={formData.disabilityCategory}
                            onChange={(e) => setFormData(prev => ({ ...prev, disabilityCategory: e.target.value }))}
                            disabled={loadingReferenceData}
                            className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink bg-white disabled:opacity-50"
                          >
                            <option value="">Select category</option>
                            {disabilityCategories.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-teacher-ink mb-2">
                            Subject Area *
                          </label>
                          <select
                            value={formData.subjectArea}
                            onChange={(e) => setFormData(prev => ({ ...prev, subjectArea: e.target.value }))}
                            disabled={loadingReferenceData}
                            className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink bg-white disabled:opacity-50"
                          >
                            <option value="">Select area</option>
                            {subjectAreas.map(a => (
                              <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Student Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.studentName}
                          onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                          placeholder="For your reference only"
                          className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Present Levels of Performance *
                        </label>
                        <textarea
                          value={formData.presentLevels}
                          onChange={(e) => setFormData(prev => ({ ...prev, presentLevels: e.target.value }))}
                          placeholder="Describe the student's current abilities, strengths, and areas of need. Include specific performance data when available (e.g., 'reads at 2nd grade level', 'correctly solves 60% of single-digit addition problems')..."
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                        />
                        <p className="text-xs text-teacher-inkLight mt-1.5">
                          The more detail you provide, the more specific and useful the goals will be
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Additional Context (Optional)
                        </label>
                        <textarea
                          value={formData.additionalContext}
                          onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                          placeholder="Any other relevant information about the student, classroom environment, or specific goal areas you want to focus on..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-plum focus:ring-2 focus:ring-teacher-plum/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                        />
                      </div>

                      {/* Credit Notice */}
                      <div className="p-4 bg-teacher-plum/10 rounded-xl flex items-center gap-3">
                        <Zap className="w-5 h-5 text-teacher-plum flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-teacher-ink">IEP goal generation uses ~50 credits</p>
                          <p className="text-xs text-teacher-inkLight">
                            You have {quota?.credits?.total - quota?.credits?.used || 0} credits remaining
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 pt-4 border-t border-teacher-ink/10">
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 text-teacher-inkLight hover:text-teacher-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleGenerateGoals}
                          disabled={generating || !formData.gradeLevel || !formData.disabilityCategory || !formData.subjectArea || !formData.presentLevels}
                          className="flex-1 teacher-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating Goals...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate IEP Goals
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Generated Results Section */
                    <div className="space-y-6">
                      {/* Debug info - remove after fixing */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-40">
                          <p><strong>Session ID:</strong> {generatedData.id || 'missing'}</p>
                          <p><strong>Has generatedGoals:</strong> {generatedData.generatedGoals ? 'yes' : 'no'}</p>
                          <p><strong>Goals type:</strong> {typeof generatedData.generatedGoals}</p>
                          <p><strong>Goals is array:</strong> {Array.isArray(generatedData.generatedGoals) ? 'yes' : 'no'}</p>
                          <p><strong>Goals count:</strong> {Array.isArray(generatedData.generatedGoals) ? generatedData.generatedGoals.length : 'N/A'}</p>
                        </div>
                      )}

                      {/* Regenerate Button */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-teacher-inkLight">
                          {generatedData.studentIdentifier ? `Goals for ${generatedData.studentIdentifier}` : 'Generated IEP Goals'}
                        </p>
                        <button
                          onClick={handleRegenerate}
                          disabled={generating}
                          className="text-sm text-teacher-plum hover:text-teacher-plumLight flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                          Regenerate
                        </button>
                      </div>

                      {/* Goals */}
                      <div>
                        <h3 className="text-lg font-semibold text-teacher-ink mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-teacher-plum" />
                          SMART Goals ({Array.isArray(generatedData.generatedGoals) ? generatedData.generatedGoals.length : 0})
                        </h3>
                        {(!generatedData.generatedGoals || generatedData.generatedGoals.length === 0) && (
                          <div className="p-4 bg-teacher-coral/10 text-teacher-coral rounded-xl mb-3">
                            No goals were generated. Please try regenerating.
                          </div>
                        )}
                        <div className="space-y-3">
                          {Array.isArray(generatedData.generatedGoals) && generatedData.generatedGoals.map((goal) => (
                            <div
                              key={goal.id}
                              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                selectedGoals.find(g => g.id === goal.id)
                                  ? 'border-teacher-plum bg-teacher-plum/5'
                                  : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                              }`}
                              onClick={() => toggleGoalSelection(goal)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  selectedGoals.find(g => g.id === goal.id)
                                    ? 'bg-teacher-plum border-teacher-plum text-white'
                                    : 'border-teacher-ink/20'
                                }`}>
                                  {selectedGoals.find(g => g.id === goal.id) && <Check className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-teacher-ink font-medium mb-2">
                                    {goal.goalStatement}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 bg-teacher-paper rounded-lg">
                                      <span className="text-teacher-inkLight">Baseline:</span>{' '}
                                      <span className="text-teacher-ink">{goal.baseline}</span>
                                    </div>
                                    <div className="p-2 bg-teacher-paper rounded-lg">
                                      <span className="text-teacher-inkLight">Target:</span>{' '}
                                      <span className="text-teacher-ink">{goal.target}</span>
                                    </div>
                                    <div className="p-2 bg-teacher-paper rounded-lg">
                                      <span className="text-teacher-inkLight">Measurement:</span>{' '}
                                      <span className="text-teacher-ink">{goal.measurementMethod}</span>
                                    </div>
                                    <div className="p-2 bg-teacher-paper rounded-lg">
                                      <span className="text-teacher-inkLight">Timeline:</span>{' '}
                                      <span className="text-teacher-ink">{goal.timeframe || goal.targetDate}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopyGoal(goal.goalStatement); }}
                                  className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                                  title="Copy goal"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Accommodations */}
                      {generatedData.accommodations && (
                        <div>
                          <h3 className="text-lg font-semibold text-teacher-ink mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-teacher-gold" />
                            Suggested Accommodations
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Array.isArray(generatedData.accommodations) ? generatedData.accommodations : []).map((catObj, catIdx) => {
                              const IconComponent = ACCOMMODATION_ICONS[catObj.category] || Settings;
                              return (
                                <div key={catObj.category || catIdx} className="p-4 bg-teacher-paper rounded-xl">
                                  <h4 className="font-medium text-teacher-ink mb-3 flex items-center gap-2 capitalize">
                                    <IconComponent className="w-4 h-4 text-teacher-gold" />
                                    {catObj.title || catObj.category}
                                  </h4>
                                  <div className="space-y-2">
                                    {(Array.isArray(catObj.accommodations) ? catObj.accommodations : []).map((item, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => toggleAccommodationSelection({ category: catObj.category, ...item })}
                                        className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                                          selectedAccommodations.find(a => a.category === catObj.category && a.accommodation === item.accommodation)
                                            ? 'bg-teacher-gold/20 text-teacher-ink'
                                            : 'bg-white text-teacher-inkLight hover:bg-teacher-ink/5'
                                        }`}
                                      >
                                        <span className="font-medium">{item.accommodation}</span>
                                        {(item.rationale || item.description) && (
                                          <span className="block text-xs mt-0.5 opacity-70">
                                            {item.rationale || item.description}
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Progress Monitoring */}
                      {generatedData.progressMonitoring && (
                        <div>
                          <h3 className="text-lg font-semibold text-teacher-ink mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-teacher-sage" />
                            Progress Monitoring Plan
                          </h3>
                          <div className="space-y-3">
                            {(Array.isArray(generatedData.progressMonitoring) ? generatedData.progressMonitoring : [generatedData.progressMonitoring]).map((plan, idx) => (
                              <div key={idx} className="p-4 bg-teacher-sage/5 rounded-xl border border-teacher-sage/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-teacher-inkLight">Tool:</span>{' '}
                                    <span className="text-teacher-ink font-medium">{plan.tool || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-teacher-inkLight">Frequency:</span>{' '}
                                    <span className="text-teacher-ink font-medium">{plan.frequency || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-teacher-inkLight">Data Collection:</span>{' '}
                                    <span className="text-teacher-ink font-medium">{plan.dataCollection || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-teacher-inkLight">Decision Rules:</span>{' '}
                                    <span className="text-teacher-ink font-medium">{plan.decisionRules || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 pt-4 border-t border-teacher-ink/10">
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 text-teacher-inkLight hover:text-teacher-ink transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleSaveSelections}
                          disabled={actionLoading.save || (selectedGoals.length === 0 && selectedAccommodations.length === 0)}
                          className="flex-1 teacher-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading.save ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Save Selections ({selectedGoals.length} goals, {selectedAccommodations.length} accommodations)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </TeacherLayout>
  );
};

export default IEPGoalsPage;
