import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';
import { extractText, validateFile, getFileTypeCategory } from '../utils/fileProcessors';
import { getYouTubeTranscript, getVideoMetadata, getYouTubeThumbnail } from '../utils/youtubeUtils';
import { analyzeContent, processWithGemini } from '../services/geminiService';
import { api } from '../services/api';

/**
 * Hook for processing uploaded content (files and YouTube videos)
 * into structured lessons for the LessonContext
 */
export function useLessonProcessor() {
    const {
        startProcessing,
        updateProgress,
        setProcessingStage,
        addLesson,
        setError,
        resetProcessing,
    } = useLessonContext();

    /**
     * Process a file upload and create a lesson
     * @param {File} file - The uploaded file
     * @param {string} title - User-provided title
     * @param {string} subject - Subject category
     * @param {string} gradeLevel - Grade level
     * @returns {Promise<Object>} The created lesson
     */
    const processFile = useCallback(async (file, title, subject, gradeLevel) => {
        try {
            // Validate the file first
            validateFile(file);

            // Start processing
            startProcessing();

            // Stage 1: Upload (simulated - file is already in memory)
            setProcessingStage('uploading');
            updateProgress(10);
            await delay(300);

            // Stage 2: Extract text
            setProcessingStage('extracting');

            const extractResult = await extractText(file, (extractProgress) => {
                // Map extraction progress (0-100) to overall progress (15-40)
                const overallProgress = 15 + Math.round(extractProgress * 0.25);
                updateProgress(overallProgress);
            });

            let { text: extractedText, metadata: extractionMetadata } = extractResult;

            // Handle PPT files - they need server-side processing
            if (extractionMetadata.requiresServerProcessing && extractionMetadata.sourceType === 'ppt') {
                updateProgress(20);
                setProcessingStage('analyzing');

                // Convert file to base64 and send to backend
                const base64 = await fileToBase64(file);
                updateProgress(30);

                // Call the backend PPT analysis endpoint
                const pptResponse = await api.post('/lessons/analyze-ppt', {
                    pptBase64: base64,
                    filename: file.name,
                    mimeType: file.type,
                    subject,
                    gradeLevel,
                    title,
                });

                updateProgress(70);

                // api.post returns the JSON directly, not wrapped in .data
                if (!pptResponse.success) {
                    throw new Error(pptResponse.error || 'Failed to analyze PowerPoint file');
                }

                const pptAnalysis = pptResponse.data;
                extractedText = pptAnalysis.extractedText || '';

                // The backend already created the lesson, use the returned lesson data
                const backendLesson = pptAnalysis.lesson;

                setProcessingStage('generating');
                updateProgress(85);

                // Generate study guide from the extracted text
                const studyGuide = await processWithGemini(extractedText, 'study_guide');
                updateProgress(95);

                setProcessingStage('complete');
                updateProgress(100);

                // Add to local context using the backend-created lesson ID
                const lesson = addLesson({
                    id: pptAnalysis.lessonId, // Use the database ID from backend
                    title: backendLesson?.title || title || pptAnalysis.suggestedTitle || 'PowerPoint Lesson',
                    subject: backendLesson?.subject || subject || pptAnalysis.detectedSubject,
                    gradeLevel: backendLesson?.gradeLevel || gradeLevel || pptAnalysis.detectedGradeLevel,
                    sourceType: 'ppt',
                    source: {
                        type: 'ppt',
                        originalName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        slideCount: pptAnalysis.slideCount,
                    },
                    rawText: extractedText,
                    formattedContent: pptAnalysis.formattedContent || backendLesson?.formattedContent || null,
                    content: {
                        rawText: extractedText,
                        formattedContent: pptAnalysis.formattedContent || backendLesson?.formattedContent || null,
                        summary: pptAnalysis.summary || backendLesson?.summary,
                        keyPoints: pptAnalysis.keyTopics || backendLesson?.keyConcepts || [],
                        chapters: backendLesson?.chapters || [],
                        vocabulary: pptAnalysis.vocabulary || backendLesson?.vocabulary || [],
                        studyGuide: studyGuide,
                        estimatedReadTime: Math.ceil(extractedText.length / 1000) || 5,
                    },
                    summary: pptAnalysis.summary || backendLesson?.summary,
                    chapters: backendLesson?.chapters || [],
                    keyConceptsForChat: pptAnalysis.keyTopics || backendLesson?.keyConcepts || [],
                    vocabulary: pptAnalysis.vocabulary || backendLesson?.vocabulary || [],
                    suggestedQuestions: backendLesson?.suggestedQuestions || [],
                    relatedTopics: [],
                    extractionMetadata: {
                        sourceType: 'ppt',
                        slideCount: pptAnalysis.slideCount,
                        suggestedTitle: pptAnalysis.suggestedTitle,
                    },
                });

                await delay(500);
                return lesson;
            }

            // Check if we got any text (for non-PPT files)
            if (!extractedText || extractedText.trim().length < 10) {
                throw new Error('Could not extract enough text from this file. Try a different file.');
            }

            updateProgress(45);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');

            const analysis = await analyzeContent(extractedText, {
                subject,
                gradeLevel,
                onProgress: (analyzeProgress) => {
                    const overallProgress = 45 + Math.round(analyzeProgress * 0.25);
                    updateProgress(overallProgress);
                },
            });

            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');

            const studyGuide = await processWithGemini(extractedText, 'study_guide');
            updateProgress(90);

            // Stage 5: Complete - Create the lesson
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                // Use database lesson ID if available (for sync with backend)
                id: analysis.lessonId || undefined,

                // Use provided title or AI-generated title
                title: title || analysis.title,
                subject: subject || analysis.subject,
                gradeLevel: gradeLevel || analysis.gradeLevel,

                // Source info
                sourceType: getFileTypeCategory(file),
                source: {
                    type: getFileTypeCategory(file),
                    originalName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                },

                // Raw text (original) and formatted content (HTML)
                rawText: extractedText,
                formattedContent: analysis.formattedContent || null,

                // AI-analyzed content
                content: {
                    rawText: extractedText,
                    formattedContent: analysis.formattedContent || null,
                    summary: analysis.summary,
                    keyPoints: analysis.keyConceptsForChat || [],
                    chapters: analysis.chapters || [],
                    vocabulary: analysis.vocabulary || [],
                    studyGuide: studyGuide,
                    estimatedReadTime: analysis.estimatedReadTime || 5,
                },

                // Lesson-level data
                summary: analysis.summary,
                chapters: analysis.chapters || [],
                keyConceptsForChat: analysis.keyConceptsForChat || [],
                vocabulary: analysis.vocabulary || [],
                suggestedQuestions: analysis.suggestedQuestions || [],
                relatedTopics: analysis.relatedTopics || [],

                // Extraction metadata
                extractionMetadata,
            });

            await delay(500); // Let user see "complete" state
            return lesson;

        } catch (error) {
            console.error('Error processing file:', error);
            setError({
                message: error.message || 'Failed to process file',
                code: 'FILE_PROCESSING_ERROR',
                timestamp: new Date().toISOString(),
            });
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    /**
     * Process a YouTube video and create a lesson
     * @param {Object} video - Video object with id, title, etc.
     * @param {string} title - User-provided title
     * @param {string} subject - Subject category
     * @param {string} gradeLevel - Grade level
     * @returns {Promise<Object>} The created lesson
     */
    const processYouTube = useCallback(async (video, title, subject, gradeLevel) => {
        try {
            startProcessing();

            // Stage 1: Fetch video info
            setProcessingStage('uploading');
            updateProgress(10);

            const videoMetadata = await getVideoMetadata(video.id);
            updateProgress(20);

            // Stage 2: Get transcript
            setProcessingStage('extracting');
            updateProgress(25);

            const transcript = await getYouTubeTranscript(video.id);
            updateProgress(45);

            // Check if we got any transcript
            if (!transcript || transcript.trim().length < 10) {
                throw new Error('Could not get transcript for this video. Try a different video.');
            }

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');

            const analysis = await analyzeContent(transcript, {
                subject,
                gradeLevel,
                onProgress: (analyzeProgress) => {
                    const overallProgress = 45 + Math.round(analyzeProgress * 0.25);
                    updateProgress(overallProgress);
                },
            });

            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');

            const studyGuide = await processWithGemini(transcript, 'study_guide');
            updateProgress(90);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                // Use database lesson ID if available (for sync with backend)
                id: analysis.lessonId || undefined,

                // Use provided title or video title
                title: title || video.title || videoMetadata.title || 'YouTube Lesson',
                subject: subject || analysis.subject,
                gradeLevel: gradeLevel || analysis.gradeLevel,

                // Source info
                sourceType: 'youtube',
                source: {
                    type: 'youtube',
                    originalName: video.title || videoMetadata.title,
                    youtubeId: video.id,
                    thumbnailUrl: getYouTubeThumbnail(video.id, 'high'),
                },
                sourceVideo: {
                    id: video.id,
                    title: video.title || videoMetadata.title,
                    thumbnail: getYouTubeThumbnail(video.id, 'high'),
                    duration: videoMetadata.duration,
                    channel: videoMetadata.channel,
                },

                // Raw text (original) and formatted content (HTML)
                rawText: transcript,
                formattedContent: analysis.formattedContent || null,

                // AI-analyzed content
                content: {
                    rawText: transcript,
                    formattedContent: analysis.formattedContent || null,
                    summary: analysis.summary,
                    keyPoints: analysis.keyConceptsForChat || [],
                    chapters: analysis.chapters || [],
                    vocabulary: analysis.vocabulary || [],
                    studyGuide: studyGuide,
                    estimatedReadTime: analysis.estimatedReadTime || 5,
                },

                // Lesson-level data
                summary: analysis.summary,
                chapters: analysis.chapters || [],
                keyConceptsForChat: analysis.keyConceptsForChat || [],
                vocabulary: analysis.vocabulary || [],
                suggestedQuestions: analysis.suggestedQuestions || [],
                relatedTopics: analysis.relatedTopics || [],
            });

            await delay(500);
            return lesson;

        } catch (error) {
            console.error('Error processing YouTube video:', error);
            setError({
                message: error.message || 'Failed to process video',
                code: 'YOUTUBE_PROCESSING_ERROR',
                timestamp: new Date().toISOString(),
            });
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    /**
     * Process raw text content (pasted text)
     * @param {string} text - Raw text content
     * @param {string} title - User-provided title
     * @param {string} subject - Subject category
     * @param {string} gradeLevel - Grade level
     * @returns {Promise<Object>} The created lesson
     */
    const processText = useCallback(async (text, title, subject, gradeLevel) => {
        try {
            if (!text || text.trim().length < 10) {
                throw new Error('Please enter some text to create a lesson.');
            }

            startProcessing();

            // Stage 1: "Upload" (instant for text)
            setProcessingStage('uploading');
            updateProgress(15);
            await delay(300);

            // Stage 2: Skip extraction (already text)
            setProcessingStage('extracting');
            updateProgress(30);
            await delay(300);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');

            const analysis = await analyzeContent(text, {
                subject,
                gradeLevel,
                onProgress: (analyzeProgress) => {
                    const overallProgress = 30 + Math.round(analyzeProgress * 0.4);
                    updateProgress(overallProgress);
                },
            });

            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');

            const studyGuide = await processWithGemini(text, 'study_guide');
            updateProgress(90);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                // Use database lesson ID if available (for sync with backend)
                id: analysis.lessonId || undefined,

                title: title || analysis.title || 'New Lesson',
                subject: subject || analysis.subject,
                gradeLevel: gradeLevel || analysis.gradeLevel,

                sourceType: 'text',
                source: {
                    type: 'text',
                    originalName: title || 'Pasted Text',
                },

                // Raw text (original) and formatted content (HTML)
                rawText: text,
                formattedContent: analysis.formattedContent || null,

                content: {
                    rawText: text,
                    formattedContent: analysis.formattedContent || null,
                    summary: analysis.summary,
                    keyPoints: analysis.keyConceptsForChat || [],
                    chapters: analysis.chapters || [],
                    vocabulary: analysis.vocabulary || [],
                    studyGuide: studyGuide,
                    estimatedReadTime: analysis.estimatedReadTime || 5,
                },

                summary: analysis.summary,
                chapters: analysis.chapters || [],
                keyConceptsForChat: analysis.keyConceptsForChat || [],
                vocabulary: analysis.vocabulary || [],
                suggestedQuestions: analysis.suggestedQuestions || [],
                relatedTopics: analysis.relatedTopics || [],
            });

            await delay(500);
            return lesson;

        } catch (error) {
            console.error('Error processing text:', error);
            setError({
                message: error.message || 'Failed to process text',
                code: 'TEXT_PROCESSING_ERROR',
                timestamp: new Date().toISOString(),
            });
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    return {
        processFile,
        processYouTube,
        processText,
    };
}

// Helper functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert file to base64 string (without data URL prefix)
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const result = reader.result;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default useLessonProcessor;
