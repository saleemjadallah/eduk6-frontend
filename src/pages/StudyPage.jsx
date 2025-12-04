import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';
import UploadButton from '../components/Upload/UploadButton';
import UploadModal from '../components/Upload/UploadModal';
import { ProgressWidget } from '../components/Gamification';
import { PDFViewer, SelectedTextPreview } from '../components/PDF';
import { HighlightProvider } from '../context/HighlightContext';
import { useLessonContext } from '../context/LessonContext';
import { useLessonActions } from '../hooks/useLessonActions';
import { useGameProgress } from '../hooks/useGameProgress';
import { useFlashcardContext } from '../context/FlashcardContext';
import { makeAuthenticatedRequest } from '../services/api/apiUtils';

const StudyPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [studyStartTime, setStudyStartTime] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
    const { currentLesson, lessons, markLessonComplete, setCurrentLesson, addLesson } = useLessonContext();

    // Track which lesson IDs we've already attempted to fetch to prevent infinite loops
    const fetchedLessonIds = useRef(new Set());

    // Set current lesson from URL param when page loads
    // If not in localStorage, try to fetch from database
    useEffect(() => {
        async function loadLesson() {
            if (!lessonId) return;

            // Prevent re-fetching the same lesson
            if (fetchedLessonIds.current.has(lessonId)) {
                // Already fetched, just set current if needed
                const localLesson = lessons.find(l => l.id === lessonId);
                if (localLesson && (!currentLesson || currentLesson.id !== lessonId)) {
                    setCurrentLesson(lessonId);
                }
                return;
            }

            // Check if lesson exists in local context
            const localLesson = lessons.find(l => l.id === lessonId);
            if (localLesson) {
                if (!currentLesson || currentLesson.id !== lessonId) {
                    setCurrentLesson(lessonId);
                }
                return;
            }

            // Mark as fetched to prevent re-fetching
            fetchedLessonIds.current.add(lessonId);

            // Lesson not in localStorage - try fetching from database
            setIsLoadingFromDb(true);
            try {
                const response = await makeAuthenticatedRequest(`/lessons/${lessonId}`);
                if (response.success && response.data?.lesson) {
                    const dbLesson = response.data.lesson;
                    // Add to local context with database data
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
            } catch (error) {
                console.error('Failed to load lesson from database:', error);
                // Navigate back to dashboard if lesson can't be found
                navigate('/learn');
            } finally {
                setIsLoadingFromDb(false);
            }
        }

        loadLesson();
    }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Track if we've already attempted to set currentLesson for this lessonId
    const setCurrentLessonAttempted = useRef(new Set());

    // Ensure currentLesson is set when the lesson appears in lessons array
    useEffect(() => {
        // Skip if no lessonId or already set correctly
        if (!lessonId || currentLesson?.id === lessonId) return;

        // Skip if we've already tried setting this lesson (prevents loop)
        if (setCurrentLessonAttempted.current.has(lessonId)) return;

        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
            setCurrentLessonAttempted.current.add(lessonId);
            setCurrentLesson(lessonId);
        }
    }, [lessonId, lessons, currentLesson?.id, setCurrentLesson]);

    // Redirect to dashboard if no lesson and not loading
    useEffect(() => {
        if (!lessonId && !currentLesson && !isLoadingFromDb) {
            navigate('/learn');
        }
    }, [lessonId, currentLesson, isLoadingFromDb, navigate]);
    const { formatTimeSpent } = useLessonActions();
    const { recordLessonComplete, recordStudyTime, recordChatInteraction } = useGameProgress();
    const { createDeck, addCards } = useFlashcardContext();
    const studyStartTimeRef = useRef(null);

    // Only render PDF viewer when we actually have a file URL; otherwise fall back to lesson view
    const isPdfLesson = !!currentLesson?.fileUrl && (
        currentLesson?.sourceType === 'pdf' ||
        currentLesson?.fileUrl?.toLowerCase().endsWith('.pdf')
    );

    // Handle sending selected text to chat
    const handleSendToChat = useCallback((text) => {
        setChatInput(`Can you explain this? "${text}"`);
    }, []);

    // Handle creating flashcards from selected text
    const handleCreateFlashcards = useCallback(async (text) => {
        if (!text || text.length < 20) return;

        // Create a new deck from the selection
        const newDeck = createDeck({
            name: `From PDF - ${new Date().toLocaleDateString()}`,
            description: `Flashcards created from PDF selection`,
            category: 'lesson',
            color: 'yellow',
        });

        // Add a simple card from the text
        addCards([{
            front: 'What does this text explain?',
            back: text.length > 500 ? text.substring(0, 500) + '...' : text,
            type: 'concept',
        }], newDeck.id);
    }, [createDeck, addCards]);

    // Track study time when page loads
    useEffect(() => {
        studyStartTimeRef.current = Date.now();
        setStudyStartTime(Date.now());

        // Record study time when leaving page
        return () => {
            if (studyStartTimeRef.current) {
                const studyDuration = Math.floor((Date.now() - studyStartTimeRef.current) / 60000); // Minutes
                if (studyDuration > 0) {
                    recordStudyTime(studyDuration);
                }
            }
        };
    }, []);

    // Reset study timer when lesson changes
    useEffect(() => {
        if (currentLesson) {
            studyStartTimeRef.current = Date.now();
            setStudyStartTime(Date.now());
        }
    }, [currentLesson?.id]);

    // Award XP when lesson is completed
    const handleLessonComplete = () => {
        if (currentLesson) {
            const duration = studyStartTime
                ? Math.floor((Date.now() - studyStartTime) / 60000)
                : 0;

            // Mark lesson as complete in LessonContext (persists to localStorage)
            markLessonComplete(currentLesson.id);

            // Record for gamification
            recordLessonComplete(currentLesson.subject || 'general', duration);
        }
    };

    // Record chat interaction for streak
    const handleChatInteraction = () => {
        recordChatInteraction();
    };

    return (
        <MainLayout
            className={!currentLesson ? "bg-[#F0F8FF]" : undefined}
            showClouds={!currentLesson}
        >
            {/* Progress Widget - Top bar - iPad optimized */}
            <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b-2 md:border-b-4 border-black p-2 md:p-3 z-20">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                        <ProgressWidget layout="compact" />
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        <Link
                            to="/learn"
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-nanobanana-blue rounded-full border-2 border-black font-bold text-xs md:text-sm text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <Link
                            to="/learn/achievements"
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-nanobanana-yellow rounded-full border-2 border-black font-bold text-xs md:text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Progress</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content with padding for top bar */}
            {/* iPad Split-View Layout: Side-by-side on tablet+, stacked on mobile */}
            <div className="pt-14 md:pt-16 flex-1 flex flex-col md:flex-row overflow-hidden">
                {isLoadingFromDb ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-nanobanana-blue border-t-transparent mx-auto mb-4"></div>
                            <p className="text-lg font-medium text-gray-600">Loading lesson...</p>
                        </div>
                    </div>
                ) : currentLesson ? (
                    <HighlightProvider lessonId={currentLesson.id}>
                        {isPdfLesson && currentLesson.fileUrl ? (
                            <>
                                {/* PDF Viewer - Left Pane */}
                                <div className="w-full md:w-3/5 p-4 h-1/2 md:h-full overflow-hidden">
                                    <PDFViewer
                                        pdfUrl={currentLesson.fileUrl}
                                        lessonId={currentLesson.id}
                                        onTextSelected={(selection) => {
                                            console.log('Text selected:', selection);
                                        }}
                                        onSendToChat={handleSendToChat}
                                        onCreateFlashcards={handleCreateFlashcards}
                                    />
                                </div>
                                {/* Chat Interface - Right Pane */}
                                <div className="w-full md:w-2/5 md:border-l-4 border-t-4 md:border-t-0 border-black flex flex-col h-1/2 md:h-full">
                                    <SelectedTextPreview onSendToChat={handleSendToChat} />
                                    <ChatInterface
                                        lesson={currentLesson}
                                        onInteraction={handleChatInteraction}
                                        initialInput={chatInput}
                                        onInputChange={setChatInput}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* iPad Split View: Lesson Content (left) | Chat (right) */}
                                {/* Mobile: Stacked with lesson on top, chat below */}
                                <div className="w-full md:w-[55%] lg:w-[60%] h-[45%] md:h-full overflow-hidden flex flex-col p-2 md:p-4">
                                    <LessonView
                                        lesson={currentLesson}
                                        onComplete={handleLessonComplete}
                                    />
                                </div>
                                <div className="w-full md:w-[45%] lg:w-[40%] h-[55%] md:h-full overflow-hidden flex flex-col p-2 md:p-4 md:pl-0">
                                    <ChatInterface
                                        lesson={currentLesson}
                                        onInteraction={handleChatInteraction}
                                    />
                                </div>
                            </>
                        )}
                    </HighlightProvider>
                ) : null}
            </div>

            {/* Floating upload button when lesson is active */}
            {currentLesson && (
                <UploadButton
                    variant="floating"
                    onClick={() => setIsUploadModalOpen(true)}
                />
            )}

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </MainLayout>
    );
};

export default StudyPage;
