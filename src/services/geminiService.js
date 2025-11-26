/**
 * Gemini API Service
 *
 * Connects to the backend API for AI-powered content processing.
 * The backend handles Gemini API calls with proper safety filters.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

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
    const analysis = response.data.analysis || response.data;

    return {
      title: analysis.title,
      summary: analysis.summary,
      gradeLevel: analysis.gradeLevel || gradeLevel || 'Grade 3-4',
      subject: analysis.subject || subject || 'General',
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
 * @returns {Promise<string>} AI response
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

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  analyzeContent,
  processWithGemini,
  generateChatResponse,
  generateFlashcards,
  generateQuiz,
};
