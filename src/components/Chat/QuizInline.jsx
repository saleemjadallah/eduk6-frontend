import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Trophy, RotateCcw, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * QuizInline - Displays an interactive quiz inline in the chat
 * Shows questions one at a time with multiple choice answers
 * Includes answer key at the end for review
 */
const QuizInline = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showAnswerKey, setShowAnswerKey] = useState(false);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                No quiz available
            </div>
        );
    }

    const { title, questions } = quiz;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const handleSelectAnswer = (answerIndex) => {
        if (isAnswered) return;

        setSelectedAnswer(answerIndex);
        setIsAnswered(true);

        const isCorrect = answerIndex === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setAnswers(prev => [...prev, {
            questionIndex: currentQuestionIndex,
            selected: answerIndex,
            correct: currentQuestion.correctAnswer,
            isCorrect,
        }]);
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            setShowResults(true);
            if (onComplete) {
                onComplete({ score: score, total: totalQuestions });
            }
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    const handleRetryQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setAnswers([]);
        setShowResults(false);
        setShowAnswerKey(false);
    };

    const getOptionStyle = (index) => {
        if (!isAnswered) {
            return selectedAnswer === index
                ? 'bg-purple-100 border-purple-500'
                : 'bg-white hover:bg-gray-50';
        }

        if (index === currentQuestion.correctAnswer) {
            return 'bg-green-100 border-green-500';
        }

        if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
            return 'bg-red-100 border-red-500';
        }

        return 'bg-gray-50 opacity-60';
    };

    const getPercentage = () => Math.round((score / totalQuestions) * 100);

    const getResultMessage = () => {
        const percentage = getPercentage();
        if (percentage === 100) return { emoji: '🏆', text: 'Perfect score! You\'re amazing!', color: 'from-yellow-400 to-orange-500' };
        if (percentage >= 80) return { emoji: '🌟', text: 'Excellent work! You really know your stuff!', color: 'from-green-400 to-emerald-500' };
        if (percentage >= 60) return { emoji: '👍', text: 'Good job! Keep learning!', color: 'from-blue-400 to-indigo-500' };
        if (percentage >= 40) return { emoji: '📚', text: 'Nice try! Review the lesson and try again!', color: 'from-purple-400 to-purple-600' };
        return { emoji: '💪', text: 'Keep practicing! You\'ll get there!', color: 'from-pink-400 to-rose-500' };
    };

    // Results Screen with Answer Key
    if (showResults) {
        const result = getResultMessage();
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg space-y-4"
            >
                {/* Score Card */}
                <div className={`bg-gradient-to-br ${result.color} text-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center`}>
                    <motion.div
                        className="text-6xl mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        {result.emoji}
                    </motion.div>
                    <motion.div
                        className="text-5xl font-black mb-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {score}/{totalQuestions}
                    </motion.div>
                    <div className="text-xl font-bold opacity-90">{getPercentage()}% Correct</div>
                    <p className="mt-3 text-base font-medium">{result.text}</p>
                </div>

                {/* Quick Answer Summary */}
                <div className="bg-white p-4 rounded-xl border-2 border-black">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <span>📋</span> Your Answers
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                        {answers.map((answer, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border-2 ${
                                    answer.isCorrect
                                        ? 'bg-green-100 border-green-400 text-green-700'
                                        : 'bg-red-100 border-red-400 text-red-700'
                                }`}
                            >
                                {answer.isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Answer Key Toggle */}
                <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors font-bold text-blue-700"
                >
                    <span className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Answer Key
                    </span>
                    {showAnswerKey ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {/* Expandable Answer Key */}
                <AnimatePresence>
                    {showAnswerKey && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white p-4 rounded-xl border-2 border-black space-y-4 max-h-[400px] overflow-y-auto">
                                <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 sticky top-0 bg-white py-2">
                                    <span>📖</span> Complete Answer Key
                                </h4>
                                {questions.map((q, qIndex) => {
                                    const userAnswer = answers[qIndex];
                                    const wasCorrect = userAnswer?.isCorrect;
                                    return (
                                        <div
                                            key={qIndex}
                                            className={`p-4 rounded-xl border-2 ${
                                                wasCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                    wasCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                                                }`}>
                                                    Q{qIndex + 1}
                                                </span>
                                                <p className="font-medium text-gray-800 flex-1">{q.question}</p>
                                            </div>

                                            <div className="ml-8 space-y-1 text-sm">
                                                {q.options.map((opt, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`flex items-center gap-2 p-2 rounded-lg ${
                                                            optIndex === q.correctAnswer
                                                                ? 'bg-green-100 font-bold text-green-800'
                                                                : optIndex === userAnswer?.selected && !wasCorrect
                                                                    ? 'bg-red-100 text-red-600 line-through'
                                                                    : 'text-gray-600'
                                                        }`}
                                                    >
                                                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                                                            {String.fromCharCode(65 + optIndex)}
                                                        </span>
                                                        {opt}
                                                        {optIndex === q.correctAnswer && (
                                                            <Check className="w-4 h-4 text-green-600 ml-auto" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-3 ml-8 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-xs text-blue-700">
                                                        <span className="font-bold">💡 Explanation:</span> {q.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleRetryQuiz}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-purple-500 text-white border-2 border-black rounded-xl hover:bg-purple-600 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none font-bold"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-lg space-y-4">
            {/* Header with Progress */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-xl text-white">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{title || '🎯 Quiz Time!'}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                </div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs opacity-80">
                    <span>Score: {score} correct</span>
                    <span>{totalQuestions - currentQuestionIndex - (isAnswered ? 1 : 0)} remaining</span>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20, rotateY: 10 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -20, rotateY: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-start gap-3 mb-5">
                        <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg border-2 border-black">
                            {currentQuestionIndex + 1}
                        </span>
                        <p className="font-bold text-base text-gray-800 pt-2">{currentQuestion.question}</p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 border-black transition-all text-sm font-medium ${getOptionStyle(index)}`}
                                whileHover={!isAnswered ? { scale: 1.02, x: 4 } : {}}
                                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold border-2 ${
                                        isAnswered && index === currentQuestion.correctAnswer
                                            ? 'bg-green-500 text-white border-green-600'
                                            : isAnswered && selectedAnswer === index
                                                ? 'bg-red-500 text-white border-red-600'
                                                : 'bg-gray-100 border-gray-300'
                                    }`}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    {isAnswered && index === currentQuestion.correctAnswer && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring' }}
                                        >
                                            <Check className="w-6 h-6 text-green-600" />
                                        </motion.div>
                                    )}
                                    {isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring' }}
                                        >
                                            <X className="w-6 h-6 text-red-600" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl border-2 ${
                            selectedAnswer === currentQuestion.correctAnswer
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                                : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                                {selectedAnswer === currentQuestion.correctAnswer ? '🎉' : '💡'}
                            </span>
                            <p className="text-base font-bold">
                                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Not quite!'}
                            </p>
                        </div>
                        {currentQuestion.explanation && (
                            <p className="text-sm text-gray-700 ml-9">{currentQuestion.explanation}</p>
                        )}
                        {currentQuestion.encouragement && (
                            <p className="text-sm text-gray-600 mt-2 ml-9 italic">{currentQuestion.encouragement}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Next Button */}
            {isAnswered && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNextQuestion}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-2 border-black rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none font-bold text-lg"
                >
                    {isLastQuestion ? (
                        <>
                            <Trophy className="w-6 h-6" />
                            See Results
                        </>
                    ) : (
                        <>
                            Next Question
                            <ChevronRight className="w-6 h-6" />
                        </>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export default QuizInline;
