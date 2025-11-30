/**
 * Smart Text Formatter
 * Intelligently formats plain text into structured HTML using heuristic-based analysis
 *
 * This formatter handles text that may have lost its line breaks during PDF/image extraction.
 * It uses statistical analysis and pattern recognition to restore logical structure.
 */

// ============================================================================
// PHASE 1: TEXT ANALYSIS
// ============================================================================

/**
 * Analyze text to understand its structure and determine formatting needs
 */
function analyzeText(text) {
  if (!text) return { needsRestoration: false };

  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;

  // Detect content patterns
  const hasBullets = /[•·∙‣⁃○●◦▪▸]/.test(text);
  const hasPageMarkers = /\[Page\s*\d+\]/i.test(text);
  const hasMetadata = /(Grade Level|Subject|Topic|Duration):/i.test(text);
  const hasNumberedSteps = /(Step|Example|Problem)\s*\d+/i.test(text);
  const hasEducationalKeywords = /(Learning Objectives?|Prerequisites?|Key Concepts?|Summary|Vocabulary)/i.test(text);

  // Calculate newline ratio to determine if restoration is needed
  const newlineCount = (text.match(/\n/g) || []).length;
  const newlineRatio = text.length > 0 ? newlineCount / text.length : 0;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength,
    hasBullets,
    hasPageMarkers,
    hasMetadata,
    hasNumberedSteps,
    hasEducationalKeywords,
    newlineRatio,
    needsRestoration: newlineRatio < 0.002 && text.length > 100
  };
}

// ============================================================================
// PHASE 2: INTELLIGENT SENTENCE BOUNDARY DETECTION
// ============================================================================

/**
 * Detect sentence boundaries using multiple signals with confidence scores
 */
function detectSentenceBoundaries(text) {
  const boundaries = [];

  // Signal 1: Period/!/? followed by capital letter (high confidence)
  const sentenceEndPattern = /([.!?])\s+([A-Z])/g;
  let match;
  while ((match = sentenceEndPattern.exec(text)) !== null) {
    boundaries.push({
      index: match.index,
      punctuation: match[1],
      confidence: 0.85,
      type: 'sentence'
    });
  }

  // Signal 2: Transition phrases indicate new paragraphs
  const transitions = [
    'For example', 'Remember', 'Note that', 'In other words',
    'Therefore', 'However', 'First,', 'Second,', 'Third,', 'Finally,',
    'Next,', 'Then,', 'Also,', 'Additionally', 'The key', 'The simple',
    'Think about', "Let's", 'Now,', "Here's", 'To summarize'
  ];

  transitions.forEach(phrase => {
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`([.!?])\\s*(${escapedPhrase})`, 'gi');
    let transMatch;
    while ((transMatch = regex.exec(text)) !== null) {
      boundaries.push({
        index: transMatch.index,
        punctuation: transMatch[1],
        confidence: 0.9,
        type: 'paragraph'
      });
    }
  });

  // Signal 3: Educational section keywords (highest confidence)
  const sections = [
    'Learning Objectives?', 'Prerequisites?', 'Key Concepts?', 'Summary',
    'Introduction', 'Overview', 'Conclusion', 'Examples?', 'Practice',
    'Exercises?', 'Vocabulary', 'Formula', 'Rules?', 'Definitions?',
    'Materials?', 'Procedure', 'Steps?', 'Review', 'Assessment'
  ];

  sections.forEach(section => {
    // Match section at start of text or after punctuation
    const regex = new RegExp(`([.!?]|^)\\s*(${section})\\s*[:•\\-]?`, 'gi');
    let sectionMatch;
    while ((sectionMatch = regex.exec(text)) !== null) {
      boundaries.push({
        index: sectionMatch.index,
        confidence: 0.95,
        type: 'section',
        sectionName: sectionMatch[2]
      });
    }
  });

  // Signal 4: Question patterns (What is, How do, Why does, etc.)
  const questionStarters = /([.!?])\s*(What\s+(?:is|are|does|do)|How\s+(?:do|does|can|to)|Why\s+(?:do|does|is|are)|When\s+(?:do|does|should))/gi;
  while ((match = questionStarters.exec(text)) !== null) {
    boundaries.push({
      index: match.index,
      punctuation: match[1],
      confidence: 0.88,
      type: 'question'
    });
  }

  return boundaries;
}

