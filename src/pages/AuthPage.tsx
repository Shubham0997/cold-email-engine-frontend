import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthPage = () => {
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to home
  if (user) return <Navigate to="/" replace />;

  const getFirebaseErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.',
      'auth/configuration-not-found': 'Firebase auth is not configured. Please enable sign-in providers in Firebase Console.',
    };
    return messages[code] || `An unexpected error occurred (${code || 'unknown'}). Please try again.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'reset') {
      if (!email) return;
      setIsLoading(true);
      try {
        await resetPassword(email);
        showToast('Password reset email sent! Check your inbox.');
        setMode('signin');
      } catch (err: any) {
        showToast(getFirebaseErrorMessage(err.code), 'error');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      showToast(mode === 'signin' ? 'Welcome back!' : 'Account created successfully!');
      navigate('/');
    } catch (err: any) {
      showToast(getFirebaseErrorMessage(err.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google!');
      navigate('/');
    } catch (err: any) {
      showToast(getFirebaseErrorMessage(err.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-container">
        {/* Left branding panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              MailFlow<span>AI</span>
            </div>
            <h2 className="auth-brand-tagline">
              Intelligent Cold Email Outreach, Powered by AI
            </h2>
            <p className="auth-brand-description">
              Craft personalized emails, manage campaigns at scale, and track
              performance — all from one beautiful dashboard.
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">✨</span>
                <span>AI-Powered Email Drafting</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">📊</span>
                <span>Real-Time Open Tracking</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">🚀</span>
                <span>Bulk Campaign Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'signin' && 'Sign in to access your email campaigns'}
              {mode === 'signup' && 'Get started with MailFlow AI today'}
              {mode === 'reset' && "Enter your email and we'll send you a reset link"}
            </p>

            {mode !== 'reset' && (
              <button
                className="auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>
            )}

            {mode !== 'reset' && (
              <div className="auth-divider">
                <span>or</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              {mode !== 'reset' && (
                <div className="auth-field">
                  <label htmlFor="auth-password">Password</label>
                  <div className="auth-password-wrapper">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="auth-confirm-password">Confirm Password</label>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {mode === 'signin' && (
                <div className="auth-forgot">
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setPassword(''); }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Email'}
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'signin' && (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setPassword(''); setConfirmPassword(''); }}>
                    Sign Up
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setPassword(''); setConfirmPassword(''); }}>
                    Sign In
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <p>
                  Remember your password?{' '}
                  <button onClick={() => setMode('signin')}>
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
