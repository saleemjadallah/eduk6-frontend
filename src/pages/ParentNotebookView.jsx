import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookMarked,
  Calendar,
  MessageCircle,
  Send,
  Trash2,
  ChevronRight,
  Search,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { noteAPI } from '../services/api/noteAPI';
import { profileAPI } from '../services/api/profileAPI';
import { SUBJECT_CONFIG, COVER_COLORS } from '../constants/notebookConstants';

// Emoji reactions for comments
const EMOJI_REACTIONS = ['❤️', '⭐', '👏', '🎉', '💪', '🌟', '✨', '🤩'];

/**
 * ParentNotebookView - Parent view of child's notebook with comment functionality
 */
const ParentNotebookView = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  // State
  const [child, setChild] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesBySubject, setNotesBySubject] = useState({});
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Fetch child profile and notes
  const fetchData = useCallback(async () => {
    if (!childId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile and notes in parallel
      const [profileRes, notesRes, statsRes] = await Promise.all([
        profileAPI.getProfile(childId),
        noteAPI.getChildNotes(childId, { grouped: true }),
        noteAPI.getChildNoteStats(childId),
      ]);

      if (profileRes.success) {
        setChild(profileRes.data);
      }

      if (notesRes.success) {
        setNotes(notesRes.data.notes || []);
        setNotesBySubject(notesRes.data.bySubject || {});
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch notebook data:', err);
      setError(err.message || 'Failed to load notebook');
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter notes by subject and search
  const filteredNotes = notes.filter((note) => {
    const matchesSubject =
      selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Get unique subjects from notes
  const subjects = ['all', ...Object.keys(notesBySubject)];

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!selectedNote || (!newComment.trim() && !selectedEmoji)) return;

    setIsAddingComment(true);
    try {
      const response = await noteAPI.addComment(selectedNote.id, {
        content: newComment.trim(),
        emoji: selectedEmoji || null,
      });

      if (response.success) {
        // Update the selected note with the new comment
        setSelectedNote((prev) => ({
          ...prev,
          parentComments: [...(prev.parentComments || []), response.data],
        }));

        // Clear inputs
        setNewComment('');
        setSelectedEmoji('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsAddingComment(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!selectedNote) return;

    try {
      const response = await noteAPI.deleteComment(selectedNote.id, commentId);

      if (response.success) {
        setSelectedNote((prev) => ({
          ...prev,
          parentComments: prev.parentComments.filter((c) => c.id !== commentId),
        }));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Handle selecting a note (fetch full details with comments)
  const handleSelectNote = async (note) => {
    try {
      const response = await noteAPI.getNoteForParent(note.id);
      if (response.success) {
        setSelectedNote(response.data);
      } else {
        setSelectedNote(note);
      }
    } catch (err) {
      console.error('Failed to fetch note details:', err);
      setSelectedNote(note);
    }
  };

  // Get subject info
  const getSubjectInfo = (subject) => {
    return SUBJECT_CONFIG[subject] || { emoji: '📝', label: subject || 'General', color: 'bg-gray-100' };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading notebook...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/parent/children/${childId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-pink-500" />
            {child?.displayName}'s Notebook
          </h1>
          <p className="text-gray-600 text-sm">
            View and comment on your child's notes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.totalNotes}</div>
            <div className="text-sm text-gray-600">Total Notes</div>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-500">{Object.keys(stats.bySubject || {}).length}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.thisWeek || 0}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.totalComments || 0}</div>
            <div className="text-sm text-gray-600">Your Comments</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
              />
            </div>

            {/* Subject filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {subjects.map((subject) => {
                const info = subject === 'all'
                  ? { emoji: '📚', label: 'All' }
                  : getSubjectInfo(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${
                      selectedSubject === subject
                        ? 'bg-pink-100 border-pink-400 text-pink-700'
                        : 'bg-white border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <span>{info.emoji}</span>
                    <span className="text-sm font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredNotes.map((note) => {
                  const subjectInfo = getSubjectInfo(note.subject);
                  const isSelected = selectedNote?.id === note.id;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => handleSelectNote(note)}
                      className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-400 shadow-lg'
                          : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Note color indicator */}
                        <div
                          className="w-3 h-full min-h-[60px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: note.coverColor || COVER_COLORS[0].value }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-gray-900 truncate">
                              {note.title}
                            </h3>
                            <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                              <Calendar className="w-3 h-3" />
                              {formatDate(note.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${subjectInfo.color}`}>
                              {subjectInfo.emoji} {subjectInfo.label}
                            </span>
                            {note.lesson && (
                              <span className="text-xs text-gray-500">
                                from "{note.lesson.title}"
                              </span>
                            )}
                          </div>

                          {/* Preview of content */}
                          <p
                            className="text-sm text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: note.content.substring(0, 150) + (note.content.length > 150 ? '...' : ''),
                            }}
                          />

                          {/* Comment count */}
                          {note.parentComments && note.parentComments.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-pink-500">
                              <MessageCircle className="w-3 h-3" />
                              {note.parentComments.length} comment{note.parentComments.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-600 mb-1">No notes yet</h3>
              <p className="text-sm text-gray-500">
                {child?.displayName}'s notes will appear here
              </p>
            </div>
          )}
        </div>

        {/* Note Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedNote ? (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl border-2 border-gray-200 sticky top-6"
              >
                {/* Note Header */}
                <div
                  className="p-4 rounded-t-xl border-b-2 border-gray-200"
                  style={{ backgroundColor: selectedNote.coverColor || COVER_COLORS[0].value }}
                >
                  <h3 className="font-bold text-lg text-gray-900">{selectedNote.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatDate(selectedNote.createdAt)}
                  </p>
                </div>

                {/* Note Content (Read-only) */}
                <div className="p-4 max-h-[300px] overflow-y-auto border-b border-gray-100">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />

                  {selectedNote.originalText && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Original highlight:</p>
                      <p className="text-sm text-gray-600 italic">"{selectedNote.originalText}"</p>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-pink-500" />
                    Your Comments
                  </h4>

                  {/* Existing comments */}
                  {selectedNote.parentComments && selectedNote.parentComments.length > 0 ? (
                    <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                      {selectedNote.parentComments.map((comment) => (
                        <div key={comment.id} className="bg-pink-50 rounded-lg p-3 relative group">
                          {comment.emoji && (
                            <span className="text-xl mb-1 block">{comment.emoji}</span>
                          )}
                          <p className="text-sm text-gray-700">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(comment.createdAt)}
                          </p>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-pink-200 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-pink-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 mb-4">
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                      No comments yet. Leave some encouragement!
                    </div>
                  )}

                  {/* Add comment form */}
                  <div className="space-y-3">
                    {/* Emoji picker */}
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
                          className={`text-xl p-1 rounded transition-all ${
                            selectedEmoji === emoji
                              ? 'bg-pink-200 scale-110'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Comment input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={isAddingComment || (!newComment.trim() && !selectedEmoji)}
                        className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center"
              >
                <BookMarked className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-600 mb-1">Select a note</h3>
                <p className="text-sm text-gray-500">
                  Click on a note to view details and add comments
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ParentNotebookView;
