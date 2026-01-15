import axios from 'axios';

// Mock API base URL - replace with actual backend URL when integrating
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [], // Track votes: [{ userId, username, optionId, votedAt }]
    category: 'Technology', // Optional category
    tags: ['frontend', 'frameworks', 'web'], // Optional tags array
  },
];

// Mock users storage
let mockUsers = [
  { id: '1', username: 'john_doe', email: 'john@example.com', password: 'user123', name: 'John Doe', isActive: true, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', username: 'jane_smith', email: 'jane@example.com', password: 'user123', name: 'Jane Smith', isActive: true, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
];

let mockVotedPolls = new Map(); // Track which polls each user has voted on: userId -> Set of pollIds
let mockAdminToken = null;
let mockUserToken = null;
let currentUser = null;
let currentAdmin = null;

// Authentication API
export const authAPI = {
  // Admin login
  login: async (username, password) => {
    // Mock admin credentials
    if (username === 'admin' && password === 'admin123') {
      mockAdminToken = 'mock-admin-token-' + Date.now();
      mockUserToken = null;
      currentUser = null;
      currentAdmin = { username: 'admin', role: 'admin', name: 'Administrator' };
      return {
        success: true,
        token: mockAdminToken,
        user: { username: 'admin', role: 'admin' },
      };
    }
    
    // Check for registered admin users
    const adminUser = mockUsers.find(u => u.username === username && u.password === password && u.role === 'admin');
    if (adminUser) {
      mockAdminToken = 'mock-admin-token-' + Date.now();
      mockUserToken = null;
      currentUser = null;
      currentAdmin = { id: adminUser.id, username: adminUser.username, name: adminUser.name, role: 'admin' };
      return {
        success: true,
        token: mockAdminToken,
        user: { id: adminUser.id, username: adminUser.username, name: adminUser.name, role: 'admin' },
      };
    }
    
    // User login
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      mockUserToken = 'mock-user-token-' + Date.now();
      mockAdminToken = null;
      currentUser = { id: user.id, username: user.username, name: user.name, email: user.email };
      return {
        success: true,
        token: mockUserToken,
        user: { id: user.id, username: user.username, name: user.name, role: 'user' },
      };
    }
    
    throw new Error('Invalid credentials');
  },

  // User registration
  register: async (username, email, password, name) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if username already exists
    if (mockUsers.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      name,
    };
    
    mockUsers.push(newUser);
    return {
      success: true,
      user: { id: newUser.id, username: newUser.username, name: newUser.name },
    };
  },

  // Admin registration
  adminRegister: async (username, email, password, name) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if username already exists
    if (mockUsers.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newAdmin = {
      id: Date.now().toString(),
      username,
      email,
      password,
      name,
      role: 'admin',
    };
    
    mockUsers.push(newAdmin);
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

    // Check if email is being changed and if it's already taken by another user
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
      question: pollData.question,
      options: pollData.options.map((opt, idx) => ({
        id: (idx + 1).toString(),
        text: opt,
        votes: 0,
      })),
      deadline: pollData.deadline,
      isLocked: false,
      createdAt: new Date().toISOString(),
      votes: [], // Track votes: [{ userId, username, optionId, votedAt }]
      category: pollData.category || null, // Optional category
      tags: pollData.tags || [], // Optional tags array
    };

    mockPolls.unshift(newPoll);
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
      question: pollData.question || existingPoll.question,
      options: pollData.options 
        ? pollData.options.map((opt, idx) => ({
            id: (idx + 1).toString(),
            text: opt,
            votes: existingPoll.options[idx]?.votes || 0, // Preserve vote counts
          }))
        : existingPoll.options,
      deadline: pollData.deadline || existingPoll.deadline,
      category: pollData.category !== undefined ? pollData.category : existingPoll.category,
      tags: pollData.tags !== undefined ? pollData.tags : existingPoll.tags,
    };

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

    // Return users without passwords
    const safeUsers = mockUsers.map(({ password, ...user }) => ({
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

    return { 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        name: user.name, 
        email: user.email,
        isActive: user.isActive 
      } 
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

    return { success: true };
  },
};

export default api;


