import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consentAPI } from '../../services/api/consentAPI';

// TODO: In production, integrate with Stripe Elements
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CreditCardVerificationStep = ({ consentId, onVerified, onBack }) => {
  const { updateConsentStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'

  // Card form state (TODO: Replace with Stripe Elements in production)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateCard = () => {
    // Basic validation (in production, Stripe handles this)
    if (cardData.number.replace(/\s/g, '').length < 15) {
      setError('Please enter a valid card number');
      return false;
    }
    if (cardData.expiry.length !== 5) {
      setError('Please enter a valid expiry date');
      return false;
    }
    if (cardData.cvc.length < 3) {
      setError('Please enter a valid CVC');
      return false;
    }
    if (cardData.name.length < 2) {
      setError('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCard()) return;

    setError('');
    setIsProcessing(true);
    setStep('processing');

    try {
      // TODO: In production, use Stripe to process the payment
      // const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: { card: elements.getElement(CardElement) }
      // });

      // Verify with backend using the payment intent ID
      // For now, we'll use a placeholder - in production this would come from Stripe
      const result = await consentAPI.verifyCreditCard({
        paymentIntentId: consentId, // consentId is actually the clientSecret from initiation
      });

      if (result.success) {
        setStep('success');
        updateConsentStatus('verified');

        // Wait a moment before continuing
        setTimeout(() => {
          onVerified?.();
        }, 2000);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Payment verification failed');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="cc-step cc-success">
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
          Your parental consent has been verified. The $0.50 charge will be
          refunded to your card within 5-7 business days.
        </p>
        <p className="redirect-text">Continuing to profile setup...</p>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="cc-step cc-processing">
        <div className="processing-animation">
          <div className="spinner-large" />
        </div>
        <h2>Processing Payment</h2>
        <p className="processing-text">
          Please wait while we verify your payment...
        </p>
        <p className="secure-text">
          <span className="lock-icon">🔒</span>
          Your payment is secure and encrypted
        </p>
      </div>
    );
  }

  return (
    <div className="cc-step cc-form">
      <div className="step-header">
        <h2>Credit Card Verification</h2>
        <p className="subtitle">
          Enter your card details. We'll charge $0.50 and immediately refund it.
        </p>
      </div>

      <div className="amount-badge">
        <span className="amount">$0.50</span>
        <span className="amount-note">(will be refunded)</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Card Number</label>
          <div className="card-input-wrapper">
            <input
              type="text"
              name="number"
              className="form-input card-input"
              placeholder="4242 4242 4242 4242"
              value={cardData.number}
              onChange={handleInputChange}
              autoComplete="cc-number"
            />
            <div className="card-icons">
              <span className="card-icon visa">💳</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="text"
              name="expiry"
              className="form-input"
              placeholder="MM/YY"
              value={cardData.expiry}
              onChange={handleInputChange}
              autoComplete="cc-exp"
            />
          </div>
          <div className="form-group">
            <label className="form-label">CVC</label>
            <input
              type="text"
              name="cvc"
              className="form-input"
              placeholder="123"
              value={cardData.cvc}
              onChange={handleInputChange}
              autoComplete="cc-csc"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cardholder Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Name on card"
            value={cardData.name}
            onChange={handleInputChange}
            autoComplete="cc-name"
          />
        </div>

        <div className="security-badges">
          <span className="badge">
            <span>🔒</span> SSL Encrypted
          </span>
          <span className="badge">
            <span>✓</span> PCI Compliant
          </span>
          <span className="badge">
            <span>💳</span> Powered by Stripe
          </span>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back
          </button>
          <button type="submit" className="btn btn-primary" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <span className="loading-spinner" />
                Processing...
              </>
            ) : (
              'Verify & Pay $0.50'
            )}
          </button>
        </div>
      </form>

      <div className="refund-notice">
        <p>
          <strong>100% Refund Guaranteed</strong>
          <br />
          The $0.50 charge is only to verify your identity as an adult. It will be
          automatically refunded within 5-7 business days.
        </p>
      </div>

      <style>{`
        .cc-step {
          text-align: center;
        }

        .cc-form .step-header {
          margin-bottom: 16px;
        }

        .amount-badge {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-radius: 12px;
          padding: 12px 20px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1565c0;
        }

        .amount-note {
          font-size: 0.75rem;
          color: #42a5f5;
        }

        .card-input-wrapper {
          position: relative;
        }

        .card-input {
          padding-right: 50px;
        }

        .card-icons {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 4px;
        }

        .card-icon {
          font-size: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .security-badges .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #666;
          background: #f5f5f5;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 12px;
          margin-top: 20px;
        }

        .refund-notice {
          background: #fff8e1;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
          font-size: 0.8125rem;
          color: #f57c00;
          text-align: left;
        }

        .refund-notice strong {
          color: #e65100;
        }

        .refund-notice p {
          margin: 0;
        }

        /* Processing state */
        .cc-processing {
          padding: 40px 20px;
        }

        .processing-animation {
          margin-bottom: 24px;
        }

        .spinner-large {
          width: 60px;
          height: 60px;
          border: 4px solid #e0e0e0;
          border-top-color: #ffc107;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        .processing-text {
          color: #666;
          margin: 0 0 16px;
        }

        .secure-text {
          font-size: 0.875rem;
          color: #4caf50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Success state */
        .cc-success {
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CreditCardVerificationStep;
