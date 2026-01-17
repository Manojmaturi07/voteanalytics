/**
 * Advanced Security Features
 * 
 * Implements:
 * - Email verification tokens
 * - Two-Factor Authentication (2FA) with TOTP
 * - Rate limiting
 * - Session management with timeout
 * - Account deletion (GDPR compliance)
 */

/**
 * EMAIL VERIFICATION
 */

/**
 * Generate email verification token
 * @returns {string} Verification token (32 characters)
 */
export const generateVerificationToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Generate 2FA secret (TOTP-compatible)
 * @returns {string} Base32 encoded secret for 2FA
 */
export const generate2FASecret = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return secret;
};

/**
 * Generate TOTP code from secret (simplified, without external dependency)
 * @param {string} secret - Base32 encoded secret
 * @returns {string} 6-digit TOTP code
 */
export const generateTOTPCode = (secret) => {
  if (!secret) return '000000';
  
  // Simplified TOTP generation (for production, use speakeasy or similar library)
  const time = Math.floor(Date.now() / 1000 / 30);
  const hash = Math.abs(
    secret.split('').reduce((acc, char, idx) => {
      return acc + char.charCodeAt(0) * (idx + 1);
    }, 0)
  );
  const code = String((hash * time) % 1000000).padStart(6, '0');
  return code;
};

/**
 * RATE LIMITING
 */

class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs; // 15 minutes by default
    this.attempts = new Map(); // key: identifier, value: [timestamps]
  }

  /**
   * Check if action is allowed
   * @param {string} identifier - Unique identifier (IP, user ID, email, etc.)
   * @returns {{allowed: boolean, remaining: number, resetTime: number}}
   */
  checkLimit(identifier) {
    const now = Date.now();
    const key = `${identifier}`;

    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const timestamps = this.attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = timestamps.filter(time => now - time < this.windowMs);
    this.attempts.set(key, validAttempts);

    const allowed = validAttempts.length < this.maxAttempts;
    
    if (allowed) {
      validAttempts.push(now);
    }

    const resetTime = validAttempts.length > 0 
      ? validAttempts[0] + this.windowMs 
      : now + this.windowMs;

    return {
      allowed,
      remaining: Math.max(0, this.maxAttempts - validAttempts.length),
      resetTime,
      minutesUntilReset: Math.ceil((resetTime - now) / 60000),
    };
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Identifier to reset
   */
  reset(identifier) {
    this.attempts.delete(identifier);
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clearAll() {
    this.attempts.clear();
  }
}

// Rate limiters for different actions
export const rateLimiters = {
  // Login attempts: 5 attempts per 15 minutes
  login: new RateLimiter(5, 15 * 60 * 1000),
  
  // Registration attempts: 3 per 60 minutes (per IP/email)
  registration: new RateLimiter(3, 60 * 60 * 1000),
  
  // Vote attempts: 10 votes per 5 minutes (per user per poll)
  voting: new RateLimiter(10, 5 * 60 * 1000),
  
  // 2FA code attempts: 5 attempts per 15 minutes
  twoFA: new RateLimiter(5, 15 * 60 * 1000),
  
  // Password reset requests: 3 per 24 hours
  passwordReset: new RateLimiter(3, 24 * 60 * 60 * 1000),
};

/**
 * SESSION MANAGEMENT
 */

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  TIMEOUT: 30 * 60 * 1000,
  
  // Warning time before session expires (5 minutes)
  WARNING_TIME: 5 * 60 * 1000,
  
  // Storage key for session data
  STORAGE_KEY: 'voteanalytics_session',
};

/**
 * Create a new session
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} role - User role (user/admin)
 * @returns {Object} Session object
 */
export const createSession = (userId, username, role) => {
  const now = Date.now();
  return {
    userId,
    username,
    role,
    createdAt: now,
    expiresAt: now + SESSION_CONFIG.TIMEOUT,
    lastActivity: now,
    token: generateVerificationToken(),
  };
};

/**
 * Update session activity timestamp
 * @param {Object} session - Session object
 * @returns {Object} Updated session
 */
export const updateSessionActivity = (session) => {
  if (!session) return null;
  
  return {
    ...session,
    lastActivity: Date.now(),
    expiresAt: Date.now() + SESSION_CONFIG.TIMEOUT,
  };
};

/**
 * Check if session is still valid
 * @param {Object} session - Session object
 * @returns {boolean} True if session is valid
 */
export const isSessionValid = (session) => {
  if (!session) return false;
  return Date.now() < session.expiresAt;
};

