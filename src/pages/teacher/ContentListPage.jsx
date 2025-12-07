import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  BookOpen,
  ClipboardCheck,
  Layers,
  FileText,
  PieChart,
  Image,
  Search,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

// Content type configurations with teacher design system colors
const CONTENT_TYPES = {
  LESSON: {
    label: 'Lesson',
    icon: BookOpen,
    color: 'teacher-chalk',
    bgClass: 'bg-teacher-chalk/10',
    textClass: 'text-teacher-chalk',
  },
  QUIZ: {
    label: 'Quiz',
    icon: ClipboardCheck,
    color: 'teacher-sage',
    bgClass: 'bg-teacher-sage/10',
    textClass: 'text-teacher-sage',
  },
  FLASHCARD_DECK: {
    label: 'Flashcards',
    icon: Layers,
    color: 'teacher-gold',
    bgClass: 'bg-teacher-gold/10',
    textClass: 'text-teacher-gold',
  },
  STUDY_GUIDE: {
    label: 'Study Guide',
    icon: FileText,
    color: 'teacher-plum',
    bgClass: 'bg-teacher-plum/10',
    textClass: 'text-teacher-plum',
  },
  WORKSHEET: {
    label: 'Worksheet',
    icon: PieChart,
    color: 'teacher-terracotta',
    bgClass: 'bg-teacher-terracotta/10',
    textClass: 'text-teacher-terracotta',
  },
  INFOGRAPHIC: {
    label: 'Infographic',
    icon: Image,
    color: 'teacher-coral',
    bgClass: 'bg-teacher-coral/10',
    textClass: 'text-teacher-coral',
  },
};

const STATUS_BADGES = {
  DRAFT: { label: 'Draft', className: 'bg-teacher-inkLight/10 text-teacher-inkLight' },
  REVIEW: { label: 'Review', className: 'bg-teacher-gold/10 text-teacher-gold' },
  PUBLISHED: { label: 'Published', className: 'bg-teacher-sage/10 text-teacher-sage' },
  ARCHIVED: { label: 'Archived', className: 'bg-teacher-coral/10 text-teacher-coral' },
};

const SUBJECTS = [
  { value: '', label: 'All Subjects' },
  { value: 'MATH', label: 'Math' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'SOCIAL_STUDIES', label: 'Social Studies' },
  { value: 'ART', label: 'Art' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'OTHER', label: 'Other' },
];

const ContentListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    contentType: searchParams.get('type') || '',
    subject: searchParams.get('subject') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, content: null });
  const [deleting, setDeleting] = useState(false);

  // Load content
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.contentType && { contentType: filters.contentType }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await teacherAPI.listContent(params);

      if (response.success) {
        setContent(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await teacherAPI.getContentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.contentType) params.set('type', filters.contentType);
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteModal.content) return;

    setDeleting(true);
    try {
      await teacherAPI.deleteContent(deleteModal.content.id);
      setDeleteModal({ open: false, content: null });
      loadContent();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (contentId) => {
    try {
      await teacherAPI.duplicateContent(contentId);
      loadContent();
    } catch (err) {
      setError(err.message || 'Failed to duplicate content');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate total content from stats
  const totalContent = stats
    ? Object.values(stats.byType || {}).reduce((sum, count) => sum + count, 0)
    : 0;

  // Header action button
  const headerActions = (
    <Link
      to="/teacher/content/create"
      className="teacher-btn-primary flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create Content</span>
      <span className="sm:hidden">Create</span>
    </Link>
  );

  return (
    <TeacherLayout
      title="My Content"
      subtitle="Create and manage your lessons, quizzes, and study materials"
      headerActions={headerActions}
    >
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <div className="teacher-stat-card">
          <div className="flex items-center justify-between mb-2">
            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teacher-ink" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-teacher-ink">{totalContent}</p>
          <p className="text-xs sm:text-sm text-teacher-inkLight">Total Content</p>
        </div>

        <div className="teacher-stat-card">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teacher-chalk" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-teacher-chalk">{stats?.byType?.LESSON || 0}</p>
          <p className="text-xs sm:text-sm text-teacher-inkLight">Lessons</p>
        </div>

        <div className="teacher-stat-card">
          <div className="flex items-center justify-between mb-2">
            <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teacher-sage" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-teacher-sage">{stats?.byType?.QUIZ || 0}</p>
          <p className="text-xs sm:text-sm text-teacher-inkLight">Quizzes</p>
        </div>

        <div className="teacher-stat-card">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-teacher-gold" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-teacher-gold">{stats?.byType?.FLASHCARD_DECK || 0}</p>
          <p className="text-xs sm:text-sm text-teacher-inkLight">Flashcards</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="teacher-card p-3 sm:p-4 mb-4 sm:mb-6"
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search - full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-teacher-inkLight" />
            <input
              type="text"
              placeholder="Search content..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-teacher-ink/10 rounded-xl bg-white text-sm placeholder:text-teacher-inkLight/60 focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
            />
          </div>

          {/* Filter dropdowns - scrollable on mobile */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible">
            {/* Content Type Filter */}
            <select
              value={filters.contentType}
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
              className="flex-shrink-0 px-3 sm:px-4 py-2 border border-teacher-ink/10 rounded-xl bg-white text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
            >
              <option value="">All Types</option>
              {Object.entries(CONTENT_TYPES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="flex-shrink-0 px-3 sm:px-4 py-2 border border-teacher-ink/10 rounded-xl bg-white text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
            >
              {SUBJECTS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="flex-shrink-0 px-3 sm:px-4 py-2 border border-teacher-ink/10 rounded-xl bg-white text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_BADGES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teacher-coral/10 border border-teacher-coral/20 text-teacher-coral px-4 py-3 rounded-xl mb-4 sm:mb-6 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="teacher-card p-4 sm:p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teacher-ink/5 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-teacher-ink/5 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-teacher-ink/5 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-teacher-ink/5 rounded w-full mb-2" />
              <div className="h-3 bg-teacher-ink/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="teacher-card p-6 sm:p-10 text-center"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 relative">
            <img
              src="/assets/images/landing/hero-jeffrey-teaching.png"
              alt="Jeffrey - Your AI Teaching Assistant"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-teacher-ink mb-2">
            No content yet
          </h3>
          <p className="text-sm sm:text-base text-teacher-inkLight mb-6 max-w-md mx-auto">
            Create your first piece of content to get started. I can help you build lessons, quizzes, flashcards, and more!
          </p>
          <Link
            to="/teacher/content/create"
            className="teacher-btn-primary inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create Your First Content
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {content.map((item, index) => {
            const typeConfig = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.LESSON;
            const statusConfig = STATUS_BADGES[item.status] || STATUS_BADGES.DRAFT;
            const Icon = typeConfig.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="teacher-card group hover:shadow-teacher-lg hover:border-teacher-chalk/20 transition-all"
              >
                <Link to={`/teacher/content/${item.id}`} className="block p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${typeConfig.bgClass}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${typeConfig.textClass}`} />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-teacher-ink mb-2 group-hover:text-teacher-chalk transition-colors line-clamp-2 text-sm sm:text-base">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-teacher-inkLight mb-3 sm:mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-teacher-inkLight/70">
                    <span className={`font-medium ${typeConfig.textClass}`}>{typeConfig.label}</span>
                    <span>Updated {formatDate(item.updatedAt)}</span>
                  </div>
                </Link>

                {/* Actions */}
                <div className="border-t border-teacher-ink/5 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-end gap-1 sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDuplicate(item.id);
                    }}
                    className="p-2 text-teacher-inkLight hover:text-teacher-chalk hover:bg-teacher-chalk/10 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteModal({ open: true, content: item });
                    }}
                    className="p-2 text-teacher-inkLight hover:text-teacher-coral hover:bg-teacher-coral/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8"
        >
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-2 sm:px-4 sm:py-2 border border-teacher-ink/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-teacher-chalk/20 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-teacher-inkLight">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 sm:px-4 sm:py-2 border border-teacher-ink/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-teacher-chalk/20 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ open: false, content: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-teacher-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-teacher-coral/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-teacher-coral" />
              </div>
              <h3 className="font-display text-lg font-semibold text-teacher-ink mb-2 text-center">
                Delete Content
              </h3>
              <p className="text-teacher-inkLight text-center mb-6">
                Are you sure you want to delete "<span className="font-medium text-teacher-ink">{deleteModal.content?.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, content: null })}
                  className="px-5 py-2.5 text-teacher-inkLight hover:text-teacher-ink font-medium rounded-xl hover:bg-teacher-paper transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-teacher-coral text-white font-medium rounded-xl hover:bg-teacher-coral/90 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TeacherLayout>
  );
};

export default ContentListPage;
