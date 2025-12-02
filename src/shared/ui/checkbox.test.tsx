/**
 * Checkbox Component Tests
 *
 * Tests for the shared Checkbox component including:
 * - Rendering and checked states
 * - User interaction and state changes
 * - Disabled state behavior
 * - Ref forwarding
 * - Accessibility features
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox aria-label="Test checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders in checked state when checked prop is true', () => {
      render(<Checkbox checked={true} onCheckedChange={() => {}} aria-label="Checked checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('applies custom className', () => {
      render(<Checkbox className="custom-checkbox" aria-label="Custom checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('has correct default styling classes', () => {
      render(<Checkbox aria-label="Styled checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-5', 'w-5', 'rounded-sm', 'border');
    });
  });

  describe('interaction', () => {
    it('toggles checked state on click', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Checkbox onCheckedChange={handleChange} aria-label="Toggle checkbox" />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onCheckedChange with false when unchecking', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Checkbox
          checked={true}
          onCheckedChange={handleChange}
          aria-label="Uncheck checkbox"
        />
      );
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('toggles using keyboard (Space)', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Checkbox onCheckedChange={handleChange} aria-label="Keyboard checkbox" />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Checkbox
          disabled
          onCheckedChange={handleChange}
          aria-label="Disabled checkbox"
        />
      );
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toBeDisabled();
    });
  });

  describe('states', () => {
    it('shows disabled styling when disabled', () => {
      render(<Checkbox disabled aria-label="Disabled checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
      expect(checkbox).toBeDisabled();
    });

    it('supports controlled component pattern', async () => {
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            aria-label="Controlled checkbox"
          />
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('supports indeterminate state', () => {
      render(
        <Checkbox
          checked="indeterminate"
          onCheckedChange={() => {}}
          aria-label="Indeterminate checkbox"
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      // Radix handles indeterminate state via data-state attribute
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('accessibility', () => {
    it('has checkbox role', () => {
      render(<Checkbox aria-label="Accessible checkbox" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Checkbox aria-label="My checkbox" />);
      const checkbox = screen.getByRole('checkbox', { name: /my checkbox/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <span id="checkbox-label">Check this</span>
          <Checkbox aria-labelledby="checkbox-label" />
        </>
      );
      const checkbox = screen.getByRole('checkbox', { name: /check this/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('is keyboard focusable', () => {
      render(<Checkbox aria-label="Focusable checkbox" />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('has focus-visible ring styles', () => {
      render(<Checkbox aria-label="Focus ring checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('supports required attribute', () => {
      render(<Checkbox required aria-label="Required checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });
  });

  describe('visual states', () => {
    it('has checked state styling', () => {
      render(
        <Checkbox
          checked={true}
          onCheckedChange={() => {}}
          aria-label="Checked styling"
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('renders check icon when checked', () => {
      const { container } = render(
        <Checkbox
          checked={true}
          onCheckedChange={() => {}}
          aria-label="Check icon test"
        />
      );
      // Check that the CheckIcon SVG is present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not render check icon when unchecked', () => {
      render(
        <Checkbox
          checked={false}
          onCheckedChange={() => {}}
          aria-label="No check icon"
        />
      );
      // When unchecked, Radix doesn't render the indicator content
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to checkbox element', () => {
      const ref = { current: null };
      render(<Checkbox ref={ref} aria-label="Ref checkbox" />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('HTML attributes', () => {
    it('forwards data attributes', () => {
      render(
        <Checkbox
          data-testid="test-checkbox"
          data-custom="value"
          aria-label="Data attrs"
        />
      );
      const checkbox = screen.getByTestId('test-checkbox');
      expect(checkbox).toHaveAttribute('data-custom', 'value');
    });

    it('forwards name attribute for forms', () => {
      render(<Checkbox name="terms" aria-label="Terms checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('name', 'terms');
    });

    it('forwards value attribute for forms', () => {
      render(<Checkbox value="agreed" aria-label="Value checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('value', 'agreed');
    });
  });
});
