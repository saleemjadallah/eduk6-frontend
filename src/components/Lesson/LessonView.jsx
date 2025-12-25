import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PlayCircle, Star, Clock, FileText, Layers, Sparkles, CheckCircle, Image as ImageIcon, FileType, HelpCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { FlashcardCreator } from '../Flashcards';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useLessonContext } from '../../context/LessonContext';
import { useLessonActions } from '../../hooks/useLessonActions';
import ProcessingAnimation from '../Upload/ProcessingAnimation';
import { HighlightableContent, SelectionToolbar } from '../Selection';
import { detectContentType, getContentTypeDisplayInfo } from '../../utils/contentDetection';
import ContentRenderer from '../LessonView/ContentRenderer';
import { VocabularyPanel } from '../LessonView/Metadata';
import { ExerciseModal, ExerciseList } from '../Exercise';
import { exerciseAPI } from '../../services/api/exerciseAPI';
import LessonContentRenderer from './LessonContentRenderer';

/**
 * Format a single line with inline styling (bold, italic, highlights)
 */
const formatInline = (text) => {
    let result = text;

    // Escape HTML first
    result = result
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Bold: **text** or words in ALL CAPS (3+ letters)
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\b([A-Z]{3,})\b/g, '<strong class="text-indigo-700">$1</strong>');

    // Italic: *text* (single asterisks)
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Highlight key terms followed by definitions
    result = result.replace(
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(means?|is defined as|refers to|are called)\b/g,
        '<strong class="text-purple-700">$1</strong> <em>$2</em>'
    );

    return result;
};

/**
 * Detect line type and return appropriate HTML
 */
const formatLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Section markers: [Section 1], [Section 2], etc.
    if (/^\[Section\s*\d+\]$/i.test(trimmed)) {
        const num = trimmed.match(/\d+/)[0];
        return `<div class="my-6 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-center shadow-md">📚 Section ${num}</div>`;
    }

    // Major headers: Learning Objectives, Materials Needed, Review Questions, etc.
    const majorHeaders = /^(Learning Objectives?|Materials? Needed|Review Questions?|Vocabulary|Summary|Introduction|Conclusion|Activities?|Hands-On Activities|Art Vocabulary|Famous Artists)/i;
    if (majorHeaders.test(trimmed)) {
        return `<h2 class="text-xl font-bold text-indigo-800 mt-6 mb-3 pb-2 border-b-2 border-indigo-200">✨ ${formatInline(trimmed)}</h2>`;
    }

    // Sub-headers: Activity 1:, Step 1:, Example 1:, Creating ORANGE, etc.
    const subHeaders = /^(Activity\s*\d+|Step\s*\d+|Example\s*\d+|Part\s*\d+|Creating\s+[A-Z]+|The\s+(?:Primary|Secondary|Color|Warm|Cool)\s+\w+|Fun Fact|Mixing Tips|Artist's Secret)/i;
    if (subHeaders.test(trimmed)) {
        return `<h3 class="text-lg font-semibold text-purple-700 mt-5 mb-2">🎯 ${formatInline(trimmed)}</h3>`;
    }

    // Numbered headers with colon: "1. Creating ORANGE" or "2. Creating GREEN"
    if (/^\d+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 50) {
        return `<h3 class="text-lg font-semibold text-teal-700 mt-4 mb-2">📌 ${formatInline(trimmed)}</h3>`;
    }

    // Bullet points
    if (/^[•·∙‣⁃○●◦▪▸]\s*/.test(trimmed)) {
        const content = trimmed.replace(/^[•·∙‣⁃○●◦▪▸]\s*/, '');
        return `<li class="ml-6 mb-1 text-gray-700">${formatInline(content)}</li>`;
    }

    // Numbered list items (1., 2., etc. that aren't headers)
    if (/^\d+[.)]\s+/.test(trimmed) && trimmed.length > 50) {
        const content = trimmed.replace(/^\d+[.)]\s+/, '');
        return `<li class="ml-6 mb-2 text-gray-700 list-decimal">${formatInline(content)}</li>`;
    }

    // Metadata lines: Grade Level:, Subject:, Duration:, Topic:
    if (/^(Grade Level|Subject|Topic|Duration|Materials Needed):/i.test(trimmed)) {
        return `<p class="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg inline-block mb-1">${formatInline(trimmed)}</p>`;
    }

    // Color formulas: RED + YELLOW = ORANGE
    if (/[A-Z]+\s*\+\s*[A-Z]+\s*=\s*[A-Z]+/.test(trimmed)) {
        return `<p class="text-center font-bold text-lg my-3 py-2 px-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200">${formatInline(trimmed)}</p>`;
    }

    // Table-like rows with | separators
    if (trimmed.includes('|') && trimmed.split('|').length >= 2) {
        const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
        const cellsHtml = cells.map(c => `<td class="px-3 py-2 border border-gray-200">${formatInline(c)}</td>`).join('');
        return `<tr class="even:bg-gray-50">${cellsHtml}</tr>`;
    }

    // Questions (lines ending with ?)
    if (/\?$/.test(trimmed)) {
        return `<p class="text-gray-800 bg-blue-50 px-4 py-2 rounded-lg border-l-4 border-blue-400 my-2"><strong>❓</strong> ${formatInline(trimmed)}</p>`;
    }

    // Answers section items
    if (/^Answers?:/i.test(trimmed)) {
        return `<h3 class="text-lg font-semibold text-green-700 mt-5 mb-2">✅ ${formatInline(trimmed)}</h3>`;
    }

    // Regular paragraph
    return `<p class="text-gray-700 mb-2 leading-relaxed">${formatInline(trimmed)}</p>`;
};

