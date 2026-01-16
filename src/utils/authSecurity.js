/**
 * Authentication Security Service
 * 
 * Handles password hashing, encryption, and secure authentication operations.
 * Note: In production, password hashing should occur on the backend.
 */

import * as bcryptjs from 'bcryptjs';
import { normalizeInput, sanitizeInput } from './sanitizer.js';

/**
 * Hash a password using bcryptjs
 * 
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password, saltRounds = 10) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }

  try {
    const hash = await bcryptjs.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash || typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }

  try {
    const isMatch = await bcryptjs.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

/**
 * Validates and sanitizes credentials before authentication
 * 
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and errors
 */
export const validateCredentials = (username, password) => {
  const errors = {};

  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  } else if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitizes username for safe storage
 * 
 * @param {string} username - Raw username
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
  return normalizeInput(sanitizeInput(username));
};

/**
 * Generates a secure session token
 * 
 * @returns {string} Random session token
 */
export const generateSessionToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Stores secure session data in localStorage
 * 
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} Success status
 */
export const storeSecureSession = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

/**
 * Retrieves secure session data from localStorage
 * 
 * @param {string} key - Storage key
 * @returns {any} Stored data or null if not found
 */
export const retrieveSecureSession = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
};

/**
 * Clears all sensitive session data
 * 
 * @returns {boolean} Success status
 */
export const clearSecureSession = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('admin_session');
    localStorage.removeItem('current_user');
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};

export default {
  hashPassword,
  comparePassword,
  validateCredentials,
  sanitizeUsername,
  generateSessionToken,
  storeSecureSession,
  retrieveSecureSession,
  clearSecureSession,
};
