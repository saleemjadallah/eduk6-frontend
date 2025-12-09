import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api/authAPI';

const STEPS = {
  OPTIONS: 'options',
  PASSWORD_VERIFY: 'password_verify',
  SELECT_QUESTIONS: 'select_questions',
  ANSWER_QUESTIONS: 'answer_questions',
  SUCCESS: 'success',
};

const ResetKBQModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(STEPS.OPTIONS);
  const [password, setPassword] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKBQ, setHasKBQ] = useState(null);

  // Fetch KBQ status and all questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, questionsRes] = await Promise.all([
          authAPI.getKBQStatus(),
          authAPI.getAllKBQQuestions(),
        ]);

        if (statusRes.success) {
          setHasKBQ(statusRes.data.hasKBQ);
        }

        if (questionsRes.success) {
          setAllQuestions(questionsRes.data.questions);
        }
      } catch (err) {
        console.error('Failed to fetch KBQ data:', err);
      }
    };
    fetchData();
  }, []);

  const handlePasswordVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Password will be verified when submitting the new questions
    setStep(STEPS.SELECT_QUESTIONS);
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 questions
      }
      return [...prev, questionId];
    });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setError('');

    // Validate answers
    const answeredQuestions = selectedQuestions.filter(qId => answers[qId]?.trim());
    if (answeredQuestions.length < 3) {
      setError('Please answer all 3 security questions');
      return;
    }

    const answersArray = selectedQuestions.map(qId => ({
      questionId: qId,
      answer: answers[qId].trim(),
    }));

    setIsLoading(true);
    try {
      const response = await authAPI.resetKBQ(password, answersArray);
      if (response.success) {
        setStep(STEPS.SUCCESS);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to reset security questions. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        {step === STEPS.OPTIONS && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">🔐</span>
              <h2>Security Questions</h2>
              <p className="modal-subtitle">
                {hasKBQ
                  ? 'Reset your security questions for consent verification'
                  : 'Set up security questions for consent verification'}
              </p>
            </div>

            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <div>
                <p>
                  Security questions are used to verify your identity when:
                </p>
                <ul>
                  <li>Giving parental consent (COPPA compliance)</li>
                  <li>Making important account changes</li>
                </ul>
              </div>
            </div>

            <div className="options-grid">
              <button
                className="option-card"
                onClick={() => setStep(STEPS.PASSWORD_VERIFY)}
              >
                <span className="option-icon">🔄</span>
                <div className="option-content">
                  <h3>{hasKBQ ? 'Reset Questions' : 'Set Up Questions'}</h3>
                  <p>{hasKBQ ? 'Choose new security questions and answers' : 'Select 3 questions to protect your account'}</p>
                </div>
              </button>
            </div>

            <div className="security-note">
              <span className="note-icon">🛡️</span>
              <p>
                For security, you'll need to confirm your password before making changes.
              </p>
            </div>
          </div>
        )}

        {step === STEPS.PASSWORD_VERIFY && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">🔑</span>
              <h2>Confirm Your Identity</h2>
              <p className="modal-subtitle">
                Enter your password to continue
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordVerify}>
              <div className="form-group">
                <label>Your Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStep(STEPS.OPTIONS);
                    setPassword('');
                    setError('');
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {step === STEPS.SELECT_QUESTIONS && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">❓</span>
              <h2>Select Security Questions</h2>
              <p className="modal-subtitle">
                Choose 3 questions that only you can answer
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                {error}
              </div>
            )}

            <div className="questions-list">
              {allQuestions.map((q) => (
                <button
                  key={q.id}
                  className={`question-option ${selectedQuestions.includes(q.id) ? 'selected' : ''}`}
                  onClick={() => handleQuestionSelect(q.id)}
                  disabled={!selectedQuestions.includes(q.id) && selectedQuestions.length >= 3}
                >
                  <span className="question-checkbox">
                    {selectedQuestions.includes(q.id) ? '✓' : ''}
                  </span>
                  <span className="question-text">{q.question}</span>
                </button>
              ))}
            </div>

            <div className="selection-status">
              {selectedQuestions.length}/3 questions selected
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep(STEPS.PASSWORD_VERIFY);
                  setSelectedQuestions([]);
                  setError('');
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedQuestions.length !== 3}
                onClick={() => setStep(STEPS.ANSWER_QUESTIONS)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === STEPS.ANSWER_QUESTIONS && (
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-icon">✍️</span>
              <h2>Answer Your Questions</h2>
              <p className="modal-subtitle">
                Provide answers that you'll remember
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                {error}
              </div>
            )}

            <div className="answers-form">
              {selectedQuestions.map((qId, index) => {
                const question = allQuestions.find(q => q.id === qId);
                return (
                  <div key={qId} className="form-group">
                    <label>
                      <span className="question-number">{index + 1}.</span>
                      {question?.question}
                    </label>
                    <input
                      type="text"
                      value={answers[qId] || ''}
                      onChange={(e) => handleAnswerChange(qId, e.target.value)}
                      placeholder="Enter your answer"
                    />
                    {question?.hint && (
                      <span className="form-hint">{question.hint}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="security-tip">
              <span className="tip-icon">💡</span>
              <p>
                <strong>Tip:</strong> Answers are case-insensitive. Choose answers that are easy for you to remember but hard for others to guess.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep(STEPS.SELECT_QUESTIONS);
                  setError('');
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Saving...' : 'Save Security Questions'}
              </button>
            </div>
          </div>
        )}

        {step === STEPS.SUCCESS && (
          <div className="modal-content success-content">
            <div className="success-icon-large">✓</div>
            <h2>Success!</h2>
            <p>
              Your security questions have been updated. Remember to keep your answers safe and memorable.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-container {
            background: white;
            border-radius: 20px;
            max-width: 480px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-container.large {
            max-width: 560px;
          }

          .modal-close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
            z-index: 10;
          }

          .modal-close-btn:hover {
            background: #f0f0f0;
          }

          .modal-content {
            padding: 32px;
          }

          .modal-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .modal-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
          }

          .modal-header h2 {
            margin: 0 0 8px;
            font-size: 1.5rem;
            color: #1a1a1a;
          }

          .modal-subtitle {
            color: #666;
            margin: 0;
            font-size: 0.9375rem;
          }

          .alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .alert-error {
            background: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
            font-size: 0.9375rem;
          }

          .info-box {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 12px;
            border: 1px solid #0ea5e9;
            margin-bottom: 20px;
          }

          .info-icon {
            font-size: 20px;
            flex-shrink: 0;
          }

          .info-box p {
            margin: 0 0 8px;
            color: #0369a1;
            font-size: 0.875rem;
          }

          .info-box ul {
            margin: 0;
            padding-left: 20px;
            color: #0369a1;
            font-size: 0.875rem;
          }

          .options-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
          }

          .option-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .option-card:hover {
            border-color: #7c3aed;
            background: #f5f3ff;
          }

          .option-icon {
            font-size: 32px;
            flex-shrink: 0;
          }

          .option-content h3 {
            margin: 0 0 4px;
            font-size: 1rem;
            color: #1a1a1a;
          }

          .option-content p {
            margin: 0;
            color: #666;
            font-size: 0.875rem;
          }

          .security-note {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f0fdf4;
            border-radius: 12px;
            border: 1px solid #22c55e;
          }

          .note-icon {
            font-size: 24px;
          }

          .security-note p {
            margin: 0;
            color: #166534;
            font-size: 0.875rem;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1a1a1a;
          }

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }

          .form-group input:focus {
            outline: none;
            border-color: #7c3aed;
          }

          .form-hint {
            display: block;
            font-size: 0.8125rem;
            color: #666;
            margin-top: 6px;
          }

          .questions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
            max-height: 320px;
            overflow-y: auto;
          }

          .question-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .question-option:hover:not(:disabled) {
            border-color: #7c3aed;
          }

          .question-option.selected {
            border-color: #7c3aed;
            background: #f5f3ff;
          }

          .question-option:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .question-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid #d1d5db;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
            color: white;
          }

          .question-option.selected .question-checkbox {
            background: #7c3aed;
            border-color: #7c3aed;
          }

          .question-text {
            font-size: 0.9375rem;
            color: #374151;
          }

          .selection-status {
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 16px;
          }

          .answers-form {
            margin-bottom: 20px;
          }

          .question-number {
            color: #7c3aed;
            margin-right: 8px;
          }

          .security-tip {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #fef3c7;
            border-radius: 12px;
            border: 1px solid #f59e0b;
            margin-bottom: 20px;
          }

          .tip-icon {
            font-size: 20px;
          }

          .security-tip p {
            margin: 0;
            color: #92400e;
            font-size: 0.875rem;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
          }

          .btn {
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #7c3aed, #2dd4bf);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }

          .btn-secondary:hover {
            background: #e5e7eb;
          }

          .success-content {
            text-align: center;
            padding: 48px 32px;
          }

          .success-icon-large {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #22c55e, #10b981);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 40px;
            color: white;
          }

          .success-content h2 {
            margin: 0 0 12px;
            color: #1a1a1a;
          }

          .success-content p {
            color: #666;
            margin: 0 0 24px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ResetKBQModal;
