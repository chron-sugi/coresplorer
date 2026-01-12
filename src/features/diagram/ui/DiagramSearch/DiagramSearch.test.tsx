import { render, screen, fireEvent } from '@testing-library/react';
import { DiagramSearch } from './DiagramSearch';
import { describe, it, expect, vi } from 'vitest';

describe('DiagramSearch', () => {
  const defaultProps = {
    isOpen: true,
    query: '',
    suggestions: [],
    onChangeQuery: vi.fn(),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onSelectSuggestion: vi.fn(),
  };

  it('renders search input when isOpen is true', () => {
    render(<DiagramSearch {...defaultProps} />);
    expect(screen.getByPlaceholderText('Find in diagram...')).toBeInTheDocument();
  });

  it('renders search button when isOpen is false', () => {
    render(<DiagramSearch {...defaultProps} isOpen={false} />);
    expect(screen.queryByPlaceholderText('Find in diagram...')).not.toBeInTheDocument();
    expect(screen.getByTitle('Search diagram (Ctrl+K)')).toBeInTheDocument();
  });

  it('calls onOpen when search button is clicked', () => {
    render(<DiagramSearch {...defaultProps} isOpen={false} />);
    const button = screen.getByTitle('Search diagram (Ctrl+K)');
    fireEvent.click(button);
    expect(defaultProps.onOpen).toHaveBeenCalled();
  });
});
