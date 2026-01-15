import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePollQuestion,
  validatePollOptions,
  validateDeadline,
  validateLoginForm,
  validateRegistrationForm,
} from '../validation.js';

describe('Validation Utilities', () => {
  describe('validateUsername', () => {
    it('returns error for empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('returns error for username too short', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('returns error for invalid characters', () => {
      const result = validateUsername('user@name');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letters, numbers');
    });

    it('returns valid for correct username', () => {
      const result = validateUsername('test_user123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
    });

    it('returns error for invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
    });

    it('returns valid for correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
    });

    it('returns error for password too short', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
    });

    it('returns valid for correct password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePollQuestion', () => {
    it('returns error for empty question', () => {
      const result = validatePollQuestion('');
      expect(result.isValid).toBe(false);
    });

    it('returns error for question too short', () => {
      const result = validatePollQuestion('Test');
      expect(result.isValid).toBe(false);
    });

    it('returns valid for correct question', () => {
      const result = validatePollQuestion('What is your favorite color?');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePollOptions', () => {
    it('returns error for too few options', () => {
      const result = validatePollOptions(['Option 1']);
      expect(result.isValid).toBe(false);
    });

    it('returns error for duplicate options', () => {
      const result = validatePollOptions(['Option 1', 'Option 1']);
      expect(result.isValid).toBe(false);
    });

    it('returns valid for correct options', () => {
      const result = validatePollOptions(['Option 1', 'Option 2', 'Option 3']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDeadline', () => {
    it('returns error for past date', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const result = validateDeadline(pastDate);
      expect(result.isValid).toBe(false);
    });

    it('returns valid for future date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const result = validateDeadline(futureDate);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateLoginForm', () => {
    it('returns errors for empty form', () => {
      const result = validateLoginForm({ username: '', password: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    it('returns valid for correct form data', () => {
      const result = validateLoginForm({ username: 'testuser', password: 'password123' });
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRegistrationForm', () => {
    it('returns errors for invalid form data', () => {
      const result = validateRegistrationForm({
        username: 'ab',
        email: 'invalid',
        password: '123',
        name: '',
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('returns valid for correct form data', () => {
      const result = validateRegistrationForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(result.isValid).toBe(true);
    });
  });
});

