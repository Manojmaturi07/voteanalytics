import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../utils/toastConfig.js';
import { createDeletionRequest, prepareUserDataExport } from '../utils/advancedSecurity.js';

/**
 * Security Settings Page
 * 
 * Provides security and privacy features:
 * - Two-factor authentication setup
 * - Data export (GDPR)
 * - Account deletion
 * - Session management
 */
const SecuritySettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security'); // security, privacy
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [user] = useState({
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    twoFactorEnabled: false,
  });

  const handleEnable2FA = () => {
    navigate('/2fa-setup');
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const exportData = prepareUserDataExport(user, [], []);
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `voteanalytics-data-${Date.now()}.json`);
      linkElement.click();
      showToast.success('Your data has been exported');
    } catch (err) {
      showToast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateDelete = () => {
    setDeleteStep(1);
  };

  const handleVerifyDelete = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDeleteStep(2);
      setDeletePassword('');
    } catch (err) {
      setDeleteError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      createDeletionRequest(user.id, deletionReason);
      showToast.success('Your account will be deleted within 24 hours');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        authAPI.logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      showToast.error('Failed to request account deletion');
    } finally {
      setLoading(false);
    }
  };

  const resetDeleteForm = () => {
    setDeleteStep(0);
    setDeletePassword('');
    setDeletionReason('');
    setDeleteError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Security & Privacy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your security settings and privacy preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'security', label: 'Security', icon: '🔒' },
            { id: 'privacy', label: 'Privacy & Data', icon: '🔐' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔐 Two-Factor Authentication
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {user.twoFactorEnabled
                  ? '✅ Two-factor authentication is enabled'
                  : '❌ Two-factor authentication is not enabled'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
              </p>
              <Button
                variant={user.twoFactorEnabled ? 'outline' : 'primary'}
                onClick={handleEnable2FA}
                disabled={loading}
              >
                {user.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔑 Password
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Change your password regularly to keep your account secure.
              </p>
              <Button variant="outline">Change Password</Button>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💻 Active Sessions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You are currently logged in on this device.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Current Session:</strong> Logged in now from this browser
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  authAPI.logout();
                  showToast.success('Logged out successfully');
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⏱️ Session Timeout
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your session will automatically expire after 30 minutes of inactivity for security reasons. You'll be prompted before logout.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  💡 <strong>Tip:</strong> Keep your browser session active when performing important actions. You can extend your session when prompted.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Privacy & Data Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📥 Download Your Data
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Download a copy of your personal data including your profile, voting history, and account activity. This complies with GDPR data portability rights.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✅ Your data will be exported as a JSON file that you can download and save.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleExportData}
                disabled={loading}
              >
                {loading ? 'Exporting...' : '📥 Export My Data'}
              </Button>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🗑️ Delete Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone and complies with GDPR right to be forgotten.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  ⚠️ <strong>Warning:</strong> Deleting your account will:
                </p>
                <ul className="text-sm text-red-800 dark:text-red-300 list-disc list-inside mt-2 space-y-1">
                  <li>Permanently remove all your personal data</li>
                  <li>Delete your voting history</li>
                  <li>Close all active sessions</li>
                  <li>Cannot be reversed</li>
                </ul>
              </div>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  resetDeleteForm();
                }}
              >
                Delete My Account
              </Button>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Legal Documents
              </h2>
              <div className="space-y-3">
                <div>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Privacy Policy
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Learn how we collect, use, and protect your personal information
                  </p>
                </div>
                <div>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Terms of Service
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Review our terms and conditions for using VoteAnalytics
                  </p>
                </div>
                <div>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    GDPR Compliance
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Information about GDPR and your rights
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Account Deletion Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          if (deleteStep === 0) setShowDeleteConfirm(false);
        }}
        title="Delete Your Account"
      >
        {deleteStep === 0 && (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                ⚠️ This action cannot be undone
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This will permanently:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
              <li>Remove your profile</li>
              <li>Delete all personal data</li>
              <li>Remove your voting history</li>
              <li>Close all sessions</li>
            </ul>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleInitiateDelete}
                className="flex-1"
              >
                Continue with Deletion
              </Button>
            </div>
          </div>
        )}

        {deleteStep === 1 && (
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Enter your password to confirm account deletion:
            </p>
            <input
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
            />
            {deleteError && (
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">{deleteError}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Why are you leaving? (optional)
            </p>
            <textarea
              placeholder="Your feedback..."
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4 h-20 resize-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteStep(0)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleVerifyDelete}
                disabled={loading || !deletePassword}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                Final Confirmation Required
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Your account will be permanently deleted within 24 hours. You will be logged out immediately. This action cannot be cancelled.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => resetDeleteForm()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecuritySettings;
