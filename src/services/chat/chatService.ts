import { chatAPI } from '../api/chatAPI';
import promptBuilder, { UserProfile, LessonContext, ConversationContext } from '../ai/promptBuilder';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'infographic' | 'flashcards' | 'summary' | 'quiz';
  imageData?: string;
  mimeType?: string;
  metadata?: {
    lessonId?: string;
    contentType?: string;
    safetyFlags?: string[];
  };
}

export interface ChatServiceConfig {
  userProfile: UserProfile;
  lessonContext?: LessonContext;
  conversationContext?: ConversationContext;
  enableStreaming?: boolean;
  maxHistoryLength?: number;
}

export interface SendMessageOptions {
  onChunk?: (chunk: string) => void;
  onSafetyFlag?: (flags: string[]) => void;
  onError?: (error: Error) => void;
}

export interface SendMessageResult {
  message: ChatMessage;
  blocked: boolean;
  blockReason?: string;
  safetyFlags?: string[];
}

class ChatService {
  private config: ChatServiceConfig;
  private conversationHistory: ChatMessage[] = [];
  private storageKey: string;

  constructor(config: ChatServiceConfig) {
    this.config = config;
    this.storageKey = `chat_history_${config.userProfile.id}`;
    this.loadConversationHistory();
  }

  async sendMessage(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<SendMessageResult> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          lessonId: this.config.lessonContext?.lessonId,
        },
      };

      this.conversationHistory.push(userMessage);

      // Build conversation history for API (convert to backend format)
      const conversationHistoryForAPI = this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'USER' : 'MODEL',
        content: msg.content,
      }));

      // Build lesson context for API - include full content for accurate responses
      const lessonContext = this.config.lessonContext ? {
        lessonId: this.config.lessonContext.lessonId,
        title: this.config.lessonContext.topic,
        subject: this.config.lessonContext.subject,
        keyConcepts: this.config.lessonContext.keyPoints,
        content: this.config.lessonContext.uploadedContent, // Full lesson content
        summary: this.config.lessonContext.summary,
      } : undefined;

      // Determine age group from user profile
      const ageGroup = this.config.userProfile.age <= 7 ? 'YOUNG' : 'OLDER';

      // Call backend API
      const response = await chatAPI.sendMessage({
        message,
        childId: this.config.userProfile.id,
        ageGroup,
        lessonContext,
        conversationHistory: conversationHistoryForAPI.slice(0, -1), // Exclude current message
      });

      // Extract response content
      const responseContent = response.data?.content || response.content || "I'm having trouble responding. Let's try again!";
      const responseType = response.data?.type || 'text';
      const imageData = response.data?.imageData;
      const mimeType = response.data?.mimeType;

      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: responseType,
        ...(imageData && { imageData }),
        ...(mimeType && { mimeType }),
        metadata: {
          lessonId: this.config.lessonContext?.lessonId,
        },
      };

      this.conversationHistory.push(assistantMessage);

      // Trim history if needed
      this.trimHistory();

      // Save to persistence
      this.saveConversationHistory();

      // Simulate streaming for smooth UX if onChunk is provided
      if (options.onChunk) {
        const words = responseContent.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          options.onChunk(chunk);
          await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
        }
      }

      return {
        message: assistantMessage,
        blocked: false,
      };

    } catch (error: any) {
      console.error('ChatService error:', error);

      if (options.onError) {
        options.onError(error);
      }

      // Return friendly error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Oops! Something went wrong on my end. Let's try that again!",
        timestamp: new Date(),
      };

      return {
        message: errorMessage,
        blocked: false,
      };
    }
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.saveConversationHistory();
  }

  private trimHistory(): void {
    const maxLength = this.config.maxHistoryLength || 20;
    if (this.conversationHistory.length > maxLength) {
      // Keep the most recent messages
      this.conversationHistory = this.conversationHistory.slice(-maxLength);
    }
  }

  private loadConversationHistory(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.conversationHistory = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      this.conversationHistory = [];
    }
  }

  private saveConversationHistory(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.conversationHistory)
      );
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  private async logSafetyIncident(
    type: string,
    content: string,
    flags: string[]
  ): Promise<void> {
    const incident = {
      type,
      content: content.substring(0, 200), // First 200 chars for logging
      flags,
      timestamp: new Date(),
      userId: this.config.userProfile.id,
      lessonId: this.config.lessonContext?.lessonId,
    };

    console.log('Safety incident:', incident);

    // Store locally for parent review
    try {
      const incidentsKey = `safety_incidents_${this.config.userProfile.id}`;
      const incidents = JSON.parse(
        localStorage.getItem(incidentsKey) || '[]'
      );
      incidents.push(incident);
      localStorage.setItem(
        incidentsKey,
        JSON.stringify(incidents.slice(-50)) // Keep last 50 incidents
      );
    } catch (error) {
      console.error('Error logging safety incident:', error);
    }
  }

  updateConfig(updates: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Get current config for external use
  getConfig(): ChatServiceConfig {
    return { ...this.config };
  }

  // Update lesson context specifically
  updateLessonContext(lessonContext: LessonContext): void {
    this.config.lessonContext = lessonContext;
  }

  // Get suggested questions based on current context
  getSuggestedQuestions(): string[] {
    return promptBuilder.getSuggestedQuestions(this.config.lessonContext);
  }
}

export { ChatService };
export default ChatService;
