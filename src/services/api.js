import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler.js';

/**
 * API Service for VoteAnalytics
 * 
 * Connected to Spring Boot 3 & MySQL 8 Backend.
 * Base URL: http://localhost:8080/api (configured via VITE_API_BASE_URL)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create Axios HTTP client
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  CURRENT_USER: 'current_user',
  SESSION: 'voteanalytics_session',
  VOTED_POLLS: 'voteanalytics_voted_cache',
};

// Local cache for synchronous hasVoted checks
let localVotedPolls = new Set();
try {
  const cachedVotes = localStorage.getItem(STORAGE_KEYS.VOTED_POLLS);
  if (cachedVotes) {
    localVotedPolls = new Set(JSON.parse(cachedVotes));
  }
} catch (e) {
  localVotedPolls = new Set();
}

const persistVotedCache = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.VOTED_POLLS, JSON.stringify(Array.from(localVotedPolls)));
  } catch (e) {
    // Ignore storage quota errors
  }
};

// Request interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract errors and format responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if unauthorized or token expired
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url && error.config.url.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }

    const message = error.response?.data?.message || getErrorMessage(error, 'An unexpected server error occurred');
    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

// Helper to normalize user role
const normalizeRole = (role) => {
  if (!role) return 'user';
  return role.toString().toLowerCase().replace('role_', '');
};

// Helper to store session
const storeSessionData = (token, user, refreshToken) => {
  if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

  const normalizedUser = {
    ...user,
    role: normalizeRole(user.role),
  };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalizedUser));

  const sessionData = {
    userId: user.id,
    username: user.username,
    role: normalizedUser.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    lastActivity: Date.now(),
    token,
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

  return normalizedUser;
};

// ==============================================================================
// Authentication API
// ==============================================================================
export const authAPI = {
  login: async (username, password, twoFactorCode = null) => {
    const response = await api.post('/auth/login', {
      username: username.trim(),
      password,
      twoFactorCode,
    });

    const data = response.data;
    if (data.requiresTwoFactor) {
      return {
        success: false,
        requiresTwoFactor: true,
        user: data.user,
      };
    }

    const normalizedUser = storeSessionData(data.token, data.user, data.refreshToken);

    return {
      success: true,
      token: data.token,
      user: normalizedUser,
    };
  },

  register: async (username, email, password, name) => {
    const response = await api.post('/auth/register', {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });

    const data = response.data;
    const normalizedUser = storeSessionData(data.token, data.user, data.refreshToken);

    return {
      success: true,
      token: data.token,
      user: normalizedUser,
    };
  },

  adminRegister: async (username, email, password, name) => {
    const response = await api.post('/auth/admin/register', {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });

    const data = response.data;
    const normalizedUser = storeSessionData(data.token, data.user, data.refreshToken);

    return {
      success: true,
      token: data.token,
      user: normalizedUser,
    };
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', {
      name: profileData.name ? profileData.name.trim() : undefined,
      email: profileData.email ? profileData.email.trim().toLowerCase() : undefined,
    });

    const updatedUser = response.data.data;
    const normalizedUser = {
      ...updatedUser,
      role: normalizeRole(updatedUser.role),
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(normalizedUser));

    return {
      success: true,
      user: normalizedUser,
    };
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    return { success: true };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getCurrentAdmin: () => {
    const user = authAPI.getCurrentUser();
    if (user && (user.role === 'admin' || user.role === 'ADMIN')) {
      return user;
    }
    return null;
  },

  isAdmin: () => {
    return authAPI.getCurrentAdmin() !== null;
  },

  isUser: () => {
    const user = authAPI.getCurrentUser();
    return authAPI.isAuthenticated() && user && (user.role === 'user' || user.role === 'USER');
  },

  restoreSession: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      if (user) {
        storeSessionData(token, user);
        return true;
      }
    } catch (err) {
      authAPI.logout();
    }
    return false;
  },

  // 2FA Endpoints
  setupTwoFactor: async () => {
    const res = await api.post('/auth/2fa/setup');
    return res.data.data;
  },

  verifyTwoFactor: async (code) => {
    const res = await api.post('/auth/2fa/verify', { code });
    return res.data;
  },

  disableTwoFactor: async () => {
    const res = await api.post('/auth/2fa/disable');
    return res.data;
  },

  generateBackupCodes: async () => {
    const res = await api.post('/auth/2fa/backup-codes');
    return res.data.data;
  },
};

// ==============================================================================
// Polls API
// ==============================================================================
export const pollsAPI = {
  // Public voter list (all active, published polls)
  getAllPolls: async () => {
    const response = await api.get('/polls');
    const polls = response.data.data || response.data || [];
    return { data: polls };
  },

  // Admin isolated list (only polls created by the logged-in admin)
  getAdminPolls: async () => {
    const response = await api.get('/polls/admin/my-polls');
    const polls = response.data.data || response.data || [];
    return { data: polls };
  },

  // Single poll details
  getPollById: async (pollId) => {
    const response = await api.get(`/polls/${pollId}`);
    const poll = response.data.data || response.data;
    if (poll && poll.hasVoted) {
      localVotedPolls.add(poll.id.toString());
      persistVotedCache();
    }
    return { data: poll };
  },

  // Create new poll
  createPoll: async (pollData) => {
    const response = await api.post('/polls', {
      question: pollData.question,
      options: pollData.options,
      deadline: pollData.deadline,
      category: pollData.category || null,
      tags: pollData.tags || [],
      isAnonymous: pollData.isAnonymous || false,
    });
    return { data: response.data.data || response.data };
  },

  // Update existing poll
  updatePoll: async (pollId, pollData) => {
    const response = await api.put(`/polls/${pollId}`, {
      question: pollData.question,
      options: pollData.options,
      deadline: pollData.deadline,
      category: pollData.category !== undefined ? pollData.category : null,
      tags: pollData.tags || [],
      isPublished: pollData.isPublished !== undefined ? pollData.isPublished : true,
    });
    return { data: response.data.data || response.data };
  },

  // Delete poll
  deletePoll: async (pollId) => {
    await api.delete(`/polls/${pollId}`);
    return { success: true };
  },

  // Submit vote
  submitVote: async (pollId, optionId) => {
    const response = await api.post(`/polls/${pollId}/vote`, {
      optionId: Number(optionId),
    });
    localVotedPolls.add(pollId.toString());
    persistVotedCache();
    return { data: response.data.data || response.data };
  },

  // Synchronous voted check (for immediate UI state)
  hasVoted: (pollId) => {
    if (!pollId) return false;
    return localVotedPolls.has(pollId.toString());
  },

  // Async server voted check
  checkHasVoted: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/has-voted`);
    const voted = Boolean(response.data.data);
    if (voted) {
      localVotedPolls.add(pollId.toString());
      persistVotedCache();
    }
    return voted;
  },

  // Poll voting results
  getPollResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return { data: response.data.data || response.data };
  },

  // Admin audit voting details
  getPollVotingDetails: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/voting-details`);
    return { data: response.data.data || response.data || [] };
  },
};

// ==============================================================================
// User Management API (Admin only)
// ==============================================================================
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return { data: response.data.data || response.data || [] };
  },

  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/status`);
    return {
      success: true,
      user: response.data.data || response.data,
    };
  },

  deleteUser: async (userId) => {
    await api.delete(`/admin/users/${userId}`);
    return { success: true };
  },
};

// ==============================================================================
// Bookmarks API
// ==============================================================================
export const bookmarksAPI = {
  getBookmarks: async () => {
    const response = await api.get('/users/bookmarks');
    return { data: response.data.data || response.data || [] };
  },

  addBookmark: async (pollId) => {
    const response = await api.post(`/users/bookmarks/${pollId}`);
    return response.data;
  },

  removeBookmark: async (pollId) => {
    await api.delete(`/users/bookmarks/${pollId}`);
    return { success: true };
  },
};

// ==============================================================================
// Comments API
// ==============================================================================
export const commentsAPI = {
  getComments: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/comments`);
    return { data: response.data.data || response.data || [] };
  },

  addComment: async (pollId, text) => {
    const response = await api.post(`/polls/${pollId}/comments`, { text });
    return { data: response.data.data || response.data };
  },

  deleteComment: async (commentId) => {
    await api.delete(`/comments/${commentId}`);
    return { success: true };
  },
};

export default api;
