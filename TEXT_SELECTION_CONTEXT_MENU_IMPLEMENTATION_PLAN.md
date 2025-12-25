# Text Selection & Context Menu Implementation Plan
## Interactive "Select → Ask Ollie" Feature for PDF/Content Pages

**Document Version**: 1.0  
**Last Updated**: November 25, 2024  
**Status**: Ready for Implementation  
**Priority**: P1 (Core Learning Loop)

---

## 1. Feature Overview

### 1.1 Purpose
Enable children to select any text within lesson content (PDFs, articles, generated content) and interact with it through age-appropriate actions. This creates an active learning experience where curiosity is immediately rewarded with AI-powered explanations, practice opportunities, and content generation.

### 1.2 Core User Flow

```
1. Child reads content in Lesson Viewer
2. Child long-presses or selects text with their finger
3. Selected text highlights in bright yellow with sparkle animation
4. Ollie's avatar appears with context menu floating above selection
5. Child taps an action (Ask, Flashcard, Quiz, Save, Read Aloud)
6. Action executes with immediate feedback (animation + sound)
7. Result displays (Ollie answers, flashcard created, etc.)
8. XP awarded, streak updated
9. Menu dismisses, child continues reading
```

### 1.3 Key Success Metrics
- **Engagement**: 60% of children use "Ask Ollie" at least once per session
- **Learning Depth**: Average 3-5 interactions per lesson (indicates active reading)
- **Feature Discovery**: 80% of users discover the feature within first 2 lessons
- **Response Quality**: 95% of Ollie's answers rated appropriate by parents

---

## 2. Age-Appropriate Design Strategy

### 2.1 Age Groups & Interactions

#### **Tier 1: Ages 4-7 (Pre-readers & Emerging Readers)**
**Selection Method**:
- Tap-to-select individual words (no dragging required)
- "Read to Me" auto-triggers for any selection
- Adult helper mode: Larger targets, simplified menu

**Available Actions** (3 options max):
1. 🔊 **"Read to Me"** (default)
2. 🤔 **"What is this?"** (pre-set question to Ollie)
3. ⭐ **"Save"** (adds to favorites)

**Interaction Pattern**:
- No free-form questions
- Ollie responds with voice-first + simple illustration
- Menu stays open until explicitly dismissed (less accidental closes)

#### **Tier 2: Ages 8-12 (Fluent Readers)**
**Selection Method**:
- Standard tap-and-drag selection
- Swipe-to-select for full sentences
- "Select All in Box" button for entire paragraphs

**Available Actions** (5 options):
1. 🤔 **"Ask Ollie"** (free-form question)
2. 🎴 **"Make Flashcard"**
3. 🎮 **"Practice Quiz"**
4. ⭐ **"Save This"**
5. 🔊 **"Read to Me"**

**Interaction Pattern**:
- Can type custom questions to Ollie
- Menu includes "Challenge Me" quick action
- Access to "Find Similar" (cross-lesson connections)

### 2.2 Universal Design Principles
- **Touch Targets**: Minimum 56dp (not standard 44pt) for child motor skills
- **Haptic Feedback**: Vibration on selection start/end for tactile confirmation
- **Visual Feedback**: Immediate color change + particle effects
- **Error Forgiveness**: 15-second menu timeout (not instant dismissal)
- **Persistence**: "Ollie is thinking..." loaders, never silent failures

---

## 3. Component Architecture

### 3.1 Core Components

```typescript
// Component Hierarchy
<LessonContentViewer>
  └── <HighlightableContent>
        ├── <SelectionOverlay>
        │     ├── <SelectionHighlight />
        │     ├── <ParticleEffect />
        │     └── <SelectionHandles />
        ├── <ContextMenu>
        │     ├── <OllieAvatar />
        │     ├── <MenuActions />
        │     └── <QuickHints />
        └── <SelectionResultModal>
              ├── <OllieResponse />
              ├── <FlashcardPreview />
              └── <QuizPreview />
```

### 3.2 Component Specifications

#### **HighlightableContent.tsx**
```typescript
interface HighlightableContentProps {
  content: string; // Plain text or HTML content
  contentType: 'pdf' | 'html' | 'markdown';
  ageGroup: '4-7' | '8-12'; // Determines interaction complexity
  lessonId: string;
  onSelectionAction: (action: SelectionAction) => void;
}

interface SelectionAction {
  type: 'ask' | 'flashcard' | 'quiz' | 'save' | 'read';
  selectedText: string;
  selectionContext: {
    beforeText: string; // 50 chars before
    afterText: string;  // 50 chars after
    pageNumber?: number;
    timestamp: Date;
  };
  userQuestion?: string; // For "Ask Ollie" with custom question
}

const HighlightableContent: React.FC<HighlightableContentProps> = ({
  content,
  contentType,
  ageGroup,
  lessonId,
  onSelectionAction
}) => {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // Selection handlers
  const handleSelectionStart = (e: React.TouchEvent) => { /* ... */ };
  const handleSelectionChange = () => { /* ... */ };
  const handleSelectionEnd = () => { /* ... */ };
  
  // Menu positioning (above selection, centered)
  const calculateMenuPosition = (range: Range) => { /* ... */ };
  
  // Auto-dismiss timer
  useEffect(() => {
    if (menuVisible) {
      const timer = setTimeout(() => {
        // Show Ollie reminder: "Still there?"
        setShowDismissPrompt(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [menuVisible]);
  
  return (
    <div 
      className="highlightable-content"
      onTouchStart={handleSelectionStart}
      onMouseUp={handleSelectionEnd}
    >
      {content}
      {menuVisible && (
        <ContextMenu
          position={menuPosition}
          selectedText={selection.text}
          ageGroup={ageGroup}
          onAction={handleAction}
        />
      )}
    </div>
  );
};
```

