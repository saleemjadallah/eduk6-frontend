import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consentAPI } from '../../services/api/consentAPI';

const ConsentMethodStep = ({ onMethodSelected }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [error, setError] = useState('');

  const handleMethodSelect = async (method) => {
    if (!user) return;

    setSelectedMethod(method);
    setIsLoading(true);
    setError('');

    try {
      // For credit card, initiate the payment intent
      if (method === 'credit_card') {
        const response = await consentAPI.initiateCreditCardConsent();
        if (response.success && response.data?.clientSecret) {
          onMethodSelected?.(method, response.data.clientSecret);
        } else {
          setError(response.error || 'Failed to initiate verification');
        }
      } else {
        // For KBQ, just proceed to the questions step
        onMethodSelected?.(method, null);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="consent-method-step">
      <div className="step-header">
        <div className="consent-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="32" fill="#E8F5E9" />
            <path
              d="M32 14C23.163 14 16 21.163 16 30V38C16 39.1 16.9 40 18 40H22C23.1 40 24 39.1 24 38V30C24 25.58 27.58 22 32 22C36.42 22 40 25.58 40 30V38C40 39.1 40.9 40 42 40H46C47.1 40 48 39.1 48 38V30C48 21.163 40.837 14 32 14Z"
              stroke="#4CAF50"
              strokeWidth="2"
              fill="white"
            />
            <rect x="20" y="36" width="24" height="16" rx="2" fill="#4CAF50" />
            <circle cx="32" cy="44" r="2" fill="white" />
            <path d="M32 46V50" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <h2>Verify Parental Consent</h2>
        <p className="subtitle">
          To comply with COPPA and ensure child safety, we need to verify that you're
          an adult parent or guardian.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="method-options">
        {/* Credit Card Option */}
        <button
          type="button"
          className={`method-card ${selectedMethod === 'credit_card' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('credit_card')}
          disabled={isLoading}
        >
          <div className="method-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="10" width="40" height="28" rx="4" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2" />
              <rect x="4" y="16" width="40" height="8" fill="#2196F3" />
              <rect x="8" y="30" width="16" height="4" rx="2" fill="#BBDEFB" />
              <rect x="28" y="30" width="8" height="4" rx="2" fill="#BBDEFB" />
            </svg>
          </div>
          <div className="method-content">
            <h3>Credit Card Verification</h3>
            <p className="method-description">
              We'll charge $0.50 to your card and immediately refund it. This verifies
              you have a valid payment method.
            </p>
            <ul className="method-benefits">
              <li>Instant verification</li>
              <li>Immediate platform access</li>
              <li>Full refund within 5-7 days</li>
              <li>Secure payment via Stripe</li>
            </ul>
          </div>
          <div className="method-badge recommended">Recommended</div>
          {isLoading && selectedMethod === 'credit_card' && (
            <div className="method-loading">
              <span className="loading-spinner" />
            </div>
          )}
        </button>

        {/* KBQ Option */}
        <button
          type="button"
          className={`method-card ${selectedMethod === 'kbq' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('kbq')}
          disabled={isLoading}
        >
          <div className="method-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="20" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
              <text x="24" y="32" fontSize="24" fontWeight="bold" fill="#FF9800" textAnchor="middle">?</text>
            </svg>
          </div>
          <div className="method-content">
            <h3>Knowledge-Based Questions</h3>
            <p className="method-description">
              Answer 5 questions that only an adult would know. Takes about 2 minutes.
            </p>
            <ul className="method-benefits">
              <li>No payment required</li>
              <li>Quick and simple</li>
              <li>3 attempts allowed</li>
              <li>Privacy-focused</li>
            </ul>
          </div>
          <div className="method-badge">Free Option</div>
          {isLoading && selectedMethod === 'kbq' && (
            <div className="method-loading">
              <span className="loading-spinner" />
            </div>
          )}
        </button>
      </div>

      <div className="consent-info">
        <div className="info-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" stroke="#2196F3" strokeWidth="2" />
            <path d="M10 5V6" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 9V15" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="info-content">
          <strong>Why do we need this?</strong>
          <p>
            Under the Children's Online Privacy Protection Act (COPPA), we must obtain
            verifiable parental consent before collecting information from children under 13.
            Your information is encrypted and secure.
          </p>
        </div>
      </div>

      <style>{`
        .consent-method-step {
          text-align: center;
        }

        .consent-icon {
          margin-bottom: 16px;
        }

        .method-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .method-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .method-card:hover:not(:disabled) {
          border-color: #ffc107;
          box-shadow: 0 4px 16px rgba(255, 193, 7, 0.2);
        }

        .method-card.selected {
          border-color: #ffc107;
          background: #fffde7;
        }

        .method-card:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .method-icon {
          margin-bottom: 12px;
        }

        .method-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px;
        }

        .method-description {
          font-size: 0.9375rem;
          color: #666;
          margin: 0 0 12px;
        }

        .method-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .method-benefits li {
          font-size: 0.8125rem;
          color: #4caf50;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .method-benefits li::before {
          content: '✓';
          font-weight: bold;
        }

        .method-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          background: #e0e0e0;
          color: #666;
        }

        .method-badge.recommended {
          background: linear-gradient(135deg, #ffc107, #ff9800);
          color: white;
        }

        .method-loading {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .method-loading .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e0e0e0;
          border-top-color: #ffc107;
        }

        .consent-info {
          display: flex;
          gap: 12px;
          background: #e3f2fd;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
        }

        .info-icon {
          flex-shrink: 0;
        }

        .info-content {
          font-size: 0.8125rem;
          color: #1565c0;
        }

        .info-content strong {
          display: block;
          margin-bottom: 4px;
        }

        .info-content p {
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 480px) {
          .method-benefits {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsentMethodStep;
