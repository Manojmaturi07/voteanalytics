import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler.js';
import { 
  hashPassword, 
  comparePassword, 
  validateCredentials,
  storeSecureSession,
  retrieveSecureSession,
  clearSecureSession,
  generateSessionToken 
} from '../utils/authSecurity.js';
import { sanitizeInput, sanitizeFilename } from '../utils/sanitizer.js';

/**
 * API Service
 * 
 * Centralized API service for handling all backend communication.
 * Uses mock data for development. Replace with actual backend URLs in production.
 * 
 * SECURITY ENHANCEMENTS:
 * - Password hashing using bcryptjs
 * - Secure session management with localStorage
 * - Input sanitization to prevent XSS
 * - Environment-based configuration
 */

// Mock API base URL - read from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for standardized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transform error to have consistent structure
    const message = getErrorMessage(error, 'An unexpected error occurred');
    const enhancedError = new Error(message);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
  }
);

// Mock data storage (in real app, this would be on the backend)
let mockPolls = [
  {
    id: '1',
    question: 'What is your favorite programming language?',
    options: [
      { id: '1', text: 'JavaScript', votes: 15 },
      { id: '2', text: 'Python', votes: 12 },
      { id: '3', text: 'Java', votes: 8 },
      { id: '4', text: 'C++', votes: 5 },
    ],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: false,
    isPublished: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [], // Track votes: [{ userId, username, optionId, votedAt }]
    category: 'Technology', // Optional category
    tags: ['programming', 'languages', 'development'], // Optional tags array
  },
  {
    id: '2',
    question: 'Which framework do you prefer for frontend development?',
    options: [
      { id: '1', text: 'React', votes: 20 },
      { id: '2', text: 'Vue', votes: 10 },
      { id: '3', text: 'Angular', votes: 6 },
    ],
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: false,
    isPublished: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [], // Track votes: [{ userId, username, optionId, votedAt }]
    category: 'Technology', // Optional category
    tags: ['frontend', 'frameworks', 'web'], // Optional tags array
  },
];

