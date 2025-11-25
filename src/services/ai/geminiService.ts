import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface GeminiConfig {
  apiKey: string;
  model: string;
  safetySettings: SafetySetting[];
  generationConfig: GenerationConfig;
}

interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

interface GenerationConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    lessonId?: string;
    contentType?: string;
    safetyFlags?: string[];
  };
}

export interface GeminiResponse {
  content: string;
  safetyRatings?: SafetyRating[];
  finishReason?: string;
  blocked: boolean;
  blockReason?: string;
}

interface SafetyRating {
  category: string;
  probability: string;
}

// Check if we're in mock mode (no API key or explicitly set to mock)
const USE_MOCK = !import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_USE_MOCK === 'true';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    if (!USE_MOCK && config.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.initializeModel();
    }
  }

  private initializeModel(): void {
    if (!this.genAI) return;

    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      safetySettings: this.config.safetySettings,
      generationConfig: this.config.generationConfig,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    systemInstructions?: string
  ): Promise<GeminiResponse> {
    // Use mock if no API key
    if (USE_MOCK || !this.model) {
      return this.generateMockResponse(messages, systemInstructions);
    }

    try {
      // Build the conversation history for Gemini
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Get the latest user message
      const latestMessage = messages[messages.length - 1].content;

      // Start chat with history
      const chat = this.model.startChat({
        history,
        systemInstruction: systemInstructions,
      });

      // Send message and get response
      const result = await chat.sendMessage(latestMessage);
      const response = result.response;

      // Check if response was blocked
      if (response.promptFeedback?.blockReason) {
        return {
          content: '',
          blocked: true,
          blockReason: response.promptFeedback.blockReason,
        };
      }

      // Extract text and safety ratings
      const text = response.text();
      const safetyRatings = response.candidates?.[0]?.safetyRatings;

      return {
        content: text,
        safetyRatings,
        finishReason: response.candidates?.[0]?.finishReason,
        blocked: false,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);

      // Handle specific error types
      if (error.message?.includes('API key')) {
        throw new Error('GEMINI_API_KEY_INVALID');
      } else if (error.message?.includes('quota')) {
        throw new Error('GEMINI_QUOTA_EXCEEDED');
      } else if (error.message?.includes('blocked')) {
        return {
          content: '',
          blocked: true,
          blockReason: error.message,
        };
      }

      throw new Error('GEMINI_API_ERROR');
    }
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    systemInstructions?: string,
    onChunk?: (chunk: string) => void
  ): Promise<GeminiResponse> {
    // Use mock if no API key
    if (USE_MOCK || !this.model) {
      return this.generateMockStreamingResponse(messages, systemInstructions, onChunk);
    }

    try {
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const latestMessage = messages[messages.length - 1].content;

      const chat = this.model.startChat({
        history,
        systemInstruction: systemInstructions,
      });

      const result = await chat.sendMessageStream(latestMessage);

      let fullText = '';
      let lastSafetyRatings: SafetyRating[] | undefined;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        lastSafetyRatings = chunk.candidates?.[0]?.safetyRatings;

        // Call the callback with each chunk
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      const finalResponse = await result.response;

      return {
        content: fullText,
        safetyRatings: lastSafetyRatings,
        finishReason: finalResponse.candidates?.[0]?.finishReason,
        blocked: false,
      };
    } catch (error: any) {
      console.error('Gemini streaming error:', error);
      throw new Error('GEMINI_STREAMING_ERROR');
    }
  }

  // Mock response generation for development
  private async generateMockResponse(
    messages: ChatMessage[],
    systemInstructions?: string
  ): Promise<GeminiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // Generate contextual mock responses
    const response = this.getMockResponseForQuery(lastMessage);

    return {
      content: response,
      blocked: false,
      safetyRatings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
      ],
    };
  }

  private async generateMockStreamingResponse(
    messages: ChatMessage[],
    systemInstructions?: string,
    onChunk?: (chunk: string) => void
  ): Promise<GeminiResponse> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    const response = this.getMockResponseForQuery(lastMessage);

    // Simulate streaming by chunking the response
    const words = response.split(' ');
    let fullText = '';

    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      fullText += chunk;

      if (onChunk) {
        onChunk(chunk);
      }

      // Random delay between chunks (20-60ms)
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 40));
    }

    return {
      content: fullText,
      blocked: false,
    };
  }

  private getMockResponseForQuery(query: string): string {
    // Educational responses based on common queries
    if (query.includes('math') || query.includes('add') || query.includes('number')) {
      return "Great question about math! Let me help you understand this. When we add numbers together, we're combining them into one bigger number. For example, if you have 2 apples and get 3 more, you can count them all together: 1, 2, 3, 4, 5 apples! Would you like to try a practice problem?";
    }

    if (query.includes('read') || query.includes('story') || query.includes('book')) {
      return "I love talking about reading! Stories are amazing because they take us on adventures without leaving our seat. When you read, try to picture the characters in your mind - what do they look like? What are they doing? This makes reading even more fun! What story are you reading?";
    }

    if (query.includes('science') || query.includes('why') || query.includes('how')) {
      return "That's a wonderful science question! Scientists ask 'why' and 'how' just like you do. The world is full of amazing things to discover. Let me explain this in a way that's easy to understand... Would you like me to give you an example?";
    }

    if (query.includes('help') || query.includes('explain')) {
      return "Of course I'll help you! That's what I'm here for. Let's break this down into smaller pieces so it's easier to understand. First, let's look at the main idea, and then we can explore the details together. What part would you like to start with?";
    }

    if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
      return "Hi there, friend! I'm Jeffrey, your learning buddy! I'm so excited to learn with you today. What would you like to explore? We could talk about your lessons, practice some problems, or just chat about something cool you've learned!";
    }

    if (query.includes('flashcard') || query.includes('quiz')) {
      return "Great idea! Practice makes perfect! I can help you review what you've learned. Would you like me to quiz you on the key concepts from your lesson? Just say 'yes' and we'll get started!";
    }

    // Default friendly response
    return "That's a great question! I'm thinking about the best way to explain this to you. Learning is all about asking questions, and you're doing a fantastic job! Let me help you understand this better. What specific part would you like me to focus on?";
  }
}

// Factory function to create properly configured instances
export function createGeminiService(model: 'pro' | 'flash' = 'flash'): GeminiService {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  return new GeminiService({
    apiKey,
    model: model === 'pro' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest',
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.7, // Balanced creativity
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024, // Reasonable for child responses
    },
  });
}

export { GeminiService };
export default GeminiService;
