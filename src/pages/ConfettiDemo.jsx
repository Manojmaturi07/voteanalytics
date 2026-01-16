import { useState } from 'react';
import { triggerConfetti, triggerBurstConfetti, triggerSideConfetti } from '../utils/confettiUtils.js';
import Button from '../components/Button.jsx';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';

const ConfettiDemo = () => {
  const [lastTriggered, setLastTriggered] = useState(null);

  const handleConfetti = (type) => {
    setLastTriggered(type);
    
    switch (type) {
      case 'standard':
        triggerConfetti();
        break;
      case 'burst':
        triggerBurstConfetti();
        break;
      case 'side':
        triggerSideConfetti();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Confetti Animation Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test the confetti animations used in Vote Analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Standard Confetti */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-indigo-400 transition">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-11-3v3m6-3v3m-8 5h14" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Standard Confetti
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Classic burst from center
              </p>
              <Button
                variant="primary"
                onClick={() => handleConfetti('standard')}
                className="w-full"
              >
                Trigger Standard
              </Button>
              {lastTriggered === 'standard' && (
                <p className="mt-2 text-sm text-green-600">✓ Triggered!</p>
              )}
            </div>

            {/* Burst Confetti */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-green-400 transition">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Burst Confetti
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Vote celebration effect
              </p>
              <Button
                variant="primary"
                onClick={() => handleConfetti('burst')}
                className="w-full"
                style={{ backgroundColor: '#10B981' }}
              >
                Trigger Burst
              </Button>
              {lastTriggered === 'burst' && (
                <p className="mt-2 text-sm text-green-600">✓ Triggered!</p>
              )}
            </div>

            {/* Side Confetti */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Side Confetti
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Confetti from both sides
              </p>
              <Button
                variant="primary"
                onClick={() => handleConfetti('side')}
                className="w-full"
                style={{ backgroundColor: '#3B82F6' }}
              >
                Trigger Side
              </Button>
              {lastTriggered === 'side' && (
                <p className="mt-2 text-sm text-green-600">✓ Triggered!</p>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
              📝 Animation Details
            </h2>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
              <li>• <strong>Standard:</strong> 100 particles, centered burst</li>
              <li>• <strong>Burst:</strong> Multiple waves over 3 seconds, 50 particles per wave</li>
              <li>• <strong>Side:</strong> 80 particles from left and right edges</li>
              <li>• <strong>Colors:</strong> #FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #98D8C8</li>
              <li>• <strong>Library:</strong> canvas-confetti (browser-safe)</li>
            </ul>
          </div>

          {/* Integration Info */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-3">
              ✨ Production Integration
            </h2>
            <p className="text-sm text-green-800 dark:text-green-300 mb-3">
              In production, <strong>triggerBurstConfetti()</strong> is automatically called when users submit votes.
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Location: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">src/pages/PollVoting.jsx</code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfettiDemo;
