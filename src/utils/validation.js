/**
 * Form Validation Utilities
 * 
 * Client-side validation functions for forms throughout the application.
 * Provides consistent validation rules and error messages.
 */

/**
 * Validates a username
 * 
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  // Allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates an email address
 * 
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (trimmed.length > 255) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a password
 * 
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 6)
 * @param {boolean} options.requireComplexity - Require complexity (default: false)
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePassword = (password, options = {}) => {
  const { minLength = 6, requireComplexity = false } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }

  if (requireComplexity) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validates a poll question
 * 
 * @param {string} question - Poll question to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePollQuestion = (question) => {
  if (!question || !question.trim()) {
    return { isValid: false, error: 'Poll question is required' };
  }

  const trimmed = question.trim();

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Poll question must be at least 5 characters long' };
  }

  if (trimmed.length > 500) {
    return { isValid: false, error: 'Poll question must be less than 500 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates poll options
 * 
 * @param {Array<string>} options - Array of option strings
 * @param {Object} options - Validation options
 * @param {number} minOptions - Minimum number of options (default: 2)
 * @param {number} maxOptions - Maximum number of options (default: 10)
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePollOptions = (options, { minOptions = 2, maxOptions = 10 } = {}) => {
  if (!Array.isArray(options)) {
    return { isValid: false, error: 'Options must be an array' };
  }

  if (options.length < minOptions) {
    return { isValid: false, error: `At least ${minOptions} options are required` };
  }

  if (options.length > maxOptions) {
    return { isValid: false, error: `Maximum ${maxOptions} options allowed` };
  }

  // Check for empty options
  const emptyOptions = options.filter(opt => !opt || !opt.trim());
  if (emptyOptions.length > 0) {
    return { isValid: false, error: 'All options must have text' };
  }

  // Check for duplicate options
  const trimmedOptions = options.map(opt => opt.trim().toLowerCase());
  const uniqueOptions = new Set(trimmedOptions);
  if (uniqueOptions.size !== trimmedOptions.length) {
    return { isValid: false, error: 'Options must be unique' };
  }

  // Check option length
  for (let i = 0; i < options.length; i++) {
    const trimmed = options[i].trim();
    if (trimmed.length < 1) {
      return { isValid: false, error: `Option ${i + 1} cannot be empty` };
    }
    if (trimmed.length > 200) {
      return { isValid: false, error: `Option ${i + 1} must be less than 200 characters` };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validates a deadline date
 * 
 * @param {string|Date} deadline - Deadline date to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateDeadline = (deadline) => {
  if (!deadline) {
    return { isValid: false, error: 'Deadline is required' };
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (isNaN(deadlineDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (deadlineDate <= now) {
    return { isValid: false, error: 'Deadline must be in the future' };
  }

  // Check if deadline is too far in the future (optional, e.g., 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (deadlineDate > oneYearFromNow) {
    return { isValid: false, error: 'Deadline cannot be more than 1 year in the future' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a name field
 * 
 * @param {string} name - Name to validate
 * @param {boolean} required - Whether name is required (default: true)
 * @returns {Object} Validation result with isValid and error message
 */
export const validateName = (name, required = true) => {
  if (!name || !name.trim()) {
    if (required) {
      return { isValid: false, error: 'Name is required' };
    }
    return { isValid: true, error: null };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates login form data
 * 
 * @param {Object} formData - Form data with username and password
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;

  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
    isValid = false;
  }

  if (!formData.password || !formData.password.trim()) {
    errors.password = 'Password is required';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validates registration form data
 * 
 * @param {Object} formData - Form data with username, email, password, name
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  let isValid = true;

  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
    isValid = false;
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  const nameValidation = validateName(formData.name, true);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validates poll creation/editing form data
 * 
 * @param {Object} formData - Form data with question, options, deadline
 * @returns {Object} Validation result with isValid and errors object
 */
export const validatePollForm = (formData) => {
  const errors = {};
  let isValid = true;

  const questionValidation = validatePollQuestion(formData.question);
  if (!questionValidation.isValid) {
    errors.question = questionValidation.error;
    isValid = false;
  }

  const optionsValidation = validatePollOptions(formData.options);
  if (!optionsValidation.isValid) {
    errors.options = optionsValidation.error;
    isValid = false;
  }

  const deadlineValidation = validateDeadline(formData.deadline);
  if (!deadlineValidation.isValid) {
    errors.deadline = deadlineValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

