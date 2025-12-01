import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { SplExpandedView } from './SplExpandedView';

describe('SplExpandedView', () => {
  it('renders code when open and uses default title', () => {
    render(<SplExpandedView isOpen onClose={() => {}} code="index=main" />);

    expect(screen.getByText('SPL Query')).toBeInTheDocument();
    expect(screen.getByText('index=main')).toBeInTheDocument();
  });

  it('calls onClose when dialog is closed via button', () => {
    const onClose = vi.fn();
    render(<SplExpandedView isOpen onClose={onClose} code="search" title="Custom Title" />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
