import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, BookOpen, Trophy, Sparkles, X } from 'lucide-react';
import { useLessonContext } from '../context/LessonContext';
import { useAuth } from '../context/AuthContext';
import { useGamificationContext } from '../context/GamificationContext';
import { useChildStats } from '../hooks/useChildStats';
import { api } from '../services/api/apiClient';
import UploadModal from '../components/Upload/UploadModal';

const ChildDashboard = () => {
    // Debug: Log when component mounts/unmounts
    useEffect(() => {
        console.log('[ChildDashboard] MOUNTED');
        return () => console.log('[ChildDashboard] UNMOUNTED');
    }, []);
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deletingLessonId, setDeletingLessonId] = useState(null);
    const [isLoadingDbLessons, setIsLoadingDbLessons] = useState(false);
    const { clearCurrentLesson, recentLessons, lessons, deleteLesson, addLesson } = useLessonContext();
    const { stats, loading: statsLoading, refetch: refreshStats } = useChildStats();

    // Get gamification context as additional source for local stats
    let gamificationStats = null;
    try {
        gamificationStats = useGamificationContext();
    } catch (e) {
        // GamificationContext not available
    }

    // Get current child profile
    let currentProfile = null;
    try {
        const authContext = useAuth();
        currentProfile = authContext?.currentProfile;
    } catch (e) {
        // AuthProvider not available
    }

    // Helper to get/set deleted lesson IDs from localStorage
    const getDeletedLessonIds = useCallback(() => {
        try {
            const deleted = localStorage.getItem(`deleted_lessons_${currentProfile?.id}`);
            return deleted ? JSON.parse(deleted) : [];
        } catch {
            return [];
        }
    }, [currentProfile?.id]);

    const addDeletedLessonId = useCallback((lessonId) => {
        try {
            const deleted = getDeletedLessonIds();
            if (!deleted.includes(lessonId)) {
                deleted.push(lessonId);
                localStorage.setItem(`deleted_lessons_${currentProfile?.id}`, JSON.stringify(deleted));
            }
        } catch (e) {
            console.error('Failed to track deleted lesson:', e);
        }
    }, [currentProfile?.id, getDeletedLessonIds]);

    // Fetch lessons from database and merge with local lessons
    useEffect(() => {
        async function syncLessonsFromDb() {
            if (!currentProfile?.id) return;

            setIsLoadingDbLessons(true);
            try {
                const response = await api.get(`/lessons/child/${currentProfile.id}?limit=20`);
                if (response.success && response.data?.lessons) {
                    const dbLessons = response.data.lessons;
                    // Get IDs of lessons already in local storage and deleted lessons
                    const localIds = new Set(lessons.map(l => l.id));
                    const deletedIds = new Set(getDeletedLessonIds());

                    for (const dbLesson of dbLessons) {
                        // Skip if already in local storage OR was previously deleted
                        if (localIds.has(dbLesson.id) || deletedIds.has(dbLesson.id)) {
                            continue;
                        }
                        addLesson({
                            id: dbLesson.id,
                            title: dbLesson.title,
                            subject: dbLesson.subject,
                            gradeLevel: dbLesson.gradeLevel,
                            sourceType: dbLesson.sourceType?.toLowerCase() || 'text',
                            rawText: dbLesson.extractedText,
                            formattedContent: dbLesson.formattedContent,
                            summary: dbLesson.summary,
                            chapters: dbLesson.chapters || [],
                            keyConceptsForChat: dbLesson.keyConcepts || [],
                            vocabulary: dbLesson.vocabulary || [],
                            suggestedQuestions: dbLesson.suggestedQuestions || [],
                            fileUrl: dbLesson.originalFileUrl,
                            createdAt: dbLesson.createdAt,
                            updatedAt: dbLesson.updatedAt,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to sync lessons from database:', error);
            } finally {
                setIsLoadingDbLessons(false);
            }
        }

        syncLessonsFromDb();
    }, [currentProfile?.id, getDeletedLessonIds]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStartNewLesson = () => {
        clearCurrentLesson();
        setIsUploadModalOpen(true);
    };

    const handleUploadSuccess = (lessonId) => {
        // Navigate directly to the lesson
        navigate(`/learn/study/${lessonId}`);
    };

    const handleDeleteLesson = async (e, lessonId) => {
        e.stopPropagation(); // Prevent navigating to the lesson

        if (deletingLessonId) return; // Already deleting

        setDeletingLessonId(lessonId);

        try {
            // Track as deleted locally first (so it won't come back on refresh)
            addDeletedLessonId(lessonId);

            // Delete from backend using unified API client (handles auth automatically)
            await api.delete(`/lessons/${lessonId}`);

            // Delete from local context
            deleteLesson(lessonId);

            // Refresh stats since lesson count changed
            if (refreshStats) {
                refreshStats();
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            // Even if backend delete fails, keep it tracked as deleted locally
            // so user doesn't see it again until they explicitly want to
        } finally {
            setDeletingLessonId(null);
        }
    };

    const childName = currentProfile?.name || 'Learner';

    return (
        <div className="min-h-full p-6 relative">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-black font-comic mb-2">
                    Hi, {childName}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                    Ready to learn something amazing today?
                </p>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartNewLesson}
                    className="bg-nanobanana-green text-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <Upload className="w-10 h-10" />
                    <span className="font-bold text-lg">Upload Lesson</span>
                </motion.button>

                <Link to="/learn/flashcards" className="block">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-nanobanana-yellow p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full"
                    >
                        <BookOpen className="w-10 h-10" />
                        <span className="font-bold text-lg">Flashcards</span>
                    </motion.div>
                </Link>

                <Link to="/learn/achievements" className="block">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-nanobanana-blue text-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full"
                    >
                        <Trophy className="w-10 h-10" />
                        <span className="font-bold text-lg">Achievements</span>
                    </motion.div>
                </Link>

                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-pink-400 text-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <Sparkles className="w-10 h-10" />
                    <span className="font-bold text-lg">Practice</span>
                </motion.button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-nanobanana-blue">
                        {gamificationStats?.statistics?.lessonsCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Lessons Done</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-nanobanana-green">
                        {statsLoading ? '-' : (stats.streak?.current || gamificationStats?.streak?.current || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Day Streak 🔥</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-nanobanana-yellow">
                        {statsLoading ? '-' : (stats.badgesEarned || gamificationStats?.badges?.length || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Badges Earned</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-pink-500">
                        {statsLoading ? '-' : (stats.xp || gamificationStats?.totalXP || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">XP Points</div>
                </div>
            </div>

            {/* Recent Lessons */}
            {isLoadingDbLessons && (!recentLessons || recentLessons.length === 0) ? (
                <div className="mb-8 flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-nanobanana-blue border-t-transparent"></div>
                    <span className="ml-3 text-gray-600">Loading your lessons...</span>
                </div>
            ) : null}
            {recentLessons && recentLessons.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {recentLessons.slice(0, 3).map((lesson) => (
                                <motion.div
                                    key={lesson.id}
                                    layout
                                    initial={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    className="relative group"
                                >
                                    <Link to={`/learn/study/${lesson.id}`} className="block">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-white p-4 rounded-xl border-2 border-gray-200 text-left hover:border-nanobanana-blue transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                                    📚
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h3 className="font-bold text-sm truncate">{lesson.title}</h3>
                                                    <p className="text-xs text-gray-500">{lesson.subject || 'General'}</p>
                                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-nanobanana-green rounded-full"
                                                            style={{ width: `${lesson.progress?.percentComplete || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDeleteLesson(e, lesson.id)}
                                        disabled={deletingLessonId === lesson.id}
                                        className="absolute top-2 right-2 w-7 h-7 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-500 border border-gray-200 hover:border-red-300 z-10"
                                        title="Delete lesson"
                                    >
                                        {deletingLessonId === lesson.id ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
                                            />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoadingDbLessons && (!recentLessons || recentLessons.length === 0) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-nanobanana-yellow/20 to-nanobanana-green/20 rounded-3xl border-4 border-dashed border-gray-300 p-12 text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-6 bg-nanobanana-yellow rounded-full border-4 border-black flex items-center justify-center">
                        <span className="text-5xl">📚</span>
                    </div>
                    <h2 className="text-2xl font-bold font-comic mb-2">No lessons yet!</h2>
                    <p className="text-gray-600 mb-6">Upload your first lesson to start learning with Jeffrey</p>
                    <button
                        onClick={handleStartNewLesson}
                        className="inline-flex items-center gap-2 bg-nanobanana-green text-white font-bold px-6 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Your First Lesson
                    </button>
                </motion.div>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default ChildDashboard;
