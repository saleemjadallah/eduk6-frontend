import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { useLessonContext } from '../context/LessonContext';
import { useAuth } from '../context/AuthContext';
import { useChildStats } from '../hooks/useChildStats';
import UploadModal from '../components/Upload/UploadModal';

// Cloud background using AI-generated images from Gemini
const CloudBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient sky background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 via-blue-50/30 to-transparent" />

            {/* Top cloud backdrop - fades down */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 left-0 right-0"
            >
                <img
                    src="/assets/images/clouds/cloud_backdrop_top.png"
                    alt=""
                    className="w-full object-cover opacity-50"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                    }}
                />
            </motion.div>

            {/* Bottom cloud backdrop - fades up */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0"
            >
                <img
                    src="/assets/images/clouds/cloud_backdrop_bottom.png"
                    alt=""
                    className="w-full object-cover opacity-40"
                    style={{
                        maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
                    }}
                />
            </motion.div>

            {/* Floating individual clouds with gentle animation */}
            <motion.img
                src="/assets/images/clouds/cloud_single_1.png"
                alt=""
                className="absolute top-16 -left-8 w-48 opacity-30"
                animate={{ x: [0, 15, 0], y: [0, 5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.img
                src="/assets/images/clouds/cloud_single_2.png"
                alt=""
                className="absolute top-24 -right-12 w-56 opacity-25"
                animate={{ x: [0, -20, 0], y: [0, 8, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.img
                src="/assets/images/clouds/cloud_single_1.png"
                alt=""
                className="absolute bottom-1/3 right-8 w-32 opacity-20"
                animate={{ x: [0, -10, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
};

const ChildDashboard = () => {
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { clearCurrentLesson, recentLessons, completedLessonsCount } = useLessonContext();
    const { stats, loading: statsLoading } = useChildStats();

    // Get current child profile
    let currentProfile = null;
    try {
        const authContext = useAuth();
        currentProfile = authContext?.currentProfile;
    } catch (e) {
        // AuthProvider not available
    }

    const handleStartNewLesson = () => {
        clearCurrentLesson();
        setIsUploadModalOpen(true);
    };

    const handleContinueLesson = (lessonId) => {
        navigate(`/learn/study/${lessonId}`);
    };

    const childName = currentProfile?.name || 'Learner';

    return (
        <div className="min-h-full p-6 relative">
            {/* Cloud Background */}
            <CloudBackground />

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

                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/learn/flashcards')}
                    className="bg-nanobanana-yellow p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <BookOpen className="w-10 h-10" />
                    <span className="font-bold text-lg">Flashcards</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/learn/achievements')}
                    className="bg-nanobanana-blue text-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <Trophy className="w-10 h-10" />
                    <span className="font-bold text-lg">Achievements</span>
                </motion.button>

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
                        {statsLoading ? '-' : (stats.lessonsCompleted || completedLessonsCount)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Lessons Done</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-nanobanana-green">
                        {statsLoading ? '-' : (stats.streak?.current || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Day Streak 🔥</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-nanobanana-yellow">
                        {statsLoading ? '-' : (stats.badgesEarned || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Badges Earned</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-3xl font-black text-pink-500">
                        {statsLoading ? '-' : (stats.xp || 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">XP Points</div>
                </div>
            </div>

            {/* Recent Lessons */}
            {recentLessons && recentLessons.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentLessons.slice(0, 3).map((lesson) => (
                            <motion.button
                                key={lesson.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleContinueLesson(lesson.id)}
                                className="bg-white p-4 rounded-xl border-2 border-gray-200 text-left hover:border-nanobanana-blue transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                        📚
                                    </div>
                                    <div className="flex-1 min-w-0">
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
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!recentLessons || recentLessons.length === 0) && (
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
            />
        </div>
    );
};

export default ChildDashboard;