#### **ContextMenu.tsx**
```typescript
interface ContextMenuProps {
  position: { x: number; y: number };
  selectedText: string;
  ageGroup: '4-7' | '8-12';
  onAction: (action: SelectionAction) => void;
  onDismiss: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  selectedText,
  ageGroup,
  onAction,
  onDismiss
}) => {
  const actions = getAgeAppropriateActions(ageGroup);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  
  return (
    <motion.div
      className="context-menu"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ 
        position: 'absolute',
        left: position.x,
        top: position.y - 120, // Float above selection
        zIndex: 1000
      }}
    >
      {/* Ollie Avatar */}
      <div className="ollie-avatar">
        <img src="/assets/ollie-curious.png" alt="Ollie" />
        <motion.div
          className="speech-bubble"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          What do you want to do?
        </motion.div>
      </div>
      
      {/* Menu Actions */}
      <div className="menu-actions">
        {actions.map(action => (
          <MenuButton
            key={action.type}
            icon={action.icon}
            label={action.label}
            color={action.color}
            onClick={() => handleActionClick(action)}
          />
        ))}
      </div>
      
      {/* Question Input (Ages 8-12 only) */}
      {showQuestionInput && ageGroup === '8-12' && (
        <motion.div 
          className="question-input"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
        >
          <input
            type="text"
            placeholder="Ask Ollie anything..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitQuestion();
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Age-appropriate action configurations
const getAgeAppropriateActions = (ageGroup: string): MenuAction[] => {
  if (ageGroup === '4-7') {
    return [
      { 
        type: 'read', 
        icon: '🔊', 
        label: 'Read to Me', 
        color: '#FF6B6B',
        autoTrigger: true // Auto-triggers on selection
      },
      { 
        type: 'ask', 
        icon: '🤔', 
        label: 'What is this?', 
        color: '#4ECDC4',
        presetQuestion: "Can you explain this in simple words?"
      },
      { 
        type: 'save', 
        icon: '⭐', 
        label: 'Save', 
        color: '#FFD93D' 
      }
    ];
  }
  
  // Ages 8-12
  return [
    { type: 'ask', icon: '🤔', label: 'Ask Ollie', color: '#4ECDC4' },
    { type: 'flashcard', icon: '🎴', label: 'Make Flashcard', color: '#A259FF' },
    { type: 'quiz', icon: '🎮', label: 'Practice Quiz', color: '#FF6B6B' },
    { type: 'save', icon: '⭐', label: 'Save This', color: '#FFD93D' },
    { type: 'read', icon: '🔊', label: 'Read to Me', color: '#95E1D3' }
  ];
};
```

#### **MenuButton.tsx**
```typescript
interface MenuButtonProps {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ 
  icon, 
  label, 
  color, 
  onClick 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    
    // Play sound effect
    playSound('button-tap');
    
    onClick();
  };
  
  return (
    <motion.button
      className="menu-button"
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
      onClick={handleClick}
    >
      <span className="menu-button-icon">{icon}</span>
      <span className="menu-button-label">{label}</span>
    </motion.button>
  );
};
```

#### **SelectionResultModal.tsx**
```typescript
interface SelectionResultModalProps {
  action: SelectionAction;
  result: SelectionResult;
  onClose: () => void;
}

interface SelectionResult {
  type: 'ollie-response' | 'flashcard' | 'quiz';
  content: any;
  xpEarned: number;
  streakUpdated: boolean;
}

const SelectionResultModal: React.FC<SelectionResultModalProps> = ({
  action,
  result,
  onClose
}) => {
  const { addXP } = useGamification();
  
  useEffect(() => {
    // Award XP
    addXP(result.xpEarned, `${action.type}-selection`);
    
    // Track analytics
    trackEvent('selection_action_completed', {
      action_type: action.type,
      selected_text_length: action.selectedText.length,
      xp_earned: result.xpEarned
    });
  }, []);
  
  return (
    <motion.div
      className="selection-result-modal"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
    >
      {/* XP Celebration */}
      <XPGainAnimation xp={result.xpEarned} />
      
      {/* Result Content */}
      {result.type === 'ollie-response' && (
        <OllieResponseView
          question={action.userQuestion}
          answer={result.content.answer}
          selectedText={action.selectedText}
        />
      )}
      
      {result.type === 'flashcard' && (
        <FlashcardPreview
          flashcard={result.content}
          onAddToDeck={() => {/* Save to deck */}}
        />
      )}
      
      {result.type === 'quiz' && (
        <QuizPreview
          quiz={result.content}
          onStartQuiz={() => {/* Navigate to quiz */}}
        />
      )}
      
      {/* Continue Button */}
      <button 
        className="continue-button"
        onClick={onClose}
      >
        <span>Keep Reading</span>
        <span className="arrow">→</span>
      </button>
    </motion.div>
  );
};
```

---

## 4. Data Models

### 4.1 Selection Data Schema

```typescript
interface TextSelection {
  id: string; // UUID
  userId: string;
  lessonId: string;
  selectedText: string;
  selectionContext: {
    beforeText: string;
    afterText: string;
    pageNumber?: number;
    sectionTitle?: string;
  };
  action: SelectionActionType;
  userQuestion?: string;
  result: SelectionResultData;
  timestamp: Date;
  ageGroup: '4-7' | '8-12';
}

type SelectionActionType = 'ask' | 'flashcard' | 'quiz' | 'save' | 'read';

interface SelectionResultData {
  actionType: SelectionActionType;
  
  // For "Ask Ollie"
  ollieResponse?: {
    answer: string;
    confidence: number;
    safetyCheckPassed: boolean;
    voiceAudioUrl?: string; // Pre-generated TTS
  };
  
  // For "Make Flashcard"
  flashcard?: {
    front: string;
    back: string;
    imageUrl?: string;
    deckId?: string; // If added to existing deck
  };
  
  // For "Practice Quiz"
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  
  // For "Save"
  savedItem?: {
    collectionId: string;
    tags: string[];
  };
  
  xpAwarded: number;
  processingTime: number; // For analytics
}
```

### 4.2 Database Schema (PostgreSQL)

```sql
-- Text selections table
CREATE TABLE text_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  selected_text TEXT NOT NULL,
  before_context TEXT,
  after_context TEXT,
  page_number INTEGER,
  section_title TEXT,
  action_type VARCHAR(50) NOT NULL,
  user_question TEXT,
  result_data JSONB NOT NULL,
  age_group VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for analytics queries
  INDEX idx_user_selections (user_id, created_at),
  INDEX idx_lesson_selections (lesson_id, action_type),
  INDEX idx_action_type (action_type)
);

-- Saved selections (for "Save This" action)
CREATE TABLE saved_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  selection_id UUID NOT NULL REFERENCES text_selections(id),
  collection_name VARCHAR(255) DEFAULT 'My Saves',
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, selection_id)
);

-- Analytics tracking
CREATE TABLE selection_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Integration Layer

### 5.1 Backend Endpoints

#### **POST /api/selections/ask-ollie**
Handle "Ask Ollie" action with text selection.

```typescript
// Request
interface AskOllieRequest {
  userId: string;
  lessonId: string;
  selectedText: string;
  selectionContext: {
    beforeText: string;
    afterText: string;
    pageNumber?: number;
  };
  userQuestion?: string; // Optional, for ages 8-12
  ageGroup: '4-7' | '8-12';
}

