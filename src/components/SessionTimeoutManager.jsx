import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import {
  SESSION_CONFIG,
  isSessionValid,
  isSessionWarning,
  getSessionTimeRemaining,
  updateSessionActivity,
  createSession,
} from '../utils/advancedSecurity.js';
import { showToast } from '../utils/toastConfig.js';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * Session Timeout Manager Hook & Component
 * 
 * Manages user sessions with automatic timeout and warning notification.
 * Tracks user activity and extends session on interaction.
 * 
 * @component
 */
const SessionTimeoutManager = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = () => {
      const sessionData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          if (isSessionValid(parsed)) {
            setSession(parsed);
          } else {
            // Session expired
            handleSessionTimeout();
          }
        } catch (err) {
          console.error('Failed to load session:', err);
        }
      }
    };

    loadSession();
  }, []);

  // Monitor session validity and show warning
  useEffect(() => {
    if (!session) return;

    const checkSession = setInterval(() => {
      const remaining = getSessionTimeRemaining(session);
      setTimeRemaining(Math.ceil(remaining / 1000));

      if (!isSessionValid(session)) {
        handleSessionTimeout();
        clearInterval(checkSession);
      } else if (isSessionWarning(session) && !showWarning) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(checkSession);
  }, [session, showWarning]);

  // Track user activity
  const handleUserActivity = useCallback(() => {
    if (!session) return;

    if (isSessionWarning(session)) {
      // Don't extend session if in warning state
      return;
    }

    const updatedSession = updateSessionActivity(session);
    setSession(updatedSession);
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(updatedSession));
  }, [session]);

  // Add activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [handleUserActivity]);

  const handleSessionTimeout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
    showToast.warning('Your session has expired. Please log in again.');
    navigate('/login');
  };

  const handleExtendSession = () => {
    if (!session) return;

    const updatedSession = updateSessionActivity(session);
    setSession(updatedSession);
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(updatedSession));
    setShowWarning(false);
    showToast.success('Session extended for 30 more minutes');
  };

  const handleLogout = () => {
    handleSessionTimeout();
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      {/* Session Timeout Warning */}
      <Modal
        isOpen={showWarning}
        onClose={() => {}}
        title="Session Timeout Warning"
      >
        <div className="py-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Your session will expire in:
          </p>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 text-center mb-6">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Due to inactivity, your session will expire soon. Click "Stay Logged In" to continue working.
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleExtendSession}
              className="flex-1"
            >
              Stay Logged In
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Hook for managing session in components
 */
export const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const sessionData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (isSessionValid(parsed)) {
          setSession(parsed);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      }
    }
  }, []);

  return {
    session,
    isValid: session ? isSessionValid(session) : false,
    timeRemaining: session ? getSessionTimeRemaining(session) : 0,
  };
};

export default SessionTimeoutManager;
