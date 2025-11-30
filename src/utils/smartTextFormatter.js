/**
 * Smart Text Formatter
 * Intelligently formats plain text into structured HTML
 * Detects headers, lists, paragraphs, and educational content patterns
 *
 * IMPORTANT: This formatter handles text that may have lost its line breaks
 * during PDF/image extraction. It first restores logical structure, then formats.
 */

/**
 * Patterns for inserting line breaks (text that should start on a new line)
 */
const LINE_BREAK_PATTERNS = [
  // Page markers
  /(\[Page\s*\d+\])/gi,

  // Section headers - these should start on new lines
  /((?:Learning Objectives?|Prerequisites?|Key Concepts?|Summary|Introduction|Overview|Conclusion|Review|Materials?|Vocabulary|Definitions?|Formula|Rules?|Examples?|Practice|Exercises?|Problems?|Activities?|Steps?|Procedure|Instructions?|Note|Tip|Remember|Important|Warning):)/gi,

  // Numbered patterns - Step 1:, Example 1:, etc.
  /((?:Step|Example|Part|Section|Chapter|Lesson|Problem|Question|Exercise|Activity|Set)\s*\d+\s*[:.)]\s*)/gi,

  // Bullet points
  /(•\s*)/g,

  // Grade/Subject/Duration metadata
  /((?:Grade Level|Subject|Topic|Duration|Time|Prerequisites?):\s*)/gi,

  // "The [Something] Rule/Formula/Method" patterns
  /(The\s+(?:Simple\s+)?(?:Rule|Formula|Method|Steps?|Key|Basic|Main)\s+(?:for|of|to)\s+)/gi,

  // Question starters after periods
  /(\.\s*)(What\s+(?:is|are|does|do|happens?)|How\s+(?:do|does|can|to)|Why\s+(?:do|does|is|are)|When\s+(?:do|does|should))/gi,

  // "Answer:" pattern
  /(Answer:\s*)/gi,

  // "Tip:" or "Note:" inline
  /((?:Tip|Note|Hint|Remember):\s*)/gi,
];

/**
 * Patterns for paragraph breaks (more significant breaks)
 */
const PARAGRAPH_BREAK_PATTERNS = [
  // Page markers get extra spacing
  /(\[Page\s*\d+\])/gi,

  // Major section headers
  /((?:Learning Objectives?|Prerequisites?|Key Concepts?|Summary|Introduction|Overview|Conclusion|Examples? to Master|More Examples?|Practice Problems?)(?::|$))/gi,
];

/**
 * Pattern definitions for educational content
 */
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
  bulletPoint: /^[\s]*[•\-\*\○\●\◦\▪\▸]\s*/,

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
  formatted = formatted.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:means?|is defined as|refers to|is when)/g,
    '<strong>$1</strong> $2');

  // Format mathematical expressions
  formatted = formatted.replace(/(\d+\/\d+)\s*[x×]\s*(\d+\/\d+)/g,
    '<code class="math">$1 × $2</code>');
  formatted = formatted.replace(/(\d+)\s*[x×]\s*(\d+)\s*=\s*(\d+)/g,
    '<code class="math">$1 × $2 = $3</code>');

  return formatted;
}

/**
 * Restore line breaks to text that lost them during extraction
 * This is critical for PDFs and images where text is often extracted as one long string
 */
function restoreLineBreaks(text) {
  if (!text) return '';

  let result = text;

  // First, normalize any existing multiple spaces to single space
  result = result.replace(/\s{2,}/g, ' ');

  // Insert paragraph breaks before major sections
  for (const pattern of PARAGRAPH_BREAK_PATTERNS) {
    result = result.replace(pattern, '\n\n$1');
  }

  // Insert line breaks before other patterns
  // Page markers
  result = result.replace(/(\[Page\s*\d+\])/gi, '\n\n$1\n');

  // Section headers that end with colon
  result = result.replace(/(Learning Objectives?|Prerequisites?|Key Concepts?|Summary|Introduction|Overview|Conclusion|Review|Vocabulary|Definitions?|Materials?):/gi, '\n\n$1:\n');

  // Numbered items: Step 1:, Example 1:, etc.
  result = result.replace(/(Step|Example|Part|Problem|Question|Exercise|Activity|Set)\s*(\d+)\s*:/gi, '\n\n$1 $2:\n');

  // Bullet points - insert newline before each bullet
  result = result.replace(/\s*•\s*/g, '\n• ');

  // "The [X] Rule/Formula for" patterns - new paragraph
  result = result.replace(/(The\s+(?:Simple\s+)?(?:Rule|Formula|Method|Steps?)\s+(?:for|of|to)\s+)/gi, '\n\n$1');

  // Metadata patterns
  result = result.replace(/(Grade Level|Subject|Topic|Duration|Time):\s*/gi, '\n$1: ');

  // Answer patterns
  result = result.replace(/\s*(Answer):\s*/gi, '\n$1: ');

  // Tip/Note patterns
  result = result.replace(/\s*(Tip|Note|Hint|Remember):\s*/gi, '\n\n$1: ');

  // Questions that follow a period (likely new sections)
  result = result.replace(/\.\s+(What Does It Mean|What is|How do you|How to|Why do|When should)/gi, '.\n\n$1');

  // "To multiply/divide/add" instruction starts
  result = result.replace(/\.\s+(To\s+(?:multiply|divide|add|subtract|solve|find|calculate))/gi, '.\n\n$1');

  // Clean up excessive newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace from each line
  result = result.split('\n').map(line => line.trim()).join('\n');

  return result.trim();
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
 */
export function formatEducationalText(text) {
  if (!text || typeof text !== 'string') return '';

  // Step 1: Check if text has reasonable line breaks already
  // If less than 1 newline per 500 chars, it probably needs line break restoration
  const newlineRatio = (text.match(/\n/g) || []).length / text.length;
  let processed = text;

  if (newlineRatio < 0.002) {
    // Text likely lost its line breaks during extraction - restore them
    processed = restoreLineBreaks(processed);
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
};
