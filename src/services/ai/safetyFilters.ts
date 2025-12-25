export interface SafetyCheckResult {
  passed: boolean;
  flags: string[];
  severity: 'low' | 'medium' | 'high';
  blockedReason?: string;
}

export interface PIIDetectionResult {
  found: boolean;
  types: string[];
  sanitizedText: string;
}

// Profanity and inappropriate words list (kid-safe filtering)
// This is a minimal list - in production, use a comprehensive library
const PROFANITY_LIST = [
  // Basic profanity terms (abbreviated for safety)
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'dumb', 'shut up',
  'hate you', 'kill', 'die', 'murder', 'blood', 'gore',
];

// Inappropriate topics for K-6 children
const INAPPROPRIATE_PATTERNS = [
  /\b(violence|violent|weapon|gun|knife|sword|fight|attack|murder|kill|death|dead|die|blood|gore)\b/gi,
  /\b(alcohol|beer|wine|drunk|drug|cigarette|smoke|vape|weed|marijuana)\b/gi,
  /\b(dating|boyfriend|girlfriend|romance|kiss|love\s+interest|crush)\b/gi,
  /\b(suicide|self-harm|cutting|hurt\s+myself|kill\s+myself)\b/gi,
  /\b(hate|racist|sexist|discrimination)\b/gi,
  /\b(scary|horror|nightmare|monster|demon|ghost|haunted)\b/gi,
];

