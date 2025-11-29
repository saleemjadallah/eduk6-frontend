/**
 * Gemini API Service
 *
 * Connects to the backend API for AI-powered content processing.
 * The backend handles Gemini API calls with proper safety filters.
 */

import { makeAuthenticatedRequest as makeRequest } from './api/apiUtils.js';

// Get child context from localStorage
function getChildContext() {
  const currentProfileId = localStorage.getItem('current_profile_id');
  const storedChildren = localStorage.getItem('demo_children');

  if (currentProfileId && storedChildren) {
    try {
      const children = JSON.parse(storedChildren);
      const child = children.find(c => c.id === currentProfileId);
      if (child) {
        return {
          childId: child.id,
          ageGroup: child.age <= 7 ? 'YOUNG' : 'OLDER',
        };
      }
    } catch (e) {
      console.error('Error parsing child context:', e);
    }
  }

  return { childId: null, ageGroup: 'OLDER' };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Analyze content and generate lesson structure
 * @param {string} text - Raw text content
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analyzed lesson data
 */
export async function analyzeContent(text, options = {}) {
  const { subject, gradeLevel, onProgress } = options;
  const { childId, ageGroup } = getChildContext();

  // Report initial progress
  if (onProgress) onProgress(10);

  try {
    const response = await makeRequest('/lessons/analyze', {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        childId,
        ageGroup,
        subject,
        gradeLevel,
      }),
    });

    if (onProgress) onProgress(100);

    // Backend returns { data: { lesson, analysis } }
    // Extract BOTH the lesson (with database ID) and the analysis
    const { lesson, analysis: analysisData } = response.data;
    const analysis = analysisData || response.data;

    return {
      // Include the database lesson ID so frontend can use it
      lessonId: lesson?.id || null,
      dbLesson: lesson || null,

      title: analysis.title,
      summary: analysis.summary,
      gradeLevel: analysis.gradeLevel || gradeLevel || 'Grade 3-4',
      subject: analysis.subject || subject || 'General',
      formattedContent: analysis.formattedContent || null, // HTML-formatted lesson content
      chapters: analysis.chapters || [],
      keyConceptsForChat: analysis.keyConcepts || [],
      vocabulary: analysis.vocabulary || [],
      suggestedQuestions: analysis.suggestedQuestions || [],
      relatedTopics: analysis.relatedTopics || [],
      estimatedReadTime: Math.ceil(text.split(/\s+/).length / 200),
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    throw new Error('Failed to analyze content. Please try again.');
  }
}

/**
 * Process text with Gemini for various tasks
 * @param {string} text - Text to process
 * @param {string} task - Task type
 * @returns {Promise<Object>} Processed result
 */
export async function processWithGemini(text, task) {
  const { childId, ageGroup } = getChildContext();

  try {
    const response = await makeRequest('/lessons/process', {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        task,
        childId,
        ageGroup,
      }),
    });

    return response.data;
  } catch (error) {
    console.error('Process with Gemini error:', error);
    throw new Error('Failed to process content. Please try again.');
  }
}

/**
 * Generate chat response with lesson context
 * @param {string} message - User message
 * @param {Object} context - Lesson context
 * @param {Array} history - Chat history
 * @returns {Promise<Object|string>} AI response (string for text, object with imageData for images)
 */
export async function generateChatResponse(message, context, history = []) {
  const { childId, ageGroup } = getChildContext();

  try {
    const response = await makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        childId,
        ageGroup,
        lessonContext: context ? {
          lessonId: context.id,
          title: context.title,
          subject: context.subject,
          keyConcepts: context.keyConceptsForChat || context.keyConcepts,
        } : null,
        conversationHistory: history.map(msg => ({
          role: msg.role === 'assistant' ? 'MODEL' : 'USER',
          content: msg.content,
        })),
      }),
    });

    // Check if this is an image response
    if (response.data.type === 'image' && response.data.imageData) {
      return {
        content: response.data.content,
        type: 'image',
        imageData: response.data.imageData,
        mimeType: response.data.mimeType,
      };
    }

    // Regular text response - return just the content string for backward compatibility
    return response.data.content;
  } catch (error) {
    console.error('Chat response error:', error);
    // Return a friendly fallback message
    return "I'm having a little trouble right now. Can you try asking me again?";
  }
}

/**
 * Generate flashcards from lesson content
 * @param {string} text - Lesson content text
 * @param {number} count - Number of cards to generate
 * @returns {Promise<Object>} Flashcard array
 */
export async function generateFlashcards(text, count = 10) {
  const { childId, ageGroup } = getChildContext();

  try {
    const response = await makeRequest('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        count,
        childId,
        ageGroup,
      }),
    });

    return {
      flashcards: response.data.map((card, i) => ({
        id: card.id || `card-${i + 1}`,
        front: card.front,
        back: card.back,
        hint: card.hint,
        difficulty: card.difficulty || 'medium',
      })),
    };
  } catch (error) {
    console.error('Flashcard generation error:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

/**
 * Generate quiz questions from text
 * @param {string} text - Text content
 * @param {number} count - Number of questions
 * @returns {Promise<Object>} Quiz questions
 */
export async function generateQuiz(text, count = 5) {
  const { childId, ageGroup } = getChildContext();

  try {
    const response = await makeRequest('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({
        content: text,
        count,
        childId,
        ageGroup,
        type: 'multiple_choice',
      }),
    });

    return {
      title: response.data.title || 'Quiz',
      questions: response.data.questions.map((q, i) => ({
        id: q.id || `q-${i + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        encouragement: q.encouragement,
      })),
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

/**
 * Translate text to a target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language name (e.g., "Spanish", "Arabic")
 * @returns {Promise<Object>} Translation result
 */
export async function translateText(text, targetLanguage) {
  const { childId, ageGroup } = getChildContext();

  try {
    const response = await makeRequest('/chat/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        targetLanguage,
        childId,
        ageGroup,
      }),
    });

    return response.data;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  analyzeContent,
  processWithGemini,
  generateChatResponse,
  generateFlashcards,
  generateQuiz,
  translateText,
};