// Response
interface AskOllieResponse {
  selectionId: string;
  answer: string;
  voiceAudioUrl?: string; // Pre-generated TTS for "Read to Me"
  confidence: number;
  relatedTopics?: string[];
  xpAwarded: number;
  safetyCheckPassed: boolean;
}

// Implementation
router.post('/selections/ask-ollie', async (req, res) => {
  const { userId, selectedText, userQuestion, ageGroup } = req.body;
  
  try {
    // 1. Safety check on selected text + question
    const safetyCheck = await contentFilter.check({
      text: selectedText,
      userInput: userQuestion
    });
    
    if (!safetyCheck.passed) {
      return res.status(400).json({
        error: 'Content requires parent approval',
        requiresReview: true
      });
    }
    
    // 2. Build context-aware prompt for Gemini
    const prompt = buildOlliePrompt({
      selectedText,
      selectionContext: req.body.selectionContext,
      userQuestion,
      ageGroup
    });
    
    // 3. Call Gemini API
    const geminiResponse = await geminiClient.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings: CHILD_SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: ageGroup === '4-7' ? 150 : 300
      }
    });
    
    const answer = geminiResponse.response.text();
    
    // 4. Generate TTS audio (for "Read to Me")
    const audioUrl = await generateTTS({
      text: answer,
      voice: 'ollie-friendly',
      language: 'en'
    });
    
    // 5. Award XP
    const xpAwarded = 5; // Base XP for asking
    await gamificationService.awardXP(userId, xpAwarded, 'ask-ollie');
    
    // 6. Store selection in database
    const selection = await db.textSelections.create({
      userId,
      lessonId: req.body.lessonId,
      selectedText,
      actionType: 'ask',
      resultData: {
        ollieResponse: { answer, confidence: 0.85, voiceAudioUrl: audioUrl }
      },
      ageGroup
    });
    
    // 7. Track analytics
    await analytics.track({
      event: 'text_selection_ask',
      userId,
      properties: {
        selectionLength: selectedText.length,
        hasCustomQuestion: !!userQuestion,
        ageGroup,
        processingTime: Date.now() - startTime
      }
    });
    
    res.json({
      selectionId: selection.id,
      answer,
      voiceAudioUrl: audioUrl,
      confidence: 0.85,
      xpAwarded,
      safetyCheckPassed: true
    });
    
  } catch (error) {
    console.error('Ask Ollie error:', error);
    res.status(500).json({ 
      error: 'Ollie had trouble answering. Try again!' 
    });
  }
});
```

#### **POST /api/selections/create-flashcard**
Generate flashcard from selected text.

```typescript
interface CreateFlashcardRequest {
  userId: string;
  lessonId: string;
  selectedText: string;
  selectionContext: {
    beforeText: string;
    afterText: string;
  };
  deckId?: string; // Optional: add to existing deck
}

interface CreateFlashcardResponse {
  selectionId: string;
  flashcard: {
    id: string;
    front: string;
    back: string;
    imageUrl?: string;
  };
  xpAwarded: number;
}

