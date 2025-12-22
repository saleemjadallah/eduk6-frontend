import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherAPI } from '../../services/api/teacherAPI';
import ExportMenu from '../../components/teacher/ExportMenu';

// Teacher Color Palette
const colors = {
  cream: '#FDF8F3',
  paper: '#FAF7F2',
  chalk: '#2D5A4A',
  chalkLight: '#3D7A6A',
  chalkDark: '#1E3D32',
  terracotta: '#C75B39',
  terracottaLight: '#E8846A',
  terracottaDark: '#9A4329',
  ink: '#1E2A3A',
  inkLight: '#3D4F66',
  gold: '#D4A853',
  goldLight: '#E8C97A',
  goldDark: '#B8923F',
  sage: '#7BAE7F',
  sageLight: '#A8D4AB',
  sageDark: '#5A8E5E',
  coral: '#E07B6B',
  plum: '#7B5EA7',
  plumLight: '#9D85C4',
  plumDark: '#5C4680',
};

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const GenerateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3L14 9L20 9L15 13L17 20L12 16L7 20L9 13L4 9L10 9L12 3Z" />
  </svg>
);

const LessonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const QuizIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FlashcardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 8h10M7 12h6" />
  </svg>
);

const StudyGuideIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const DuplicateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TokenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v12M6 12h12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const contentTypeConfig = {
  LESSON: {
    icon: LessonIcon,
    label: 'Lesson',
    color: colors.chalk,
    lightColor: colors.chalkLight,
    gradient: `linear-gradient(135deg, ${colors.chalk}, ${colors.chalkLight})`
  },
  QUIZ: {
    icon: QuizIcon,
    label: 'Quiz',
    color: colors.plum,
    lightColor: colors.plumLight,
    gradient: `linear-gradient(135deg, ${colors.plum}, ${colors.plumLight})`
  },
  FLASHCARD_DECK: {
    icon: FlashcardIcon,
    label: 'Flashcards',
    color: colors.terracotta,
    lightColor: colors.terracottaLight,
    gradient: `linear-gradient(135deg, ${colors.terracotta}, ${colors.terracottaLight})`
  },
  STUDY_GUIDE: {
    icon: StudyGuideIcon,
    label: 'Study Guide',
    color: colors.gold,
    lightColor: colors.goldLight,
    gradient: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`
  },
};

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: colors.inkLight,
    bg: `${colors.ink}10`,
    borderColor: `${colors.ink}30`
  },
  REVIEW: {
    label: 'In Review',
    color: colors.gold,
    bg: `${colors.gold}20`,
    borderColor: colors.gold
  },
  PUBLISHED: {
    label: 'Published',
    color: colors.sage,
    bg: `${colors.sage}20`,
    borderColor: colors.sage
  },
  ARCHIVED: {
    label: 'Archived',
    color: '#9CA3AF',
    bg: '#F3F4F6',
    borderColor: '#D1D5DB'
  },
};

const subjectOptions = [
  'MATH', 'SCIENCE', 'ENGLISH', 'HISTORY', 'GEOGRAPHY',
  'ART', 'MUSIC', 'PHYSICAL_EDUCATION', 'COMPUTER_SCIENCE', 'OTHER'
];

const gradeLevelOptions = [
  'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

export default function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});

  // Generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateType, setGenerateType] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherAPI.getContent(id);
      if (response.success) {
        setContent(response.data);
        setEditedFields({
          title: response.data.title,
          description: response.data.description || '',
          subject: response.data.subject || '',
          gradeLevel: response.data.gradeLevel || '',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: editedFields.title,
        description: editedFields.description || null,
        subject: editedFields.subject || null,
        gradeLevel: editedFields.gradeLevel || null,
      };

      const response = await teacherAPI.updateContent(id, updateData);
      if (response.success) {
        setContent(response.data);
        setIsEditing(false);
        setSuccessMessage('Content saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSaving(true);
      const response = await teacherAPI.updateContentStatus(id, newStatus);
      if (response.success) {
        setContent(response.data);
        setSuccessMessage(`Content ${newStatus.toLowerCase()} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setSaving(true);
      const response = await teacherAPI.duplicateContent(id);
      if (response.success) {
        navigate(`/teacher/content/${response.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to duplicate content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await teacherAPI.deleteContent(id);
      navigate('/teacher/content');
    } catch (err) {
      setError(err.message || 'Failed to delete content');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleGenerate = async (type, options = {}) => {
    try {
      setGenerating(true);
      setError(null);

      let response;
      // Extract content from various possible sources
      let sourceContent = content.extractedText || '';

      // If no extracted text, build from lesson content
      if (!sourceContent && content.lessonContent) {
        const lc = content.lessonContent;
        const parts = [];

        if (lc.title) parts.push(lc.title);
        if (lc.summary) parts.push(lc.summary);

        // Extract from sections
        if (lc.sections && Array.isArray(lc.sections)) {
          lc.sections.forEach(section => {
            if (section.title) parts.push(section.title);
            if (section.content) parts.push(section.content);
          });
        }

        // Extract vocabulary
        if (lc.vocabulary && Array.isArray(lc.vocabulary)) {
          lc.vocabulary.forEach(v => {
            if (v.term && v.definition) {
              parts.push(`${v.term}: ${v.definition}`);
            }
          });
        }

        // Extract key concepts
        if (lc.objectives && Array.isArray(lc.objectives)) {
          parts.push(...lc.objectives);
        }

        sourceContent = parts.join('\n\n');
      }

      if (!sourceContent) {
        setError('No content available to generate from. Please ensure the lesson has content.');
        setGenerating(false);
        return;
      }

      if (type === 'quiz') {
        response = await teacherAPI.generateQuiz(id, {
          content: sourceContent,
          questionCount: options.questionCount || 10,
          difficulty: options.difficulty || 'medium',
          gradeLevel: content.gradeLevel,
        }, true);
      } else if (type === 'flashcards') {
        response = await teacherAPI.generateFlashcards(id, {
          content: sourceContent,
          cardCount: options.cardCount || 20,
          includeHints: options.includeHints !== false,
          gradeLevel: content.gradeLevel,
        }, true);
      } else if (type === 'study-guide') {
        response = await teacherAPI.generateStudyGuide(id, {
          content: sourceContent,
          format: options.format || 'detailed',
          includeKeyTerms: options.includeKeyTerms !== false,
          includeReviewQuestions: options.includeReviewQuestions !== false,
          gradeLevel: content.gradeLevel,
        });
      }

      if (response?.success) {
        setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchContent(); // Refresh to show updated content
      }
    } catch (err) {
      setError(err.message || `Failed to generate ${type}`);
    } finally {
      setGenerating(false);
      setShowGenerateModal(false);
      setGenerateType(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <motion.div
          style={styles.loadingContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={styles.loadingSpinner}>
            <SpinnerIcon />
          </div>
          <span style={styles.loadingText}>Loading content...</span>
        </motion.div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div style={styles.container}>
        <motion.div
          style={styles.errorContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={styles.errorIcon}>!</div>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <Link to="/teacher/content" style={styles.backLinkButton}>
            <BackIcon /> Back to Content
          </Link>
        </motion.div>
      </div>
    );
  }

  const TypeIcon = contentTypeConfig[content?.contentType]?.icon || LessonIcon;
  const typeConfig = contentTypeConfig[content?.contentType] || contentTypeConfig.LESSON;
  const statusInfo = statusConfig[content?.status] || statusConfig.DRAFT;

  return (
    <div style={styles.container}>
      {/* Header Navigation */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/teacher/content" style={styles.backLink}>
          <BackIcon />
          <span>Back to Content</span>
        </Link>

        <div style={styles.headerActions}>
          {!isEditing ? (
            <>
              <ExportMenu
                contentId={id}
                contentTitle={content.title}
                contentType={content.contentType}
              />
              <button
                onClick={() => setIsEditing(true)}
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 0 ${colors.inkLight}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 3px 0 ${colors.inkLight}30`;
                }}
              >
                <EditIcon /> Edit
              </button>
              <button
                onClick={handleDuplicate}
                style={styles.secondaryButton}
                disabled={saving}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 0 ${colors.inkLight}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 3px 0 ${colors.inkLight}30`;
                }}
              >
                <DuplicateIcon /> Duplicate
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={styles.dangerButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 0 ${colors.coral}90`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 3px 0 ${colors.coral}70`;
                }}
              >
                <DeleteIcon /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedFields({
                    title: content.title,
                    description: content.description || '',
                    subject: content.subject || '',
                    gradeLevel: content.gradeLevel || '',
                  });
                }}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving ? <SpinnerIcon /> : <SaveIcon />} Save Changes
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={styles.successBanner}
          >
            <CheckCircleIcon />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={styles.errorBanner}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.dismissButton}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Header Card */}
      <motion.div
        style={styles.contentHeader}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div style={styles.typeIconWrapper}>
          <div style={{ ...styles.typeIcon, background: typeConfig.gradient }}>
            <TypeIcon />
          </div>
        </div>

        <div style={styles.contentMeta}>
          {isEditing ? (
            <input
              type="text"
              value={editedFields.title}
              onChange={(e) => setEditedFields({ ...editedFields, title: e.target.value })}
              style={styles.titleInput}
              placeholder="Content title"
            />
          ) : (
            <h1 style={styles.contentTitle}>{content.title}</h1>
          )}

          <div style={styles.metaRow}>
            <span style={{
              ...styles.typeBadge,
              backgroundColor: `${typeConfig.color}15`,
              color: typeConfig.color,
              borderColor: `${typeConfig.color}40`
            }}>
              <TypeIcon style={{ width: 14, height: 14 }} />
              {typeConfig.label}
            </span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: statusInfo.bg,
              color: statusInfo.color,
              borderColor: statusInfo.borderColor
            }}>
              {statusInfo.label}
            </span>
            {content.subject && (
              <span style={styles.metaTag}>
                {content.subject.replace('_', ' ')}
              </span>
            )}
            {content.gradeLevel && (
              <span style={styles.metaTag}>
                Grade {content.gradeLevel}
              </span>
            )}
          </div>
        </div>

        {/* Status Actions */}
        <div style={styles.statusActions}>
          {content.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusChange('PUBLISHED')}
              style={styles.publishButton}
              disabled={saving}
            >
              Publish
            </button>
          )}
          {content.status === 'PUBLISHED' && (
            <button
              onClick={() => handleStatusChange('ARCHIVED')}
              style={styles.archiveButton}
              disabled={saving}
            >
              Archive
            </button>
          )}
          {content.status === 'ARCHIVED' && (
            <button
              onClick={() => handleStatusChange('DRAFT')}
              style={styles.restoreButton}
              disabled={saving}
            >
              Restore to Draft
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column - Details */}
        <motion.div
          style={styles.detailsColumn}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionTitleIcon}>📝</span>
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={editedFields.description}
                onChange={(e) => setEditedFields({ ...editedFields, description: e.target.value })}
                style={styles.descriptionInput}
                placeholder="Add a description..."
                rows={4}
              />
            ) : (
              <p style={styles.description}>
                {content.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Subject & Grade */}
          {isEditing && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionTitleIcon}>⚙️</span>
                Details
              </h3>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>
                  <select
                    value={editedFields.subject}
                    onChange={(e) => setEditedFields({ ...editedFields, subject: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Grade Level</label>
                  <select
                    value={editedFields.gradeLevel}
                    onChange={(e) => setEditedFields({ ...editedFields, gradeLevel: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Select grade</option>
                    {gradeLevelOptions.map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Content */}
          {content.lessonContent && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionTitleIcon}>📖</span>
                Lesson Content
              </h3>
              <div style={styles.contentPreview}>
                {content.lessonContent.title && (
                  <h4 style={styles.previewTitle}>{content.lessonContent.title}</h4>
                )}
                {content.lessonContent.objectives && (
                  <div style={styles.previewSection}>
                    <div style={styles.objectivesHeader}>
                      <span style={styles.objectivesIcon}>🎯</span>
                      <strong>Learning Objectives</strong>
                    </div>
                    <ul style={styles.objectivesList}>
                      {content.lessonContent.objectives.map((obj, i) => (
                        <li key={i} style={styles.objectiveItem}>
                          <span style={styles.objectiveCheck}>✓</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.lessonContent.sections && (
                  <div style={styles.previewSection}>
                    <div style={styles.sectionsLabel}>
                      <span style={styles.objectivesIcon}>📚</span>
                      <strong>Sections</strong>
                    </div>
                    {content.lessonContent.sections.map((section, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.sectionPreview,
                          border: expandedSections[`section-${i}`] ? `2px solid ${colors.chalk}` : `1px solid ${colors.ink}15`,
                        }}
                        onClick={() => setExpandedSections(prev => ({
                          ...prev,
                          [`section-${i}`]: !prev[`section-${i}`]
                        }))}
                      >
                        <div style={styles.sectionPreviewHeader}>
                          <span style={styles.sectionNumber}>{i + 1}</span>
                          <h5 style={styles.sectionPreviewTitle}>{section.title}</h5>
                          <span style={{
                            ...styles.expandIcon,
                            transform: expandedSections[`section-${i}`] ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}>
                            ▼
                          </span>
                        </div>
                        {section.duration && (
                          <span style={styles.sectionDuration}>
                            <span>⏱</span> {section.duration} min
                          </span>
                        )}
                        {expandedSections[`section-${i}`] ? (
                          <div style={styles.sectionFullContent}>
                            <p style={styles.sectionContentText}>{section.content}</p>
                            {section.activities && section.activities.length > 0 && (
                              <div style={styles.activitiesSection}>
                                <strong style={styles.subHeading}>🎮 Activities:</strong>
                                <ul style={styles.activityList}>
                                  {section.activities.map((activity, j) => (
                                    <li key={j} style={styles.activityItem}>
                                      {typeof activity === 'string' ? activity : activity.description || activity.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {section.teachingTips && (
                              <div style={styles.tipsSection}>
                                <strong style={styles.subHeading}>💡 Teaching Tips:</strong>
                                <p style={styles.tipText}>{section.teachingTips}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={styles.sectionPreviewContent}>
                            {section.content?.substring(0, 150)}...
                            <span style={styles.clickToExpand}> (click to expand)</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Vocabulary Section */}
                {content.lessonContent.vocabulary && content.lessonContent.vocabulary.length > 0 && (
                  <div style={styles.previewSection}>
                    <div
                      style={styles.vocabularyHeader}
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        vocabulary: !prev.vocabulary
                      }))}
                    >
                      <span style={styles.vocabIcon}>📖</span>
                      <strong>Vocabulary ({content.lessonContent.vocabulary.length} terms)</strong>
                      <span style={{
                        ...styles.expandIcon,
                        transform: expandedSections.vocabulary ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        ▼
                      </span>
                    </div>
                    {expandedSections.vocabulary && (
                      <div style={styles.vocabularyGrid}>
                        {content.lessonContent.vocabulary.map((vocab, i) => (
                          <div key={i} style={styles.vocabularyCard}>
                            <span style={styles.vocabularyTerm}>{vocab.term}</span>
                            <span style={styles.vocabularyDefinition}>{vocab.definition}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Assessment Section */}
                {content.lessonContent.assessment && content.lessonContent.assessment.questions && (
                  <div style={styles.previewSection}>
                    <div
                      style={styles.vocabularyHeader}
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        assessment: !prev.assessment
                      }))}
                    >
                      <span style={styles.vocabIcon}>📝</span>
                      <strong>Assessment ({content.lessonContent.assessment.questions.length} questions)</strong>
                      <span style={{
                        ...styles.expandIcon,
                        transform: expandedSections.assessment ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        ▼
                      </span>
                    </div>
                    {expandedSections.assessment && (
                      <div style={styles.assessmentList}>
                        {content.lessonContent.assessment.questions.map((q, i) => (
                          <div key={i} style={styles.assessmentQuestion}>
                            <span style={styles.questionNumber}>Q{i + 1}</span>
                            <div style={styles.questionContent}>
                              <p style={styles.questionText}>{q.question}</p>
                              {q.options && (
                                <ul style={styles.optionsList}>
                                  {q.options.map((opt, j) => (
                                    <li
                                      key={j}
                                      style={{
                                        ...styles.optionItem,
                                        backgroundColor: opt === q.correctAnswer || j === q.correctIndex ? `${colors.sage}20` : colors.paper,
                                        borderColor: opt === q.correctAnswer || j === q.correctIndex ? colors.sage : 'transparent',
                                        fontWeight: opt === q.correctAnswer || j === q.correctIndex ? '500' : '400',
                                      }}
                                    >
                                      {opt}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quiz Content */}
          {content.quizContent && content.quizContent.questions?.length > 0 && (
            <div style={styles.section}>
              <div
                style={styles.quizSectionHeader}
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  quiz: !prev.quiz
                }))}
              >
                <div style={styles.quizSectionTitle}>
                  <span style={styles.quizIcon}>❓</span>
                  <span>Quiz ({content.quizContent.questions.length} questions)</span>
                </div>
                <span style={{
                  ...styles.expandIconLarge,
                  transform: expandedSections.quiz ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <div style={styles.quizPreview}>
                {/* Render quiz questions with answers */}
                {(expandedSections.quiz ? content.quizContent.questions : content.quizContent.questions.slice(0, 3)).map((q, i) => (
                  <motion.div
                    key={i}
                    style={styles.quizQuestionCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div style={styles.quizQuestionHeader}>
                      <span style={styles.quizQuestionNumber}>Q{i + 1}</span>
                      {q.type && (
                        <span style={styles.questionType}>
                          {q.type === 'multiple_choice' ? '🔘 Multiple Choice' :
                           q.type === 'true_false' ? '✓✗ True/False' :
                           q.type === 'fill_blank' ? '📝 Fill in Blank' :
                           q.type === 'short_answer' ? '✏️ Short Answer' : q.type}
                        </span>
                      )}
                      {q.points && (
                        <span style={styles.questionPoints}>{q.points} pt{q.points > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <p style={styles.quizQuestionText}>{q.question}</p>

                    {/* Multiple choice options */}
                    {q.options && q.options.length > 0 && (
                      <div style={styles.quizOptionsList}>
                        {q.options.map((option, j) => {
                          const isCorrect = option === q.correctAnswer || j === q.correctIndex;
                          return (
                            <div
                              key={j}
                              style={{
                                ...styles.quizOption,
                                backgroundColor: isCorrect ? `${colors.sage}15` : colors.paper,
                                borderColor: isCorrect ? colors.sage : `${colors.ink}15`,
                                borderWidth: isCorrect ? '2px' : '1px',
                              }}
                            >
                              <span style={{
                                ...styles.quizOptionLetter,
                                backgroundColor: isCorrect ? colors.sage : `${colors.ink}10`,
                                color: isCorrect ? 'white' : colors.inkLight,
                              }}>
                                {String.fromCharCode(65 + j)}
                              </span>
                              <span style={{ color: isCorrect ? colors.sageDark : colors.ink, flex: 1 }}>{option}</span>
                              {isCorrect && (
                                <span style={styles.correctBadge}>
                                  <CheckCircleIcon /> Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False answer */}
                    {q.type === 'true_false' && !q.options && q.correctAnswer !== undefined && (
                      <div style={styles.quizAnswerBox}>
                        <span style={styles.answerLabel}>Answer:</span>
                        <span style={styles.correctAnswerText}>
                          {String(q.correctAnswer).toLowerCase() === 'true' ? '✓ True' : '✗ False'}
                        </span>
                      </div>
                    )}

                    {/* Short answer / Fill in blank */}
                    {(q.type === 'short_answer' || q.type === 'fill_blank') && q.correctAnswer && (
                      <div style={styles.quizAnswerBox}>
                        <span style={styles.answerLabel}>Answer:</span>
                        <span style={styles.correctAnswerText}>{q.correctAnswer}</span>
                      </div>
                    )}

                    {/* Fallback: Show correct answer if present but no options */}
                    {!q.options && q.type !== 'true_false' && q.type !== 'short_answer' && q.type !== 'fill_blank' && q.correctAnswer && (
                      <div style={styles.quizAnswerBox}>
                        <span style={styles.answerLabel}>Answer:</span>
                        <span style={styles.correctAnswerText}>{q.correctAnswer}</span>
                      </div>
                    )}

                    {/* Explanation if available */}
                    {q.explanation && (
                      <div style={styles.quizExplanation}>
                        <span style={styles.explanationLabel}>💡 Explanation:</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Show expand prompt when collapsed and more questions exist */}
                {!expandedSections.quiz && content.quizContent.questions.length > 3 && (
                  <p
                    style={styles.moreText}
                    onClick={() => setExpandedSections(prev => ({...prev, quiz: true}))}
                  >
                    +{content.quizContent.questions.length - 3} more questions (click to expand)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Flashcard Content */}
          {content.flashcardContent && content.flashcardContent.cards?.length > 0 && (
            <div style={styles.section}>
              <div
                style={styles.quizSectionHeader}
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  flashcards: !prev.flashcards
                }))}
              >
                <div style={styles.quizSectionTitle}>
                  <span style={styles.quizIcon}>🃏</span>
                  <span>Flashcards ({content.flashcardContent.cards.length} cards)</span>
                </div>
                <span style={{
                  ...styles.expandIconLarge,
                  transform: expandedSections.flashcards ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <div style={styles.flashcardGrid}>
                {/* Always show first 3 cards */}
                {content.flashcardContent.cards.slice(0, 3).map((card, i) => (
                  <motion.div
                    key={i}
                    style={styles.flashcardPreview}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div style={styles.flashcardFront}>
                      <span style={styles.flashcardLabel}>Q</span>
                      <span>{card.front || card.term}</span>
                    </div>
                    <div style={styles.flashcardDivider}>→</div>
                    <div style={styles.flashcardBack}>
                      <span style={styles.flashcardLabelBack}>A</span>
                      <span>{card.back || card.definition}</span>
                    </div>
                  </motion.div>
                ))}
                {/* Show remaining cards when expanded */}
                {expandedSections.flashcards && content.flashcardContent.cards.length > 3 && (
                  content.flashcardContent.cards.slice(3).map((card, i) => (
                    <motion.div
                      key={i + 3}
                      style={styles.flashcardPreview}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (i + 3) * 0.03 }}
                    >
                      <div style={styles.flashcardFront}>
                        <span style={styles.flashcardLabel}>Q</span>
                        <span>{card.front || card.term}</span>
                      </div>
                      <div style={styles.flashcardDivider}>→</div>
                      <div style={styles.flashcardBack}>
                        <span style={styles.flashcardLabelBack}>A</span>
                        <span>{card.back || card.definition}</span>
                      </div>
                    </motion.div>
                  ))
                )}
                {/* Show expand prompt when collapsed and more cards exist */}
                {!expandedSections.flashcards && content.flashcardContent.cards.length > 3 && (
                  <p
                    style={styles.moreText}
                    onClick={() => setExpandedSections(prev => ({...prev, flashcards: true}))}
                  >
                    +{content.flashcardContent.cards.length - 3} more cards (click to expand)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Infographic */}
          {content.infographicUrl && (
            <div style={styles.section}>
              <div
                style={styles.quizSectionHeader}
                onClick={() => setExpandedSections(prev => ({...prev, infographic: !prev.infographic}))}
              >
                <div style={styles.quizSectionTitle}>
                  <span style={styles.quizIcon}>🖼️</span>
                  <span>Infographic</span>
                </div>
                <span style={{
                  ...styles.expandIconLarge,
                  transform: expandedSections.infographic !== false ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <AnimatePresence>
                {expandedSections.infographic !== false && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={styles.infographicContainer}>
                      <img
                        src={content.infographicUrl}
                        alt="Generated infographic"
                        style={styles.infographicImage}
                        onClick={() => window.open(content.infographicUrl, '_blank')}
                      />
                      <p style={styles.infographicHint}>Click image to view full size</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Source Text */}
          {content.extractedText && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionTitleIcon}>📄</span>
                Source Text
              </h3>
              <div style={styles.sourceText}>
                {content.extractedText.substring(0, 500)}
                {content.extractedText.length > 500 && '...'}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column - Actions & Info */}
        <motion.div
          style={styles.actionsColumn}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Generate Actions */}
          <div style={styles.actionCard}>
            <div style={styles.actionCardHeader}>
              <div style={styles.actionCardIconWrapper}>
                <SparklesIcon />
              </div>
              <div>
                <h3 style={styles.actionCardTitle}>Generate Content</h3>
                <p style={styles.actionCardDescription}>
                  Use AI to create materials
                </p>
              </div>
            </div>
            <div style={styles.generateButtons}>
              <button
                onClick={() => { setGenerateType('quiz'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = colors.plum;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${colors.ink}15`;
                }}
              >
                <span style={{...styles.generateIcon, background: `linear-gradient(135deg, ${colors.plum}, ${colors.plumLight})`}}>
                  <QuizIcon />
                </span>
                <span style={styles.generateText}>
                  <span style={styles.generateLabel}>Generate Quiz</span>
                  <span style={styles.generateHint}>Create questions</span>
                </span>
              </button>
              <button
                onClick={() => { setGenerateType('flashcards'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = colors.terracotta;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${colors.ink}15`;
                }}
              >
                <span style={{...styles.generateIcon, background: `linear-gradient(135deg, ${colors.terracotta}, ${colors.terracottaLight})`}}>
                  <FlashcardIcon />
                </span>
                <span style={styles.generateText}>
                  <span style={styles.generateLabel}>Generate Flashcards</span>
                  <span style={styles.generateHint}>Study cards</span>
                </span>
              </button>
              <button
                onClick={() => { setGenerateType('study-guide'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = colors.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${colors.ink}15`;
                }}
              >
                <span style={{...styles.generateIcon, background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`}}>
                  <StudyGuideIcon />
                </span>
                <span style={styles.generateText}>
                  <span style={styles.generateLabel}>Generate Study Guide</span>
                  <span style={styles.generateHint}>Summary & review</span>
                </span>
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.infoCardTitle}>
              <span style={styles.infoIcon}>ℹ️</span>
              Information
            </h3>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  <CalendarIcon /> Created
                </span>
                <span style={styles.infoValue}>
                  {new Date(content.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  <CalendarIcon /> Updated
                </span>
                <span style={styles.infoValue}>
                  {new Date(content.updatedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              {content.publishedAt && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    <CheckCircleIcon /> Published
                  </span>
                  <span style={styles.infoValue}>
                    {new Date(content.publishedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {content.tokensUsed > 0 && (
                <div style={styles.infoRowHighlight}>
                  <span style={styles.infoLabel}>
                    <TokenIcon /> Tokens Used
                  </span>
                  <span style={styles.infoValueBold}>
                    {content.tokensUsed.toLocaleString()}
                  </span>
                </div>
              )}
              {content.template && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Template</span>
                  <span style={styles.infoValue}>{content.template.name}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => { setShowGenerateModal(false); setGenerateType(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div style={{
                  ...styles.modalIconWrapper,
                  background: generateType === 'quiz' ? `linear-gradient(135deg, ${colors.plum}, ${colors.plumLight})` :
                              generateType === 'flashcards' ? `linear-gradient(135deg, ${colors.terracotta}, ${colors.terracottaLight})` :
                              `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`
                }}>
                  {generateType === 'quiz' ? <QuizIcon /> :
                   generateType === 'flashcards' ? <FlashcardIcon /> :
                   <StudyGuideIcon />}
                </div>
                <h2 style={styles.modalTitle}>
                  Generate {generateType === 'study-guide' ? 'Study Guide' : generateType?.charAt(0).toUpperCase() + generateType?.slice(1)}
                </h2>
              </div>
              <p style={styles.modalDescription}>
                AI will analyze your content and generate {generateType === 'quiz' ? 'engaging quiz questions' : generateType === 'flashcards' ? 'study flashcards' : 'a comprehensive study guide'}.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => { setShowGenerateModal(false); setGenerateType(null); }}
                  style={styles.modalSecondaryButton}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerate(generateType)}
                  style={styles.modalPrimaryButton}
                  disabled={generating}
                >
                  {generating ? <><SpinnerIcon /> Generating...</> : <><SparklesIcon /> Generate</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div style={{...styles.modalIconWrapper, background: `linear-gradient(135deg, ${colors.coral}, #F87171)`}}>
                  <DeleteIcon />
                </div>
                <h2 style={{...styles.modalTitle, color: colors.coral}}>Delete Content</h2>
              </div>
              <p style={styles.modalDescription}>
                Are you sure you want to delete <strong>"{content.title}"</strong>? This action cannot be undone.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={styles.modalSecondaryButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={styles.modalDangerButton}
                  disabled={deleting}
                >
                  {deleting ? <><SpinnerIcon /> Deleting...</> : <><DeleteIcon /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
    fontFamily: 'Outfit, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 20px',
    gap: '16px',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.chalk,
  },
  loadingText: {
    color: colors.inkLight,
    fontSize: '15px',
    fontWeight: '500',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  errorIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: `${colors.coral}20`,
    color: colors.coral,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
  },
  errorTitle: {
    color: colors.coral,
    fontSize: '20px',
    fontWeight: '600',
    fontFamily: 'Fraunces, serif',
    margin: 0,
  },
  errorText: {
    color: colors.inkLight,
    fontSize: '15px',
    margin: 0,
  },
  backLinkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: colors.chalk,
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
    boxShadow: `0 4px 0 ${colors.chalkDark}`,
    transition: 'all 0.15s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.inkLight,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: `linear-gradient(135deg, ${colors.chalk}, ${colors.chalkLight})`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${colors.chalkDark}`,
    transition: 'all 0.15s ease',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: 'white',
    color: colors.ink,
    border: `2px solid ${colors.ink}20`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: `0 3px 0 ${colors.inkLight}30`,
    transition: 'all 0.15s ease',
  },
  dangerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: `${colors.coral}10`,
    color: colors.coral,
    border: `2px solid ${colors.coral}30`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: `0 3px 0 ${colors.coral}70`,
    transition: 'all 0.15s ease',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    backgroundColor: `${colors.sage}15`,
    color: colors.sageDark,
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '600',
    border: `2px solid ${colors.sage}40`,
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    backgroundColor: `${colors.coral}15`,
    color: colors.coral,
    borderRadius: '12px',
    marginBottom: '20px',
    fontWeight: '500',
    border: `2px solid ${colors.coral}40`,
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: colors.coral,
    lineHeight: 1,
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: `1px solid ${colors.ink}10`,
    marginBottom: '24px',
    boxShadow: `0 4px 12px ${colors.ink}08`,
    position: 'relative',
    overflow: 'hidden',
  },
  typeIconWrapper: {
    flexShrink: 0,
  },
  typeIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  contentMeta: {
    flex: 1,
    minWidth: 0,
  },
  contentTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: colors.ink,
    margin: '0 0 14px 0',
    fontFamily: 'Fraunces, serif',
    lineHeight: 1.3,
  },
  titleInput: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.ink,
    width: '100%',
    padding: '10px 14px',
    border: `2px solid ${colors.chalk}`,
    borderRadius: '10px',
    marginBottom: '14px',
    fontFamily: 'Fraunces, serif',
    outline: 'none',
    boxShadow: `0 0 0 4px ${colors.chalk}20`,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1.5px solid',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1.5px solid',
  },
  metaTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: colors.paper,
    color: colors.inkLight,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  statusActions: {
    flexShrink: 0,
  },
  publishButton: {
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${colors.sage}, ${colors.sageLight})`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${colors.sageDark}`,
    transition: 'all 0.15s ease',
  },
  archiveButton: {
    padding: '12px 24px',
    backgroundColor: colors.inkLight,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${colors.ink}`,
    transition: 'all 0.15s ease',
  },
  restoreButton: {
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${colors.chalk}, ${colors.chalkLight})`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${colors.chalkDark}`,
    transition: 'all 0.15s ease',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
  },
  detailsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: `1px solid ${colors.ink}10`,
    boxShadow: `0 2px 8px ${colors.ink}06`,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '17px',
    fontWeight: '700',
    color: colors.ink,
    margin: '0 0 16px 0',
    fontFamily: 'Fraunces, serif',
  },
  sectionTitleIcon: {
    fontSize: '18px',
  },
  description: {
    color: colors.inkLight,
    lineHeight: '1.7',
    margin: 0,
    fontSize: '15px',
  },
  descriptionInput: {
    width: '100%',
    padding: '14px',
    border: `2px solid ${colors.ink}15`,
    borderRadius: '10px',
    fontSize: '15px',
    lineHeight: '1.6',
    resize: 'vertical',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.ink,
  },
  select: {
    padding: '12px 14px',
    border: `2px solid ${colors.ink}15`,
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'white',
    fontFamily: 'Outfit, sans-serif',
    cursor: 'pointer',
    outline: 'none',
  },
  contentPreview: {
    backgroundColor: colors.paper,
    borderRadius: '12px',
    padding: '20px',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.ink,
    margin: '0 0 16px 0',
    fontFamily: 'Fraunces, serif',
  },
  previewSection: {
    marginBottom: '20px',
  },
  objectivesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    color: colors.ink,
    fontWeight: '600',
  },
  objectivesIcon: {
    fontSize: '16px',
  },
  objectivesList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  objectiveItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: `${colors.sage}10`,
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    color: colors.ink,
    lineHeight: '1.5',
  },
  objectiveCheck: {
    color: colors.sage,
    fontWeight: '700',
    flexShrink: 0,
  },
  sectionsLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    color: colors.ink,
    fontWeight: '600',
  },
  sectionPreview: {
    padding: '18px',
    backgroundColor: 'white',
    borderRadius: '12px',
    marginTop: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sectionPreviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: colors.chalk,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  sectionPreviewTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.ink,
    margin: 0,
    flex: 1,
  },
  expandIcon: {
    fontSize: '10px',
    color: colors.inkLight,
    transition: 'transform 0.2s ease',
  },
  expandIconLarge: {
    fontSize: '12px',
    color: colors.inkLight,
    transition: 'transform 0.2s ease',
  },
  sectionDuration: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: colors.inkLight,
    backgroundColor: colors.paper,
    padding: '4px 10px',
    borderRadius: '6px',
    marginTop: '10px',
    marginLeft: '40px',
  },
  sectionPreviewContent: {
    fontSize: '14px',
    color: colors.inkLight,
    margin: '14px 0 0 40px',
    lineHeight: '1.6',
  },
  clickToExpand: {
    color: colors.chalk,
    fontSize: '13px',
    fontWeight: '500',
  },
  sectionFullContent: {
    marginTop: '16px',
    marginLeft: '40px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.ink}10`,
  },
  sectionContentText: {
    fontSize: '14px',
    color: colors.ink,
    lineHeight: '1.7',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  activitiesSection: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: `${colors.sage}10`,
    borderRadius: '10px',
    borderLeft: `4px solid ${colors.sage}`,
  },
  subHeading: {
    fontSize: '13px',
    color: colors.sageDark,
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
  },
  activityList: {
    margin: 0,
    paddingLeft: '20px',
  },
  activityItem: {
    fontSize: '13px',
    color: colors.sageDark,
    marginBottom: '6px',
    lineHeight: '1.5',
  },
  tipsSection: {
    marginTop: '14px',
    padding: '14px',
    backgroundColor: `${colors.gold}15`,
    borderRadius: '10px',
    borderLeft: `4px solid ${colors.gold}`,
  },
  tipText: {
    fontSize: '13px',
    color: colors.goldDark,
    margin: 0,
    lineHeight: '1.5',
  },
  vocabularyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    backgroundColor: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    border: `1px solid ${colors.ink}10`,
    transition: 'all 0.2s',
  },
  vocabIcon: {
    fontSize: '16px',
  },
  vocabularyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
    marginTop: '14px',
  },
  vocabularyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px',
    backgroundColor: `${colors.plum}10`,
    borderRadius: '10px',
    borderLeft: `4px solid ${colors.plum}`,
  },
  vocabularyTerm: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.plum,
  },
  vocabularyDefinition: {
    fontSize: '13px',
    color: colors.plumDark,
    lineHeight: '1.5',
  },
  assessmentList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  assessmentQuestion: {
    display: 'flex',
    gap: '14px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: `1px solid ${colors.ink}10`,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: '14px',
    color: colors.ink,
    margin: '0 0 12px 0',
    fontWeight: '500',
    lineHeight: '1.5',
  },
  optionsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionItem: {
    fontSize: '13px',
    color: colors.ink,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid transparent',
    transition: 'all 0.2s',
  },
  questionNumber: {
    backgroundColor: colors.plum,
    color: 'white',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    height: 'fit-content',
  },
  // Quiz section styles
  quizSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  quizSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '17px',
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Fraunces, serif',
  },
  quizIcon: {
    fontSize: '20px',
  },
  quizPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  quizQuestionCard: {
    backgroundColor: colors.paper,
    borderRadius: '14px',
    padding: '20px',
    border: `1px solid ${colors.ink}08`,
  },
  quizQuestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  quizQuestionNumber: {
    background: `linear-gradient(135deg, ${colors.plum}, ${colors.plumLight})`,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
  },
  questionType: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.inkLight,
    backgroundColor: 'white',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  questionPoints: {
    fontSize: '13px',
    color: colors.terracotta,
    fontWeight: '700',
    marginLeft: 'auto',
    backgroundColor: `${colors.terracotta}15`,
    padding: '4px 10px',
    borderRadius: '6px',
  },
  quizQuestionText: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.ink,
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  quizOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  quizOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  quizOptionLetter: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  correctBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    color: colors.sage,
    backgroundColor: `${colors.sage}20`,
    padding: '4px 10px',
    borderRadius: '6px',
  },
  quizAnswerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    backgroundColor: `${colors.sage}15`,
    borderRadius: '10px',
    border: `2px solid ${colors.sage}40`,
  },
  answerLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.sageDark,
  },
  correctAnswerText: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.sage,
  },
  quizExplanation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '14px',
    padding: '14px',
    backgroundColor: `${colors.gold}12`,
    borderRadius: '10px',
    fontSize: '13px',
    color: colors.goldDark,
    lineHeight: '1.6',
    borderLeft: `4px solid ${colors.gold}`,
  },
  explanationLabel: {
    fontWeight: '700',
    color: colors.gold,
  },
  flashcardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  flashcardPreview: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '12px',
    alignItems: 'stretch',
    padding: '16px',
    backgroundColor: colors.paper,
    borderRadius: '12px',
    border: `1px solid ${colors.ink}08`,
  },
  flashcardFront: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    backgroundColor: `${colors.terracotta}12`,
    borderRadius: '10px',
    color: colors.terracotta,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  flashcardLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: colors.terracotta,
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  flashcardDivider: {
    display: 'flex',
    alignItems: 'center',
    color: colors.inkLight,
    fontSize: '18px',
  },
  flashcardBack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    backgroundColor: `${colors.sage}12`,
    borderRadius: '10px',
    color: colors.sageDark,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  flashcardLabelBack: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: colors.sage,
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  moreText: {
    color: colors.chalk,
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
    marginBottom: 0,
    cursor: 'pointer',
    padding: '12px',
    backgroundColor: `${colors.chalk}10`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  sourceText: {
    backgroundColor: colors.paper,
    padding: '18px',
    borderRadius: '12px',
    fontSize: '14px',
    color: colors.ink,
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
  // Action card styles
  actionCard: {
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: `1px solid ${colors.ink}10`,
    boxShadow: `0 2px 8px ${colors.ink}06`,
  },
  actionCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
  },
  actionCardIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  actionCardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.ink,
    margin: 0,
    fontFamily: 'Fraunces, serif',
  },
  actionCardDescription: {
    color: colors.inkLight,
    fontSize: '13px',
    margin: '4px 0 0 0',
  },
  generateButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  generateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: 'white',
    color: colors.ink,
    border: `2px solid ${colors.ink}15`,
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  generateIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  generateText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  generateLabel: {
    fontWeight: '600',
    color: colors.ink,
  },
  generateHint: {
    fontSize: '12px',
    color: colors.inkLight,
  },
  // Info card styles
  infoCard: {
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: `1px solid ${colors.ink}10`,
    boxShadow: `0 2px 8px ${colors.ink}06`,
  },
  infoCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '700',
    color: colors.ink,
    margin: '0 0 18px 0',
    fontFamily: 'Fraunces, serif',
  },
  infoIcon: {
    fontSize: '16px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${colors.ink}08`,
  },
  infoRowHighlight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    margin: '8px -14px',
    backgroundColor: `${colors.gold}12`,
    borderRadius: '10px',
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.inkLight,
    fontSize: '14px',
  },
  infoValue: {
    color: colors.ink,
    fontSize: '14px',
    fontWeight: '600',
  },
  infoValueBold: {
    color: colors.gold,
    fontSize: '15px',
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 42, 58, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '28px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  modalIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: colors.ink,
    margin: 0,
    fontFamily: 'Fraunces, serif',
  },
  modalDescription: {
    color: colors.inkLight,
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalSecondaryButton: {
    padding: '12px 20px',
    backgroundColor: 'white',
    color: colors.ink,
    border: `2px solid ${colors.ink}20`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modalPrimaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${colors.chalk}, ${colors.chalkLight})`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: `0 4px 0 ${colors.chalkDark}`,
    transition: 'all 0.15s ease',
  },
  modalDangerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${colors.coral}, #F87171)`,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #DC2626',
    transition: 'all 0.15s ease',
  },
  infographicContainer: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  infographicImage: {
    maxWidth: '100%',
    maxHeight: '500px',
    borderRadius: '14px',
    border: `2px solid ${colors.ink}10`,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  },
  infographicHint: {
    fontSize: '13px',
    color: colors.inkLight,
    margin: 0,
  },
};

// Add responsive styles via media query
if (typeof window !== 'undefined' && window.innerWidth < 1024) {
  styles.contentGrid.gridTemplateColumns = '1fr';
  styles.actionsColumn.order = -1;
}
