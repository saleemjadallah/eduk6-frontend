import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, ArrowRight, BookOpen, HelpCircle, Star, Volume2, Languages, MessageCircle } from 'lucide-react';

/**
 * XP Gain Animation Component
 */
const XPGainAnimation = ({ xp }) => {
    return (
        <motion.div
            className="xp-gain-animation"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
                type: 'spring',
                damping: 10,
                stiffness: 200,
            }}
        >
            <motion.span
                className="xp-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
            >
                ✨
            </motion.span>
            <span className="xp-text">+{xp} XP!</span>
        </motion.div>
    );
};

/**
 * Jeffrey's Response View
 */
const JeffreyResponseView = ({ question, answer, selectedText, imageData, mimeType }) => {
    return (
        <div className="jeffrey-response-view">
            {/* Jeffrey Avatar */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-3 border-black flex items-center justify-center text-3xl shadow-lg">
                    🤓
                </div>
                <div>
                    <h3 className="font-bold text-lg">Jeffrey says:</h3>
                    {question && (
                        <p className="text-sm text-gray-500">You asked: "{question}"</p>
                    )}
                </div>
            </div>

            {/* Selected Text */}
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 mb-4">
                <p className="text-sm font-medium text-yellow-800">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    About: "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                </p>
            </div>

            {/* Generated Image (if present) */}
            {imageData && (
                <motion.div
                    className="mb-4 rounded-xl overflow-hidden border-2 border-purple-300 shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-purple-700">Jeffrey drew this for you!</span>
                    </div>
                    <img
                        src={`data:${mimeType || 'image/png'};base64,${imageData}`}
                        alt="Jeffrey's drawing"
                        className="w-full"
                    />
                </motion.div>
            )}

            {/* Answer */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {answer}
                </p>
            </div>

            {/* Read Answer Aloud Button */}
            <button
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors"
                onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(answer);
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                }}
            >
                <Volume2 className="w-4 h-4" />
                Read Answer Aloud
            </button>
        </div>
    );
};

/**
 * Flashcard Preview
 */
const FlashcardPreview = ({ flashcard, onAddToDeck }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);

    return (
        <div className="flashcard-preview">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🏴</span>
                New Flashcard Created!
            </h3>

            {/* Flashcard */}
            <motion.div
                className="flashcard-container cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <motion.div
                    className="flashcard"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className={`flashcard-face flashcard-front ${isFlipped ? 'hidden' : ''}`}>
                        <HelpCircle className="w-6 h-6 text-purple-400 mb-2" />
                        <p className="font-medium text-center">{flashcard.front}</p>
                        <p className="text-xs text-gray-400 mt-2">Tap to flip</p>
                    </div>

                    {/* Back */}
                    <div className={`flashcard-face flashcard-back ${!isFlipped ? 'hidden' : ''}`}
                        style={{ transform: 'rotateY(180deg)' }}>
                        <Star className="w-6 h-6 text-yellow-400 mb-2" />
                        <p className="font-medium text-center">{flashcard.back}</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Add to Deck Button */}
            <button
                className="mt-4 w-full py-3 bg-purple-500 text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                onClick={onAddToDeck}
            >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Add to My Deck
            </button>
        </div>
    );
};

/**
 * Quiz Preview
 */
const QuizPreview = ({ quiz, onStartQuiz }) => {
    const [selectedAnswer, setSelectedAnswer] = React.useState(null);
    const [showResult, setShowResult] = React.useState(false);

    const handleAnswer = (index) => {
        setSelectedAnswer(index);
        setShowResult(true);
    };

    const isCorrect = selectedAnswer === quiz.correctAnswer;

    return (
        <div className="quiz-preview">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                Quick Quiz!
            </h3>

            {/* Question */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <p className="font-medium text-blue-800">{quiz.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
                {quiz.options.map((option, index) => (
                    <motion.button
                        key={index}
                        className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            showResult
                                ? index === quiz.correctAnswer
                                    ? 'bg-green-100 border-green-500 text-green-800'
                                    : selectedAnswer === index
                                        ? 'bg-red-100 border-red-500 text-red-800'
                                        : 'bg-gray-50 border-gray-200'
                                : selectedAnswer === index
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => !showResult && handleAnswer(index)}
                        disabled={showResult}
                        whileHover={!showResult ? { scale: 1.01 } : {}}
                        whileTap={!showResult ? { scale: 0.99 } : {}}
                    >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-sm font-bold mr-2">
                            {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                    </motion.button>
                ))}
            </div>

            {/* Result */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}
                >
                    <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                        {isCorrect ? '🎉 Correct! Great job!' : '🤔 Not quite!'}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">{quiz.explanation}</p>
                </motion.div>
            )}
        </div>
    );
};

