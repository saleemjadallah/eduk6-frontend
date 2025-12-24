import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  FileText,
  ArrowLeft,
  Loader2,
  Copy,
  AlertCircle,
  Clock,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Trash2,
  Download,
  Package,
  MapPin,
  Bell,
  Users,
  Zap,
  Target,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';

const SubPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();

  const [subPlan, setSubPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSubPlan();
  }, [id]);

  const loadSubPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAPI.getSubPlan(id);
      // Handle different response formats
      const planData = result.data?.subPlan || result.subPlan || result;
      setSubPlan(planData);
    } catch (err) {
      setError(err.message || 'Failed to load sub plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!subPlan) return;

    let text = `SUBSTITUTE TEACHER PLAN\n${'='.repeat(50)}\n\n`;
    text += `Title: ${subPlan.title}\n`;
    text += `Date: ${formatDate(subPlan.date)}\n`;
    if (subPlan.gradeLevel) text += `Grade Level: ${subPlan.gradeLevel}\n`;
    if (subPlan.subject) text += `Subject: ${subPlan.subject}\n`;
    text += `\n`;

    if (subPlan.schedule && subPlan.schedule.length > 0) {
      text += `SCHEDULE\n${'-'.repeat(30)}\n`;
      subPlan.schedule.forEach(item => {
        text += `${item.time || 'TBD'} - ${item.activity}`;
        if (item.duration) text += ` (${item.duration})`;
        text += `\n`;
        if (item.notes) text += `   Notes: ${item.notes}\n`;
      });
      text += `\n`;
    }

    if (subPlan.activities && subPlan.activities.length > 0) {
      text += `ACTIVITIES\n${'-'.repeat(30)}\n`;
      subPlan.activities.forEach((activity, idx) => {
        text += `\nActivity ${idx + 1}: ${activity.title}\n`;
        if (activity.objective) text += `  Objective: ${activity.objective}\n`;
        if (activity.instructions) text += `  Instructions: ${activity.instructions}\n`;
        if (activity.materials) text += `  Materials: ${activity.materials}\n`;
      });
      text += `\n`;
    }

    if (subPlan.materials && subPlan.materials.length > 0) {
      text += `MATERIALS\n${'-'.repeat(30)}\n`;
      subPlan.materials.forEach(mat => {
        text += `- ${mat.material}`;
        if (mat.location) text += ` (${mat.location})`;
        text += `\n`;
      });
      text += `\n`;
    }

    if (subPlan.backupActivities && subPlan.backupActivities.length > 0) {
      text += `BACKUP ACTIVITIES (If Tech Fails)\n${'-'.repeat(30)}\n`;
      subPlan.backupActivities.forEach((backup, idx) => {
        text += `\nBackup ${idx + 1}: ${backup.title}\n`;
        if (backup.description) text += `  ${backup.description}\n`;
      });
      text += `\n`;
    }

    if (subPlan.emergencyProcedures) {
      text += `EMERGENCY PROCEDURES\n${'-'.repeat(30)}\n${subPlan.emergencyProcedures}\n\n`;
    }

    if (subPlan.classroomNotes) {
      text += `CLASSROOM NOTES\n${'-'.repeat(30)}\n${subPlan.classroomNotes}\n\n`;
    }

    if (subPlan.helpfulStudents) {
      text += `HELPFUL STUDENTS\n${'-'.repeat(30)}\n${subPlan.helpfulStudents}\n`;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sub plan?')) return;

    try {
      setDeleting(true);
      await teacherAPI.deleteSubPlan(id);
      navigate('/teacher/sub-plans');
    } catch (err) {
      setError(err.message || 'Failed to delete sub plan');
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date specified';
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
        {copied ? <CheckCircle2 className="w-4 h-4 text-teacher-sage" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy All'}</span>
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
      <TeacherLayout title="Substitute Plan" subtitle="Loading...">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-teacher-terracotta animate-spin mb-4" />
          <p className="text-teacher-inkLight">Loading sub plan...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !subPlan) {
    return (
      <TeacherLayout title="Substitute Plan" subtitle="Error">
        <div className="max-w-2xl mx-auto">
          <div className="teacher-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-teacher-coral mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-teacher-ink mb-2">
              {error || 'Sub plan not found'}
            </h2>
            <p className="text-teacher-inkLight mb-6">
              The substitute plan you're looking for could not be loaded.
            </p>
            <button
              onClick={() => navigate('/teacher/sub-plans')}
              className="teacher-btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sub Plans
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={subPlan.title || 'Substitute Plan'}
      subtitle={formatDate(subPlan.date)}
      headerActions={headerActions}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/teacher/sub-plans')}
          className="flex items-center gap-2 text-teacher-inkLight hover:text-teacher-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sub Plans
        </button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="teacher-card overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teacher-terracotta to-teacher-gold p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{subPlan.title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(subPlan.date)}
                  </span>
                  {subPlan.gradeLevel && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      Grade {subPlan.gradeLevel}
                    </span>
                  )}
                  {subPlan.subject && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {subPlan.subject}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule Section */}
        {subPlan.schedule && subPlan.schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="teacher-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teacher-terracotta/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teacher-terracotta" />
                </div>
                Daily Schedule
              </h3>
            </div>

            <div className="space-y-3">
              {subPlan.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-teacher-paper to-teacher-chalk/30 rounded-xl border border-teacher-ink/5"
                >
                  <div className="w-20 flex-shrink-0">
                    <span className="font-semibold text-teacher-terracotta">{item.time || 'TBD'}</span>
                    {item.duration && (
                      <span className="block text-xs text-teacher-inkLight mt-1">{item.duration}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-teacher-ink">{item.activity}</p>
                    {item.notes && (
                      <p className="text-sm text-teacher-inkLight mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activities Section */}
        {subPlan.activities && subPlan.activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="teacher-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teacher-gold/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-teacher-gold" />
                </div>
                Activities
              </h3>
              <span className="text-sm text-teacher-inkLight">
                {subPlan.activities.length} activities
              </span>
            </div>

            <div className="space-y-4">
              {subPlan.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gradient-to-br from-teacher-paper to-teacher-chalk/30 rounded-xl border border-teacher-ink/5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-teacher-gold text-white flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="font-semibold text-teacher-ink text-lg">{activity.title}</h4>
                  </div>

                  {activity.objective && (
                    <div className="mb-3 p-3 bg-teacher-plum/5 rounded-lg border-l-4 border-teacher-plum">
                      <span className="text-xs text-teacher-plum uppercase tracking-wider block mb-1">Objective</span>
                      <p className="text-teacher-ink">{activity.objective}</p>
                    </div>
                  )}

                  {activity.instructions && (
                    <div className="mb-3">
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Instructions</span>
                      <p className="text-teacher-ink whitespace-pre-wrap">{activity.instructions}</p>
                    </div>
                  )}

                  {activity.materials && (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-xs text-teacher-inkLight uppercase tracking-wider block mb-1">Materials Needed</span>
                      <p className="text-teacher-ink">{activity.materials}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Materials Section */}
        {subPlan.materials && subPlan.materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="teacher-card p-6"
          >
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teacher-sage/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-teacher-sage" />
              </div>
              Materials & Locations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subPlan.materials.map((mat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-teacher-sage/5 rounded-xl border border-teacher-sage/20"
                >
                  <CheckCircle2 className="w-5 h-5 text-teacher-sage flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-teacher-ink block">{mat.material}</span>
                    {mat.location && (
                      <span className="text-sm text-teacher-inkLight flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {mat.location}
                      </span>
                    )}
                    {mat.notes && (
                      <span className="text-sm text-teacher-inkLight block mt-1">{mat.notes}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Backup Activities Section */}
        {subPlan.backupActivities && subPlan.backupActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="teacher-card p-6"
          >
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teacher-coral/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-teacher-coral" />
              </div>
              Backup Activities
              <span className="text-sm font-normal text-teacher-inkLight">(If Technology Fails)</span>
            </h3>

            <div className="space-y-4">
              {subPlan.backupActivities.map((backup, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-teacher-coral/5 rounded-xl border border-teacher-coral/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-teacher-coral" />
                    <h4 className="font-semibold text-teacher-ink">{backup.title}</h4>
                  </div>
                  {backup.description && (
                    <p className="text-teacher-ink ml-8">{backup.description}</p>
                  )}
                  {backup.materials && (
                    <p className="text-sm text-teacher-inkLight ml-8 mt-2">
                      <strong>Materials:</strong> {backup.materials}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Important Notes Section */}
        {(subPlan.emergencyProcedures || subPlan.classroomNotes || subPlan.helpfulStudents) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="teacher-card p-6"
          >
            <h3 className="text-xl font-semibold text-teacher-ink flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teacher-plum/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-teacher-plum" />
              </div>
              Important Notes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subPlan.emergencyProcedures && (
                <div className="p-4 bg-teacher-coral/5 rounded-xl border border-teacher-coral/20">
                  <h4 className="font-medium text-teacher-coral mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Emergency Procedures
                  </h4>
                  <p className="text-sm text-teacher-ink whitespace-pre-wrap">
                    {subPlan.emergencyProcedures}
                  </p>
                </div>
              )}

              {subPlan.classroomNotes && (
                <div className="p-4 bg-teacher-gold/5 rounded-xl border border-teacher-gold/20">
                  <h4 className="font-medium text-teacher-gold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Classroom Notes
                  </h4>
                  <p className="text-sm text-teacher-ink whitespace-pre-wrap">
                    {subPlan.classroomNotes}
                  </p>
                </div>
              )}

              {subPlan.helpfulStudents && (
                <div className="p-4 bg-teacher-sage/5 rounded-xl border border-teacher-sage/20 md:col-span-2">
                  <h4 className="font-medium text-teacher-sage mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Helpful Students
                  </h4>
                  <p className="text-sm text-teacher-ink whitespace-pre-wrap">
                    {subPlan.helpfulStudents}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between pt-4"
        >
          <button
            onClick={() => navigate('/teacher/sub-plans')}
            className="text-teacher-inkLight hover:text-teacher-ink transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all sub plans
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="teacher-btn-secondary flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-teacher-sage" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All Content'}
            </button>
          </div>
        </motion.div>
      </div>
    </TeacherLayout>
  );
};

export default SubPlanDetailPage;
