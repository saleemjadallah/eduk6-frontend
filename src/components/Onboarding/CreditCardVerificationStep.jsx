import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { consentAPI } from '../../services/api/consentAPI';

// Initialize Stripe with publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#666ee8',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

// Inner form component that uses Stripe hooks
const CardForm = ({ clientSecret, onVerified, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { updateConsentStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
  const [cardholderName, setCardholderName] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please wait a moment and try again.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setError('');
    setIsProcessing(true);
    setStep('processing');

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Verify with our backend
        const result = await consentAPI.verifyCreditCard({
          paymentIntentId: paymentIntent.id,
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
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}. Please try again.`);
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
          <label className="form-label">Cardholder Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Name on card"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            autoComplete="cc-name"
            disabled={isProcessing}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Card Details</label>
          <div className="stripe-card-wrapper">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProcessing || !stripe || !cardComplete}
          >
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
    </div>
  );
};

// Wrapper component that provides Stripe context
const CreditCardVerificationStep = ({ consentId, onVerified, onBack }) => {
  const [clientSecret, setClientSecret] = useState(consentId);
  const [initError, setInitError] = useState('');

  // The consentId passed from OnboardingFlow is actually the clientSecret
  useEffect(() => {
    if (!consentId) {
      setInitError('Payment session not initialized. Please go back and try again.');
    } else {
      setClientSecret(consentId);
    }
  }, [consentId]);

  if (!stripePromise) {
    return (
      <div className="cc-step cc-error">
        <div className="error-icon">⚠️</div>
        <h2>Payment System Unavailable</h2>
        <p>
          Credit card verification is not available at this time. Please try the
          Knowledge-Based Questions option instead.
        </p>
        <button className="btn btn-secondary" onClick={onBack}>
          Choose Different Method
        </button>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="cc-step cc-error">
        <div className="error-icon">⚠️</div>
        <h2>Session Error</h2>
        <p>{initError}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="cc-step cc-loading">
        <div className="spinner-large" />
        <p>Initializing payment...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardForm
        clientSecret={clientSecret}
        onVerified={onVerified}
        onBack={onBack}
      />
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

        .stripe-card-wrapper {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 14px 12px;
          transition: border-color 0.2s;
        }

        .stripe-card-wrapper:focus-within {
          border-color: #ffc107;
          box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
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
        .cc-processing, .cc-loading {
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

        /* Error state */
        .cc-error {
          padding: 40px 20px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .cc-error h2 {
          color: #e65100;
          margin: 0 0 12px;
        }

        .cc-error p {
          color: #666;
          margin: 0 0 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Elements>
  );
};

export default CreditCardVerificationStep;
