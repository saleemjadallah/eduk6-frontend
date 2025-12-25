import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ChatService } from '../services/chat/chatService';
import { useLessonContext } from './LessonContext';
import { useGamificationContext } from './GamificationContext';
import { useAuth } from './AuthContext';

// Default user profile for demo/development mode (fallback when no auth)
const DEFAULT_USER_PROFILE = {
  id: 'demo-user-001',
  name: 'Young Learner',
  age: 8,
  grade: 3,
  learningStyle: 'visual',
  interests: ['science', 'math', 'animals'],
  language: 'en',
  curriculumType: 'american',
};

// Create context
const ChatContext = createContext(null);

// Provider component
export function ChatProvider({ children, userProfile: propUserProfile }) {
  // State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [safetyFlags, setSafetyFlags] = useState([]);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // Refs
  const chatServiceRef = useRef(null);

  // Get context from other providers
  const lessonContext = useLessonContext();
  const gamificationContext = useGamificationContext();

  // Get auth context - use try/catch to handle case where AuthProvider is not available
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthProvider not available, will use default profile
  }

  // Build user profile from AuthContext's currentProfile or fallback to props/default
  const userProfile = useMemo(() => {
    // Priority: AuthContext > props > default
    if (authContext?.currentProfile) {
      const profile = authContext.currentProfile;
      return {
        id: profile.id,
        name: profile.displayName,
        age: profile.age,
        grade: profile.grade,
        learningStyle: profile.learningStyle || 'visual',
        interests: profile.interests || [],
        language: profile.language || 'en',
        curriculumType: profile.curriculumType || 'american',
      };
    }

    if (propUserProfile) {
      return propUserProfile;
    }

    return DEFAULT_USER_PROFILE;
  }, [authContext?.currentProfile, propUserProfile]);

  // Extract relevant data from LessonContext
  const currentLesson = lessonContext?.currentLesson;

  // Extract relevant data from GamificationContext
  const { currentXP, currentLevel, streak, earnXP, recordActivity, updateDailyChallengeProgress } = gamificationContext || {};

  // Build lesson context for ChatService
  // This provides Ollie with the full lesson content for answering contextual questions
  const buildLessonContext = useCallback(() => {
    if (!currentLesson) return undefined;

    // Get the full content - prioritize extractedText (original content)
    const fullContent = currentLesson.extractedText ||
                        currentLesson.rawText ||
                        currentLesson.content?.extractedText ||
                        currentLesson.content?.rawText ||
                        '';

    // Debug: Log warning if lesson exists but content is empty
    // This helps identify data flow issues
    if (!fullContent && currentLesson.id) {
      console.warn('[ChatContext] Lesson loaded but extractedText is empty. Ollie may not be able to answer lesson-specific questions.', {
        lessonId: currentLesson.id,
        title: currentLesson.title,
        hasExtractedText: !!currentLesson.extractedText,
        hasRawText: !!currentLesson.rawText,
      });
    }

    return {
      lessonId: currentLesson.id,
      title: currentLesson.title,
      subject: currentLesson.subject,
      topic: currentLesson.title || currentLesson.topic,
      grade: currentLesson.grade || currentLesson.gradeLevel,
      contentType: currentLesson.contentType || currentLesson.sourceType,
      // Full content for Ollie to reference when answering questions
      // This allows Ollie to answer questions like "what does question 3 mean?"
      content: fullContent,
      uploadedContent: fullContent, // Alias for backwards compatibility
      summary: currentLesson.summary,
      keyConcepts: currentLesson.keyConcepts || currentLesson.keyConceptsForChat || [],
      keyPoints: currentLesson.keyPoints || currentLesson.chapters?.map(c => c.title),
      learningObjectives: currentLesson.learningObjectives,
    };
  }, [currentLesson]);

  // Build conversation context for ChatService
  const buildConversationContext = useCallback(() => {
    return {
      history: messages,
      currentStreak: streak?.current || 0,
      xp: currentXP || 0,
      recentTopics: currentLesson ? [currentLesson.title || currentLesson.subject] : [],
    };
  }, [messages, streak, currentXP, currentLesson]);

  // Initialize ChatService
  useEffect(() => {
    const config = {
      userProfile,
      lessonContext: buildLessonContext(),
      conversationContext: buildConversationContext(),
      enableStreaming: true,
      maxHistoryLength: 20,
    };

    chatServiceRef.current = new ChatService(config);

    // Load existing conversation history
    const history = chatServiceRef.current.getConversationHistory();
    if (history.length > 0) {
      setMessages(history);
    }

    // Set suggested questions
    setSuggestedQuestions(chatServiceRef.current.getSuggestedQuestions());
  }, [userProfile]);

  // Update ChatService when user profile changes (e.g., profile switch)
  useEffect(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.updateConfig({
        userProfile,
      });

      // Clear chat history when switching profiles to maintain privacy
      if (userProfile.id !== chatServiceRef.current.getConfig().userProfile?.id) {
        chatServiceRef.current.clearHistory();
        setMessages([]);
      }
    }
  }, [userProfile.id]);

  // Track previous lesson ID to detect lesson changes
  const previousLessonIdRef = useRef(currentLesson?.id);

  // Update ChatService when lesson context changes
  useEffect(() => {
    if (chatServiceRef.current) {
      const lessonCtx = buildLessonContext();
      const previousLessonId = previousLessonIdRef.current;
      const currentLessonId = currentLesson?.id;

      // Clear chat history when switching to a different lesson
      // This ensures each lesson starts with a fresh conversation
      if (previousLessonId && currentLessonId && previousLessonId !== currentLessonId) {
        chatServiceRef.current.clearHistory();
        setMessages([]);
        setError(null);
        setSafetyFlags([]);
        setLastUserMessage('');
      }

      // Update the previous lesson ID ref
      previousLessonIdRef.current = currentLessonId;

      // Update lesson context in ChatService
      chatServiceRef.current.updateConfig({
        lessonContext: lessonCtx,
      });

      // Update suggested questions based on new lesson
      setSuggestedQuestions(chatServiceRef.current.getSuggestedQuestions());
    }
  }, [currentLesson?.id, buildLessonContext]);

  // Send message function
  const sendMessage = useCallback(async (message) => {
    if (!chatServiceRef.current || !message.trim()) return;

    setIsLoading(true);
    setError(null);
    setSafetyFlags([]);
    setLastUserMessage(message);

    // Optimistically add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // For streaming, add empty assistant message that will be updated
    const streamingMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, streamingMessage]);
    setIsStreaming(true);

    try {
      const result = await chatServiceRef.current.sendMessage(message, {
        onChunk: (chunk) => {
          // Update the streaming message with new chunk
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === 'assistant') {
              updated[updated.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
            }
            return updated;
          });
        },
        onSafetyFlag: (flags) => {
          setSafetyFlags(flags);
        },
        onError: (err) => {
          setError(err.message);
        },
      });

      setIsStreaming(false);

      // Replace the streaming message with the final result
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...result.message,
          isStreaming: false,
          // Preserve image data if it's an image response
          type: result.message.type || 'text',
          imageData: result.message.imageData,
          mimeType: result.message.mimeType,
        };
        return updated;
      });

      if (result.blocked) {
        setError(result.blockReason || 'Message was filtered for safety');
      }

      if (result.safetyFlags && result.safetyFlags.length > 0) {
        setSafetyFlags(result.safetyFlags);
      }

      // Award XP for chat interaction (if not blocked)
      if (!result.blocked && earnXP) {
        earnXP(5, 'Chat interaction');
      }

      // Record activity for streak
      if (recordActivity) {
        recordActivity();
      }

      // Update daily challenge progress
      if (updateDailyChallengeProgress) {
        updateDailyChallengeProgress('questionAnswered');
      }

    } catch (err) {
      setIsStreaming(false);
      setError(err.message || 'Failed to send message');

      // Remove the streaming message on error
      setMessages(prev => prev.slice(0, -1));

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: "Oops! Something went wrong. Let's try that again!",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [earnXP, recordActivity, updateDailyChallengeProgress]);

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      // Remove the last two messages (user + failed assistant response)
      setMessages(prev => prev.slice(0, -2));
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  // Clear chat history
  const clearChat = useCallback(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.clearHistory();
      setMessages([]);
      setError(null);
      setSafetyFlags([]);
      setLastUserMessage('');
    }
  }, []);

  // Add a message programmatically (for system messages)
  const addSystemMessage = useCallback((content) => {
    const systemMessage = {
      role: 'assistant',
      content,
      timestamp: new Date(),
      isSystem: true,
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // Add a custom message (supports special types like flashcards, summary, infographic, quiz)
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: message.id || Date.now(),
      role: message.role || 'assistant',
      content: message.content || '',
      timestamp: message.timestamp || new Date(),
      type: message.type || 'text',
      // Special content
      flashcards: message.flashcards,
      summary: message.summary,
      quiz: message.quiz,
      imageData: message.imageData,
      mimeType: message.mimeType,
      // Metadata
      isError: message.isError,
      isSystem: message.isSystem,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Add multiple messages at once
  const addMessages = useCallback((newMessages) => {
    const formattedMessages = newMessages.map(msg => ({
      id: msg.id || Date.now() + Math.random(),
      role: msg.role || 'assistant',
      content: msg.content || '',
      timestamp: msg.timestamp || new Date(),
      type: msg.type || 'text',
      flashcards: msg.flashcards,
      summary: msg.summary,
      quiz: msg.quiz,
      imageData: msg.imageData,
      mimeType: msg.mimeType,
      isError: msg.isError,
      isSystem: msg.isSystem,
    }));
    setMessages(prev => [...prev, ...formattedMessages]);
  }, []);

  // Get welcome message based on context
  const getWelcomeMessage = useCallback(() => {
    if (currentLesson) {
      return `Hi! I'm Ollie, your learning buddy! I see you're studying "${currentLesson.title || currentLesson.subject}". What would you like to know about it?`;
    }
    return "Hi there! I'm Ollie, your learning buddy! Upload a lesson or ask me anything you'd like to learn about!";
  }, [currentLesson]);

  // Derived state
  const derivedState = useMemo(() => ({
    hasMessages: messages.length > 0,
    messageCount: messages.length,
    hasSafetyFlags: safetyFlags.length > 0,
    isReady: !isLoading && chatServiceRef.current !== null,
    welcomeMessage: getWelcomeMessage(),
  }), [messages, safetyFlags, isLoading, getWelcomeMessage]);

  // Context value
  const value = useMemo(() => ({
    // State
    messages,
    isLoading,
    isStreaming,
    error,
    safetyFlags,
    suggestedQuestions,
    ...derivedState,

    // Actions
    sendMessage,
    retryLastMessage,
    clearChat,
    addSystemMessage,
    addMessage,
    addMessages,

    // Utility
    getWelcomeMessage,
  }), [
    messages,
    isLoading,
    isStreaming,
    error,
    safetyFlags,
    suggestedQuestions,
    derivedState,
    sendMessage,
    retryLastMessage,
    clearChat,
    addSystemMessage,
    addMessage,
    addMessages,
    getWelcomeMessage,
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}

// Export context and hook
export { ChatContext };
export default ChatContext;