router.post('/selections/create-flashcard', async (req, res) => {
  const { userId, selectedText, selectionContext } = req.body;
  
  try {
    // 1. Generate flashcard with Gemini
    const prompt = `Create a flashcard from this text:
    
"${selectedText}"

Context: ${selectionContext.beforeText} ... ${selectionContext.afterText}

Generate:
1. Front: A clear question (10-15 words)
2. Back: The answer with brief explanation (20-40 words)

Output as JSON: {"front": "...", "back": "..."}`;

    const geminiResponse = await geminiClient.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    const flashcardData = JSON.parse(geminiResponse.response.text());
    
    // 2. Generate optional illustration (if flashcard is visual concept)
    let imageUrl;
    if (isVisualConcept(selectedText)) {
      imageUrl = await generateFlashcardImage(flashcardData.front);
    }
    
    // 3. Save flashcard
    const flashcard = await db.flashcards.create({
      userId,
      lessonId: req.body.lessonId,
      front: flashcardData.front,
      back: flashcardData.back,
      imageUrl,
      sourceSelectionText: selectedText,
      deckId: req.body.deckId
    });
    
    // 4. Award XP
    const xpAwarded = 10; // Flashcard creation worth more
    await gamificationService.awardXP(userId, xpAwarded, 'create-flashcard');
    
    // 5. Store selection record
    await db.textSelections.create({
      userId,
      selectedText,
      actionType: 'flashcard',
      resultData: { flashcard: flashcardData }
    });
    
    res.json({
      flashcard: {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        imageUrl: flashcard.imageUrl
      },
      xpAwarded
    });
    
  } catch (error) {
    console.error('Flashcard creation error:', error);
    res.status(500).json({ error: 'Could not create flashcard' });
  }
});
```

#### **POST /api/selections/generate-quiz**
Generate practice quiz from selected text.

```typescript
interface GenerateQuizRequest {
  userId: string;
  lessonId: string;
  selectedText: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GenerateQuizResponse {
  selectionId: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  xpAwarded: number;
}

router.post('/selections/generate-quiz', async (req, res) => {
  const { userId, selectedText, difficulty } = req.body;
  
  try {
    const prompt = `Generate a ${difficulty} multiple-choice quiz question from this text:

"${selectedText}"

Requirements:
- Question should test understanding (not just recall)
- 4 answer options (A, B, C, D)
- Only one correct answer
- Brief explanation (2-3 sentences)

Output as JSON:
{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": 0,
  "explanation": "..."
}`;

    const geminiResponse = await geminiClient.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const quizData = JSON.parse(geminiResponse.response.text());
    
    // Award XP
    const xpAwarded = 8;
    await gamificationService.awardXP(userId, xpAwarded, 'generate-quiz');
    
    // Store selection
    await db.textSelections.create({
      userId,
      selectedText,
      actionType: 'quiz',
      resultData: { quiz: quizData }
    });
    
    res.json({ quiz: quizData, xpAwarded });
    
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Could not generate quiz' });
  }
});
```

#### **POST /api/selections/save**
Save selected text to user's collection.

```typescript
router.post('/selections/save', async (req, res) => {
  const { userId, selectionId, collectionName, tags } = req.body;
  
  try {
    const savedItem = await db.savedSelections.create({
      userId,
      selectionId,
      collectionName: collectionName || 'My Saves',
      tags: tags || []
    });
    
    // Award XP
    const xpAwarded = 3;
    await gamificationService.awardXP(userId, xpAwarded, 'save-selection');
    
    res.json({ 
      success: true, 
      savedItemId: savedItem.id,
      xpAwarded 
    });
    
  } catch (error) {
    console.error('Save selection error:', error);
    res.status(500).json({ error: 'Could not save' });
  }
});
```

### 5.2 Gemini Prompt Engineering

#### **Ollie's Response Prompt Template**

```typescript
const buildOlliePrompt = ({
  selectedText,
  selectionContext,
  userQuestion,
  ageGroup
}: {
  selectedText: string;
  selectionContext: { beforeText: string; afterText: string };
  userQuestion?: string;
  ageGroup: '4-7' | '8-12';
}): string => {
  const baseContext = `You are Ollie, a friendly AI tutor for children aged ${ageGroup}. A child has selected this text from their lesson:

"${selectedText}"

Context: ${selectionContext.beforeText} ... ${selectionContext.afterText}`;

  if (ageGroup === '4-7') {
    // Preset question for younger kids
    return `${baseContext}

Explain this text in VERY simple words that a ${ageGroup}-year-old can understand. Use:
- Short sentences (5-8 words each)
- Simple vocabulary (no big words)
- 1-2 examples they can relate to
- Max 3 sentences total

Be encouraging and excited!`;
  }
  
  // Ages 8-12 with custom question
  return `${baseContext}

The child asks: "${userQuestion || 'Can you explain this?'}"

Respond as Ollie with:
- Clear, age-appropriate language (8-12 year old level)
- 2-4 sentences
- One example or analogy
- Encouraging tone
- If concept is complex, break it into simple steps

Keep response under 100 words.`;
};
```

---

## 6. State Management

### 6.1 Context Provider

```typescript
// contexts/SelectionContext.tsx

interface SelectionContextType {
  currentSelection: TextSelection | null;
  setSelection: (selection: TextSelection | null) => void;
  handleAction: (action: SelectionAction) => Promise<void>;
  isProcessing: boolean;
  result: SelectionResult | null;
  clearResult: () => void;
}

export const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSelection, setCurrentSelection] = useState<TextSelection | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SelectionResult | null>(null);
  
  const { user } = useAuth();
  const { addXP } = useGamification();
  
  const handleAction = async (action: SelectionAction) => {
    if (!currentSelection || !user) return;
    
    setIsProcessing(true);
    
    try {
      let response;
      
      switch (action.type) {
        case 'ask':
          response = await api.post('/selections/ask-ollie', {
            userId: user.id,
            lessonId: action.lessonId,
            selectedText: currentSelection.text,
            selectionContext: currentSelection.context,
            userQuestion: action.userQuestion,
            ageGroup: user.ageGroup
          });
          
          setResult({
            type: 'ollie-response',
            content: {
              answer: response.data.answer,
              voiceAudioUrl: response.data.voiceAudioUrl
            },
            xpEarned: response.data.xpAwarded
          });
          break;
          
        case 'flashcard':
          response = await api.post('/selections/create-flashcard', {
            userId: user.id,
            lessonId: action.lessonId,
            selectedText: currentSelection.text,
            selectionContext: currentSelection.context
          });
          
          setResult({
            type: 'flashcard',
            content: response.data.flashcard,
            xpEarned: response.data.xpAwarded
          });
          break;
          
        case 'quiz':
          response = await api.post('/selections/generate-quiz', {
            userId: user.id,
            lessonId: action.lessonId,
            selectedText: currentSelection.text,
            difficulty: user.ageGroup === '4-7' ? 'easy' : 'medium'
          });
          
          setResult({
            type: 'quiz',
            content: response.data.quiz,
            xpEarned: response.data.xpAwarded
          });
          break;
          
        case 'save':
          response = await api.post('/selections/save', {
            userId: user.id,
            selectionId: currentSelection.id
          });
          
          toast.success('Saved to your collection! ⭐');
          setResult(null); // Don't show modal for save action
          break;
          
        case 'read':
          // Trigger TTS directly
          await playTTS(currentSelection.text);
          setResult(null); // No modal for read action
          break;
      }
      
      // Track analytics
      trackEvent('selection_action', {
        action_type: action.type,
        age_group: user.ageGroup,
        selection_length: currentSelection.text.length
      });
      
    } catch (error) {
      console.error('Selection action error:', error);
      toast.error('Something went wrong. Try again!');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const clearResult = () => {
    setResult(null);
    setCurrentSelection(null);
  };
  
  return (
    <SelectionContext.Provider value={{
      currentSelection,
      setSelection: setCurrentSelection,
      handleAction,
      isProcessing,
      result,
      clearResult
    }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
};
```

---

## 7. Safety & Compliance Layer

### 7.1 Content Filtering Pipeline

```typescript
// services/contentFilter.ts

interface ContentFilterConfig {
  text: string;
  userInput?: string;
  ageGroup: '4-7' | '8-12';
}

interface ContentFilterResult {
  passed: boolean;
  flaggedCategories: string[];
  requiresParentReview: boolean;
  safetyScore: number; // 0-1
}

export const contentFilter = {
  async check(config: ContentFilterConfig): Promise<ContentFilterResult> {
    const { text, userInput, ageGroup } = config;
    
    // 1. Check for explicit blocked keywords
    const blockedKeywords = getBlockedKeywords(ageGroup);
    const hasBlockedContent = blockedKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasBlockedContent) {
      return {
        passed: false,
        flaggedCategories: ['inappropriate_content'],
        requiresParentReview: true,
        safetyScore: 0
      };
    }
    
    // 2. Run through Gemini's safety ratings
    const geminiSafetyCheck = await geminiClient.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        role: 'user',
        parts: [{ text: `Rate safety for children (age ${ageGroup}): ${text}` }]
      }],
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_LOW_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_LOW_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_LOW_AND_ABOVE'
        }
      ]
    });
    
    const safetyRatings = geminiSafetyCheck.response.safetyRatings || [];
    const hasHighRiskCategory = safetyRatings.some(
      rating => rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
    );
    
    if (hasHighRiskCategory) {
      return {
        passed: false,
        flaggedCategories: safetyRatings
          .filter(r => r.probability !== 'NEGLIGIBLE')
          .map(r => r.category),
        requiresParentReview: true,
        safetyScore: 0.3
      };
    }
    
    // 3. Check user question (if provided)
    if (userInput) {
      const questionCheck = await checkUserQuestion(userInput, ageGroup);
      if (!questionCheck.passed) {
        return questionCheck;
      }
    }
    
    // 4. All checks passed
    return {
      passed: true,
      flaggedCategories: [],
      requiresParentReview: false,
      safetyScore: 0.95
    };
  }
};

