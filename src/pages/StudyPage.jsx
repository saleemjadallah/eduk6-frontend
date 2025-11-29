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

    // Set current lesson from URL param when page loads
    // If not in localStorage, try to fetch from database
    useEffect(() => {
        async function loadLesson() {
            if (!lessonId) return;

            // Check if lesson exists in local context
            const localLesson = lessons.find(l => l.id === lessonId);
            if (localLesson) {
                if (!currentLesson || currentLesson.id !== lessonId) {
                    setCurrentLesson(lessonId);
                }
                return;
            }

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
    }, [lessonId, lessons, currentLesson?.id, setCurrentLesson, addLesson, navigate]);

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
            {/* Progress Widget - Top bar */}
            <div className="absolute top-0 left-0 right-0 bg-white border-b-4 border-black p-3 z-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <ProgressWidget layout="compact" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/learn"
                            className="flex items-center gap-2 px-3 py-2 bg-nanobanana-blue rounded-full border-2 border-black font-bold text-sm text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <Link
                            to="/learn/achievements"
                            className="flex items-center gap-2 px-3 py-2 bg-nanobanana-yellow rounded-full border-2 border-black font-bold text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Progress</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content with padding for top bar */}
            <div className="pt-16 flex-1 flex">
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
                                <div className="w-3/5 p-4 h-full">
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
                                <div className="w-2/5 border-l-4 border-black flex flex-col">
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
                                <LessonView
                                    lesson={currentLesson}
                                    onComplete={handleLessonComplete}
                                />
                                <ChatInterface
                                    lesson={currentLesson}
                                    onInteraction={handleChatInteraction}
                                />
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