// ============================================================================
// PHASE 3: HEADER DETECTION USING HEURISTICS
// ============================================================================

/**
 * Find potential headers in the text using title-case detection and context analysis
 */
function findHeaderCandidates(text) {
  const candidates = [];

  // Pattern: Title Case phrases (2-6 capitalized words)
  const titleCasePattern = /([A-Z][a-z]+(?:\s+(?:the|a|an|of|to|for|and|or|in|on|at|by|with|is|are)\s+)?(?:[A-Z][a-z]+\s*){1,5})/g;
  let match;

  while ((match = titleCasePattern.exec(text)) !== null) {
    const phrase = match[1].trim();
    const afterPhrase = text.slice(match.index + phrase.length, match.index + phrase.length + 200);
    const beforePhrase = text.slice(Math.max(0, match.index - 50), match.index);

    // Skip if too long or too short
    if (phrase.length > 60 || phrase.length < 5) continue;

    // Calculate header score
    const score = calculateHeaderScore(phrase, afterPhrase, beforePhrase);

    if (score > 0.6) {
      candidates.push({
        text: phrase,
        index: match.index,
        score,
        afterText: afterPhrase.substring(0, 50)
      });
    }
  }

  // Remove overlapping candidates (keep highest scoring)
  return deduplicateCandidates(candidates);
}

/**
 * Calculate a confidence score for whether a phrase is likely a header
 */