// Age-specific blocked keywords
const getBlockedKeywords = (ageGroup: '4-7' | '8-12'): string[] => {
  const commonBlocked = [
    'suicide', 'self-harm', 'weapons', 'drugs', 'violence',
    'explicit', 'inappropriate', // Add more...
  ];
  
  if (ageGroup === '4-7') {
    // More restrictive for younger children
    return [
      ...commonBlocked,
      'death', 'scary', 'blood', // Age-specific additions
    ];
  }
  
  return commonBlocked;
};
```

### 7.2 Parent Notification System

```typescript
// services/parentNotifications.ts

interface ParentNotification {
  userId: string;
  parentId: string;
  notificationType: 'flagged_content' | 'high_engagement' | 'milestone';
  details: {
    selectionText?: string;
    reason?: string;
    action?: string;
  };
  timestamp: Date;
}

export const notifyParent = async (notification: ParentNotification) => {
  // 1. Store in database
  await db.parentNotifications.create(notification);
  
  // 2. Send push notification (if enabled)
  if (await parentHasPushEnabled(notification.parentId)) {
    await sendPushNotification({
      userId: notification.parentId,
      title: getNotificationTitle(notification.notificationType),
      body: getNotificationBody(notification),
      data: { type: notification.notificationType, userId: notification.userId }
    });
  }
  
  // 3. Send email (for flagged content only)
  if (notification.notificationType === 'flagged_content') {
    await sendEmail({
      to: await getParentEmail(notification.parentId),
      subject: 'Content Review Required - NanoBanana',
      template: 'flagged-content',
      data: notification.details
    });
  }
};
```

---

## 8. UI/UX Styling (CSS)

### 8.1 HighlightableContent Styles

```css
/* styles/highlightable-content.css */

.highlightable-content {
  position: relative;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  line-height: 1.8;
  font-size: 18px; /* Large for readability */
}

/* Selection highlight */
.highlightable-content ::selection {
  background-color: #FFD93D; /* Bright yellow */
  color: #000;
}

.highlightable-content ::-moz-selection {
  background-color: #FFD93D;
  color: #000;
}

/* Animated selection highlight */
.selection-highlight {
  position: absolute;
  background: linear-gradient(120deg, #FFD93D 0%, #FFA500 100%);
  border-radius: 4px;
  animation: highlightPulse 0.6s ease-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes highlightPulse {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

/* Particle effect on selection */
.selection-particles {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}

.selection-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD93D;
  border-radius: 50%;
  animation: particleFloat 1s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0.5);
  }
}

/* Context Menu */
.context-menu {
  position: absolute;
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 280px;
  z-index: 1000;
  
  /* Neo-brutalist border */
  border: 4px solid #000;
}

.context-menu::before {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid #000;
}

/* Ollie Avatar */
.ollie-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ollie-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #4ECDC4;
}

.speech-bubble {
  background: #F7F7F7;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  position: relative;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #F7F7F7;
}

/* Menu Actions */
.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 3px solid #000;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px; /* Large touch target for kids */
}

.menu-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.menu-button:active {
  transform: translateY(0);
  box-shadow: none;
}

.menu-button-icon {
  font-size: 24px;
  min-width: 32px;
  text-align: center;
}

.menu-button-label {
  flex: 1;
  text-align: left;
}

/* Question Input (Ages 8-12) */
.question-input {
  margin-top: 12px;
  padding: 12px;
  background: #F0F0F0;
  border-radius: 12px;
  border: 2px solid #000;
}

.question-input input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  background: white;
  border-radius: 8px;
  border: 2px solid #000;
  font-family: 'Comic Sans MS', 'Comic Neue', cursive;
}

.question-input input:focus {
  outline: none;
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
}

/* Selection Result Modal */
.selection-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
}

.selection-result-content {
  background: white;
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  border: 5px solid #000;
  box-shadow: 8px 8px 0 #000;
}

/* XP Gain Animation */
.xp-gain-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #FFD93D 0%, #FFA500 100%);
  border-radius: 16px;
  border: 3px solid #000;
  margin-bottom: 24px;
  animation: xpBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes xpBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.xp-gain-animation .xp-icon {
  font-size: 32px;
}

.xp-gain-animation .xp-text {
  font-size: 24px;
  font-weight: 800;
  color: #000;
}

/* Continue Button */
.continue-button {
  width: 100%;
  padding: 18px;
  background: #4ECDC4;
  border: 4px solid #000;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  transition: all 0.2s ease;
}

.continue-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.continue-button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .context-menu {
    min-width: 90vw;
    max-width: 400px;
  }
  
  .selection-result-content {
    padding: 24px;
    max-width: 90vw;
  }
  
  .menu-button {
    font-size: 18px;
    padding: 16px;
  }
}

/* Accessibility */
.context-menu:focus-visible,
.menu-button:focus-visible {
  outline: 3px solid #4ECDC4;
  outline-offset: 2px;
}

/* Loading State */
.menu-button.loading {
  opacity: 0.6;
  pointer-events: none;
}

.menu-button.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid #000;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 9. Integration with Existing Systems

### 9.1 Gamification Integration

