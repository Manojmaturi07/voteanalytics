/**
 * Sanitization Utilities
 * 
 * Provides input sanitization and output escaping to prevent XSS attacks.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 * 
 * @param {string} input - The user input to sanitize
 * @returns {string} Sanitized input safe for display
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags and encode special characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Escapes HTML special characters in a string
 * Prevents script injection when displaying user-generated content
 * 
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitizes HTML content while preserving safe formatting
 * Used for rich text content that needs some HTML
 * 
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'title'],
    KEEP_CONTENT: true,
  });
};

/**
 * Validates and sanitizes a URL
 * Prevents javascript: and data: URLs that could execute code
 * 
 * @param {string} url - URL to validate
 * @returns {string} Safe URL or empty string
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Reject potentially dangerous protocols
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:')) {
    return '';
  }

  // Allow relative and absolute URLs
  if (trimmed.startsWith('/') || 
      trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:')) {
    return url;
  }

  // Default to safe relative URL
  return '';
};

/**
 * Sanitizes filename to prevent directory traversal and other attacks
 * 
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') {
    return 'file';
  }

  // Remove any path separators and potentially dangerous characters
  return filename
    .replace(/[\/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit filename length
};

/**
 * Sanitizes JSON string to prevent injection
 * 
 * @param {string} jsonStr - JSON string to sanitize
 * @returns {object} Parsed object or null if invalid
 */
export const safeJsonParse = (jsonStr) => {
  try {
    // Only parse if it's a valid JSON string
    if (typeof jsonStr !== 'string' || !jsonStr.trim()) {
      return null;
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return null;
  }
};

/**
 * Trims and normalizes whitespace in input
 * 
 * @param {string} input - Input to normalize
 * @returns {string} Normalized input
 */
export const normalizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

export default {
  sanitizeInput,
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeFilename,
  safeJsonParse,
  normalizeInput,
};