// Jailbreak/manipulation attempt patterns
const JAILBREAK_PATTERNS = [
  /ignore\s+(previous|all|your)\s+(instructions|rules|guidelines)/gi,
  /pretend\s+(you\s+are|to\s+be|you're)/gi,
  /act\s+(as\s+if|like|as\s+though)/gi,
  /roleplay|role-play|role\s+play/gi,
  /forget\s+(what|everything|all)/gi,
  /system\s+prompt/gi,
  /developer\s+mode/gi,
  /jailbreak/gi,
  /bypass\s+(your|the)\s+(filter|safety|rules)/gi,
  /tell\s+me\s+a\s+secret/gi,
  /what\s+are\s+you\s+programmed/gi,
  /who\s+created\s+you/gi,
  /are\s+you\s+an?\s+(robot|ai|artificial)/gi,
];

// PII detection patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  // UAE phone patterns
  uaePhone: /\b(\+?971|00971|0)?[-.\s]?5[0-9][-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  // Address patterns
  address: /\b\d{1,5}\s[\w\s]{1,20}(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/gi,
  // Social security / ID numbers
  ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  // Full names with context clues
  myNameIs: /my\s+name\s+is\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)?)/gi,
  iLiveAt: /i\s+live\s+(at|in|on)\s+(.{5,50})/gi,
  mySchool: /my\s+school\s+is\s+(.{3,40})/gi,
  myTeacher: /my\s+teacher('s\s+name)?\s+is\s+([A-Z][a-z]+)/gi,
};

class SafetyFilters {
  // Layer 1: Input validation
  async validateInput(input: string, childAge: number): Promise<SafetyCheckResult> {
    const flags: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Check for profanity
    const profanityCheck = this.checkProfanity(input);
    if (profanityCheck.found) {
      flags.push('profanity');
      severity = 'medium';
    }

    // Check for personal information
    const piiCheck = this.detectPII(input);
    if (piiCheck.found) {
      flags.push('pii_detected');
      severity = 'high';
    }

    // Check for inappropriate topics
    const topicCheck = this.checkInappropriateTopics(input, childAge);
    if (topicCheck.inappropriate) {
      flags.push('inappropriate_topic');
      severity = 'high';
    }

    // Check for attempts to manipulate the AI
    const jailbreakCheck = this.checkJailbreakAttempt(input);
    if (jailbreakCheck.found) {
      flags.push('manipulation_attempt');
      severity = 'high';
    }

    // Check message length (prevent spam)
    if (input.length > 1000) {
      flags.push('message_too_long');
      severity = severity === 'low' ? 'low' : severity;
    }

    return {
      passed: flags.length === 0 || severity === 'low',
      flags,
      severity,
      blockedReason: flags.length > 0 ? this.getBlockedMessage(flags) : undefined,
    };
  }

  // Layer 4: Output validation
  async validateOutput(output: string, childAge: number): Promise<SafetyCheckResult> {
    const flags: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    // Check for inappropriate content in response
    const contentCheck = this.checkInappropriateContent(output);
    if (contentCheck.found) {
      flags.push('inappropriate_content');
      severity = 'high';
    }

    // Check for external links (should not provide direct URLs to children)
    const linkCheck = this.checkExternalLinks(output);
    if (linkCheck.found) {
      flags.push('external_links');
      severity = 'medium';
    }

    // Verify educational value
    const eduCheck = this.verifyEducationalValue(output, childAge);
    if (!eduCheck.passed) {
      flags.push('low_educational_value');
      severity = 'low';
    }

    // Check for age-appropriate language
    const languageCheck = this.checkLanguageComplexity(output, childAge);
    if (!languageCheck.appropriate) {
      flags.push('language_too_complex');
      severity = 'low';
    }

    return {
      passed: flags.length === 0 || severity === 'low',
      flags,
      severity,
      blockedReason: flags.length > 0 ? this.getBlockedMessage(flags) : undefined,
    };
  }

  // PII Detection
  detectPII(text: string): PIIDetectionResult {
    const found: string[] = [];
    let sanitizedText = text;

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        found.push(type);
        // Reset again before replace
        pattern.lastIndex = 0;
        sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
      }
    }

    return {
      found: found.length > 0,
      types: found,
      sanitizedText,
    };
  }

  // Profanity check
  private checkProfanity(text: string): { found: boolean; words: string[] } {
    const lowerText = text.toLowerCase();
    const found = PROFANITY_LIST.filter(word =>
      lowerText.includes(word.toLowerCase())
    );

    return {
      found: found.length > 0,
      words: found,
    };
  }

  // Check for inappropriate topics
  private checkInappropriateTopics(
    text: string,
    childAge: number
  ): { inappropriate: boolean; topics: string[] } {
    const flaggedTopics: string[] = [];

    for (const pattern of INAPPROPRIATE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        flaggedTopics.push(pattern.source.substring(0, 20));
      }
    }

    return {
      inappropriate: flaggedTopics.length > 0,
      topics: flaggedTopics,
    };
  }

  // Check for jailbreak/manipulation attempts
  private checkJailbreakAttempt(text: string): { found: boolean } {
    return {
      found: JAILBREAK_PATTERNS.some(pattern => {
        pattern.lastIndex = 0;
        return pattern.test(text);
      }),
    };
  }

  // Check for inappropriate content in AI response
  private checkInappropriateContent(text: string): { found: boolean } {
    const profanityCheck = this.checkProfanity(text);
    const topicCheck = this.checkInappropriateTopics(text, 12);

    return {
      found: profanityCheck.found || topicCheck.inappropriate,
    };
  }

  // Check for external links
  private checkExternalLinks(text: string): { found: boolean; links: string[] } {
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const links = text.match(urlPattern) || [];

    return {
      found: links.length > 0,
      links,
    };
  }

  // Verify educational value
  private verifyEducationalValue(
    text: string,
    childAge: number
  ): { passed: boolean; reason?: string } {
    // Check if response is too short to be educational
    if (text.length < 20) {
      return { passed: false, reason: 'Response too short' };
    }

    // Check if response contains educational keywords
    const educationalKeywords = [
      'learn', 'because', 'reason', 'explain', 'understand',
      'remember', 'important', 'means', 'example', 'think',
      'try', 'practice', 'help', 'let\'s', 'together',
      'great', 'good', 'well done', 'exactly', 'correct',
    ];

    const hasEducationalContent = educationalKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );

    return { passed: hasEducationalContent };
  }

  // Check language complexity
  private checkLanguageComplexity(
    text: string,
    childAge: number
  ): { appropriate: boolean; complexity: number } {
    // Calculate average word length as a proxy for complexity
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Calculate average sentence length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);

    // Age-appropriate thresholds
    const maxAvgWordLength = childAge <= 6 ? 5 : childAge <= 9 ? 6 : 7;
    const maxAvgSentenceLength = childAge <= 6 ? 10 : childAge <= 9 ? 15 : 20;

    const appropriate =
      avgWordLength <= maxAvgWordLength &&
      avgSentenceLength <= maxAvgSentenceLength;

    return {
      appropriate,
      complexity: Math.round((avgWordLength / maxAvgWordLength) * 100),
    };
  }

  // Sanitize output (remove links, simplify language if needed)
  sanitizeOutput(text: string, childAge: number): string {
    let sanitized = text;

    // Remove URLs
    sanitized = sanitized.replace(/(https?:\/\/[^\s]+)/gi, '[website removed]');

    // Remove email addresses
    sanitized = sanitized.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[email removed]'
    );

    // Check complexity - in production, could use a simplification service
    const complexityCheck = this.checkLanguageComplexity(sanitized, childAge);
    if (!complexityCheck.appropriate) {
      console.warn('Response may be too complex for age:', childAge);
    }

    return sanitized;
  }

  private getBlockedMessage(flags: string[]): string {
    const messages: Record<string, string> = {
      profanity: "Let's use kind and friendly words when we talk! Can you try asking that in a different way?",
      pii_detected: "Oops! We should never share personal information like phone numbers, addresses, or full names. Let's keep that private and safe!",
      inappropriate_topic: "That's not something I can help with, but I'd love to help you learn something cool instead! What subject are you curious about?",
      manipulation_attempt: "Let's focus on learning together! I'm Ollie, your learning buddy. What would you like to study today?",
      inappropriate_content: "I can't show you that, but let me find something better for you!",
      external_links: "I'll explain it to you instead of sending you to another website!",
      message_too_long: "That's a really long message! Can you break it into smaller questions? I'd love to help you one step at a time.",
      low_educational_value: "Let me give you a more helpful answer...",
      language_too_complex: "Let me explain that in simpler words...",
    };

    // Return the first relevant message
    for (const flag of flags) {
      if (messages[flag]) {
        return messages[flag];
      }
    }

    return "Let's try a different question! I'm here to help you learn.";
  }
}

// Export singleton instance
const safetyFilters = new SafetyFilters();
export default safetyFilters;
export { SafetyFilters };