```typescript
// Integration points with gamification system

// Award XP for different actions
const XP_REWARDS = {
  'ask-ollie': 5,
  'create-flashcard': 10,
  'generate-quiz': 8,
  'save-selection': 3,
  'complete-quiz': 15, // If they complete the generated quiz
  'streak-bonus': 5 // If selection is part of daily streak
};

// Badge triggers
const SELECTION_BADGES = [
  {
    id: 'curious-cat',
    name: 'Curious Cat',
    description: 'Asked Ollie 50 questions',
    requirement: { action: 'ask-ollie', count: 50 },
    icon: '🐱',
    xpBonus: 100
  },
  {
    id: 'flashcard-master',
    name: 'Flashcard Master',
    description: 'Created 100 flashcards',
    requirement: { action: 'create-flashcard', count: 100 },
    icon: '🎴',
    xpBonus: 150
  },
  {
    id: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Generated 30 practice quizzes',
    requirement: { action: 'generate-quiz', count: 30 },
    icon: '🎮',
    xpBonus: 120
  }
];

// Streak integration
const updateStreakForSelection = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const lastSelection = await db.textSelections.findLast({ userId });
  
  if (!lastSelection) {
    // First selection ever
    await db.streaks.create({
      userId,
      currentStreak: 1,
      lastActivityDate: today
    });
    return;
  }
  
  const lastActivityDate = lastSelection.createdAt.toISOString().split('T')[0];
  
  if (lastActivityDate === today) {
    // Already counted today
    return;
  }
  
  // Check if streak continues (yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastActivityDate === yesterdayStr) {
    // Continue streak
    await db.streaks.increment({ userId }, 'currentStreak');
    await gamificationService.awardXP(userId, 5, 'streak-bonus');
  } else {
    // Streak broken, reset to 1
    await db.streaks.update({ userId }, { currentStreak: 1 });
  }
};
```

### 9.2 Chat Integration (Ollie)

```typescript
// When user asks Ollie from text selection, context flows into chat

interface ChatMessageFromSelection {
  type: 'selection-question';
  selectionData: {
    selectedText: string;
    selectionContext: {
      beforeText: string;
      afterText: string;
    };
    lessonTitle: string;
    lessonId: string;
  };
  userQuestion: string;
}

// In chat context
const handleSelectionQuestion = async (message: ChatMessageFromSelection) => {
  // Ollie's response includes context awareness
  const systemPrompt = `You are Ollie. A child just selected text from their lesson "${message.selectionData.lessonTitle}" and asked you about it.

Selected text: "${message.selectionData.selectedText}"

Context: ${message.selectionData.selectionContext.beforeText} ... ${message.selectionData.selectionContext.afterText}

Their question: "${message.userQuestion}"

Respond helpfully with context awareness. Reference the lesson naturally.`;

  const response = await getChatResponse(systemPrompt, message.userQuestion);
  
  // Add to chat history
  addChatMessage({
    role: 'assistant',
    content: response,
    metadata: {
      source: 'text-selection',
      lessonId: message.selectionData.lessonId
    }
  });
};

// Button in Ollie's response to "Go back to lesson"
const returnToLesson = (lessonId: string) => {
  navigate(`/lessons/${lessonId}`, {
    state: { scrollToLastSelection: true }
  });
};
```

### 9.3 Parent Dashboard Integration

```typescript
// Parent dashboard shows selection analytics

interface SelectionAnalytics {
  totalSelections: number;
  selectionsByType: {
    ask: number;
    flashcard: number;
    quiz: number;
    save: number;
    read: number;
  };
  mostAskedTopics: string[];
  avgSelectionsPerLesson: number;
  engagementScore: number; // 0-100
  topLessonsWithSelections: Array<{
    lessonId: string;
    lessonTitle: string;
    selectionCount: number;
  }>;
}

// API endpoint for parents
router.get('/api/parent/analytics/selections/:childId', async (req, res) => {
  const { childId } = req.params;
  const { startDate, endDate } = req.query;
  
  const analytics = await db.textSelections.aggregate([
    {
      $match: {
        userId: childId,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // ... process and return analytics
  
  res.json(analytics);
});
```

---

## 10. Testing Checklist

### 10.1 Functional Testing

**Text Selection**
- [ ] Tap-to-select works on mobile (single tap for words)
- [ ] Tap-and-drag selection works (multi-word)
- [ ] Swipe-to-select works for full sentences
- [ ] Selection handles are visible and large enough (56dp)
- [ ] Selection highlights in bright yellow
- [ ] Particle effect plays on selection
- [ ] Haptic feedback triggers on selection start/end

**Context Menu**
- [ ] Menu appears above selection (not below)
- [ ] Menu position adjusts near screen edges
- [ ] Ollie avatar animates in smoothly
- [ ] Menu actions render correctly for each age group
- [ ] Age 4-7: Only 3 actions (Read, Ask, Save)
- [ ] Age 8-12: All 5 actions (Ask, Flashcard, Quiz, Save, Read)
- [ ] Menu auto-dismisses after 15 seconds
- [ ] "Still there?" prompt appears before dismissal
- [ ] Menu survives outside taps (forgiving UX)

**Actions**
- [ ] "Ask Ollie" submits question successfully
- [ ] Ollie's response displays in modal
- [ ] TTS audio plays for "Read to Me"
- [ ] Flashcard preview shows correctly
- [ ] Quiz preview displays with 4 options
- [ ] "Save This" adds to collection and shows toast
- [ ] XP animation plays after each action
- [ ] XP amount is correct for each action type

### 10.2 Safety & Compliance Testing

**Content Filtering**
- [ ] Blocked keywords are caught (age-appropriate)
- [ ] Gemini safety ratings trigger blocks correctly
- [ ] Parent notification sent for flagged content
- [ ] Flagged selections stored with safety metadata
- [ ] Parent can review flagged content in dashboard

**Data Privacy**
- [ ] Selections logged with proper user consent
- [ ] No PII stored in selection text
- [ ] Parent can delete child's selection history
- [ ] Data export includes all selections
- [ ] COPPA compliance: No behavioral tracking

### 10.3 Integration Testing

**Gamification**
- [ ] XP awards correctly for each action
- [ ] Streak updates when selection made daily
- [ ] Badges unlock at correct thresholds
- [ ] XP totals sync with global XP counter