function calculateHeaderScore(phrase, afterText, beforeText) {
  let score = 0.4;

  // Boost: Ends with common header suffixes
  if (/(?:Rule|Formula|Method|Concept|Steps?|Principle|Definition|Theorem|Law)$/i.test(phrase)) {
    score += 0.25;
  }

  // Boost: Known educational terms
  if (/(?:Objectives?|Examples?|Practice|Review|Summary|Prerequisites?|Introduction|Conclusion|Vocabulary|Assessment)/i.test(phrase)) {
    score += 0.35;
  }

  // Boost: Starts with "The [Something]" pattern
  if (/^The\s+[A-Z]/i.test(phrase)) {
    score += 0.1;
  }

  // Boost: Followed by bullet points
  if (/^\s*[•·∙‣⁃○●◦▪▸\-\*]/.test(afterText)) {
    score += 0.25;
  }

  // Boost: Followed by colon
  if (/^:/.test(afterText)) {
    score += 0.2;
  }

  // Boost: Preceded by period, exclamation, or start of text
  if (/[.!?]\s*$/.test(beforeText) || beforeText.trim() === '') {
    score += 0.15;
  }

  // Boost: Followed by lowercase explanatory text
  if (/^\s*[a-z]/.test(afterText) || /^[:\s]+[A-Z][a-z]/.test(afterText)) {
    score += 0.1;
  }

  // Penalty: Too long
  if (phrase.length > 45) score -= 0.15;

  // Penalty: Contains lowercase words (except common articles)
  const words = phrase.split(/\s+/);
  const articles = ['a', 'an', 'the', 'of', 'to', 'for', 'and', 'or', 'in', 'on', 'at', 'by', 'with', 'is', 'are'];
  const lowercaseNonArticles = words.filter(w =>
    /^[a-z]/.test(w) && !articles.includes(w.toLowerCase())
  ).length;
  score -= lowercaseNonArticles * 0.1;

  // Penalty: Looks like a regular sentence (ends with common verbs)
  if (/\s+(?:is|are|was|were|have|has|had|will|would|can|could)$/i.test(phrase)) {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Remove overlapping header candidates, keeping the highest scoring ones
 */
function deduplicateCandidates(candidates) {
  if (candidates.length === 0) return [];

  // Sort by score descending
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const kept = [];

  sorted.forEach(candidate => {
    // Check if this candidate overlaps with any already-kept candidate
    const overlaps = kept.some(k =>
      (candidate.index >= k.index && candidate.index < k.index + k.text.length) ||
      (k.index >= candidate.index && k.index < candidate.index + candidate.text.length)
    );

    if (!overlaps) {
      kept.push(candidate);
    }
  });

  return kept;
}

// ============================================================================
// MAIN FORMATTING FUNCTIONS
// ============================================================================

/**
 * Smart line break restoration using heuristic analysis
 */
function restoreLineBreaksSmart(text) {
  if (!text) return '';

  // Phase 1: Analyze
  const analysis = analyzeText(text);
  if (!analysis.needsRestoration) return text;

  let result = text;

  // Normalize whitespace first (but preserve single spaces)
  result = result.replace(/\s+/g, ' ').trim();

  // Phase 2: Detect boundaries and insert breaks
  const boundaries = detectSentenceBoundaries(result);

  // Sort boundaries by index descending (to insert from end, preserving indices)
  boundaries.sort((a, b) => b.index - a.index);

  // Track which indices we've already processed
  const processedRanges = new Set();

  boundaries.forEach(boundary => {
    // Skip if already processed nearby
    const rangeKey = Math.floor(boundary.index / 10);
    if (processedRanges.has(rangeKey)) return;

    if (boundary.confidence > 0.7) {
      let insertPoint = boundary.index;

      // Find the actual punctuation position
      if (boundary.punctuation) {
        insertPoint = result.indexOf(boundary.punctuation, boundary.index);
        if (insertPoint === -1) insertPoint = boundary.index;
        else insertPoint += 1; // Insert after punctuation
      }

      if (insertPoint > 0 && insertPoint < result.length) {
        const breakType = boundary.type === 'section' ? '\n\n\n' :
                          boundary.type === 'paragraph' ? '\n\n' :
                          boundary.type === 'question' ? '\n\n' : '\n';

        result = result.slice(0, insertPoint) + breakType + result.slice(insertPoint).trimStart();
        processedRanges.add(rangeKey);
      }
    }
  });

  // Phase 3: Handle specific patterns that always need breaks

  // Page markers - high priority
  result = result.replace(/\s*(\[Page\s*\d+\])\s*/gi, '\n\n$1\n\n');

  // Bullets (all Unicode variants) - must start on new lines
  result = result.replace(/\s*([•·∙‣⁃○●◦▪▸])\s*/g, '\n$1 ');

  // Hyphen bullets after sentences
  result = result.replace(/([.!?])\s*-\s+([A-Z])/g, '$1\n- $2');

  // Numbered lists (1. 2. a. b. etc.)
  result = result.replace(/\s+(\d+[.)]\s+)([A-Z])/g, '\n$1$2');
  result = result.replace(/\s+([a-z][.)]\s+)([A-Z])/g, '\n$1$2');

  // Metadata fields - each on its own line
  result = result.replace(/(Grade Level:\s*[^:]+?)(?=\s+(?:Subject|Topic|Duration|Time|Prerequisites?):)/gi, '$1\n');
  result = result.replace(/(Subject:\s*[^:]+?)(?=\s+(?:Grade Level|Topic|Duration|Time|Prerequisites?):)/gi, '$1\n');
  result = result.replace(/(Topic:\s*[^:]+?)(?=\s+(?:Grade Level|Subject|Duration|Time|Prerequisites?):)/gi, '$1\n');
  result = result.replace(/(Duration:\s*[^:]+?)(?=\s+(?:Grade Level|Subject|Topic|Time|Prerequisites?):)/gi, '$1\n');
  result = result.replace(/(Prerequisites?:\s*[^:]+?)(?=\s+(?:Grade Level|Subject|Topic|Duration|Time|Learning):)/gi, '$1\n');

  // Step/Example/Problem patterns
  result = result.replace(/\s+(Step\s+\d+)\s*:/gi, '\n\n$1:');
  result = result.replace(/\s+(Example\s+\d+)\s*:/gi, '\n\n$1:');
  result = result.replace(/\s+(Problem\s+\d+)\s*:/gi, '\n\n$1:');
  result = result.replace(/\s+(Part\s+\d+)\s*:/gi, '\n\n$1:');

  // Section headers followed by content
  const sectionHeaders = [
    'Learning Objectives?', 'Prerequisites?', 'Key Concepts?', 'Summary',
    'Introduction', 'Overview', 'Conclusion', 'Review', 'Vocabulary',
    'Materials?', 'Procedure', 'Assessment', 'Practice', 'Exercises?'
  ];
  sectionHeaders.forEach(header => {
    const regex = new RegExp(`([.!?]|^)\\s*(${header})\\s*([•\\-:]?)`, 'gi');
    result = result.replace(regex, '$1\n\n$2$3');
  });

  // "The [Something] Rule/Formula" patterns
  result = result.replace(/([.!?])\s+(The\s+(?:Simple\s+)?(?:Rule|Formula|Method|Key|Basic)\s+(?:for|of|to)\s+[A-Z])/gi, '$1\n\n$2');

  // Phase 4: Clean up
  result = result.replace(/\n{4,}/g, '\n\n\n'); // Max 3 newlines
  result = result.replace(/^\n+/, ''); // Remove leading newlines
  result = result.replace(/\n+$/, ''); // Remove trailing newlines

  // Trim each line and remove empty lines in sequences
  result = result.split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Convert string to Title Case
 */
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format inline text (bold, italic, formulas)
 */
function formatInlineText(text) {
  let formatted = escapeHtml(text);

  // Bold text in asterisks: *bold* or **bold**
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

  // Highlight key terms (words followed by definition pattern)
  // FIX: Changed non-capturing group to capturing group for $2
  formatted = formatted.replace(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(means?|is defined as|refers to|is when)/g,
    '<strong>$1</strong> $2'
  );

  // Format mathematical expressions
  formatted = formatted.replace(/(\d+\/\d+)\s*[x×]\s*(\d+\/\d+)/g,
    '<code class="math">$1 × $2</code>');
  formatted = formatted.replace(/(\d+)\s*[x×]\s*(\d+)\s*=\s*(\d+)/g,
    '<code class="math">$1 × $2 = $3</code>');
  formatted = formatted.replace(/(\d+\/\d+)\s*=\s*(\d+\/\d+)/g,
    '<code class="math">$1 = $2</code>');

  return formatted;
}

// ============================================================================
// PATTERN DEFINITIONS
// ============================================================================

const PATTERNS = {
  // Page markers: [Page 1], [Page 2], etc.
  pageMarker: /\[Page\s*(\d+)\]/gi,

  // Section headers (common educational patterns)
  sectionHeaders: [
    /^(Learning Objectives?|Objectives?|Goals?):?\s*$/i,
    /^(Prerequisites?|Requirements?|Before You Begin):?\s*$/i,
    /^(Key Concepts?|Important Concepts?|Main Ideas?):?\s*$/i,
    /^(Summary|Conclusion|Review|Recap):?\s*$/i,
    /^(Introduction|Overview|Background):?\s*$/i,
    /^(Examples?|Practice|Exercises?|Problems?|Activities?):?\s*$/i,
    /^(Steps?|Procedure|Instructions?|How To):?\s*$/i,
    /^(Definition|Formula|Rule|Theorem|Law):?\s*$/i,
    /^(Note|Tip|Remember|Important|Warning|Caution):?\s*$/i,
    /^(Materials?|Supplies|What You Need):?\s*$/i,
  ],

  // Inline headers: "Key Concept:", "Example 1:", "The Simple Rule for..."
  inlineHeader: /^([A-Z][A-Za-z\s]{2,40}(?:[:.]|\s+for\s+|\s+of\s+|\s+to\s+))/,

  // Numbered headers: "1.", "2.", "Example 1:", "Step 1:"
  numberedHeader: /^((?:Step|Example|Part|Section|Chapter|Lesson|Unit|Question|Problem|Exercise)\s*\d+)\s*[:.)]\s*/i,

  // ALL CAPS headers (at least 3 words)
  allCapsHeader: /^([A-Z][A-Z\s]{5,})$/,

  // Title case headers (short lines that look like titles)
  titleCaseHeader: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5})\s*$/,

  // Bullet points
  bulletPoint: /^[\s]*[•·∙‣⁃○●◦▪▸\-\*]\s*/,

  // Numbered list items
  numberedList: /^[\s]*(\d+)[.)]\s+/,

  // Lettered list items
  letteredList: /^[\s]*([a-zA-Z])[.)]\s+/,

  // Step patterns: "Step 1:", "Step 2:", etc.
  stepPattern: /^(Step\s*\d+)\s*[:.)]\s*/i,

  // Formula patterns: "a/b x c/d = (a x c) / (b x d)"
  formulaPattern: /[=×÷+\-*/]\s*[(\[{]?[a-zA-Z0-9/]+[)\]}]?\s*[=×÷+\-*/]/,

  // Question patterns
  questionPattern: /^(What|Why|How|When|Where|Which|Who|Can|Do|Does|Is|Are|Will|Would|Should|Could)\s+.+\?$/i,

  // Duration/time patterns
  durationPattern: /(?:Duration|Time|Length):\s*[\d\-]+\s*(?:minutes?|mins?|hours?|hrs?)/i,

  // Grade level patterns
  gradeLevelPattern: /(?:Grade|Level|Year)(?:\s*Level)?:\s*(?:K|\d+)(?:st|nd|rd|th)?(?:\s*Grade)?/i,

  // Subject patterns
  subjectPattern: /(?:Subject|Topic|Course):\s*[A-Za-z\s]+/i,
};

