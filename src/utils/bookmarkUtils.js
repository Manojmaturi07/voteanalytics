/**
 * Bookmark Utilities
 * Manage user bookmarked polls using localStorage
 */

const bookmarkUtilsObj = {
  /**
   * Add a poll to bookmarks
   * @param {string} pollId - Poll ID to bookmark
   */
  addBookmark: (pollId) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
      if (!bookmarks.includes(pollId)) {
        bookmarks.push(pollId);
        localStorage.setItem('bookmarked_polls', JSON.stringify(bookmarks));
      }
    } catch (err) {
      console.error('Failed to add bookmark:', err);
    }
  },

  /**
   * Remove a poll from bookmarks
   * @param {string} pollId - Poll ID to remove from bookmarks
   */
  removeBookmark: (pollId) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
      const filtered = bookmarks.filter(id => id !== pollId);
      localStorage.setItem('bookmarked_polls', JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  },

  /**
   * Check if a poll is bookmarked
   * @param {string} pollId - Poll ID to check
   * @returns {boolean} Whether poll is bookmarked
   */
  isBookmarked: (pollId) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
      return bookmarks.includes(pollId);
    } catch (err) {
      console.error('Failed to check bookmark:', err);
      return false;
    }
  },

  /**
   * Get all bookmarked poll IDs
   * @returns {array} Array of bookmarked poll IDs
   */
  getBookmarks: () => {
    try {
      return JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
    } catch (err) {
      console.error('Failed to get bookmarks:', err);
      return [];
    }
  },

  /**
   * Toggle bookmark status for a poll
   * @param {string} pollId - Poll ID to toggle
   * @returns {boolean} New bookmark status
   */
  toggleBookmark: (pollId) => {
    const isBookmarked = bookmarkUtilsObj.isBookmarked(pollId);
    if (isBookmarked) {
      bookmarkUtilsObj.removeBookmark(pollId);
      return false;
    } else {
      bookmarkUtilsObj.addBookmark(pollId);
      return true;
    }
  },

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks: () => {
    try {
      localStorage.removeItem('bookmarked_polls');
    } catch (err) {
      console.error('Failed to clear bookmarks:', err);
    }
  },

  /**
   * Get count of bookmarked polls
   * @returns {number} Number of bookmarks
   */
  getBookmarkCount: () => {
    return bookmarkUtilsObj.getBookmarks().length;
  },
};

// Export individual functions for easier importing
export const addBookmark = bookmarkUtilsObj.addBookmark;
export const removeBookmark = bookmarkUtilsObj.removeBookmark;
export const isBookmarked = bookmarkUtilsObj.isBookmarked;
export const getBookmarks = bookmarkUtilsObj.getBookmarks;
export const toggleBookmark = bookmarkUtilsObj.toggleBookmark;
export const clearAllBookmarks = bookmarkUtilsObj.clearAllBookmarks;
export const getBookmarkCount = bookmarkUtilsObj.getBookmarkCount;

// Also export as object for backward compatibility
export const bookmarkUtils = bookmarkUtilsObj;

export default bookmarkUtils;