**Chat Integration**
- [ ] Selection context flows into Ollie chat
- [ ] Chat history includes selection-based questions
- [ ] "Return to lesson" button works from chat

**Parent Dashboard**
- [ ] Selection analytics display correctly
- [ ] Top topics calculated accurately
- [ ] Engagement score reflects actual usage
- [ ] Flagged content appears in review queue

### 10.4 Performance Testing

- [ ] Menu renders within 300ms of selection
- [ ] Gemini API calls return within 3 seconds (p95)
- [ ] TTS audio loads within 2 seconds
- [ ] No UI lag during selection on 3-year-old tablets
- [ ] Selection state persists across page navigation
- [ ] No memory leaks after 50+ selections

### 10.5 Accessibility Testing

- [ ] Screen reader announces selection actions
- [ ] Keyboard navigation works (tab through menu)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets meet 56dp minimum
- [ ] Menu readable with 200% zoom

### 10.6 Cross-Platform Testing

**iOS**
- [ ] Selection works in Safari WebView
- [ ] Haptic feedback triggers correctly
- [ ] Menu doesn't interfere with iOS text selection UI
- [ ] Audio plays without user gesture (after first interaction)

**Android**
- [ ] Selection works in Chrome WebView
- [ ] Vibration API works correctly
- [ ] Menu renders correctly on various screen sizes
- [ ] Back button doesn't close menu unexpectedly

**Tablets (Primary)**
- [ ] Menu sized correctly for tablet screens
- [ ] Touch targets comfortable for child fingers
- [ ] Landscape and portrait orientations work

---

## 11. Implementation Timeline

### Phase 1: Core Selection & Menu (Week 1)
**Days 1-2**: HighlightableContent component
- Text selection handlers (touch + mouse)
- Selection highlighting with animation
- Selection state management

**Days 3-4**: ContextMenu component
- Age-appropriate action buttons
- Ollie avatar integration
- Menu positioning logic
- Auto-dismiss timer

**Day 5**: SelectionContext provider
- Global state management
- Action handlers
- Integration with existing contexts

**Deliverable**: Working selection UI with menu (no API calls yet)

---

### Phase 2: Backend Integration (Week 2)
**Days 6-7**: API endpoints
- `/api/selections/ask-ollie`
- `/api/selections/create-flashcard`
- `/api/selections/generate-quiz`
- `/api/selections/save`

**Days 8-9**: Gemini integration
- Prompt engineering for Ollie responses
- Flashcard generation prompts
- Quiz generation prompts
- Safety settings configuration

**Day 10**: Database schema
- Create tables: `text_selections`, `saved_selections`, `selection_analytics`
- Write migration scripts
- Test CRUD operations

**Deliverable**: Full backend support for all selection actions

---

### Phase 3: Safety & Polish (Week 3)
**Days 11-12**: Content filtering
- Implement `contentFilter` service
- Integrate Gemini safety ratings
- Add blocked keywords for each age group
- Parent notification system

**Days 13-14**: Result modals
- Ollie response view with TTS
- Flashcard preview modal
- Quiz preview modal
- XP gain animations

**Day 15**: Integration testing
- Connect to gamification system
- Connect to chat system
- Parent dashboard analytics
- End-to-end flows

**Deliverable**: Production-ready feature with all integrations

---

### Phase 4: Testing & Launch (Week 4)
**Days 16-17**: Comprehensive testing
- Run through all test checklists
- Fix bugs and edge cases
- Performance optimization
- Cross-platform testing

**Days 18-19**: Beta testing
- Release to 10-20 test families
- Gather feedback on UX
- Monitor error rates
- Iterate on Ollie's response quality

**Day 20**: Launch
- Deploy to production
- Enable for all users (gradual rollout)
- Monitor analytics
- Parent communication about new feature

**Deliverable**: Feature live in production

---

### Estimated Total Timeline: **4 Weeks**

**Team Requirements**:
- 1 Frontend Developer (React/TypeScript)
- 1 Backend Developer (Node.js/PostgreSQL)
- 0.5 AI Engineer (Gemini prompt engineering)
- 0.25 Designer (animations, Ollie avatar states)

**Dependencies**:
- Gemini API access (already have)
- ElevenLabs TTS integration (already have)
- Gamification system (P1 dependency, should be complete)
- Parent dashboard base (can be built in parallel)

---

## 12. Analytics & Monitoring

### 12.1 Key Metrics to Track

**Engagement Metrics**
```typescript
const SELECTION_METRICS = [
  'selection_made',               // When user selects text
  'context_menu_opened',          // Menu appeared
  'context_menu_dismissed',       // Menu closed without action
  'action_selected',              // User chose an action
  'action_completed',             // Action finished successfully
  'action_failed',                // Action errored
  'selection_length',             // Character count of selection
  'time_to_action',               // MS between selection and action
];

const ACTION_SPECIFIC_METRICS = {
  'ask-ollie': [
    'ollie_response_time',      // API latency
    'ollie_response_length',    // Word count
    'ollie_response_played',    // TTS triggered
    'custom_question_used',       // Free-form question (8-12 only)
  ],
  'flashcard': [
    'flashcard_added_to_deck',    // User saved flashcard
    'flashcard_with_image',       // Had visual
  ],
  'quiz': [
    'quiz_started',               // User started generated quiz
    'quiz_completed',             // Finished quiz
    'quiz_score',                 // Result
  ]
};
```

**Safety Metrics**
```typescript
const SAFETY_METRICS = [
  'content_filter_triggered',     // Selection flagged
  'parent_notification_sent',     // Alert sent
  'gemini_safety_block',          // Gemini blocked generation
  'blocked_keyword_found',        // Explicit filter caught
];
```

### 12.2 Monitoring Dashboard

```typescript
// Analytics queries for internal dashboard

// Daily active users using selection feature
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_selections
FROM text_selections
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

// Most popular action types by age group
SELECT 
  age_group,
  action_type,
  COUNT(*) as count,
  ROUND(AVG(result_data->>'processingTime')::numeric, 0) as avg_processing_ms
FROM text_selections
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY age_group, action_type
ORDER BY age_group, count DESC;

// Ollie response quality (by parent ratings, if implemented)
SELECT 
  AVG(parent_rating) as avg_rating,
  COUNT(*) as total_rated
FROM text_selections
WHERE action_type = 'ask'
  AND result_data->'ollieResponse'->>'parentRating' IS NOT NULL;

// Content filter effectiveness
SELECT 
  DATE(created_at) as date,
  COUNT(*) as flagged_selections,
  COUNT(*) FILTER (WHERE result_data->>'requiresParentReview' = 'true') as parent_reviews
FROM text_selections
WHERE result_data->>'safetyCheckPassed' = 'false'
GROUP BY DATE(created_at);
```

