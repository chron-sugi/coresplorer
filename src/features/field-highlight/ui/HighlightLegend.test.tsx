/**
 * HighlightLegend Component Tests
 *
 * Tests for the HighlightLegend component.
 *
 * @module features/field-highlight/ui/HighlightLegend.test
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HighlightLegend } from './HighlightLegend';

describe('HighlightLegend', () => {
  const defaultProps = {
    fieldName: 'test_field',
    isLocked: false,
    onClear: vi.fn(),
    onToggleLock: vi.fn(),
  };

  describe('card variant (default)', () => {
    it('renders field name', () => {
      render(<HighlightLegend {...defaultProps} />);

      expect(screen.getByText('test_field')).toBeInTheDocument();
    });

    it('displays "Selected:" label', () => {
      render(<HighlightLegend {...defaultProps} />);

      expect(screen.getByText('Selected:')).toBeInTheDocument();
    });

    it('shows unlock icon when not locked', () => {
      render(<HighlightLegend {...defaultProps} isLocked={false} />);

      const lockButton = screen.getByTitle(/unlock selection/i);
      expect(lockButton).toBeInTheDocument();
    });

    it('shows lock icon when locked', () => {
      render(<HighlightLegend {...defaultProps} isLocked={true} />);

      const lockButton = screen.getByTitle(/lock selection/i);
      expect(lockButton).toBeInTheDocument();
    });

    it('calls onToggleLock when lock button clicked', () => {
      const onToggleLock = vi.fn();
      render(<HighlightLegend {...defaultProps} onToggleLock={onToggleLock} />);

      const lockButton = screen.getByTitle(/unlock selection/i);
      fireEvent.click(lockButton);

      expect(onToggleLock).toHaveBeenCalled();
    });

    it('calls onClear when clear button clicked', () => {
      const onClear = vi.fn();
      render(<HighlightLegend {...defaultProps} onClear={onClear} />);

      const clearButton = screen.getByTitle(/clear selection/i);
      fireEvent.click(clearButton);

      expect(onClear).toHaveBeenCalled();
    });

    it('renders all legend items', () => {
      render(<HighlightLegend {...defaultProps} />);

      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
      expect(screen.getByText('Used')).toBeInTheDocument();
      expect(screen.getByText('Dropped')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <HighlightLegend {...defaultProps} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('has data-testid for testing', () => {
      render(<HighlightLegend {...defaultProps} />);

      expect(screen.getByTestId('highlight-legend')).toBeInTheDocument();
    });
  });

  describe('bar variant', () => {
    it('renders in bar layout', () => {
      render(<HighlightLegend {...defaultProps} variant="bar" />);

      expect(screen.getByText('test_field')).toBeInTheDocument();
      expect(screen.getByText('SELECTED:')).toBeInTheDocument();
    });

    it('renders legend items in bar variant', () => {
      render(<HighlightLegend {...defaultProps} variant="bar" />);

      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
      expect(screen.getByText('Used')).toBeInTheDocument();
      expect(screen.getByText('Dropped')).toBeInTheDocument();
    });

    it('shows lock/unlock button in bar variant', () => {
      render(<HighlightLegend {...defaultProps} variant="bar" isLocked={false} />);

      const lockButton = screen.getByTitle(/unlock selection/i);
      expect(lockButton).toBeInTheDocument();
    });

    it('calls callbacks in bar variant', () => {
      const onClear = vi.fn();
      const onToggleLock = vi.fn();

      render(
        <HighlightLegend
          {...defaultProps}
          variant="bar"
          onClear={onClear}
          onToggleLock={onToggleLock}
        />
      );

      fireEvent.click(screen.getByTitle(/clear selection/i));
      fireEvent.click(screen.getByTitle(/unlock selection/i));

      expect(onClear).toHaveBeenCalled();
      expect(onToggleLock).toHaveBeenCalled();
    });

    it('does not have data-testid in bar variant', () => {
      render(<HighlightLegend {...defaultProps} variant="bar" />);

      expect(screen.queryByTestId('highlight-legend')).not.toBeInTheDocument();
    });
  });

  describe('lock button behavior', () => {
    it('shows correct title for unlocked state', () => {
      render(<HighlightLegend {...defaultProps} isLocked={false} />);

      expect(screen.getByTitle('Lock selection')).toBeInTheDocument();
    });

    it('shows correct title for locked state', () => {
      render(<HighlightLegend {...defaultProps} isLocked={true} />);

      expect(screen.getByTitle('Unlock selection')).toBeInTheDocument();
    });
  });

  describe('legend color indicators', () => {
    it('renders underline indicators for all event types', () => {
      const { container } = render(<HighlightLegend {...defaultProps} />);

      // Should have 4 underline indicators (one for each legend item)
      const indicators = container.querySelectorAll('.relative.inline-block');
      expect(indicators.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('field name display', () => {
    it('renders field name in monospace font', () => {
      render(<HighlightLegend {...defaultProps} fieldName="my_custom_field" />);

      const fieldElement = screen.getByText('my_custom_field');
      expect(fieldElement.className).toContain('font-mono');
    });

    it('handles long field names', () => {
      const longName = 'very_long_field_name_that_might_need_truncation';
      render(<HighlightLegend {...defaultProps} fieldName={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });
});