/**
 * Translation View
 */
const TranslationView = ({ originalText, translatedText, targetLanguage, pronunciation, simpleExplanation }) => {
    const handleReadAloud = (text, lang) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;

        // Try to set appropriate language voice
        const voices = window.speechSynthesis.getVoices();
        const langCode = {
            'Spanish': 'es',
            'French': 'fr',
            'Arabic': 'ar',
            'Chinese': 'zh',
            'Japanese': 'ja',
            'Korean': 'ko',
            'German': 'de',
            'Italian': 'it',
            'Portuguese': 'pt',
            'Russian': 'ru',
            'Hindi': 'hi',
        }[lang] || 'en';

        const voice = voices.find(v => v.lang.startsWith(langCode));
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="translation-view">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-3 border-black flex items-center justify-center text-3xl shadow-lg">
                    🌍
                </div>
                <div>
                    <h3 className="font-bold text-lg">Translation</h3>
                    <p className="text-sm text-gray-500">Translated to {targetLanguage}</p>
                </div>
            </div>

            {/* Original Text */}
            <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Original</p>
                    <button
                        onClick={() => handleReadAloud(originalText, 'English')}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Read aloud"
                    >
                        <Volume2 className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <p className="text-gray-700 font-medium">"{originalText}"</p>
            </div>

            {/* Translated Text */}
            <motion.div
                className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{targetLanguage}</p>
                    </div>
                    <button
                        onClick={() => handleReadAloud(translatedText, targetLanguage)}
                        className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Read aloud"
                    >
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                    </button>
                </div>
                <p className="text-emerald-800 font-bold text-lg">{translatedText}</p>

                {/* Pronunciation Guide */}
                {pronunciation && (
                    <motion.div
                        className="mt-2 pt-2 border-t border-emerald-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <p className="text-xs text-emerald-600 font-medium">
                            🗣️ Say it: <span className="italic">{pronunciation}</span>
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Simple Explanation */}
            {simpleExplanation && (
                <motion.div
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">{simpleExplanation}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

/**
 * SelectionResultModal - Modal displaying the result of a selection action
 */
const SelectionResultModal = ({ result, onClose }) => {
    // Track analytics
    useEffect(() => {
        console.log('Selection result shown:', result.type, result.content);
    }, [result]);

    return (
        <motion.div
            className="selection-result-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <motion.div
                className="selection-result-content"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: 'spring', damping: 20 }}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* XP Celebration */}
                {result.xpEarned > 0 && (
                    <XPGainAnimation xp={result.xpEarned} />
                )}

                {/* Result Content */}
                <div className="result-content mt-4">
                    {result.type === 'jeffrey-response' && (
                        <JeffreyResponseView
                            question={result.content.question}
                            answer={result.content.answer}
                            selectedText={result.content.selectedText}
                            imageData={result.content.imageData}
                            mimeType={result.content.mimeType}
                        />
                    )}

                    {result.type === 'flashcard' && (
                        <FlashcardPreview
                            flashcard={result.content}
                            onAddToDeck={() => {
                                // Add to flashcard deck
                                console.log('Adding flashcard to deck:', result.content);
                                onClose();
                            }}
                        />
                    )}

                    {result.type === 'quiz' && (
                        <QuizPreview
                            quiz={result.content}
                            onStartQuiz={() => {
                                console.log('Starting quiz with:', result.content);
                            }}
                        />
                    )}

                    {result.type === 'translation' && result.content && (
                        <TranslationView
                            originalText={result.content.originalText || ''}
                            translatedText={result.content.translatedText || 'Translation not available'}
                            targetLanguage={result.content.targetLanguage || 'Unknown'}
                            pronunciation={result.content.pronunciation}
                            simpleExplanation={result.content.simpleExplanation}
                        />
                    )}
                </div>

                {/* Continue Button */}
                <button
                    className="continue-button"
                    onClick={onClose}
                >
                    <span>Keep Reading</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>
        </motion.div>
    );
};

export default SelectionResultModal;
