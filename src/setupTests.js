/**
 * Test Setup File
 * 
 * Configures testing environment with custom matchers and global test utilities.
 * This file runs before all tests.
 */
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
