import { createGeminiService, GeminiService, ChatMessage, GeminiResponse } from '../ai/geminiService';
import safetyFilters from '../ai/safetyFilters';
import promptBuilder, { UserProfile, LessonContext, ConversationContext } from '../ai/promptBuilder';
import { ParentMonitoringService } from '../monitoring/parentMonitoring';

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
  private geminiService: GeminiService;
  private config: ChatServiceConfig;
  private conversationHistory: ChatMessage[] = [];
  private parentMonitoring: ParentMonitoringService;
  private storageKey: string;

  constructor(config: ChatServiceConfig) {
    this.config = config;
    // Use 'flash' for faster responses
    this.geminiService = createGeminiService('flash');
    this.parentMonitoring = new ParentMonitoringService();
    this.storageKey = `chat_history_${config.userProfile.id}`;
    this.loadConversationHistory();
  }

  async sendMessage(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<SendMessageResult> {
    try {
      // Step 1: Input validation and safety check
      const inputCheck = await safetyFilters.validateInput(
        message,
        this.config.userProfile.age
      );

      if (!inputCheck.passed && inputCheck.severity !== 'low') {
        // Log the blocked attempt
        await this.logSafetyIncident('input_blocked', message, inputCheck.flags);

        // Notify parent if severity is high
        if (inputCheck.severity === 'high') {
          await this.parentMonitoring.notifyParent({
            type: 'content_blocked',
            severity: inputCheck.severity,
            flags: inputCheck.flags,
            childId: this.config.userProfile.id,
          });
        }

        if (options.onSafetyFlag) {
          options.onSafetyFlag(inputCheck.flags);
        }

        return {
          message: {
            role: 'assistant',
            content: inputCheck.blockedReason || "Let's try a different question!",
            timestamp: new Date(),
          },
          blocked: true,
          blockReason: inputCheck.blockedReason,
          safetyFlags: inputCheck.flags,
        };
      }

      // Step 2: Build system instructions
      const systemInstructions = promptBuilder.buildSystemInstructions(
        this.config.userProfile,
        this.config.lessonContext,
        this.config.conversationContext
      );

      // Step 3: Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: {
          lessonId: this.config.lessonContext?.lessonId,
        },
      };

      this.conversationHistory.push(userMessage);

      // Step 4: Call Gemini API
      let geminiResponse: GeminiResponse;

      if (this.config.enableStreaming && options.onChunk) {
        geminiResponse = await this.geminiService.generateStreamingResponse(
          this.conversationHistory,
          systemInstructions,
          options.onChunk
        );
      } else {
        geminiResponse = await this.geminiService.generateResponse(
          this.conversationHistory,
          systemInstructions
        );
      }

      // Step 5: Handle blocked response from Gemini
      if (geminiResponse.blocked) {
        await this.logSafetyIncident(
          'gemini_blocked',
          message,
          [geminiResponse.blockReason || 'unknown']
        );

        const fallbackResponse: ChatMessage = {
          role: 'assistant',
          content: "I want to help, but let me think of a better way to answer that. Can you ask in a different way?",
          timestamp: new Date(),
        };

        this.conversationHistory.push(fallbackResponse);
        this.saveConversationHistory();

        return {
          message: fallbackResponse,
          blocked: true,
          blockReason: geminiResponse.blockReason,
        };
      }

      // Step 6: Output validation and safety check
      const outputCheck = await safetyFilters.validateOutput(
        geminiResponse.content,
        this.config.userProfile.age
      );

      let finalContent = geminiResponse.content;

      if (!outputCheck.passed && outputCheck.severity !== 'low') {
        // Sanitize the output if possible
        finalContent = safetyFilters.sanitizeOutput(
          geminiResponse.content,
          this.config.userProfile.age
        );

        // Log the sanitization
        await this.logSafetyIncident('output_sanitized', finalContent, outputCheck.flags);

        // If still not safe, use fallback
        if (outputCheck.severity === 'high') {
          finalContent = "Let me try explaining that differently... What part would you like me to focus on?";

          await this.parentMonitoring.notifyParent({
            type: 'response_sanitized',
            severity: outputCheck.severity,
            flags: outputCheck.flags,
            childId: this.config.userProfile.id,
          });
        }

        if (options.onSafetyFlag) {
          options.onSafetyFlag(outputCheck.flags);
        }
      }

      // Step 7: Add assistant response to history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: finalContent,
        timestamp: new Date(),
        metadata: {
          lessonId: this.config.lessonContext?.lessonId,
          safetyFlags: outputCheck.flags.length > 0 ? outputCheck.flags : undefined,
        },
      };

      this.conversationHistory.push(assistantMessage);

      // Step 8: Trim history if needed
      this.trimHistory();

      // Step 9: Save to persistence
      this.saveConversationHistory();

      return {
        message: assistantMessage,
        blocked: false,
        safetyFlags: outputCheck.flags.length > 0 ? outputCheck.flags : undefined,
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
