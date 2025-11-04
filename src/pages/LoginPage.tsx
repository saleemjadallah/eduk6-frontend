import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Sparkles, Fingerprint, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { detectIncognito } from '@/lib/detectIncognito';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const otpExpiryMinutes =
    Number.parseInt(import.meta.env.VITE_OTP_CODE_EXPIRY_MINUTES ?? '', 10) || 10;
  const redirectTo =
    (location.state as { redirectTo?: string } | null | undefined)?.redirectTo;

  useEffect(() => {
    detectIncognito().then(setIsIncognito);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(email, password);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate(redirectTo ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Enter your email address to receive a login code.');
      return;
    }
    setError('');
    setSendingCode(true);
    try {
      await api.requestLoginOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.loginWithOtp(email, otpCode);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate(redirectTo ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (nextMode: 'password' | 'otp') => {
    setMode(nextMode);
    setError('');
    setOtpSent(false);
    setOtpCode('');
    if (nextMode === 'password') {
      setSendingCode(false);
    }
  };

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
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue creating stunning food photos</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <form
            onSubmit={mode === 'password' ? handleSubmit : handleOtpSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {isIncognito && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
              >
                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Private Browsing Detected</p>
                  <p>You're in private/incognito mode. Login may not persist across page refreshes due to enhanced privacy settings.</p>
                  <p className="mt-2">For the best experience, please use normal browsing mode.</p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => toggleMode('password')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'password'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => toggleMode('otp')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'otp'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Login Code
              </button>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode === 'password' ? (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="flex items-center gap-2 font-medium text-gray-700">
                    <Fingerprint className="w-4 h-4" />
                    Passwordless login
                  </p>
                  <p className="mt-2">
                    We&apos;ll send a one-time code to your email. Enter it here to sign in securely.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingCode}
                    className="flex-1 py-3 rounded-lg border-2 border-saffron-500 text-saffron-600 font-semibold hover:bg-saffron-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sendingCode ? 'Sending…' : otpSent ? 'Resend Code' : 'Send Login Code'}
                  </button>
                  {otpSent && (
                    <span className="text-xs text-gray-500">
                      Code sent to <span className="font-medium">{email}</span>
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    6-digit code
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500 focus:ring-opacity-20 transition-all tracking-widest uppercase"
                      placeholder="123456"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    The code expires in {otpExpiryMinutes} minutes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg gradient-saffron text-white font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {loading ? 'Signing in...' : 'Verify & Sign In'}
                </button>
              </>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton
            className="w-full"
            variant="outline"
            size="lg"
            redirectTo={redirectTo || '/dashboard'}
            onSuccess={async () => {
              await queryClient.invalidateQueries({ queryKey: ['user'] });
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                state={redirectTo ? { redirectTo } : undefined}
                className="font-semibold text-saffron-600 hover:text-saffron-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
