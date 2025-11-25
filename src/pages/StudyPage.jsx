import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
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

const StudyPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [studyStartTime, setStudyStartTime] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const { currentLesson, markLessonComplete, updateLessonProgress } = useLessonContext();
    const { formatTimeSpent } = useLessonActions();
    const { recordLessonComplete, recordStudyTime, recordChatInteraction } = useGameProgress();
    const { createDeck, addCards } = useFlashcardContext();
    const studyStartTimeRef = useRef(null);

    // Check if lesson is a PDF
    const isPdfLesson = currentLesson?.sourceType === 'pdf' || currentLesson?.fileUrl?.endsWith('.pdf');

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
        <MainLayout>
            {/* Progress Widget - Top bar */}
            <div className="absolute top-0 left-0 right-0 bg-white border-b-4 border-black p-3 z-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <ProgressWidget layout="compact" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/flashcards"
                            className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-full border-2 border-black font-bold text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <Layers className="w-4 h-4 text-purple-600" />
                            <span className="hidden sm:inline">Flashcards</span>
                        </Link>
                        <Link
                            to="/achievements"
                            className="flex items-center gap-2 px-3 py-2 bg-nanobanana-yellow rounded-full border-2 border-black font-bold text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        >
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">Achievements</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content with padding for top bar */}
            <div className="pt-16 flex-1 flex">
                {currentLesson ? (
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
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="w-32 h-32 mx-auto mb-6 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                <span className="text-5xl">📚</span>
                            </div>
                            <h2 className="text-3xl font-black font-comic mb-4">
                                Ready to Learn?
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-md">
                                Upload a lesson to get started! Jeffrey is excited to help you learn.
                            </p>
                            <UploadButton
                                onClick={() => setIsUploadModalOpen(true)}
                                size="large"
                            />
                        </motion.div>
                    </div>
                )}
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
