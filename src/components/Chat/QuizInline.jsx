import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Trophy, RotateCcw } from 'lucide-react';

/**
 * QuizInline - Displays an interactive quiz inline in the chat
 * Shows questions one at a time with multiple choice answers
 */
const QuizInline = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);

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
        if (percentage === 100) return { emoji: '🏆', text: 'Perfect score! You\'re amazing!' };
        if (percentage >= 80) return { emoji: '🌟', text: 'Excellent work! You really know your stuff!' };
        if (percentage >= 60) return { emoji: '👍', text: 'Good job! Keep learning!' };
        if (percentage >= 40) return { emoji: '📚', text: 'Nice try! Review the lesson and try again!' };
        return { emoji: '💪', text: 'Keep practicing! You\'ll get there!' };
    };

    // Results Screen
    if (showResults) {
        const result = getResultMessage();
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-4"
            >
                {/* Score Card */}
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-5xl mb-2">{result.emoji}</div>
                    <div className="text-4xl font-black mb-1">{score}/{totalQuestions}</div>
                    <div className="text-lg font-bold opacity-90">{getPercentage()}% Correct</div>
                    <p className="mt-3 text-sm font-medium">{result.text}</p>
                </div>

                {/* Answer Summary */}
                <div className="bg-white p-4 rounded-xl border-2 border-black">
                    <h4 className="font-bold text-sm mb-3">Your Answers:</h4>
                    <div className="space-y-2">
                        {answers.map((answer, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                    answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                                }`}
                            >
                                {answer.isCorrect ? (
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                    <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                                )}
                                <span className="truncate">
                                    Q{index + 1}: {questions[index].question.substring(0, 40)}...
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Retry Button */}
                <button
                    onClick={handleRetryQuiz}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500 text-white border-2 border-black rounded-xl hover:bg-purple-600 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none font-bold"
                >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-3">
            {/* Progress Bar */}
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>{title || 'Quiz'}</span>
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                    <p className="font-bold text-sm mb-4">{currentQuestion.question}</p>

                    {/* Options */}
                    <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-3 rounded-lg border-2 border-black transition-all text-sm font-medium ${getOptionStyle(index)}`}
                                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold border border-gray-300">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span>{option}</span>
                                    {isAnswered && index === currentQuestion.correctAnswer && (
                                        <Check className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                    {isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                                        <X className="w-4 h-4 text-red-600 ml-auto" />
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-xl border-2 ${
                            selectedAnswer === currentQuestion.correctAnswer
                                ? 'bg-green-100 border-green-400'
                                : 'bg-amber-100 border-amber-400'
                        }`}
                    >
                        <p className="text-sm font-bold mb-1">
                            {selectedAnswer === currentQuestion.correctAnswer ? '🎉 Correct!' : '💡 Not quite!'}
                        </p>
                        {currentQuestion.explanation && (
                            <p className="text-xs text-gray-700">{currentQuestion.explanation}</p>
                        )}
                        {currentQuestion.encouragement && (
                            <p className="text-xs text-gray-600 mt-1 italic">{currentQuestion.encouragement}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Next Button */}
            {isAnswered && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNextQuestion}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500 text-white border-2 border-black rounded-xl hover:bg-purple-600 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none font-bold"
                >
                    {isLastQuestion ? (
                        <>
                            <Trophy className="w-5 h-5" />
                            See Results
                        </>
                    ) : (
                        <>
                            Next Question
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            )}

            {/* Score tracker */}
            <div className="text-center text-xs text-gray-500 font-medium">
                Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
            </div>
        </div>
    );
};

export default QuizInline;
