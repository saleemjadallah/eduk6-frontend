import { useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';
import { extractTextFromPDF, extractTextFromImage } from '../utils/fileProcessors';
import { getYouTubeTranscript } from '../utils/youtubeUtils';
import { processWithGemini } from '../services/geminiService';

export function useLessonProcessor() {
    const {
        startProcessing,
        updateProgress,
        setProcessingStage,
        addLesson,
        setError,
        resetProcessing,
    } = useLessonContext();

    const processFile = useCallback(async (file, title, subject) => {
        try {
            startProcessing();

            // Stage 1: Upload (simulated - file is already in memory)
            setProcessingStage('uploading');
            updateProgress(10);
            await delay(500);

            // Stage 2: Extract text
            setProcessingStage('extracting');
            updateProgress(25);
            
            let extractedText = '';
            if (file.type === 'application/pdf') {
                extractedText = await extractTextFromPDF(file);
            } else if (file.type.startsWith('image/')) {
                extractedText = await extractTextFromImage(file);
            } else if (file.type === 'text/plain') {
                extractedText = await file.text();
            }
            
            updateProgress(45);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');
            updateProgress(55);
            
            const analysis = await processWithGemini(extractedText, 'analyze');
            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');
            updateProgress(80);
            
            const studyGuide = await processWithGemini(extractedText, 'study_guide');
            updateProgress(95);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                title,
                subject,
                sourceType: 'file',
                sourceFile: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                },
                content: {
                    rawText: extractedText,
                    summary: analysis.summary,
                    keyPoints: analysis.keyPoints,
                    chapters: analysis.chapters,
                    studyGuide: studyGuide,
                    vocabulary: analysis.vocabulary || [],
                },
            });

            await delay(500); // Let user see "complete" state
            return lesson;

        } catch (error) {
            console.error('Error processing file:', error);
            setError(error.message || 'Failed to process file');
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    const processYouTube = useCallback(async (video, title, subject) => {
        try {
            startProcessing();

            // Stage 1: Fetch video info
            setProcessingStage('uploading');
            updateProgress(10);
            await delay(500);

            // Stage 2: Get transcript
            setProcessingStage('extracting');
            updateProgress(25);
            
            const transcript = await getYouTubeTranscript(video.id);
            updateProgress(45);

            // Stage 3: Analyze with AI
            setProcessingStage('analyzing');
            updateProgress(55);
            
            const analysis = await processWithGemini(transcript, 'analyze');
            updateProgress(70);

            // Stage 4: Generate study materials
            setProcessingStage('generating');
            updateProgress(80);
            
            const studyGuide = await processWithGemini(transcript, 'study_guide');
            updateProgress(95);

            // Stage 5: Complete
            setProcessingStage('complete');
            updateProgress(100);

            const lesson = addLesson({
                title,
                subject,
                sourceType: 'youtube',
                sourceVideo: video,
                content: {
                    rawText: transcript,
                    summary: analysis.summary,
                    keyPoints: analysis.keyPoints,
                    chapters: analysis.chapters,
                    studyGuide: studyGuide,
                    vocabulary: analysis.vocabulary || [],
                },
            });

            await delay(500);
            return lesson;

        } catch (error) {
            console.error('Error processing YouTube video:', error);
            setError(error.message || 'Failed to process video');
            resetProcessing();
            throw error;
        }
    }, [startProcessing, updateProgress, setProcessingStage, addLesson, setError, resetProcessing]);

    return {
        processFile,
        processYouTube,
    };
}

// Helper function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