/**
 * Check if session is about to expire
 * @param {Object} session - Session object
 * @returns {boolean} True if session expires within WARNING_TIME
 */
export const isSessionWarning = (session) => {
  if (!session) return false;
  const timeUntilExpiry = session.expiresAt - Date.now();
  return timeUntilExpiry <= SESSION_CONFIG.WARNING_TIME && timeUntilExpiry > 0;
};

/**
 * Get time remaining for session
 * @param {Object} session - Session object
 * @returns {number} Milliseconds remaining
 */
export const getSessionTimeRemaining = (session) => {
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
};

/**
 * ACCOUNT DELETION (GDPR Compliance)
 */

/**
 * Prepare account deletion
 * This generates a deletion request that requires confirmation
 * @param {string} userId - User ID
 * @param {string} reason - Optional deletion reason
 * @returns {Object} Deletion request object
 */
export const createDeletionRequest = (userId, reason = '') => {
  return {
    userId,
    requestedAt: Date.now(),
    confirmAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hour grace period
    reason,
    status: 'pending',
    confirmationToken: generateVerificationToken(),
  };
};

/**
 * Anonymize user data for GDPR compliance
 * @param {Object} user - User object
 * @returns {Object} Anonymized user object
 */
export const anonymizeUserData = (user) => {
  return {
    id: user.id,
    username: `deleted_${Date.now()}`,
    email: `deleted_${user.id}@deleted.local`,
    name: 'Deleted User',
    passwordHash: null,
    emailVerified: false,
    twoFactorSecret: null,
    isActive: false,
    role: 'user',
    createdAt: user.createdAt,
    deletedAt: Date.now(),
    dataAnonymized: true,
  };
};

/**
 * Prepare data export for user (right to data portability)
 * @param {Object} user - User object
 * @param {Array} userVotes - User's voting history
 * @param {Array} userPolls - User's created polls (if admin)
 * @returns {Object} User data export
 */
export const prepareUserDataExport = (user, userVotes = [], userPolls = []) => {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified || false,
      twoFactorEnabled: !!user.twoFactorSecret,
    },
    voting: {
      count: userVotes.length,
      votes: userVotes.map(vote => ({
        pollId: vote.pollId,
        optionId: vote.optionId,
        votedAt: vote.votedAt,
      })),
    },
    polls: {
      count: userPolls.length,
      polls: userPolls.map(poll => ({
        id: poll.id,
        question: poll.question,
        createdAt: poll.createdAt,
        totalVotes: (poll.options || []).reduce((sum, opt) => sum + (opt.votes || 0), 0),
      })),
    },
    exportedAt: new Date().toISOString(),
  };
};

/**
 * GDPR COMPLIANCE HELPERS
 */

/**
 * Get all user data (for GDPR data subject access request)
 * @param {Object} user - User object
 * @param {Array} userVotes - User votes
 * @param {Array} userPolls - User polls
 * @param {Array} loginHistory - User login history
 * @returns {Object} Complete user data
 */
export const getUserDataForGDPR = (user, userVotes = [], userPolls = [], loginHistory = []) => {
  return {
    requestedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified || false,
      twoFactorEnabled: !!user.twoFactorSecret,
    },
    votingData: {
      totalVotes: userVotes.length,
      votes: userVotes,
    },
    createdPolls: {
      totalPolls: userPolls.length,
      polls: userPolls,
    },
    loginHistory: {
      totalLogins: loginHistory.length,
      recentLogins: loginHistory.slice(-10),
    },
  };
};

/**
 * Check if user has consented to terms (for legal compliance)
 * @param {Object} user - User object
 * @returns {boolean} True if user has consented
 */
export const hasUserConsented = (user) => {
  return user && user.termsConsentedAt && user.privacyConsentedAt;
};

/**
 * Record user consent
 * @returns {Object} Consent record
 */
export const recordUserConsent = () => {
  return {
    termsConsentedAt: new Date().toISOString(),
    privacyConsentedAt: new Date().toISOString(),
    termsVersion: '1.0.0',
    privacyVersion: '1.0.0',
    ipAddress: 'client-ip', // Should be captured server-side
  };
};

export default {
  generateVerificationToken,
  generate2FASecret,
  generateTOTPCode,
  rateLimiters,
  SESSION_CONFIG,
  createSession,
  updateSessionActivity,
  isSessionValid,
  isSessionWarning,
  getSessionTimeRemaining,
  createDeletionRequest,
  anonymizeUserData,
  prepareUserDataExport,
  getUserDataForGDPR,
  hasUserConsented,
  recordUserConsent,
};
