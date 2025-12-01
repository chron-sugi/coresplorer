import { render, screen } from '@testing-library/react';
import { DiagramSearch } from './DiagramSearch';
import { describe, it, expect, vi } from 'vitest';

describe('DiagramSearch', () => {
  const defaultProps = {
    isOpen: true,
    query: '',
    matchesCount: 0,
    currentIndex: null,
    onChangeQuery: vi.fn(),
    onClose: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    suggestions: [],
    onSelectSuggestion: vi.fn(),
  };

  it('renders when isOpen is true', () => {
    render(<DiagramSearch {...defaultProps} />);
    expect(screen.getByPlaceholderText('Find in diagram...')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<DiagramSearch {...defaultProps} isOpen={false} />);
    expect(screen.queryByPlaceholderText('Find in diagram...')).not.toBeInTheDocument();
  });
});