/**
 * Detect if a line is a header
 */
function isHeader(line, nextLine = '') {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return false;

  // Check section headers
  for (const pattern of PATTERNS.sectionHeaders) {
    if (pattern.test(trimmed)) return { type: 'h2', text: trimmed.replace(/:$/, '') };
  }

  // Check ALL CAPS (likely major header)
  if (PATTERNS.allCapsHeader.test(trimmed) && trimmed.length > 5) {
    return { type: 'h2', text: toTitleCase(trimmed) };
  }

  // Check numbered headers (Example 1:, Step 1:)
  const numberedMatch = trimmed.match(PATTERNS.numberedHeader);
  if (numberedMatch) {
    return { type: 'h3', text: trimmed };
  }

  // Check inline headers that end with colon
  if (trimmed.endsWith(':') && trimmed.length < 50 && /^[A-Z]/.test(trimmed)) {
    // Make sure it's not a list item
    if (!PATTERNS.bulletPoint.test(trimmed) && !PATTERNS.numberedList.test(trimmed)) {
      return { type: 'h3', text: trimmed.replace(/:$/, '') };
    }
  }

  // Check title case headers (short descriptive lines)
  if (PATTERNS.titleCaseHeader.test(trimmed) && trimmed.length < 40) {
    // Verify next line has content (not another header)
    if (nextLine && nextLine.trim().length > trimmed.length) {
      return { type: 'h3', text: trimmed };
    }
  }

  return false;
}

