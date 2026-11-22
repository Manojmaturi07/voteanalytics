import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App.jsx';

/**
 * App Component Tests
 * 
 * Basic smoke tests to ensure the app renders without crashing.
 */
describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // App should render without throwing
    expect(document.body).toBeTruthy();
  });
});
