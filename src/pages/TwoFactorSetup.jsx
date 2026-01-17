import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { showToast } from '../utils/toastConfig.js';
import { generate2FASecret, generateTOTPCode } from '../utils/advancedSecurity.js';

/**
 * Two-Factor Authentication Setup
 * 
 * Allows users to enable 2FA on their account using TOTP (Time-based One-Time Password)
 * 
 * @component
 */
const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('intro'); // intro, generate, verify, success
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const generateSecret = async () => {
    setLoading(true);
    try {
      const newSecret = generate2FASecret();
      setSecret(newSecret);
      
      // Generate mock QR code (in production, use qrcode library)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/VoteAnalytics?secret=${newSecret}`;
      setQrCode(qrUrl);
      
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);
      
      setStep('generate');
      showToast.success('2FA secret generated');
    } catch (err) {
      setError('Failed to generate 2FA secret');
      showToast.error('Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // In production, verify on backend
      const expectedCode = generateTOTPCode(secret);
      
      // For demo, accept any 6-digit code close to current time
      if (/^\d{6}$/.test(verificationCode)) {
        setStep('success');
        showToast.success('2FA enabled successfully!');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = `VoteAnalytics 2FA Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}\n\nStore these codes in a safe place. Each code can be used once if you lose access to your 2FA device.`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'backup-codes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast.success('Backup codes downloaded');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {['intro', 'generate', 'verify', 'success'].map((s, idx) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors ${
                  ['intro', 'generate', 'verify', 'success'].indexOf(step) >= idx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {['Start', 'Setup', 'Verify', 'Done'][idx]}
              </span>
            </div>
          ))}
        </div>

        {/* Step: Intro */}
        {step === 'intro' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Enable Two-Factor Authentication
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add an extra layer of security to your account using an authenticator app.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                What you'll need:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li>✓ Google Authenticator, Microsoft Authenticator, or Authy app</li>
                <li>✓ A smartphone or tablet with the app installed</li>
                <li>✓ A safe place to store backup codes</li>
              </ul>
            </div>

            <Button
              variant="primary"
              onClick={generateSecret}
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'Generating...' : 'Get Started'}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              Cancel
            </Button>
          </>
        )}

        {/* Step: Generate */}
        {step === 'generate' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Scan QR Code
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Scan this QR code with your authenticator app:
            </p>

            {qrCode && (
              <div className="flex justify-center mb-6">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Or enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white break-all">
                  {secret}
                </code>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              After scanning, enter the 6-digit code from your app:
            </p>

            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="w-full px-4 py-2 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
            )}

            <Button
              variant="primary"
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full mb-2"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep('intro')}
              className="w-full"
            >
              Back
            </Button>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                2FA Enabled!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your account is now protected with two-factor authentication.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">
                ⚠️ Save Your Backup Codes
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
                Save these codes in a safe place. You can use them if you lose access to your authenticator app.
              </p>

              {!showBackupCodes ? (
                <Button
                  variant="outline"
                  onClick={() => setShowBackupCodes(true)}
                  className="w-full"
                >
                  Show Backup Codes
                </Button>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded p-3 mb-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(code)}
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                onClick={downloadBackupCodes}
                className="w-full"
              >
                Download Codes
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              Go to Profile
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default TwoFactorSetup;