/**
 * Detect if a line is a list item
 */
function isListItem(line) {
  const trimmed = line.trim();

  if (PATTERNS.bulletPoint.test(trimmed)) {
    return { type: 'bullet', text: trimmed.replace(PATTERNS.bulletPoint, '') };
  }

  const numberedMatch = trimmed.match(PATTERNS.numberedList);
  if (numberedMatch) {
    return { type: 'numbered', number: numberedMatch[1], text: trimmed.replace(PATTERNS.numberedList, '') };
  }

  const letteredMatch = trimmed.match(PATTERNS.letteredList);
  if (letteredMatch) {
    return { type: 'lettered', letter: letteredMatch[1], text: trimmed.replace(PATTERNS.letteredList, '') };
  }

  return false;
}

/**
 * Process page markers and split content
 */
function processPageMarkers(text) {
  // Replace page markers with section dividers
  return text.replace(PATTERNS.pageMarker, '\n\n---PAGE $1---\n\n');
}

/**
 * Main formatting function
 * Uses smart heuristic-based line break restoration for better accuracy
 */
export function formatEducationalText(text) {
  if (!text || typeof text !== 'string') return '';

  // Step 1: Check if text has reasonable line breaks already
  // If less than 1 newline per 500 chars, it probably needs line break restoration
  const newlineRatio = (text.match(/\n/g) || []).length / text.length;
  let processed = text;

  if (newlineRatio < 0.002) {
    // Text likely lost its line breaks during extraction - use smart restoration
    processed = restoreLineBreaksSmart(processed);
  }

  // Step 2: Normalize line endings and handle page markers
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  processed = processPageMarkers(processed);

  // Split into lines
  const lines = processed.split('\n');
  const result = [];
  let currentParagraph = [];
  let inList = false;
  let listType = null;
  let listItems = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        result.push(`<p>${formatInlineText(text)}</p>`);
      }
      currentParagraph = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      const tag = listType === 'numbered' || listType === 'lettered' ? 'ol' : 'ul';
      const items = listItems.map(item => `<li>${formatInlineText(item)}</li>`).join('\n');
      result.push(`<${tag}>\n${items}\n</${tag}>`);
      listItems = [];
      inList = false;
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    const trimmed = line.trim();

    // Skip empty lines (but they might end a paragraph)
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    // Check for page dividers
    if (trimmed.match(/^---PAGE\s*(\d+)---$/)) {
      flushList();
      flushParagraph();
      const pageNum = trimmed.match(/(\d+)/)[1];
      result.push(`<div class="page-break" data-page="${pageNum}"><span class="page-marker">Page ${pageNum}</span></div>`);
      continue;
    }

    // Check for headers
    const header = isHeader(trimmed, nextLine);
    if (header) {
      flushList();
      flushParagraph();
      result.push(`<${header.type} class="lesson-header">${escapeHtml(header.text)}</${header.type}>`);
      continue;
    }

    // Check for list items
    const listItem = isListItem(trimmed);
    if (listItem) {
      flushParagraph();

      // Check if we need to start a new list type
      if (inList && listType !== listItem.type) {
        flushList();
      }

      inList = true;
      listType = listItem.type;
      listItems.push(listItem.text);
      continue;
    }

    // If we were in a list but this line isn't a list item, flush the list
    if (inList) {
      flushList();
    }

    // Check for questions (format them specially)
    if (PATTERNS.questionPattern.test(trimmed)) {
      flushParagraph();
      result.push(`<p class="question"><strong>${formatInlineText(trimmed)}</strong></p>`);
      continue;
    }

    // Check for metadata lines (Grade Level:, Subject:, Duration:)
    if (PATTERNS.gradeLevelPattern.test(trimmed) ||
        PATTERNS.subjectPattern.test(trimmed) ||
        PATTERNS.durationPattern.test(trimmed)) {
      flushParagraph();
      result.push(`<p class="metadata">${formatInlineText(trimmed)}</p>`);
      continue;
    }

    // Regular text - add to current paragraph
    currentParagraph.push(trimmed);
  }

  // Flush any remaining content
  flushList();
  flushParagraph();

  return result.join('\n');
}

