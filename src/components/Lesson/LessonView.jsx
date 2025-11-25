import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, Star, Clock, FileText, Layers, Sparkles, CheckCircle } from 'lucide-react';
import { FlashcardCreator } from '../Flashcards';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonActions } from '../../hooks/useLessonActions';
import ProcessingAnimation from '../Upload/ProcessingAnimation';

const LessonView = ({ lesson, onComplete }) => {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const { canCreateDeckFromLesson, getDeckForLesson, createDeckFromLesson } = useFlashcards();

    // Use context for enhanced features
    const {
        isProcessing,
        processingStage,
        processingProgress,
        currentStageInfo,
        hasLessons
    } = useLessonContext();

    const { formatTimeSpent } = useLessonActions();

    const existingDeck = lesson ? getDeckForLesson(lesson.id) : null;
    const canCreateDeck = lesson ? canCreateDeckFromLesson(lesson) : false;

    const handleCreateFlashcards = () => {
        if (canCreateDeck) {
            createDeckFromLesson(lesson);
        } else {
            setIsCreatorOpen(true);
        }
    };

    // Show processing animation if currently processing
    if (isProcessing) {
        return (
            <div className="flex-[1.5] bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
                <div className="bg-nanobanana-green border-b-4 border-black p-6">
                    <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {currentStageInfo.childLabel || 'Processing...'}
                    </h1>
                </div>
                <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                    <ProcessingAnimation
                        stage={processingStage}
                        progress={processingProgress}
                        useChildLabels={true}
                    />
                </div>
            </div>
        );
    }

    // Show empty state if no lesson
    if (!lesson) {
        return (
            <div className="flex-[1.5] bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
                <div className="bg-nanobanana-green border-b-4 border-black p-6">
                    <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        Hi there!
                    </h1>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="w-24 h-24 bg-nanobanana-yellow rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6"
                    >
                        <BookOpen className="w-12 h-12" />
                    </motion.div>
                    <h2 className="text-2xl font-bold font-comic mb-4">
                        Ready to Learn?
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        Upload a lesson to start learning with Jeffrey!
                        He's excited to help you understand new things.
                    </p>
                </div>
            </div>
        );
    }

    // Use display lesson data
    const displayLesson = lesson;

    const subjectEmoji = {
        math: '🔢',
        mathematics: '🔢',
        science: '🔬',
        english: '📚',
        reading: '📖',
        arabic: '🌙',
        islamic: '☪️',
        social: '🌍',
        'social studies': '🌍',
        history: '📜',
        geography: '🗺️',
        art: '🎨',
        music: '🎵',
        health: '❤️',
        other: '📝',
    };

    // Get time spent on this lesson
    const timeSpent = displayLesson.progress?.timeSpent
        ? formatTimeSpent(displayLesson.progress.timeSpent)
        : null;

    // Get progress percentage
    const progressPercent = displayLesson.progress?.percentComplete || 0;

    return (
        <div className="flex-[1.5] bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
            {/* Lesson Header */}
            <div className="bg-nanobanana-green border-b-4 border-black p-6">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {subjectEmoji[displayLesson.subject?.toLowerCase()] || '📝'} {displayLesson.subject || 'Lesson'}
                    </span>
                    {displayLesson.gradeLevel && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {displayLesson.gradeLevel}
                        </span>
                    )}
                    {(displayLesson.content?.estimatedReadTime || timeSpent) && (
                        <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            {timeSpent || `${displayLesson.content.estimatedReadTime} min read`}
                        </span>
                    )}
                    {progressPercent === 100 && (
                        <span className="flex items-center gap-1 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {displayLesson.title}
                </h1>

                {/* Progress bar */}
                {progressPercent > 0 && progressPercent < 100 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/80 font-bold mb-1">
                            <span>Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="space-y-6">
                    {/* Video if YouTube source */}
                    {displayLesson.sourceType === 'youtube' && displayLesson.sourceVideo && (
                        <div className="aspect-video bg-black rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group cursor-pointer overflow-hidden">
                            <img
                                src={displayLesson.sourceVideo.thumbnail}
                                alt={displayLesson.sourceVideo.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-8 h-8 ml-1" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {(displayLesson.content?.summary || displayLesson.summary) && (
                        <div className="prose prose-lg max-w-none">
                            <h3 className="font-comic font-bold text-2xl mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                Summary
                            </h3>
                            <p className="font-medium text-gray-700 leading-relaxed">
                                {displayLesson.content?.summary || displayLesson.summary}
                            </p>
                        </div>
                    )}

                    {/* Key Points */}
                    {(displayLesson.content?.keyPoints?.length > 0 || displayLesson.keyConceptsForChat?.length > 0) && (
                        <div className="my-6 p-4 bg-yellow-50 border-l-8 border-nanobanana-yellow rounded-r-xl">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-black" />
                                Key Points
                            </h4>
                            <ul className="space-y-2">
                                {(displayLesson.content?.keyPoints || displayLesson.keyConceptsForChat || []).map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-nanobanana-yellow rounded-full border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Chapters */}
                    {(displayLesson.content?.chapters?.length > 0 || displayLesson.chapters?.length > 0) && (
                        <div className="mt-6">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Layers className="w-5 h-5" />
                                Chapters
                            </h4>
                            <div className="space-y-4">
                                {(displayLesson.content?.chapters || displayLesson.chapters || []).map((chapter, index) => (
                                    <div
                                        key={chapter.id || index}
                                        className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-nanobanana-blue transition-colors"
                                    >
                                        <h5 className="font-bold text-lg mb-2">
                                            {index + 1}. {chapter.title}
                                        </h5>
                                        <p className="text-gray-700">{chapter.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vocabulary */}
                    {(displayLesson.content?.vocabulary?.length > 0 || displayLesson.vocabulary?.length > 0) && (
                        <div className="mt-6">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Key Words
                            </h4>
                            <div className="grid gap-3">
                                {(displayLesson.content?.vocabulary || displayLesson.vocabulary || []).map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200"
                                    >
                                        <span className="font-bold text-blue-800">{item.term}:</span>{' '}
                                        <span className="text-blue-600">{item.definition}</span>
                                        {item.example && (
                                            <p className="text-sm text-blue-500 mt-1 italic">
                                                Example: {item.example}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Questions */}
                    {displayLesson.suggestedQuestions?.length > 0 && (
                        <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-purple-800">
                                <Sparkles className="w-5 h-5" />
                                Questions to Think About
                            </h4>
                            <ul className="space-y-2">
                                {displayLesson.suggestedQuestions.map((question, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">?</span>
                                        <span className="text-purple-700">{question}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Flashcard Actions */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-800">Study with Flashcards</h4>
                                    <p className="text-sm text-purple-600">
                                        {existingDeck
                                            ? `${existingDeck.cardCount || 0} cards ready to review`
                                            : 'Turn this lesson into flashcards!'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {existingDeck ? (
                                    <Link
                                        to="/flashcards"
                                        className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                                    >
                                        <Layers className="w-4 h-4" />
                                        Study
                                    </Link>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCreateFlashcards}
                                        className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Create Cards
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Complete Lesson Button */}
                    {onComplete && progressPercent < 100 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onComplete}
                            className="mt-6 w-full py-3 bg-nanobanana-green text-white font-bold font-comic rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                        >
                            <Star className="w-5 h-5" />
                            I've Finished This Lesson!
                        </motion.button>
                    )}

                    {/* Already completed message */}
                    {progressPercent === 100 && (
                        <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-700">Great job! You've completed this lesson!</p>
                            <p className="text-sm text-green-600 mt-1">
                                Keep chatting with Jeffrey to learn more.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Flashcard Creator Modal */}
            <FlashcardCreator
                isOpen={isCreatorOpen}
                onClose={() => setIsCreatorOpen(false)}
                lessonContent={displayLesson.content}
            />
        </div>
    );
};

export default LessonView;
