/**
 * Bookmark Utilities
 * Connects with Backend Bookmarks API with Local Storage fallback
 */
import { bookmarksAPI, authAPI } from '../services/api.js';

const STORAGE_KEY = 'bookmarked_polls';

export const bookmarkUtilsObj = {
  addBookmark: async (pollId) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!bookmarks.includes(pollId.toString())) {
        bookmarks.push(pollId.toString());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      }
      if (authAPI.isAuthenticated()) {
        await bookmarksAPI.addBookmark(pollId).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to add bookmark:', err);
    }
  },

  removeBookmark: async (pollId) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = bookmarks.filter(id => id !== pollId.toString());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      if (authAPI.isAuthenticated()) {
        await bookmarksAPI.removeBookmark(pollId).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  },

  isBookmarked: (pollId) => {
    if (!pollId) return false;
    try {
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return bookmarks.includes(pollId.toString());
    } catch (err) {
      return false;
    }
  },

  getBookmarks: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (err) {
      return [];
    }
  },

  toggleBookmark: async (pollId) => {
    const bookmarked = bookmarkUtilsObj.isBookmarked(pollId);
    if (bookmarked) {
      await bookmarkUtilsObj.removeBookmark(pollId);
      return false;
    } else {
      await bookmarkUtilsObj.addBookmark(pollId);
      return true;
    }
  },

  clearAllBookmarks: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear bookmarks:', err);
    }
  },

  getBookmarkCount: () => {
    return bookmarkUtilsObj.getBookmarks().length;
  },
};

export const addBookmark = bookmarkUtilsObj.addBookmark;
export const removeBookmark = bookmarkUtilsObj.removeBookmark;
export const isBookmarked = bookmarkUtilsObj.isBookmarked;
export const getBookmarks = bookmarkUtilsObj.getBookmarks;
export const toggleBookmark = bookmarkUtilsObj.toggleBookmark;
export const clearAllBookmarks = bookmarkUtilsObj.clearAllBookmarks;
export const getBookmarkCount = bookmarkUtilsObj.getBookmarkCount;
export const bookmarkUtils = bookmarkUtilsObj;

export default bookmarkUtils;