/**
 * Smart text to HTML formatter with styling
 * Preserves Gemini's formatting and adds visual enhancements
 */
const formatContent = (text) => {
    if (!text) return '';

    // DEBUG: Check for images in incoming content
    const imgTagsInRaw = (text.match(/<img[^>]*>/gi) || []);
    console.log('[formatContent] Debug:', {
      textLength: text.length,
      hasImgTags: imgTagsInRaw.length > 0,
      imgTagCount: imgTagsInRaw.length,
      firstImgTag: imgTagsInRaw[0] || 'none',
    });

    // If content already has substantial HTML tags, just sanitize and return
    const htmlTagCount = (text.match(/<[a-z][^>]*>/gi) || []).length;
    if (htmlTagCount > 5) {
        const sanitized = DOMPurify.sanitize(text, {
            ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span', 'div', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'mark', 'img'],
            ALLOWED_ATTR: ['class', 'style', 'data-page', 'data-exercise-id', 'data-type', 'data-definition', 'data-section', 'data-numerator', 'data-denominator', 'title', 'src', 'alt', 'loading', 'width', 'height'],
        });

        // DEBUG: Check if images survived
        const imgTagsAfter = (sanitized.match(/<img[^>]*>/gi) || []);
        console.log('[formatContent] After sanitize:', {
          imgTagCount: imgTagsAfter.length,
          preserved: imgTagsInRaw.length === imgTagsAfter.length,
        });

        return sanitized;
    }

    // Clean up formatting artifacts from Gemini
    let cleanedText = text
        // Remove literal \n that got partially escaped (showing as "n" or "nn")
        .replace(/(\d+\.)\s*n+\s+/g, '$1 ')  // "2. nn Something" -> "2. Something"
        .replace(/^n+\s+/gm, '')              // Lines starting with n/nn
        .replace(/\s+n+\s+(?=[A-Z])/g, ' ')   // Stray n/nn before capital letters
        .replace(/\\n/g, '\n');               // Literal \n -> actual newline

    // Process line by line for better control
    const lines = cleanedText.split('\n');
    const result = [];
    let inList = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Handle empty lines
        if (!trimmed) {
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            if (inTable) {
                result.push('</tbody></table>');
                inTable = false;
            }
            continue;
        }

        const formatted = formatLine(trimmed);
        if (!formatted) continue;

        // Handle list grouping
        if (formatted.startsWith('<li')) {
            if (!inList) {
                result.push('<ul class="my-3 space-y-1">');
                inList = true;
            }
            result.push(formatted);
        }
        // Handle table grouping
        else if (formatted.startsWith('<tr')) {
            if (!inTable) {
                result.push('<table class="w-full my-4 border-collapse border border-gray-200 rounded-lg overflow-hidden"><tbody>');
                inTable = true;
            }
            result.push(formatted);
        }
        else {
            // Close any open list/table
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            if (inTable) {
                result.push('</tbody></table>');
                inTable = false;
            }
            result.push(formatted);
        }
    }

    // Close any remaining open tags
    if (inList) result.push('</ul>');
    if (inTable) result.push('</tbody></table>');

    const finalHtml = result.join('\n');

    // DEBUG: Check for images before final sanitization
    const imgTagsBeforeFinal = (finalHtml.match(/<img[^>]*>/gi) || []);
    console.log('[formatContent] Before final sanitize:', {
        htmlLength: finalHtml.length,
        imgTagCount: imgTagsBeforeFinal.length,
        firstImgTag: imgTagsBeforeFinal[0] || 'none',
    });

    const sanitizedFinal = DOMPurify.sanitize(finalHtml, {
        ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span', 'div', 'blockquote', 'code', 'table', 'tbody', 'tr', 'td', 'th', 'mark', 'img'],
        ALLOWED_ATTR: ['class', 'style', 'data-page', 'data-exercise-id', 'data-type', 'data-definition', 'data-section', 'data-numerator', 'data-denominator', 'title', 'src', 'alt', 'loading', 'width', 'height'],
    });

    // DEBUG: Check for images after final sanitization
    const imgTagsAfterFinal = (sanitizedFinal.match(/<img[^>]*>/gi) || []);
    console.log('[formatContent] After final sanitize:', {
        sanitizedLength: sanitizedFinal.length,
        imgTagCount: imgTagsAfterFinal.length,
        imgTagsPreserved: imgTagsBeforeFinal.length === imgTagsAfterFinal.length,
    });

    return sanitizedFinal;
};