/**
 * Quick format for simpler cases
 * Converts basic text with line breaks to HTML
 */
export function quickFormat(text) {
  if (!text) return '';

  // Check if it's already HTML
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  // Use the full formatter
  return formatEducationalText(text);
}

/**
 * CSS styles for formatted content
 * Include these in your stylesheet or as a style tag
 */
export const formatterStyles = `
  .lesson-content h2.lesson-header {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a365d;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .lesson-content h3.lesson-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .lesson-content .page-break {
    margin: 2rem 0;
    padding: 0.5rem;
    text-align: center;
    border-top: 1px dashed #cbd5e0;
  }

  .lesson-content .page-marker {
    background: #edf2f7;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #718096;
  }

  .lesson-content ul, .lesson-content ol {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .lesson-content li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .lesson-content p {
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  .lesson-content .question {
    background: #f0f9ff;
    padding: 0.75rem 1rem;
    border-left: 4px solid #3182ce;
    border-radius: 0.25rem;
    margin: 1rem 0;
  }

  .lesson-content .metadata {
    font-size: 0.875rem;
    color: #718096;
    background: #f7fafc;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    display: inline-block;
    margin: 0.25rem 0;
  }

  .lesson-content code.math {
    font-family: 'Courier New', monospace;
    background: #fef3c7;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-weight: 600;
  }
`;

export default {
  formatEducationalText,
  quickFormat,
  formatterStyles,
  // Export analysis functions for testing/debugging
  analyzeText,
  detectSentenceBoundaries,
  findHeaderCandidates,
  restoreLineBreaksSmart,
};
