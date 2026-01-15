import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserPolls from '../UserPolls.jsx';
import { pollsAPI, authAPI } from '../../services/api.js';

// Mock the API
vi.mock('../../services/api.js', () => ({
  pollsAPI: {
    getAllPolls: vi.fn(),
  },
  authAPI: {
    isUser: vi.fn(() => true),
    getCurrentUser: vi.fn(() => ({ id: '1', username: 'testuser' })),
  },
}));

// Mock Navbar
vi.mock('../../components/Navbar.jsx', () => ({
  default: () => <nav>Navbar</nav>,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserPolls Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    pollsAPI.getAllPolls.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    );

    renderWithRouter(<UserPolls />);
    
    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state when no polls', async () => {
    pollsAPI.getAllPolls.mockResolvedValue({ data: [] });

    renderWithRouter(<UserPolls />);
    
    await waitFor(() => {
      expect(screen.getByText(/no polls available/i)).toBeInTheDocument();
    });
  });

  it('renders polls list when polls exist', async () => {
    const mockPolls = [
      {
        id: '1',
        question: 'Test Poll Question?',
        options: [
          { id: '1', text: 'Option 1', votes: 5 },
          { id: '2', text: 'Option 2', votes: 3 },
        ],
        deadline: new Date(Date.now() + 86400000).toISOString(),
        isLocked: false,
      },
    ];

    pollsAPI.getAllPolls.mockResolvedValue({ data: mockPolls });

    renderWithRouter(<UserPolls />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Poll Question?')).toBeInTheDocument();
    });
  });
});

