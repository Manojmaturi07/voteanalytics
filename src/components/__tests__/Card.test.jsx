import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card.jsx';

describe('Card Component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('has default role of region', () => {
    render(<Card>Content</Card>);
    const card = screen.getByRole('region');
    expect(card).toBeInTheDocument();
  });

  it('allows custom role', () => {
    render(<Card role="article">Content</Card>);
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });
});

