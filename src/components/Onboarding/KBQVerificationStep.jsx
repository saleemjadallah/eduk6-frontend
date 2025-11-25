import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockConsentAPI } from '../../services/api/consentAPI';

const KBQVerificationStep = ({ consentId, onVerified, onBack }) => {
  const { updateConsentStatus } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [step, setStep] = useState('questions'); // 'questions', 'success', 'failed'

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [consentId]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await mockConsentAPI.getKBQQuestions(consentId);
      if (response.success && response.questions) {
        setQuestions(response.questions);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const isAllAnswered = () => {
    return questions.every(q => answers[q.id] && answers[q.id].trim() !== '');
  };

  const handleSubmit = async () => {
    if (!isAllAnswered()) {
      setError('Please answer all questions');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await mockConsentAPI.verifyKBQ({
        consentId,
        answers: formattedAnswers,
      });

      if (result.success) {
        setStep('success');
        updateConsentStatus('verified');

        // Wait before continuing
        setTimeout(() => {
          onVerified?.();
        }, 2000);
      } else {
        setAttemptsRemaining(result.attemptsRemaining || attemptsRemaining - 1);

        if (result.attemptsRemaining === 0) {
          setStep('failed');
        } else {
          setError(result.error || 'Verification failed. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="kbq-step kbq-loading">
        <div className="loading-animation">
          <span className="loading-spinner" />
        </div>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="kbq-step kbq-success">
        <div className="success-animation">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="3" />
            <path
              d="M30 50L45 65L70 35"
              stroke="#4CAF50"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h2>Verification Successful!</h2>
        <p className="success-text">
          Your parental consent has been verified through knowledge-based questions.
        </p>
        <p className="redirect-text">Continuing to profile setup...</p>
      </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="kbq-step kbq-failed">
        <div className="failed-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="36" fill="#FFEBEE" stroke="#F44336" strokeWidth="3" />
            <path
              d="M28 28L52 52M52 28L28 52"
              stroke="#F44336"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2>Verification Failed</h2>
        <p className="failed-text">
          You've used all 3 attempts. Please try credit card verification instead.
        </p>
        <button type="button" className="btn btn-primary" onClick={onBack}>
          Try Credit Card Verification
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="kbq-step kbq-questions">
      <div className="step-header">
        <h2>Knowledge-Based Verification</h2>
        <p className="subtitle">Answer these questions to verify you're an adult.</p>
      </div>

      <div className="question-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {attemptsRemaining < 3 && (
        <div className="attempts-warning">
          <span className="warning-icon">!</span>
          {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {question && (
        <div className="question-card">
          <div className="question-text">{question.question}</div>

          {question.type === 'text' || !question.options || question.options.length === 0 ? (
            <input
              type="text"
              className="form-input"
              placeholder="Enter your answer"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          ) : (
            <div className="options-grid">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className={`option-btn ${answers[question.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="question-dots">
        {questions.map((q, index) => (
          <button
            key={q.id}
            type="button"
            className={`dot ${index === currentQuestion ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
            onClick={() => goToQuestion(index)}
            aria-label={`Question ${index + 1}`}
          />
        ))}
      </div>

      <div className="form-actions">
        {currentQuestion === 0 ? (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Previous
          </button>
        )}

        {currentQuestion < questions.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!answers[question?.id]}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !isAllAnswered()}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                Verifying...
              </>
            ) : (
              'Submit Answers'
            )}
          </button>
        )}
      </div>

      <style>{`
        .kbq-step {
          text-align: center;
        }

        .kbq-loading {
          padding: 40px 20px;
        }

        .loading-animation {
          margin-bottom: 16px;
        }

        .loading-animation .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #ffc107;
        }

        .question-progress {
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffc107, #ff9800);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #666;
        }

        .attempts-warning {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fff3e0;
          color: #e65100;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .warning-icon {
          width: 20px;
          height: 20px;
          background: #ff9800;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.75rem;
        }

        .question-card {
          background: #f9f9f9;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          text-align: left;
        }

        .question-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .option-btn {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-size: 0.9375rem;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .option-btn:hover {
          border-color: #ffc107;
          background: #fffde7;
        }

        .option-btn.selected {
          border-color: #ffc107;
          background: #ffc107;
          color: white;
          font-weight: 500;
        }

        .question-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #e0e0e0;
          background: white;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dot.active {
          border-color: #ffc107;
          transform: scale(1.2);
        }

        .dot.answered {
          background: #ffc107;
          border-color: #ffc107;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Success state */
        .kbq-success {
          padding: 40px 20px;
        }

        .success-animation {
          margin-bottom: 24px;
        }

        .success-animation svg {
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-text {
          color: #666;
          margin: 0 0 16px;
        }

        .redirect-text {
          font-size: 0.875rem;
          color: #999;
          font-style: italic;
        }

        /* Failed state */
        .kbq-failed {
          padding: 40px 20px;
        }

        .failed-icon {
          margin-bottom: 24px;
        }

        .failed-text {
          color: #666;
          margin: 0 0 24px;
        }

        @media (max-width: 480px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default KBQVerificationStep;