// Mock users storage with hashed passwords
// NOTE: In production, this should be on the backend with proper database
let mockUsers = [
  { 
    id: '1', 
    username: 'john_doe', 
    email: 'john@example.com', 
    passwordHash: '$2a$10$avnCtQQZ.RGZW.ClBkPryeUeNKoVS89p1NqP7z/3E3necccY.a3.sG', // hashed 'user123'
    name: 'John Doe', 
    isActive: true, 
    role: 'user',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    id: '2', 
    username: 'jane_smith', 
    email: 'jane@example.com', 
    passwordHash: '$2a$10$avnCtQQZ.RGZW.ClBkPryeUeNKoVS89p1NqP7z/3E3necccY.a3.sG', // hashed 'user123'
    name: 'Jane Smith', 
    isActive: true, 
    role: 'user',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() 
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2a$10$BneV8JJ/I8Ren11iqaUpw.krU4F1IYrTob5ys4tldBngU6W6YAHve', // hashed 'admin123'
    name: 'Administrator',
    isActive: true,
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Persistent data storage keys
const STORAGE_KEYS = {
  POLLS: 'voteanalytics_polls',
  USERS: 'voteanalytics_users',
  VOTES: 'voteanalytics_votes',
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
  ADMIN_SESSION: 'admin_session',
};

// Default users with verified bcryptjs hashes
const DEFAULT_USERS = [
  { 
    id: '1', 
    username: 'john_doe', 
    email: 'john@example.com', 
    passwordHash: '$2a$10$nRm7cWau1ob5.jhiOUq1LOdudsqRXWvSUR29iCMI9NKHWBuXcWzz6', // hashed 'user123'
    name: 'John Doe', 
    isActive: true, 
    role: 'user',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    id: '2', 
    username: 'jane_smith', 
    email: 'jane@example.com', 
    passwordHash: '$2a$10$nRm7cWau1ob5.jhiOUq1LOdudsqRXWvSUR29iCMI9NKHWBuXcWzz6', // hashed 'user123'
    name: 'Jane Smith', 
    isActive: true, 
    role: 'user',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() 
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2a$10$4LloGuBoNHAs/qjItnt3DuGUCNCIzrEd6CiGNWrNxiO.AaIVJoEqG', // hashed 'admin123'
    name: 'Administrator',
    isActive: true,
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Validate if users have valid password hashes
const hasValidHashes = (users) => {
  if (!Array.isArray(users) || users.length === 0) return false;
  
  // Check if users have proper bcryptjs hash format ($2a$10$...)
  return users.some(u => u.passwordHash && u.passwordHash.startsWith('$2a$10$'));
};

// Load persistent data or use mock data
const loadPersistentData = () => {
  try {
    const persistedPolls = localStorage.getItem(STORAGE_KEYS.POLLS);
    const persistedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    
    if (persistedPolls) {
      mockPolls = JSON.parse(persistedPolls);
    }
    
    // Only load persisted users if they have valid hashes
    if (persistedUsers) {
      const parsedUsers = JSON.parse(persistedUsers);
      if (hasValidHashes(parsedUsers)) {
        mockUsers = parsedUsers;
      } else {
        // If hashes are invalid, use defaults and clear corrupted data
        mockUsers = JSON.parse(JSON.stringify(DEFAULT_USERS));
        localStorage.removeItem(STORAGE_KEYS.USERS);
      }
    } else {
      // If no persisted users, use defaults
      mockUsers = JSON.parse(JSON.stringify(DEFAULT_USERS));
    }
  } catch (error) {
    console.warn('Failed to load persistent data, using defaults:', error);
    mockUsers = JSON.parse(JSON.stringify(DEFAULT_USERS));
  }
};

// Save data to localStorage for persistence
const persistData = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(mockPolls));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  } catch (error) {
    console.error('Failed to persist data:', error);
  }
};

// Initialize persistent data on load
loadPersistentData();

// If no users in localStorage, use default mock users with proper hashes
if (mockUsers.length === 0) {
  mockUsers = [
    { 
      id: '1', 
      username: 'john_doe', 
      email: 'john@example.com', 
      passwordHash: '$2a$10$avnCtQQZ.RGZW.ClBkPryeUeNKoVS89p1NqP7z/3E3necccY.a3.sG', // hashed 'user123'
      name: 'John Doe', 
      isActive: true, 
      role: 'user',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
    },
    { 
      id: '2', 
      username: 'jane_smith', 
      email: 'jane@example.com', 
      passwordHash: '$2a$10$avnCtQQZ.RGZW.ClBkPryeUeNKoVS89p1NqP7z/3E3necccY.a3.sG', // hashed 'user123'
      name: 'Jane Smith', 
      isActive: true, 
      role: 'user',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() 
    },
    {
      id: '3',
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: '$2a$10$BneV8JJ/I8Ren11iqaUpw.krU4F1IYrTob5ys4tldBngU6W6YAHve', // hashed 'admin123'
      name: 'Administrator',
      isActive: true,
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  persistData();
}

let mockVotedPolls = new Map(); // Track which polls each user has voted on: userId -> Set of pollIds
let mockAdminToken = null;
let mockUserToken = null;
let currentUser = null;
let currentAdmin = null;

// Authentication API
export const authAPI = {
  // Admin/User login with password hashing
  login: async (username, password) => {
    // Validate credentials format
    const validation = validateCredentials(username, password);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    // Sanitize input
    const sanitizedUsername = sanitizeInput(username).trim();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists
    const user = mockUsers.find(u => u.username === sanitizedUsername);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password with hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new Error('This account has been deactivated');
    }

    // Generate secure session token
    const sessionToken = generateSessionToken();

    // Store session data in localStorage
    const sessionData = {
      token: sessionToken,
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString(),
    };

    storeSecureSession(STORAGE_KEYS.AUTH_TOKEN, sessionData);
    storeSecureSession(STORAGE_KEYS.CURRENT_USER, {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Update internal state
    if (user.role === 'admin') {
      mockAdminToken = sessionToken;
      mockUserToken = null;
      currentUser = null;
      currentAdmin = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: 'admin',
      };
    } else {
      mockUserToken = sessionToken;
      mockAdminToken = null;
      currentUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      };
      currentAdmin = null;
    }

    return {
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  },

  // User registration with password hashing
  register: async (username, email, password, name) => {
    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username).trim();
    const sanitizedEmail = sanitizeInput(email).trim().toLowerCase();
    const sanitizedName = sanitizeInput(name).trim();

    // Validate credentials
    const validation = validateCredentials(sanitizedUsername, password);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Please enter a valid email address');
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if username already exists (case-insensitive)
    if (mockUsers.find(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase())) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (mockUsers.find(u => u.email.toLowerCase() === sanitizedEmail)) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newUser = {
      id: Date.now().toString(),
      username: sanitizedUsername,
      email: sanitizedEmail,
      passwordHash,
      name: sanitizedName,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    persistData();

    return {
      success: true,
      user: { id: newUser.id, username: newUser.username, name: newUser.name },
    };
  },

  // Admin registration with password hashing
  adminRegister: async (username, email, password, name) => {
    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username).trim();
    const sanitizedEmail = sanitizeInput(email).trim().toLowerCase();
    const sanitizedName = sanitizeInput(name).trim();

    // Validate credentials
    const validation = validateCredentials(sanitizedUsername, password);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Please enter a valid email address');
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if username already exists
    if (mockUsers.find(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase())) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (mockUsers.find(u => u.email.toLowerCase() === sanitizedEmail)) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newAdmin = {
      id: Date.now().toString(),
      username: sanitizedUsername,
      email: sanitizedEmail,
      passwordHash,
      name: sanitizedName,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newAdmin);
    persistData();

    return {
      success: true,
      user: { id: newAdmin.id, username: newAdmin.username, name: newAdmin.name, role: 'admin' },
    };
  },

  // Update user profile
  updateProfile: async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!authAPI.isUser()) {
      throw new Error('You must be logged in to update your profile');
    }

    const userId = currentUser.id;
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Sanitize input data
    if (profileData.name) {
      profileData.name = sanitizeInput(profileData.name).trim();
    }
    if (profileData.email) {
      profileData.email = sanitizeInput(profileData.email).trim().toLowerCase();
    }

    // Check if email is being changed and if it's already taken
    if (profileData.email && profileData.email !== user.email) {
      const emailExists = mockUsers.find(u => u.email === profileData.email && u.id !== userId);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Update user data
    user.name = profileData.name || user.name;
    user.email = profileData.email || user.email;

    // Update current user object
    currentUser.name = user.name;
    currentUser.email = user.email;

    persistData();

    return {
      success: true,
      user: { id: user.id, username: user.username, name: user.name, email: user.email },
    };
  },

  logout: () => {
    mockAdminToken = null;
    mockUserToken = null;
    currentUser = null;
    currentAdmin = null;
    clearSecureSession();
    return Promise.resolve({ success: true });
  },

  isAuthenticated: () => {
    return mockAdminToken !== null || mockUserToken !== null;
  },

  isAdmin: () => {
    return mockAdminToken !== null;
  },

  isUser: () => {
    return mockUserToken !== null;
  },

  getCurrentUser: () => {
    return currentUser;
  },

  getCurrentAdmin: () => {
    return currentAdmin;
  },

  // Restore session from localStorage if available
  restoreSession: () => {
    const session = retrieveSecureSession(STORAGE_KEYS.AUTH_TOKEN);
    if (session) {
      // Verify session is still valid (optional: add expiration check)
      const user = mockUsers.find(u => u.id === session.userId);
      if (user) {
        if (session.role === 'admin') {
          mockAdminToken = session.token;
          currentAdmin = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: 'admin',
          };
        } else {
          mockUserToken = session.token;
          currentUser = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
          };
        }
        return true;
      }
    }
    return false;
  },
};

