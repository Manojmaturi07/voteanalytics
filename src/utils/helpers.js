/**
 * Helper Utilities
 * 
 * Collection of utility functions for date formatting, time calculations,
 * and other common operations throughout the application.
 */

/**
 * Formats a date string to a human-readable format
 * 
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string (e.g., "January 15, 2024, 10:30 AM")
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z') // Returns "January 15, 2024, 10:30 AM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Checks if a deadline date is in the past
 * 
 * @param {string|Date} deadline - ISO date string or Date object
 * @returns {boolean} True if deadline is in the past, false otherwise
 * 
 * @example
 * isPastDeadline('2024-01-01T00:00:00Z') // Returns true if current date is after Jan 1, 2024
 */
export const isPastDeadline = (deadline) => {
  if (!deadline) return true;
  
  try {
    return new Date(deadline) < new Date();
  } catch (error) {
    console.error('Error checking deadline:', error);
    return true; // Default to expired if error
  }
};

/**
 * Calculates and formats the time remaining until a deadline
 * 
 * @param {string|Date} deadline - ISO date string or Date object
 * @returns {string} Human-readable time remaining (e.g., "2 days 5 hours" or "30 minutes")
 * 
 * @example
 * getTimeRemaining('2024-12-31T23:59:59Z') // Returns "5 days 3 hours" (if current date is Dec 26)
 */
export const getTimeRemaining = (deadline) => {
  if (!deadline) return 'Expired';
  
  try {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) {
      return 'Expired';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 'Invalid date';
  }
};

/**
 * Generates a shareable link for a poll
 * 
 * @param {string} pollId - The poll ID
 * @returns {string} Full URL to the poll voting page
 * 
 * @example
 * getPollShareLink('123') // Returns "http://localhost:3000/poll/123"
 */
export const getPollShareLink = (pollId) => {
  if (!pollId) return '';
  
  try {
    return `${window.location.origin}/poll/${pollId}`;
  } catch (error) {
    console.error('Error generating share link:', error);
    return '';
  }
};


