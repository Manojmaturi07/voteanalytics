/**
 * Toast Notification Configuration
 * Centralized toast utility for consistent notifications across the app
 * 
 * Defensive: Safely handles cases where react-toastify might not be available
 * To install: npm install react-toastify
 */
import { toast } from 'react-toastify';

// Fallback toast functions if react-toastify fails (defensive coding)
const fallbackToast = {
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.error('❌', msg),
  warning: (msg) => console.warn('⚠️', msg),
  info: (msg) => console.info('ℹ️', msg),
  loading: (msg) => { console.log('⏳', msg); return null; },
  update: () => {},
};

// Use toast if available, otherwise use fallback
const safeToast = toast || fallbackToast;

export const showToast = {
  success: (message, options = {}) => {
    try {
      safeToast.success(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } catch (err) {
      console.log('✅', message);
    }
  },

  error: (message, options = {}) => {
    try {
      safeToast.error(message, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } catch (err) {
      console.error('❌', message);
    }
  },

  warning: (message, options = {}) => {
    try {
      safeToast.warning(message, {
        position: 'top-right',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } catch (err) {
      console.warn('⚠️', message);
    }
  },

  info: (message, options = {}) => {
    try {
      safeToast.info(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options,
      });
    } catch (err) {
      console.info('ℹ️', message);
    }
  },

  loading: (message, options = {}) => {
    try {
      return safeToast.loading(message, {
        position: 'top-right',
        ...options,
      });
    } catch (err) {
      console.log('⏳', message);
      return null;
    }
  },

  update: (toastId, options = {}) => {
    if (!toastId) return;
    try {
      safeToast.update(toastId, {
        autoClose: 3000,
        ...options,
      });
    } catch (err) {
      // Silently fail
    }
  },
};

export default showToast;