---

## 13. Future Enhancements (Post-MVP)

### 13.1 Advanced Features

**Smart Highlighting** (Phase 5)
- Auto-highlight key concepts as child reads
- Tap highlighted text to see Ollie's explanation
- "Difficult word detector" based on reading level

**Collaborative Learning** (Phase 6)
- Parent can select text and add notes for child
- Teacher mode: Curated selections with questions
- Sibling sharing: "Ask your brother about this!"

**Cross-Lesson Connections** (Phase 7)
- "You asked about this in Math too!" linking
- Build knowledge graph from selections
- Suggest related lessons based on interests

**Voice Selection** (Phase 8)
- "Ollie, what does [word] mean?" → Auto-highlights
- Voice commands: "Make this a flashcard"
- Hands-free learning for younger kids

### 13.2 A/B Testing Opportunities

**Test 1: Menu Style**
- Variant A: Vertical menu (current design)
- Variant B: Horizontal icon-only menu
- Metric: Action completion rate

**Test 2: Auto-Read for Ages 4-7**
- Variant A: Auto-play TTS on selection (current)
- Variant B: Require button tap
- Metric: Engagement duration

**Test 3: XP Rewards**
- Variant A: +5 XP for "Ask Ollie"
- Variant B: +10 XP for "Ask Ollie"
- Metric: Questions asked per session

---

## 14. Success Criteria

This feature is considered **successful** when:

1. **Adoption**: 60%+ of active users use text selection at least once per week
2. **Engagement**: Average 3-5 selections per lesson (indicates active reading)
3. **Quality**: 90%+ of Ollie responses rated "helpful" by parents
4. **Safety**: 100% of flagged content reviewed by parents within 24 hours
5. **Performance**: p95 response time <3 seconds for all actions
6. **Retention**: Users who engage with selection have 20%+ higher 7-day retention

---

## 15. Dependencies & Blockers

### Dependencies
- ✅ Gemini API integration (already complete)
- ✅ Gamification system (P1, should be complete)
- ⏳ Parent dashboard base (can build in parallel)
- ✅ TTS service (ElevenLabs, already integrated)

### Potential Blockers
1. **Gemini Rate Limits**: Monitor usage, may need rate limiting per user
2. **TTS Costs**: ElevenLabs charges per character, could get expensive
   - Mitigation: Cache common selections, limit TTS to <200 chars
3. **iOS WebView Restrictions**: Text selection may conflict with native UI
   - Mitigation: Custom touch handlers, override default behavior
4. **Tablet Fragmentation**: Many Android tablet models to test
   - Mitigation: Focus on top 5 devices by usage analytics

---

## 16. Rollout Plan

### Gradual Rollout Strategy

**Week 1: Internal Testing**
- Enable for Anthropic team members only
- Test all age groups
- Iterate on UX based on feedback

**Week 2: Beta Families (20 users)**
- Select diverse families (different curricula, age groups)
- Monitor error rates closely
- Daily check-ins on feedback

**Week 3: Soft Launch (10% of users)**
- Enable for 10% of active users
- A/B test against control group
- Monitor engagement metrics

**Week 4: Full Launch (100%)**
- Enable for all users
- Announce via in-app notification
- Send parent communication email
- Monitor support tickets

### Rollback Plan

**If error rate >5%:**
1. Immediately disable feature for new users
2. Keep enabled for users already using it
3. Investigate root cause
4. Fix and redeploy
5. Resume gradual rollout

**If Ollie response quality <80% satisfaction:**
1. Revert to simpler prompts
2. Increase Gemini temperature
3. Add more examples to prompts
4. Re-test with beta families

---

## 17. Documentation for Parents

### In-App Tooltip (First Use)

```
🎉 New Feature: Ask Ollie Anything!

Your child can now:
1. Tap and hold any text while reading
2. Ask Ollie questions
3. Create flashcards instantly
4. Practice with quizzes

It's like having a tutor right in the lesson!

[Got it!] [Learn More]
```

### Help Center Article

**Title**: "How to Use Text Selection & Ask Ollie"

**Content**:
Your child can interact with any text in their lessons by selecting it. Here's how:

**For Ages 4-7:**
- Tap any word to hear it read aloud
- Ollie will explain what it means
- Save favorite words with the star button

**For Ages 8-12:**
- Tap and drag to select text
- Choose from 5 actions:
  - 🤔 Ask Ollie a question
  - 🎴 Make a flashcard
  - 🎮 Create a practice quiz
  - ⭐ Save to collection
  - 🔊 Hear it read aloud

**Safety Note:**
All content is filtered for age-appropriateness. If Ollie detects anything that needs review, you'll get a notification in your Parent Dashboard.

**Tips:**
- Encourage your child to ask "why" and "how" questions
- Selections earn XP and count toward daily streaks
- Check the Dashboard to see what topics interest your child most

---

## 18. Conclusion

This feature transforms passive reading into active learning by allowing children to satisfy their curiosity instantly. By integrating Ollie's AI tutoring with text selection, we create a "curiosity loop" that keeps children engaged and asking questions.

**Key Innovations:**
1. **Age-appropriate interactions** (simpler for 4-7, richer for 8-12)
2. **Multi-action menu** (not just "explain," but create, practice, save)
3. **Safety-first design** (multi-layer filtering, parent oversight)
4. **Gamification integration** (XP, badges, streaks)
5. **Mobile-optimized** (large touch targets, haptic feedback, forgiving UX)

**Expected Impact:**
- 20-30% increase in session duration (children explore longer)
- 15-20% lift in retention (feature creates habit loop)
- Higher parental satisfaction (dashboard shows deep engagement)
- Differentiation from competitors (most don't have this level of AI integration)

This document provides Claude Code with everything needed to implement the feature from scratch, including edge cases, safety considerations, and production-ready code patterns.

---

**Document End**

*For questions or clarifications, contact the AI Learning Platform team.*