// Polls API
export const pollsAPI = {
  // Get all polls (admin)
  getAllPolls: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if polls are past deadline and lock them
    mockPolls = mockPolls.map((poll) => {
      if (!poll.isLocked && new Date(poll.deadline) < new Date()) {
        return { ...poll, isLocked: true };
      }
      return poll;
    });

    return { data: mockPolls };
  },

  // Get single poll by ID
  getPollById: async (pollId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const poll = mockPolls.find((p) => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    // Check if poll is past deadline
    if (!poll.isLocked && new Date(poll.deadline) < new Date()) {
      poll.isLocked = true;
    }

    return { data: poll };
  },

  // Create new poll (admin)
  createPoll: async (pollData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPoll = {
      id: Date.now().toString(),
      question: sanitizeInput(pollData.question),
      options: pollData.options.map((opt, idx) => ({
        id: (idx + 1).toString(),
        text: sanitizeInput(opt),
        votes: 0,
      })),
      deadline: pollData.deadline,
      isLocked: false,
      isPublished: false,
      createdAt: new Date().toISOString(),
      votes: [],
      category: sanitizeInput(pollData.category || ''),
      tags: (pollData.tags || []).map(tag => sanitizeInput(tag)),
    };

    mockPolls.unshift(newPoll);
    persistData();
    return { data: newPoll };
  },

  // Update poll (admin)
  updatePoll: async (pollId, pollData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const pollIndex = mockPolls.findIndex((p) => p.id === pollId);
    if (pollIndex === -1) {
      throw new Error('Poll not found');
    }

    const existingPoll = mockPolls[pollIndex];

    // Update poll while preserving votes and other data
    mockPolls[pollIndex] = {
      ...existingPoll,
      question: pollData.question ? sanitizeInput(pollData.question) : existingPoll.question,
      options: pollData.options
        ? pollData.options.map((opt, idx) => ({
            id: (idx + 1).toString(),
            text: sanitizeInput(opt),
            votes: existingPoll.options[idx]?.votes || 0,
          }))
        : existingPoll.options,
      deadline: pollData.deadline || existingPoll.deadline,
      category: pollData.category !== undefined ? sanitizeInput(pollData.category) : existingPoll.category,
      tags: pollData.tags !== undefined ? pollData.tags.map(tag => sanitizeInput(tag)) : existingPoll.tags,
      isPublished: pollData.isPublished !== undefined ? pollData.isPublished : existingPoll.isPublished,
    };

    persistData();
    return { data: mockPolls[pollIndex] };
  },

  // Submit vote
  submitVote: async (pollId, optionId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!authAPI.isUser()) {
      throw new Error('You must be logged in to vote');
    }

    const userId = currentUser.id;
    const userVotedPolls = mockVotedPolls.get(userId) || new Set();

    if (userVotedPolls.has(pollId)) {
      throw new Error('You have already voted on this poll');
    }

    const poll = mockPolls.find((p) => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.isLocked) {
      throw new Error('This poll is locked');
    }

    if (new Date(poll.deadline) < new Date()) {
      poll.isLocked = true;
      persistData();
      throw new Error('This poll has expired');
    }

    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error('Invalid option');
    }

    // Increment vote count
    option.votes += 1;

    // Track the vote with user information
    poll.votes.push({
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      optionId: optionId,
      optionText: option.text,
      votedAt: new Date().toISOString(),
    });

    // Mark that this user has voted on this poll
    userVotedPolls.add(pollId);
    mockVotedPolls.set(userId, userVotedPolls);

    persistData();
    return { data: poll };
  },

  // Check if user has voted
  hasVoted: (pollId) => {
    if (!authAPI.isUser()) {
      return false;
    }
    const userId = currentUser.id;
    const userVotedPolls = mockVotedPolls.get(userId) || new Set();
    return userVotedPolls.has(pollId);
  },

  // Get voting details for a poll (admin only)
  getPollVotingDetails: async (pollId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const poll = mockPolls.find((p) => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    return { data: poll.votes || [] };
  },

  // Get poll results
  getPollResults: async (pollId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const poll = mockPolls.find((p) => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    return { data: poll };
  },

  // Delete poll (admin)
  deletePoll: async (pollId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const existingLength = mockPolls.length;
    mockPolls = mockPolls.filter((p) => p.id !== pollId);

    if (mockPolls.length === existingLength) {
      throw new Error('Poll not found');
    }

    persistData();
    return { success: true };
  },
};

// User Management API (Admin only)
export const usersAPI = {
  // Get all users (admin)
  getAllUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Return users without password hashes
    const safeUsers = mockUsers.map(({ passwordHash, ...user }) => ({
      ...user,
      isActive: user.isActive !== undefined ? user.isActive : true,
    }));

    return { data: safeUsers };
  },

  // Toggle user active status (admin)
  toggleUserStatus: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = !(user.isActive !== undefined ? user.isActive : true);
    persistData();

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    };
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!authAPI.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers.splice(userIndex, 1);
    persistData();

    return { success: true };
  },
};

export default api;


