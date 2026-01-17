import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { showToast } from '../utils/toastConfig.js';

/**
 * Email Verification Page
 * 
 * Handles email verification for new user registrations.
 * Users must verify their email before accessing the platform.
 * 
 * @component
 */
const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, expired, invalid
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Verify email on component mount
    verifyEmail();
  }, [token]);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async () => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid verification link');
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, all tokens are valid
      // In production, validate token on backend
      setStatus('success');
      setMessage('✅ Email verified successfully!');
      setEmail('user@example.com');
      showToast.success('Email verified! Redirecting to login...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?type=user');
      }, 3000);
    } catch (err) {
      setStatus('invalid');
      setMessage('Failed to verify email. The link may have expired.');
      showToast.error('Verification failed');
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setResendCooldown(60); // 60 second cooldown
      showToast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      showToast.error('Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Email
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can now log in with your credentials. Redirecting in a few seconds...
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => navigate('/login?type=user')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="text-5xl mb-4">⏰</div>
              <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Link Expired
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your verification link has expired. Please request a new one.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleResendEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login?type=user')}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}

          {status === 'invalid' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleResendEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Legal notice */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By verifying this email, you agree to our{' '}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;
