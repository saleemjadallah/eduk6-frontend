import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const otpExpiryMinutes =
    Number.parseInt(import.meta.env.VITE_OTP_CODE_EXPIRY_MINUTES ?? '', 10) || 10;

  useEffect(() => {
    // Get email from location state (passed from RegisterPage)
    const state = location.state as { email?: string; redirectTo?: string } | null | undefined;
    const stateEmail = state?.email;
    if (!stateEmail) {
      // If no email in state, redirect to register
      navigate('/register');
      return;
    }
    setEmail(stateEmail);
    setRedirectTo(state?.redirectTo);
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.verifyRegistration(email, code);
      await queryClient.invalidateQueries({ queryKey: ['user'] });

      // Track CompleteRegistration event
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration');
      }

      // Redirect to generate page after successful verification
      navigate(redirectTo ?? '/generate', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex p-3 rounded-2xl gradient-saffron text-white mb-4"
          >
            <Mail className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Verify your email</h1>
          <p className="text-slate">
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-charcoal">{email}</span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-charcoal/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-berry/10 text-berry border border-berry/20"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <div className="rounded-lg border border-dashed border-charcoal/20 bg-cream-50 p-4 text-sm text-slate">
              <p className="flex items-center gap-2 font-medium text-charcoal">
                <CheckCircle className="w-4 h-4" />
                Check your email
              </p>
              <p className="mt-2">
                Enter the 6-digit code we sent to your email address. The code expires in{' '}
                {otpExpiryMinutes} minutes.
              </p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-charcoal mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate">
              Didn't receive the code?{' '}
              <button
                onClick={() => {
                  setError('');
                  // TODO: Add resend functionality
                  setError('Resend functionality coming soon. Please wait a moment and check your spam folder.');
                }}
                className="font-semibold text-saffron hover:text-saffron-600"
              >
                Resend
              </button>
            </p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate mt-6">
          If you don't see the email, check your spam folder or try registering again.
        </p>
      </motion.div>
    </div>
  );
}
