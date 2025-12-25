import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { extractText, validateFile, getFileTypeCategory, formatFileSize } from '../../utils/fileProcessors';
import {
  ClipboardList,
  Plus,
  Loader2,
  Check,
  X,
  RefreshCw,
  Trash2,
  Copy,
  Calendar,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Printer,
  Zap,
  Sparkles,
  Edit3,
  Eye,
  CheckCircle2,
  Coffee,
  Bell,
  MapPin,
  Upload,
  File,
  Image,
} from 'lucide-react';

// Ollie Avatar Component
const OllieAvatar = ({ size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-gold/20 bg-teacher-paper`}>
      <img
        src="/assets/images/ollie-avatar.png"
        alt="Ollie"
        className={`w-full h-full object-cover ${animate ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

// Grade level options
const GRADE_LEVELS = [
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

// Time period options
const TIME_PERIODS = [
  { value: 'morning', label: 'Morning Only' },
  { value: 'afternoon', label: 'Afternoon Only' },
  { value: 'full_day', label: 'Full Day' },
];

const SubPlansPage = () => {
  const { teacher, quota, refreshQuota } = useTeacherAuth();
  const navigate = useNavigate();

  // List state
  const [subPlans, setSubPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create/Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    gradeLevel: '',
    subject: '',
    lessonIds: [],
    timePeriod: 'full_day',
    classroomNotes: '',
    emergencyProcedures: '',
    helpfulStudents: '',
  });

  // Lessons for selection
  const [availableLessons, setAvailableLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [extractedContent, setExtractedContent] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Load sub plans on mount
  useEffect(() => {
    loadSubPlans();
  }, []);

  // Load lessons when modal opens
  useEffect(() => {
    if (showCreateModal) {
      loadLessons();
    }
  }, [showCreateModal]);

  const loadSubPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAPI.listSubPlans({ limit: 50 });
      if (result.success) {
        // Backend returns the array directly in data (not data.substitutePlans)
        setSubPlans(result.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load substitute plans');
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      const result = await teacherAPI.listContent({ contentType: 'LESSON', limit: 100 });
      if (result.success) {
        // API returns data as array directly, not data.content
        setAvailableLessons(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      gradeLevel: '',
      subject: '',
      lessonIds: [],
      timePeriod: 'full_day',
      classroomNotes: '',
      emergencyProcedures: '',
      helpfulStudents: '',
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const toggleLessonSelection = (lessonId) => {
    setFormData(prev => ({
      ...prev,
      lessonIds: prev.lessonIds.includes(lessonId)
        ? prev.lessonIds.filter(id => id !== lessonId)
        : [...prev.lessonIds, lessonId],
    }));
  };

  // File upload handling
  const onFileDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setFileError(null);
    setExtractedContent(null);

    try {
      validateFile(file);
      setFileProcessing(true);

      const fileType = getFileTypeCategory(file);

      if (fileType === 'ppt') {
        // PPT files need server-side processing
        const result = await teacherAPI.analyzePPT(file);
        if (result.success && result.data) {
          setExtractedContent({
            text: result.data.extractedText || result.data.content || '',
            title: result.data.suggestedTitle || file.name,
            summary: result.data.summary || '',
            sourceType: 'ppt',
          });
        }
      } else if (fileType === 'pdf') {
        // Try client-side PDF extraction first
        const extracted = await extractText(file);
        if (extracted.text) {
          setExtractedContent({
            text: extracted.text,
            title: extracted.metadata?.title || file.name.replace('.pdf', ''),
            sourceType: 'pdf',
          });
        } else {
          // Fallback to server-side PDF processing
          const result = await teacherAPI.analyzePDF(file);
          if (result.success && result.data) {
            setExtractedContent({
              text: result.data.extractedText || result.data.content || '',
              title: result.data.suggestedTitle || file.name,
              sourceType: 'pdf',
            });
          }
        }
      } else if (fileType === 'image') {
        // Image needs OCR via server
        const extracted = await extractText(file);
        setExtractedContent({
          text: extracted.text,
          title: file.name,
          sourceType: 'image',
        });
      } else if (fileType === 'text') {
        const extracted = await extractText(file);
        setExtractedContent({
          text: extracted.text,
          title: file.name.replace('.txt', ''),
          sourceType: 'text',
        });
      }
    } catch (err) {
      console.error('File processing error:', err);
      setFileError(err.message || 'Failed to process file');
      setUploadedFile(null);
    } finally {
      setFileProcessing(false);
    }
  }, []);

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setExtractedContent(null);
    setFileError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: fileProcessing || generating,
  });

  const handleGeneratePlan = async () => {
    if (!formData.title || !formData.date) {
      setError('Please provide a title and date');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Build request with optional uploaded content
      const requestData = {
        title: formData.title,
        date: formData.date,
        gradeLevel: formData.gradeLevel,
        subject: formData.subject,
        lessonIds: formData.lessonIds,
        timePeriod: formData.timePeriod,
        classroomNotes: formData.classroomNotes,
        emergencyProcedures: formData.emergencyProcedures,
        helpfulStudents: formData.helpfulStudents,
      };

      // Add uploaded content if available
      if (extractedContent?.text) {
        requestData.uploadedContent = {
          text: extractedContent.text,
          title: extractedContent.title,
          sourceType: extractedContent.sourceType,
          summary: extractedContent.summary,
        };
      }

      const result = await teacherAPI.createSubPlan(requestData);

      if (result.success) {
        loadSubPlans();
        setShowCreateModal(false);
        refreshQuota?.();
        // Clear uploaded file after successful generation
        clearUploadedFile();
        // Open the view modal with the new plan
        setViewingPlan(result.data);
        setShowViewModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate substitute plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPlan = (plan) => {
    navigate(`/teacher/sub-plans/${plan.id}`);
  };

  const handleDuplicate = async (planId) => {
    try {
      setActionLoading(prev => ({ ...prev, [planId]: 'duplicate' }));

      const result = await teacherAPI.duplicateSubPlan(planId);
      if (result.success) {
        loadSubPlans();
      }
    } catch (err) {
      setError(err.message || 'Failed to duplicate plan');
    } finally {
      setActionLoading(prev => ({ ...prev, [planId]: null }));
    }
  };

  const handleRegenerate = async (planId) => {
    try {
      setActionLoading(prev => ({ ...prev, [planId]: 'regenerate' }));

      const result = await teacherAPI.regenerateSubPlanActivities(planId);
      if (result.success) {
        loadSubPlans();
        refreshQuota?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate activities');
    } finally {
      setActionLoading(prev => ({ ...prev, [planId]: null }));
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this substitute plan?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [planId]: 'delete' }));

      await teacherAPI.deleteSubPlan(planId);
      loadSubPlans();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setActionLoading(prev => ({ ...prev, [planId]: null }));
    }
  };

  const handlePrint = (plan) => {
    // Open print view in new window for printing
    const printContent = generatePrintHTML(plan);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = (plan) => {
    // Open print view in new window - user can use browser's "Save as PDF" option
    const printContent = generatePrintHTML(plan);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    // Delay slightly to ensure content is rendered
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleSaveToFile = (plan) => {
    // Generate HTML and save as downloadable file
    const printContent = generatePrintHTML(plan);
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.title.replace(/[^a-z0-9]/gi, '_')}_Sub_Plan.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePrintHTML = (plan) => {
    // Data is stored directly on plan, not under plan.content
    const schedule = plan.schedule || [];
    const activities = plan.activities || [];
    const materials = plan.materials || [];
    const backupActivities = plan.backupActivities || [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Substitute Plan - ${plan.title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            max-width: 850px;
            margin: 0 auto;
            padding: 40px 30px;
            color: #1E2A3A;
            line-height: 1.6;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2D5A4A;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #2D5A4A;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 14px;
            color: #666;
            flex-wrap: wrap;
          }
          .meta span { display: flex; align-items: center; gap: 5px; }
          h2 {
            color: #2D5A4A;
            font-size: 18px;
            margin: 25px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e8e0d5;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          h2::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #D4A853;
            border-radius: 50%;
          }
          h3 {
            color: #1E2A3A;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .schedule-item {
            display: flex;
            align-items: flex-start;
            margin: 12px 0;
            padding: 12px 15px;
            background: #faf8f5;
            border-left: 4px solid #7BA68C;
            border-radius: 0 8px 8px 0;
          }
          .schedule-time {
            min-width: 120px;
            font-weight: 600;
            color: #2D5A4A;
            font-size: 14px;
          }
          .schedule-content { flex: 1; }
          .schedule-title { font-weight: 600; color: #1E2A3A; }
          .schedule-desc { font-size: 13px; color: #666; margin-top: 4px; }
          .activity-card {
            margin: 15px 0;
            padding: 20px;
            background: #fdf9f3;
            border: 1px solid #e8e0d5;
            border-radius: 10px;
            page-break-inside: avoid;
          }
          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          .activity-title { font-size: 16px; font-weight: 600; color: #1E2A3A; }
          .activity-duration {
            background: #D4A853;
            color: white;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
          }
          .activity-section { margin-top: 12px; }
          .activity-section-title {
            font-weight: 600;
            font-size: 13px;
            color: #2D5A4A;
            margin-bottom: 6px;
          }
          .objectives-list, .steps-list {
            margin: 0;
            padding-left: 20px;
          }
          .objectives-list li, .steps-list li {
            margin: 4px 0;
            font-size: 14px;
          }
          .materials-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .material-tag {
            background: #fff;
            border: 1px solid #ddd;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 12px;
          }
          .tip-box {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 10px 15px;
            margin-top: 12px;
            border-radius: 0 8px 8px 0;
            font-size: 13px;
          }
          .tip-box.warning {
            background: #fff3e0;
            border-left-color: #ff9800;
          }
          .materials-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .material-card {
            background: #fff;
            border: 1px solid #e8e0d5;
            padding: 12px;
            border-radius: 8px;
          }
          .material-name { font-weight: 600; color: #1E2A3A; font-size: 14px; }
          .material-detail { font-size: 12px; color: #666; margin-top: 4px; }
          .backup-card {
            background: #fff5f5;
            border: 1px solid #ffcdd2;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
          }
          .backup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .backup-title { font-weight: 600; color: #c62828; }
          .backup-when { font-size: 13px; color: #e57373; margin-bottom: 10px; }
          .notes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .note-card {
            padding: 15px;
            border-radius: 8px;
          }
          .note-card.emergency { background: #ffebee; border-left: 4px solid #ef5350; }
          .note-card.classroom { background: #fff8e1; border-left: 4px solid #D4A853; }
          .note-card.students { background: #e8f5e9; border-left: 4px solid #66bb6a; }
          .note-title { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
          .note-content { font-size: 13px; line-height: 1.5; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e8e0d5;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body { padding: 20px; }
            .activity-card, .backup-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 ${plan.title}</h1>
          <div class="meta">
            <span>📅 ${formatDate(plan.date)}</span>
            <span>📚 ${plan.gradeLevel || 'Not specified'}</span>
            <span>📖 ${plan.subject || 'General'}</span>
          </div>
        </div>

        ${schedule.length > 0 ? `
          <h2>Daily Schedule</h2>
          ${schedule.map(item => `
            <div class="schedule-item">
              <div class="schedule-time">${item.startTime} - ${item.endTime}</div>
              <div class="schedule-content">
                <div class="schedule-title">${item.activity || item.title || 'Activity'}</div>
                ${item.description ? `<div class="schedule-desc">${item.description}</div>` : ''}
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${activities.length > 0 ? `
          <h2>Detailed Activities</h2>
          ${activities.map(activity => `
            <div class="activity-card">
              <div class="activity-header">
                <div class="activity-title">${activity.name || activity.title || 'Activity'}</div>
                ${activity.duration ? `<div class="activity-duration">${activity.duration} min</div>` : ''}
              </div>

              ${activity.objectives && activity.objectives.length > 0 ? `
                <div class="activity-section">
                  <div class="activity-section-title">🎯 Objectives</div>
                  <ul class="objectives-list">
                    ${activity.objectives.map(obj => `<li>${obj}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${activity.description && !activity.objectives ? `
                <p style="margin-top: 10px; font-size: 14px;">${activity.description}</p>
              ` : ''}

              ${activity.materials && activity.materials.length > 0 ? `
                <div class="activity-section">
                  <div class="activity-section-title">📦 Materials Needed</div>
                  <div class="materials-tags">
                    ${activity.materials.map(m => `<span class="material-tag">${m}</span>`).join('')}
                  </div>
                </div>
              ` : ''}

              ${(activity.stepByStep || activity.instructions) && (activity.stepByStep?.length > 0 || activity.instructions?.length > 0) ? `
                <div class="activity-section">
                  <div class="activity-section-title">📝 Step-by-Step Instructions</div>
                  <ol class="steps-list">
                    ${(activity.stepByStep || activity.instructions).map(step => `<li>${step}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}

              ${activity.assessmentTips ? `
                <div class="tip-box">
                  <strong>💡 Assessment Tip:</strong> ${activity.assessmentTips}
                </div>
              ` : ''}

              ${activity.differentiationNotes ? `
                <div class="tip-box warning">
                  <strong>🔄 Differentiation:</strong> ${activity.differentiationNotes}
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}

        ${materials.length > 0 ? `
          <h2>Materials & Locations</h2>
          <div class="materials-grid">
            ${materials.map(mat => `
              <div class="material-card">
                <div class="material-name">${mat.item}</div>
                ${mat.location ? `<div class="material-detail">📍 ${mat.location}</div>` : ''}
                ${mat.quantity ? `<div class="material-detail">📊 ${mat.quantity}</div>` : ''}
                ${mat.alternatives && mat.alternatives.length > 0 ? `
                  <div class="material-detail" style="color: #ff9800;">🔄 Alt: ${mat.alternatives.join(', ')}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${backupActivities.length > 0 ? `
          <h2>Backup Activities (If Technology Fails)</h2>
          ${backupActivities.map(backup => `
            <div class="backup-card">
              <div class="backup-header">
                <div class="backup-title">⚡ ${backup.name}</div>
                ${backup.duration ? `<div class="activity-duration">${backup.duration} min</div>` : ''}
              </div>
              ${backup.whenToUse ? `<div class="backup-when">When to use: ${backup.whenToUse}</div>` : ''}
              ${backup.materials && backup.materials.length > 0 ? `
                <div style="margin-bottom: 10px;">
                  <strong style="font-size: 13px;">Materials:</strong>
                  <div class="materials-tags" style="margin-top: 5px;">
                    ${backup.materials.map(m => `<span class="material-tag">${m}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
              ${backup.instructions && backup.instructions.length > 0 ? `
                <ol class="steps-list">
                  ${backup.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ol>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}

        <h2>Important Information</h2>
        <div class="notes-grid">
          ${plan.emergencyProcedures ? `
            <div class="note-card emergency">
              <div class="note-title">🚨 Emergency Procedures</div>
              <div class="note-content">${plan.emergencyProcedures}</div>
            </div>
          ` : ''}
          ${plan.classroomNotes ? `
            <div class="note-card classroom">
              <div class="note-title">📝 Classroom Notes</div>
              <div class="note-content">${plan.classroomNotes}</div>
            </div>
          ` : ''}
          ${plan.helpfulStudents ? `
            <div class="note-card students">
              <div class="note-title">👋 Helpful Students</div>
              <div class="note-content">${plan.helpfulStudents}</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Generated by Orbit Learn • ${formatDate(new Date())}</p>
        </div>
      </body>
      </html>
    `;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const headerActions = (
    <button
      onClick={handleCreateNew}
      className="teacher-btn-primary flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create Sub Plan</span>
    </button>
  );

  return (
    <TeacherLayout
      title="Substitute Plans"
      subtitle="Create emergency sub plans for your classroom"
      headerActions={headerActions}
    >
      <div className="max-w-6xl mx-auto">
        {/* Credit Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-teacher-chalk/10 to-teacher-sage/10 rounded-xl border border-teacher-chalk/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teacher-chalk/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-teacher-chalk" />
            </div>
            <div>
              <p className="font-medium text-teacher-ink">Emergency Sub Plans</p>
              <p className="text-sm text-teacher-inkLight">
                Generate comprehensive plans for substitute teachers in one click
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teacher-chalk/20 text-teacher-chalk text-sm font-medium">
            <Zap className="w-4 h-4" />
            ~40 credits per plan
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
            <Loader2 className="w-10 h-10 text-teacher-chalk animate-spin mb-4" />
            <p className="text-teacher-inkLight">Loading your substitute plans...</p>
          </div>
        ) : subPlans.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-card p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <OllieAvatar size="xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teacher-chalk flex items-center justify-center shadow-lg">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-teacher-ink mb-2">
              No Substitute Plans Yet
            </h3>
            <p className="text-teacher-inkLight max-w-md mx-auto mb-6">
              Be prepared for unexpected absences! Create detailed substitute teacher plans that include schedules, activities, and all the information a sub needs to keep your classroom running smoothly.
            </p>
            <button
              onClick={handleCreateNew}
              className="teacher-btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Sub Plan
            </button>
          </motion.div>
        ) : (
          /* Sub Plans List */
          <div className="space-y-4">
            {subPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="teacher-card overflow-hidden"
              >
                {/* Plan Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-teacher-paper/50 transition-colors"
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teacher-chalk to-teacher-chalkLight flex items-center justify-center text-white">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-teacher-ink">{plan.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-teacher-inkLight">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatShortDate(plan.date)}
                          </span>
                          {plan.gradeLevel && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              Grade {plan.gradeLevel}
                            </span>
                          )}
                          {plan.subject && (
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              {plan.subject}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewPlan(plan); }}
                        className="p-2 text-teacher-chalk hover:bg-teacher-chalk/10 rounded-lg transition-colors"
                        title="View Full Plan"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrint(plan); }}
                        className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      {expandedPlan === plan.id ? (
                        <ChevronUp className="w-5 h-5 text-teacher-inkLight" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-teacher-inkLight" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedPlan === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-teacher-ink/5"
                    >
                      <div className="p-5 space-y-4">
                        {/* Quick Schedule Preview */}
                        {plan.content?.schedule && (
                          <div>
                            <h4 className="text-sm font-medium text-teacher-ink mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-teacher-chalk" />
                              Daily Schedule
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {plan.content.schedule.slice(0, 6).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-teacher-paper rounded-lg border border-teacher-ink/5"
                                >
                                  <p className="text-xs text-teacher-chalk font-medium">
                                    {item.startTime} - {item.endTime}
                                  </p>
                                  <p className="text-sm text-teacher-ink font-medium mt-1 truncate">
                                    {item.title}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {plan.content?.emergencyProcedures && (
                            <div className="p-3 bg-teacher-coral/5 rounded-lg border border-teacher-coral/10">
                              <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-4 h-4 text-teacher-coral" />
                                <span className="text-xs font-medium text-teacher-coral">Emergency Info</span>
                              </div>
                              <p className="text-sm text-teacher-ink line-clamp-2">
                                {plan.content.emergencyProcedures}
                              </p>
                            </div>
                          )}
                          {plan.content?.helpfulStudents && (
                            <div className="p-3 bg-teacher-sage/5 rounded-lg border border-teacher-sage/10">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-teacher-sage" />
                                <span className="text-xs font-medium text-teacher-sage">Helpful Students</span>
                              </div>
                              <p className="text-sm text-teacher-ink line-clamp-2">
                                {plan.content.helpfulStudents}
                              </p>
                            </div>
                          )}
                          {plan.content?.classroomNotes && (
                            <div className="p-3 bg-teacher-gold/5 rounded-lg border border-teacher-gold/10">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-teacher-gold" />
                                <span className="text-xs font-medium text-teacher-gold">Classroom Notes</span>
                              </div>
                              <p className="text-sm text-teacher-ink line-clamp-2">
                                {plan.content.classroomNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-teacher-ink/5">
                          <button
                            onClick={() => handleViewPlan(plan)}
                            className="flex-1 py-2.5 px-4 bg-teacher-chalk text-white font-medium rounded-lg hover:bg-teacher-chalkLight transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Plan
                          </button>
                          <button
                            onClick={() => handleDuplicate(plan.id)}
                            disabled={actionLoading[plan.id]}
                            className="py-2.5 px-4 bg-teacher-paper text-teacher-ink font-medium rounded-lg hover:bg-teacher-ink/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading[plan.id] === 'duplicate' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRegenerate(plan.id)}
                            disabled={actionLoading[plan.id]}
                            className="py-2.5 px-4 bg-teacher-paper text-teacher-ink font-medium rounded-lg hover:bg-teacher-ink/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            title="Regenerate Activities"
                          >
                            {actionLoading[plan.id] === 'regenerate' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            disabled={actionLoading[plan.id]}
                            className="py-2.5 px-4 text-teacher-coral hover:bg-teacher-coral/10 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading[plan.id] === 'delete' ? (
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto"
              onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-teacher-cream rounded-2xl shadow-2xl flex flex-col mt-16 mb-4 max-h-[calc(100vh-6rem)]"
              >
                {/* Modal Header */}
                <div className="bg-teacher-cream border-b border-teacher-ink/5 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-chalk to-teacher-sage flex items-center justify-center text-white">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-teacher-ink">Create Substitute Plan</h2>
                      <p className="text-sm text-teacher-inkLight">
                        Fill in the details for your sub plan
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

                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Plan Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Emergency Sub Plan - March 15"
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Grade Level
                      </label>
                      <select
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink bg-white"
                      >
                        <option value="">Select grade</option>
                        {GRADE_LEVELS.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Math, Science"
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Time Period
                      </label>
                      <select
                        value={formData.timePeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, timePeriod: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink bg-white"
                      >
                        {TIME_PERIODS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                      Upload Lesson Material (Optional)
                    </label>
                    <p className="text-xs text-teacher-inkLight mb-2">
                      Upload a PDF, PowerPoint, or image of your lesson for better activity generation
                    </p>

                    {uploadedFile && extractedContent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-teacher-sage/10 border-2 border-teacher-sage rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-teacher-sage/20 rounded-xl flex items-center justify-center text-teacher-sage">
                            {uploadedFile.type.startsWith('image/') ? (
                              <Image className="w-6 h-6" />
                            ) : (
                              <FileText className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-teacher-ink truncate text-sm">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-teacher-sage">
                              {formatFileSize(uploadedFile.size)} • {extractedContent.text.length.toLocaleString()} characters extracted
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-teacher-sage" />
                            <button
                              type="button"
                              onClick={clearUploadedFile}
                              className="p-1.5 hover:bg-teacher-sage/20 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-teacher-ink" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : fileProcessing ? (
                      <div className="p-6 border-2 border-dashed border-teacher-chalk/50 rounded-xl bg-teacher-chalk/5">
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-teacher-chalk mb-2" />
                          <p className="text-sm text-teacher-inkLight">Processing file...</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          isDragActive
                            ? 'border-teacher-chalk bg-teacher-chalk/10'
                            : 'border-teacher-ink/20 hover:border-teacher-chalk/50 hover:bg-teacher-paper'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-teacher-chalk/10 rounded-xl flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-teacher-chalk" />
                          </div>
                          <p className="text-sm font-medium text-teacher-ink mb-1">
                            {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-xs text-teacher-inkLight">
                            PDF, PowerPoint, or Images up to 10MB
                          </p>
                        </div>
                      </div>
                    )}

                    {fileError && (
                      <p className="mt-2 text-sm text-teacher-coral flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {fileError}
                      </p>
                    )}
                  </div>

                  {/* Lesson Selection */}
                  <div>
                    <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                      Or Select Existing Lessons (Optional)
                    </label>
                    {loadingLessons ? (
                      <div className="flex items-center gap-2 text-teacher-inkLight py-6 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading lessons...</span>
                      </div>
                    ) : availableLessons.length === 0 ? (
                      <div className="text-center py-6 bg-teacher-paper rounded-xl">
                        <BookOpen className="w-8 h-8 mx-auto text-teacher-inkLight/50 mb-2" />
                        <p className="text-sm text-teacher-inkLight">No lessons available</p>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto border border-teacher-ink/10 rounded-xl divide-y divide-teacher-ink/5">
                        {availableLessons.slice(0, 10).map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => toggleLessonSelection(lesson.id)}
                            className={`w-full p-3 text-left flex items-center gap-3 transition-colors ${
                              formData.lessonIds.includes(lesson.id)
                                ? 'bg-teacher-chalk/5'
                                : 'hover:bg-teacher-paper'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              formData.lessonIds.includes(lesson.id)
                                ? 'bg-teacher-chalk border-teacher-chalk text-white'
                                : 'border-teacher-ink/20'
                            }`}>
                              {formData.lessonIds.includes(lesson.id) && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-sm text-teacher-ink truncate">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                      Classroom Notes
                    </label>
                    <textarea
                      value={formData.classroomNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, classroomNotes: e.target.value }))}
                      placeholder="Seating arrangement, routines, attention signals, bathroom policy..."
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Emergency Procedures
                      </label>
                      <textarea
                        value={formData.emergencyProcedures}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyProcedures: e.target.value }))}
                        placeholder="Fire drill routes, lockdown procedures..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-ink mb-1.5 font-sans">
                        Helpful Students
                      </label>
                      <textarea
                        value={formData.helpfulStudents}
                        onChange={(e) => setFormData(prev => ({ ...prev, helpfulStudents: e.target.value }))}
                        placeholder="Names of reliable students who can help..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-teacher-ink/10 focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Fixed Footer */}
                <div className="border-t border-teacher-ink/10 p-4 bg-teacher-cream rounded-b-2xl flex-shrink-0">
                  {/* Credit Notice */}
                  <div className="p-3 bg-teacher-chalk/10 rounded-xl flex items-center gap-3 mb-3">
                    <Zap className="w-4 h-4 text-teacher-chalk flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-teacher-ink">~40 credits • {quota?.credits?.total - quota?.credits?.used || 0} remaining</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm text-teacher-inkLight hover:text-teacher-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGeneratePlan}
                      disabled={generating || !formData.title || !formData.date}
                      className="flex-1 py-2.5 px-4 bg-teacher-chalk text-white text-sm font-medium rounded-xl hover:bg-teacher-chalkLight transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Sub Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </TeacherLayout>
  );
};

export default SubPlansPage;
