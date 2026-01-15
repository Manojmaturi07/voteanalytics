import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

/**
 * App Component Tests
 * 
 * Basic smoke tests to ensure the app renders without crashing.
 */
describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // App should render without throwing
    expect(document.body).toBeTruthy();
  });
});