/**
 * Get the primary content to display
 * Priority: formattedContent (AI-formatted) > extractedText > rawText
 */
const getPrimaryContent = (lesson) => {
    // Prefer formattedContent (AI-formatted with proper line breaks)
    return lesson?.formattedContent ||
           lesson?.content?.formattedContent ||
           lesson?.extractedText ||
           lesson?.content?.extractedText ||
           lesson?.rawText ||
           lesson?.content?.rawText ||
           '';
};

const LessonView = ({ lesson, onComplete, showContentViewer = false }) => {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [showVocabulary, setShowVocabulary] = useState(false);
    const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'content'
    const [viewPreferences, setViewPreferences] = useState({ zoom: 1, currentPage: 1 });

    // Exercise state
    const [exercises, setExercises] = useState([]);
    const [activeExercise, setActiveExercise] = useState(null);
    const [exercisesLoading, setExercisesLoading] = useState(false);

    const { canCreateDeckFromLesson, getDeckForLesson, createDeckFromLesson } = useFlashcards();

    // Use context for enhanced features
    const {
        isProcessing,
        processingStage,
        processingProgress,
        currentStageInfo,
        hasLessons,
        updateLessonProgress,
    } = useLessonContext();

    const { formatTimeSpent } = useLessonActions();

    // Detect content type and check if we have actual file content
    const contentType = lesson ? detectContentType(lesson) : 'unknown';
    const hasFileContent = lesson?.contentUrl || lesson?.source?.url || lesson?.fileUrl;
    const contentTypeInfo = getContentTypeDisplayInfo(contentType);

    // Toggle vocabulary sidebar
    const toggleVocabulary = useCallback(() => {
        setShowVocabulary(prev => !prev);
    }, []);

    // Handle view mode toggle
    const toggleViewMode = useCallback(() => {
        setViewMode(prev => prev === 'structured' ? 'content' : 'structured');
    }, []);

    // Handle zoom/page changes
    const handleZoomChange = useCallback((zoom) => {
        setViewPreferences(prev => ({ ...prev, zoom }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setViewPreferences(prev => ({ ...prev, currentPage: page }));
    }, []);

    const existingDeck = lesson ? getDeckForLesson(lesson.id) : null;
    const canCreateDeck = lesson ? canCreateDeckFromLesson(lesson) : false;

    // Track which lesson IDs we've already fetched exercises for to prevent loops
    const fetchedExerciseLessonIds = useRef(new Set());

    // Fetch exercises when lesson loads (only once per lesson ID)
    useEffect(() => {
        const fetchExercises = async () => {
            if (!lesson?.id) {
                setExercises([]);
                return;
            }

            // Prevent re-fetching for the same lesson
            if (fetchedExerciseLessonIds.current.has(lesson.id)) {
                return;
            }
            fetchedExerciseLessonIds.current.add(lesson.id);

            setExercisesLoading(true);
            try {
                const response = await exerciseAPI.getExercisesForLesson(lesson.id);
                setExercises(response.data || []);
            } catch (error) {
                console.error('Failed to fetch exercises:', error);
                setExercises([]);
            } finally {
                setExercisesLoading(false);
            }
        };

        fetchExercises();
    }, [lesson?.id]);

    // Handle exercise click - open modal
    const handleExerciseClick = useCallback((exercise) => {
        setActiveExercise(exercise);
    }, []);

    // Handle exercise completion
    const handleExerciseComplete = useCallback((result) => {
        // Update the exercise in the list to mark as completed
        setExercises(prev => prev.map(ex =>
            ex.id === activeExercise?.id
                ? { ...ex, isCompleted: true, attemptCount: result.attemptNumber }
                : ex
        ));
    }, [activeExercise?.id]);

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
                        Upload a lesson to start learning with Ollie!
                        He's excited to help you understand new things.
                    </p>
                </div>
            </div>
        );
    }

    // Use display lesson data
    const displayLesson = lesson;

    // Subject emoji mapping (keys match backend Prisma Subject enum)
    const subjectEmoji = {
        MATH: '🔢',
        SCIENCE: '🔬',
        ENGLISH: '📚',
        ARABIC: '🌙',
        ISLAMIC_STUDIES: '☪️',
        SOCIAL_STUDIES: '🌍',
        ART: '🎨',
        MUSIC: '🎵',
        OTHER: '📝',
    };

    // Get time spent on this lesson
    const timeSpent = displayLesson.progress?.timeSpent
        ? formatTimeSpent(displayLesson.progress.timeSpent)
        : null;

    // Get progress percentage
    const progressPercent = displayLesson.progress?.percentComplete || 0;

    return (
        <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-3 md:border-4 border-black overflow-hidden flex flex-col">
            {/* Lesson Header */}
            <div className="bg-nanobanana-green border-b-4 border-black p-6">
                {/* Top row with view toggle and vocabulary */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {subjectEmoji[displayLesson.subject?.toUpperCase()] || '📝'} {displayLesson.subject || 'Lesson'}
                        </span>
                        {displayLesson.gradeLevel && (
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                                {displayLesson.gradeLevel}
                            </span>
                        )}
                        {/* Content type badge */}
                        {hasFileContent && (
                            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                {contentTypeInfo.emoji} {contentTypeInfo.label}
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

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        {/* View mode toggle (if file content exists) */}
                        {hasFileContent && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleViewMode}
                                className={`
                                    px-3 py-1 rounded-full text-xs font-bold border-2 border-white/30 transition-colors
                                    ${viewMode === 'content'
                                        ? 'bg-white text-green-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }
                                `}
                            >
                                {viewMode === 'content' ? '📖 Summary' : `${contentTypeInfo.emoji} View File`}
                            </motion.button>
                        )}

                        {/* Vocabulary toggle */}
                        {(displayLesson.vocabulary?.length > 0 || displayLesson.content?.vocabulary?.length > 0) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleVocabulary}
                                className={`
                                    px-3 py-1 rounded-full text-xs font-bold border-2 border-white/30 transition-colors
                                    ${showVocabulary
                                        ? 'bg-white text-green-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }
                                `}
                            >
                                📖 Words ({(displayLesson.vocabulary || displayLesson.content?.vocabulary || []).length})
                            </motion.button>
                        )}
                    </div>
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

            {/* Main content area with optional vocabulary sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto transition-all duration-300 ${showVocabulary ? 'lg:mr-0' : ''}`}>
                    {/* Show ContentRenderer for file view mode */}
                    {viewMode === 'content' && hasFileContent ? (
                        <ContentRenderer
                            lesson={displayLesson}
                            viewPreferences={viewPreferences}
                            onZoomChange={handleZoomChange}
                            onPageChange={handlePageChange}
                            onSelectionAction={(result) => {
                                console.log('Selection action result:', result);
                            }}
                        />
                    ) : (
                        /* Show structured content view */
                        <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                            <HighlightableContent
                    lessonId={displayLesson.id}
                    contentType="html"
                    onSelectionAction={(result) => {
                        console.log('Selection action result:', result);
                    }}
                >
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

                    {/* FULL LESSON CONTENT - Primary display */}
                    {/* We display the original extractedText to preserve full content */}
                    {getPrimaryContent(displayLesson) && (() => {
                        const rawContent = getPrimaryContent(displayLesson);
                        const imgTagsInRaw = (rawContent.match(/<img[^>]*>/gi) || []);
                        console.log('[LessonView] Render - Primary content:', {
                            contentLength: rawContent.length,
                            hasImgTags: imgTagsInRaw.length > 0,
                            imgTagCount: imgTagsInRaw.length,
                            firstImgTag: imgTagsInRaw[0] || 'none',
                            contentSource: displayLesson?.formattedContent ? 'formattedContent' : 'extractedText',
                        });
                        const formattedHtml = formatContent(rawContent);
                        const imgTagsFormatted = (formattedHtml.match(/<img[^>]*>/gi) || []);
                        console.log('[LessonView] Render - After formatContent:', {
                            formattedLength: formattedHtml.length,
                            imgTagCount: imgTagsFormatted.length,
                            imagesPreserved: imgTagsInRaw.length === imgTagsFormatted.length,
                        });
                        return (
                            <div className="prose prose-lg max-w-none">
                                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                                    <div
                                        className="text-gray-800 leading-relaxed lesson-content"
                                        dangerouslySetInnerHTML={{ __html: formattedHtml }}
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    {/* Divider before study aids */}
                    {getPrimaryContent(displayLesson) &&
                     ((displayLesson.content?.vocabulary?.length > 0 || displayLesson.vocabulary?.length > 0) ||
                      displayLesson.suggestedQuestions?.length > 0) && (
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                            <span className="text-sm font-bold text-gray-400 uppercase">Study Aids</span>
                            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
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

                    {/* Interactive Exercises */}
                    {exercises.length > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                            <ExerciseList
                                exercises={exercises}
                                onExerciseClick={handleExerciseClick}
                            />
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
                                Keep chatting with Ollie to learn more.
                            </p>
                        </div>
                    )}
                </div>

                    {/* Selection Toolbar */}
                    <SelectionToolbar />
                </HighlightableContent>
                        </div>
                    )}
                </div>

                {/* Vocabulary Sidebar */}
                <AnimatePresence>
                    {showVocabulary && (displayLesson.vocabulary?.length > 0 || displayLesson.content?.vocabulary?.length > 0) && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hidden lg:block border-l-4 border-black overflow-hidden"
                        >
                            <VocabularyPanel
                                vocabulary={displayLesson.vocabulary || displayLesson.content?.vocabulary || []}
                                lessonId={displayLesson.id}
                                onClose={() => setShowVocabulary(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Flashcard Creator Modal */}
            <FlashcardCreator
                isOpen={isCreatorOpen}
                onClose={() => setIsCreatorOpen(false)}
                lessonContent={displayLesson.content}
            />

            {/* Exercise Modal */}
            <ExerciseModal
                exercise={activeExercise}
                isOpen={!!activeExercise}
                onClose={() => setActiveExercise(null)}
                onComplete={handleExerciseComplete}
            />
        </div>
    );
};

export default LessonView;
