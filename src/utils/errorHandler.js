/**
 * Error Handler Utilities
 * 
 * Standardized error handling utilities for parsing and displaying
 * API errors and other exceptions throughout the application.
 */

/**
 * Extracts a user-friendly error message from an error object
 * 
 * @param {Error|Object|string} error - The error object, response, or string
 * @param {string} defaultMessage - Default message if error cannot be parsed
 * @returns {string} User-friendly error message
 * 
 * @example
 * const message = getErrorMessage(error, 'Something went wrong');
 */
export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (!error) {
    return defaultMessage;
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, return the message
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // If it's an axios error response
  if (error.response) {
    // Try to get message from response data
    const data = error.response.data;
    if (data) {
      if (typeof data === 'string') {
        return data;
      }
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return typeof data.error === 'string' ? data.error : data.error.message || defaultMessage;
      }
    }
    // Fallback to status text
    return error.response.statusText || defaultMessage;
  }

  // If it's an object with a message property
  if (error.message) {
    return error.message;
  }

  // Last resort: stringify the error
  try {
    return JSON.stringify(error);
  } catch {
    return defaultMessage;
  }
};

/**
 * Checks if an error is a network error
 * 
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if error is a network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  // Axios network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return true;
  }
  
  // Check for common network error patterns
  if (error.message && (
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout')
  )) {
    return true;
  }
  
  return false;
};

/**
 * Checks if an error is an authentication error
 * 
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if error is an authentication error
 */
export const isAuthError = (error) => {
  if (!error) return false;
  
  // Check status code
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    return true;
  }
  
  // Check error message
  if (error.message && (
    error.message.toLowerCase().includes('unauthorized') ||
    error.message.toLowerCase().includes('forbidden') ||
    error.message.toLowerCase().includes('authentication') ||
    error.message.toLowerCase().includes('login')
  )) {
    return true;
  }
  
  return false;
};

/**
 * Safely handles API errors with standardized error messages
 * 
 * @param {Error|Object} error - The error from API call
 * @param {Object} options - Options for error handling
 * @param {string} options.defaultMessage - Default error message
 * @param {Function} options.onError - Callback function to execute on error
 * @returns {string} User-friendly error message
 * 
 * @example
 * try {
 *   await api.call();
 * } catch (error) {
 *   const message = handleApiError(error, {
 *     defaultMessage: 'Failed to load data',
 *     onError: (msg) => showToast.error(msg)
 *   });
 * }
 */
export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = 'An error occurred. Please try again.',
    onError = null
  } = options;

  const message = getErrorMessage(error, defaultMessage);
  
  // Log error for debugging
  console.error('API Error:', error);
  
  // Execute callback if provided
  if (onError && typeof onError === 'function') {
    onError(message);
  }
  
  return message;
};

/**
 * Validates and formats error for display
 * 
 * @param {any} error - Error to validate
 * @returns {Object} Formatted error object with message and type
 */
export const formatError = (error) => {
  const message = getErrorMessage(error);
  const isNetwork = isNetworkError(error);
  const isAuth = isAuthError(error);
  
  return {
    message,
    isNetwork,
    isAuth,
    originalError: error
  };
};

