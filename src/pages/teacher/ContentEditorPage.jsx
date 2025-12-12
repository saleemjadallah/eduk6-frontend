import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherAPI } from '../../services/api/teacherAPI';
import ExportMenu from '../../components/teacher/ExportMenu';

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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

const contentTypeConfig = {
  LESSON: { icon: LessonIcon, label: 'Lesson', color: '#8B5CF6' },
  QUIZ: { icon: QuizIcon, label: 'Quiz', color: '#F59E0B' },
  FLASHCARD_DECK: { icon: FlashcardIcon, label: 'Flashcards', color: '#10B981' },
  STUDY_GUIDE: { icon: StudyGuideIcon, label: 'Study Guide', color: '#3B82F6' },
};

const statusConfig = {
  DRAFT: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
  REVIEW: { label: 'In Review', color: '#F59E0B', bg: '#FEF3C7' },
  PUBLISHED: { label: 'Published', color: '#10B981', bg: '#D1FAE5' },
  ARCHIVED: { label: 'Archived', color: '#9CA3AF', bg: '#F9FAFB' },
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
      const sourceContent = content.extractedText || content.lessonContent?.content || '';

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
        <div style={styles.loadingContainer}>
          <SpinnerIcon />
          <span style={{ marginLeft: '12px', color: '#6B7280' }}>Loading content...</span>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={{ color: '#DC2626', marginBottom: '8px' }}>Error</h2>
          <p style={{ color: '#6B7280' }}>{error}</p>
          <Link to="/teacher/content" style={styles.backLink}>
            <BackIcon /> Back to Content
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = contentTypeConfig[content?.contentType]?.icon || LessonIcon;
  const typeColor = contentTypeConfig[content?.contentType]?.color || '#8B5CF6';
  const typeLabel = contentTypeConfig[content?.contentType]?.label || 'Content';
  const statusInfo = statusConfig[content?.status] || statusConfig.DRAFT;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/teacher/content" style={styles.backLink}>
          <BackIcon /> Back to Content
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
              >
                <EditIcon /> Edit
              </button>
              <button
                onClick={handleDuplicate}
                style={styles.secondaryButton}
                disabled={saving}
              >
                <DuplicateIcon /> Duplicate
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{ ...styles.secondaryButton, color: '#DC2626' }}
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
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.successBanner}
          >
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.errorBanner}
          >
            {error}
            <button onClick={() => setError(null)} style={styles.dismissButton}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Header Card */}
      <div style={styles.contentHeader}>
        <div style={styles.typeIconWrapper}>
          <div style={{ ...styles.typeIcon, backgroundColor: `${typeColor}20`, color: typeColor }}>
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
            <span style={{ ...styles.badge, backgroundColor: `${typeColor}20`, color: typeColor }}>
              {typeLabel}
            </span>
            <span style={{ ...styles.badge, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            {content.subject && (
              <span style={styles.metaText}>{content.subject}</span>
            )}
            {content.gradeLevel && (
              <span style={styles.metaText}>Grade {content.gradeLevel}</span>
            )}
          </div>
        </div>

        {/* Status Actions */}
        <div style={styles.statusActions}>
          {content.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusChange('PUBLISHED')}
              style={{ ...styles.statusButton, backgroundColor: '#10B981', color: 'white' }}
              disabled={saving}
            >
              Publish
            </button>
          )}
          {content.status === 'PUBLISHED' && (
            <button
              onClick={() => handleStatusChange('ARCHIVED')}
              style={{ ...styles.statusButton, backgroundColor: '#6B7280', color: 'white' }}
              disabled={saving}
            >
              Archive
            </button>
          )}
          {content.status === 'ARCHIVED' && (
            <button
              onClick={() => handleStatusChange('DRAFT')}
              style={{ ...styles.statusButton, backgroundColor: '#3B82F6', color: 'white' }}
              disabled={saving}
            >
              Restore to Draft
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column - Details */}
        <div style={styles.detailsColumn}>
          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
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
              <h3 style={styles.sectionTitle}>Details</h3>
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
              <h3 style={styles.sectionTitle}>Lesson Content</h3>
              <div style={styles.contentPreview}>
                {content.lessonContent.title && (
                  <h4 style={styles.previewTitle}>{content.lessonContent.title}</h4>
                )}
                {content.lessonContent.objectives && (
                  <div style={styles.previewSection}>
                    <strong>Objectives:</strong>
                    <ul style={styles.previewList}>
                      {content.lessonContent.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.lessonContent.sections && (
                  <div style={styles.previewSection}>
                    <strong>Sections:</strong>
                    {content.lessonContent.sections.map((section, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.sectionPreview,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: expandedSections[`section-${i}`] ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                        }}
                        onClick={() => setExpandedSections(prev => ({
                          ...prev,
                          [`section-${i}`]: !prev[`section-${i}`]
                        }))}
                      >
                        <div style={styles.sectionHeader}>
                          <h5 style={styles.sectionPreviewTitle}>{section.title}</h5>
                          <span style={{
                            ...styles.expandIcon,
                            transform: expandedSections[`section-${i}`] ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}>
                            ▼
                          </span>
                        </div>
                        {section.duration && (
                          <span style={styles.sectionDuration}>{section.duration} min</span>
                        )}
                        {expandedSections[`section-${i}`] ? (
                          <div style={styles.sectionFullContent}>
                            <p style={styles.sectionContentText}>{section.content}</p>
                            {section.activities && section.activities.length > 0 && (
                              <div style={styles.activitiesSection}>
                                <strong style={styles.subHeading}>Activities:</strong>
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
                                <strong style={styles.subHeading}>Teaching Tips:</strong>
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
                      style={{
                        ...styles.vocabularyHeader,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        vocabulary: !prev.vocabulary
                      }))}
                    >
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
                      style={{
                        ...styles.vocabularyHeader,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        assessment: !prev.assessment
                      }))}
                    >
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
                                        backgroundColor: opt === q.correctAnswer || j === q.correctIndex ? '#D1FAE5' : '#F9FAFB',
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
                style={{
                  ...styles.sectionTitle,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  quiz: !prev.quiz
                }))}
              >
                <span>Quiz ({content.quizContent.questions.length} questions)</span>
                <span style={{
                  ...styles.expandIcon,
                  transform: expandedSections.quiz ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <div style={styles.contentPreview}>
                {/* Render quiz questions with answers */}
                {(expandedSections.quiz ? content.quizContent.questions : content.quizContent.questions.slice(0, 3)).map((q, i) => (
                  <div key={i} style={styles.quizQuestionCard}>
                    <div style={styles.quizQuestionHeader}>
                      <span style={styles.questionNumber}>Q{i + 1}</span>
                      {q.type && (
                        <span style={styles.questionType}>
                          {q.type === 'multiple_choice' ? 'Multiple Choice' :
                           q.type === 'true_false' ? 'True/False' :
                           q.type === 'fill_blank' ? 'Fill in Blank' :
                           q.type === 'short_answer' ? 'Short Answer' : q.type}
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
                                backgroundColor: isCorrect ? '#D1FAE5' : '#F9FAFB',
                                borderColor: isCorrect ? '#10B981' : '#E5E7EB',
                              }}
                            >
                              <span style={{
                                ...styles.quizOptionLetter,
                                backgroundColor: isCorrect ? '#10B981' : '#E5E7EB',
                                color: isCorrect ? 'white' : '#6B7280',
                              }}>
                                {String.fromCharCode(65 + j)}
                              </span>
                              <span style={{ color: isCorrect ? '#065F46' : '#374151' }}>{option}</span>
                              {isCorrect && (
                                <span style={styles.correctBadge}>✓ Correct</span>
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
                          {String(q.correctAnswer).toLowerCase() === 'true' ? 'True' : 'False'}
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
                  </div>
                ))}

                {/* Show expand prompt when collapsed and more questions exist */}
                {!expandedSections.quiz && content.quizContent.questions.length > 3 && (
                  <p style={{...styles.moreText, cursor: 'pointer'}} onClick={() => setExpandedSections(prev => ({...prev, quiz: true}))}>
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
                style={{
                  ...styles.sectionTitle,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  flashcards: !prev.flashcards
                }))}
              >
                <span>Flashcards ({content.flashcardContent.cards.length} cards)</span>
                <span style={{
                  ...styles.expandIcon,
                  transform: expandedSections.flashcards ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <div style={styles.contentPreview}>
                {/* Always show first 3 cards */}
                {content.flashcardContent.cards.slice(0, 3).map((card, i) => (
                  <div key={i} style={styles.flashcardPreview}>
                    <div style={styles.flashcardFront}>{card.front || card.term}</div>
                    <div style={styles.flashcardBack}>{card.back || card.definition}</div>
                  </div>
                ))}
                {/* Show remaining cards when expanded */}
                {expandedSections.flashcards && content.flashcardContent.cards.length > 3 && (
                  content.flashcardContent.cards.slice(3).map((card, i) => (
                    <div key={i + 3} style={styles.flashcardPreview}>
                      <div style={styles.flashcardFront}>{card.front || card.term}</div>
                      <div style={styles.flashcardBack}>{card.back || card.definition}</div>
                    </div>
                  ))
                )}
                {/* Show expand prompt when collapsed and more cards exist */}
                {!expandedSections.flashcards && content.flashcardContent.cards.length > 3 && (
                  <p style={{...styles.moreText, cursor: 'pointer'}} onClick={() => setExpandedSections(prev => ({...prev, flashcards: true}))}>
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
                style={{...styles.sectionHeader, cursor: 'pointer'}}
                onClick={() => setExpandedSections(prev => ({...prev, infographic: !prev.infographic}))}
              >
                <span style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #EC4899, #F472B6)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </span>
                <span>Infographic</span>
                <span style={styles.expandIcon}>{expandedSections.infographic ? '−' : '+'}</span>
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
              <h3 style={styles.sectionTitle}>Source Text</h3>
              <div style={styles.sourceText}>
                {content.extractedText.substring(0, 500)}
                {content.extractedText.length > 500 && '...'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div style={styles.actionsColumn}>
          {/* Generate Actions */}
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>
              <GenerateIcon /> Generate Content
            </h3>
            <p style={styles.actionCardDescription}>
              Use AI to generate additional materials from this content.
            </p>
            <div style={styles.generateButtons}>
              <button
                onClick={() => { setGenerateType('quiz'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
              >
                <QuizIcon /> Generate Quiz
              </button>
              <button
                onClick={() => { setGenerateType('flashcards'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
              >
                <FlashcardIcon /> Generate Flashcards
              </button>
              <button
                onClick={() => { setGenerateType('study-guide'); setShowGenerateModal(true); }}
                style={styles.generateButton}
                disabled={generating}
              >
                <StudyGuideIcon /> Generate Study Guide
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.infoCardTitle}>Information</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Created</span>
              <span style={styles.infoValue}>
                {new Date(content.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Last Updated</span>
              <span style={styles.infoValue}>
                {new Date(content.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {content.publishedAt && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Published</span>
                <span style={styles.infoValue}>
                  {new Date(content.publishedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {content.tokensUsed > 0 && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Tokens Used</span>
                <span style={styles.infoValue}>
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={styles.modalTitle}>
                Generate {generateType === 'study-guide' ? 'Study Guide' : generateType?.charAt(0).toUpperCase() + generateType?.slice(1)}
              </h2>
              <p style={styles.modalDescription}>
                AI will analyze your content and generate {generateType === 'quiz' ? 'quiz questions' : generateType === 'flashcards' ? 'flashcards' : 'a study guide'}.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => { setShowGenerateModal(false); setGenerateType(null); }}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerate(generateType)}
                  style={styles.primaryButton}
                  disabled={generating}
                >
                  {generating ? <><SpinnerIcon /> Generating...</> : 'Generate'}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ ...styles.modalTitle, color: '#DC2626' }}>Delete Content</h2>
              <p style={styles.modalDescription}>
                Are you sure you want to delete "{content.title}"? This action cannot be undone.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{ ...styles.primaryButton, backgroundColor: '#DC2626' }}
                  disabled={deleting}
                >
                  {deleting ? <><SpinnerIcon /> Deleting...</> : 'Delete'}
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6B7280',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#8B5CF6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  successBanner: {
    padding: '12px 20px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#991B1B',
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  typeIconWrapper: {
    flexShrink: 0,
  },
  typeIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentMeta: {
    flex: 1,
  },
  contentTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  titleInput: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #8B5CF6',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  metaText: {
    color: '#6B7280',
    fontSize: '14px',
  },
  statusActions: {
    flexShrink: 0,
  },
  statusButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
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
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  description: {
    color: '#6B7280',
    lineHeight: '1.6',
    margin: 0,
  },
  descriptionInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'vertical',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  contentPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '16px',
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  previewSection: {
    marginBottom: '16px',
  },
  previewList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
    color: '#4B5563',
  },
  sectionPreview: {
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginTop: '12px',
    border: '1px solid #E5E7EB',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionPreviewTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    margin: 0,
  },
  expandIcon: {
    fontSize: '10px',
    color: '#9CA3AF',
    transition: 'transform 0.2s ease',
  },
  sectionDuration: {
    display: 'inline-block',
    fontSize: '12px',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '8px',
  },
  sectionPreviewContent: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '12px 0 0 0',
    lineHeight: '1.5',
  },
  clickToExpand: {
    color: '#8B5CF6',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  sectionFullContent: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  sectionContentText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.7',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  activitiesSection: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#F0FDF4',
    borderRadius: '6px',
  },
  subHeading: {
    fontSize: '13px',
    color: '#166534',
    display: 'block',
    marginBottom: '8px',
  },
  activityList: {
    margin: 0,
    paddingLeft: '20px',
  },
  activityItem: {
    fontSize: '13px',
    color: '#166534',
    marginBottom: '4px',
    lineHeight: '1.5',
  },
  tipsSection: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#FEF3C7',
    borderRadius: '6px',
  },
  tipText: {
    fontSize: '13px',
    color: '#92400E',
    margin: 0,
    lineHeight: '1.5',
  },
  vocabularyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    marginTop: '8px',
  },
  vocabularyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  vocabularyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#EEF2FF',
    borderRadius: '6px',
  },
  vocabularyTerm: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4338CA',
  },
  vocabularyDefinition: {
    fontSize: '13px',
    color: '#6366F1',
    lineHeight: '1.4',
  },
  assessmentList: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  assessmentQuestion: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 12px 0',
    fontWeight: '500',
  },
  optionsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  optionItem: {
    fontSize: '13px',
    color: '#4B5563',
    padding: '8px 12px',
    borderRadius: '4px',
  },
  questionPreview: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginBottom: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '14px',
    color: '#374151',
  },
  questionNumber: {
    backgroundColor: '#8B5CF6',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  flashcardPreview: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginBottom: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '14px',
  },
  flashcardFront: {
    padding: '8px',
    backgroundColor: '#EEF2FF',
    borderRadius: '4px',
    color: '#4338CA',
    fontWeight: '500',
  },
  flashcardBack: {
    padding: '8px',
    backgroundColor: '#F0FDF4',
    borderRadius: '4px',
    color: '#166534',
  },
  moreText: {
    color: '#6B7280',
    fontSize: '13px',
    fontStyle: 'italic',
    marginTop: '8px',
    marginBottom: 0,
  },
  sourceText: {
    backgroundColor: '#F9FAFB',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  actionCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  actionCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  actionCardDescription: {
    color: '#6B7280',
    fontSize: '14px',
    marginBottom: '16px',
  },
  generateButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  generateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
  },
  infoCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  infoCardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: '14px',
  },
  infoValue: {
    color: '#111827',
    fontSize: '14px',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  modalDescription: {
    color: '#6B7280',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  infographicContainer: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  infographicImage: {
    maxWidth: '100%',
    maxHeight: '500px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  infographicHint: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: 0,
  },
  // Quiz question styles with answers
  quizQuestionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '16px',
    marginBottom: '12px',
  },
  quizQuestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  questionType: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  questionPoints: {
    fontSize: '12px',
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  quizQuestionText: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  quizOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quizOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
  },
  quizOptionLetter: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  correctBadge: {
    marginLeft: 'auto',
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  quizAnswerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#D1FAE5',
    borderRadius: '8px',
    border: '1px solid #10B981',
  },
  answerLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#065F46',
  },
  correctAnswerText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#047857',
  },
  quizExplanation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#FEF3C7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400E',
    lineHeight: '1.5',
  },
  explanationLabel: {
    fontWeight: '600',
    color: '#B45309',
  },
};
